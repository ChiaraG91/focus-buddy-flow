import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    logStep("ERROR", { message: "Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET" });
    return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature" }), { status: 400, headers: corsHeaders });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    logStep("Signature verification failed", { message: msg });
    return new Response(JSON.stringify({ error: `Webhook signature: ${msg}` }), { status: 400, headers: corsHeaders });
  }

  logStep("Event received", { type: event.type, id: event.id });

  // Helper: log billing event
  async function logBilling(userId: string | null, eventType: string, payload: any) {
    try {
      await supabase.from("billing_logs").insert({ user_id: userId, event_type: eventType, payload });
    } catch (e) {
      logStep("billing_logs insert error", e);
    }
  }

  // Helper: find user by Stripe customer email
  async function findUserByCustomerEmail(customerId: string): Promise<string | null> {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted || !("email" in customer) || !customer.email) return null;
    const { data } = await supabase.from("user_profiles").select("id").eq("email", customer.email).single();
    return data?.id || null;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id || (session.customer ? await findUserByCustomerEmail(session.customer as string) : null);
        
        if (!userId) { logStep("No user found for checkout"); break; }

        const planType = session.metadata?.plan_type;
        const updateData: any = {
          stripe_customer_id: session.customer,
          subscription_tier: "pro",
          updated_at: new Date().toISOString(),
        };

        if (planType === "yearly" && session.subscription) {
          updateData.stripe_subscription_id = session.subscription;
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          updateData.subscription_end = new Date(sub.current_period_end * 1000).toISOString();

          // Upsert subscriptions table
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_subscription_id: session.subscription as string,
            status: "active",
            current_period_end: updateData.subscription_end,
          }, { onConflict: "user_id,stripe_subscription_id" });
        }

        await supabase.from("user_profiles").update(updateData).eq("id", userId);
        await logBilling(userId, "checkout.session.completed", { plan_type: planType, session_id: session.id });
        logStep("Checkout completed", { userId, planType });
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.customer || !invoice.subscription) break;
        const userId = await findUserByCustomerEmail(invoice.customer as string);
        if (!userId) break;

        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const end = new Date(sub.current_period_end * 1000).toISOString();
        await supabase.from("user_profiles").update({
          subscription_tier: "pro",
          subscription_end: end,
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: invoice.subscription as string,
          status: "active",
          current_period_end: end,
        }, { onConflict: "user_id,stripe_subscription_id" });

        await logBilling(userId, "invoice.paid", { invoice_id: invoice.id });
        logStep("Invoice paid", { userId });
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await findUserByCustomerEmail(sub.customer as string);
        if (!userId) break;

        const end = new Date(sub.current_period_end * 1000).toISOString();
        const tier = sub.status === "active" ? "pro" : "free";

        await supabase.from("user_profiles").update({
          subscription_tier: tier,
          subscription_end: tier === "pro" ? end : null,
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: sub.id,
          status: sub.status,
          current_period_end: end,
        }, { onConflict: "user_id,stripe_subscription_id" });

        await logBilling(userId, "customer.subscription.updated", { status: sub.status });
        logStep("Subscription updated", { userId, status: sub.status });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = await findUserByCustomerEmail(sub.customer as string);
        if (!userId) break;

        await supabase.from("user_profiles").update({
          subscription_tier: "free",
          subscription_end: null,
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        }).eq("id", userId);

        await supabase.from("subscriptions").update({ status: "canceled" })
          .eq("stripe_subscription_id", sub.id);

        await logBilling(userId, "customer.subscription.deleted", { subscription_id: sub.id });
        logStep("Subscription deleted — downgraded to free", { userId });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const userId = charge.customer ? await findUserByCustomerEmail(charge.customer as string) : null;

        if (userId) {
          // Check if this was a lifetime purchase refund
          if (charge.metadata?.plan_type === "lifetime" || !charge.invoice) {
            await supabase.from("user_profiles").update({
              subscription_tier: "free",
              subscription_end: null,
              updated_at: new Date().toISOString(),
            }).eq("id", userId);
            logStep("Lifetime refund — downgraded", { userId });
          }
          await logBilling(userId, "charge.refunded", { charge_id: charge.id, amount: charge.amount_refunded });
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown";
    logStep("Handler error", { type: event.type, message: msg });
    // Still return 200 to prevent Stripe retries on processing errors
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});

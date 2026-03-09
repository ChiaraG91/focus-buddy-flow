import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CHECK-SUBSCRIPTION] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) throw new Error("User not authenticated");
    const user = userData.user;
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check for active subscription
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    if (customers.data.length === 0) {
      logStep("No Stripe customer found");
      return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Customer found", { customerId });

    // Check active subscriptions (yearly)
    const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: "active", limit: 1 });
    if (subscriptions.data.length > 0) {
      const sub = subscriptions.data[0];
      const subscriptionEnd = new Date(sub.current_period_end * 1000).toISOString();
      logStep("Active subscription", { subscriptionId: sub.id, end: subscriptionEnd });

      // Update DB
      await supabaseClient.from("user_profiles").update({
        subscription_tier: "pro",
        subscription_end: subscriptionEnd,
        stripe_customer_id: customerId,
        stripe_subscription_id: sub.id,
      }).eq("id", user.id);

      return new Response(JSON.stringify({
        subscribed: true,
        tier: "pro",
        plan_type: "yearly",
        subscription_end: subscriptionEnd,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Check for lifetime purchase via completed checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 100,
    });
    const lifetimePurchase = sessions.data.find(
      (s) => s.payment_status === "paid" && s.metadata?.plan_type === "lifetime"
    );

    if (lifetimePurchase) {
      logStep("Lifetime purchase found");
      await supabaseClient.from("user_profiles").update({
        subscription_tier: "pro",
        subscription_end: null,
        stripe_customer_id: customerId,
      }).eq("id", user.id);

      return new Response(JSON.stringify({
        subscribed: true,
        tier: "pro",
        plan_type: "lifetime",
        subscription_end: null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // No active subscription → ensure downgrade
    logStep("No active subscription — downgrading to free");
    await supabaseClient.from("user_profiles").update({
      subscription_tier: "free",
      subscription_end: null,
    }).eq("id", user.id);

    return new Response(JSON.stringify({ subscribed: false, tier: "free" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

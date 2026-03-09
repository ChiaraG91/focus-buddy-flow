import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { STRIPE_PLANS, PlanType } from "@/lib/stripe";
import AppLayout from "@/components/AppLayout";

const features = [
  "Sessioni illimitate",
  "Dashboard avanzata",
  "Template personalizzati",
  "Reminder Telegram premium",
  "Report settimanali",
  "Supporto prioritario",
];

export default function UpgradePage() {
  const [loadingPlan, setLoadingPlan] = useState<PlanType | null>(null);
  const { session } = useAuth();
  const { subscribed, tier, planType } = useSubscription();
  const { toast } = useToast();

  const handleCheckout = async (plan: PlanType) => {
    if (!session?.access_token) {
      toast({ title: "Errore", description: "Devi essere autenticato", variant: "destructive" });
      return;
    }

    setLoadingPlan(plan);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan_type: plan },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error || !data?.url) {
        throw new Error(error?.message || data?.error || "Errore creazione checkout");
      }

      window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  if (subscribed) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto text-center animate-fade-in py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Sei già Premium!</h1>
          <p className="text-muted-foreground mb-2">
            Piano: <strong>{planType === "lifetime" ? "A Vita" : "Annuale"}</strong>
          </p>
          <Badge variant="default" className="text-sm">PRO</Badge>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-4">
            <Star className="h-3.5 w-3.5 text-accent" />
            Sblocca tutto il potenziale
          </div>
          <h1 className="font-display text-3xl font-bold mb-3">Passa a Premium</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sessioni illimitate, dashboard avanzata e molto altro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Yearly */}
          <Card className="relative border-2 border-primary">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">Più popolare</Badge>
            </div>
            <CardHeader className="text-center pt-8">
              <CardTitle className="font-display text-xl">{STRIPE_PLANS.yearly.name}</CardTitle>
              <CardDescription>Rinnovo automatico annuale</CardDescription>
              <div className="mt-4">
                <span className="font-display text-4xl font-bold">€29,99</span>
                <span className="text-muted-foreground">/anno</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full gap-2" onClick={() => handleCheckout("yearly")} disabled={!!loadingPlan}>
                {loadingPlan === "yearly" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Abbonati ora
              </Button>
            </CardContent>
          </Card>

          {/* Lifetime */}
          <Card>
            <CardHeader className="text-center pt-8">
              <CardTitle className="font-display text-xl">{STRIPE_PLANS.lifetime.name}</CardTitle>
              <CardDescription>Pagamento unico, accesso per sempre</CardDescription>
              <div className="mt-4">
                <span className="font-display text-4xl font-bold">€69,99</span>
                <span className="text-muted-foreground"> una tantum</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
                <li className="flex items-center gap-2 text-sm font-medium">
                  <Crown className="h-4 w-4 text-accent flex-shrink-0" />
                  Accesso a vita
                </li>
              </ul>
              <Button variant="outline" className="w-full gap-2" onClick={() => handleCheckout("lifetime")} disabled={!!loadingPlan}>
                {loadingPlan === "lifetime" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
                Acquista a vita
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

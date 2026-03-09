import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getUserProfile, updateUserProfile } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { User, Crown, Settings, Loader2 } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function ProfilePage() {
  const { user, session } = useAuth();
  const { subscribed, tier, planType, subscriptionEnd } = useSubscription();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getUserProfile().then((profile) => {
      setName(profile.name);
      setEmail(profile.email || user?.email || "");
      setTelegramId(profile.telegramId || "");
    });
  }, [user]);

  const handleSave = async () => {
    await updateUserProfile({ name, email, telegramId });
    toast({ title: "Profilo aggiornato!" });
  };

  const handleManageSubscription = async () => {
    if (!session?.access_token) return;
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error || !data?.url) throw new Error(data?.error || "Errore");
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto animate-fade-in">
        <h1 className="font-display text-2xl font-bold mb-6">Profilo</h1>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display">{name || user?.email}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Telegram ID</Label>
              <Input placeholder="@username" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} />
            </div>
            <Button onClick={handleSave} className="w-full">Salva modifiche</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-semibold">Abbonamento</p>
                <p className="text-sm text-muted-foreground">Piano attuale</p>
              </div>
              <Badge variant={subscribed ? "default" : "secondary"} className="text-sm capitalize">
                {tier}
              </Badge>
            </div>

            {subscribed && (
              <div className="text-sm text-muted-foreground mb-4 space-y-1">
                <p>Piano: <strong>{planType === "lifetime" ? "A Vita" : "Annuale"}</strong></p>
                {subscriptionEnd && (
                  <p>Scadenza: <strong>{new Date(subscriptionEnd).toLocaleDateString("it-IT")}</strong></p>
                )}
              </div>
            )}

            <Separator className="mb-4" />

            {subscribed ? (
              <Button variant="outline" className="w-full gap-2" onClick={handleManageSubscription} disabled={portalLoading}>
                {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                Gestisci abbonamento
              </Button>
            ) : (
              <Link to="/upgrade">
                <Button variant="outline" className="w-full gap-2">
                  <Crown className="h-4 w-4 text-accent" />
                  Upgrade a Pro
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

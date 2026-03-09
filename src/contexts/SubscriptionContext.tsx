import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";

interface SubscriptionState {
  subscribed: boolean;
  tier: "free" | "pro";
  planType: "yearly" | "lifetime" | null;
  subscriptionEnd: string | null;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { session, user } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [tier, setTier] = useState<"free" | "pro">("free");
  const [planType, setPlanType] = useState<"yearly" | "lifetime" | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setSubscribed(false);
      setTier("free");
      setPlanType(null);
      setSubscriptionEnd(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!error && data) {
        setSubscribed(data.subscribed ?? false);
        setTier(data.tier ?? "free");
        setPlanType(data.plan_type ?? null);
        setSubscriptionEnd(data.subscription_end ?? null);
      }
    } catch (e) {
      console.error("[Subscription] check failed", e);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  // Periodic refresh every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSubscription, 60_000);
    return () => clearInterval(interval);
  }, [user, refreshSubscription]);

  return (
    <SubscriptionContext.Provider value={{ subscribed, tier, planType, subscriptionEnd, loading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// DEV MODE: set to false to re-enable real Supabase auth
const DEV_MODE = true;

const mockUser = {
  id: "dev-user",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: { name: "Test User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as unknown as User;

const mockSession = {
  access_token: "dev-token",
  refresh_token: "dev-refresh",
  user: mockUser,
  expires_in: 999999,
  token_type: "bearer",
} as unknown as Session;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(DEV_MODE ? mockSession : null);
  const [loading, setLoading] = useState(!DEV_MODE);

  useEffect(() => {
    if (DEV_MODE) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = async (email: string) => {
    if (DEV_MODE) return { error: null };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    if (DEV_MODE) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signInWithMagicLink, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

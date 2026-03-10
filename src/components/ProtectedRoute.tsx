import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

// DEV MODE: always allow access
const DEV_MODE = true;

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (DEV_MODE) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse font-display text-muted-foreground">Caricamento...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap, Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithMagicLink } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithMagicLink(email);
    setLoading(false);

    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
      return;
    }

    setSent(true);
    toast({ title: "Magic Link inviato!", description: "Controlla la tua email" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 justify-center mb-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-xl">Focus Buddy</span>
          </Link>
          <CardTitle className="font-display text-2xl">Accedi</CardTitle>
          <CardDescription>Inserisci la tua email per ricevere un Magic Link</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-display text-lg font-semibold">Controlla la tua email!</h3>
              <p className="text-sm text-muted-foreground">
                Abbiamo inviato un link di accesso a <strong>{email}</strong>.
                Clicca il link per accedere.
              </p>
              <Button variant="ghost" onClick={() => setSent(false)} className="mt-2">
                Usa un'altra email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <Mail className="h-4 w-4" />
                {loading ? "Invio in corso..." : "Invia Magic Link"}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Non hai un account?{" "}
            <Link to="/signup" className="text-primary hover:underline">Registrati</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { saveSessionLog } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Play, Pause, RotateCcw, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function SessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const goal = (location.state as any)?.goal || "Focus session";
  const duration = (location.state as any)?.duration || 25;

  const totalSeconds = duration * 60;
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = ((totalSeconds - remaining) / totalSeconds) * 100;

  const handleCheckout = async (status: "fatto" | "bloccato" | "next-action") => {
    await saveSessionLog("mock-session-id", status, []);
    toast({ title: "Sessione registrata!", description: `Stato: ${status}` });
    navigate("/dashboard");
  };

  const reset = () => {
    setRemaining(totalSeconds);
    setRunning(false);
    setFinished(false);
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto text-center animate-fade-in">
        <p className="text-sm text-muted-foreground mb-2">Focus su:</p>
        <h1 className="font-display text-xl font-bold mb-8">{goal}</h1>

        {/* Timer Ring */}
        <div className="relative mx-auto mb-8 w-56 h-56">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="88" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <circle
              cx="100" cy="100" r="88" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 88}
              strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-4xl font-bold tabular-nums">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
            <span className="text-xs text-muted-foreground mt-1">{duration} min</span>
          </div>
        </div>

        {!finished ? (
          <div className="flex gap-3 justify-center mb-8">
            <Button size="lg" onClick={() => setRunning(!running)} className="gap-2 px-8">
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pausa" : "Avvia"}
            </Button>
            <Button size="lg" variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="py-6">
              <h2 className="font-display text-lg font-semibold mb-4">Check-out obbligatorio</h2>
              <p className="text-sm text-muted-foreground mb-4">Come è andata la sessione?</p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleCheckout("fatto")} className="gap-2 bg-success hover:bg-success/90 text-success-foreground">
                  <CheckCircle className="h-4 w-4" /> Fatto
                </Button>
                <Button onClick={() => handleCheckout("bloccato")} variant="outline" className="gap-2 border-blocked text-blocked hover:bg-blocked/10">
                  <AlertCircle className="h-4 w-4" /> Bloccato
                </Button>
                <Button onClick={() => handleCheckout("next-action")} variant="outline" className="gap-2 border-warning text-warning hover:bg-warning/10">
                  <ArrowRight className="h-4 w-4" /> Next Action
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

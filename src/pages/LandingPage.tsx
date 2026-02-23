import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, BarChart3, Zap, Timer, ArrowRight } from "lucide-react";

const valueProps = [
  { icon: Timer, label: "Sessioni micro", desc: "25 o 50 minuti di focus puro" },
  { icon: Zap, label: "Reminder Telegram", desc: "Non dimenticare mai una sessione" },
  { icon: BarChart3, label: "Dashboard chiara", desc: "Monitora i tuoi progressi" },
];

const features = [
  { icon: Clock, label: "Timer 25/50 min", desc: "Scegli la durata perfetta per il tuo task" },
  { icon: CheckCircle, label: "Check-out rapido", desc: "Registra il risultato in un tap" },
  { icon: BarChart3, label: "Dashboard settimanale", desc: "Visualizza trend e blocchi" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="container flex h-16 items-center justify-between">
        <span className="flex items-center gap-2 font-display font-bold text-xl">
          <Zap className="h-6 w-6 text-primary" />
          Focus Buddy
        </span>
        <div className="flex gap-2">
          <Link to="/signup">
            <Button variant="ghost" size="sm">Accedi</Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">Inizia ora</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container py-20 md:py-32 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Zap className="h-3.5 w-3.5 text-accent" />
          Produttività semplificata
        </div>
        <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
          Aumenta il tuo focus,{" "}
          <span className="text-gradient-primary">completa più task</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
          Sessioni di lavoro strutturate, check-out rapidi e una dashboard per tracciare i tuoi progressi. Tutto in un'app semplice.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/signup">
            <Button size="lg" className="gap-2 text-base px-8">
              Inizia ora <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button size="lg" variant="outline" className="text-base px-8">
              Vedi demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Value Props */}
      <section className="container pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {valueProps.map((vp) => (
            <Card key={vp.label} className="text-center border-0 bg-secondary/50">
              <CardContent className="pt-8 pb-6 px-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <vp.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{vp.label}</h3>
                <p className="text-sm text-muted-foreground">{vp.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container pb-20">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-10">Come funziona</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <div key={f.label} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground font-display font-bold">
                {i + 1}
              </div>
              <h3 className="font-display font-semibold mb-1">{f.label}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20 text-center">
        <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground border-0">
          <CardContent className="py-12 px-8">
            <h2 className="font-display text-2xl font-bold mb-3">Pronto a iniziare?</h2>
            <p className="mb-6 opacity-90">Crea il tuo primo focus workout in meno di un minuto.</p>
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="text-base px-8">
                Inizia gratis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 Focus Buddy
        </div>
      </footer>
    </div>
  );
}

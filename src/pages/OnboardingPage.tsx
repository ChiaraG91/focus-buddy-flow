import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockTemplates } from "@/lib/api";
import { Check, ArrowRight, ArrowLeft } from "lucide-react";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [telegramId, setTelegramId] = useState("");
  const navigate = useNavigate();

  const totalSteps = 4;

  const next = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prev = () => setStep((s) => Math.max(s - 1, 1));
  const finish = () => navigate("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-lg animate-fade-in">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-medium">Step {step} di {totalSteps}</span>
            <Badge variant="secondary">{Math.round((step / totalSteps) * 100)}%</Badge>
          </div>
          <Progress value={(step / totalSteps) * 100} className="h-2" />
        </CardHeader>
        <CardContent className="min-h-[280px] flex flex-col">
          {step === 1 && (
            <div className="flex-1 space-y-4">
              <CardTitle className="font-display text-xl">Chi sei?</CardTitle>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input placeholder="Il tuo nome" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="email@esempio.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 space-y-4">
              <CardTitle className="font-display text-xl">Scegli un template</CardTitle>
              <p className="text-sm text-muted-foreground">Cosa vuoi fare durante le tue sessioni?</p>
              <div className="grid gap-3">
                {mockTemplates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-secondary/50 ${
                      selectedTemplate === t.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                      selectedTemplate === t.id ? "border-primary bg-primary" : "border-muted-foreground/30"
                    }`}>
                      {selectedTemplate === t.id && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                    </div>
                    <span className="font-medium">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 space-y-4">
              <CardTitle className="font-display text-xl">Connetti Telegram</CardTitle>
              <p className="text-sm text-muted-foreground">Ricevi reminder prima di ogni sessione (opzionale)</p>
              <div className="space-y-2">
                <Label>Telegram ID</Label>
                <Input placeholder="@tuo_username" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 space-y-4">
              <CardTitle className="font-display text-xl">Tutto pronto!</CardTitle>
              <p className="text-sm text-muted-foreground">Ecco un riepilogo delle tue preferenze:</p>
              <div className="rounded-lg bg-secondary/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="font-medium">{name || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{email || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium">
                    {mockTemplates.find((t) => t.id === selectedTemplate)?.label || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telegram</span>
                  <span className="font-medium">{telegramId || "Non connesso"}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6 mt-auto">
            <Button variant="ghost" onClick={prev} disabled={step === 1} className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Indietro
            </Button>
            {step < totalSteps ? (
              <Button onClick={next} className="gap-1">
                Avanti <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} className="gap-1">
                Finish <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

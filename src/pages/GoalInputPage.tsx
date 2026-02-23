import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockTemplates, createFocusSession } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Target } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function GoalInputPage() {
  const [goalText, setGoalText] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [duration, setDuration] = useState("25");
  const navigate = useNavigate();
  const { toast } = useToast();

  const wordCount = goalText.trim().split(/\s+/).filter(Boolean).length;
  const isValid = goalText.trim().length > 0 && wordCount <= 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    await createFocusSession(goalText, templateId, parseInt(duration));
    toast({ title: "Sessione creata!", description: `${goalText} — ${duration} min` });
    navigate("/session", { state: { goal: goalText, duration: parseInt(duration) } });
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto animate-fade-in">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display text-xl">Nuova Sessione</CardTitle>
                <CardDescription>Definisci il tuo obiettivo di focus</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label>Obiettivo (max 8 parole)</Label>
                <Input
                  placeholder="es. Scrivere test per il modulo auth"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  required
                />
                <p className={`text-xs ${wordCount > 8 ? "text-destructive" : "text-muted-foreground"}`}>
                  {wordCount}/8 parole
                </p>
              </div>

              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={templateId} onValueChange={setTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Scegli un template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Durata</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 minuti</SelectItem>
                    <SelectItem value="50">50 minuti</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full" disabled={!isValid}>
                Inizia sessione
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

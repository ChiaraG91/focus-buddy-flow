import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockSessions } from "@/lib/api";
import { Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const statusConfig = {
  fatto: { label: "Fatto", icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
  bloccato: { label: "Bloccato", icon: AlertCircle, className: "bg-blocked/10 text-blocked border-blocked/20" },
  "next-action": { label: "Next Action", icon: ArrowRight, className: "bg-warning/10 text-warning border-warning/20" },
  "in-corso": { label: "In corso", icon: Clock, className: "bg-primary/10 text-primary border-primary/20" },
};

export default function ProgramPage() {
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <h1 className="font-display text-2xl font-bold mb-6">Programma Sessioni</h1>
        <div className="space-y-3">
          {mockSessions.map((session) => {
            const sc = statusConfig[session.status];
            return (
              <Card key={session.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{session.goal}</p>
                      <p className="text-xs text-muted-foreground">{session.duration} min</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={sc.className}>
                    <sc.icon className="h-3 w-3 mr-1" />
                    {sc.label}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

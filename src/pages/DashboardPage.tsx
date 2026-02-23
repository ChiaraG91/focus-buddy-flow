import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockSessions, mockWeeklyData } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Plus, Send, Clock, CheckCircle, AlertCircle, ArrowRight, TrendingUp } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const statusConfig = {
  fatto: { label: "Fatto", icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
  bloccato: { label: "Bloccato", icon: AlertCircle, className: "bg-blocked/10 text-blocked border-blocked/20" },
  "next-action": { label: "Next", icon: ArrowRight, className: "bg-warning/10 text-warning border-warning/20" },
  "in-corso": { label: "In corso", icon: Clock, className: "bg-primary/10 text-primary border-primary/20" },
};

export default function DashboardPage() {
  const totalSessions = mockSessions.length;
  const blockedCount = mockSessions.filter((s) => s.status === "bloccato").length;
  const blockedPct = Math.round((blockedCount / totalSessions) * 100);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/new-session">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Nuova sessione
              </Button>
            </Link>
            <Button size="sm" variant="outline" className="gap-2">
              <Send className="h-4 w-4" /> Connetti Telegram
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-sm text-muted-foreground">Sessioni totali</p>
              <p className="font-display text-3xl font-bold">{totalSessions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <p className="text-sm text-muted-foreground">% Bloccate</p>
              <p className="font-display text-3xl font-bold text-blocked">{blockedPct}%</p>
            </CardContent>
          </Card>
          <Card className="col-span-2 md:col-span-1">
            <CardContent className="pt-5 pb-4">
              <p className="text-sm text-muted-foreground">Trend</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                <span className="font-display text-lg font-bold">+12% questa settimana</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display text-lg">Settimana corrente</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Sessioni" />
                <Bar dataKey="blocked" fill="hsl(var(--blocked))" radius={[4, 4, 0, 0]} name="Bloccate" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session List */}
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-lg">Sessioni recenti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {mockSessions.slice(0, 5).map((session) => {
              const sc = statusConfig[session.status];
              return (
                <div key={session.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
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
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

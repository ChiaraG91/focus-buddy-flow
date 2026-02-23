import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockUser, updateUserProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { User, Crown } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function ProfilePage() {
  const [name, setName] = useState(mockUser.name);
  const [email, setEmail] = useState(mockUser.email);
  const [telegramId, setTelegramId] = useState(mockUser.telegramId || "");
  const { toast } = useToast();

  const handleSave = async () => {
    await updateUserProfile({ name, email, telegramId });
    toast({ title: "Profilo aggiornato!" });
  };

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto animate-fade-in">
        <h1 className="font-display text-2xl font-bold mb-6">Profilo</h1>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="font-display">{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telegram ID</Label>
              <Input placeholder="@username" value={telegramId} onChange={(e) => setTelegramId(e.target.value)} />
            </div>
            <Button onClick={handleSave} className="w-full">Salva modifiche</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-semibold">Abbonamento</p>
                <p className="text-sm text-muted-foreground">Piano attuale</p>
              </div>
              <Badge variant="secondary" className="text-sm">Free</Badge>
            </div>
            <Separator className="mb-4" />
            <Button variant="outline" className="w-full gap-2">
              <Crown className="h-4 w-4 text-accent" />
              Upgrade a Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

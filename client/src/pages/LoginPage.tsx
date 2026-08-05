import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Building2, Loader2 } from "lucide-react";

export default function LoginPage() {
  const { setToken } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"customer" | "foreman" | "director">("customer");

  const login = trpc.auth.login.useMutation({
    onSuccess: data => {
      setToken(data.token);
      window.location.href = "/";
    },
    onError: e => toast.error(e.message),
  });

  const register = trpc.auth.register.useMutation({
    onSuccess: data => {
      setToken(data.token);
      window.location.href = "/";
    },
    onError: e => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (tab === "login") {
      login.mutate({ email, password });
    } else {
      register.mutate({ email, password, name: name || email, role });
    }
  };

  const loading = login.isPending || register.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            <Building2 className="h-7 w-7" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">FREONN</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Platform</p>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">{tab === "login" ? "Вход в систему" : "Регистрация"}</CardTitle>
            <CardDescription>Управление строительными объектами</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={tab} onValueChange={v => setTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вход</TabsTrigger>
                <TabsTrigger value="register">Регистрация</TabsTrigger>
              </TabsList>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@company.ru" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="••••••" />
                </div>
                {tab === "register" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Имя / название</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Иван Петров" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Роль</Label>
                      <select
                        id="role"
                        value={role}
                        onChange={e => setRole(e.target.value as any)}
                        className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
                      >
                        <option value="customer">Заказчик</option>
                        <option value="foreman">Прораб</option>
                        <option value="director">Директор</option>
                      </select>
                    </div>
                  </>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {tab === "login" ? "Войти" : "Зарегистрироваться"}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

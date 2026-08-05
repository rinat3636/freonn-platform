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
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    if (tab === "login") {
      login.mutate({ email, password });
    } else {
      register.mutate({ email, password, name: name || email, role });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Building2 className="h-6 w-6" />
          </div>
          <CardTitle className="font-heading text-2xl">Freonn Platform</CardTitle>
          <CardDescription>Управление строительными объектами</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={v => setTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              {tab === "register" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя / название</Label>
                    <Input id="name" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <select
                      id="role"
                      value={role}
                      onChange={e => setRole(e.target.value as any)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="customer">Заказчик</option>
                      <option value="foreman">Прораб</option>
                      <option value="director">Директор</option>
                    </select>
                  </div>
                </>
              )}
              <Button type="submit" className="w-full" disabled={loading || login.isPending || register.isPending}>
                {(loading || login.isPending || register.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tab === "login" ? "Войти" : "Зарегистрироваться"}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

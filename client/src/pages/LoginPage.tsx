import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import FreonnLogo from "@/components/FreonnLogo";

export default function LoginPage() {
  const { setToken } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value.trim() || email;
    const role = ((form.elements.namedItem("role") as HTMLSelectElement)?.value || "customer") as any;

    if (!email || !password) return toast.error("Введите email и пароль");
    if (tab === "register" && !name) return toast.error("Введите имя");
    if (password.length < 6) return toast.error("Пароль должен быть не короче 6 символов");

    if (tab === "login") {
      login.mutate({ email, password });
    } else {
      register.mutate({ email, password, name, role });
    }
  };

  const loading = login.isPending || register.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center justify-center gap-2 mb-8">
          <FreonnLogo height={52} showPro={false} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Platform</p>
        </div>

        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center pb-2 pt-7">
            <CardTitle className="text-xl font-bold">
              {tab === "login" ? "Вход в систему" : "Регистрация"}
            </CardTitle>
            <CardDescription>Управление строительными объектами</CardDescription>
          </CardHeader>
          <CardContent className="pb-7">
            <Tabs value={tab} onValueChange={v => setTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-muted/60 rounded-xl h-11">
                <TabsTrigger value="login" onClick={() => setTab("login")} className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Вход
                </TabsTrigger>
                <TabsTrigger value="register" onClick={() => setTab("register")} className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Регистрация
                </TabsTrigger>
              </TabsList>
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <TabsContent value="login" className="mt-0 space-y-4">
                  <LoginFields />
                </TabsContent>
                <TabsContent value="register" className="mt-0 space-y-4">
                  <LoginFields />
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя / название</Label>
                    <Input id="name" name="name" autoComplete="name" placeholder="Иван Петров" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <select
                      id="role"
                      name="role"
                      defaultValue="customer"
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-shadow"
                    >
                      <option value="customer">Заказчик</option>
                      <option value="foreman">Прораб</option>
                      <option value="director">Директор</option>
                    </select>
                  </div>
                </TabsContent>
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

function LoginFields() {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.ru" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="••••••" />
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import FreonnLogo from "@/components/FreonnLogo";

export default function LoginPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");

  useEffect(() => {
    if (user) window.location.href = "/";
  }, [user]);

  const login = trpc.auth.login.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
    onError: e => toast.error(e.message),
  });

  const register = trpc.auth.register.useMutation({
    onSuccess: () => {
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
    if (!email || !password) return toast.error("Введите email и пароль");
    if (tab === "register" && !name) return toast.error("Введите имя");
    if (password.length < 6) return toast.error("Пароль должен быть не короче 6 символов");

    if (tab === "login") {
      login.mutate({ email, password });
    } else {
      register.mutate({ email, password, name });
    }
  };

  const loading = login.isPending || register.isPending;

  return (
    <div className="app-theme flex min-h-screen flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col px-6 pt-12 pb-6">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl bg-white p-3 shadow-sm">
            <FreonnLogo height={40} showPro={false} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Freonn Platform</h1>
          <p className="text-sm text-muted-foreground text-center">Управление строительными объектами</p>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                tab === "login"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`rounded-xl py-2.5 text-sm font-semibold transition-all ${
                tab === "register"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.ru"
                className="h-14 rounded-2xl border-0 bg-muted px-4 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">Пароль</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                placeholder="••••••"
                className="h-14 rounded-2xl border-0 bg-muted px-4 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            {tab === "register" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">Имя / название</Label>
                <Input
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Иван Петров"
                  className="h-14 rounded-2xl border-0 bg-muted px-4 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            )}

            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Забыли пароль?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="mt-2 h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/25">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tab === "login" ? "Войти" : "Зарегистрироваться"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

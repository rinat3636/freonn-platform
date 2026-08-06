import { useEffect, useState } from "react";
import { useSearch, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import FreonnLogo from "@/components/FreonnLogo";

export default function ResetPasswordPage() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);

  const reset = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setDone(true);
      toast.success("Пароль изменён. Войдите с новым паролем.");
    },
    onError: error => toast.error(error.message),
  });

  useEffect(() => {
    if (!token) {
      toast.error("Ссылка сброса пароля недействительна");
    }
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8">
        <FreonnLogo height={40} showPro={false} />
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold">Новый пароль</h1>
        {done ? (
          <div className="space-y-4 text-center">
            <p className="text-sm">Пароль успешно изменён.</p>
            <Link href="/login">
              <Button className="w-full">Войти</Button>
            </Link>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              if (password !== confirm) {
                toast.error("Пароли не совпадают");
                return;
              }
              reset.mutate({ token, newPassword: password });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="password">Новый пароль</Label>
              <Input
                id="password"
                type="password"
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Повторите пароль</Label>
              <Input
                id="confirm"
                type="password"
                minLength={6}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={!token || reset.isPending}>
              {reset.isPending ? "Сохранение…" : "Сохранить пароль"}
            </Button>
            <Link href="/login" className="block text-center text-sm text-muted-foreground hover:text-primary">
              Вернуться к входу
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}

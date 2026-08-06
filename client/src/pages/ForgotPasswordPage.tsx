import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import FreonnLogo from "@/components/FreonnLogo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const forgot = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Если email зарегистрирован, ссылка отправлена");
    },
    onError: error => toast.error(error.message),
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="mb-8">
        <FreonnLogo height={40} showPro={false} />
      </div>
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg">
        <h1 className="mb-2 text-2xl font-bold">Сброс пароля</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Укажите email, и мы отправим ссылку для восстановления пароля.
        </p>
        {submitted ? (
          <div className="space-y-4 text-center">
            <p className="text-sm">Проверьте почту и перейдите по ссылке из письма.</p>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Вернуться к входу
              </Button>
            </Link>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              forgot.mutate({ email });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={forgot.isPending}>
              {forgot.isPending ? "Отправка…" : "Отправить ссылку"}
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

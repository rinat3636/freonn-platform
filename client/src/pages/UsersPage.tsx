import { useState } from "react";
import { Loader2, Plus, ShieldCheck, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DashboardHeader } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleLabels = {
  director: "Директор",
  foreman: "Прораб",
  customer: "Заказчик",
} as const;

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  const isDirector = user?.role === "director";
  const users = trpc.auth.listUsers.useQuery(undefined, {
    enabled: isDirector,
  });
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "foreman">("customer");
  const [password, setPassword] = useState("");

  const createUser = trpc.auth.createUser.useMutation({
    onSuccess: async () => {
      await utils.auth.listUsers.invalidate();
      setOpen(false);
      setName("");
      setEmail("");
      setPhone("");
      setRole("customer");
      setPassword("");
      toast.success("Пользователь создан");
    },
    onError: error => toast.error(error.message),
  });

  if (!isDirector) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md rounded-2xl border border-border/50 shadow-sm">
          <CardContent className="p-8 text-center">
            <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <h1 className="text-xl font-bold">Недостаточно прав</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Управление пользователями доступно только директору.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    createUser.mutate({
      name,
      email,
      phone: phone || undefined,
      role,
      password,
    });
  };

  return (
    <div>
      <DashboardHeader title="Команда">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Новый пользователь
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Новый пользователь</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="mt-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Имя</Label>
                <Input
                  id="user-name"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Имя пользователя"
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-phone">Телефон</Label>
                <Input
                  id="user-phone"
                  value={phone}
                  onChange={event => setPhone(event.target.value)}
                  placeholder="+7 900 000-00-00"
                />
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select
                  value={role}
                  onValueChange={value =>
                    setRole(value as "customer" | "foreman")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Заказчик</SelectItem>
                    <SelectItem value="foreman">Прораб</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Пароль</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder="Минимум 6 символов"
                  required
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createUser.isPending}
              >
                {createUser.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Создать пользователя
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </DashboardHeader>

      {users.isLoading ? (
        <div className="text-muted-foreground">Загрузка пользователей…</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {(["director", "foreman", "customer"] as const).map(userRole => {
            const roleUsers =
              users.data?.filter(item => item.role === userRole) ?? [];
            return (
              <Card
                key={userRole}
                className="rounded-2xl border border-border/50 shadow-sm"
              >
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {userRole === "director" ? (
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    ) : userRole === "foreman" ? (
                      <UserRound className="h-5 w-5 text-primary" />
                    ) : (
                      <Users className="h-5 w-5 text-primary" />
                    )}
                    {roleLabels[userRole]}
                  </CardTitle>
                  <Badge variant="secondary">{roleUsers.length}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  {roleUsers.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      Пользователей пока нет
                    </p>
                  ) : (
                    roleUsers.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                            {initials(item.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {item.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.email}
                          </p>
                          {item.phone && (
                            <p className="truncate text-xs text-muted-foreground">
                              {item.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

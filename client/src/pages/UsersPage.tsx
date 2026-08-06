import { useEffect, useState } from "react";
import {
  Edit,
  KeyRound,
  Loader2,
  Plus,
  Power,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DashboardHeader } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

type Role = keyof typeof roleLabels;

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
  type DirectoryUser = NonNullable<typeof users.data>[number];
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"customer" | "foreman">("customer");
  const [password, setPassword] = useState("");
  const [editingUser, setEditingUser] = useState<DirectoryUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRole, setEditRole] = useState<Role>("customer");
  const [passwordUser, setPasswordUser] = useState<DirectoryUser | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    if (editingUser) {
      setEditName(editingUser.name);
      setEditPhone(editingUser.phone ?? "");
      setEditRole(editingUser.role);
    }
  }, [editingUser]);

  const refreshUsers = () => utils.auth.listUsers.invalidate();
  const createUser = trpc.auth.createUser.useMutation({
    onSuccess: async () => {
      await refreshUsers();
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
  const updateUser = trpc.auth.updateUser.useMutation({
    onSuccess: async () => {
      await refreshUsers();
      setEditingUser(null);
      toast.success("Данные пользователя обновлены");
    },
    onError: error => toast.error(error.message),
  });
  const setUserActive = trpc.auth.setUserActive.useMutation({
    onSuccess: async (_, input) => {
      await refreshUsers();
      toast.success(
        input.isActive ? "Пользователь включён" : "Пользователь отключён"
      );
    },
    onError: error => toast.error(error.message),
  });
  const resetUserPassword = trpc.auth.resetUserPassword.useMutation({
    onSuccess: () => {
      setPasswordUser(null);
      setResetPassword("");
      toast.success("Пароль пользователя сброшен");
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

  const submitCreate = (event: React.FormEvent) => {
    event.preventDefault();
    createUser.mutate({
      name,
      email,
      phone: phone || undefined,
      role,
      password,
    });
  };

  const submitEdit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser) return;
    updateUser.mutate({
      id: editingUser.id,
      name: editName.trim(),
      phone: editPhone.trim() || null,
      role: editRole,
    });
  };

  return (
    <div>
      <DashboardHeader title="Команда">
        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Новый пользователь
          </Button>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Новый пользователь</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitCreate} className="mt-2 space-y-4">
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  required
                  minLength={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input
                  value={phone}
                  onChange={event => setPhone(event.target.value)}
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Заказчик</SelectItem>
                    <SelectItem value="foreman">Прораб</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Пароль</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  minLength={6}
                  required
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
                    roleUsers.map(item => {
                      const isCurrentUser = item.id === user?.id;
                      return (
                        <div
                          key={item.id}
                          className={`rounded-xl border border-border/60 p-3 ${item.isActive ? "" : "opacity-60"}`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                {initials(item.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold">
                                  {item.name}
                                </p>
                                {!item.isActive && (
                                  <Badge variant="outline">Отключён</Badge>
                                )}
                              </div>
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
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(item)}
                            >
                              <Edit className="mr-1.5 h-3.5 w-3.5" />
                              Изменить
                            </Button>
                            {!isCurrentUser && (
                              <Dialog
                                open={passwordUser?.id === item.id}
                                onOpenChange={open =>
                                  !open && setPasswordUser(null)
                                }
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setPasswordUser(item)}
                                >
                                  <KeyRound className="mr-1.5 h-3.5 w-3.5" />
                                  Пароль
                                </Button>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Новый пароль: {item.name}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <form
                                    className="space-y-4"
                                    onSubmit={event => {
                                      event.preventDefault();
                                      resetUserPassword.mutate({
                                        id: item.id,
                                        password: resetPassword,
                                      });
                                    }}
                                  >
                                    <div className="space-y-2">
                                      <Label>Новый пароль</Label>
                                      <Input
                                        type="password"
                                        value={resetPassword}
                                        onChange={event =>
                                          setResetPassword(event.target.value)
                                        }
                                        minLength={6}
                                        required
                                      />
                                    </div>
                                    <Button
                                      type="submit"
                                      className="w-full"
                                      disabled={resetUserPassword.isPending}
                                    >
                                      Сохранить пароль
                                    </Button>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            )}
                            {!isCurrentUser && item.isActive && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-destructive"
                                  >
                                    <Power className="mr-1.5 h-3.5 w-3.5" />
                                    Отключить
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Отключить пользователя?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Пользователь «{item.name}» больше не
                                      сможет войти в систему. История действий и
                                      данные будут сохранены.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Отмена
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        setUserActive.mutate({
                                          id: item.id,
                                          isActive: false,
                                        })
                                      }
                                    >
                                      Отключить
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                            {!isCurrentUser && !item.isActive && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setUserActive.mutate({
                                    id: item.id,
                                    isActive: true,
                                  })
                                }
                                disabled={setUserActive.isPending}
                              >
                                Включить
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!editingUser}
        onOpenChange={open => !open && setEditingUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактировать пользователя</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form className="space-y-4" onSubmit={submitEdit}>
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input
                  value={editName}
                  onChange={event => setEditName(event.target.value)}
                  minLength={2}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Телефон</Label>
                <Input
                  value={editPhone}
                  onChange={event => setEditPhone(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                {editingUser.id === user?.id ? (
                  <Badge variant="outline">
                    {roleLabels[editingUser.role]}
                  </Badge>
                ) : (
                  <Select
                    value={editRole}
                    onValueChange={value => setEditRole(value as Role)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="director">Директор</SelectItem>
                      <SelectItem value="foreman">Прораб</SelectItem>
                      <SelectItem value="customer">Заказчик</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={updateUser.isPending}
              >
                Сохранить изменения
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

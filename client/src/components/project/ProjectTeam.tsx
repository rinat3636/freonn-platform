import { useEffect, useMemo, useState } from "react";
import { UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roleLabels: Record<string, string> = {
  director: "Директор",
  customer: "Заказчик",
  foreman: "Прораб",
  viewer: "Наблюдатель",
  admin: "Администратор",
};

function initials(name?: string | null) {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join("")
      .toUpperCase() || "—"
  );
}

function PersonCard({
  title,
  person,
  children,
}: {
  title: string;
  person?: { name: string; email?: string | null; role?: string } | null;
  children?: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center gap-3">
        <Avatar className="h-11 w-11 border border-border/60">
          <AvatarFallback className="bg-primary/10 font-bold text-primary">
            {initials(person?.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {person?.name || "Не назначен"}
          </p>
          {person?.email && (
            <p className="truncate text-xs text-muted-foreground">
              {person.email}
            </p>
          )}
          {person?.role && (
            <Badge variant="secondary" className="mt-1 text-[11px]">
              {roleLabels[person.role] || person.role}
            </Badge>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export default function ProjectTeam({
  projectId,
  canManage,
}: {
  projectId: number;
  canManage: boolean;
}) {
  const utils = trpc.useUtils();
  const project = trpc.projects.get.useQuery({ id: projectId });
  const users = trpc.auth.listUsers.useQuery(undefined, {
    enabled: canManage,
  });
  const [customerId, setCustomerId] = useState("");
  const [foremanId, setForemanId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [memberRole, setMemberRole] = useState<"viewer" | "foreman" | "admin">(
    "viewer"
  );

  useEffect(() => {
    setCustomerId(project.data?.customer?.id?.toString() || "");
    setForemanId(project.data?.foreman?.id?.toString() || "");
  }, [project.data?.customer?.id, project.data?.foreman?.id]);

  const customers = useMemo(
    () => users.data?.filter(user => user.role === "customer") ?? [],
    [users.data]
  );
  const foremen = useMemo(
    () => users.data?.filter(user => user.role === "foreman") ?? [],
    [users.data]
  );
  const members = project.data?.members ?? [];
  const assignedIds = new Set([
    project.data?.director?.id,
    project.data?.customer?.id,
    project.data?.foreman?.id,
    ...members.map(member => member.id),
  ]);
  const availableMembers =
    users.data?.filter(user => !assignedIds.has(user.id)) ?? [];

  const updateProject = trpc.projects.update.useMutation({
    onSuccess: async () => {
      await utils.projects.get.invalidate({ id: projectId });
      toast.success("Назначения обновлены");
    },
    onError: error => toast.error(error.message),
  });
  const addMember = trpc.projects.addMember.useMutation({
    onSuccess: async () => {
      setMemberId("");
      await utils.projects.get.invalidate({ id: projectId });
      toast.success("Участник добавлен");
    },
    onError: error => toast.error(error.message),
  });
  const removeMember = trpc.projects.removeMember.useMutation({
    onSuccess: async () => {
      await utils.projects.get.invalidate({ id: projectId });
      toast.success("Участник удалён");
    },
    onError: error => toast.error(error.message),
  });

  if (project.isLoading) {
    return <div className="text-muted-foreground">Загрузка команды…</div>;
  }
  if (!project.data) {
    return <div className="text-muted-foreground">Команда недоступна</div>;
  }

  const changeCustomer = (value: string) => {
    setCustomerId(value);
    updateProject.mutate({
      id: projectId,
      data: { customerId: value === "__none" ? null : Number(value) },
    });
  };
  const changeForeman = (value: string) => {
    setForemanId(value);
    updateProject.mutate({
      id: projectId,
      data: {
        primaryForemanId: value === "__none" ? null : Number(value),
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Команда объекта</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Назначенные сотрудники и участники проекта
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <PersonCard title="Директор" person={project.data.director} />
        {canManage ? (
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Заказчик
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={customerId || "__none"}
                onValueChange={changeCustomer}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Не назначен</SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={String(customer.id)}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ) : (
          <PersonCard title="Заказчик" person={project.data.customer} />
        )}
        {canManage ? (
          <Card className="rounded-2xl border border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Прораб
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={foremanId || "__none"}
                onValueChange={changeForeman}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Не назначен" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Не назначен</SelectItem>
                  {foremen.map(foreman => (
                    <SelectItem key={foreman.id} value={String(foreman.id)}>
                      {foreman.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ) : (
          <PersonCard title="Прораб" person={project.data.foreman} />
        )}
      </div>

      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              Дополнительные участники
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Пользователи с дополнительным доступом к объекту
            </p>
          </div>
          <Badge variant="secondary">{members.length}</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {canManage && (
            <div className="grid gap-2 md:grid-cols-[1fr_180px_auto]">
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите пользователя" />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers.map(member => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.name} · {roleLabels[member.role] || member.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={memberRole}
                onValueChange={value =>
                  setMemberRole(value as "viewer" | "foreman" | "admin")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Наблюдатель</SelectItem>
                  <SelectItem value="foreman">Прораб</SelectItem>
                  <SelectItem value="admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                disabled={!memberId || addMember.isPending}
                onClick={() =>
                  addMember.mutate({
                    projectId,
                    userId: Number(memberId),
                    role: memberRole,
                  })
                }
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Добавить
              </Button>
            </div>
          )}

          {members.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Дополнительных участников пока нет
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map(member => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {initials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {member.name}
                    </p>
                    <Badge variant="outline" className="mt-1 text-[11px]">
                      {roleLabels[member.role] || member.role}
                    </Badge>
                  </div>
                  {canManage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={removeMember.isPending}
                      onClick={() =>
                        removeMember.mutate({ projectId, userId: member.id })
                      }
                      aria-label={`Удалить ${member.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

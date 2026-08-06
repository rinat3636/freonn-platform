import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DashboardHeader } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

const statusLabels: Record<string, string> = {
  new: "Новый",
  in_progress: "В работе",
  contract: "Договор",
  project: "Проект",
  cancelled: "Отменён",
};

export default function LeadsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const canManage = user?.role === "director" || user?.role === "foreman";
  const leads = trpc.leads.list.useQuery({
    status: status === "all" ? undefined : (status as any),
    search: search || undefined,
  });
  const update = trpc.leads.update.useMutation({
    onSuccess: () => leads.refetch(),
    onError: e => toast.error(e.message),
  });
  const remove = trpc.leads.delete.useMutation({
    onSuccess: () => leads.refetch(),
    onError: e => toast.error(e.message),
  });

  return (
    <div>
      <DashboardHeader title="Лиды" />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Поиск"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-3">
        {leads.data?.map(lead => (
          <Card key={lead.id} className="rounded-2xl border border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{lead.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {lead.phone || lead.email} · {lead.source} · {formatDate(lead.createdAt)}
                  </div>
                  {lead.message && <div className="mt-1 text-sm">{lead.message}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {canManage && (
                    <Select
                      value={lead.status}
                      onValueChange={value => update.mutate({ id: lead.id, status: value as any })}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {user?.role === "director" && (
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate({ id: lead.id })}>
                      <span className="sr-only">Удалить</span>×
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {!leads.data?.length && (
          <div className="py-16 text-center text-muted-foreground">Лидов пока нет</div>
        )}
      </div>
    </div>
  );
}

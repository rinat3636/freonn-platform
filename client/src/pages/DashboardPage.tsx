import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DashboardHeader } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Calendar,
  MapPin,
  Loader2,
  Building2,
  Search,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { scheduleStatus } from "@/lib/format";

function daysLeft(end: Date | string | null | undefined): {
  text: string;
  color: string;
} {
  if (!end) return { text: "—", color: "bg-muted text-muted-foreground" };
  const diff = Math.ceil(
    (new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0)
    return {
      text: `Просрочено ${Math.abs(diff)} дн.`,
      color: "bg-destructive/10 text-destructive border-destructive/20",
    };
  if (diff === 0)
    return {
      text: "Сегодня срок",
      color: "bg-amber-100 text-amber-700 border-amber-200",
    };
  if (diff <= 7)
    return {
      text: `Осталось ${diff} дн.`,
      color: "bg-amber-100 text-amber-700 border-amber-200",
    };
  return {
    text: `Осталось ${diff} дн.`,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
}

function indicatorColor(
  progress: number,
  start?: string | Date | null,
  end?: string | Date | null
): string {
  if (!start || !end) return "bg-primary";
  const total = new Date(end).getTime() - new Date(start).getTime();
  const elapsed = Date.now() - new Date(start).getTime();
  if (total <= 0) return "bg-primary";
  const expected = Math.min(
    100,
    Math.max(0, Math.round((elapsed / total) * 100))
  );
  const diff = progress - expected;
  if (diff >= -5) return "bg-emerald-500";
  if (diff >= -20) return "bg-amber-500";
  return "bg-destructive";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isDirector = user?.role === "director";
  const projects = trpc.projects.list.useQuery();
  const create = trpc.projects.create.useMutation({
    onSuccess: () => {
      projects.refetch();
      setOpen(false);
      setName("");
      setAddress("");
      setStartDate("");
      setPlannedEndDate("");
      setCoords(null);
      setCustomerId("");
      setForemanId("");
      setStages([]);
      setStageDraft("");
      toast.success("Объект создан");
    },
    onError: e => toast.error(e.message),
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [foremanId, setForemanId] = useState("");
  const [stages, setStages] = useState<string[]>([]);
  const [stageDraft, setStageDraft] = useState("");
  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const geocode = trpc.projects.geocode.useQuery(
    { address: address.trim() },
    {
      enabled: false,
      retry: 1,
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    }
  );
  const users = trpc.auth.listUsers.useQuery(undefined, {
    enabled: isDirector,
  });
  const customers = users.data?.filter(user => user.role === "customer") ?? [];
  const foremen = users.data?.filter(user => user.role === "foreman") ?? [];

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Введите название объекта");
    create.mutate({
      name: name.trim(),
      address: address.trim() || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : undefined,
      lat: coords?.lat,
      lng: coords?.lng,
      customerId: customerId ? Number(customerId) : undefined,
      primaryForemanId: foremanId ? Number(foremanId) : undefined,
      stages: stages.length
        ? stages.map(stage => ({ name: stage }))
        : undefined,
    });
  };

  const doGeocode = async () => {
    if (!address.trim()) return toast.error("Введите адрес");
    try {
      const res = await geocode.refetch();
      if (res.data) setCoords(res.data);
      else toast.error("Адрес не найден");
    } catch (e: any) {
      toast.error(e.message || "Ошибка геокодирования");
    }
  };

  const filtered = projects.data?.filter(
    p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.address ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount =
    projects.data?.filter(p => p.status === "active").length ?? 0;
  const overdueCount =
    projects.data?.filter(p => {
      if (!p.plannedEndDate) return false;
      return (
        new Date(p.plannedEndDate).getTime() < Date.now() &&
        p.status !== "completed"
      );
    }).length ?? 0;

  return (
    <div>
      <DashboardHeader title="Объекты">
        {isDirector && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Новый объект
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Создать объект</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Например, ЖК Северный"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Адрес</Label>
                  <div className="flex gap-2">
                    <Input
                      value={address}
                      onChange={e => {
                        setAddress(e.target.value);
                        setCoords(null);
                      }}
                      placeholder="г. Москва, ул. ..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={doGeocode}
                      disabled={geocode.isFetching || !address.trim()}
                    >
                      {geocode.isFetching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Найти"
                      )}
                    </Button>
                  </div>
                  {coords && (
                    <div className="text-xs text-emerald-600 font-medium">
                      Координаты определены: {coords.lat.toFixed(4)},{" "}
                      {coords.lng.toFixed(4)}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Дата начала</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Плановая дата сдачи</Label>
                  <Input
                    type="date"
                    value={plannedEndDate}
                    onChange={e => setPlannedEndDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Этапы работ</Label>
                  <div className="flex gap-2">
                    <Input
                      value={stageDraft}
                      onChange={e => setStageDraft(e.target.value)}
                      placeholder="Например, Фундамент"
                      onKeyDown={e => {
                        if (e.key !== "Enter") return;
                        e.preventDefault();
                        const value = stageDraft.trim();
                        if (!value) return;
                        setStages(current => [...current, value]);
                        setStageDraft("");
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const value = stageDraft.trim();
                        if (!value) return;
                        setStages(current => [...current, value]);
                        setStageDraft("");
                      }}
                    >
                      Добавить
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Необязательно, можно добавить позже
                  </p>
                  {stages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {stages.map((stage, index) => (
                        <Badge
                          key={`${stage}-${index}`}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {stage}
                          <button
                            type="button"
                            className="rounded-full p-0.5 hover:bg-background/70"
                            onClick={() =>
                              setStages(current =>
                                current.filter(
                                  (_, itemIndex) => itemIndex !== index
                                )
                              )
                            }
                            aria-label={`Удалить этап ${stage}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Заказчик</Label>
                    <Select
                      value={customerId || "__none"}
                      onValueChange={value =>
                        setCustomerId(value === "__none" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Не назначен" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Не назначен</SelectItem>
                        {customers.map(customer => (
                          <SelectItem
                            key={customer.id}
                            value={String(customer.id)}
                          >
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Прораб</Label>
                    <Select
                      value={foremanId || "__none"}
                      onValueChange={value =>
                        setForemanId(value === "__none" ? "" : value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Не назначен" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Не назначен</SelectItem>
                        {foremen.map(foreman => (
                          <SelectItem
                            key={foreman.id}
                            value={String(foreman.id)}
                          >
                            {foreman.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={create.isPending}
                  className="w-full"
                >
                  {create.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Создать объект
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </DashboardHeader>

      <div className="mb-5 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 border border-border/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-base font-bold leading-none">{projects.data?.length ?? 0}</div>
            <div className="text-[10px] font-medium text-muted-foreground">Всего</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 border border-border/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div>
            <div className="text-base font-bold leading-none">{activeCount}</div>
            <div className="text-[10px] font-medium text-muted-foreground">Активных</div>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-card px-4 py-2.5 border border-border/60">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <div className="text-base font-bold leading-none">{overdueCount}</div>
            <div className="text-[10px] font-medium text-muted-foreground">Просрочено</div>
          </div>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск по объектам…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-12 w-full rounded-2xl border-0 bg-muted pl-11 text-base shadow-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      {projects.isLoading && (
        <div className="text-muted-foreground font-medium py-8 text-center">Загрузка объектов…</div>
      )}
      {!projects.isLoading && filtered?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-5">
            <Building2 className="h-10 w-10 opacity-40" />
          </div>
          <p className="text-lg font-bold text-foreground">
            {search ? "Ничего не найдено" : "Нет доступных объектов"}
          </p>
          {isDirector && !search && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <p className="text-sm">Создайте первый объект, чтобы начать</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Создать объект
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered?.map(project => {
          const left = daysLeft(project.plannedEndDate);
          const barColor = indicatorColor(project.progressPercent, project.startDate, project.plannedEndDate);
          const schedule = scheduleStatus(project.progressPercent, project.startDate, project.plannedEndDate, project.status);
          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="group flex items-center gap-4 rounded-2xl bg-card p-4 border border-border/60 transition-all active:scale-[0.99] hover:border-primary/30">
                <div
                  className={`h-3 w-3 shrink-0 rounded-full ${
                    project.status === "active"
                      ? "bg-emerald-500"
                      : project.status === "completed"
                      ? "bg-slate-400"
                      : project.status === "paused"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold leading-snug truncate group-hover:text-primary transition-colors">{project.name}</h3>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${left.color}`}>
                      {left.text}
                    </span>
                  </div>
                  {project.address && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground truncate">
                      <MapPin className="h-3 w-3 shrink-0" /> {project.address}
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${barColor} transition-all`} style={{ width: `${project.progressPercent}%` }} />
                    </div>
                    <span className="text-xs font-bold w-8 text-right">{project.progressPercent}%</span>
                  </div>
                  {schedule && (
                    <div className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${schedule.className}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {schedule.label}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

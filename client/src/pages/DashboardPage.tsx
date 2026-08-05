import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DashboardHeader } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Calendar, MapPin, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

function daysLeft(end: Date | string | null | undefined): { text: string; color: string } {
  if (!end) return { text: "—", color: "bg-muted text-muted-foreground" };
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { text: `Просрочено ${Math.abs(diff)} дн.`, color: "bg-destructive/15 text-destructive" };
  if (diff === 0) return { text: "Сегодня срок", color: "bg-amber-100 text-amber-700" };
  if (diff <= 7) return { text: `Осталось ${diff} дн.`, color: "bg-amber-100 text-amber-700" };
  return { text: `Осталось ${diff} дн.`, color: "bg-emerald-100 text-emerald-700" };
}

function indicatorColor(progress: number, start?: string | Date | null, end?: string | Date | null): string {
  if (!start || !end) return "bg-muted";
  const total = new Date(end).getTime() - new Date(start).getTime();
  const elapsed = Date.now() - new Date(start).getTime();
  if (total <= 0) return "bg-muted";
  const expected = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
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
      toast.success("Объект создан");
    },
    onError: e => toast.error(e.message),
  });

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState("");

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    create.mutate({
      name,
      address: address || undefined,
      plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : undefined,
    });
  };

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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать объект</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Адрес</Label>
                  <Input value={address} onChange={e => setAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Плановая дата сдачи</Label>
                  <Input type="date" value={plannedEndDate} onChange={e => setPlannedEndDate(e.target.value)} />
                </div>
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Создать
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </DashboardHeader>

      {projects.isLoading && <div className="text-muted-foreground">Загрузка объектов…</div>}
      {projects.data?.length === 0 && <div className="text-muted-foreground">Нет доступных объектов</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.data?.map(project => {
          const left = daysLeft(project.plannedEndDate);
          const barColor = indicatorColor(project.progressPercent, project.startDate, project.plannedEndDate);
          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-heading">{project.name}</CardTitle>
                    <Badge className={left.color}>{left.text}</Badge>
                  </div>
                  {project.address && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {project.address}
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Прогресс</span>
                    <span className="font-medium">{project.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${project.progressPercent}%` }} />
                  </div>
                  {project.plannedEndDate && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" /> Сдача: {new Date(project.plannedEndDate).toLocaleDateString("ru-RU")}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

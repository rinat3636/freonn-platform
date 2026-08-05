import { useState } from "react";
import { Calendar, Check, Circle, Clock3, Plus, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const labels: Record<string, string> = {
  planned: "Запланирован",
  active: "В работе",
  done: "Выполнен",
  blocked: "Заблокирован",
};
const colors: Record<string, string> = {
  planned: "bg-slate-300",
  active: "bg-amber-500 animate-pulse",
  done: "bg-emerald-500",
  blocked: "bg-red-500",
};

export default function ConstructionTimeline({
  projectId,
  canEdit,
}: {
  projectId: number;
  canEdit: boolean;
}) {
  const stages = trpc.stages.list.useQuery({ projectId });
  const [selected, setSelected] = useState<any>(null);
  const create = trpc.stages.create.useMutation({
    onSuccess: () => {
      stages.refetch();
      toast.success("Этап добавлен");
    },
    onError: e => toast.error(e.message),
  });
  const [name, setName] = useState("");
  return (
    <div className="space-y-5">
      {canEdit && (
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <form
              className="flex gap-2"
              onSubmit={e => {
                e.preventDefault();
                if (!name.trim()) return;
                create.mutate({
                  projectId,
                  name: name.trim(),
                  orderIndex: stages.data?.length ?? 0,
                });
                setName("");
              }}
            >
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Добавить этап строительства"
              />
              <Button disabled={create.isPending}>
                <Plus className="mr-2 h-4 w-4" /> Добавить
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle>План строительства</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="relative flex min-w-[720px] gap-0">
              {(stages.data ?? []).map((stage, index) => (
                <div
                  key={stage.id}
                  className="relative flex-1 cursor-pointer px-3 text-center"
                  onClick={() => setSelected(stage)}
                >
                  <div className="absolute left-0 right-0 top-5 h-1 bg-border">
                    {index === 0 && <span />}
                  </div>
                  <div
                    className={`relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 border-card text-white ${colors[stage.status]}`}
                  >
                    {stage.status === "done" ? (
                      <Check className="h-4 w-4" />
                    ) : stage.status === "blocked" ? (
                      <X className="h-4 w-4" />
                    ) : stage.status === "active" ? (
                      <Clock3 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                  </div>
                  <div className="mt-3 text-sm font-bold">{stage.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {stage.progressPercent}% · {labels[stage.status]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {!stages.data?.length && (
            <div className="py-12 text-center text-muted-foreground">
              Этапы не добавлены
            </div>
          )}
        </CardContent>
      </Card>
      {selected && (
        <StageDialog
          stage={selected}
          projectId={projectId}
          canEdit={canEdit}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            stages.refetch();
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function StageDialog({ stage, projectId, canEdit, onClose, onUpdated }: any) {
  const logs = trpc.content.workLogsList.useQuery({
    projectId,
    stageId: stage.id,
  });
  const media = trpc.content.mediaList.useQuery({
    projectId,
    stageId: stage.id,
  });
  const update = trpc.stages.update.useMutation({
    onSuccess: onUpdated,
    onError: e => toast.error(e.message),
  });
  const duration =
    stage.actualStart && stage.actualEnd
      ? Math.ceil(
          (new Date(stage.actualEnd).getTime() -
            new Date(stage.actualStart).getTime()) /
            86400000
        )
      : stage.plannedStart && stage.plannedEnd
        ? Math.ceil(
            (new Date(stage.plannedEnd).getTime() -
              new Date(stage.plannedStart).getTime()) /
              86400000
          )
        : null;
  return (
    <Dialog open onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>{stage.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{labels[stage.status]}</Badge>
            <Badge variant="secondary">{stage.progressPercent}%</Badge>
            {duration !== null && (
              <span className="text-sm text-muted-foreground">
                Длительность: {duration} дн.
              </span>
            )}
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <span className="flex gap-2">
              <Calendar className="h-4 w-4" /> План:{" "}
              {formatDate(stage.plannedStart)} — {formatDate(stage.plannedEnd)}
            </span>
            {stage.actualStart && (
              <span>
                Фактически: {formatDate(stage.actualStart)} —{" "}
                {formatDate(stage.actualEnd)}
              </span>
            )}
          </div>
          {canEdit && (
            <div className="grid gap-3 sm:grid-cols-2 border-t pt-4">
              <div>
                <Label>Статус</Label>
                <Select
                  value={stage.status}
                  onValueChange={value =>
                    update.mutate({ id: stage.id, status: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Запланирован</SelectItem>
                    <SelectItem value="active">В работе</SelectItem>
                    <SelectItem value="done">Выполнен</SelectItem>
                    <SelectItem value="blocked">Заблокирован</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Прогресс (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={stage.progressPercent}
                  onBlur={e =>
                    update.mutate({
                      id: stage.id,
                      progressPercent: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}
          <div>
            <h3 className="mb-2 font-bold">Журнал работ</h3>
            {logs.data?.length ? (
              <div className="space-y-2">
                {logs.data.map(log => (
                  <div
                    key={log.id}
                    className="rounded-xl bg-muted/50 p-3 text-sm"
                  >
                    <div className="text-xs text-muted-foreground">
                      {formatDate(log.date)} · {log.author?.name || "—"}
                    </div>
                    {log.description}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Записей нет</p>
            )}
          </div>
          <div>
            <h3 className="mb-2 font-bold">Медиа</h3>
            {media.data?.length ? (
              <div className="grid grid-cols-4 gap-2">
                {media.data.map(item => (
                  <img
                    key={item.id}
                    src={item.thumbnailUrl || item.url}
                    className="aspect-square rounded-lg object-cover"
                    alt=""
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Медиа нет</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Clock3,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/format";
import { uploadFile } from "@/lib/upload";
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

function dateValue(value: Date | string | null | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

export default function ConstructionTimeline({
  projectId,
  canEdit,
  canPlan,
}: {
  projectId: number;
  canEdit: boolean;
  canPlan: boolean;
}) {
  const stages = trpc.stages.list.useQuery({ projectId });
  const reorder = trpc.stages.update.useMutation({
    onError: e => toast.error(e.message),
  });
  const [selected, setSelected] = useState<any>(null);
  const [reordering, setReordering] = useState(false);
  const create = trpc.stages.create.useMutation({
    onSuccess: () => {
      stages.refetch();
      setName("");
      setPlannedStart("");
      setPlannedEnd("");
      toast.success("Этап добавлен");
    },
    onError: e => toast.error(e.message),
  });
  const [name, setName] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");

  const swapStages = async (index: number, direction: -1 | 1) => {
    const current = stages.data ?? [];
    const adjacentIndex = index + direction;
    if (!current[index] || !current[adjacentIndex] || reordering) return;
    setReordering(true);
    try {
      const desired = [...current];
      const [moved] = desired.splice(index, 1);
      desired.splice(adjacentIndex, 0, moved);
      for (let position = 0; position < desired.length; position += 1) {
        const stage = desired[position];
        if (stage.orderIndex !== position) {
          await reorder.mutateAsync({
            id: stage.id,
            orderIndex: position,
          });
        }
      }
      await stages.refetch();
    } catch {
      // The mutation already surfaces its error through toast.
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-5">
      {canPlan && (
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardContent className="p-4">
            <form
              className="space-y-2"
              onSubmit={e => {
                e.preventDefault();
                if (!name.trim()) return;
                create.mutate({
                  projectId,
                  name: name.trim(),
                  orderIndex: stages.data?.length ?? 0,
                  plannedStart: plannedStart
                    ? new Date(plannedStart)
                    : undefined,
                  plannedEnd: plannedEnd ? new Date(plannedEnd) : undefined,
                });
              }}
            >
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-end">
                <div className="space-y-1">
                  <Label>Этап</Label>
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Добавить этап строительства"
                  />
                </div>
                <div className="space-y-1">
                  <Label>План: начало</Label>
                  <Input
                    type="date"
                    value={plannedStart}
                    onChange={e => setPlannedStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>План: окончание</Label>
                  <Input
                    type="date"
                    value={plannedEnd}
                    onChange={e => setPlannedEnd(e.target.value)}
                  />
                </div>
                <Button disabled={create.isPending} className="sm:self-end">
                  <Plus className="mr-2 h-4 w-4" /> Добавить
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-sm">
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
                  {canPlan && (
                    <div className="relative z-20 mt-2 flex justify-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={index === 0 || reordering}
                        onClick={e => {
                          e.stopPropagation();
                          swapStages(index, -1);
                        }}
                        aria-label="Переместить влево"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={
                          index === (stages.data?.length ?? 1) - 1 || reordering
                        }
                        onClick={e => {
                          e.stopPropagation();
                          swapStages(index, 1);
                        }}
                        aria-label="Переместить вправо"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
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
          canPlan={canPlan}
          onClose={() => setSelected(null)}
          onUpdated={() => {
            stages.refetch();
            setSelected(null);
          }}
          onMediaUpdated={() => stages.refetch()}
          onDeleted={() => {
            stages.refetch();
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}

function StageDialog({
  stage,
  projectId,
  canEdit,
  canPlan,
  onClose,
  onUpdated,
  onMediaUpdated,
  onDeleted,
}: {
  stage: any;
  projectId: number;
  canEdit: boolean;
  canPlan: boolean;
  onClose: () => void;
  onUpdated: () => void;
  onMediaUpdated: () => void;
  onDeleted: () => void;
}) {
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
  const remove = trpc.stages.delete.useMutation({
    onSuccess: () => {
      toast.success("Этап удалён");
      onDeleted();
    },
    onError: e => toast.error(e.message),
  });
  const createMedia = trpc.content.mediaCreate.useMutation({
    onSuccess: () => {
      media.refetch();
      onMediaUpdated();
      toast.success("Файл добавлен");
    },
    onError: e => toast.error(e.message),
  });
  const fileRef = useRef<HTMLInputElement>(null);
  const [plannedStart, setPlannedStart] = useState(
    dateValue(stage.plannedStart)
  );
  const [plannedEnd, setPlannedEnd] = useState(dateValue(stage.plannedEnd));
  const [uploading, setUploading] = useState(false);
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

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      await createMedia.mutateAsync({
        projectId,
        stageId: stage.id,
        type: file.type.startsWith("video") ? "video" : "photo",
        url,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });
    } catch (error: any) {
      toast.error(error.message || "Не удалось загрузить файл");
    } finally {
      setUploading(false);
    }
  };

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
          <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>План: начало</Label>
              <Input
                type="date"
                value={plannedStart}
                onChange={e => setPlannedStart(e.target.value)}
                disabled={!canPlan}
              />
            </div>
            <div className="space-y-1">
              <Label>План: окончание</Label>
              <Input
                type="date"
                value={plannedEnd}
                onChange={e => setPlannedEnd(e.target.value)}
                disabled={!canPlan}
              />
            </div>
            {canPlan && (
              <Button
                type="button"
                variant="outline"
                className="sm:col-span-2"
                disabled={update.isPending}
                onClick={() =>
                  update.mutate({
                    id: stage.id,
                    plannedStart: plannedStart ? new Date(plannedStart) : null,
                    plannedEnd: plannedEnd ? new Date(plannedEnd) : null,
                  })
                }
              >
                Сохранить план
              </Button>
            )}
          </div>
          {stage.actualStart && (
            <span className="block text-sm text-muted-foreground">
              Фактически: {formatDate(stage.actualStart)} —{" "}
              {formatDate(stage.actualEnd)}
            </span>
          )}
          {canEdit && (
            <div className="grid gap-3 border-t pt-4 sm:grid-cols-2">
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
          {canPlan && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  disabled={remove.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Удалить этап
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить этап?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Этап «{stage.name}» и связанные данные будут удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={e => {
                      e.preventDefault();
                      remove.mutate({ id: stage.id });
                    }}
                  >
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-bold">Медиа</h3>
              {canEdit && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={onUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Загрузить
                  </Button>
                </>
              )}
            </div>
            {media.data?.length ? (
              <div className="grid grid-cols-4 gap-2">
                {media.data.map(item => (
                  <div key={item.id} className="overflow-hidden rounded-lg">
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        controls
                        className="aspect-square w-full object-cover"
                      />
                    ) : (
                      <img
                        src={item.thumbnailUrl || item.url}
                        className="aspect-square w-full object-cover"
                        alt=""
                      />
                    )}
                  </div>
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

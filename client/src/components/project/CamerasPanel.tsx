import { useEffect, useState } from "react";
import {
  Aperture,
  Camera,
  CirclePlay,
  Loader2,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/format";
import { HlsPlayer } from "@/components/HlsPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function CamerasPanel({
  projectId,
  canPlan,
}: {
  projectId: number;
  canPlan: boolean;
}) {
  const cameras = trpc.cameras.list.useQuery({ projectId });
  const create = trpc.cameras.create.useMutation({
    onSuccess: () => cameras.refetch(),
    onError: e => toast.error(e.message),
  });
  const [selected, setSelected] = useState<string>("all");
  const remove = trpc.cameras.delete.useMutation({
    onSuccess: () => {
      cameras.refetch();
      setSelected("all");
    },
    onError: e => toast.error(e.message),
  });
  const snapshot = trpc.cameras.createSnapshot.useMutation({
    onSuccess: () => toast.success("Снимок сохранен"),
    onError: e => toast.error(e.message),
  });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const camera =
    selected === "all"
      ? undefined
      : cameras.data?.find(item => String(item.id) === selected);
  const recordings = trpc.cameras.recordings.useQuery(
    { cameraId: camera?.id ?? 0 },
    { enabled: !!camera }
  );
  const snapshots = trpc.cameras.snapshots.useQuery(
    { cameraId: camera?.id ?? 0 },
    { enabled: !!camera }
  );
  const [slide, setSlide] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const snaps = snapshots.data ?? [];
  const renderCamera = (cam: any) => (
    <Card
      key={cam.id}
      className="overflow-hidden rounded-2xl border border-border/50 shadow-sm"
    >
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base">{cam.name}</CardTitle>
        <div
          className={`h-2.5 w-2.5 rounded-full ${cam.status === "online" ? "bg-emerald-500" : "bg-slate-300"}`}
        />
      </CardHeader>
      <CardContent>
        {cam.hlsUrl ? (
          <HlsPlayer
            src={cam.hlsUrl}
            className="aspect-video rounded-xl bg-black"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Camera />
          </div>
        )}
        <div className="mt-3 flex justify-end">
          {canPlan && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => remove.mutate({ id: cam.id })}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Удалить камеру</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => snapshot.mutate({ cameraId: cam.id })}
          >
            <Aperture className="h-4 w-4" />
            <span className="sr-only">Сделать снимок</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  useEffect(() => {
    if (!slide || !snaps.length) return;
    const timer = window.setInterval(
      () => setSlideIndex(index => (index + 1) % snaps.length),
      1000
    );
    return () => window.clearInterval(timer);
  }, [slide, snaps.length]);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        {canPlan && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить камеру
          </Button>
        )}
        {cameras.data?.length ? (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Выберите камеру" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все камеры</SelectItem>
              {(cameras.data ?? []).map(cam => (
                <SelectItem key={cam.id} value={String(cam.id)}>
                  {cam.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}
      </div>
      <Tabs defaultValue="live">
        <TabsList>
          <TabsTrigger value="live">Трансляция</TabsTrigger>
          <TabsTrigger value="archive">Архив</TabsTrigger>
          <TabsTrigger value="snapshots">Снимки / Таймлапс</TabsTrigger>
        </TabsList>
        <TabsContent value="live" className="mt-4">
          {!cameras.data?.length ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              <Camera className="mx-auto mb-3 h-10 w-10" />
              <p className="font-medium">Камеры ещё не добавлены</p>
              <p className="mt-1 text-sm">Камеры добавляет директор проекта.</p>
            </div>
          ) : (
            <div
              className={
                selected === "all" ? "grid gap-4 md:grid-cols-2" : "max-w-4xl"
              }
            >
              {selected === "all"
                ? cameras.data.map(renderCamera)
                : camera && renderCamera(camera)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="archive" className="mt-4">
          {!camera ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Выберите камеру, чтобы посмотреть архив
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="mb-3 text-lg font-semibold">{camera.name}</h3>
              {recordings.data?.length ? (
                recordings.data.map(item => (
                  <Card
                    key={item.id}
                    className="rounded-xl border border-border/50"
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <span>
                        {formatDate(item.startedAt)} ·{" "}
                        {new Date(item.startedAt).toLocaleTimeString("ru-RU")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {item.durationSec
                          ? `${Math.round(item.durationSec / 60)} мин.`
                          : "—"}
                      </span>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-16 text-center text-muted-foreground">
                  Записей архива нет
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="snapshots" className="mt-4">
          {!camera ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
              Выберите камеру, чтобы посмотреть снимки и таймлапс
            </div>
          ) : (
            <>
              <h3 className="mb-3 text-lg font-semibold">{camera.name}</h3>
              <div className="mb-4 flex gap-2">
                <Button
                  disabled={!camera || snapshot.isPending}
                  onClick={() =>
                    camera && snapshot.mutate({ cameraId: camera.id })
                  }
                >
                  <Aperture className="mr-2 h-4 w-4" />
                  Сделать снимок
                </Button>
                <Button
                  variant="outline"
                  disabled={!snaps.length}
                  onClick={() => {
                    setSlideIndex(0);
                    setSlide(true);
                  }}
                >
                  <CirclePlay className="mr-2 h-4 w-4" />
                  Таймлапс
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {snaps.map(item => (
                  <img
                    key={item.id}
                    src={item.imageUrl}
                    className="aspect-square rounded-xl object-cover"
                    alt=""
                  />
                ))}
              </div>
              {!snaps.length && (
                <div className="py-16 text-center text-muted-foreground">
                  Снимков пока нет
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новая камера</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={e => {
              e.preventDefault();
              create.mutate({ projectId, name, rtspUrl: url });
              setOpen(false);
              setName("");
              setUrl("");
            }}
          >
            <div>
              <Label>Название</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label>RTSP URL</Label>
              <Input value={url} onChange={e => setUrl(e.target.value)} />
            </div>
            <Button className="w-full" disabled={create.isPending}>
              {create.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Сохранить
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={slide} onOpenChange={setSlide}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <div className="relative">
            {snaps[slideIndex] && (
              <img
                src={snaps[slideIndex].imageUrl}
                className="w-full rounded-xl"
                alt=""
              />
            )}
            <Button
              variant="secondary"
              className="absolute bottom-4 right-4"
              onClick={() => setSlide(value => !value)}
            >
              {slide ? (
                <Pause className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}{" "}
              {slide ? "Пауза" : "Продолжить"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

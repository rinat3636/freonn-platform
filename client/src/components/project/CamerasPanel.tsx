import { useEffect, useState } from "react";
import {
  Aperture,
  Camera,
  CirclePlay,
  Loader2,
  Pause,
  Play,
  Plus,
  SlidersHorizontal,
  Trash2,
  Video,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/format";
import { HlsPlayer } from "@/components/HlsPlayer";
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
import { Switch } from "@/components/ui/switch";
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
    onSuccess: () => {
      cameras.refetch();
      setOpen(false);
      resetCreateForm();
    },
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
    onSuccess: () => {
      toast.success("Снимок сохранен");
      snapshots.refetch();
    },
    onError: e => toast.error(e.message),
  });

  const timelapse = trpc.cameras.createTimelapse.useMutation({
    onSuccess: data => {
      toast.success("Таймлапс создан");
      setTimelapseResult(data.url);
    },
    onError: e => toast.error(e.message),
  });

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

  const [playingRecording, setPlayingRecording] = useState<
    NonNullable<typeof recordings.data>[number] | null
  >(null);
  const [slide, setSlide] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const snaps = snapshots.data ?? [];

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [retentionDays, setRetentionDays] = useState(14);
  const [onvifIp, setOnvifIp] = useState("");
  const [onvifPort, setOnvifPort] = useState("");
  const [onvifLogin, setOnvifLogin] = useState("");
  const [onvifPassword, setOnvifPassword] = useState("");

  const [timelapseOpen, setTimelapseOpen] = useState(false);
  const [timelapseStart, setTimelapseStart] = useState("");
  const [timelapseEnd, setTimelapseEnd] = useState("");
  const [timelapseFps, setTimelapseFps] = useState(10);
  const [timelapseResult, setTimelapseResult] = useState<string | null>(null);

  type CameraItem = NonNullable<typeof cameras.data>[number];

  const resetCreateForm = () => {
    setName("");
    setUrl("");
    setRecordingEnabled(true);
    setRetentionDays(14);
    setOnvifIp("");
    setOnvifPort("");
    setOnvifLogin("");
    setOnvifPassword("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const onvifConfig: Record<string, string> = {};
    if (onvifIp) onvifConfig.ip = onvifIp;
    if (onvifPort) onvifConfig.port = onvifPort;
    if (onvifLogin) onvifConfig.login = onvifLogin;
    if (onvifPassword) onvifConfig.password = onvifPassword;
    create.mutate({
      projectId,
      name,
      rtspUrl: url,
      recordingEnabled,
      retentionDays,
      onvifConfig,
    });
  };

  const renderCamera = (cam: CameraItem) => (
    <Card
      key={cam.id}
      className="overflow-hidden rounded-2xl border border-border/50 shadow-sm"
    >
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-base">{cam.name}</CardTitle>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${cam.status === "online" ? "bg-emerald-500" : "bg-slate-300"}`}
            title={cam.status === "online" ? "Онлайн" : "Офлайн"}
          />
          {canPlan && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Удалить камеру</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Удалить камеру?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Камера «{cam.name}» будет удалена, а её архив и снимки
                    больше не будут доступны.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={() => remove.mutate({ id: cam.id })}>
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
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

  const openTimelapseDialog = () => {
    setTimelapseResult(null);
    setTimelapseOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {canPlan && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить камеру
          </Button>
        )}
        {cameras.data?.length ? (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-full sm:w-56">
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
        <TabsList className="flex-wrap sm:flex-nowrap h-auto w-full">
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
                      <div className="flex items-center gap-3 min-w-0">
                        <Video className="h-5 w-5 shrink-0 text-primary" />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">
                            {formatDate(item.startedAt)} ·{" "}
                            {new Date(item.startedAt).toLocaleTimeString("ru-RU")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.durationSec
                              ? `${Math.round(item.durationSec / 60)} мин.`
                              : "—"}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPlayingRecording(item)}
                      >
                        <Play className="mr-2 h-3.5 w-3.5" />
                        Смотреть
                      </Button>
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
              <div className="mb-4 flex flex-wrap gap-2">
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
                  Слайд-шоу
                </Button>
                <Button variant="outline" onClick={openTimelapseDialog}>
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
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
        <DialogContent className="rounded-2xl sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новая камера</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <Label>Название</Label>
              <Input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <Label>RTSP URL</Label>
              <Input
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="rtsp://user:pass@ip:554/stream"
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/60 p-3">
              <div>
                <div className="text-sm font-medium">Запись включена</div>
                <div className="text-xs text-muted-foreground">
                  Автоматически писать архив и делать снимки
                </div>
              </div>
              <Switch
                checked={recordingEnabled}
                onCheckedChange={setRecordingEnabled}
              />
            </div>
            <div>
              <Label>Хранение записей, дней</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={retentionDays}
                onChange={e => setRetentionDays(Number(e.target.value))}
              />
            </div>
            <div className="rounded-xl border border-border/60 p-3 space-y-3">
              <div className="text-sm font-medium flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                ONVIF (опционально)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">IP</Label>
                  <Input value={onvifIp} onChange={e => setOnvifIp(e.target.value)} placeholder="192.168.1.10" />
                </div>
                <div>
                  <Label className="text-xs">Порт</Label>
                  <Input value={onvifPort} onChange={e => setOnvifPort(e.target.value)} placeholder="80" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Логин</Label>
                  <Input value={onvifLogin} onChange={e => setOnvifLogin(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Пароль</Label>
                  <Input type="password" value={onvifPassword} onChange={e => setOnvifPassword(e.target.value)} />
                </div>
              </div>
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

      <Dialog open={!!playingRecording} onOpenChange={v => !v && setPlayingRecording(null)}>
        <DialogContent className="max-w-4xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Запись {playingRecording && formatDate(playingRecording.startedAt)}
            </DialogTitle>
          </DialogHeader>
          {playingRecording && (
            <video
              src={playingRecording.url}
              controls
              autoPlay
              className="w-full rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={timelapseOpen} onOpenChange={setTimelapseOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Таймлапс</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Начало периода</Label>
              <Input
                type="datetime-local"
                value={timelapseStart}
                onChange={e => setTimelapseStart(e.target.value)}
              />
            </div>
            <div>
              <Label>Конец периода</Label>
              <Input
                type="datetime-local"
                value={timelapseEnd}
                onChange={e => setTimelapseEnd(e.target.value)}
              />
            </div>
            <div>
              <Label>Кадров в секунду</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={timelapseFps}
                onChange={e => setTimelapseFps(Number(e.target.value))}
              />
            </div>
            <Button
              className="w-full"
              disabled={
                !camera ||
                timelapse.isPending ||
                !timelapseStart ||
                !timelapseEnd
              }
              onClick={() =>
                camera &&
                timelapse.mutate({
                  cameraId: camera.id,
                  start: timelapseStart,
                  end: timelapseEnd,
                  fps: timelapseFps,
                })
              }
            >
              {timelapse.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Создать таймлапс
            </Button>
            {timelapseResult && (
              <video
                src={timelapseResult}
                controls
                className="w-full rounded-xl"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

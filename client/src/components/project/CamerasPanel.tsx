import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Aperture,
  Calendar,
  Camera,
  CirclePlay,
  Clock,
  Download,
  Film,
  Image as ImageIcon,
  Loader2,
  Pause,
  Play,
  Plus,
  SlidersHorizontal,
  Trash2,
  Video,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { AppRouter } from "../../../../server/routers";
import type { inferRouterOutputs } from "@trpc/server";
import { formatDate, classNames } from "@/lib/format";
import { HlsPlayer } from "@/components/HlsPlayer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TAB_KEY = "freonn-cameras-tab";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type CameraItem = RouterOutputs["cameras"]["list"][number];
type RecordingItem = RouterOutputs["cameras"]["recordings"][number];
type SnapshotItem = RouterOutputs["cameras"]["snapshots"][number];

function formatDurationSec(sec?: number | null) {
  if (!sec || sec <= 0) return null;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  if (m > 0) return `${m} мин ${s} с`;
  return `${s} с`;
}

function recordingDuration(
  startedAt: string | Date,
  endedAt?: string | Date | null,
) {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  return Math.max(0, Math.round((end - start) / 1000));
}

function emptyState(message: string, icon: ReactNode) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center text-muted-foreground sm:p-10">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <p className="font-medium">{message}</p>
    </div>
  );
}

export default function CamerasPanel({
  projectId,
  canPlan,
}: {
  projectId: number;
  canPlan: boolean;
}) {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem(TAB_KEY) || "live",
  );
  const [selected, setSelected] = useState<string>("all");
  const cameras = trpc.cameras.list.useQuery({ projectId });

  const create = trpc.cameras.create.useMutation({
    onSuccess: () => {
      cameras.refetch();
      setOpen(false);
      resetCreateForm();
      toast.success("Камера добавлена");
    },
    onError: e => toast.error(e.message),
  });

  const remove = trpc.cameras.delete.useMutation({
    onSuccess: () => {
      cameras.refetch();
      setSelected("all");
      toast.success("Камера удалена");
    },
    onError: e => toast.error(e.message),
  });

  const camera = useMemo(
    () =>
      selected === "all"
        ? undefined
        : cameras.data?.find(item => String(item.id) === selected),
    [selected, cameras.data],
  );

  const recordings = trpc.cameras.recordings.useQuery(
    { cameraId: camera?.id ?? 0 },
    { enabled: !!camera },
  );

  const snapshots = trpc.cameras.snapshots.useQuery(
    { cameraId: camera?.id ?? 0 },
    { enabled: !!camera },
  );

  const snapshot = trpc.cameras.createSnapshot.useMutation({
    onSuccess: () => {
      toast.success("Снимок сохранён");
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

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [retentionDays, setRetentionDays] = useState(14);
  const [onvifIp, setOnvifIp] = useState("");
  const [onvifPort, setOnvifPort] = useState("");
  const [onvifLogin, setOnvifLogin] = useState("");
  const [onvifPassword, setOnvifPassword] = useState("");

  const [slideOpen, setSlideOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slidePlaying, setSlidePlaying] = useState(false);

  const [lightbox, setLightbox] = useState<SnapshotItem | null>(null);

  const [timelapseOpen, setTimelapseOpen] = useState(false);
  const [timelapseStart, setTimelapseStart] = useState("");
  const [timelapseEnd, setTimelapseEnd] = useState("");
  const [timelapseFps, setTimelapseFps] = useState(10);
  const [timelapseResult, setTimelapseResult] = useState<string | null>(null);

  const [playingRecording, setPlayingRecording] =
    useState<RecordingItem | null>(null);

  const snaps = snapshots.data ?? [];

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

  useEffect(() => {
    if (!slideOpen || !snaps.length) {
      setSlidePlaying(false);
      return;
    }
    if (!slidePlaying) return;
    const timer = window.setInterval(() => {
      setSlideIndex(index => (index + 1) % snaps.length);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [slideOpen, slidePlaying, snaps.length]);

  useEffect(() => {
    localStorage.setItem(TAB_KEY, activeTab);
  }, [activeTab]);

  const recordingsByDay = useMemo(() => {
    if (!recordings.data) return [] as { date: string; items: RecordingItem[] }[];
    const groups = new Map<string, RecordingItem[]>();
    recordings.data
      .slice()
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
      )
      .forEach(item => {
        const date = formatDate(item.startedAt);
        if (!groups.has(date)) groups.set(date, []);
        groups.get(date)!.push(item);
      });
    return Array.from(groups.entries()).map(([date, items]) => ({
      date,
      items,
    }));
  }, [recordings.data]);

  const renderCameraCard = (cam: CameraItem) => {
    const online = cam.status === "online";
    return (
      <Card
        key={cam.id}
        className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md"
      >
        <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className={classNames(
                "h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white",
                online ? "bg-emerald-500" : "bg-slate-300",
              )}
              title={online ? "Онлайн" : "Офлайн"}
            />
            <CardTitle className="truncate text-base font-semibold">
              {cam.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => snapshot.mutate({ cameraId: cam.id })}
              disabled={snapshot.isPending}
            >
              {snapshot.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Aperture className="h-4 w-4" />
              )}
              <span className="sr-only">Сделать снимок</span>
            </Button>
            {canPlan && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive/80 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Удалить камеру</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить камеру?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Камера «{cam.name}» будет удалена, а её архив и снимки
                      больше не будут доступны.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => remove.mutate({ id: cam.id })}
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0">
          {cam.hlsUrl ? (
            <HlsPlayer
              src={cam.hlsUrl}
              className="aspect-video rounded-xl bg-black"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Camera className="h-10 w-10 opacity-40" />
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="font-normal">
              {online ? "В сети" : "Нет сигнала"}
            </Badge>
            {cam.recordingEnabled && (
              <Badge variant="outline" className="font-normal">
                <Video className="mr-1 h-3 w-3 text-destructive" />
                Запись
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const hasCameras = (cameras.data?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        {canPlan && (
          <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Добавить камеру
          </Button>
        )}
        {hasCameras && (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="w-full sm:w-64">
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
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-auto w-full flex-wrap rounded-xl bg-muted/60 p-1 sm:w-auto">
          <TabsTrigger value="live" className="rounded-lg text-xs sm:text-sm">
            <Video className="mr-1.5 h-4 w-4" />
            Трансляция
          </TabsTrigger>
          <TabsTrigger value="archive" className="rounded-lg text-xs sm:text-sm">
            <Film className="mr-1.5 h-4 w-4" />
            Архив
          </TabsTrigger>
          <TabsTrigger
            value="snapshots"
            className="rounded-lg text-xs sm:text-sm"
          >
            <ImageIcon className="mr-1.5 h-4 w-4" />
            Снимки
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="mt-4">
          {!hasCameras ? (
            emptyState(
              "Камеры ещё не добавлены",
              <Camera className="h-6 w-6 opacity-40" />,
            )
          ) : selected === "all" ? (
            <div className="grid gap-4 md:grid-cols-2">
              {cameras.data!.map(renderCameraCard)}
            </div>
          ) : camera ? (
            renderCameraCard(camera)
          ) : (
            emptyState(
              "Камера не найдена",
              <Camera className="h-6 w-6 opacity-40" />,
            )
          )}
        </TabsContent>

        <TabsContent value="archive" className="mt-4">
          {!camera ? (
            emptyState(
              "Выберите камеру, чтобы посмотреть архив",
              <Film className="h-6 w-6 opacity-40" />,
            )
          ) : recordingsByDay.length ? (
            <div className="space-y-5">
              {recordingsByDay.map(group => (
                <div key={group.date}>
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {group.date}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {group.items.map(item => {
                      const duration = recordingDuration(
                        item.startedAt,
                        item.endedAt,
                      );
                      const durationText = formatDurationSec(duration);
                      return (
                        <Card
                          key={item.id}
                          className="rounded-xl border border-border/50 bg-card p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Play className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                  {new Date(item.startedAt).toLocaleTimeString(
                                    "ru-RU",
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {durationText ?? "Идёт запись"}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPlayingRecording(item)}
                            >
                              <Play className="mr-1.5 h-3.5 w-3.5" />
                              Смотреть
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            emptyState(
              "Записей архива нет",
              <Film className="h-6 w-6 opacity-40" />,
            )
          )}
        </TabsContent>

        <TabsContent value="snapshots" className="mt-4">
          {!camera ? (
            emptyState(
              "Выберите камеру, чтобы посмотреть снимки",
              <ImageIcon className="h-6 w-6 opacity-40" />,
            )
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  disabled={snapshot.isPending}
                  onClick={() =>
                    camera && snapshot.mutate({ cameraId: camera.id })
                  }
                >
                  {snapshot.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Aperture className="mr-2 h-4 w-4" />
                  )}
                  Сделать снимок
                </Button>
                <Button
                  variant="outline"
                  disabled={!snaps.length}
                  onClick={() => {
                    setSlideIndex(0);
                    setSlideOpen(true);
                    setSlidePlaying(true);
                  }}
                >
                  <CirclePlay className="mr-2 h-4 w-4" />
                  Слайд-шоу
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setTimelapseResult(null);
                    setTimelapseOpen(true);
                  }}
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Таймлапс
                </Button>
              </div>
              {snaps.length ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {snaps.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setLightbox(item);
                        setSlideIndex(index);
                      }}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {new Date(item.takenAt).toLocaleString("ru-RU")}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                emptyState(
                  "Снимков пока нет",
                  <ImageIcon className="h-6 w-6 opacity-40" />,
                )
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новая камера</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div>
              <Label>Название</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Например, Въезд слева"
                required
              />
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
            <div className="space-y-3 rounded-xl border border-border/60 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                ONVIF (опционально)
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">IP</Label>
                  <Input
                    value={onvifIp}
                    onChange={e => setOnvifIp(e.target.value)}
                    placeholder="192.168.1.10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Порт</Label>
                  <Input
                    value={onvifPort}
                    onChange={e => setOnvifPort(e.target.value)}
                    placeholder="80"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Логин</Label>
                  <Input
                    value={onvifLogin}
                    onChange={e => setOnvifLogin(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Пароль</Label>
                  <Input
                    type="password"
                    value={onvifPassword}
                    onChange={e => setOnvifPassword(e.target.value)}
                  />
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

      <Dialog open={slideOpen} onOpenChange={setSlideOpen}>
        <DialogContent className="max-w-4xl rounded-2xl border-none bg-black/90 p-1">
          <div className="relative flex aspect-video items-center justify-center">
            {snaps[slideIndex] && (
              <img
                src={snaps[slideIndex].imageUrl}
                alt=""
                className="max-h-[80vh] max-w-full rounded-lg object-contain"
              />
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-sm text-white backdrop-blur">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() =>
                  setSlideIndex(i => (i - 1 + snaps.length) % snaps.length)
                }
              >
                <Play className="h-4 w-4 rotate-180" />
              </Button>
              <span className="min-w-[4rem] text-center">
                {snaps.length ? slideIndex + 1 : 0} / {snaps.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() =>
                  setSlideIndex(i => (i + 1) % snaps.length)
                }
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setSlidePlaying(v => !v)}
              >
                {slidePlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!lightbox} onOpenChange={v => !v && setLightbox(null)}>
        <DialogContent className="max-w-4xl rounded-2xl border-none bg-black/90 p-1">
          <div className="relative flex aspect-video items-center justify-center">
            {lightbox && (
              <img
                src={lightbox.imageUrl}
                alt=""
                className="max-h-[80vh] max-w-full rounded-lg object-contain"
              />
            )}
            <a
              href={lightbox?.imageUrl}
              download
              className="absolute bottom-4 right-4"
            >
              <Button variant="secondary" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Скачать
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!playingRecording}
        onOpenChange={v => !v && setPlayingRecording(null)}
      >
        <DialogContent className="max-w-4xl rounded-2xl p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>
              Запись от{" "}
              {playingRecording && formatDate(playingRecording.startedAt)} ·{" "}
              {playingRecording &&
                new Date(playingRecording.startedAt).toLocaleTimeString("ru-RU")}
            </DialogTitle>
          </DialogHeader>
          {playingRecording && (
            <video
              src={playingRecording.url}
              controls
              autoPlay
              className="w-full rounded-b-2xl"
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={timelapseOpen} onOpenChange={setTimelapseOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-md">
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
              <div className="space-y-2">
                <video
                  src={timelapseResult}
                  controls
                  className="w-full rounded-xl"
                />
                <a href={timelapseResult} download>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Скачать таймлапс
                  </Button>
                </a>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

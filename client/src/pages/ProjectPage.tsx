import { useEffect, useMemo, useRef, useState } from "react";
import { useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getStoredToken } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Loader2, Camera, FileText, ImageIcon, MessageSquare, Calendar, HardHat,
  Activity, Cpu, Trash2, Maximize, Download, CheckCircle2, Play, Pause,
  Fullscreen, Aperture, Send, Clock, Users, MoreHorizontal, X, ChevronRight, MapPin,
} from "lucide-react";
import Hls from "hls.js";
import { Link } from "wouter";

const statusLabels: Record<string, string> = {
  planned: "Запланирован",
  active: "В работе",
  done: "Выполнен",
  blocked: "Приостановлен",
};

const statusColors: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700 border-slate-200",
  active: "bg-blue-100 text-blue-700 border-blue-200",
  done: "bg-emerald-100 text-emerald-700 border-emerald-200",
  blocked: "bg-amber-100 text-amber-700 border-amber-200",
};

const docCategoryLabels: Record<string, string> = {
  contract: "Договор",
  drawing: "Чертеж",
  act: "Акт",
  estimate: "Смета",
  other: "Другое",
};

function classNames(...c: (string | false | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
    headers: { Authorization: `Bearer ${getStoredToken() ?? ""}` },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Ошибка загрузки");
  return data.url;
}

function daysLeft(end: Date | string | null | undefined): string {
  if (!end) return "—";
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `Просрочено ${Math.abs(diff)} дн.`;
  if (diff === 0) return "Сегодня срок";
  return `Осталось ${diff} дн.`;
}

function formatDate(d: string | Date | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ru-RU");
}

function useFullscreen(ref: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const handler = () => setActive(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);
  const toggle = async () => {
    if (!ref.current) return;
    try {
      if (!document.fullscreenElement) await ref.current.requestFullscreen();
      else await document.exitFullscreen();
    } catch (e) { console.warn(e); }
  };
  return { active, toggle };
}

function HlsPlayer({ src, className }: { src: string; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const { active, toggle } = useFullscreen(wrapperRef);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let hls: Hls | null = null;
    setError(false);

    const play = () => setIsPlaying(!video.paused);
    video.addEventListener("play", play);
    video.addEventListener("pause", play);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      video.play().catch(() => {});
    } else if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: false, maxBufferLength: 30 });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(true);
          hls?.destroy();
        }
      });
      video.play().catch(() => {});
    } else {
      setError(true);
    }

    return () => {
      hls?.destroy();
      video.removeEventListener("play", play);
      video.removeEventListener("pause", play);
    };
  }, [src]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.paused ? video.play().catch(() => {}) : video.pause();
  };

  return (
    <div ref={wrapperRef} className={classNames("relative bg-black rounded-xl overflow-hidden group", className)}>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm z-10 bg-black/80">
          Не удалось открыть поток
        </div>
      )}
      <video ref={videoRef} className="w-full h-full object-contain" playsInline muted={false} />
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={toggle}>
          <Fullscreen className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

export default function ProjectPage() {
  const [match, params] = useRoute("/projects/:id");
  const projectId = Number(params?.id);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("stages");
  const utils = trpc.useUtils();

  const project = trpc.projects.get.useQuery({ id: projectId }, { enabled: !!projectId });
  const stages = trpc.stages.list.useQuery({ projectId }, { enabled: !!projectId && activeTab === "stages" });
  const media = trpc.content.mediaList.useQuery({ projectId }, { enabled: !!projectId && activeTab === "media" });
  const docs = trpc.content.documentsList.useQuery({ projectId }, { enabled: !!projectId && activeTab === "docs" });
  const workLogs = trpc.content.workLogsList.useQuery({ projectId }, { enabled: !!projectId && activeTab === "logs" });
  const cams = trpc.cameras.list.useQuery({ projectId }, { enabled: !!projectId && activeTab === "cameras" });
  const chat = trpc.content.chatList.useQuery({ projectId }, { enabled: !!projectId && activeTab === "chat" });
  const activity = trpc.content.activityList.useQuery({ projectId }, { enabled: !!projectId && activeTab === "activity" });
  const aiReports = trpc.content.aiReportsList.useQuery({ projectId }, { enabled: !!projectId && activeTab === "ai" });

  const canEdit = user?.role === "director" || user?.role === "foreman";
  const isDirector = user?.role === "director";

  const handleRefetch = () => {
    utils.projects.get.invalidate({ id: projectId });
    utils.projects.list.invalidate();
  };

  if (!match || Number.isNaN(projectId)) return <div className="p-8 text-center">Некорректная ссылка</div>;
  if (project.isLoading) return <div className="p-8 text-center">Загрузка…</div>;
  if (!project.data) return <div className="p-8 text-center">Объект не найден</div>;

  const p = project.data;

  return (
    <div>
      <DashboardHeader title={p.name}>
        <Badge className={classNames(statusColors[p.status] ?? "bg-muted", "border")}>{statusLabels[p.status] ?? p.status}</Badge>
        <Badge variant="outline" className="hidden sm:inline-flex">{daysLeft(p.plannedEndDate)}</Badge>
      </DashboardHeader>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <StatCard icon={CheckCircle2} label="Прогресс" value={`${p.progressPercent}%`} />
        <StatCard icon={Calendar} label="Сдача" value={formatDate(p.plannedEndDate)} />
        <StatCard icon={Users} label="Участники" value={String((p.members?.length ?? 0) + 1)} />
        <StatCard icon={MapPin} label="Адрес" value={p.address || "—"} />
      </div>

      <div className="mb-6">
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={classNames(
              "h-full rounded-full transition-all",
              p.progressPercent >= 70 ? "bg-emerald-500" : p.progressPercent >= 30 ? "bg-amber-500" : "bg-destructive"
            )}
            style={{ width: `${p.progressPercent}%` }}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1 mb-4 p-1 bg-muted/50 rounded-xl">
          <TabTrigger value="stages" icon={CheckCircle2} label="Этапы" onSelect={setActiveTab} />
          <TabTrigger value="media" icon={ImageIcon} label="Медиа" onSelect={setActiveTab} />
          <TabTrigger value="docs" icon={FileText} label="Документы" onSelect={setActiveTab} />
          <TabTrigger value="logs" icon={HardHat} label="Журнал" onSelect={setActiveTab} />
          <TabTrigger value="cameras" icon={Camera} label="Камеры" onSelect={setActiveTab} />
          <TabTrigger value="chat" icon={MessageSquare} label="Чат" onSelect={setActiveTab} />
          <TabTrigger value="activity" icon={Activity} label="История" onSelect={setActiveTab} />
          <TabTrigger value="ai" icon={Cpu} label="AI" onSelect={setActiveTab} />
        </TabsList>

        <TabsContent value="stages">
          <ProjectStages projectId={projectId} stages={stages.data ?? []} isLoading={stages.isLoading} canEdit={canEdit} refetch={() => { stages.refetch(); handleRefetch(); }} />
        </TabsContent>
        <TabsContent value="media">
          <ProjectMedia projectId={projectId} media={media.data ?? []} canEdit={canEdit} refetch={() => media.refetch()} />
        </TabsContent>
        <TabsContent value="docs">
          <ProjectDocuments projectId={projectId} docs={docs.data ?? []} canEdit={canEdit} refetch={() => docs.refetch()} />
        </TabsContent>
        <TabsContent value="logs">
          <ProjectWorkLogs projectId={projectId} logs={workLogs.data ?? []} canEdit={canEdit} refetch={() => workLogs.refetch()} />
        </TabsContent>
        <TabsContent value="cameras">
          <ProjectCameras projectId={projectId} cameras={cams.data ?? []} canEdit={canEdit} refetch={() => cams.refetch()} />
        </TabsContent>
        <TabsContent value="chat">
          <ProjectChat projectId={projectId} messages={chat.data ?? []} refetch={() => chat.refetch()} />
        </TabsContent>
        <TabsContent value="activity">
          <ProjectActivity activity={activity.data ?? []} isLoading={activity.isLoading} />
        </TabsContent>
        <TabsContent value="ai">
          <ProjectAI projectId={projectId} reports={aiReports.data ?? []} refetch={() => aiReports.refetch()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TabTrigger({ value, icon: Icon, label, onSelect }: { value: string; icon: any; label: string; onSelect?: (v: string) => void }) {
  return (
    <TabsTrigger value={value} onClick={() => onSelect?.(value)} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-2 text-sm gap-2">
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </TabsTrigger>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="py-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
          <div className="font-semibold truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ──────────────── Stages ────────────────
function ProjectStages({ projectId, stages, isLoading, canEdit, refetch }: any) {
  const create = trpc.stages.create.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const update = trpc.stages.update.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const [name, setName] = useState("");

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    create.mutate({ projectId, name, orderIndex: stages.length });
    setName("");
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <form onSubmit={onCreate} className="flex gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Название этапа" />
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>
      )}
      {isLoading && <div>Загрузка…</div>}
      <div className="space-y-3">
        {stages.map((s: any) => (
          <Card key={s.id} className="hover:shadow-sm transition-shadow">
            <CardHeader className="py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold">{s.name}</CardTitle>
                  <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>План: {formatDate(s.plannedStart)} — {formatDate(s.plannedEnd)}</span>
                    {s.actualStart && <span>Факт старт: {formatDate(s.actualStart)}</span>}
                    {s.actualEnd && <span>Факт финиш: {formatDate(s.actualEnd)}</span>}
                  </div>
                </div>
                <Badge className={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mt-3">
                <div className="h-full rounded-full bg-primary" style={{ width: `${s.progressPercent}%` }} />
              </div>
              {canEdit && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Select value={s.status} onValueChange={(v: any) => update.mutate({ id: s.id, status: v })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Запланирован</SelectItem>
                      <SelectItem value="active">В работе</SelectItem>
                      <SelectItem value="done">Выполнен</SelectItem>
                      <SelectItem value="blocked">Приостановлен</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={s.progressPercent}
                    className="w-28"
                    onBlur={e => update.mutate({ id: s.id, progressPercent: Number(e.target.value) })}
                  />
                </div>
              )}
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ──────────────── Media ────────────────
function ProjectMedia({ projectId, media, canEdit, refetch }: any) {
  const create = trpc.content.mediaCreate.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      await create.mutateAsync({ projectId, type: file.type.startsWith("video") ? "video" : "photo", url, originalName: file.name, mimeType: file.type, size: file.size });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <>
          <input type="file" accept="image/*,video/*" ref={fileRef} className="hidden" onChange={onFile} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
            Загрузить файл
          </Button>
        </>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {media.map((m: any) => (
          <Card key={m.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setPreview(m.url)}>
            {m.type === "video" ? (
              <video src={m.url} className="w-full h-40 object-cover" />
            ) : (
              <img src={m.url} alt="" className="w-full h-40 object-cover" />
            )}
            <CardContent className="p-2 text-xs text-muted-foreground truncate">{m.originalName || m.url}</CardContent>
          </Card>
        ))}
      </div>
      {media.length === 0 && <EmptyState icon={ImageIcon} text="Нет медиафайлов" />}
      {preview && (
        <Dialog open={!!preview} onOpenChange={open => !open && setPreview(null)}>
          <DialogContent className="max-w-4xl p-1">
            {preview.endsWith(".mp4") || preview.endsWith(".webm") || preview.endsWith(".mov") ? (
              <video src={preview} controls className="w-full rounded-lg" />
            ) : (
              <img src={preview} alt="" className="w-full rounded-lg" />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ──────────────── Documents ────────────────
function ProjectDocuments({ projectId, docs, canEdit, refetch }: any) {
  const create = trpc.content.documentCreate.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      await create.mutateAsync({ projectId, category: "other", name: file.name, url, originalName: file.name, mimeType: file.type, size: file.size });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <>
          <input type="file" ref={fileRef} className="hidden" onChange={onFile} />
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Загрузить документ
          </Button>
        </>
      )}
      <div className="grid gap-3">
        {docs.map((d: any) => (
          <Card key={d.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">{docCategoryLabels[d.category] || "Другое"} · {formatBytes(d.size)}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <a href={d.url} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {docs.length === 0 && <EmptyState icon={FileText} text="Нет документов" />}
    </div>
  );
}

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} КБ`;
  return `${(kb / 1024).toFixed(1)} МБ`;
}

// ──────────────── Work logs ────────────────
function ProjectWorkLogs({ projectId, logs, canEdit, refetch }: any) {
  const create = trpc.content.workLogCreate.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [people, setPeople] = useState("");
  const [hours, setHours] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      projectId,
      date: new Date(date),
      description,
      peopleCount: people ? Number(people) : undefined,
      hours: hours ? Number(hours) : undefined,
    });
    setDescription("");
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[160px_1fr_120px_120px_auto] items-end">
          <div>
            <Label>Дата</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Что сделано</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание работ" />
          </div>
          <div>
            <Label>Чел.</Label>
            <Input value={people} onChange={e => setPeople(e.target.value)} placeholder="0" />
          </div>
          <div>
            <Label>Часы</Label>
            <Input value={hours} onChange={e => setHours(e.target.value)} placeholder="0" />
          </div>
          <Button type="submit" disabled={create.isPending} className="w-full md:w-auto">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>
      )}
      <div className="space-y-2">
        {logs.map((l: any) => (
          <Card key={l.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">{l.author?.name || "—"}</span>
                <span>{new Date(l.date).toLocaleDateString("ru-RU")}</span>
              </div>
              <p className="text-sm">{l.description}</p>
              {(l.peopleCount || l.hours) && (
                <div className="mt-2 text-xs text-muted-foreground flex gap-3">
                  {l.peopleCount ? <span>{l.peopleCount} чел.</span> : null}
                  {l.hours ? <span>{l.hours} ч</span> : null}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {logs.length === 0 && <EmptyState icon={HardHat} text="Записей пока нет" />}
    </div>
  );
}

// ──────────────── Cameras ────────────────
function ProjectCameras({ projectId, cameras, canEdit, refetch }: any) {
  const create = trpc.cameras.create.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const snapshot = trpc.cameras.createSnapshot.useMutation({
    onSuccess: () => toast.success("Снимок сохранен"),
    onError: (e: any) => toast.error(e.message),
  });
  const remove = trpc.cameras.delete.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ projectId, name, rtspUrl: url });
    setName("");
    setUrl("");
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline"><Camera className="mr-2 h-4 w-4" /> Добавить камеру</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новая камера</DialogTitle></DialogHeader>
            <form onSubmit={onCreate} className="space-y-3">
              <div>
                <Label>Название</Label>
                <Input placeholder="Например, Въезд" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <Label>RTSP URL</Label>
                <Input placeholder="rtsp://user:pass@192.168.1.100/stream1" value={url} onChange={e => setUrl(e.target.value)} required />
              </div>
              <Button type="submit" disabled={create.isPending}>Сохранить</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {cameras.map((cam: any) => (
          <Card key={cam.id}>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">{cam.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => snapshot.mutate({ cameraId: cam.id })} title="Снимок">
                    <Aperture className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button variant="ghost" size="icon" onClick={() => remove.mutate({ id: cam.id })} title="Удалить">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {cam.hlsUrl ? (
                <HlsPlayer src={cam.hlsUrl} className="aspect-video bg-black rounded-lg" />
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">Нет потока</div>
              )}
              <div className="text-xs text-muted-foreground break-all">{cam.rtspUrl}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {cameras.length === 0 && <EmptyState icon={Camera} text="Камеры еще не добавлены" />}
    </div>
  );
}

// ──────────────── Chat ────────────────
function ProjectChat({ projectId, messages, refetch }: any) {
  const { user } = useAuth();
  const send = trpc.content.chatSend.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    send.mutate({ projectId, content: text.trim() });
    setText("");
  };

  return (
    <div className="flex flex-col h-[60vh] bg-card rounded-xl border p-3">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.sender?.id === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.sender?.id === user?.id ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
              <div className="text-xs opacity-80 mb-1 flex items-center gap-2">
                <span>{m.sender?.name || "Система"}</span>
                <span className="opacity-60">{new Date(m.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
        {messages.length === 0 && <EmptyState icon={MessageSquare} text="Начните переписку по объекту" />}
      </div>
      <form onSubmit={onSend} className="flex gap-2 mt-3 pt-3 border-t">
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="Сообщение…" />
        <Button type="submit" disabled={send.isPending}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}

// ──────────────── Activity ────────────────
function ProjectActivity({ activity, isLoading }: any) {
  if (isLoading) return <div>Загрузка…</div>;
  return (
    <div className="space-y-2">
      {activity.map((a: any) => (
        <Card key={a.id}>
          <CardContent className="py-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <div className="font-medium text-sm">{a.action}</div>
                <div className="text-xs text-muted-foreground">{a.actor?.name || "Система"}</div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground whitespace-nowrap">{new Date(a.createdAt).toLocaleString("ru-RU")}</div>
          </CardContent>
        </Card>
      ))}
      {activity.length === 0 && <EmptyState icon={Activity} text="История пуста" />}
    </div>
  );
}

// ──────────────── AI ────────────────
function ProjectAI({ projectId, reports, refetch }: any) {
  const generate = trpc.content.aiReportGenerate.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const [type, setType] = useState<"daily" | "weekly" | "summary">("daily");
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={type} onValueChange={(v: any) => setType(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Дневной</SelectItem>
            <SelectItem value="weekly">Недельный</SelectItem>
            <SelectItem value="summary">Сводный</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => generate.mutate({ projectId, type })} disabled={generate.isPending}>
          {generate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cpu className="mr-2 h-4 w-4" />}
          Сгенерировать отчет
        </Button>
      </div>
      <div className="space-y-3">
        {reports.map((r: any) => (
          <Card key={r.id}>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">Отчет {r.reportType}</CardTitle>
                <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString("ru-RU")}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-xl">{r.content}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {reports.length === 0 && <EmptyState icon={Cpu} text="Нажмите «Сгенерировать отчет», чтобы получить AI-аналитику" />}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <Icon className="h-14 w-14 mb-4 opacity-20" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

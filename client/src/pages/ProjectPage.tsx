import { useEffect, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HlsPlayer } from "@/components/HlsPlayer";
import { toast } from "sonner";
import {
  Plus, Loader2, Camera, FileText, ImageIcon, MessageSquare, Calendar, HardHat,
  Activity, Cpu, Trash2, Download, CheckCircle2, Aperture, Send, Users, MapPin,
} from "lucide-react";
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

function formatBytes(bytes?: number) {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} КБ`;
  return `${(kb / 1024).toFixed(1)} МБ`;
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

  if (!match || Number.isNaN(projectId)) return <div className="p-8 text-center text-muted-foreground">Некорректная ссылка</div>;
  if (project.isLoading) return <div className="p-8 text-center text-muted-foreground">Загрузка…</div>;
  if (!project.data) return <div className="p-8 text-center text-muted-foreground">Объект не найден</div>;

  const p = project.data;

  return (
    <div>
      <DashboardHeader title={p.name}>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={classNames(statusColors[p.status] ?? "bg-muted", "border font-medium px-2.5 py-1")}>{statusLabels[p.status] ?? p.status}</Badge>
          <Badge variant="outline" className="hidden sm:inline-flex font-medium px-2.5 py-1">{daysLeft(p.plannedEndDate)}</Badge>
        </div>
      </DashboardHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard icon={CheckCircle2} label="Прогресс" value={`${p.progressPercent}%`} />
        <StatCard icon={Calendar} label="Сдача" value={formatDate(p.plannedEndDate)} />
        <StatCard icon={Users} label="Участники" value={String((p.members?.length ?? 0) + 1)} />
        <StatCard icon={MapPin} label="Адрес" value={p.address || "—"} />
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between text-sm font-medium mb-2">
          <span className="text-muted-foreground">Общий прогресс объекта</span>
          <span className="font-bold">{p.progressPercent}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-muted overflow-hidden shadow-inner">
          <div
            className={classNames(
              "h-full rounded-full transition-all duration-500",
              p.progressPercent >= 70 ? "bg-emerald-500" : p.progressPercent >= 30 ? "bg-amber-500" : "bg-destructive"
            )}
            style={{ width: `${p.progressPercent}%` }}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1.5 mb-6 p-1.5 bg-muted/60 rounded-2xl">
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
    <TabsTrigger
      value={value}
      onClick={() => onSelect?.(value)}
      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-xl px-3 py-2 text-sm font-semibold gap-2 transition-all"
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </TabsTrigger>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="py-5 flex items-center gap-4">
        <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">{label}</div>
          <div className="font-bold truncate">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectStages({ projectId, stages, isLoading, canEdit, refetch }: any) {
  const create = trpc.stages.create.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const update = trpc.stages.update.useMutation({ onSuccess: refetch, onError: (e: any) => toast.error(e.message) });
  const [name, setName] = useState("");

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate({ projectId, name: name.trim(), orderIndex: stages.length });
    setName("");
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <form onSubmit={onCreate} className="flex gap-2">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Название этапа" className="h-11 rounded-xl" />
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>
      )}
      {isLoading && <div className="text-muted-foreground font-medium">Загрузка этапов…</div>}
      <div className="space-y-3">
        {stages.map((s: any) => (
          <Card key={s.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="py-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base font-bold mb-1">{s.name}</CardTitle>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> План: {formatDate(s.plannedStart)} — {formatDate(s.plannedEnd)}</span>
                    {s.actualStart && <span>Факт старт: {formatDate(s.actualStart)}</span>}
                    {s.actualEnd && <span>Факт финиш: {formatDate(s.actualEnd)}</span>}
                  </div>
                </div>
                <Badge className={classNames(statusColors[s.status], "border shrink-0 font-medium")}>{statusLabels[s.status]}</Badge>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm font-medium mb-1.5">
                  <span className="text-muted-foreground">Выполнено</span>
                  <span className="font-bold">{s.progressPercent}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${s.progressPercent}%` }} />
                </div>
              </div>
              {canEdit && (
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t">
                  <Select value={s.status} onValueChange={(v: any) => update.mutate({ id: s.id, status: v })}>
                    <SelectTrigger className="w-44 h-10 rounded-lg">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Запланирован</SelectItem>
                      <SelectItem value="active">В работе</SelectItem>
                      <SelectItem value="done">Выполнен</SelectItem>
                      <SelectItem value="blocked">Приостановлен</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground font-medium">%</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={s.progressPercent}
                      className="w-24 h-10 rounded-lg"
                      onBlur={e => update.mutate({ id: s.id, progressPercent: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {!isLoading && stages.length === 0 && <EmptyState icon={CheckCircle2} text="Этапы не добавлены" subtext="Создайте первый этап строительства" />}
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {media.map((m: any) => (
          <Card key={m.id} className="overflow-hidden cursor-pointer group border border-border/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300" onClick={() => setPreview(m.url)}>
            <div className="relative aspect-square overflow-hidden bg-muted">
              {m.type === "video" ? (
                <video src={m.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <img src={m.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <CardContent className="p-3">
              <div className="text-xs font-medium truncate">{m.originalName || "Медиафайл"}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(m.createdAt).toLocaleDateString("ru-RU")}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {media.length === 0 && <EmptyState icon={ImageIcon} text="Нет медиафайлов" subtext="Загрузите фото и видео с объекта" />}
      {preview && (
        <Dialog open={!!preview} onOpenChange={open => !open && setPreview(null)}>
          <DialogContent className="max-w-4xl p-1 rounded-2xl">
            {preview.endsWith(".mp4") || preview.endsWith(".webm") || preview.endsWith(".mov") ? (
              <video src={preview} controls className="w-full rounded-xl" />
            ) : (
              <img src={preview} alt="" className="w-full rounded-xl" />
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
          <Card key={d.id} className="border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="flex items-center justify-between py-4 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground">
                    <span className="inline-block mr-2 px-1.5 py-0.5 rounded-md bg-muted text-[10px] font-medium uppercase tracking-wide">{docCategoryLabels[d.category] || "Другое"}</span>
                    {formatBytes(d.size)}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild className="rounded-full shrink-0">
                <a href={d.url} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {docs.length === 0 && <EmptyState icon={FileText} text="Нет документов" subtext="Добавьте договоры, чертежи, акты и сметы" />}
    </div>
  );
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
    if (!description.trim()) return toast.error("Опишите выполненную работу");
    create.mutate({
      projectId,
      date: new Date(date),
      description: description.trim(),
      peopleCount: people ? Number(people) : undefined,
      hours: hours ? Number(hours) : undefined,
    });
    setDescription("");
    setPeople("");
    setHours("");
  };

  return (
    <div className="space-y-4">
      {canEdit && (
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-[160px_1fr_100px_100px_auto] items-end">
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Дата</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-11 rounded-xl mt-1.5" />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Что сделано</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание работ" className="h-11 rounded-xl mt-1.5" />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Чел.</Label>
            <Input value={people} onChange={e => setPeople(e.target.value)} placeholder="0" className="h-11 rounded-xl mt-1.5" />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Часы</Label>
            <Input value={hours} onChange={e => setHours(e.target.value)} placeholder="0" className="h-11 rounded-xl mt-1.5" />
          </div>
          <Button type="submit" disabled={create.isPending} className="w-full md:w-auto h-11">
            {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </Button>
        </form>
      )}
      <div className="space-y-3">
        {logs.map((l: any) => (
          <Card key={l.id} className="border border-border/50 shadow-sm">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-3 text-sm mb-2">
                <span className="font-bold text-foreground">{l.author?.name || "—"}</span>
                <span className="text-xs text-muted-foreground font-medium">{new Date(l.date).toLocaleDateString("ru-RU")}</span>
              </div>
              <p className="text-sm text-foreground/90">{l.description}</p>
              {(l.peopleCount || l.hours) && (
                <div className="mt-3 flex gap-3 text-xs font-medium text-muted-foreground">
                  {l.peopleCount ? <span className="px-2 py-1 rounded-md bg-muted">{l.peopleCount} чел.</span> : null}
                  {l.hours ? <span className="px-2 py-1 rounded-md bg-muted">{l.hours} ч</span> : null}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {logs.length === 0 && <EmptyState icon={HardHat} text="Записей пока нет" subtext="Журнал работ поможет отслеживать ход строительства" />}
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
    if (!name.trim() || !url.trim()) return;
    create.mutate({ projectId, name: name.trim(), rtspUrl: url.trim() });
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
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader><DialogTitle className="text-xl">Новая камера</DialogTitle></DialogHeader>
            <form onSubmit={onCreate} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input placeholder="Например, Въезд" value={name} onChange={e => setName(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>RTSP URL</Label>
                <Input placeholder="rtsp://user:pass@192.168.1.100/stream1" value={url} onChange={e => setUrl(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <Button type="submit" disabled={create.isPending} className="w-full">Сохранить</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {cameras.map((cam: any) => (
          <Card key={cam.id} className="border border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" /> {cam.name}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => snapshot.mutate({ cameraId: cam.id })} title="Снимок">
                    <Aperture className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button variant="ghost" size="icon" className="rounded-full text-destructive hover:text-destructive" onClick={() => remove.mutate({ id: cam.id })} title="Удалить">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-5">
              {cam.hlsUrl ? (
                <HlsPlayer src={cam.hlsUrl} className="aspect-video bg-black rounded-xl" />
              ) : (
                <div className="aspect-video bg-muted rounded-xl flex flex-col items-center justify-center text-muted-foreground text-sm gap-2">
                  <Camera className="h-8 w-8 opacity-40" /> Нет потока
                </div>
              )}
              <div className="text-xs text-muted-foreground break-all font-mono bg-muted/50 p-2 rounded-lg">{cam.rtspUrl}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {cameras.length === 0 && <EmptyState icon={Camera} text="Камеры еще не добавлены" subtext="Подключите IP-камеру по RTSP" />}
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
    <div className="flex flex-col h-[65vh] bg-card rounded-2xl border border-border/50 shadow-sm p-3">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.sender?.id === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.sender?.id === user?.id ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
              <div className={`text-xs mb-1 flex items-center gap-2 ${m.sender?.id === user?.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                <span className="font-semibold">{m.sender?.name || "Система"}</span>
                <span className="opacity-70">{new Date(m.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="leading-relaxed">{m.content}</div>
            </div>
          </div>
        ))}
        {messages.length === 0 && <EmptyState icon={MessageSquare} text="Начните переписку по объекту" subtext="Сообщения видны всем участникам объекта" />}
      </div>
      <form onSubmit={onSend} className="flex gap-2 mt-3 pt-3 border-t">
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="Сообщение…" className="h-11 rounded-xl" />
        <Button type="submit" disabled={send.isPending}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}

// ──────────────── Activity ────────────────
function ProjectActivity({ activity, isLoading }: any) {
  if (isLoading) return <div className="text-muted-foreground font-medium">Загрузка…</div>;
  return (
    <div className="space-y-3">
      {activity.map((a: any, i: number) => (
        <div key={a.id} className="relative flex gap-4">
          {i !== activity.length - 1 && <div className="absolute left-[15px] top-8 bottom-[-12px] w-px bg-border" />}
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 z-10">
            <Activity className="h-4 w-4" />
          </div>
          <Card className="flex-1 border border-border/50 shadow-sm">
            <CardContent className="py-3.5 flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-sm">{a.action}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.actor?.name || "Система"}</div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap font-medium">{new Date(a.createdAt).toLocaleString("ru-RU")}</div>
            </CardContent>
          </Card>
        </div>
      ))}
      {activity.length === 0 && <EmptyState icon={Activity} text="История пуста" subtext="Здесь будут фиксироваться все изменения по объекту" />}
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
          <SelectTrigger className="w-44 h-11 rounded-xl">
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
          <Card key={r.id} className="border border-border/50 shadow-sm">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base font-bold">Отчет {r.reportType}</CardTitle>
                <div className="text-xs text-muted-foreground font-medium whitespace-nowrap">{new Date(r.createdAt).toLocaleString("ru-RU")}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm bg-muted/50 p-5 rounded-xl leading-relaxed">{r.content}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      {reports.length === 0 && <EmptyState icon={Cpu} text="Нажмите «Сгенерировать отчет»" subtext="AI проанализирует этапы, журнал и камеры объекта" />}
    </div>
  );
}

function EmptyState({ icon: Icon, text, subtext }: { icon: any; text: string; subtext?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-5">
        <Icon className="h-10 w-10 opacity-40" />
      </div>
      <p className="text-lg font-bold text-foreground">{text}</p>
      {subtext && <p className="text-sm mt-1 text-center max-w-sm">{subtext}</p>}
    </div>
  );
}

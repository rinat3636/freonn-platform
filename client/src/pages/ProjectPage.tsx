import { useMemo, useRef, useState } from "react";
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
import { Plus, Loader2, Camera, FileText, ImageIcon, MessageSquare, Calendar, HardHat, Activity, Cpu, Trash2, Maximize, Download } from "lucide-react";

const statusLabels: Record<string, string> = {
  planned: "Запланирован",
  active: "В работе",
  done: "Выполнен",
  blocked: "Приостановлен",
};

const statusColors: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700",
  active: "bg-blue-100 text-blue-700",
  done: "bg-emerald-100 text-emerald-700",
  blocked: "bg-amber-100 text-amber-700",
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

export default function ProjectPage() {
  const [match, params] = useRoute("/projects/:id");
  const projectId = Number(params?.id);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("stages");
  const utils = trpc.useUtils();

  const project = trpc.projects.get.useQuery({ id: projectId }, { enabled: !!projectId });
  const stages = trpc.stages.list.useQuery({ projectId }, { enabled: activeTab === "stages" });
  const media = trpc.content.mediaList.useQuery({ projectId }, { enabled: activeTab === "media" });
  const docs = trpc.content.documentsList.useQuery({ projectId }, { enabled: activeTab === "docs" });
  const workLogs = trpc.content.workLogsList.useQuery({ projectId }, { enabled: activeTab === "logs" });
  const cams = trpc.cameras.list.useQuery({ projectId }, { enabled: activeTab === "cameras" });
  const chat = trpc.content.chatList.useQuery({ projectId }, { enabled: activeTab === "chat" });
  const activity = trpc.content.activityList.useQuery({ projectId }, { enabled: activeTab === "activity" });
  const aiReports = trpc.content.aiReportsList.useQuery({ projectId }, { enabled: activeTab === "ai" });

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
        <Badge className={statusColors[p.status] ?? "bg-muted"}>{p.status}</Badge>
        <Badge variant="outline">{daysLeft(p.plannedEndDate)}</Badge>
        <div className="text-sm text-muted-foreground">{p.progressPercent}% выполнено</div>
      </DashboardHeader>

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
        <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
          <TabsTrigger value="stages">Этапы</TabsTrigger>
          <TabsTrigger value="media">Фото/Видео</TabsTrigger>
          <TabsTrigger value="docs">Документы</TabsTrigger>
          <TabsTrigger value="logs">Журнал работ</TabsTrigger>
          <TabsTrigger value="cameras">Камеры</TabsTrigger>
          <TabsTrigger value="chat">Чат</TabsTrigger>
          <TabsTrigger value="activity">История</TabsTrigger>
          <TabsTrigger value="ai">AI отчет</TabsTrigger>
        </TabsList>

        <TabsContent value="stages">
          <ProjectStages
            projectId={projectId}
            stages={stages.data ?? []}
            isLoading={stages.isLoading}
            canEdit={canEdit}
            refetch={() => { stages.refetch(); handleRefetch(); }}
          />
        </TabsContent>

        <TabsContent value="media">
          <ProjectMedia
            projectId={projectId}
            media={media.data ?? []}
            canEdit={canEdit}
            refetch={() => media.refetch()}
          />
        </TabsContent>

        <TabsContent value="docs">
          <ProjectDocuments
            projectId={projectId}
            docs={docs.data ?? []}
            canEdit={canEdit}
            refetch={() => docs.refetch()}
          />
        </TabsContent>

        <TabsContent value="logs">
          <ProjectWorkLogs
            projectId={projectId}
            logs={workLogs.data ?? []}
            canEdit={canEdit}
            refetch={() => workLogs.refetch()}
          />
        </TabsContent>

        <TabsContent value="cameras">
          <ProjectCameras
            projectId={projectId}
            cameras={cams.data ?? []}
            canEdit={canEdit}
            refetch={() => cams.refetch()}
          />
        </TabsContent>

        <TabsContent value="chat">
          <ProjectChat
            projectId={projectId}
            messages={chat.data ?? []}
            refetch={() => chat.refetch()}
          />
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

// ──────────────── Stages ────────────────
function ProjectStages({ projectId, stages, isLoading, canEdit, refetch }: any) {
  const create = trpc.stages.create.useMutation({ onSuccess: refetch, onError: e => toast.error(e.message) });
  const update = trpc.stages.update.useMutation({ onSuccess: refetch, onError: e => toast.error(e.message) });
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
          <Card key={s.id}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{s.name}</CardTitle>
                <Badge className={statusColors[s.status]}>{statusLabels[s.status]}</Badge>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden mt-2">
                <div className="h-full rounded-full bg-primary" style={{ width: `${s.progressPercent}%` }} />
              </div>
              {canEdit && (
                <div className="flex flex-wrap gap-2 mt-3">
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
  const create = trpc.content.mediaCreate.useMutation({ onSuccess: refetch, onError: e => toast.error(e.message) });
  const [uploading, setUploading] = useState(false);
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
          <Card key={m.id} className="overflow-hidden">
            {m.type === "video" ? (
              <video src={m.url} controls className="w-full h-40 object-cover" />
            ) : (
              <img src={m.url} alt="" className="w-full h-40 object-cover" />
            )}
            <CardContent className="p-2 text-xs text-muted-foreground truncate">{m.originalName || m.url}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ──────────────── Documents ────────────────
function ProjectDocuments({ projectId, docs, canEdit, refetch }: any) {
  const create = trpc.content.documentCreate.useMutation({ onSuccess: refetch, onError: e => toast.error(e.message) });
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
      <div className="space-y-2">
        {docs.map((d: any) => (
          <Card key={d.id}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{d.name}</span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href={d.url} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ──────────────── Work logs ────────────────
function ProjectWorkLogs({ projectId, logs, canEdit, refetch }: any) {
  const create = trpc.content.workLogCreate.useMutation({ onSuccess: refetch, onError: e => toast.error(e.message) });
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
        <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-4 items-end">
          <div>
            <Label>Дата</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>Что сделано</Label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Описание" />
          </div>
          <div className="flex gap-2">
            <Input value={people} onChange={e => setPeople(e.target.value)} placeholder="Чел." />
            <Input value={hours} onChange={e => setHours(e.target.value)} placeholder="Часы" />
            <Button type="submit" disabled={create.isPending}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
      <div className="space-y-2">
        {logs.map((l: any) => (
          <Card key={l.id}>
            <CardContent className="py-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                <span>{new Date(l.date).toLocaleDateString("ru-RU")}</span>
                <span>{l.author?.name || "—"}</span>
              </div>
              <p>{l.description}</p>
              {(l.peopleCount || l.hours) && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {l.peopleCount ? `${l.peopleCount} чел.` : ""} {l.hours ? `${l.hours} ч` : ""}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ──────────────── Cameras ────────────────
function ProjectCameras({ projectId, cameras, canEdit, refetch }: any) {
  const create = trpc.cameras.create.useMutation({ onSuccess: refetch, onError: e => toast.error(e.message) });
  const snapshot = trpc.cameras.createSnapshot.useMutation({ onSuccess: data => toast.success("Снимок сохранен"), onError: e => toast.error(e.message) });
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
              <Input placeholder="Название" value={name} onChange={e => setName(e.target.value)} required />
              <Input placeholder="RTSP URL" value={url} onChange={e => setUrl(e.target.value)} required />
              <Button type="submit" disabled={create.isPending}>Сохранить</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {cameras.map((cam: any) => (
          <Card key={cam.id}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{cam.name}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => snapshot.mutate({ cameraId: cam.id })}>
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {cam.hlsUrl ? (
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video src={cam.hlsUrl} controls className="w-full h-full" />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-black/50 text-white" onClick={() => window.open(cam.hlsUrl, "_blank")}>
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground text-sm">Нет потока</div>
              )}
              <div className="mt-2 text-xs text-muted-foreground break-all">{cam.rtspUrl}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ──────────────── Chat ────────────────
function ProjectChat({ projectId, messages, refetch }: any) {
  const { user } = useAuth();
  const send = trpc.content.chatSend.useMutation({ onSuccess: refetch, onError: e => toast.error(e.message) });
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    send.mutate({ projectId, content: text.trim() });
    setText("");
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-2">
        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.sender?.id === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${m.sender?.id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <div className="text-xs opacity-70 mb-1">{m.sender?.name || "Система"}</div>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={onSend} className="flex gap-2 mt-4 pt-4 border-t">
        <Input value={text} onChange={e => setText(e.target.value)} placeholder="Сообщение…" />
        <Button type="submit" disabled={send.isPending}><MessageSquare className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}

// user undefined in chat component. Need outer user. We'll pass user or use auth hook inside.
// Fix below by moving user inside component.

// ──────────────── Activity ────────────────
function ProjectActivity({ activity, isLoading }: any) {
  if (isLoading) return <div>Загрузка…</div>;
  return (
    <div className="space-y-2">
      {activity.map((a: any) => (
        <Card key={a.id}>
          <CardContent className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{a.action}</div>
              <div className="text-xs text-muted-foreground">{a.actor?.name || "Система"}</div>
            </div>
            <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString("ru-RU")}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ──────────────── AI ────────────────
function ProjectAI({ projectId, reports, refetch }: any) {
  const generate = trpc.content.aiReportGenerate.useMutation({ onSuccess: refetch, onError: e => toast.error(e.message) });
  return (
    <div className="space-y-4">
      <Button onClick={() => generate.mutate({ projectId, type: "daily" })} disabled={generate.isPending}>
        {generate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cpu className="mr-2 h-4 w-4" />}
        Сгенерировать отчет
      </Button>
      <div className="space-y-3">
        {reports.map((r: any) => (
          <Card key={r.id}>
            <CardHeader className="py-3">
              <CardTitle className="text-base">Отчет {r.reportType}</CardTitle>
              <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString("ru-RU")}</div>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-lg">{r.content}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Suspense, lazy, useState } from "react";
import { useRoute } from "wouter";
import {
  Camera,
  Cpu,
  FileText,
  ImageIcon,
  MessageSquare,
  Sparkles,
  Timer,
  Users,
  Video,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DashboardHeader } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { classNames, daysLeft } from "@/lib/format";

const ObjectDashboard = lazy(() => import("@/components/project/ObjectDashboard"));
const ConstructionTimeline = lazy(() => import("@/components/project/ConstructionTimeline"));
const ConstructionFeed = lazy(() => import("@/components/project/ConstructionFeed"));
const StagePhotos = lazy(() => import("@/components/project/StagePhotos"));
const CamerasPanel = lazy(() => import("@/components/project/CamerasPanel"));
const ProjectDocuments = lazy(() => import("@/components/project/ProjectDocuments"));
const ProjectChat = lazy(() => import("@/components/project/ProjectChat"));
const AIAssistant = lazy(() => import("@/components/project/AIAssistant"));
const ProjectTeam = lazy(() => import("@/components/project/ProjectTeam"));

function PanelLoader() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="text-muted-foreground">Загрузка раздела…</div>
    </div>
  );
}

const tabs = [
  { value: "overview", label: "Обзор", icon: Sparkles },
  { value: "timeline", label: "Таймлайн", icon: Timer },
  { value: "feed", label: "Лента", icon: Video },
  { value: "photos", label: "Фото", icon: ImageIcon },
  { value: "cameras", label: "Камеры", icon: Camera },
  { value: "documents", label: "Документы", icon: FileText },
  { value: "chat", label: "Чат", icon: MessageSquare },
  { value: "team", label: "Команда", icon: Users },
  { value: "ai", label: "AI", icon: Cpu },
];
const statusLabels: Record<string, string> = {
  active: "Активный",
  paused: "На паузе",
  completed: "Завершён",
  cancelled: "Отменён",
};
const statusColors: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  paused: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function ProjectPage() {
  const [match, params] = useRoute("/projects/:id");
  const projectId = Number(params?.id);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const project = trpc.projects.get.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );
  const canEdit = user?.role === "director" || user?.role === "foreman";
  const canPlan = user?.role === "director";
  if (!match || Number.isNaN(projectId))
    return (
      <div className="p-8 text-center text-muted-foreground">
        Некорректная ссылка
      </div>
    );
  if (project.isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Загрузка объекта…
      </div>
    );
  if (!project.data)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Объект не найден
      </div>
    );
  const p = project.data;
  const participantCandidates: Array<{
    id: number;
    name: string;
    role: string;
  } | null> = [
    ...p.members.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
    })),
    p.director && {
      id: p.director.id,
      name: p.director.name,
      role: p.director.role,
    },
    p.foreman && {
      id: p.foreman.id,
      name: p.foreman.name,
      role: p.foreman.role,
    },
    p.customer && {
      id: p.customer.id,
      name: p.customer.name,
      role: p.customer.role,
    },
  ];
  const participants = Array.from(
    new Map(
      participantCandidates
        .filter((participant): participant is NonNullable<typeof participant> =>
          Boolean(participant)
        )
        .map(participant => [participant.id, participant] as const)
    ).values()
  );
  return (
    <div>
      <DashboardHeader title={p.name}>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            className={classNames(
              "border px-2.5 py-1",
              statusColors[p.status] || "bg-muted"
            )}
          >
            {statusLabels[p.status] || p.status}
          </Badge>
          <Badge variant="outline" className="px-2.5 py-1">
            {daysLeft(p.plannedEndDate)}
          </Badge>
        </div>
      </DashboardHeader>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="pb-28">
          <TabsContent value="overview">
            <Suspense fallback={<PanelLoader />}>
              <ObjectDashboard
                projectId={projectId}
                setActiveTab={setActiveTab}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="timeline">
            <Suspense fallback={<PanelLoader />}>
              <ConstructionTimeline
                projectId={projectId}
                canEdit={canEdit}
                canPlan={canPlan}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="feed">
            <Suspense fallback={<PanelLoader />}>
              <ConstructionFeed projectId={projectId} canEdit={canEdit} />
            </Suspense>
          </TabsContent>
          <TabsContent value="photos">
            <Suspense fallback={<PanelLoader />}>
              <StagePhotos
                projectId={projectId}
                canEdit={canEdit}
                canPlan={canPlan}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="cameras">
            <Suspense fallback={<PanelLoader />}>
              <CamerasPanel projectId={projectId} canPlan={canPlan} />
            </Suspense>
          </TabsContent>
          <TabsContent value="documents">
            <Suspense fallback={<PanelLoader />}>
              <ProjectDocuments
                projectId={projectId}
                canEdit={canEdit}
                canPlan={canPlan}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="chat">
            <Suspense fallback={<PanelLoader />}>
              <ProjectChat
                projectId={projectId}
                projectName={p.name}
                participants={participants}
                isActive={activeTab === "chat"}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="team">
            <Suspense fallback={<PanelLoader />}>
              <ProjectTeam
                projectId={projectId}
                canManage={user?.role === "director"}
              />
            </Suspense>
          </TabsContent>
          <TabsContent value="ai">
            <Suspense fallback={<PanelLoader />}>
              <AIAssistant projectId={projectId} />
            </Suspense>
          </TabsContent>
        </div>
        <TabsList className="fixed bottom-0 left-0 right-0 z-40 flex h-auto w-full flex-nowrap overflow-x-auto rounded-t-2xl border-t border-border/60 bg-card/95 p-2 shadow-[0_-8px_24px_-18px_rgba(16,18,25,0.35)] backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:left-64">
          <div className="mx-auto flex min-w-max max-w-3xl flex-nowrap gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="min-w-[4.75rem] shrink-0 flex-col gap-1 rounded-xl px-3 py-2 text-[11px] font-semibold text-muted-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </div>
        </TabsList>
      </Tabs>
    </div>
  );
}

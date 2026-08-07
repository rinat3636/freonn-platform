import { useMemo } from "react";
import {
  Activity,
  Building2,
  Camera,
  CheckCircle2,
  FileText,
  ImageIcon,
  MapPin,
  Users,
  HardHat,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { formatDate, classNames } from "@/lib/format";
import ConstructionTimer from "./ConstructionTimer";

const statusLabels: Record<string, string> = {
  planned: "Запланирован",
  active: "В работе",
  done: "Выполнен",
  blocked: "Заблокирован",
};
const kindIcons: Record<string, any> = {
  worklog: HardHat,
  photo: ImageIcon,
  video: Camera,
  document: FileText,
  stage: CheckCircle2,
};

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="truncate text-lg font-bold">{value}</div>
      </div>
    </div>
  );
}

export default function ObjectDashboard({
  projectId,
  setActiveTab,
}: {
  projectId: number;
  setActiveTab: (tab: string) => void;
}) {
  const overview = trpc.projects.overview.useQuery({ id: projectId });
  const feed = trpc.content.feed.useQuery({ projectId, limit: 12 });
  const p = overview.data;
  const recent = useMemo(() => feed.data?.slice(0, 6) ?? [], [feed.data]);
  if (overview.isLoading)
    return (
      <div className="py-12 text-center text-muted-foreground">
        Загрузка обзора…
      </div>
    );
  if (!p)
    return (
      <div className="py-12 text-center text-muted-foreground">
        Данные объекта недоступны
      </div>
    );
  return (
    <div className="space-y-6">
      <ConstructionTimer project={p} />
      <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1">
        <Stat icon={CheckCircle2} label="Прогресс" value={`${p.progressPercent}%`} />
        <Stat icon={ImageIcon} label="Фото" value={String(p.counts.photos)} />
        <Stat icon={FileText} label="Документы" value={String(p.counts.documents)} />
        <Stat icon={Camera} label="Камеры" value={String(p.counts.cameras)} />
        <Stat icon={Building2} label="Этапы" value={`${p.counts.stagesDone}/${p.counts.stagesTotal}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Ближайший этап</CardTitle>
            <Building2 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {p.nextStage ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-lg">{p.nextStage.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(p.nextStage.plannedStart)} —{" "}
                      {formatDate(p.nextStage.plannedEnd)}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {statusLabels[p.nextStage.status]}
                  </Badge>
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Готовность</span>
                    <strong>{p.nextStage.progressPercent}%</strong>
                  </div>
                  <Progress value={p.nextStage.progressPercent} />
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                Этапы еще не добавлены
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Информация об объекте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Статус</span>
              <Badge variant="outline">
                {p.status === "active" ? "Активный" : p.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>{p.address || "Адрес не указан"}</span>
            </div>
            <div className="flex gap-2">
              <Users className="h-4 w-4 shrink-0 text-primary" />
              <span>Заказчик: {p.customer?.name || "Не назначен"}</span>
            </div>
            <div className="flex gap-2">
              <HardHat className="h-4 w-4 shrink-0 text-primary" />
              <span>Прораб: {p.foreman?.name || "Не назначен"}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Последние действия</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("feed")}
          >
            Вся лента <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {recent.length ? (
            recent.map(item => {
              const Icon = kindIcons[item.kind] ?? Activity;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-muted/50"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">
                      {item.title}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {item.authorName || "Система"} ·{" "}
                      {new Date(item.createdAt).toLocaleString("ru-RU")}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Активность пока не зафиксирована
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

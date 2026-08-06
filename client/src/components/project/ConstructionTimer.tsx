import { CalendarClock, CheckCircle2, Clock3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default function ConstructionTimer({ project }: { project: any }) {
  const overdue = project.daysLeft !== null && project.daysLeft < 0;
  const risk = {
    on_track: {
      label: "По графику",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    at_risk: {
      label: "Риск срыва",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    overdue: {
      label: "Просрочка",
      className: "bg-red-100 text-red-700 border-red-200",
    },
  }[project.risk as string] ?? {
    label: "По графику",
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Card className="overflow-hidden rounded-2xl border border-border/50 shadow-sm bg-gradient-to-br from-foreground to-slate-800 text-white">
      <CardContent className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white/65 text-sm font-medium mb-3">
              <Clock3 className="h-4 w-4" /> Срок сдачи объекта
            </div>
            <div
              className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none ${overdue ? "text-red-300" : "text-white"}`}
            >
              {project.daysLeft === null
                ? "—"
                : overdue
                  ? `Просрочено ${Math.abs(project.daysLeft)} дн.`
                  : project.daysLeft}
              {project.daysLeft !== null && !overdue && (
                <span className="text-xl font-semibold ml-2">
                  дней до сдачи
                </span>
              )}
            </div>
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/70">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" /> Плановая дата:{" "}
                {formatDate(project.plannedEndDate)}
              </span>
              <Badge variant="outline" className={`border ${risk.className}`}>
                <span className="h-2 w-2 rounded-full bg-current" />
                {risk.label}
              </Badge>
            </div>
          </div>
          <div className="w-full md:max-w-xs">
            <div className="flex justify-between text-xs sm:text-sm mb-1 sm:mb-2 text-white/75">
              <span>Готовность</span>
              <strong className="text-white">{project.progressPercent}%</strong>
            </div>
            <Progress
              value={project.progressPercent}
              className="h-2.5 sm:h-3 bg-white/15 [&>div]:bg-primary"
            />
            <div className="mt-2 sm:mt-3 flex items-center gap-2 text-[10px] sm:text-xs text-white/60">
              <CheckCircle2 className="h-3.5 w-3.5" /> Данные обновляются в
              реальном времени
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

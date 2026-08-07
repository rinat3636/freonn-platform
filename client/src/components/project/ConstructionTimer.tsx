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
    <Card className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Clock3 className="h-4 w-4 text-primary" /> Срок сдачи объекта
            </div>
            <div className={`text-3xl sm:text-4xl font-black tracking-tight leading-none ${overdue ? "text-destructive" : "text-foreground"}`}>
              {project.daysLeft === null
                ? "—"
                : overdue
                ? `Просрочено ${Math.abs(project.daysLeft)} дн.`
                : `${project.daysLeft} дней до сдачи`}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" /> {formatDate(project.plannedEndDate)}
              </span>
              <Badge variant="outline" className={risk.className}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {risk.label}
              </Badge>
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
            <div className="flex justify-between text-xs sm:text-sm mb-1.5 font-medium">
              <span className="text-muted-foreground">Готовность</span>
              <strong className="text-foreground">{project.progressPercent}%</strong>
            </div>
            <Progress value={project.progressPercent} className="h-2.5 bg-muted" />
            <div className="mt-2 flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" /> Данные обновляются в реальном времени
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

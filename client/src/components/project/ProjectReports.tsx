import { useState } from "react";
import { FileText, Loader2, Plus, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { formatDate } from "@/lib/format";

export default function ProjectReports({
  projectId,
  canEdit,
}: {
  projectId: number;
  canEdit: boolean;
}) {
  const reports = trpc.reports.list.useQuery({ projectId });
  const generate = trpc.reports.generate.useMutation({
    onSuccess: () => {
      toast.success("Отчёт сформирован");
      reports.refetch();
    },
    onError: e => toast.error(e.message),
  });
  const remove = trpc.reports.delete.useMutation({
    onSuccess: () => {
      toast.success("Отчёт удалён");
      reports.refetch();
    },
    onError: e => toast.error(e.message),
  });
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");

  const handleGenerate = () => {
    generate.mutate({
      projectId,
      type: "project_summary",
      periodStart: periodStart ? new Date(periodStart) : undefined,
      periodEnd: periodEnd ? new Date(periodEnd) : undefined,
    });
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">PDF-отчёт</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-1">
              <label className="text-sm font-medium">Начало периода</label>
              <input
                type="date"
                value={periodStart}
                onChange={e => setPeriodStart(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Окончание периода</label>
              <input
                type="date"
                value={periodEnd}
                onChange={e => setPeriodEnd(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleGenerate} disabled={generate.isPending} className="w-full sm:w-auto">
                {generate.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Сформировать
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Готовые отчёты</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.data?.length ? (
            <div className="space-y-2">
              {reports.data.map(report => (
                <div
                  key={report.id}
                  className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{report.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(report.createdAt)} · {report.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {report.fileUrl && (
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        Скачать
                      </a>
                    )}
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => remove.mutate({ id: report.id })}
                        disabled={remove.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">Отчётов пока нет</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

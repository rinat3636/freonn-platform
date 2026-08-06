export function classNames(
  ...classes: Array<string | false | null | undefined>
) {
  return classes.filter(Boolean).join(" ");
}

export function daysLeft(end: Date | string | null | undefined): string {
  if (!end) return "—";
  const diff = Math.ceil((new Date(end).getTime() - Date.now()) / 86400000);
  if (diff < 0) return `Просрочено ${Math.abs(diff)} дн.`;
  if (diff === 0) return "Сегодня срок";
  return `Осталось ${diff} дн.`;
}

export function formatDate(value: Date | string | null | undefined) {
  return value ? new Date(value).toLocaleDateString("ru-RU") : "—";
}

export function formatBytes(bytes?: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

export function scheduleStatus(
  progressPercent: number,
  startDate: Date | string | null | undefined,
  plannedEndDate: Date | string | null | undefined,
  status: string
): {
  level: "on_track" | "at_risk" | "overdue";
  label: string;
  className: string;
} | null {
  if (!startDate || !plannedEndDate) return null;

  const now = new Date();
  const end = new Date(plannedEndDate);
  if (now > end && status !== "completed") {
    return {
      level: "overdue",
      label: "🔴 Просрочка",
      className: "bg-red-100 text-red-700 border-red-200",
    };
  }

  const start = new Date(startDate);
  const duration = end.getTime() - start.getTime();
  if (duration > 0) {
    const expected = Math.min(
      100,
      Math.max(0, ((now.getTime() - start.getTime()) / duration) * 100)
    );
    if (progressPercent - expected < -20) {
      return {
        level: "at_risk",
        label: "🟡 Риск срыва",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      };
    }
  }

  return {
    level: "on_track",
    label: "🟢 По графику",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };
}

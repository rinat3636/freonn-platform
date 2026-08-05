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

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, refetch } = trpc.content.notificationsList.useQuery();
  const mark = trpc.content.notificationsMarkRead.useMutation({
    onSuccess: () => refetch(),
    onError: e => toast.error(e.message),
  });

  const unread = data?.filter(n => !n.readAt) ?? [];

  const markAll = () => {
    const ids = unread.map(n => n.id);
    if (ids.length) mark.mutate({ ids });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread.length > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">Уведомления</span>
          {unread.length > 0 && (
            <Button variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={markAll} disabled={mark.isPending}>
              {mark.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
              Прочитать все
            </Button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {isLoading && <div className="p-4 text-sm text-muted-foreground">Загрузка…</div>}
          {!isLoading && data?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Нет уведомлений</div>}
          {data?.map(n => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b last:border-0 hover:bg-accent cursor-pointer ${!n.readAt ? "bg-accent/40" : ""}`}
              onClick={() => {
                if (!n.readAt) mark.mutate({ ids: [n.id] });
                if (n.projectId) {
                  setOpen(false);
                  window.location.href = `/projects/${n.projectId}`;
                }
              }}
            >
              <div className="text-sm font-medium">{n.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{n.body}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString("ru-RU")}</div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t">
          <Link href="/notifications" className="block text-center text-xs text-primary hover:underline" onClick={() => setOpen(false)}>
            Все уведомления
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

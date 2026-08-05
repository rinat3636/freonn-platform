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
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          {unread.length > 0 && (
            <span className="absolute top-1 right-1 h-4.5 w-4.5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center border-2 border-card">
              {unread.length > 9 ? "9+" : unread.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-88 p-0 rounded-2xl shadow-xl border border-border/50" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-bold text-sm">Уведомления</span>
          {unread.length > 0 && (
            <Button variant="ghost" size="sm" className="h-auto py-1.5 px-2 text-xs font-semibold" onClick={markAll} disabled={mark.isPending}>
              {mark.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Check className="h-3 w-3 mr-1.5" />}
              Прочитать все
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading && <div className="p-5 text-sm text-muted-foreground text-center">Загрузка…</div>}
          {!isLoading && data?.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Нет уведомлений</p>
            </div>
          )}
          {data?.map(n => (
            <div
              key={n.id}
              className={`px-4 py-3 border-b last:border-0 hover:bg-accent/60 cursor-pointer transition-colors ${!n.readAt ? "bg-primary/5" : ""}`}
              onClick={() => {
                if (!n.readAt) mark.mutate({ ids: [n.id] });
                if (n.projectId) {
                  setOpen(false);
                  window.location.href = `/projects/${n.projectId}`;
                }
              }}
            >
              <div className="flex items-start gap-3">
                {!n.readAt && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold line-clamp-1">{n.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-muted-foreground mt-1.5">{new Date(n.createdAt).toLocaleString("ru-RU")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-2 border-t bg-muted/30 rounded-b-2xl">
          <Link href="/notifications" className="block text-center text-xs font-semibold text-primary hover:underline" onClick={() => setOpen(false)}>
            Все уведомления
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

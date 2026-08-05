import { trpc } from "@/lib/trpc";
import { DashboardHeader } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { data, isLoading, refetch } = trpc.content.notificationsList.useQuery();
  const mark = trpc.content.notificationsMarkRead.useMutation({
    onSuccess: () => refetch(),
    onError: e => toast.error(e.message),
  });

  const unread = data?.filter(n => !n.readAt) ?? [];

  return (
    <div>
      <DashboardHeader title="Уведомления">
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => mark.mutate({ ids: unread.map(n => n.id) })} disabled={mark.isPending}>
            {mark.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Прочитать все
          </Button>
        )}
      </DashboardHeader>

      {isLoading && <div className="text-muted-foreground font-medium">Загрузка…</div>}
      {!isLoading && data?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-5">
            <Bell className="h-10 w-10 opacity-40" />
          </div>
          <p className="text-lg font-bold text-foreground">У вас пока нет уведомлений</p>
        </div>
      )}
      <div className="space-y-3">
        {data?.map(n => (
          <Card key={n.id} className={`border border-border/50 shadow-sm transition-shadow hover:shadow-md ${!n.readAt ? "bg-primary/5 border-primary/20" : ""}`}>
            <CardContent className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  {n.title}
                  {!n.readAt && <span className="h-2 w-2 rounded-full bg-primary" />}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">{new Date(n.createdAt).toLocaleString("ru-RU")}</p>
              </div>
              {!n.readAt && (
                <Button variant="ghost" size="icon" className="rounded-full shrink-0" onClick={() => mark.mutate({ ids: [n.id] })} disabled={mark.isPending}>
                  {mark.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

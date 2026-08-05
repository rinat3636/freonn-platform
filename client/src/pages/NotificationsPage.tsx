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

      {isLoading && <div className="text-muted-foreground">Загрузка…</div>}
      {!isLoading && data?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="h-12 w-12 mb-4 opacity-20" />
          <p>У вас пока нет уведомлений</p>
        </div>
      )}
      <div className="space-y-3">
        {data?.map(n => (
          <Card key={n.id} className={!n.readAt ? "border-primary/30 bg-accent/30" : ""}>
            <CardContent className="py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">{n.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString("ru-RU")}</p>
              </div>
              {!n.readAt && (
                <Button variant="ghost" size="icon" onClick={() => mark.mutate({ ids: [n.id] })} disabled={mark.isPending}>
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

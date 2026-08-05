import { useState } from "react";
import {
  CheckCircle2,
  FileText,
  HardHat,
  ImageIcon,
  Loader2,
  Plus,
  Video,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";

const icons: Record<string, any> = {
  worklog: HardHat,
  photo: ImageIcon,
  video: Video,
  document: FileText,
  stage: CheckCircle2,
};
function dayLabel(value: Date) {
  const now = new Date();
  const date = new Date(value);
  const day = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const diff = Math.round(
    (day -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86400000
  );
  return diff === 0
    ? "Сегодня"
    : diff === 1
      ? "Вчера"
      : date.toLocaleDateString("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
}

export default function ConstructionFeed({
  projectId,
  canEdit,
}: {
  projectId: number;
  canEdit: boolean;
}) {
  const feed = trpc.content.feed.useQuery({ projectId, limit: 120 });
  const create = trpc.content.workLogCreate.useMutation({
    onSuccess: () => {
      feed.refetch();
      setDescription("");
      toast.success("Обновление добавлено");
    },
    onError: e => toast.error(e.message),
  });
  const [description, setDescription] = useState("");
  const [people, setPeople] = useState("");
  const [hours, setHours] = useState("");
  const [lightbox, setLightbox] = useState<any>(null);
  const groups = (feed.data ?? []).reduce<Record<string, any[]>>(
    (acc, item) => {
      const key = dayLabel(item.createdAt);
      (acc[key] ||= []).push(item);
      return acc;
    },
    {}
  );
  return (
    <div className="space-y-6">
      {canEdit && (
        <Card className="rounded-2xl border border-border/50 shadow-sm">
          <CardContent className="p-5">
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!description.trim()) return;
                create.mutate({
                  projectId,
                  date: new Date(),
                  description: description.trim(),
                  peopleCount: people ? Number(people) : undefined,
                  hours: hours ? Number(hours) : undefined,
                });
              }}
              className="space-y-3"
            >
              <Label className="text-base">Добавить обновление</Label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Что сделано сегодня?"
              />
              <div className="flex flex-wrap gap-2">
                <Input
                  className="w-28"
                  type="number"
                  placeholder="Чел."
                  value={people}
                  onChange={e => setPeople(e.target.value)}
                />
                <Input
                  className="w-28"
                  type="number"
                  placeholder="Часы"
                  value={hours}
                  onChange={e => setHours(e.target.value)}
                />
                <Button disabled={create.isPending}>
                  {create.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Добавить
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {Object.keys(groups).length ? (
        Object.entries(groups).map(([day, items]) => (
          <section key={day}>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {day}
            </h2>
            <div className="space-y-3">
              {items.map(item => {
                const Icon = icons[item.kind] || HardHat;
                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-border/50 shadow-sm"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap justify-between gap-2">
                            <h3 className="font-bold">{item.title}</h3>
                            <span className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleTimeString(
                                "ru-RU",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </span>
                          </div>
                          {item.description && (
                            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-muted-foreground">
                            {item.authorName || "Система"}
                          </div>
                          {(item.kind === "photo" || item.kind === "video") &&
                            item.url && (
                              <button
                                className="mt-3 block overflow-hidden rounded-xl"
                                onClick={() => setLightbox(item)}
                              >
                                {item.kind === "video" ? (
                                  <video
                                    src={item.url}
                                    className="max-h-72 w-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={item.thumbnailUrl || item.url}
                                    className="max-h-72 w-full object-cover"
                                    alt=""
                                  />
                                )}
                              </button>
                            )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          Лента пока пуста
        </div>
      )}
      {lightbox && (
        <Dialog open onOpenChange={open => !open && setLightbox(null)}>
          <DialogContent className="max-w-4xl rounded-2xl p-2">
            {lightbox.kind === "video" ? (
              <video
                src={lightbox.url}
                controls
                className="w-full rounded-xl"
              />
            ) : (
              <img src={lightbox.url} alt="" className="w-full rounded-xl" />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

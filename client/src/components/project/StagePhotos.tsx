import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload, Video } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { uploadFile } from "@/lib/upload";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function StagePhotos({
  projectId,
  canEdit,
}: {
  projectId: number;
  canEdit: boolean;
}) {
  const stages = trpc.stages.list.useQuery({ projectId });
  const [stageId, setStageId] = useState<string>("all");
  const media = trpc.content.mediaList.useQuery({
    projectId,
    stageId: stageId === "all" ? undefined : Number(stageId),
  });
  const create = trpc.content.mediaCreate.useMutation({
    onSuccess: () => media.refetch(),
    onError: e => toast.error(e.message),
  });
  const [preview, setPreview] = useState<any>(null);
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      await create.mutateAsync({
        projectId,
        stageId: stageId === "all" ? undefined : Number(stageId),
        type: file.type.startsWith("video") ? "video" : "photo",
        url,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });
      toast.success("Файл загружен");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={stageId === "all" ? "default" : "outline"}
          onClick={() => setStageId("all")}
        >
          Все
        </Button>
        {(stages.data ?? []).map(stage => (
          <Button
            key={stage.id}
            variant={stageId === String(stage.id) ? "default" : "outline"}
            onClick={() => setStageId(String(stage.id))}
          >
            {stage.name}
          </Button>
        ))}
        {canEdit && (
          <>
            <input
              ref={ref}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={onUpload}
            />
            <Button
              variant="outline"
              className="ml-auto"
              onClick={() => ref.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Загрузить
            </Button>
          </>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {(media.data ?? []).map(item => (
          <Card
            key={item.id}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-border/50 shadow-sm"
            onClick={() => setPreview(item)}
          >
            <div className="relative aspect-square bg-muted">
              {item.type === "video" ? (
                <video src={item.url} className="h-full w-full object-cover" />
              ) : (
                <img
                  src={item.thumbnailUrl || item.url}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              )}
              <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                {item.type === "video" ? (
                  <Video className="inline h-3 w-3" />
                ) : (
                  <ImageIcon className="inline h-3 w-3" />
                )}{" "}
                {formatDate(item.createdAt)}
              </div>
            </div>
            <CardContent className="p-3 text-xs font-medium truncate">
              {item.originalName || "Медиафайл"}
            </CardContent>
          </Card>
        ))}
      </div>
      {!media.data?.length && (
        <div className="py-16 text-center text-muted-foreground">
          Фото и видео пока не добавлены
        </div>
      )}
      {preview && (
        <Dialog open onOpenChange={open => !open && setPreview(null)}>
          <DialogContent className="max-w-4xl rounded-2xl p-2">
            {preview.type === "video" ? (
              <video src={preview.url} controls className="w-full rounded-xl" />
            ) : (
              <img src={preview.url} alt="" className="w-full rounded-xl" />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Trash2, Upload, Video } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function StagePhotos({
  projectId,
  canEdit,
  canPlan,
}: {
  projectId: number;
  canEdit: boolean;
  canPlan: boolean;
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
  const remove = trpc.content.mediaDelete.useMutation({
    onSuccess: () => {
      media.refetch();
      setPreview(null);
      toast.success("Файл удалён");
    },
    onError: e => toast.error(e.message),
  });
  const [preview, setPreview] = useState<any>(null);
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    setUploading(true);
    const failures: string[] = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      setUploadProgress(`${index + 1} из ${files.length}`);
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
      } catch {
        failures.push(file.name);
      }
    }
    setUploading(false);
    setUploadProgress("");
    if (failures.length) {
      toast.error(`Не загружены: ${failures.join(", ")}`);
    } else {
      toast.success(`Загружено файлов: ${files.length}`);
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
              multiple
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
              {uploading ? `Загрузка ${uploadProgress}` : "Загрузить"}
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
              {canPlan && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute right-2 top-2 h-8 w-8 opacity-0 transition group-hover:opacity-100"
                      onClick={e => e.stopPropagation()}
                      aria-label="Удалить файл"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить файл?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Файл «{item.originalName || "Медиафайл"}» будет удалён.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => remove.mutate({ id: item.id })}
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
            {canPlan && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    variant="destructive"
                    className="absolute right-4 top-4"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Удалить
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить файл?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Этот файл будет удалён из объекта.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => remove.mutate({ id: preview.id })}
                    >
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

import { useRef, useState } from "react";
import { Download, FileText, Loader2, Upload } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { uploadFile } from "@/lib/upload";
import { formatBytes, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const categories: Record<string, string> = {
  contract: "Договор",
  drawing: "Чертеж",
  act: "Акт",
  estimate: "Смета",
  other: "Другое",
};
export default function ProjectDocuments({
  projectId,
  canEdit,
}: {
  projectId: number;
  canEdit: boolean;
}) {
  const docs = trpc.content.documentsList.useQuery({ projectId });
  const create = trpc.content.documentCreate.useMutation({
    onSuccess: () => docs.refetch(),
    onError: e => toast.error(e.message),
  });
  const ref = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState("other");
  const [filter, setFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const filtered = (docs.data ?? []).filter(
    doc => filter === "all" || doc.category === filter
  );
  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      await create.mutateAsync({
        projectId,
        category: category as any,
        name: file.name,
        url,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      });
      toast.success("Документ загружен");
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
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Все
        </Button>
        {Object.entries(categories).map(([key, label]) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
        {canEdit && (
          <div className="ml-auto flex gap-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              ref={ref}
              type="file"
              className="hidden"
              onChange={onUpload}
            />
            <Button onClick={() => ref.current?.click()} disabled={uploading}>
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Загрузить
            </Button>
          </div>
        )}
      </div>
      <div className="grid gap-3">
        {filtered.map(doc => (
          <Card
            key={doc.id}
            className="rounded-2xl border border-border/50 shadow-sm"
          >
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{doc.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {categories[doc.category]} · {formatBytes(doc.size)} ·{" "}
                    {formatDate(doc.createdAt)}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <a href={doc.url} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {!filtered.length && (
        <div className="py-16 text-center text-muted-foreground">
          Документы не найдены
        </div>
      )}
    </div>
  );
}

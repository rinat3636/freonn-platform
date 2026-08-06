import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { uploadFile } from "@/lib/upload";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function initials(name?: string | null) {
  return (
    name
      ?.split(/\s+/)
      .filter(Boolean)
      .map(part => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function dayLabel(date: Date | string) {
  const target = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (target.toDateString() === today.toDateString()) return "Сегодня";
  if (target.toDateString() === yesterday.toDateString()) return "Вчера";
  return target.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function timeLabel(date: Date | string) {
  return new Date(date).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function attachmentKind(url?: string | null) {
  if (!url) return "file";
  const path = url.split("?")[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp)$/.test(path)) return "image";
  if (/\.(mp4|mov|webm|m4v)$/.test(path)) return "video";
  return "file";
}

function attachmentName(url: string, fallback?: string | null) {
  if (fallback) return fallback;
  try {
    return decodeURIComponent(url.split("/").pop()?.split("?")[0] || "Файл");
  } catch {
    return "Файл";
  }
}

export default function ProjectChat({ projectId }: { projectId: number }) {
  const { user } = useAuth();
  const messages = trpc.content.chatList.useQuery({ projectId });
  const send = trpc.content.chatSend.useMutation({
    onSuccess: () => messages.refetch(),
    onError: error => toast.error(error.message),
  });
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.data]);

  const entries = useMemo(() => {
    const result: Array<
      | { type: "day"; key: string; label: string }
      | {
          type: "message";
          key: string;
          message: any;
          grouped: boolean;
        }
    > = [];
    let previousDay = "";
    let previousSender: number | null = null;

    for (const message of messages.data ?? []) {
      const day = new Date(message.createdAt).toDateString();
      if (day !== previousDay) {
        result.push({
          type: "day",
          key: `day-${day}`,
          label: dayLabel(message.createdAt),
        });
        previousDay = day;
        previousSender = null;
      }
      const senderId = message.sender?.id ?? null;
      result.push({
        type: "message",
        key: `message-${message.id}`,
        message,
        grouped: senderId !== null && senderId === previousSender,
      });
      previousSender = senderId;
    }
    return result;
  }, [messages.data]);

  const sendText = () => {
    const content = text.trim();
    if (!content || send.isPending || uploading) return;
    send.mutate({ projectId, content, type: "text" });
    setText("");
  };

  const handleFile = async (file?: File) => {
    if (!file || uploading) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      await send.mutateAsync({
        projectId,
        type: isImage || isVideo ? "photo" : "document",
        content: isImage || isVideo ? "" : file.name,
        attachmentUrl: url,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="flex h-[68vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div
          ref={messagesRef}
          className="flex-1 space-y-1 overflow-y-auto bg-muted/30 p-4"
        >
          {entries.map(entry =>
            entry.type === "day" ? (
              <div key={entry.key} className="flex justify-center py-4">
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  {entry.label}
                </span>
              </div>
            ) : (
              <ChatMessage
                key={entry.key}
                message={entry.message}
                grouped={entry.grouped}
                own={entry.message.sender?.id === user?.id}
                onPreview={setPreviewUrl}
              />
            )
          )}
          {!messages.data?.length && (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="mb-3 h-10 w-10 opacity-30" />
              <p>Начните переписку по объекту</p>
            </div>
          )}
        </div>

        <form
          className="border-t border-border/60 bg-card p-3"
          onSubmit={event => {
            event.preventDefault();
            sendText();
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,*/*"
            onChange={event => handleFile(event.target.files?.[0])}
          />
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background p-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-xl text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || send.isPending}
              aria-label="Прикрепить файл"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            <Input
              value={text}
              onChange={event => setText(event.target.value)}
              placeholder="Сообщение…"
              className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
              disabled={uploading}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 rounded-xl"
              disabled={!text.trim() || uploading || send.isPending}
              aria-label="Отправить"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      <Dialog
        open={Boolean(previewUrl)}
        onOpenChange={open => !open && setPreviewUrl(null)}
      >
        <DialogContent className="max-w-4xl p-3">
          <DialogHeader>
            <DialogTitle>Изображение</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Вложение"
              className="max-h-[75vh] w-full rounded-xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ChatMessage({
  message,
  grouped,
  own,
  onPreview,
}: {
  message: any;
  grouped: boolean;
  own: boolean;
  onPreview: (url: string) => void;
}) {
  const kind = attachmentKind(message.attachmentUrl);
  return (
    <div className={`flex gap-2 ${own ? "justify-end" : "justify-start"}`}>
      {!own && (
        <div className="w-8 shrink-0">
          {!grouped && (
            <Avatar className="mt-1 h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                {initials(message.sender?.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${
          own
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-card shadow-sm"
        }`}
      >
        {!own && !grouped && (
          <div className="mb-1 text-xs font-semibold text-primary">
            {message.sender?.name || "Система"}
          </div>
        )}
        {message.attachmentUrl && kind === "image" && (
          <button
            type="button"
            className="block overflow-hidden rounded-xl"
            onClick={() => onPreview(message.attachmentUrl)}
          >
            <img
              src={message.attachmentUrl}
              alt={message.content || "Изображение"}
              className="max-h-72 max-w-[260px] object-cover"
            />
          </button>
        )}
        {message.attachmentUrl && kind === "video" && (
          <video
            src={message.attachmentUrl}
            controls
            className="max-h-72 max-w-[280px] rounded-xl"
          />
        )}
        {message.attachmentUrl && kind === "file" && (
          <a
            href={message.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="flex items-center gap-2 rounded-xl bg-background/70 px-3 py-2 text-sm font-medium underline-offset-2 hover:underline"
          >
            <FileText className="h-5 w-5 shrink-0 text-primary" />
            <span className="max-w-[220px] truncate">
              {attachmentName(message.attachmentUrl, message.content)}
            </span>
          </a>
        )}
        {message.content && !(message.attachmentUrl && kind === "file") && (
          <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </div>
        )}
        <div
          className={`mt-1 text-right text-[10px] ${
            own ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {timeLabel(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

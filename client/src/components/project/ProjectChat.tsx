import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
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
import { Textarea } from "@/components/ui/textarea";

type ChatMessageData = {
  id: number;
  senderId: number;
  type: "text" | "photo" | "document" | "system";
  content: string;
  attachmentUrl?: string | null;
  readBy?: unknown;
  createdAt: Date | string;
  sender?: { id: number; name: string } | null;
};

type ChatParticipant = {
  id: number;
  name: string;
  role: string;
};

const roleLabels: Record<string, string> = {
  director: "директор",
  foreman: "прораб",
  customer: "заказчик",
  viewer: "участник",
  admin: "администратор",
};

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

function hasReadByOther(message: ChatMessageData, userId?: number) {
  if (!userId || !Array.isArray(message.readBy)) return false;
  return message.readBy.some(
    readerId => typeof readerId === "number" && readerId !== userId
  );
}

export default function ProjectChat({
  projectId,
  projectName,
  participants,
  isActive,
}: {
  projectId: number;
  projectName: string;
  participants: ChatParticipant[];
  isActive: boolean;
}) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(() => !document.hidden);
  const messages = trpc.content.chatList.useQuery(
    { projectId },
    {
      enabled: isActive,
      refetchInterval: isActive && isVisible ? 3000 : false,
      refetchIntervalInBackground: false,
    }
  );
  const utils = trpc.useUtils();
  const send = trpc.content.chatSend.useMutation({
    onSuccess: () => utils.content.chatList.invalidate({ projectId }),
    onError: error => toast.error(error.message),
  });
  const markRead = trpc.content.chatMarkRead.useMutation();
  const [text, setText] = useState("");
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const markedReadRef = useRef(new Set<number>());

  useEffect(() => {
    const handleVisibility = () => setIsVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`;
  }, [text]);

  useEffect(() => {
    if (!messages.data?.length) return;
    const unreadIds = messages.data
      .filter(message => message.sender?.id !== user?.id)
      .map(message => message.id)
      .filter(id => !markedReadRef.current.has(id));
    if (!unreadIds.length) return;
    unreadIds.forEach(id => markedReadRef.current.add(id));
    markRead.mutate({ projectId, messageIds: unreadIds });
  }, [messages.data, markRead, projectId, user?.id]);

  useEffect(() => {
    if (!messages.data?.length || !nearBottomRef.current) return;
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
          message: ChatMessageData;
          grouped: boolean;
          showTime: boolean;
        }
    > = [];
    const list = messages.data ?? [];
    let previousDay = "";
    let previousSender: number | null = null;

    list.forEach((message, index) => {
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
      const next = list[index + 1];
      const nextDay = next
        ? new Date(next.createdAt).toDateString()
        : undefined;
      const showTime = !next || nextDay !== day || next.sender?.id !== senderId;
      result.push({
        type: "message",
        key: `message-${message.id}`,
        message,
        grouped: senderId !== null && senderId === previousSender,
        showTime,
      });
      previousSender = senderId;
    });
    return result;
  }, [messages.data]);

  const sendText = () => {
    const content = text.trim();
    if (!content || send.isPending || uploadingFiles.length) return;
    nearBottomRef.current = true;
    send.mutate({ projectId, content, type: "text" });
    setText("");
  };

  const handleFiles = async (files: File[]) => {
    const accepted = files.filter(file => file.size > 0);
    if (!accepted.length || uploadingFiles.length) return;
    setUploadingFiles(accepted.map(file => file.name));
    try {
      for (const file of accepted) {
        const url = await uploadFile(file);
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        await send.mutateAsync({
          projectId,
          type: isImage || isVideo ? "photo" : "document",
          content: isImage || isVideo ? "" : file.name,
          attachmentUrl: url,
        });
      }
      nearBottomRef.current = true;
      await utils.content.chatList.invalidate({ projectId });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки");
    } finally {
      setUploadingFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const image = Array.from(event.clipboardData.items)
      .find(item => item.type.startsWith("image/"))
      ?.getAsFile();
    if (!image) return;
    event.preventDefault();
    void handleFiles([image]);
  };

  return (
    <>
      <div className="flex h-[68vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
        <div className="border-b border-border/60 bg-card px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{projectName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {participants
                  .map(
                    participant =>
                      `${participant.name} · ${roleLabels[participant.role] || participant.role}`
                  )
                  .join(", ")}
              </p>
            </div>
          </div>
        </div>
        <div
          ref={messagesRef}
          className="flex-1 space-y-1 overflow-y-auto bg-muted/30 p-4"
          onScroll={event => {
            const element = event.currentTarget;
            nearBottomRef.current =
              element.scrollHeight - element.scrollTop - element.clientHeight <
              96;
          }}
          onDragOver={event => event.preventDefault()}
          onDrop={event => {
            event.preventDefault();
            void handleFiles(Array.from(event.dataTransfer.files));
          }}
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
                showTime={entry.showTime}
                own={entry.message.sender?.id === user?.id}
                read={hasReadByOther(entry.message, user?.id)}
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
            multiple
            className="hidden"
            accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.zip,*/*"
            onChange={event =>
              void handleFiles(Array.from(event.target.files ?? []))
            }
          />
          <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-background p-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-xl text-muted-foreground"
              onClick={() => fileInputRef.current?.click()}
              disabled={Boolean(uploadingFiles.length) || send.isPending}
              aria-label="Прикрепить файл"
            >
              {uploadingFiles.length ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </Button>
            <Textarea
              ref={textareaRef}
              value={text}
              rows={1}
              onChange={event => setText(event.target.value)}
              onPaste={handlePaste}
              onKeyDown={event => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  sendText();
                }
              }}
              placeholder="Сообщение…"
              className="max-h-24 min-h-10 resize-none border-0 bg-transparent py-2.5 shadow-none focus-visible:ring-0"
              disabled={Boolean(uploadingFiles.length)}
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 rounded-xl"
              disabled={
                !text.trim() || uploadingFiles.length > 0 || send.isPending
              }
              aria-label="Отправить"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {uploadingFiles.length > 0 && (
            <p className="mt-2 truncate text-xs text-muted-foreground">
              Загрузка файлов ({uploadingFiles.length}):{" "}
              {uploadingFiles.join(", ")}
            </p>
          )}
          <p className="mt-1 text-[11px] text-muted-foreground">
            Enter — отправить · Shift+Enter — новая строка · файлы можно
            перетащить в чат
          </p>
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
  showTime,
  own,
  read,
  onPreview,
}: {
  message: ChatMessageData;
  grouped: boolean;
  showTime: boolean;
  own: boolean;
  read: boolean;
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
            onClick={() => onPreview(message.attachmentUrl as string)}
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
        {showTime && (
          <div
            className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
              own ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {timeLabel(message.createdAt)}
            {own && (
              <span aria-label={read ? "Прочитано" : "Отправлено"}>
                <Check className="h-3 w-3" />
                {read && <Check className="-ml-2.5 h-3 w-3" />}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

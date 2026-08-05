import { useEffect, useMemo, useRef, useState } from "react";
import { Send, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ProjectChat({ projectId }: { projectId: number }) {
  const { user } = useAuth();
  const messages = trpc.content.chatList.useQuery({ projectId });
  const send = trpc.content.chatSend.useMutation({
    onSuccess: () => messages.refetch(),
    onError: e => toast.error(e.message),
  });
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({
      top: ref.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.data]);
  const initials = (name?: string) =>
    name
      ?.split(" ")
      .map(part => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const grouped = useMemo(() => {
    const out: Array<{ day: string; message: any }> = [];
    (messages.data ?? []).forEach(message => {
      const day = new Date(message.createdAt).toLocaleDateString("ru-RU");
      if (out[out.length - 1]?.day !== day) out.push({ day, message: null });
      out.push({ day, message });
    });
    return out;
  }, [messages.data]);
  return (
    <div className="flex h-[68vh] flex-col rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <div ref={ref} className="flex-1 space-y-3 overflow-y-auto pr-2">
        {grouped.map((entry, index) =>
          entry.message ? (
            <div
              key={entry.message.id}
              className={`flex gap-2 ${entry.message.sender?.id === user?.id ? "justify-end" : ""}`}
            >
              <Avatar className="mt-1 h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">
                  {initials(entry.message.sender?.name)}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${entry.message.sender?.id === user?.id ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm bg-muted"}`}
              >
                <div className="mb-1 text-xs font-semibold opacity-70">
                  {entry.message.sender?.name || "Система"} ·{" "}
                  {new Date(entry.message.createdAt).toLocaleTimeString(
                    "ru-RU",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </div>
                <div className="text-sm leading-relaxed">
                  {entry.message.content}
                </div>
              </div>
            </div>
          ) : (
            <div
              key={`day-${index}`}
              className="flex items-center gap-3 py-3 text-xs font-semibold text-muted-foreground"
            >
              <div className="h-px flex-1 bg-border" />
              {entry.day}
              <div className="h-px flex-1 bg-border" />
            </div>
          )
        )}
      </div>
      {!messages.data?.length && (
        <div className="flex flex-1 flex-col items-center justify-center text-muted-foreground">
          <MessageSquare className="mb-3 h-10 w-10 opacity-30" />
          <p>Начните переписку по объекту</p>
        </div>
      )}
      <form
        className="mt-3 flex gap-2 border-t pt-3"
        onSubmit={e => {
          e.preventDefault();
          if (!text.trim()) return;
          send.mutate({ projectId, content: text.trim() });
          setText("");
        }}
      >
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Сообщение…"
        />
        <Button disabled={send.isPending}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

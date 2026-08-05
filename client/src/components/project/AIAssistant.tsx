import { useState } from "react";
import { Bot, Cpu, Loader2, Send, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const prompts = [
  "Что сделали за неделю?",
  "Какие сейчас риски?",
  "Что дальше по плану?",
  "Кратко о статусе объекта",
];
export default function AIAssistant({ projectId }: { projectId: number }) {
  const utils = trpc.useUtils();
  const reports = trpc.content.aiReportsList.useQuery({ projectId });
  const generate = trpc.content.aiReportGenerate.useMutation({
    onSuccess: () => reports.refetch(),
    onError: e => toast.error(e.message),
  });
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string }>
  >([]);
  const [question, setQuestion] = useState("");
  const [type, setType] = useState("daily");
  const [loading, setLoading] = useState(false);
  const ask = async (value = question) => {
    const text = value.trim();
    if (!text || loading) return;
    setQuestion("");
    setMessages(items => [...items, { role: "user", text }]);
    setLoading(true);
    try {
      const response = await utils.content.aiAsk.fetch({
        projectId,
        question: text,
      });
      setMessages(items => [
        ...items,
        { role: "assistant", text: response.answer },
      ]);
    } catch (error: any) {
      setMessages(items => [
        ...items,
        {
          role: "assistant",
          text: error.message || "Не удалось получить ответ",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Спросить ассистента
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 min-h-32 space-y-3">
            {messages.length ? (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                  >
                    {message.text}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                <Sparkles className="mb-2 h-8 w-8 text-primary/50" />
                <p>Задайте вопрос о ходе строительства</p>
              </div>
            )}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Ассистент анализирует данные…
              </div>
            )}
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            {prompts.map(prompt => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                onClick={() => ask(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={e => {
              e.preventDefault();
              ask();
            }}
          >
            <Textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Напишите вопрос…"
              className="min-h-12"
            />
            <Button type="submit" disabled={loading || !question.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card className="rounded-2xl border border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary" />
            Отчёты
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-5 flex flex-wrap gap-2">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Дневной</SelectItem>
                <SelectItem value="weekly">Недельный</SelectItem>
                <SelectItem value="summary">Сводный</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => generate.mutate({ projectId, type: type as any })}
              disabled={generate.isPending}
            >
              {generate.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Cpu className="mr-2 h-4 w-4" />
              )}
              Сгенерировать отчёт
            </Button>
          </div>
          <div className="space-y-3">
            {(reports.data ?? []).map(report => (
              <div key={report.id} className="rounded-xl bg-muted/50 p-4">
                <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                  <span>{report.reportType}</span>
                  <span>
                    {new Date(report.createdAt).toLocaleString("ru-RU")}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {report.content}
                </p>
              </div>
            ))}
          </div>
          {!reports.data?.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Сгенерированные отчёты появятся здесь
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

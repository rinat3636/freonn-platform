/**
 * useGroqChat — hook for Freonn AI consultant
 *
 * SAFETY: If the server endpoint is unavailable or returns an error,
 * the hook gracefully shows a static fallback message.
 * The site NEVER crashes due to AI unavailability.
 */
import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UseGroqChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  sendMessage: (text: string) => Promise<void>;
  clearMessages: () => void;
  isFallback: boolean;
}

const FALLBACK_MESSAGE =
  "Здравствуйте! Я консультант Freonn. Для точного ответа позвоните нашим инженерам: **8(800)101-2009** (бесплатно) или оставьте заявку — перезвоним в течение 30 минут.";

export function useGroqChat(): UseGroqChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setIsLoading(true);
    setIsFallback(false);

    // Cancel any previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    // Placeholder for streaming assistant message
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulated += parsed.content;
              // Update last message in real-time
              setMessages(prev => {
                const copy = [...prev];
                copy[copy.length - 1] = { role: "assistant", content: accumulated };
                return copy;
              });
            }
          } catch {
            // skip malformed chunk
          }
        }
      }

      // If we got nothing — show fallback
      if (!accumulated.trim()) {
        setMessages(prev => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: FALLBACK_MESSAGE };
          return copy;
        });
        setIsFallback(true);
      }
    } catch (err: unknown) {
      // AbortError means user navigated away — silently ignore
      if (err instanceof Error && err.name === "AbortError") {
        setMessages(prev => prev.slice(0, -1)); // remove empty placeholder
        setIsLoading(false);
        return;
      }

      // Any other error — show fallback, never crash
      console.warn("[useGroqChat] Error, showing fallback:", err);
      setMessages(prev => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", content: FALLBACK_MESSAGE };
        return copy;
      });
      setIsFallback(true);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setIsFallback(false);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages, isFallback };
}

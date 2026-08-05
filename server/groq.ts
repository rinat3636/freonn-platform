/**
 * groq.ts — Groq API client for Freonn SEO automation
 *
 * SAFETY FIRST: All functions are wrapped in try/catch.
 * If GROQ_API_KEY is missing or the API is unavailable,
 * every function returns null/false — the site never crashes.
 */

const DEFAULT_GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Optionally route Groq calls through a proxy (e.g. a Cloudflare Worker) when the
// host region is geo-blocked by Groq; otherwise call Groq directly.
function getApiUrl(): string {
  const url = process.env.GROQ_API_URL?.trim();
  return url && url.length > 0 ? url : DEFAULT_GROQ_API_URL;
}

function buildHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  const proxySecret = process.env.GROQ_PROXY_SECRET?.trim();
  if (proxySecret) headers["x-proxy-secret"] = proxySecret;
  return headers;
}

interface SseLineResult {
  done?: boolean;
  content?: string;
}

// Parse one SSE line from the Groq stream into a delta, or done=true on [DONE].
function parseSseLine(line: string): SseLineResult {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return {};
  const data = trimmed.slice(5).trim();
  if (data === "") return {};
  if (data === "[DONE]") return { done: true };
  try {
    const parsed = JSON.parse(data) as {
      choices?: Array<{ delta?: { content?: string } }>;
    };
    const content = parsed.choices?.[0]?.delta?.content;
    if (content) return { content };
  } catch {
    // skip malformed SSE lines
  }
  return {};
}

// Fast model for chat; powerful model for content generation
export const GROQ_CHAT_MODEL = "llama-3.1-8b-instant";
export const GROQ_CONTENT_MODEL = "llama-3.3-70b-versatile";

function getApiKey(): string | null {
  const key = process.env.GROQ_API_KEY ?? "";
  return key.trim().length > 0 ? key : null;
}

export function isGroqAvailable(): boolean {
  return getApiKey() !== null;
}

interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
}

/**
 * Core Groq API call — returns text or null on any error.
 * Never throws. Safe to call without try/catch.
 */
export async function groqChat(
  messages: GroqMessage[],
  model: string = GROQ_CHAT_MODEL,
  maxTokens: number = 1024,
  timeoutMs: number = 15000
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[Groq] GROQ_API_KEY is not set — skipping API call");
    return null;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errText = await response.text().catch(() => "unknown error");
      console.error(`[Groq] API error ${response.status}: ${errText}`);
      return null;
    }

    const data = (await response.json()) as GroqResponse;
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[Groq] Request timed out");
    } else {
      console.error("[Groq] Unexpected error:", err);
    }
    return null;
  }
}

/**
 * Streaming version — yields chunks via async generator.
 * Falls back gracefully if streaming is unavailable.
 */
export async function* groqChatStream(
  messages: GroqMessage[],
  model: string = GROQ_CHAT_MODEL,
  maxTokens: number = 1024
): AsyncGenerator<string> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("[Groq] GROQ_API_KEY is not set — skipping stream");
    return;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7,
        stream: true,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok || !response.body) {
      console.error(`[Groq] Stream error ${response.status}`);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    // A single `data:` frame can be split across reads, so buffer and only
    // parse complete lines; otherwise partial frames are dropped (showing up as
    // missing characters, especially for multibyte text like Cyrillic).
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        const { done: sseDone, content } = parseSseLine(line);
        if (sseDone) return;
        if (content) yield content;
      }
    }

    buffer += decoder.decode();
    const { content: lastContent } = parseSseLine(buffer);
    if (lastContent) yield lastContent;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[Groq] Stream timed out");
    } else {
      console.error("[Groq] Stream error:", err);
    }
  }
}

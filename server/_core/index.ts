import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { applySeoHttpMiddleware } from "./seoHttpMiddleware";
import { applySecurityHeaders } from "./securityHeaders";
import { rateLimit } from "./rateLimit";
import { buildSitemapXml, buildTurboXml, buildTurboGeoSplitFeed, buildTurboBlogSplitFeed, buildLlmsTxt } from "./seoFeeds";
import { groqChatStream, GROQ_CHAT_MODEL } from "../groq";
import { generateKpPdf, type KpData } from "../kp-generator";
import { estimateFromKpPayload } from "../../shared/buildingEstimate";
import { fetchWebsteelEstimate } from "../websteel";
import { registerOAuthRoutes } from "./oauth";
import { generateKpBodySchema } from "./kpBodySchema";

const WEBSTEEL_ENABLED = ["1", "true", "yes"].includes(
  (process.env.WEBSTEEL_ENABLED || "").toLowerCase()
);

const AI_MAX_MESSAGES = 24;
const AI_MAX_CONTENT_CHARS = 4000;

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ─── MAX Bot ─────────────────────────────────────────────────────────────────
const MAX_BOT_TOKEN = (process.env.MAX_BOT_TOKEN || "").trim();
const MAX_API_URL = "https://platform-api.max.ru/messages";
const MAX_USER_IDS = [161746887, 214386106];

async function sendMaxMessage(text: string): Promise<boolean> {
  if (!MAX_BOT_TOKEN) {
    console.error("[MAX] MAX_BOT_TOKEN is not set — skip outbound message");
    return false;
  }
  let anyOk = false;
  for (const userId of MAX_USER_IDS) {
    try {
      const res = await fetch(`${MAX_API_URL}?user_id=${userId}`, {
        method: "POST",
        headers: {
          Authorization: MAX_BOT_TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error(`[MAX] Failed to send to user ${userId}:`, res.status, err.slice(0, 500));
      } else {
        anyOk = true;
      }
    } catch (e) {
      console.error(`[MAX] Error sending to user ${userId}:`, e);
    }
  }
  return anyOk;
}

async function sendMaxPdf(pdfBuffer: Buffer, filename: string, caption: string): Promise<void> {
  if (!MAX_BOT_TOKEN) {
    console.error("[MAX] MAX_BOT_TOKEN is not set — cannot upload PDF");
    await sendMaxMessage(caption).catch(() => {});
    return;
  }
  try {
    const uploadRes = await fetch("https://platform-api.max.ru/uploads?type=file", {
      method: "POST",
      headers: { Authorization: MAX_BOT_TOKEN },
    });
    if (!uploadRes.ok) {
      console.error("[MAX] Upload URL failed:", uploadRes.status, (await uploadRes.text()).slice(0, 500));
      await sendMaxMessage(caption);
      return;
    }
    const uploadData = (await uploadRes.json()) as { url: string; token?: string };

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" });
    formData.append("data", blob, filename);

    const uploadFileRes = await fetch(uploadData.url, {
      method: "POST",
      body: formData,
    });
    const uploadFileText = await uploadFileRes.text();

    if (!uploadFileRes.ok) {
      console.error("[MAX] File upload failed:", uploadFileRes.status, uploadFileText.slice(0, 500));
      await sendMaxMessage(caption);
      return;
    }

    let fileToken: string | undefined = uploadData.token;
    try {
      const uploadFileData = JSON.parse(uploadFileText) as { token?: string; fileToken?: string };
      if (uploadFileData.token) fileToken = uploadFileData.token;
      else if (uploadFileData.fileToken) fileToken = uploadFileData.fileToken;
    } catch {
      /* empty body */
    }

    if (!fileToken) {
      console.error("[MAX] No file token in upload response");
      await sendMaxMessage(caption);
      return;
    }

    for (const userId of MAX_USER_IDS) {
      try {
        const msgRes = await fetch(`${MAX_API_URL}?user_id=${userId}`, {
          method: "POST",
          headers: {
            Authorization: MAX_BOT_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: caption,
            attachments: [{ type: "file", payload: { token: fileToken } }],
          }),
        });
        const msgText = await msgRes.text();
        if (!msgRes.ok) {
          console.error(`[MAX] File message failed for user ${userId}:`, msgRes.status, msgText.slice(0, 500));
        }
      } catch (e) {
        console.error(`[MAX] Error sending PDF to user ${userId}:`, e);
      }
    }
  } catch (e) {
    console.error("[MAX] sendMaxPdf error:", e);
    await sendMaxMessage(caption).catch(() => {});
  }
}

// ─── FREONN AI System Prompt ──────────────────────────────────────────────────
const FREONN_SYSTEM_PROMPT = `Ты — AI-консультант компании FREONN (строительство промышленных зданий под ключ).
Компания специализируется на проектировании, производстве и монтаже промышленных зданий: ангары, склады, производственные и торговые здания.
Работаем по всей России. Опыт с 2011 года, 500+ объектов, 47 регионов.
Телефон: 8(800)101-2009 (бесплатно).

Правила:
- Отвечай кратко, профессионально, по-русски.
- Если вопрос не по теме строительства — вежливо перенаправь к нашим услугам.
- Не называй цены точно — предлагай оставить заявку для расчёта.
- Всегда предлагай оставить заявку или позвонить.
- Максимум 3–4 предложения на ответ.`;

const FALLBACK_ANSWERS = [
  "Здравствуйте! Я консультант FREONN. Для точного ответа позвоните нам: **8(800)101-2009** (бесплатно) или оставьте заявку — перезвоним в течение 30 минут.",
];

type GroqChatMessage = { role: "user" | "assistant"; content: string };

function normalizeChatMessages(messages: unknown): GroqChatMessage[] | null {
  if (!Array.isArray(messages) || messages.length === 0) return null;
  if (messages.length > AI_MAX_MESSAGES) return null;
  const out: GroqChatMessage[] = [];
  for (const m of messages) {
    if (!m || typeof m !== "object") return null;
    const role = (m as { role?: string }).role;
    const content = (m as { content?: string }).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.length === 0 || content.length > AI_MAX_CONTENT_CHARS) {
      return null;
    }
    out.push({ role, content });
  }
  return out;
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  const serverStartedAt = Date.now();

  // Suppress noisy "Parse Error" logs caused by clients (health-checks, scanners,
  // load-balancers) that open a TCP connection and close it before sending a
  // complete HTTP request.  We respond with 400 and close the socket gracefully.
  server.on("clientError", (err: NodeJS.ErrnoException, socket) => {
    if (!socket.writable) return;
    if (err.code === "HPE_INVALID_METHOD" || (err as any).rawPacket !== undefined) {
      socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
    } else {
      socket.destroy();
    }
  });

  // JSON: достаточно для форм и API; большие загрузки не используются
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ limit: "2mb", extended: true }));

  applySeoHttpMiddleware(app);
  applySecurityHeaders(app);
  registerOAuthRoutes(app);

  const sendHealth = (_req: express.Request, res: express.Response) => {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.json({
      ok: true,
      uptimeMs: Date.now() - serverStartedAt,
      env: process.env.NODE_ENV || "development",
    });
  };
  app.get("/api/health", sendHealth);
  app.get("/health", sendHealth);

  /** Общий потолок по IP для всех `/api/*` (tRPC батчит запросы). */
  app.use("/api", rateLimit({ windowMs: 60_000, max: 420 }));

  const limitSubmitForm = rateLimit({ windowMs: 60_000, max: 14 });
  const limitGenerateKp = rateLimit({ windowMs: 60_000, max: 12 });
  const limitAiChat = rateLimit({ windowMs: 60_000, max: 24 });
  const limitVesta = rateLimit({ windowMs: 60_000, max: 45 });
  // Bogus sitemap accidentally submitted to GSC — redirect to real sitemap
  app.get("/sitemap.xmlsitemap.xml", (_req, res) => {
    res.redirect(301, "/sitemap.xml");
  });

  app.get("/sitemap.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=7200");
    res.send(buildSitemapXml());
  });
  app.get("/turbo-geo.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=7200");
    res.send(buildTurboGeoSplitFeed());
  });
  app.get("/turbo-blog.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=7200");
    res.send(buildTurboBlogSplitFeed());
  });

  app.get("/turbo.xml", (_req, res) => {
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=7200");
    res.send(buildTurboXml());
  });

  app.get("/llms.txt", (_req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=7200");
    res.send(buildLlmsTxt());
  });

  /** Публичные флаги для фронта (без секретов). */
  app.get("/api/config", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ websteelEnabled: WEBSTEEL_ENABLED });
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // ── Form submission → MAX bot ─────────────────────────────────────────────────────────────────
  app.post("/api/submit-form", limitSubmitForm, async (req, res) => {
    try {
      const { name, phone, email, service, message } = req.body || {};

      if (!name || !phone) {
        res.status(400).json({ success: false, error: "Имя и телефон обязательны" });
        return;
      }

      const text = [
        "📋 *Новая заявка с сайта freonn.pro*",
        "",
        `👤 Имя: ${name}`,
        `📞 Телефон: ${phone}`,
        email ? `📧 Email: ${email}` : null,
        service ? `🏗️ Услуга: ${service}` : null,
        message ? `💬 Сообщение: ${message}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      if (!(await sendMaxMessage(text))) {
        res.status(503).json({
          success: false,
          error:
            "Не удалось доставить заявку в мессенджер. Позвоните нам: 8(800)101-2009 или напишите на freonn@internet.ru",
        });
        return;
      }

      res.json({ success: true });
    } catch (e) {
      console.error("[submit-form] Error:", e);
      res.status(500).json({ success: false, error: "Ошибка сервера" });
    }
  });

  // ── КП (коммерческое предложение) PDF ────────────────────────────────────────────────────────────
  app.post("/api/generate-kp", limitGenerateKp, async (req, res) => {
    try {
      const parsed = generateKpBodySchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          error: "Проверьте поля формы",
          details: parsed.error.flatten(),
        });
        return;
      }
      const body = parsed.data;
      const {
        clientName,
        clientPhone,
        buildingType,
        buildingTypeId,
        length,
        width,
        height,
        services,
        servicesLabels,
        options,
        optionsLabels,
        region,
        priceMin,
        priceMax,
        constructionSite,
        frameType,
        frameStepM,
        roofPitchDeg,
        plinthM,
        thermalContour,
        craneLoad,
        fireResistance,
        gatesNote,
        doorsNote,
        latitude,
        longitude,
      } = body;

      const now = new Date();
      const appNumber =
        "FRN-" +
        now.getFullYear().toString().slice(-2) +
        String(now.getMonth() + 1).padStart(2, "0") +
        String(now.getDate()).padStart(2, "0") +
        String(Math.floor(Math.random() * 9000) + 1000);

      const date = now.toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const kpData: KpData = {
        appNumber,
        date,
        clientName,
        clientPhone,
        buildingType: buildingType ?? buildingTypeId,
        buildingTypeId,
        length,
        width,
        height,
        services: services ?? [],
        servicesLabels: servicesLabels ?? [],
        options: options ?? [],
        optionsLabels: optionsLabels ?? [],
        region: region ?? "",
        priceMin: priceMin ?? 0,
        priceMax: priceMax ?? 0,
        constructionSite,
        frameType,
        frameStepM,
        roofPitchDeg,
        plinthM,
        thermalContour,
        craneLoad,
        fireResistance,
        gatesNote,
        doorsNote,
      };

      const synced = estimateFromKpPayload({
        buildingTypeId: kpData.buildingTypeId,
        length: kpData.length,
        width: kpData.width,
        height: kpData.height,
        region: kpData.region,
        options: kpData.options,
        services: kpData.services,
        frameStepM: kpData.frameStepM,
        roofPitchDeg: kpData.roofPitchDeg,
      });
      if (synced) {
        kpData.priceMin = synced.totalMin;
        kpData.priceMax = synced.totalMax;
        kpData.services = synced.servicesForApi;
        kpData.options = synced.optionsForApi;
        const svcMap: Record<string, string> = {
          klyuch: "Под ключ (СМР + фундамент)",
          montazh: "Монтаж",
          izgotovlenie: "Комплект завода",
          proekt: "Проектирование",
        };
        kpData.servicesLabels = kpData.services.map(s => svcMap[s] || s);
        const optMap: Record<string, string> = {
          uteplenie: "Утепление",
          pokraska: "Покраска",
          ocinkovka: "Оцинковка",
          fundament: "Фундамент",
        };
        kpData.optionsLabels = kpData.options.map(o => optMap[o] || o);
      }

      if (WEBSTEEL_ENABLED) {
        try {
          const live = await fetchWebsteelEstimate({
            width: kpData.width,
            length: kpData.length,
            height: kpData.height,
            step: kpData.frameStepM || 6,
            region: typeof kpData.region === "string" ? kpData.region : undefined,
            latitude,
            longitude,
          });
          if (live?.totalCostRub && live.totalCostRub > 0) {
            kpData.priceMin = Math.round(live.totalCostRub * 0.99);
            kpData.priceMax = Math.round(live.totalCostRub * 1.01);
            kpData.websteelTotalRub = live.totalCostRub;
            if (live.lines && live.lines.length > 0) {
              kpData.websteelLines = live.lines;
            }
          }
        } catch (err) {
          console.warn("[generate-kp] WebSteel live pricing:", err);
        }
      }

      const pdfBuffer = await generateKpPdf(kpData);

      const filename = `КП_${date.replace(/\./g, ".")}_${buildingTypeId}_${length}x${width}x${height}.pdf`;

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
      res.setHeader("Content-Length", pdfBuffer.length);
      res.send(pdfBuffer);

      // Fire-and-forget: отправить PDF в MAX бот после ответа клиенту
      const maxCaption = [
        "📄 *КП сформировано — клиент скачал PDF*",
        "",
        `👤 Клиент: ${clientName}`,
        `📞 Телефон: ${clientPhone}`,
        `🏗️ Здание: ${buildingType} ${length}×${width}×${height} м`,
        `📍 Регион: ${region}`,
        `💰 Стоимость: ${kpData.priceMin.toLocaleString("ru-RU")} — ${kpData.priceMax.toLocaleString("ru-RU")} ₽`,
        `📋 Заявка: ${appNumber}`,
      ].join("\n");

      sendMaxPdf(pdfBuffer, filename, maxCaption).catch(e =>
        console.error("[MAX] Background PDF send error:", e)
      );
    } catch (e) {
      console.error("[generate-kp] Error:", e);
      res.status(500).json({ success: false, error: "Ошибка генерации PDF" });
    }
  });

  // ── WebSteel: только габариты/регион/координаты — без имён, телефонов и URL нашего сайта
  app.post("/api/vesta-estimate", limitVesta, async (req, res) => {
    if (!WEBSTEEL_ENABLED) {
      res.status(403).json({ success: false, error: "WebSteel pricing disabled (set WEBSTEEL_ENABLED=1)" });
      return;
    }
    try {
      const body = req.body || {};
      const width = Number(body.width);
      const length = Number(body.length);
      const height = Number(body.height);
      if (!Number.isFinite(width) || !Number.isFinite(length) || !Number.isFinite(height)) {
        res.status(400).json({ success: false, error: "width/length/height required" });
        return;
      }
      const la = Number(body.latitude);
      const lo = Number(body.longitude);
      const region =
        typeof body.region === "string" && body.region.trim().length > 0 ? body.region.trim() : undefined;
      const result = await fetchWebsteelEstimate({
        width,
        length,
        height,
        step: Number(body.step) || 6,
        region,
        ...(Number.isFinite(la) && Number.isFinite(lo) ? { latitude: la, longitude: lo } : {}),
      });
      if (!result?.totalCostRub) {
        res.status(502).json({ success: false, error: "WebSteel did not return a price" });
        return;
      }
      res.json({ success: true, ...result });
    } catch (e) {
      console.error("[vesta-estimate] Error:", e);
      res.status(500).json({ success: false, error: "WebSteel estimate failed" });
    }
  });

  // ── AI Chat (streaming via Groq) ─────────────────────────────────────────────────────────────────
  app.post("/api/ai/chat", limitAiChat, async (req, res) => {
    try {
      const { stream = false } = (req.body || {}) as { stream?: boolean };
      const normalized = normalizeChatMessages((req.body || {}).messages);
      if (!normalized) {
        res.status(400).json({
          error: `Некорректные сообщения: до ${AI_MAX_MESSAGES} пар user/assistant, текст до ${AI_MAX_CONTENT_CHARS} символов`,
        });
        return;
      }

      // Build messages with system prompt
      const groqMessages = [
        { role: "system" as const, content: FREONN_SYSTEM_PROMPT },
        ...normalized,
      ];

      if (stream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();

        let hasContent = false;
        try {
          for await (const chunk of groqChatStream(groqMessages, GROQ_CHAT_MODEL, 512)) {
            hasContent = true;
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          }
        } catch (streamErr) {
          console.error("[ai/chat] Stream error:", streamErr);
        }

        if (!hasContent) {
          res.write(`data: ${JSON.stringify({ content: FALLBACK_ANSWERS[0] })}\n\n`);
        }

        res.write("data: [DONE]\n\n");
        res.end();
        return;
      }

      res.json({ content: FALLBACK_ANSWERS[0], fallback: true });
    } catch (e) {
      console.error("[ai/chat] Error:", e);
      res.json({ content: FALLBACK_ANSWERS[0], fallback: true });
    }
  });

  app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) {
      next(err);
      return;
    }
    console.error("[express] Unhandled error:", err);
    res.status(500).json({ success: false, error: "Внутренняя ошибка сервера" });
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

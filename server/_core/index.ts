import "dotenv/config";
import express from "express";
import { createServer } from "http";
import multer from "multer";
import net from "net";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { ENV } from "./env";
import { rateLimit } from "./rateLimit";
import { applySecurityHeaders } from "./securityHeaders";
import { serveStatic, setupVite } from "./vite";
import { verifySessionToken, COOKIE_NAME } from "./auth";
import { createUploadAuthMiddleware } from "./uploadAuth";
import { createHlsProxyMiddleware } from "./hlsProxy";
import { parse as parseCookie } from "cookie";
import { getUploadDir } from "./paths";
import { startRecorderJobs } from "../jobs/recorder";
import fs from "fs";

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
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

export { getUploadDir };

function resolveBaseUrl(req: express.Request): string {
  const configured = (process.env.APP_PUBLIC_URL || "").replace(/\/+$/, "");
  if (configured) return configured;
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const proto = forwardedProto || req.protocol || "http";
  const host = req.get("host");
  return host ? `${proto}://${host}` : "";
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, getUploadDir());
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ limit: "10mb", extended: true }));
  app.use("/uploads", createUploadAuthMiddleware(), express.static(getUploadDir(), { maxAge: "30d", index: false }));

  applySecurityHeaders(app);

  const sendHealth = (_req: express.Request, res: express.Response) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ ok: true, env: process.env.NODE_ENV || "development" });
  };
  app.get("/api/health", sendHealth);
  app.get("/health", sendHealth);

  const requireUploadAuth: express.RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const cookies = parseCookie(req.headers.cookie ?? "");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : cookies[COOKIE_NAME];
    if (!token) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }
    const payload = await verifySessionToken(token);
    if (!payload) {
      res.status(401).json({ success: false, error: "Invalid token" });
      return;
    }
    next();
  };

  app.use("/api", rateLimit({ windowMs: 60_000, max: 300 }));

  app.post("/api/upload", requireUploadAuth, upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: "Файл не получен" });
        return;
      }
      const baseUrl = resolveBaseUrl(req);
      const url = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ success: true, url, filename: req.file.originalname, size: req.file.size });
    } catch (e) {
      console.error("[upload] Error:", e);
      res.status(500).json({ success: false, error: "Ошибка загрузки файла" });
    }
  });

  app.use("/api/hls", createHlsProxyMiddleware());

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error, path, type }) => {
        if (error.code === "INTERNAL_SERVER_ERROR") {
          console.error(`[tRPC] ${type} ${path ?? "<unknown>"}`, error);
        }
      },
    }),
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app);
  } else {
    serveStatic(app);
  }

  const preferredPort = Number(process.env.PORT) || 3000;
  const port = await findAvailablePort(preferredPort);
  server.listen(port, "0.0.0.0", () => {
    console.log(`[Freonn Platform] Server running on http://0.0.0.0:${port}`);
    startRecorderJobs();
  });
}

startServer().catch(e => {
  console.error("[Server] Failed to start:", e);
  process.exit(1);
});

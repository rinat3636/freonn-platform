import express, { type Express } from "express";
import compression from "compression";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { injectSsrBody } from "./htmlBodyPrerender";
import { getDocumentMetaForRequest, injectDocumentMeta } from "./htmlDocumentMeta";
import { injectSsrJsonLd } from "./htmlJsonLd";
import { sendCachedHtml } from "./htmlCacheHeaders";
import { buildHtmlSitemap } from "./seoFeeds";
import { isSpaRoute, normalizeSpaPathname } from "./seoRouteMatch";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);

  app.get("/karta-sajta", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buildHtmlSitemap());
  });

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html",
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      let page = await vite.transformIndexHtml(url, template);
      const pathname = normalizeSpaPathname(url);
      const ok = isSpaRoute(url);
      const meta = getDocumentMetaForRequest(pathname);
      if (meta) page = injectDocumentMeta(page, meta);
      page = injectSsrJsonLd(page, pathname);
      page = injectSsrBody(page, pathname);
      const status = ok ? 200 : 404;
      sendCachedHtml(res, req, { status, html: page, indexPath: clientTemplate, pathname });
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

let indexHtmlCache: { mtimeMs: number; html: string } | null = null;

function loadIndexHtml(indexPath: string): string {
  try {
    const st = fs.statSync(indexPath);
    if (!indexHtmlCache || indexHtmlCache.mtimeMs !== st.mtimeMs) {
      indexHtmlCache = { mtimeMs: st.mtimeMs, html: fs.readFileSync(indexPath, "utf-8") };
    }
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT" && indexHtmlCache) {
      console.warn(`loadIndexHtml: ${indexPath} missing, using cached HTML`);
    } else {
      throw e;
    }
  }
  if (!indexHtmlCache) throw new Error(`Could not load index.html at ${indexPath}`);
  return indexHtmlCache.html;
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Сжатие для статики и SSR-HTML
  app.use(compression({ filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res as any);
  } }));

  // Ассеты с hash в имени — immutable, 1 год. Прочая статика (кроме index.html) — 30 дней.
  const assetsPath = path.resolve(distPath, "assets");
  app.use("/assets", express.static(assetsPath, { maxAge: "1y", immutable: true, index: false }));
  app.use(express.static(distPath, { index: false, maxAge: "30d" }));

  app.get("/karta-sajta", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(buildHtmlSitemap());
  });

  app.use("*", (req, res) => {
    try {
      const pathname = normalizeSpaPathname(req.originalUrl);
      const ok = isSpaRoute(req.originalUrl);
      const status = ok ? 200 : 404;
      const indexPath = path.resolve(distPath, "index.html");
      let html = loadIndexHtml(indexPath);
      const meta = getDocumentMetaForRequest(pathname);
      if (meta) html = injectDocumentMeta(html, meta);
      html = injectSsrJsonLd(html, pathname);
      html = injectSsrBody(html, pathname);
      sendCachedHtml(res, req, { status, html, indexPath, pathname });
    } catch (e) {
      console.error("SSR render error:", e);
      if (!res.headersSent) {
        res.status(503).set("Retry-After", "10").send("Service temporarily unavailable");
      }
    }
  });
}

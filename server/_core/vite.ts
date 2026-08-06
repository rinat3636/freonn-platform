import express, { type Express } from "express";
import expressStaticGzip from "express-static-gzip";
import fs from "fs";
import path from "path";
import { sendCachedHtml } from "./htmlCacheHeaders";

export async function setupVite(app: Express) {
  const { createServer: createViteServer } = await import("vite");
  const configPath = path.resolve(process.cwd(), "vite.config.ts");
  const viteConfig = (await import(configPath)).default;
  const baseConfig = typeof viteConfig === "function" ? viteConfig({ mode: "development", command: "serve" }) : viteConfig;
  const vite = await createViteServer({
    ...baseConfig,
    configFile: false,
    server: {
      ...baseConfig.server,
      middlewareMode: true,
      allowedHosts: true as const,
    },
    appType: "spa",
  });

  app.use(vite.middlewares);
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
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  const assetsPath = path.resolve(distPath, "assets");
  const staticOptions: any = {
    setHeaders: (res: any, filePath: string) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      const fileName = path.basename(filePath);
      if (
        fileName.endsWith(".html") ||
        fileName === "sw.js" ||
        fileName === "site.webmanifest"
      ) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
      }
    },
    index: false,
  };

  // Serve pre-compressed build assets. Falls back to the uncompressed file if the
  // browser does not accept the encoding, avoiding runtime compression overhead.
  const gzipOptions = { enableBrotli: true, orderPreference: ["br", "gzip"], serveStatic: { maxAge: "1y", immutable: true, ...staticOptions } };
  app.use("/assets", expressStaticGzip(assetsPath, gzipOptions));
  app.use(expressStaticGzip(distPath, { enableBrotli: true, orderPreference: ["br", "gzip"], serveStatic: { maxAge: "30d", ...staticOptions } }));

  app.use("*", (req, res) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const html = loadIndexHtml(indexPath);
      sendCachedHtml(res, req, {
        status: 200,
        html,
        indexPath,
        pathname: req.path,
      });
    } catch (e) {
      console.error("SSR render error:", e);
      if (!res.headersSent) {
        res.status(503).set("Retry-After", "10").send("Service temporarily unavailable");
      }
    }
  });
}

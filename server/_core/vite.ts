import express, { type Express } from "express";
import compression from "compression";
import fs from "fs";
import path from "path";

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

  app.use(compression({ filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res as any);
  } }));

  const assetsPath = path.resolve(distPath, "assets");
  const corsStatic = { setHeaders: (res: express.Response) => res.setHeader("Access-Control-Allow-Origin", "*") };
  app.use("/assets", express.static(assetsPath, { maxAge: "1y", immutable: true, index: false, ...corsStatic }));
  app.use(express.static(distPath, { index: false, maxAge: "30d", ...corsStatic }));

  app.use("*", (req, res) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      const html = loadIndexHtml(indexPath);
      res.status(200).set({ "Content-Type": "text/html" }).send(html);
    } catch (e) {
      console.error("SSR render error:", e);
      if (!res.headersSent) {
        res.status(503).set("Retry-After", "10").send("Service temporarily unavailable");
      }
    }
  });
}

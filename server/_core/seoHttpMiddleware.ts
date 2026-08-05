import type { Express, Request, Response, NextFunction } from "express";

/**
 * Редиректы для канонического хоста и URL (Яндекс/Google).
 * В development не трогаем localhost.
 */
export function applySeoHttpMiddleware(app: Express): void {
  app.set("trust proxy", 1);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV !== "production") {
      next();
      return;
    }

    const hostRaw = req.hostname || "";
    const host = hostRaw.split(":")[0]?.toLowerCase() || "";
    if (host.startsWith("www.")) {
      const targetHost = host.slice(4);
      res.redirect(301, `https://${targetHost}${req.originalUrl || "/"}`);
      return;
    }

    if (host === "localhost" || host === "127.0.0.1") {
      next();
      return;
    }

    const xfProto = (req.get("x-forwarded-proto") || req.protocol || "https").split(",")[0]?.trim();
    if (xfProto === "http") {
      res.redirect(301, `https://${host}${req.originalUrl || "/"}`);
      return;
    }

    const pathRaw = req.path || "/";
    if (pathRaw.length > 1 && pathRaw.endsWith("/")) {
      const base = pathRaw.replace(/\/+$/, "") || "/";
      const q = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
      res.redirect(301, base + q);
      return;
    }

    // Не приводим к нижнему регистру пути к статике Vite: имена чанков содержат заглавные
    // буквы в хеше (например index-B82wXZNl.js). На Linux файл после редиректа на нижний регистр не находится,
    // express.static отдаёт 404 → приложение не грузится (белый экран).
    // Оставляем регистр для файлов верификации (.xml, например BingSiteAuth.xml) и прочей статики.
    const lower = pathRaw.toLowerCase();
    const isStaticExt = /\.(xml|txt|pdf|doc|docx|xls|xlsx|zip|rar|gz|json|svg|webp|png|jpg|jpeg|gif|ico|css|js|wasm)$/i.test(pathRaw);
    if (pathRaw !== lower && !pathRaw.startsWith("/assets/") && !pathRaw.startsWith("/images/") && !isStaticExt) {
      const q = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
      res.redirect(301, lower + q);
      return;
    }

    next();
  });
}

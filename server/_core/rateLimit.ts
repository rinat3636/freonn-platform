import type { RequestHandler } from "express";

type Bucket = { count: number; resetAt: number };

function pruneExpired(store: Map<string, Bucket>, now: number): void {
  if (store.size < 2000) return;
  store.forEach((b, k) => {
    if (now > b.resetAt) store.delete(k);
  });
}

/**
 * Лимит запросов по IP (fixed window). За reverse-proxy нужен `app.set("trust proxy", …)`.
 * Не останавливает распределённый парсинг — для этого WAF/CDN.
 */
export function rateLimit(options: { windowMs: number; max: number }): RequestHandler {
  const store = new Map<string, Bucket>();
  return (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    if (Math.random() < 0.02) pruneExpired(store, now);

    let b = store.get(ip);
    if (!b || now > b.resetAt) {
      b = { count: 0, resetAt: now + options.windowMs };
      store.set(ip, b);
    }
    b.count += 1;
    if (b.count > options.max) {
      const retrySec = Math.max(1, Math.ceil((b.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retrySec));
      res.setHeader("X-RateLimit-Limit", String(options.max));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.status(429).json({ error: "Слишком много запросов. Подождите немного и попробуйте снова." });
      return;
    }
    res.setHeader("X-RateLimit-Limit", String(options.max));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, options.max - b.count)));
    next();
  };
}

import type { Express } from "express";

function apiOrigin(): string {
  try {
    const url = process.env.VITE_FREONN_API_BASE_URL?.trim();
    return url ? new URL(url).origin : "";
  } catch {
    return "";
  }
}

function csp(): string {
  const api = apiOrigin();
  const connect = [
    "'self'",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://www.googletagmanager.com",
    "https://mc.yandex.ru",
    "https://yastatic.net",
    "https://*.max.ru",
    "https://platform-api.max.ru",
    api,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://mc.yandex.ru https://yastatic.net`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com https://mc.yandex.ru https://*.yandex.ru https://yastatic.net https://*.tile.openstreetmap.org https://tile.openstreetmap.org https://*.basemaps.cartocdn.com`,
    `connect-src ${connect}`,
    `media-src 'self'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
  ].join("; ");
}

export function applySecurityHeaders(app: Express): void {
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-DNS-Prefetch-Control", "off");
    res.setHeader("Content-Security-Policy", csp());
    res.setHeader("Connection", "close");
    res.setHeader(
      "Permissions-Policy",
      "accelerometer=(), camera=(), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(self), payment=(), usb=()",
    );
    next();
  });
}

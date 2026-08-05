import type { Request, Response } from "express";
import fs from "fs";
import { createHash } from "crypto";
import { blogPosts } from "../../client/src/data/blogPosts";
import { matchSeoRoute } from "./seoRouteMatch";

function maxTimeFromStrings(...dates: (string | undefined)[]): number {
  let max = 0;
  for (const d of dates) {
    if (!d) continue;
    const t = new Date(d).getTime();
    if (!Number.isNaN(t) && t > max) max = t;
  }
  return max;
}

const BLOG_INDEX_LAST_MS = (() => {
  let t = 0;
  for (const p of blogPosts) {
    const m = maxTimeFromStrings(p.publishDate, p.updateDate);
    if (m > t) t = m;
  }
  return t;
})();

function resolveHtmlLastModified(pathname: string, shellMtime: Date): Date {
  const shellMs = shellMtime.getTime();
  const m = matchSeoRoute(pathname);
  if (!m || m.kind === "home" || m.kind === "explicit_404") {
    return shellMtime;
  }
  if (m.kind === "blog_post") {
    const contentMs = maxTimeFromStrings(m.post.publishDate, m.post.updateDate);
    return contentMs > shellMs ? new Date(contentMs) : shellMtime;
  }
  if (m.kind === "blog_index") {
    if (BLOG_INDEX_LAST_MS <= 0) return shellMtime;
    return BLOG_INDEX_LAST_MS > shellMs ? new Date(BLOG_INDEX_LAST_MS) : shellMtime;
  }
  return shellMtime;
}

function imsNotModified(lastMod: Date, imsHeader: string | undefined): boolean {
  if (!imsHeader) return false;
  const since = new Date(imsHeader);
  if (Number.isNaN(since.getTime())) return false;
  const lmSec = Math.floor(lastMod.getTime() / 1000);
  const imSec = Math.floor(since.getTime() / 1000);
  return imSec >= lmSec;
}

function etagMatches(req: Request, etag: string): boolean {
  const inm = req.headers["if-none-match"];
  if (!inm) return false;
  const raw = Array.isArray(inm) ? inm.join(",") : inm;
  const parts = raw.split(",").map((s) => s.trim());
  return parts.some((p) => p === etag);
}

export function sendCachedHtml(
  res: Response,
  req: Request,
  opts: { status: number; html: string; indexPath: string; pathname: string },
): void {
  const st = fs.statSync(opts.indexPath);
  const shellMtime = st.mtime;
  const lastMod = resolveHtmlLastModified(opts.pathname, shellMtime);
  const lastModHttp = lastMod.toUTCString();
  const buf = Buffer.from(opts.html, "utf8");
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 20);
  const etag = `W/"${hash}"`;

  if (etagMatches(req, etag)) {
    res.status(304).set({ ETag: etag, "Last-Modified": lastModHttp }).end();
    return;
  }
  if (imsNotModified(lastMod, req.headers["if-modified-since"])) {
    res.status(304).set({ ETag: etag, "Last-Modified": lastModHttp }).end();
    return;
  }

  res
    .status(opts.status)
    .set({
      "Content-Type": "text/html; charset=utf-8",
      "Last-Modified": lastModHttp,
      ETag: etag,
      "Cache-Control": "public, max-age=0, must-revalidate",
    })
    .send(buf);
}

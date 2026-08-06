import type { RequestHandler } from "express";
import { Readable } from "node:stream";
import { eq } from "drizzle-orm";
import { resolveUserFromRequest } from "./auth";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { getProjectAccess, hasRole, type Access } from "../routers/_shared";
import { ENV } from "./env";

function parseHlsPath(reqUrl: string): { streamPath: string; resource: string } {
  const url = new URL(reqUrl, "http://_");
  const segments = url.pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  const streamPath = segments[0] ?? "";
  const resource = segments.slice(1).join("/") || "index.m3u8";
  return { streamPath: decodeURIComponent(streamPath), resource };
}

async function findCameraByStreamPath(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  streamPath: string
): Promise<schema.Camera | null> {
  const [byPath] = await db.select().from(schema.cameras).where(eq(schema.cameras.streamPath, streamPath)).limit(1);
  if (byPath) return byPath;

  if (streamPath.startsWith("cam-")) {
    const id = Number(streamPath.slice(4));
    if (Number.isFinite(id)) {
      const [byId] = await db.select().from(schema.cameras).where(eq(schema.cameras.id, id)).limit(1);
      if (byId && (!byId.streamPath || byId.streamPath === streamPath)) return byId;
    }
  }

  return null;
}

export function createHlsProxyMiddleware(): RequestHandler {
  return async (req, res) => {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { streamPath, resource } = parseHlsPath(req.url);
    if (!streamPath) {
      res.status(404).end();
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ success: false, error: "Database unavailable" });
      return;
    }

    const camera = await findCameraByStreamPath(db, streamPath);
    if (!camera) {
      res.status(404).end();
      return;
    }

    const access: Access | null = await getProjectAccess(db, user, camera.projectId);
    if (!access || !hasRole(access.role, "viewer")) {
      res.status(404).end();
      return;
    }

    const base = ENV.go2rtcApiUrl.replace(/\/$/, "");
    const upstream = `${base}/${encodeURIComponent(streamPath)}/${resource}`;

    try {
      const upstreamRes = await fetch(upstream, { method: req.method });
      if (!upstreamRes.ok) {
        res.status(upstreamRes.status).end();
        return;
      }

      res.status(upstreamRes.status);
      const contentType = upstreamRes.headers.get("content-type");
      const contentLength = upstreamRes.headers.get("content-length");
      if (contentType) res.setHeader("Content-Type", contentType);
      if (contentLength) res.setHeader("Content-Length", contentLength);

      if (upstreamRes.body) {
        const nodeStream = Readable.fromWeb(upstreamRes.body as any);
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      console.error("[hlsProxy] proxy error:", error);
      res.status(502).end();
    }
  };
}

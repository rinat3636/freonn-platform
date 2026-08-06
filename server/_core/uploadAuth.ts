import type { RequestHandler } from "express";
import { eq, like, and } from "drizzle-orm";
import { resolveUserFromRequest } from "./auth";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import { getProjectAccess, hasRole, type Access } from "../routers/_shared";

function parsePath(reqUrl: string): { segments: string[]; filename: string } {
  const url = new URL(reqUrl, "http://_");
  const rel = url.pathname.replace(/^\/+/, "");
  const segments = rel.split("/").filter(Boolean);
  const filename = segments[segments.length - 1] ?? "";
  return { segments, filename };
}

async function findProjectId(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  segments: string[],
  filename: string
): Promise<number | null> {
  const type = segments[0];

  if (segments.length === 1) {
    const pattern = `%/${filename}`;
    const [doc] = await db
      .select({ projectId: schema.documents.projectId })
      .from(schema.documents)
      .where(like(schema.documents.url, pattern))
      .limit(1);
    if (doc) return doc.projectId;

    const [media] = await db
      .select({ projectId: schema.media.projectId })
      .from(schema.media)
      .where(like(schema.media.url, pattern))
      .limit(1);
    if (media) return media.projectId;

    const [thumb] = await db
      .select({ projectId: schema.media.projectId })
      .from(schema.media)
      .where(like(schema.media.thumbnailUrl, pattern))
      .limit(1);
    if (thumb) return thumb.projectId;

    const [chat] = await db
      .select({ projectId: schema.chatMessages.projectId })
      .from(schema.chatMessages)
      .where(like(schema.chatMessages.attachmentUrl, pattern))
      .limit(1);
    return chat?.projectId ?? null;
  }

  if (segments.length === 3 && type === "recordings") {
    const cameraId = Number(segments[1]);
    if (!Number.isFinite(cameraId)) return null;

    const [rec] = await db
      .select({ cameraId: schema.cameraRecordings.cameraId })
      .from(schema.cameraRecordings)
      .where(and(eq(schema.cameraRecordings.cameraId, cameraId), eq(schema.cameraRecordings.segmentPath, segments[2])))
      .limit(1);
    if (!rec) return null;

    const [cam] = await db.select({ projectId: schema.cameras.projectId }).from(schema.cameras).where(eq(schema.cameras.id, rec.cameraId)).limit(1);
    return cam?.projectId ?? null;
  }

  if (segments.length === 3 && type === "snapshots") {
    const cameraId = Number(segments[1]);
    if (!Number.isFinite(cameraId)) return null;

    const pattern = `%/uploads/snapshots/${cameraId}/${filename}`;
    const [snap] = await db
      .select({ cameraId: schema.cameraSnapshots.cameraId })
      .from(schema.cameraSnapshots)
      .where(like(schema.cameraSnapshots.imageUrl, pattern))
      .limit(1);
    if (!snap) return null;

    const [cam] = await db.select({ projectId: schema.cameras.projectId }).from(schema.cameras).where(eq(schema.cameras.id, snap.cameraId)).limit(1);
    return cam?.projectId ?? null;
  }

  if (segments.length === 2 && type === "timelapse") {
    const cameraId = Number(filename.split("-")[0]);
    if (!Number.isFinite(cameraId)) return null;

    const [cam] = await db.select({ projectId: schema.cameras.projectId }).from(schema.cameras).where(eq(schema.cameras.id, cameraId)).limit(1);
    return cam?.projectId ?? null;
  }

  return null;
}

export function createUploadAuthMiddleware(): RequestHandler {
  return async (req, res, next) => {
    const user = await resolveUserFromRequest(req);
    if (!user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { segments, filename } = parsePath(req.url);
    if (!filename) {
      res.status(404).end();
      return;
    }

    const db = await getDb();
    if (!db) {
      res.status(503).json({ success: false, error: "Database unavailable" });
      return;
    }

    const projectId = await findProjectId(db, segments, filename);
    if (!projectId) {
      res.status(404).end();
      return;
    }

    const access: Access | null = await getProjectAccess(db, user, projectId);
    if (!access || !hasRole(access.role, "viewer")) {
      res.status(404).end();
      return;
    }

    next();
  };
}

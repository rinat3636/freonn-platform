import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm/table";
import { TRPCError } from "@trpc/server";
import fs from "node:fs";
import path from "node:path";
import { protectedProcedure, router } from "../_core/trpc";
import { cameras, cameraRecordings, cameraSnapshots } from "../../drizzle/schema";
import { getDbOrThrow, logActivity, requireProjectAccess } from "./_shared";
import { ENV } from "../_core/env";
import { getSnapshotDir, getRecordingDir } from "../_core/paths";
import { buildTimelapse } from "../jobs/recorder";

type Camera = InferSelectModel<typeof cameras>;

const cameraInput = z.object({
  projectId: z.number().int(),
  name: z.string().min(2),
  rtspUrl: z.string().url(),
  onvifConfig: z.record(z.string(), z.any()).optional(),
  recordingEnabled: z.boolean().default(true),
  retentionDays: z.number().int().default(14),
  streamPath: z.string().optional(),
});

const cameraUpdateInput = cameraInput.partial().extend({ id: z.number().int() });

function getStreamPath(camera: Camera): string {
  return camera.streamPath ?? `cam-${camera.id}`;
}

function getHlsUrl(camera: Camera): string {
  const base = ENV.go2rtcPublicUrl.replace(/\/$/, "");
  return `${base}/${getStreamPath(camera)}/index.m3u8`;
}

async function syncCameraToGo2rtc(camera: Camera) {
  const path = getStreamPath(camera);
  const base = ENV.go2rtcApiUrl.replace(/\/$/, "");
  const url = `${base}/api/streams?src=${encodeURIComponent(camera.rtspUrl)}&name=${encodeURIComponent(path)}`;
  try {
    await fetch(url, { method: "PUT" });
  } catch (e) {
    console.warn("[go2rtc] failed to sync camera", camera.id, e);
  }
}

async function removeCameraFromGo2rtc(camera: Camera) {
  const path = getStreamPath(camera);
  const base = ENV.go2rtcApiUrl.replace(/\/$/, "");
  try {
    await fetch(`${base}/api/streams?src=${encodeURIComponent(path)}`, { method: "DELETE" });
  } catch (e) {
    console.warn("[go2rtc] failed to remove camera", camera.id, e);
  }
}

export const camerasRouter = router({
  list: protectedProcedure.input(z.object({ projectId: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "viewer");
    const rows = await db.select().from(cameras).where(eq(cameras.projectId, input.projectId));
    return rows.map(c => ({
      ...c,
      hlsUrl: getHlsUrl(c),
      streamPath: getStreamPath(c),
    }));
  }),

  create: protectedProcedure.input(cameraInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    await requireProjectAccess(db, ctx.user, input.projectId, "admin");
    const result = await db.insert(cameras).values({
      projectId: input.projectId,
      name: input.name,
      rtspUrl: input.rtspUrl,
      onvifConfig: input.onvifConfig ?? {},
      recordingEnabled: input.recordingEnabled,
      retentionDays: input.retentionDays,
      streamPath: input.streamPath,
      status: "offline",
    });
    const cameraId = Number(result[0]?.insertId);
    const [created] = await db.select().from(cameras).where(eq(cameras.id, cameraId)).limit(1);
    await syncCameraToGo2rtc(created);
    await logActivity(db, input.projectId, ctx.user.id, "CAMERA_ADDED", "camera", cameraId, { name: input.name });
    return { ...created, hlsUrl: getHlsUrl(created), streamPath: getStreamPath(created) };
  }),

  update: protectedProcedure.input(cameraUpdateInput).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [existing] = await db.select().from(cameras).where(eq(cameras.id, input.id)).limit(1);
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Камера не найдена" });
    await requireProjectAccess(db, ctx.user, existing.projectId, "admin");
    const values: Partial<typeof existing> = {};
    if (input.name !== undefined) values.name = input.name;
    if (input.rtspUrl !== undefined) values.rtspUrl = input.rtspUrl;
    if (input.onvifConfig !== undefined) values.onvifConfig = input.onvifConfig;
    if (input.recordingEnabled !== undefined) values.recordingEnabled = input.recordingEnabled;
    if (input.retentionDays !== undefined) values.retentionDays = input.retentionDays;
    if (input.streamPath !== undefined) values.streamPath = input.streamPath;
    await db.update(cameras).set(values).where(eq(cameras.id, input.id));
    const [updated] = await db.select().from(cameras).where(eq(cameras.id, input.id)).limit(1);
    await syncCameraToGo2rtc(updated);
    await logActivity(db, existing.projectId, ctx.user.id, "CAMERA_UPDATED", "camera", input.id, values as Record<string, unknown>);
    return { ...updated, hlsUrl: getHlsUrl(updated), streamPath: getStreamPath(updated) };
  }),

  delete: protectedProcedure.input(z.object({ id: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [existing] = await db.select().from(cameras).where(eq(cameras.id, input.id)).limit(1);
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Камера не найдена" });
    await requireProjectAccess(db, ctx.user, existing.projectId, "admin");
    await removeCameraFromGo2rtc(existing);
    await db.delete(cameras).where(eq(cameras.id, input.id));
    await logActivity(db, existing.projectId, ctx.user.id, "CAMERA_DELETED", "camera", input.id);
    return { success: true };
  }),

  recordings: protectedProcedure.input(z.object({ cameraId: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [cam] = await db.select().from(cameras).where(eq(cameras.id, input.cameraId)).limit(1);
    if (!cam) throw new TRPCError({ code: "NOT_FOUND", message: "Камера не найдена" });
    await requireProjectAccess(db, ctx.user, cam.projectId, "viewer");
    const rows = await db
      .select()
      .from(cameraRecordings)
      .where(eq(cameraRecordings.cameraId, input.cameraId))
      .orderBy(desc(cameraRecordings.startedAt))
      .limit(100);
    return rows.map((r) => ({
      ...r,
      url: `/uploads/recordings/${cam.id}/${r.segmentPath}`,
    }));
  }),

  snapshots: protectedProcedure.input(z.object({ cameraId: z.number().int() })).query(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [cam] = await db.select().from(cameras).where(eq(cameras.id, input.cameraId)).limit(1);
    if (!cam) throw new TRPCError({ code: "NOT_FOUND", message: "Камера не найдена" });
    await requireProjectAccess(db, ctx.user, cam.projectId, "viewer");
    const rows = await db
      .select()
      .from(cameraSnapshots)
      .where(eq(cameraSnapshots.cameraId, input.cameraId))
      .orderBy(desc(cameraSnapshots.takenAt))
      .limit(100);
    return rows;
  }),

  createSnapshot: protectedProcedure.input(z.object({ cameraId: z.number().int() })).mutation(async ({ ctx, input }) => {
    const db = await getDbOrThrow();
    const [cam] = await db.select().from(cameras).where(eq(cameras.id, input.cameraId)).limit(1);
    if (!cam) throw new TRPCError({ code: "NOT_FOUND", message: "Камера не найдена" });
    await requireProjectAccess(db, ctx.user, cam.projectId, "viewer");

    const streamPath = getStreamPath(cam);
    const base = ENV.go2rtcApiUrl.replace(/\/$/, "");
    const frameUrl = `${base}/api/frame.jpeg?src=${encodeURIComponent(streamPath)}`;

    const res = await fetch(frameUrl);
    if (!res.ok) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Не удалось получить кадр с камеры" });
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const dir = getSnapshotDir(cam.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const now = new Date();
    const fileName = `${now.toISOString().replace(/[:.]/g, "-")}.jpg`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, buffer);
    const imageUrl = `/uploads/snapshots/${cam.id}/${fileName}`;

    const result = await db.insert(cameraSnapshots).values({
      cameraId: input.cameraId,
      takenAt: now,
      imageUrl,
      triggeredBy: "user",
    });
    const snapshotId = Number(result[0]?.insertId);
    await logActivity(db, cam.projectId, ctx.user.id, "CAMERA_SNAPSHOT", "cameraSnapshot", snapshotId);
    return { id: snapshotId, imageUrl };
  }),

  createTimelapse: protectedProcedure
    .input(
      z.object({
        cameraId: z.number().int(),
        start: z.string().datetime(),
        end: z.string().datetime(),
        fps: z.number().int().default(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();
      const [cam] = await db.select().from(cameras).where(eq(cameras.id, input.cameraId)).limit(1);
      if (!cam) throw new TRPCError({ code: "NOT_FOUND", message: "Камера не найдена" });
      await requireProjectAccess(db, ctx.user, cam.projectId, "viewer");
      const url = await buildTimelapse(input.cameraId, new Date(input.start), new Date(input.end), input.fps);
      if (!url) {
        throw new TRPCError({ code: "UNPROCESSABLE_CONTENT", message: "Недостаточно кадров для таймлапса" });
      }
      await logActivity(db, cam.projectId, ctx.user.id, "TIMELAPSE_CREATED", "camera", input.cameraId);
      return { url };
    }),
});

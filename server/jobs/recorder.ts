import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { cameras, cameraRecordings, cameraSnapshots } from "../../drizzle/schema";
import { getDb } from "../db";
import { ENV } from "../_core/env";
import { getRecordingDir, getSnapshotDir, getTimelapseDir } from "../_core/paths";

const activeRecordings = new Map<number, ChildProcess>();

function getInternalHlsUrl(streamPath: string): string {
  const base = ENV.go2rtcApiUrl.replace(/\/$/, "");
  return `${base}/${streamPath}/index.m3u8`;
}

function getFrameUrl(streamPath: string): string {
  const base = ENV.go2rtcApiUrl.replace(/\/$/, "");
  return `${base}/api/frame.jpeg?src=${encodeURIComponent(streamPath)}`;
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function cleanupOldFiles(dir: string, retentionDays: number) {
  if (!fs.existsSync(dir)) return;
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.mtimeMs < cutoff) {
      fs.rmSync(full, { recursive: true, force: true });
    }
  }
}

function stopRecording(cameraId: number) {
  const proc = activeRecordings.get(cameraId);
  if (proc) {
    proc.kill("SIGTERM");
    activeRecordings.delete(cameraId);
  }
}

function startRecording(camera: typeof cameras.$inferSelect) {
  const cameraId = camera.id;
  const streamPath = camera.streamPath ?? `cam-${cameraId}`;
  const input = getInternalHlsUrl(streamPath);
  const outDir = getRecordingDir(cameraId);
  ensureDir(outDir);

  const outPattern = path.join(outDir, "%Y%m%d-%H%M%S.mp4");
  const args = [
    "-hide_banner",
    "-loglevel", "error",
    "-fflags", "+discardcorrupt",
    "-i", input,
    "-c", "copy",
    "-f", "segment",
    "-segment_time", "60",
    "-reset_timestamps", "1",
    "-strftime", "1",
    "-segment_format", "mp4",
    outPattern,
  ];

  const proc = spawn("ffmpeg", args, { detached: false });
  activeRecordings.set(cameraId, proc);

  proc.on("exit", (code) => {
    activeRecordings.delete(cameraId);
    if (code !== 0 && code !== null) {
      console.warn(`[recorder] ffmpeg exited for camera ${cameraId} code=${code}, restarting in 10s`);
      setTimeout(() => startRecording(camera), 10_000);
    }
  });

  proc.on("error", (err) => {
    console.error(`[recorder] ffmpeg spawn error camera ${cameraId}:`, err.message);
    activeRecordings.delete(cameraId);
  });

  proc.stderr.on("data", (data: Buffer) => {
    const msg = data.toString().trim();
    if (msg) console.error(`[recorder] camera ${cameraId}:`, msg);
  });
}

export async function syncRecordings() {
  try {
    const db = await getDb();
    if (!db) return;
    const cams = await db.select().from(cameras).where(eq(cameras.recordingEnabled, true));

    for (const cam of cams) {
      cleanupOldFiles(getRecordingDir(cam.id), cam.retentionDays ?? 14);
      if (!activeRecordings.has(cam.id)) {
        startRecording(cam);
      }
    }

    for (const id of Array.from(activeRecordings.keys())) {
      if (!cams.find((c) => c.id === id)) {
        stopRecording(id);
      }
    }
  } catch (e) {
    console.error("[recorder] syncRecordings error:", e);
  }
}

async function indexRecordings() {
  try {
    const db = await getDb();
    if (!db) return;
    const cams = await db.select().from(cameras);

    for (const cam of cams) {
      const dir = getRecordingDir(cam.id);
      if (!fs.existsSync(dir)) continue;
      const files = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".mp4"))
        .sort();

      for (const file of files) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        const startedAt = new Date(stat.mtimeMs - 60_000);
        const startedAtStr = file.replace(".mp4", "");
        const parsed = Date.parse(
          `${startedAtStr.slice(0, 4)}-${startedAtStr.slice(4, 6)}-${startedAtStr.slice(6, 8)}T${startedAtStr.slice(9, 11)}:${startedAtStr.slice(11, 13)}:${startedAtStr.slice(13, 15)}`
        );
        if (!isNaN(parsed)) {
          startedAt.setTime(parsed);
        }
        const existing = await db
          .select()
          .from(cameraRecordings)
          .where(and(eq(cameraRecordings.cameraId, cam.id), eq(cameraRecordings.segmentPath, file)))
          .limit(1);
        if (existing.length === 0) {
          await db.insert(cameraRecordings).values({
            cameraId: cam.id,
            startedAt,
            endedAt: new Date(startedAt.getTime() + 60_000),
            segmentPath: file,
            durationSec: 60,
          });
        }
      }
    }
  } catch (e) {
    console.error("[recorder] indexRecordings error:", e);
  }
}

export async function captureScheduledSnapshot(camera: typeof cameras.$inferSelect) {
  try {
    const cameraId = camera.id;
    const streamPath = camera.streamPath ?? `cam-${cameraId}`;
    const frameUrl = getFrameUrl(streamPath);
    const res = await fetch(frameUrl);
    if (!res.ok) {
      console.warn(`[recorder] snapshot fetch failed for camera ${cameraId}: ${res.status}`);
      return;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const dir = getSnapshotDir(cameraId);
    ensureDir(dir);
    const now = new Date();
    const fileName = `${now.toISOString().replace(/[:.]/g, "-")}.jpg`;
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, buffer);

    const db = await getDb();
    if (db) {
      await db.insert(cameraSnapshots).values({
        cameraId,
        takenAt: now,
        imageUrl: `/uploads/snapshots/${cameraId}/${fileName}`,
        triggeredBy: "schedule",
      });
    }
  } catch (e) {
    console.error(`[recorder] captureScheduledSnapshot error camera ${camera.id}:`, e);
  }
}

export async function syncScheduledSnapshots() {
  try {
    const db = await getDb();
    if (!db) return;
    const cams = await db.select().from(cameras).where(eq(cameras.recordingEnabled, true));
    for (const cam of cams) {
      cleanupOldFiles(getSnapshotDir(cam.id), cam.retentionDays ?? 14);
      await captureScheduledSnapshot(cam);
    }
  } catch (e) {
    console.error("[recorder] syncScheduledSnapshots error:", e);
  }
}

export async function buildTimelapse(
  cameraId: number,
  start: Date,
  end: Date,
  fps = 10
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const snapshots = await db
    .select()
    .from(cameraSnapshots)
    .where(
      and(
        eq(cameraSnapshots.cameraId, cameraId),
        eq(cameraSnapshots.triggeredBy, "schedule"),
        gte(cameraSnapshots.takenAt, start),
        lte(cameraSnapshots.takenAt, end)
      )
    )
    .orderBy(cameraSnapshots.takenAt);

  if (snapshots.length < 2) return null;

  const outDir = getTimelapseDir();
  ensureDir(outDir);
  const outFile = path.join(outDir, `${cameraId}-${start.toISOString().slice(0, 10)}-${end.toISOString().slice(0, 10)}.mp4`);

  const listFile = path.join(outDir, `.concat-${cameraId}-${Date.now()}.txt`);
  const lines = snapshots
    .map((s) => {
      const localPath = path.resolve(process.cwd(), s.imageUrl.replace(/^\/uploads\//, "uploads/"));
      if (!fs.existsSync(localPath)) return null;
      return `file '${localPath.replace(/'/g, "'\\''")}'\nduration 0.1`;
    })
    .filter(Boolean) as string[];

  if (lines.length < 2) return null;

  fs.writeFileSync(listFile, lines.join("\n"));

  return new Promise((resolve) => {
    const args = [
      "-hide_banner",
      "-loglevel", "error",
      "-f", "concat",
      "-safe", "0",
      "-i", listFile,
      "-vsync", "vfr",
      "-r", String(fps),
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      "-y",
      outFile,
    ];
    const proc = spawn("ffmpeg", args);
    proc.on("exit", (code) => {
      fs.rmSync(listFile, { force: true });
      if (code === 0) {
        resolve(`/uploads/timelapse/${path.basename(outFile)}`);
      } else {
        console.error(`[recorder] timelapse build failed for camera ${cameraId}`);
        resolve(null);
      }
    });
    proc.on("error", (err) => {
      console.error(`[recorder] timelapse ffmpeg error camera ${cameraId}:`, err.message);
      resolve(null);
    });
  });
}

export function startRecorderJobs() {
  syncRecordings();
  setInterval(syncRecordings, 60_000);
  indexRecordings();
  setInterval(indexRecordings, 60_000);
  syncScheduledSnapshots();
  setInterval(syncScheduledSnapshots, 15 * 60_000);
}

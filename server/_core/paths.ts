import path from "node:path";
import fs from "node:fs";
import { ENV } from "./env";

export function getUploadDir(): string {
  const dir = path.resolve(process.cwd(), ENV.uploadDir);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getRecordingDir(cameraId: number): string {
  const dir = path.resolve(getUploadDir(), "recordings", String(cameraId));
  return dir;
}

export function getSnapshotDir(cameraId: number): string {
  const dir = path.resolve(getUploadDir(), "snapshots", String(cameraId));
  return dir;
}

export function getTimelapseDir(): string {
  return path.resolve(getUploadDir(), "timelapse");
}

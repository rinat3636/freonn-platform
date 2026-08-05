/**
 * Сжимает крупные PNG в public/images/home → WebP (ширина max 1200, quality 82).
 * Запуск: pnpm run images:optimize
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "client", "public", "images", "home");

/** PNG/JPEG → WebP max 1200px */
const rasterIn = [
  "angar.png",
  "sklad.png",
  "production.png",
  "naves.png",
  "agro.png",
  "trade.png",
  "logo-ru.png",
];

for (const name of rasterIn) {
  const inputPath = path.join(dir, name);
  if (!fs.existsSync(inputPath)) {
    console.warn("skip (missing):", name);
    continue;
  }
  const base = name.replace(/\.(png|jpe?g)$/i, "");
  const outPath = path.join(dir, `${base}.webp`);
  await sharp(inputPath)
    .rotate()
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toFile(outPath);
  const inSize = fs.statSync(inputPath).size;
  const outSize = fs.statSync(outPath).size;
  console.log(`${name} → ${base}.webp  ${Math.round(inSize / 1024)}KB → ${Math.round(outSize / 1024)}KB`);
}

/**
 * Post-build HTML micro-optimizations.
 * - Convert render-blocking stylesheet to async via preload onload.
 * - Add explicit fetchpriority to hero LCP image preload.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INDEX_HTML = path.resolve(__dirname, "../dist/public/index.html");

function main() {
  let html = fs.readFileSync(INDEX_HTML, "utf-8");

  // Make the main stylesheet non-blocking while keeping it preloaded
  html = html.replace(
    /<link rel="stylesheet" crossorigin href="(\/assets\/index-[A-Za-z0-9_-]+\.css)">/,
    `<link rel="preload" as="style" href="$1" onload="this.rel='stylesheet'">\n    <noscript><link rel="stylesheet" href="$1"></noscript>`,
  );

  // Remove crossorigin attributes from module scripts and preloads.
  // Vite adds these by default, but they force CORS fetches even for same-origin
  // assets. For a self-hosted HTTP deployment we can rely on same-origin loading.
  html = html.replace(/ crossorigin(?=[\s>])/g, "");

  fs.writeFileSync(INDEX_HTML, html, "utf-8");
  console.log("[postbuild-optimize] HTML post-processing applied to", INDEX_HTML);
}

main();

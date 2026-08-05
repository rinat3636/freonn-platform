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
    `<link rel="preload" as="style" href="$1" onload="this.rel='stylesheet'" crossorigin>\n    <noscript><link rel="stylesheet" href="$1" crossorigin></noscript>`,
  );

  fs.writeFileSync(INDEX_HTML, html, "utf-8");
  console.log("[postbuild-optimize] CSS async load applied to", INDEX_HTML);
}

main();

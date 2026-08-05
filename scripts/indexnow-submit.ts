/**
 * Submit the sitemap (or all URLs) to IndexNow (Bing, Yandex, others).
 * Usage: pnpm dlx tsx scripts/indexnow-submit.ts [sitemap-url]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KEY = fs.readFileSync(
  path.resolve(__dirname, "../client/public/535095a7cdd05d3b7942a7a1e37bc37b5f91f9033f96e654e8cfdd8bb2f4c643.txt"),
  "utf-8",
).trim();
const HOST = "freonn.pro";
const SITEMAP = process.argv[2] || "https://freonn.pro/sitemap.xml";

async function fetchSitemapLocs(url: string): Promise<string[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const text = await res.text();
  const matches = text.matchAll(/<loc>([^<]+)<\/loc>/g);
  return Array.from(matches).map((m) => m[1].trim());
}

async function submitIndexNow(urls: string[]) {
  const payload = {
    host: HOST,
    key: KEY,
    keyLocation: `https://${HOST}/${KEY}.txt`,
    urlList: urls,
  };
  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow",
  ];
  const results: string[] = [];
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const body = await res.text();
      results.push(`${endpoint}: ${res.status} ${body.slice(0, 200)}`);
    } catch (e) {
      results.push(`${endpoint}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  return results;
}

async function main() {
  console.log(`Fetching sitemap ${SITEMAP}...`);
  const urls = await fetchSitemapLocs(SITEMAP);
  console.log(`Found ${urls.length} URLs. Submitting to IndexNow...`);
  const chunkSize = 10000;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    const results = await submitIndexNow(chunk);
    console.log(`Chunk ${i / chunkSize + 1}:`);
    results.forEach((r) => console.log("  ", r));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

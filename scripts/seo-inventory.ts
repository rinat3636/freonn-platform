/**
 * Генерирует docs/SEO/URL_INVENTORY.md из shared/seoInventory.ts
 * Запуск: pnpm seo:inventory
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getUrlInventoryBreakdown, totalSitemapUrlCount } from "../shared/seoInventory";
import { runSeoAudit } from "../shared/seoAuditChecks";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outPath = path.join(ROOT, "docs", "SEO", "URL_INVENTORY.md");

const audit = runSeoAudit();
const rows = getUrlInventoryBreakdown();
const total = totalSitemapUrlCount();
const today = new Date().toISOString().slice(0, 10);

const lines = [
  "# URL Inventory — freonn.pro",
  "",
  `> Auto-generated ${today} · \`pnpm seo:inventory\``,
  "",
  "## Summary",
  "",
  "| Metric | Count |",
  "|--------|------:|",
  `| Sitemap (audit) | ${audit.sitemapUrlCount} |`,
  `| Inventory sum | ${total} |`,
  `| Geo | ${audit.geoCount} |`,
  `| Size | ${audit.sizeCount} |`,
  `| Blog | ${audit.blogCount} |`,
  "",
  "## Breakdown by type",
  "",
  "| Type | Count | Data files | React | SSR | Turbo |",
  "|------|------:|------------|-------|-----|-------|",
  ...rows.map(
    (r) => `| ${r.type} | ${r.count} | ${r.dataFiles} | ${r.reactPage} | ${r.ssr} | ${r.turbo} |`,
  ),
  "",
  "## Matcher hub",
  "",
  "Все path → `server/_core/seoRouteMatch.ts` → `matchSeoRoute()`.",
  "",
];

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join("\n"), "utf-8");
console.log(`Wrote ${outPath} (${audit.sitemapUrlCount} sitemap URLs)`);

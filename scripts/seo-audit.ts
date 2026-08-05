/**
 * Быстрая проверка SEO-фидов перед/после деплоя.
 * Запуск: pnpm seo:audit
 */
import { blogPosts } from "../client/src/data/blogPosts";
import { allSizePages } from "../client/src/data/sizePages";
import { portfolioItems } from "../client/src/data/portfolioItems";
import { buildTurboXml, TURBO_SPLIT_THRESHOLD } from "../server/_core/seoFeeds";
import { runSeoAudit } from "../shared/seoAuditChecks";
import { runKeywordCoverageAudit } from "../shared/seoKeywordCoverage";

function countXmlTags(xml: string, tag: string): number {
  return (xml.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;
}

const turbo = buildTurboXml();
const audit = runSeoAudit();
const keywords = runKeywordCoverageAudit();

const moBlog = blogPosts.filter(
  (p) =>
    p.slug.includes("moskovskaya-oblast") ||
    p.slug.includes("-moskva") ||
    p.slug.includes("podmoskov"),
).length;

const skladTsekhSize = allSizePages.filter(
  (p) => p.slug.startsWith("/sklad-") || p.slug.startsWith("/tsekh-"),
).length;

const errors = audit.issues.filter((i) => i.level === "error");
const warns = audit.issues.filter((i) => i.level === "warn");
const metaWarns = warns.filter((i) => i.message.startsWith("Meta "));
const otherWarns = warns.filter((i) => !i.message.startsWith("Meta "));

console.log("=== Freonn SEO audit ===\n");
console.log("Counts");
console.log(`  Sitemap URLs:     ${audit.sitemapUrlCount}`);
console.log(`  Turbo items:      ${countXmlTags(turbo, "item")} (split threshold ${TURBO_SPLIT_THRESHOLD})`);
console.log(`  Geo pages:        ${audit.geoCount} (federal: ${audit.federalGeoCount} @ priority 0.50)`);
console.log(`  Size pages:       ${audit.sizeCount} (sklad/tsekh: ${skladTsekhSize})`);
console.log(`  Portfolio cases:  ${portfolioItems.length}`);
console.log(`  Blog posts:       ${audit.blogCount} (MO long-tail: ${moBlog})`);
console.log(`  SEO revision env: ${process.env.SEO_CONTENT_REVISION || "(not set)"}`);

console.log("\n--- URL inventory ---");
for (const row of audit.inventory) {
  console.log(`  ${row.type.padEnd(28)} ${String(row.count).padStart(4)}`);
}

console.log("\n--- Keyword coverage (Yandex Direct CSV) ---");
console.log(`  Total: ${keywords.total} · Covered: ${keywords.covered} (${keywords.pct}%)`);
for (const g of keywords.byGroup.slice(0, 8)) {
  console.log(`    ${g.group}: ${g.covered}/${g.total} (${g.pct}%)`);
}
if (keywords.gaps.length) {
  console.log(`  Top gaps (${keywords.gaps.length} shown):`);
  for (const g of keywords.gaps.slice(0, 5)) {
    console.log(`    [${g.group}] ${g.keyword} → ${g.suggestedUrl}`);
  }
}

console.log("\n--- Route / sitemap / SSR ---");
if ( errors.length === 0 && otherWarns.length === 0 && metaWarns.length === 0) {
  console.log("  OK — ошибок не найдено");
} else {
  for (const i of errors) console.log(`  ERROR: ${i.message}`);
  for (const i of otherWarns) console.log(`  WARN:  ${i.message}`);
  if (metaWarns.length) {
    console.log(`  WARN:  Meta title/desc outliers: ${metaWarns.length} (title>60 or desc>160)`);
  }
}

console.log("\nPost-deploy:");
console.log("  1. curl https://freonn.pro/sitemap.xml — >= 590 <loc>");
console.log("  2. curl sample URL — нет <!--SSR_BODY-->, есть ld-ssr-page");
console.log("  3. Yandex Webmaster + GSC → resubmit sitemap.xml + turbo.xml");
console.log("  4. SEO_CONTENT_REVISION=YYYY-MM-DD in Railway env");

if ( errors.length > 0) {
  console.log(`\nFAILED: ${ errors.length} error(s)`);
  process.exit(1);
}

console.log("\nPASSED");

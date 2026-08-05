/**
 * Автопроверки SEO: маршруты, sitemap, SSR-плейсхолдеры, цены geo.
 * Используется в scripts/seo-audit.ts и может подключаться в CI.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { blogPosts } from "../client/src/data/blogPosts";
import { allGeoPages, geoRubM2Value, geoSlugs, getGeoBySlug } from "../client/src/data/geoPages";
import { infoPages } from "../client/src/data/infoPages";
import { landingPages } from "../client/src/data/landingPages";
import { allLandingSubpages } from "../client/src/data/landingSubpages";
import { MO_HUB_SLUG } from "../client/src/data/moHubPage";
import { portfolioItems } from "../client/src/data/portfolioItems";
import { allSizePages } from "../client/src/data/sizePages";
import { CALCULATOR_BUILDING_TYPES } from "../shared/buildingCatalog";
import { injectSsrBody } from "../server/_core/htmlBodyPrerender";
import { getDocumentMetaForRequest, injectDocumentMeta } from "../server/_core/htmlDocumentMeta";
import { injectSsrJsonLd } from "../server/_core/htmlJsonLd";
import { buildSitemapXml } from "../server/_core/seoFeeds";
import { matchSeoRoute, normalizeSpaPathname } from "../server/_core/seoRouteMatch";
import { getUrlInventoryBreakdown, WOUTER_PARITY_SMOKE_PATHS } from "./seoInventory";
import { countFederalGeoPaths, regionTierForPath, geoSlugKeyFromGeoPath } from "./seoRegionTier";
import {
  blogPostDocumentTitle,
  geoDocumentTitle,
  landingDocumentTitle,
  polishMetaDescription,
  SEO_DESC_MAX,
  SEO_TITLE_MAX,
  sizeDocumentTitle,
} from "./seoTitleFormat";
import { sizePriceHintFromFloorPrice } from "./seoPagePresentation";
import { getGeoPricePerM2 } from "../client/src/data/geoPages";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export type AuditIssue = { level: "error" | "warn"; message: string };

function countXmlTags(xml: string, tag: string): number {
  return (xml.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;
}

function parseSitemapLocs(xml: string): string[] {
  return Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g), (m) => {
    try {
      return new URL(m[1]).pathname;
    } catch {
      return m[1];
    }
  });
}

function duplicateSlugs(slugs: string[], label: string): AuditIssue[] {
  const seen = new Map<string, number>();
  for (const s of slugs) seen.set(s, (seen.get(s) ?? 0) + 1);
  return Array.from(seen.entries())
    .filter(([, n]) => n > 1)
    .map(([s, n]) => ({ level: "error" as const, message: `${label}: дубль slug «${s}» (${n}×)` }));
}

function loadIndexTemplate(): string {
  const dist = path.join(ROOT, "server", "_core", "public", "index.html");
  const client = path.join(ROOT, "client", "index.html");
  if (fs.existsSync(dist)) return fs.readFileSync(dist, "utf-8");
  return fs.readFileSync(client, "utf-8");
}

/** Имитация production SSR-цепочки для pathname. */
export function renderSsrHtml(pathname: string): string {
  let html = loadIndexTemplate();
  const meta = getDocumentMetaForRequest(pathname);
  if (meta) html = injectDocumentMeta(html, meta);
  html = injectSsrJsonLd(html, pathname);
  html = injectSsrBody(html, pathname);
  return html;
}

export function auditSsrPlaceholders(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const paths = ["/", MO_HUB_SLUG, "/angary-moskva", "/sklad-1000-m2", "/angar-1000-m2-podolsk", "/angary/holodnye", "/bystrovozvodimye-zdaniya", "/angar-20x40-m2", "/zdaniya", "/blog"];

  for (const pathname of paths) {
    const html = renderSsrHtml(pathname);
    const label = pathname;
    if (html.includes("<!--SSR_BODY-->")) {
      issues.push({ level: "error", message: `SSR: «${label}» — не заменён <!--SSR_BODY-->` });
    }
    if (html.includes("<!--SSR_JSONLD-->")) {
      issues.push({ level: "error", message: `SSR: «${label}» — не заменён <!--SSR_JSONLD-->` });
    }
    if (!html.includes("ld-ssr-org")) {
      issues.push({ level: "error", message: `SSR: «${label}» — нет ld-ssr-org` });
    }
    if (matchSeoRoute(pathname) && matchSeoRoute(pathname)?.kind !== "explicit_404" && !html.includes("ld-ssr-page")) {
      issues.push({ level: "error", message: `SSR: «${label}» — нет ld-ssr-page` });
    }
    if (!html.includes('id="ssr-fallback"') && pathname !== "/404") {
      issues.push({ level: "warn", message: `SSR: «${label}» — нет ssr-fallback (текст для роботов)` });
    }
  }

  return issues;
}

export function auditRouteParity(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const sitemap = buildSitemapXml();
  const locs = parseSitemapLocs(sitemap);

  for (const loc of locs) {
    const pathname = normalizeSpaPathname(loc);
    const m = matchSeoRoute(pathname);
    if (!m) {
      issues.push({ level: "error", message: `Sitemap: ${pathname} — нет matchSeoRoute` });
    }
  }

  const mustBeInSitemap = [
    "/",
    MO_HUB_SLUG,
    "/zdaniya",
    "/blog",
    "/portfolio",
    ...landingPages.map((p) => p.slug),
    ...allLandingSubpages.map((p) => p.slug),
    ...allSizePages.map((p) => p.slug),
    ...geoSlugs,
    ...blogPosts.map((p) => p.slug),
  ];

  const locSet = new Set(locs);
  for (const p of mustBeInSitemap) {
    if (!locSet.has(p)) {
      issues.push({ level: "error", message: `Sitemap: отсутствует обязательный URL ${p}` });
    }
  }

  issues.push(
    ...duplicateSlugs(blogPosts.map((p) => p.slug), "Blog"),
    ...duplicateSlugs(portfolioItems.map((p) => p.slug), "Portfolio"),
    ...duplicateSlugs(infoPages.map((p) => p.slug), "Info"),
    ...duplicateSlugs(landingPages.map((p) => p.slug), "Landing"),
    ...duplicateSlugs(allLandingSubpages.map((p) => p.slug), "Landing sub"),
    ...duplicateSlugs(allSizePages.map((p) => p.slug), "Size"),
    ...duplicateSlugs(geoSlugs, "Geo"),
    ...duplicateSlugs(CALCULATOR_BUILDING_TYPES.map((t) => `/zdaniya/${t.id}`), "Building types"),
  );

  const authPaths = ["/auth/login", "/auth/app-callback"];
  for (const p of authPaths) {
    if (locSet.has(p)) {
      issues.push({ level: "error", message: `Sitemap: auth URL не должен индексироваться: ${p}` });
    }
    if (matchSeoRoute(p)) {
      issues.push({ level: "error", message: `SEO matcher: auth URL не должен матчиться: ${p}` });
    }
  }

  return issues;
}

/** Title и metaDescription должны содержать ту же ₽/m², что geoRubM2Value. */
export function auditGeoPriceConsistency(): AuditIssue[] {
  const issues: AuditIssue[] = [];

  for (const page of allGeoPages) {
    const expected = geoRubM2Value(page).toLocaleString("ru-RU");
    const hay = `${page.title} ${page.metaDescription}`;
    if (!hay.includes(expected)) {
      issues.push({
        level: "error",
        message: `Geo price: ${page.slug} — в title/meta нет ${expected} ₽/m² (geoRubM2Value)`,
      });
    }

    const perM2Label = `от ${expected}`;
    if (!page.metaDescription.includes(perM2Label)) {
      issues.push({
        level: "error",
        message: `Geo price: ${page.slug} — metaDescription не содержит «${perM2Label} ₽/m²»`,
      });
    }
    if (!page.title.includes(expected)) {
      issues.push({
        level: "warn",
        message: `Geo price: ${page.slug} — title не содержит число ${expected} ₽/m²`,
      });
    }
  }

  return issues;
}

export function auditGeoResolvable(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slug of geoSlugs) {
    if (!getGeoBySlug(slug)) {
      issues.push({ level: "error", message: `Geo: slug в geoSlugs, но getGeoBySlug=null: ${slug}` });
    }
  }
  return issues;
}

export function auditWouterParity(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const pathname of WOUTER_PARITY_SMOKE_PATHS) {
    const m = matchSeoRoute(pathname);
    if (!m) {
      issues.push({ level: "error", message: `Wouter parity: ${pathname} — matchSeoRoute=null (проверь App.tsx)` });
    }
  }
  return issues;
}

export function auditBlogRelatedPosts(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const slugs = new Set(blogPosts.map((p) => p.slug));
  for (const post of blogPosts) {
    for (const rel of post.relatedPosts) {
      if (!slugs.has(rel)) {
        issues.push({ level: "error", message: `Blog relatedPosts: ${post.slug} → missing ${rel}` });
      }
    }
  }
  return issues;
}

const TITLE_MAX = SEO_TITLE_MAX;
const DESC_MAX = SEO_DESC_MAX;

export function auditMetaLengthOutliers(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const check = (label: string, slug: string, title: string, desc: string) => {
    const d = polishMetaDescription(desc);
    if (title.length > TITLE_MAX) {
      issues.push({ level: "warn", message: `Meta title ${title.length}>${TITLE_MAX}: ${label} ${slug}` });
    }
    if (d.length > DESC_MAX) {
      issues.push({ level: "warn", message: `Meta desc ${d.length}>${DESC_MAX}: ${label} ${slug}` });
    }
  };

  for (const p of blogPosts) check("blog", p.slug, blogPostDocumentTitle(p.h1), p.metaDescription);
  for (const p of landingPages) check("landing", p.slug, landingDocumentTitle(p.h1, p.price), p.metaDescription ?? "");
  for (const p of allLandingSubpages) {
    check("landing-sub", p.slug, landingDocumentTitle(p.h1, p.price), p.metaDescription ?? "");
  }
  for (const p of allGeoPages) check("geo", p.slug, geoDocumentTitle(p.h1, getGeoPricePerM2(p)), p.metaDescription);
  for (const p of allSizePages) {
    check("size", p.slug, sizeDocumentTitle(p.h1, sizePriceHintFromFloorPrice(p.priceFrom)), p.metaDescription);
  }

  return issues;
}

/** Federal geo outside MO-first focus — candidates for trim / lower priority. */
export function auditFederalGeoTrimCandidates(): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slug of geoSlugs) {
    const tier = regionTierForPath(slug);
    if (tier === "federal") {
      const key = geoSlugKeyFromGeoPath(slug);
      issues.push({
        level: "warn",
        message: `Federal geo trim candidate: ${slug} (tier=federal, key=${key})`,
      });
    }
  }
  return issues;
}

export type SeoAuditSummary = {
  sitemapUrlCount: number;
  geoCount: number;
  federalGeoCount: number;
  sizeCount: number;
  blogCount: number;
  inventory: ReturnType<typeof getUrlInventoryBreakdown>;
  issues: AuditIssue[];
};

export function runSeoAudit(): SeoAuditSummary {
  const sitemap = buildSitemapXml();
  const issues: AuditIssue[] = [
    ...auditRouteParity(),
    ...auditSsrPlaceholders(),
    ...auditGeoPriceConsistency(),
    ...auditGeoResolvable(),
    ...auditWouterParity(),
    ...auditBlogRelatedPosts(),
    ...auditMetaLengthOutliers(),
  ];

  // Informational: federal geo list (warn-only, not a failure)
  if (process.env.SEO_AUDIT_FEDERAL_GEO === "1") {
    issues.push(...auditFederalGeoTrimCandidates());
  }

  if (!process.env.SEO_CONTENT_REVISION?.trim()) {
    issues.push({
      level: "warn",
      message: "SEO_CONTENT_REVISION не задан — lastmod массовых URL не обновится принудительно",
    });
  }

  return {
    sitemapUrlCount: countXmlTags(sitemap, "url"),
    geoCount: geoSlugs.length,
    federalGeoCount: countFederalGeoPaths(geoSlugs),
    sizeCount: allSizePages.length,
    blogCount: blogPosts.length,
    inventory: getUrlInventoryBreakdown(),
    issues,
  };
}

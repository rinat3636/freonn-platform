import { blogPosts } from "../../client/src/data/blogPosts";
import { CALCULATOR_BUILDING_TYPES, type CalculatorBuildingType } from "../../shared/buildingCatalog";
import { geoSlugs, getGeoBySlug, getGeoKind, getGeoPriceHint, getGeoPricePerM2, type GeoPage } from "../../client/src/data/geoPages";
import { MO_TIER1_SLUG_KEYS, MO_TIER2_SLUG_KEYS, MO_TIER3_SLUG_KEYS } from "../../client/src/data/moGeoCities";
import { moHubCityGroups, moHubFaqs, moHubPage, landingStandaloneSizeLinks } from "../../client/src/data/moHubPage";
import { infoPages, type InfoPage } from "../../client/src/data/infoPages";
import { landingPages, type LandingPage } from "../../client/src/data/landingPages";
import { allLandingSubpages } from "../../client/src/data/landingSubpages";
import { portfolioItems, type PortfolioItem } from "../../client/src/data/portfolioItems";
import { allSizePages, getSizeBuildingMeta, type SizePage } from "../../client/src/data/sizePages";
import {
  buildingKindLabel,
  isMoRegion,
  MO_HUB_BLOG_LINKS,
  MO_HUB_SLUG,
  moHubFeaturedComboLinks,
  moscowComboLinksForKind,
} from "@shared/moSeo";
import { isMoscowComboSize } from "@shared/seoSizes";
import { regionTierForPath, sitemapPriorityForRegionTier } from "@shared/seoRegionTier";
import { getMoHubSeeAlsoItems } from "../../client/src/data/seeAlsoForPages";
import {
  presentationBuildingType,
  presentationBuildingTypesIndex,
  presentationGeo,
  presentationLanding,
  presentationMoHub,
  presentationPortfolioCase,
  presentationSizePage,
} from "../../shared/seoPagePresentation";
import { blogSectionsToTurboHtml } from "../../shared/seoContentRender/blogSections";

const SITE = "https://freonn.pro";

/** lastmod для массовых URL: по датам блога и годам кейсов портфолио (без ручной константы). */
function resolveBulkStaticLastmod(): string {
  let maxMs = 0;
  for (const p of blogPosts) {
    for (const d of [p.publishDate, p.updateDate]) {
      if (!d) continue;
      const t = new Date(d).getTime();
      if (!Number.isNaN(t) && t > maxMs) maxMs = t;
    }
  }
  for (const c of portfolioItems) {
    const t = new Date(`${c.year}-09-01`).getTime();
    if (!Number.isNaN(t) && t > maxMs) maxMs = t;
  }
  const rev = (process.env.SEO_CONTENT_REVISION || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(rev)) {
    const t = new Date(`${rev}T12:00:00.000Z`).getTime();
    if (!Number.isNaN(t) && t > maxMs) maxMs = t;
  }

  const nowMs = Date.now();
  if (maxMs > nowMs) maxMs = nowMs;
  if (maxMs === 0) return new Date().toISOString().slice(0, 10);
  return new Date(maxMs).toISOString().slice(0, 10);
}

function xmlEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isoDate(d: string | undefined): string {
  if (!d) return new Date().toISOString().slice(0, 10);
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return new Date().toISOString().slice(0, 10);
  return x.toISOString().slice(0, 10);
}

function rfc822(d: string): string {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return new Date().toUTCString();
  return x.toUTCString().replace("GMT", "+0000");
}

const LANDING_PRIORITY_SLUGS = new Set([
  "/angary",
  "/sklady",
  "/proizvodstvennye-zdaniya",
  "/bystrovozvodimye-zdaniya",
  "/sendvich-paneli",
  "/metallokonstruktsii",
  "/navesy",
]);

const LANDING_SUB_PATH =
  /^\/(angary|sklady|proizvodstvennye-zdaniya|selskokhozyaystvennye-zdaniya|torgovye-zdaniya|sportivnye-sooruzheniya|bystrovozvodimye-zdaniya|sendvich-paneli|metallokonstruktsii|navesy)\/[^/]+$/;

function sitemapPriorityForPath(path: string): { priority: string; changefreq: string } {
  if (path === "/") return { priority: "1.0", changefreq: "weekly" };
  if (path === MO_HUB_SLUG) return { priority: "0.96", changefreq: "weekly" };
  if (path.endsWith("-m2-moskva")) return { priority: "0.92", changefreq: "monthly" };
  if (/^\/(?:angar|sklad|tsekh)-\d+-m2-[a-z0-9-]+$/.test(path)) {
    return { priority: sitemapPriorityForRegionTier(regionTierForPath(path), "0.88"), changefreq: "monthly" };
  }
  if (/^\/angar-\d+x\d+-m2$/.test(path)) return { priority: "0.85", changefreq: "monthly" };
  if (/^\/(sklad|tsekh)-\d+-m2$/.test(path)) return { priority: "0.88", changefreq: "monthly" };
  if (/^\/angar-\d+-m2$/.test(path)) return { priority: "0.86", changefreq: "monthly" };
  if (path.includes("-moskva")) return { priority: "0.95", changefreq: "weekly" };
  if (MO_TIER1_SLUG_KEYS.some((k) => path.endsWith(`-${k}`))) return { priority: "0.88", changefreq: "monthly" };
  if (MO_TIER2_SLUG_KEYS.some((k) => path.endsWith(`-${k}`))) return { priority: "0.84", changefreq: "monthly" };
  if (MO_TIER3_SLUG_KEYS.some((k) => path.endsWith(`-${k}`))) return { priority: "0.80", changefreq: "monthly" };
  if (LANDING_PRIORITY_SLUGS.has(path)) return { priority: "0.9", changefreq: "weekly" };
  if (LANDING_SUB_PATH.test(path)) {
    return { priority: "0.86", changefreq: "monthly" };
  }
  if (path.startsWith("/portfolio/")) return { priority: "0.72", changefreq: "monthly" };
  if (path.startsWith("/blog/") && (path.includes("moskovskaya-oblast") || path.includes("-moskva") || path.includes("podmoskov"))) {
    return { priority: "0.68", changefreq: "monthly" };
  }
  if (path.startsWith("/blog/")) return { priority: "0.6", changefreq: "monthly" };
  if (geoSlugs.includes(path)) {
    const tier = regionTierForPath(path);
    return { priority: sitemapPriorityForRegionTier(tier, "0.75"), changefreq: "monthly" };
  }
  return { priority: "0.8", changefreq: "monthly" };
}

type SitemapUrl = { loc: string; lastmod: string; changefreq: string; priority: string };

function getSitemapUrls(): SitemapUrl[] {
  const today = new Date().toISOString().slice(0, 10);
  const bulkLastmod = resolveBulkStaticLastmod();
  const urls: SitemapUrl[] = [];

  urls.push({ loc: `${SITE}/`, lastmod: today, ...sitemapPriorityForPath("/") });
  urls.push({ loc: `${SITE}${MO_HUB_SLUG}`, lastmod: today, ...sitemapPriorityForPath(MO_HUB_SLUG) });
  urls.push({ loc: `${SITE}/blog`, lastmod: today, changefreq: "weekly", priority: "0.7" });
  urls.push({ loc: `${SITE}/zdaniya`, lastmod: bulkLastmod, changefreq: "weekly", priority: "0.82" });
  urls.push({ loc: `${SITE}/rekvizity`, lastmod: bulkLastmod, changefreq: "yearly", priority: "0.4" });
  urls.push({ loc: `${SITE}/portfolio`, lastmod: bulkLastmod, changefreq: "monthly", priority: "0.85" });
  urls.push({ loc: `${SITE}/karta-sajta`, lastmod: today, changefreq: "monthly", priority: "0.5" });

  for (const ip of infoPages) {
    urls.push({ loc: `${SITE}${ip.slug}`, lastmod: bulkLastmod, changefreq: "monthly", priority: "0.55" });
  }
  for (const c of portfolioItems) {
    urls.push({
      loc: `${SITE}${c.slug}`,
      lastmod: `${c.year}-09-01`,
      ...sitemapPriorityForPath(c.slug),
    });
  }

  for (const p of [...landingPages, ...allLandingSubpages]) {
    urls.push({ loc: `${SITE}${p.slug}`, lastmod: bulkLastmod, ...sitemapPriorityForPath(p.slug) });
  }
  for (const s of allSizePages) {
    urls.push({ loc: `${SITE}${s.slug}`, lastmod: bulkLastmod, ...sitemapPriorityForPath(s.slug) });
  }
  for (const bt of CALCULATOR_BUILDING_TYPES) {
    urls.push({
      loc: `${SITE}/zdaniya/${encodeURIComponent(bt.id)}`,
      lastmod: bulkLastmod,
      changefreq: "monthly",
      priority: "0.78",
    });
  }
  for (const slug of geoSlugs) {
    urls.push({ loc: `${SITE}${slug}`, lastmod: bulkLastmod, ...sitemapPriorityForPath(slug) });
  }
  for (const post of blogPosts) {
    urls.push({
      loc: `${SITE}${post.slug}`,
      lastmod: isoDate(post.updateDate || post.publishDate),
      ...sitemapPriorityForPath(post.slug),
    });
  }

  return urls;
}

export function buildSitemapXml(): string {
  const urls = getSitemapUrls();
  urls.push({
    loc: `${SITE}/llms.txt`,
    lastmod: new Date().toISOString().slice(0, 10),
    changefreq: "weekly",
    priority: "0.3",
  });
  const body = urls
    .map(
      (u) =>
        `  <url><loc>${xmlEscape(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sitemapCategory(path: string): string {
  if (path === "/") return "Главная";
  if (path === MO_HUB_SLUG) return "Московская область";
  if (path.startsWith("/blog/")) return "Блог";
  if (path === "/blog") return "Блог";
  if (path.startsWith("/portfolio/")) return "Портфолио";
  if (path === "/portfolio") return "Портфолио";
  if (path.startsWith("/zdaniya/")) return "Типы зданий";
  if (path === "/zdaniya") return "Каталог типов";
  if (/^\/(angary|sklady|proizvodstvennye-zdaniya|selskokhozyaystvennye-zdaniya|torgovye-zdaniya|sportivnye-sooruzheniya|bystrovozvodimye-zdaniya|sendvich-paneli|metallokonstruktsii|navesy)(\/|$)/.test(path)) return "Услуги";
  if (/^\/(angar|sklad|tsekh)-\d+-m2/.test(path)) return "Размеры";
  if (/^\/(angary|sklady|proizvodstvennye-zdaniya)-/.test(path)) return "Регионы";
  if (infoPages.some((p) => p.slug === path)) return "Информация";
  return "Другое";
}

export function buildHtmlSitemap(): string {
  const urls = getSitemapUrls();
  const grouped: Record<string, string[]> = {};
  for (const u of urls) {
    const cat = sitemapCategory(new URL(u.loc).pathname);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(`<li><a href="${htmlEscape(u.loc)}">${htmlEscape(new URL(u.loc).pathname || "/")}</a></li>`);
  }
  const categoryOrder = ["Главная", "Услуги", "Каталог типов", "Типы зданий", "Размеры", "Регионы", "Московская область", "Блог", "Портфолио", "Информация", "Другое"];
  const sections = categoryOrder
    .filter((cat) => grouped[cat])
    .map((cat) => `<section><h2>${htmlEscape(cat)}</h2><ul>${grouped[cat].slice(0, 500).join("")}</ul></section>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="ru-RU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Карта сайта Freonn — все страницы</title>
<meta name="description" content="Полная карта сайта Freonn: услуги, регионы, размеры, блог, портфолио. Найдите нужную страницу быстро.">
<link rel="canonical" href="${SITE}/karta-sajta">
<link rel="sitemap" type="application/xml" title="Sitemap" href="${SITE}/sitemap.xml">
<style>
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;background:#f8f8f8;color:#1a1a2e;line-height:1.65;padding:24px 20px;max-width:1200px;margin:0 auto}
h1{font-size:1.8rem;margin:0 0 1rem}
h2{font-size:1.25rem;margin:2rem 0 .75rem;border-bottom:1px solid #ddd;padding-bottom:.25rem}
ul{column-count:1;column-gap:24px;margin:0;padding-left:1.2rem}
@media(min-width:768px){ul{column-count:2}}
@media(min-width:1200px){ul{column-count:3}}
li{margin:0 0 .35rem;break-inside:avoid}
a{color:#c41e3a;text-decoration:none}
a:hover{text-decoration:underline}
</style>
</head>
<body>
<h1>Карта сайта Freonn</h1>
<p>Полная карта всех страниц сайта. <a href="${SITE}/sitemap.xml">XML Sitemap</a></p>
${sections}
</body>
</html>`;
}

function escapeCdataHtml(html: string): string {
  return html.replace(/\]\]>/g, "]]]]><![CDATA[>");
}

function infoPageTurboHtml(page: InfoPage): string {
  const parts: string[] = [];
  parts.push(`<h1>${xmlEscape(page.h1)}</h1>`);
  parts.push(`<p>${xmlEscape(page.lead)}</p>`);
  for (const s of page.sections.slice(0, 24)) {
    parts.push(`<h2>${xmlEscape(s.heading)}</h2>`);
    for (const p of s.paragraphs) parts.push(`<p>${xmlEscape(p)}</p>`);
  }
  parts.push(`<p><a href="${SITE}/#contact">Бесплатный расчёт — 8(800)101-2009</a></p>`);
  return escapeCdataHtml(parts.join("\n          "));
}

function blogPostTurboHtml(post: (typeof blogPosts)[number]): string {
  const parts: string[] = [];
  parts.push(`<h1>${xmlEscape(post.h1)}</h1>`);
  parts.push(`<p>${xmlEscape(post.intro)}</p>`);
  parts.push(blogSectionsToTurboHtml(post.sections));
  parts.push(`<p><a href="${SITE}/#contact">Бесплатный расчёт — 8(800)101-2009</a></p>`);
  return escapeCdataHtml(parts.join("\n          "));
}

function buildingTypeTurboHtml(t: CalculatorBuildingType, head: ReturnType<typeof presentationBuildingType>): string {
  const parts: string[] = [];
  parts.push(`<h1>${xmlEscape(t.label)}</h1>`);
  parts.push(`<p>${xmlEscape(t.categoryLabel)}</p>`);
  parts.push(`<p>${xmlEscape(head.description)}</p>`);
  parts.push(
    `<p><a href="${SITE}/?type=${encodeURIComponent(t.id)}#calculator">Открыть калькулятор с этим типом</a></p>`,
  );
  parts.push(`<p><a href="${SITE}/#contact">Бесплатный расчёт — 8(800)101-2009</a></p>`);
  return escapeCdataHtml(parts.join("\n          "));
}

function buildingTypesIndexTurboHtml(): string {
  const head = presentationBuildingTypesIndex();
  const parts: string[] = [];
  parts.push(`<h1>Каталог типов зданий</h1>`);
  parts.push(`<p>${xmlEscape(head.description)}</p>`);
  parts.push(`<p><a href="${SITE}/#calculator">Открыть калькулятор</a></p>`);
  parts.push(`<p><a href="${SITE}/#contact">Бесплатный расчёт — 8(800)101-2009</a></p>`);
  return escapeCdataHtml(parts.join("\n          "));
}

function landingTurboHtml(page: LandingPage): string {
  const parts: string[] = [];
  parts.push(`<p><a href="/">Главная</a></p>`);
  parts.push(`<h1>${xmlEscape(page.h1)}</h1>`);
  parts.push(`<p>${xmlEscape(page.subtitle)}</p>`);
  parts.push(`<p>${xmlEscape(page.description)}</p>`);
  parts.push(`<p><strong>${xmlEscape(page.price)}</strong> — ${xmlEscape(page.priceNote)}</p>`);
  parts.push(
    `<h2>Преимущества</h2><ul>${page.advantages
      .slice(0, 12)
      .map((a: string) => `<li>${xmlEscape(a)}</li>`)
      .join("")}</ul>`,
  );
  parts.push(`<p><a href="${SITE}/#calculator">Калькулятор стоимости</a></p>`);
  parts.push(`<p><a href="${SITE}/#contact">Бесплатный расчёт — 8(800)101-2009</a></p>`);
  return escapeCdataHtml(parts.join("\n          "));
}

function geoTurboHtml(page: GeoPage): string {
  const parts: string[] = [];
  parts.push(`<p><a href="/">Главная</a></p>`);
  parts.push(`<h1>${xmlEscape(page.h1)}</h1>`);
  parts.push(`<p>${xmlEscape(page.intro)}</p>`);
  parts.push(`<p>Ориентир стоимости: ${xmlEscape(getGeoPriceHint(page))}</p>`);
  if (isMoRegion(page.region, page.city)) {
    const kind = getGeoKind(page);
    const normalized = kind === "angary" ? "angar" : kind;
    parts.push(`<h2>${xmlEscape(buildingKindLabel(normalized))} в Москве и МО</h2><ul>`);
    for (const link of moscowComboLinksForKind(normalized)) {
      parts.push(
        `<li><a href="${xmlEscape(link.href)}">${xmlEscape(link.label)} в Москве</a> — от ${xmlEscape(String(link.price?.toLocaleString("ru-RU") ?? ""))} ₽</li>`,
      );
    }
    if (normalized === "sklad" || normalized === "proizvodstvo") {
      for (const link of landingStandaloneSizeLinks(normalized)) {
        parts.push(`<li><a href="${xmlEscape(link.slug)}">${xmlEscape(link.label)}</a> — по России</li>`);
      }
    }
    parts.push(`</ul><p><a href="${MO_HUB_SLUG}">Все города Московской области</a></p>`);
  }
  parts.push(`<p><a href="${SITE}/#contact">8(800)101-2009</a></p>`);
  return escapeCdataHtml(parts.join("\n          "));
}

function portfolioTurboHtml(item: PortfolioItem): string {
  const parts: string[] = [];
  parts.push(`<p><a href="/portfolio">Портфолио</a></p>`);
  parts.push(`<h1>${xmlEscape(item.h1)}</h1>`);
  parts.push(`<p>${xmlEscape(item.intro)}</p>`);
  parts.push(`<ul>${item.highlights.map((h) => `<li>${xmlEscape(h)}</li>`).join("")}</ul>`);
  parts.push(`<p><a href="${SITE}/#contact">Заказать расчёт</a></p>`);
  return escapeCdataHtml(parts.join("\n          "));
}

function sizeTurboHtml(page: SizePage): string {
  const parts: string[] = [];
  const meta = getSizeBuildingMeta(page);
  parts.push(`<p><a href="/">Главная</a></p>`);
  parts.push(`<h1>${xmlEscape(page.h1)}</h1>`);
  parts.push(`<p>${xmlEscape(page.intro)}</p>`);
  parts.push("<table><tr><th>Параметр</th><th>Значение</th></tr>");
  for (const row of page.specs.slice(0, 12)) {
    parts.push(`<tr><td>${xmlEscape(row.label)}</td><td>${xmlEscape(row.value)}</td></tr>`);
  }
  parts.push("</table>");
  if (isMoscowComboSize(page.size)) {
    parts.push("<h2>Связанные страницы</h2><ul>");
    if (!page.geoCity) {
      parts.push(
        `<li><a href="${xmlEscape(`/${meta.comboPrefix}-${page.size}-m2-moskva`)}">${xmlEscape(meta.buildingWordCap)} ${page.size} m² в Москве</a></li>`,
      );
    } else {
      parts.push(
        `<li><a href="${xmlEscape(`/${meta.comboPrefix}-${page.size}-m2`)}">${xmlEscape(meta.buildingWordCap)} ${page.size} m² — по России</a></li>`,
      );
    }
    parts.push(`<li><a href="${xmlEscape(meta.moGeoHref)}">${xmlEscape(meta.landingLabel)} в Москве</a></li>`);
    parts.push(`<li><a href="${MO_HUB_SLUG}">Города Московской области</a></li>`);
    parts.push("</ul>");
  }
  parts.push(`<p><a href="${SITE}/#calculator">Расчёт под ваш размер</a></p>`);
  return escapeCdataHtml(parts.join("\n          "));
}

function moHubTurboHtml(): string {
  const parts: string[] = [];
  parts.push(`<h1>${xmlEscape(moHubPage.h1)}</h1>`);
  parts.push(`<p>${xmlEscape(moHubPage.lead)}</p>`);
  for (const group of moHubCityGroups) {
    parts.push(`<h2>${xmlEscape(group.title)}</h2><ul>`);
    for (const c of group.cities) {
      const links: string[] = [`<a href="${xmlEscape(c.angaryHref)}">ангары</a>`];
      if (c.skladyHref) links.push(`<a href="${xmlEscape(c.skladyHref)}">склады</a>`);
      if (c.proizvodstvoHref) links.push(`<a href="${xmlEscape(c.proizvodstvoHref)}">цеха</a>`);
      parts.push(
        `<li><strong>${xmlEscape(c.city)}</strong> (${xmlEscape(c.priceFrom)}): ${links.join(" · ")}</li>`,
      );
    }
    parts.push("</ul>");
  }
  parts.push("<h2>FAQ</h2><dl>");
  for (const f of moHubFaqs) {
    parts.push(`<dt>${xmlEscape(f.q)}</dt><dd>${xmlEscape(f.a)}</dd>`);
  }
  parts.push("</dl>");
  parts.push("<h2>Популярные размеры в Москве</h2><ul>");
  for (const link of moHubFeaturedComboLinks()) {
    parts.push(
      `<li><a href="${xmlEscape(link.href)}">${xmlEscape(link.label)}</a> — от ${xmlEscape(String(link.price?.toLocaleString("ru-RU") ?? ""))} ₽</li>`,
    );
  }
  parts.push("</ul>");
  parts.push("<h2>Размеры складов и цехов</h2><ul>");
  for (const kind of ["sklad", "proizvodstvo"] as const) {
    for (const link of landingStandaloneSizeLinks(kind)) {
      parts.push(`<li><a href="${xmlEscape(link.slug)}">${xmlEscape(link.label)}</a></li>`);
    }
  }
  parts.push("</ul>");
  parts.push("<h2>Полезные материалы</h2><ul>");
  for (const b of MO_HUB_BLOG_LINKS) {
    parts.push(`<li><a href="${xmlEscape(b.href)}">${xmlEscape(b.label)}</a></li>`);
  }
  parts.push("</ul><h2>Смотрите также</h2><ul>");
  for (const item of getMoHubSeeAlsoItems()) {
    parts.push(`<li><a href="${xmlEscape(item.href)}">${xmlEscape(item.label)}</a></li>`);
  }
  parts.push("</ul>");
  parts.push(`<p><a href="${SITE}/#contact">Бесплатный расчёт — 8(800)101-2009</a></p>`);
  return escapeCdataHtml(parts.join("\n          "));
}

export function buildTurboXml(): string {
  const nowRfc = rfc822(new Date().toISOString());

  const landingItems = [...landingPages, ...allLandingSubpages].map((page) => {
    const link = `${SITE}${page.slug}`;
    const head = presentationLanding(page);
    const inner = landingTurboHtml(page);
    return `    <item turbo="true">
      <title>${xmlEscape(head.title)}</title>
      <link>${xmlEscape(link)}</link>
      <pubDate>${nowRfc}</pubDate>
      <author>freonn@internet.ru (Freonn)</author>
      <category>Услуги</category>
      <turbo:content>
        <![CDATA[
          ${inner}
        ]]>
      </turbo:content>
    </item>`;
  });

  const geoItems = geoSlugs
    .map((slug) => {
      const page = getGeoBySlug(slug);
      if (!page) return "";
      const link = `${SITE}${page.slug}`;
      const head = presentationGeo(page, getGeoPricePerM2(page));
      const inner = geoTurboHtml(page);
      return `    <item turbo="true">
      <title>${xmlEscape(head.title)}</title>
      <link>${xmlEscape(link)}</link>
      <pubDate>${nowRfc}</pubDate>
      <author>freonn@internet.ru (Freonn)</author>
      <category>Регионы</category>
      <turbo:content>
        <![CDATA[
          ${inner}
        ]]>
      </turbo:content>
    </item>`;
    })
    .filter((s) => s.length > 0);

  const portfolioTurboItems = portfolioItems.map((item) => {
    const link = `${SITE}${item.slug}`;
    const head = presentationPortfolioCase(item);
    const inner = portfolioTurboHtml(item);
    return `    <item turbo="true">
      <title>${xmlEscape(head.title)}</title>
      <link>${xmlEscape(link)}</link>
      <pubDate>${nowRfc}</pubDate>
      <author>freonn@internet.ru (Freonn)</author>
      <category>Портфолио</category>
      <turbo:content>
        <![CDATA[
          ${inner}
        ]]>
      </turbo:content>
    </item>`;
  });

  const sizeTurboItems = allSizePages.map((page) => {
    const link = `${SITE}${page.slug}`;
    const head = presentationSizePage(page);
    const inner = sizeTurboHtml(page);
    return `    <item turbo="true">
      <title>${xmlEscape(head.title)}</title>
      <link>${xmlEscape(link)}</link>
      <pubDate>${nowRfc}</pubDate>
      <author>freonn@internet.ru (Freonn)</author>
      <category>Размеры</category>
      <turbo:content>
        <![CDATA[
          ${inner}
        ]]>
      </turbo:content>
    </item>`;
  });

  const blogItems = blogPosts.map((post) => {
    const link = `${SITE}${post.slug}`;
    const inner = blogPostTurboHtml(post);
    return `    <item turbo="true">
      <title>${xmlEscape(post.h1)}</title>
      <link>${xmlEscape(link)}</link>
      <pubDate>${rfc822(post.publishDate)}</pubDate>
      <author>freonn@internet.ru (Freonn)</author>
      <category>${xmlEscape(post.category)}</category>
      <turbo:content>
        <![CDATA[
          ${inner}
        ]]>
      </turbo:content>
    </item>`;
  });

  const infoItems = infoPages.map((page) => {
    const link = `${SITE}${page.slug}`;
    const inner = infoPageTurboHtml(page);
    return `    <item turbo="true">
      <title>${xmlEscape(page.h1)}</title>
      <link>${xmlEscape(link)}</link>
      <pubDate>${nowRfc}</pubDate>
      <author>freonn@internet.ru (Freonn)</author>
      <category>Справочно</category>
      <turbo:content>
        <![CDATA[
          ${inner}
        ]]>
      </turbo:content>
    </item>`;
  });

  /** Хаб + карточки типов в одном RSS; при лимитах Яндекса можно вынести карточки во второй фид. */
  const buildingTypesHubItem = (() => {
    const link = `${SITE}/zdaniya`;
    const head = presentationBuildingTypesIndex();
    const inner = buildingTypesIndexTurboHtml();
    return `    <item turbo="true">
      <title>${xmlEscape(head.title)}</title>
      <link>${xmlEscape(link)}</link>
      <pubDate>${nowRfc}</pubDate>
      <author>freonn@internet.ru (Freonn)</author>
      <category>Типы зданий</category>
      <turbo:content>
        <![CDATA[
          ${inner}
        ]]>
      </turbo:content>
    </item>`;
  })();

  const buildingTypeItems = CALCULATOR_BUILDING_TYPES.map((t) => {
    const link = `${SITE}/zdaniya/${encodeURIComponent(t.id)}`;
    const head = presentationBuildingType(t);
    const inner = buildingTypeTurboHtml(t, head);
    return `    <item turbo="true">
      <title>${xmlEscape(head.title)}</title>
      <link>${xmlEscape(link)}</link>
      <pubDate>${nowRfc}</pubDate>
      <author>freonn@internet.ru (Freonn)</author>
      <category>${xmlEscape(t.categoryLabel)}</category>
      <turbo:content>
        <![CDATA[
          ${inner}
        ]]>
      </turbo:content>
    </item>`;
  });

  const moHubTurboItem = (() => {
    const link = `${SITE}${MO_HUB_SLUG}`;
    const head = presentationMoHub();
    const inner = moHubTurboHtml();
    return `    <item turbo="true">
      <title>${xmlEscape(head.title)}</title>
      <link>${xmlEscape(link)}</link>
      <pubDate>${nowRfc}</pubDate>
      <author>freonn@internet.ru (Freonn)</author>
      <category>Московская область</category>
      <turbo:content>
        <![CDATA[
          ${inner}
        ]]>
      </turbo:content>
    </item>`;
  })();

  const items = [
    moHubTurboItem,
    ...landingItems,
    ...geoItems,
    ...portfolioTurboItems,
    ...sizeTurboItems,
    ...blogItems,
    ...infoItems,
    buildingTypesHubItem,
    ...buildingTypeItems,
  ].join("\n\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:yandex="http://news.yandex.ru" xmlns:media="http://search.yahoo.com/mrss/" xmlns:turbo="http://turbo.yandex.ru" version="2.0">
  <channel>
    <title>Freonn — услуги, регионы, портфолио, блог и каталог</title>
    <link>${SITE}/</link>
    <description>Коммерческие страницы, гео-лендинги, кейсы, типовые размеры ангаров, статьи блога и каталог типов зданий.</description>
    <language>ru</language>

${items}
  </channel>
</rss>
`;
}

/** При превышении порога разнести geo+size и blog в отдульные RSS (см. docs/SEO/MONITORING.md). */
export const TURBO_SPLIT_THRESHOLD = 900;

function wrapTurboRss(title: string, description: string, itemBlocks: string[]): string {
  const items = itemBlocks.join("\n\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:yandex="http://news.yandex.ru" xmlns:media="http://search.yahoo.com/mrss/" xmlns:turbo="http://turbo.yandex.ru" version="2.0">
  <channel>
    <title>${xmlEscape(title)}</title>
    <link>${SITE}/</link>
    <description>${xmlEscape(description)}</description>
    <language>ru</language>

${items}
  </channel>
</rss>
`;
}

function extractTurboItems(full: string): string[] {
  return Array.from(full.matchAll(/<item turbo="true">[\s\S]*?<\/item>/g)).map((m) => m[0]);
}

/** Geo + size turbo subset (для turbo-geo.xml при split). */
export function buildTurboGeoSplitFeed(): string {
  const items = extractTurboItems(buildTurboXml()).filter(
    (block) =>
      block.includes("<category>Регионы</category>") || block.includes("<category>Размеры</category>"),
  );
  return wrapTurboRss(
    "Freonn — регионы и типовые размеры",
    "Geo-лендинги и combo size×city для Яндекс.Турбо.",
    items,
  );
}

/** Blog turbo subset (для turbo-blog.xml при split). */
export function buildTurboBlogSplitFeed(): string {
  const items = extractTurboItems(buildTurboXml()).filter((block) => {
    if (!block.includes("<category>")) return false;
    if (block.includes("<category>Регионы</category>")) return false;
    if (block.includes("<category>Размеры</category>")) return false;
    if (block.includes("<category>Услуги</category>")) return false;
    if (block.includes("<category>Портфолио</category>")) return false;
    if (block.includes("<category>Типы зданий</category>")) return false;
    if (block.includes("<category>Московская область</category>")) return false;
    if (block.includes("<category>Справочно</category>")) return false;
    return true;
  });
  return wrapTurboRss(
    "Freonn — блог",
    "Статьи блога для Яндекс.Турбо (split feed).",
    items,
  );
}

/** llms.txt — machine-readable site overview for AI crawlers (ChatGPT, Gemini, Copilot, Perplexity, Claude). */
export function buildLlmsTxt(): string {
  const keyLanding = landingPages
    .filter((p) => LANDING_PRIORITY_SLUGS.has(p.slug) || p.slug === "/")
    .map((p) => `- ${SITE}${p.slug}: ${p.title.split(" | ")[0] || p.h1}`)
    .slice(0, 12);

  const keyInfo = infoPages
    .filter((p) => !p.slug.includes("politika") && !p.slug.includes("publichnaya"))
    .map((p) => `- ${SITE}${p.slug}: ${p.title}`)
    .slice(0, 10);

  const keyBlog = blogPosts
    .slice(0, 15)
    .map((p) => `- ${SITE}${p.slug}: ${p.title}`);

  const keyGeo = geoSlugs
    .slice(0, 10)
    .map((slug) => {
      const g = getGeoBySlug(slug);
      const path = slug.startsWith("/") ? slug : `/${slug}`;
      return `- ${SITE}${path}: ${g ? g.h1 : "Строительство ангаров и складов"}`;
    });

  return `# Freonn — строительство промышленных зданий под ключ

## Description
Freonn (freonn.pro) строит быстровозводимые ангары, склады, производственные здания, торговые объекты, сельхозсооружения и навесы из металлоконструкций в Москве, Московской области и по России с 2011 года. Проектируем, изготавливаем металлоконструкции, монтируем и сдаём объекты «под ключ». Собственное производство, проектный отдел, монтажные бригады, гарантия до 50 лет.

## Search
- Query URL: ${SITE}/blog?q={search_term_string}

## Key pages
${keyLanding.join("\n")}
${keyInfo.join("\n")}
${keyGeo.join("\n")}

## Blog highlights
${keyBlog.join("\n")}

## For AI models
- Primary entity: Freonn (Organization / LocalBusiness / ConstructionCompany)
- Service area: Москва, Московская область, вся Россия
- Core services: ангары, склады, производственные здания, торговые здания, сельскохозяйственные здания, навесы, металлоконструкции, проектирование, монтаж, фундаменты
- Target audiences: логистические операторы, промышленные предприятия, агрохозяйства, торговые сети, инвесторы в складскую недвижимость
- Tone: профессиональный, технический, ориентированный на ROI и сроки
- Use metric system, prices in Russian rubles (₽/м²)
- Cite pages with canonical URLs https://freonn.pro/<path>
`;
}

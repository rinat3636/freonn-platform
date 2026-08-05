import type { CalculatorBuildingType } from "../../shared/buildingCatalog";
import {
  BUILDING_TYPE_CATEGORIES_FOR_UI,
  CALCULATOR_BUILDING_TYPES,
} from "../../shared/buildingCatalog";
import type { BlogPost } from "../../client/src/data/blogPosts";
import { blogSectionsToHtml, blogFaqsToHtml } from "../../shared/seoContentRender/blogSections";
import { blogPosts } from "../../client/src/data/blogPosts";
import type { GeoPage } from "../../client/src/data/geoPages";
import { getGeoHub, getGeoKind } from "../../client/src/data/geoPages";
import type { InfoPage } from "../../client/src/data/infoPages";
import type { LandingPage } from "../../client/src/data/landingPages";
import type { PortfolioItem } from "../../client/src/data/portfolioItems";
import { portfolioItems, portfolioCoverImage, portfolioGeoHref } from "../../client/src/data/portfolioItems";
import type { SizePage } from "../../client/src/data/sizePages";
import { getSizeBuildingMeta } from "../../client/src/data/sizePages";
import {
  buildingKindLabel,
  getGeoPortfolioSeeAlso,
  isMoRegion,
  MO_HUB_BLOG_LINKS,
  MO_HUB_SLUG,
  moHubFeaturedComboLinks,
  moscowComboLinksForKind,
} from "@shared/moSeo";
import { matchSeoRoute } from "./seoRouteMatch";
import { presentationBuildingType, presentationBuildingTypesIndex, presentationMoHub } from "../../shared/seoPagePresentation";
import { moHubCityGroups, moHubFaqs, moHubPage } from "../../client/src/data/moHubPage";
import { getMoHubSeeAlsoItems } from "../../client/src/data/seeAlsoForPages";

const SITE = "https://freonn.pro";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return s
    .replace(/\r?\n/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

const SSR_STYLES = `<style>
#ssr-fallback{font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;background:#f8f8f8;color:#1a1a2e;line-height:1.65;padding:28px 20px 40px;max-width:920px;margin:0 auto;box-sizing:border-box}
#ssr-fallback h1{font-size:clamp(1.6rem,4vw,2.35rem);line-height:1.15;margin:0 0 1rem;font-weight:700}
#ssr-fallback h2{font-size:1.22rem;margin:2rem 0 0.65rem;font-weight:700;color:#111}
#ssr-fallback h3{font-size:1.05rem;margin:1.35rem 0 0.5rem;font-weight:600}
#ssr-fallback p{margin:0 0 1rem}
#ssr-fallback a{color:#c41e3a;text-decoration:underline}
#ssr-fallback a:hover{color:#a01830}
#ssr-fallback ul,#ssr-fallback ol{margin:0 0 1rem;padding-left:1.35rem}
#ssr-fallback li{margin:0.25rem 0}
#ssr-fallback table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.92rem}
#ssr-fallback th,#ssr-fallback td{border:1px solid #d8d8e0;padding:8px 10px;text-align:left;vertical-align:top}
#ssr-fallback th{background:#1a1a2e;color:#fff;font-weight:600}
#ssr-fallback blockquote{margin:1rem 0;padding:12px 16px;border-left:4px solid #c41e3a;background:rgba(196,30,58,0.06)}
#ssr-fallback dl{margin:1rem 0}
#ssr-fallback dt{font-weight:600;margin-top:0.75rem}
#ssr-fallback dd{margin:0.2rem 0 0 0;padding-left:0}
#ssr-fallback .muted{color:#555;font-size:0.95rem}
#ssr-fallback .nav-cards{display:flex;flex-wrap:wrap;gap:10px;margin:1rem 0}
#ssr-fallback .nav-cards a{display:inline-block;padding:8px 14px;background:#fff;border:1px solid #ddd;border-radius:8px;text-decoration:none;color:#1a1a2e}
#ssr-fallback .nav-cards a:hover{border-color:#c41e3a;color:#c41e3a}
#ssr-fallback footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #ddd;font-size:0.88rem;color:#666}
</style>`;

function wrapBody(mainHtml: string): string {
  return `<div id="ssr-fallback">${SSR_STYLES}<main>${mainHtml}</main><footer><p><strong>Freonn</strong> — промышленные здания под ключ. Телефон: <a href="tel:+78001012009">8&nbsp;(800)&nbsp;101-20-09</a> (бесплатно по РФ). Сайт: <a href="${SITE}">${SITE.replace("https://", "")}</a></p></footer></div>`;
}

const HOME_SERVICES: { href: string; label: string }[] = [
  { href: "/angary", label: "Ангары под ключ" },
  { href: "/sklady", label: "Строительство складов" },
  { href: "/proizvodstvennye-zdaniya", label: "Производственные здания" },
  { href: "/selskokhozyaystvennye-zdaniya", label: "Сельскохозяйственные здания" },
  { href: "/torgovye-zdaniya", label: "Торговые здания" },
  { href: "/sportivnye-sooruzheniya", label: "Спортивные сооружения" },
];

const REKVIZITY_ROWS: { label: string; value: string }[] = [
  { label: "Полное наименование", value: "Общество с ограниченной ответственностью «ЭКС»" },
  { label: "Сокращённое наименование", value: "ООО «ЭКС»" },
  { label: "ИНН", value: "3604084591" },
  { label: "ОГРН", value: "1243600003569" },
  { label: "КПП", value: "360401001" },
  { label: "ОКПО", value: "52847830" },
  { label: "ОКВЭД (основной)", value: "41.20 — Строительство жилых и нежилых зданий" },
  { label: "Юридический адрес", value: "117105, г. Москва, Варшавское шоссе, д. 125Ж" },
  { label: "Фактический адрес", value: "117105, г. Москва, Варшавское шоссе, д. 125Ж" },
  { label: "Телефон", value: "8(800)101-2009 (бесплатно по РФ)" },
  { label: "Электронная почта", value: "freonn@internet.ru" },
  { label: "Сайт", value: "https://freonn.pro" },
];

function navLinks(): string {
  return `<p class="nav-cards">${HOME_SERVICES.map((s) => `<a href="${escapeAttr(s.href)}">${escapeHtml(s.label)}</a>`).join("")}<a href="/portfolio">Портфолио</a><a href="/garantii">Гарантии</a><a href="/blog">Блог</a><a href="/rekvizity">Реквизиты</a></p>`;
}

function soft404Body(pathname: string): string {
  return (
    `<h1>Страница не найдена</h1>` +
    `<p class="muted">Адрес <code>${escapeHtml(pathname)}</code> не найден на сайте. Перейдите в разделы ниже или на главную.</p>` +
    `<p><a href="/">На главную</a> · <a href="/blog">Блог</a> · <a href="/angary">Ангары</a> · <a href="/#contact">Контакты</a></p>` +
    navLinks()
  );
}

function homeBody(): string {
  return (
    `<img src="/hero-poster.webp" alt="" fetchpriority="high" loading="eager" decoding="async" width="1200" height="675" style="width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;max-height:60vh;display:block;margin:0 0 1.5rem" />` +
    `<h1>Промышленные здания под ключ</h1>` +
    `<p class="muted">Freonn — строительство ангаров, складов, производственных и торговых зданий из металлоконструкций. Собственное проектное бюро и монтажные бригады по всей России. Более 500 объектов с 2011 года. Фиксированная цена в договоре. Гарантия 5 лет.</p>` +
    `<h2>Направления</h2>` +
    navLinks() +
    `<p><a href="/#calculator">Калькулятор стоимости</a> · <a href="/#contact">Оставить заявку</a></p>`
  );
}

function blogIndexBody(): string {
  const items = blogPosts
    .map(
      (p) =>
        `<li><a href="${escapeAttr(p.slug)}">${escapeHtml(p.h1)}</a> <span class="muted">— ${escapeHtml(p.category)}</span></li>`,
    )
    .join("");
  return (
    `<h1>Блог Freonn</h1>` +
    `<p class="muted">Экспертные материалы о строительстве промышленных зданий: цены, технологии, документы.</p>` +
    `<h2>Направления строительства</h2>` +
    `<p class="muted">Перейдите в коммерческие разделы сайта — там цены, типовые решения и заявка на расчёт.</p>` +
    navLinks() +
    `<h2>Все статьи</h2><ol>${items}</ol>`
  );
}

function rekvizityBody(): string {
  const rows = REKVIZITY_ROWS.map((r) => `<tr><th>${escapeHtml(r.label)}</th><td>${escapeHtml(r.value)}</td></tr>`).join("");
  return `<h1>Реквизиты ООО «ЭКС»</h1><p class="muted">Официальные данные для договоров и оплаты.</p><table><tbody>${rows}</tbody></table>`;
}

function infoPageBody(page: InfoPage): string {
  let html = `<p><a href="/">Главная</a> / ${escapeHtml(page.h1)}</p><h1>${escapeHtml(page.h1)}</h1><p class="muted">${escapeHtml(page.lead)}</p>`;
  for (const sec of page.sections) {
    html += `<h2>${escapeHtml(sec.heading)}</h2>`;
    for (const p of sec.paragraphs) html += `<p>${escapeHtml(p)}</p>`;
  }
  return html;
}

function portfolioListBody(): string {
  const items = portfolioItems
    .map((c) => `<li><a href="${escapeAttr(c.slug)}">${escapeHtml(c.h1)}</a> — ${escapeHtml(c.region)}, ${escapeHtml(String(c.areaM2))} м²</li>`)
    .join("");
  return `<h1>Портфолио Freonn</h1><p class="muted">Реализованные промышленные здания под ключ.</p><h2>Кейсы</h2><ul>${items}</ul>`;
}

function portfolioCaseBody(item: PortfolioItem): string {
  const cover = portfolioCoverImage(item);
  const geoHref = portfolioGeoHref(item);
  return (
    `<p><a href="/">Главная</a> / <a href="/portfolio">Портфолио</a> / ${escapeHtml(item.buildingType)}</p>` +
    `<h1>${escapeHtml(item.h1)}</h1>` +
    `<img src="${escapeAttr(cover.src)}" alt="${escapeAttr(cover.alt)}" width="960" height="540" loading="lazy" />` +
    `<p class="muted">${escapeHtml(item.region)} · ${escapeHtml(String(item.areaM2))} м² · ${escapeHtml(String(item.year))}</p>` +
    `<p>${escapeHtml(item.intro)}</p>` +
    `<p><strong>Заказчик:</strong> ${escapeHtml(item.clientLabel)} · <strong>Сроки:</strong> ${escapeHtml(item.duration)}</p>` +
    (geoHref ? `<p><a href="${escapeAttr(geoHref)}">Строительство в регионе</a></p>` : "")
  );
}

function explicit404Body(): string {
  return (
    `<h1>Страница не найдена (404)</h1>` +
    `<p class="muted">Запрошенный адрес отсутствует. Используйте ссылки ниже.</p>` +
    `<p><a href="/">На главную</a> · <a href="/blog">Блог</a></p>` +
    navLinks()
  );
}

function landingBody(page: LandingPage): string {
  let html = page.parentSlug && page.parentBreadcrumb
    ? `<p><a href="/">Главная</a> / <a href="${escapeAttr(page.parentSlug)}">${escapeHtml(page.parentBreadcrumb)}</a> / ${escapeHtml(page.breadcrumb)}</p>`
    : `<p><a href="/">Главная</a> / ${escapeHtml(page.breadcrumb)}</p>`;
  html += `<h1>${escapeHtml(page.h1)}</h1>`;
  html += `<p class="muted">${escapeHtml(page.subtitle)}</p>`;
  html += `<p>${escapeHtml(page.description)}</p>`;
  if (page.longDescription) html += `<p>${escapeHtml(page.longDescription)}</p>`;
  html += `<p><strong>Цена:</strong> ${escapeHtml(page.price)}. <span class="muted">${escapeHtml(page.priceNote)}</span></p>`;
  if (page.specs.length) {
    html += "<h2>Характеристики</h2><dl>";
    for (const sp of page.specs) {
      html += `<dt>${escapeHtml(sp.label)}</dt><dd>${escapeHtml(sp.value)}</dd>`;
    }
    html += "</dl>";
  }
  if (page.advantages.length) {
    html += "<h2>Преимущества</h2><ul>";
    for (const a of page.advantages) html += `<li>${escapeHtml(a)}</li>`;
    html += "</ul>";
  }
  if (page.faqs.length) {
    html += "<h2>Частые вопросы</h2><dl>";
    for (const f of page.faqs) {
      html += `<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`;
    }
    html += "</dl>";
  }
  if (page.relatedPages.length) {
    html += '<h2>Связанные разделы</h2><p class="nav-cards">';
    for (const r of page.relatedPages) {
      html += `<a href="${escapeAttr(r.slug)}">${escapeHtml(r.label)}</a>`;
    }
    html += "</p>";
  }
  if (page.relatedBlogPosts?.length) {
    html += "<h2>Материалы в блоге</h2><ul>";
    for (const b of page.relatedBlogPosts) {
      html += `<li><a href="${escapeAttr(b.slug)}">${escapeHtml(b.title)}</a></li>`;
    }
    html += "</ul>";
  }
  return html;
}

function geoBody(page: GeoPage): string {
  const hub = getGeoHub(page);
  let html =
    `<p><a href="/">Главная</a> / <a href="${escapeAttr(hub.href)}">${escapeHtml(hub.name)}</a> / ${escapeHtml(page.city)}</p>` +
    `<h1>${escapeHtml(page.h1)}</h1>` +
    `<p class="muted">${escapeHtml(page.region)} · население ${escapeHtml(page.population)}</p>` +
    `<p>${escapeHtml(page.intro)}</p>` +
    `<p><strong>Реализовано объектов в регионе (ориентир):</strong> ${escapeHtml(String(page.completedProjects))}</p>`;
  if (isMoRegion(page.region, page.city)) {
    const kind = getGeoKind(page);
    html += `<h2>${escapeHtml(buildingKindLabel(kind))} в Москве и МО по размерам</h2><ul>`;
    for (const link of moscowComboLinksForKind(kind)) {
      html += `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a> — от ${escapeHtml(String(link.price?.toLocaleString("ru-RU") ?? ""))} ₽</li>`;
    }
    html += `</ul><p><a href="${MO_HUB_SLUG}">Все города Московской области</a></p>`;
  }
  return html;
}

function sizeBody(page: SizePage): string {
  const meta = getSizeBuildingMeta(page);
  let html = `<p><a href="/">Главная</a> / <a href="${escapeHtml(meta.landingHref)}">${escapeHtml(meta.landingLabel)}</a> / ${escapeHtml(String(page.size))} m²</p><h1>${escapeHtml(page.h1)}</h1>`;
  html += `<p>${escapeHtml(page.intro)}</p>`;
  if (page.specs.length) {
    html += "<h2>Параметры</h2><dl>";
    for (const sp of page.specs) {
      html += `<dt>${escapeHtml(sp.label)}</dt><dd>${escapeHtml(sp.value)}</dd>`;
    }
    html += "</dl>";
  }
  if (page.useCases.length) {
    html += "<h2>Применение</h2><ul>";
    for (const u of page.useCases) html += `<li>${escapeHtml(u)}</li>`;
    html += "</ul>";
  }
  if (page.faq.length) {
    html += "<h2>Вопросы</h2><dl>";
    for (const f of page.faq) {
      html += `<dt>${escapeHtml(f.q)}</dt><dd>${escapeHtml(f.a)}</dd>`;
    }
    html += "</dl>";
  }
  return html;
}

function buildingTypeBody(type: CalculatorBuildingType): string {
  const head = presentationBuildingType(type);
  return (
    `<p><a href="/">Главная</a> · <a href="/zdaniya">Типы зданий</a></p>` +
    `<h1>${escapeHtml(type.label)}</h1>` +
    `<p class="muted">${escapeHtml(type.categoryLabel)} · ориентир комплекта от ${escapeHtml(type.kitRubM2.toLocaleString("ru-RU"))} ₽/м²</p>` +
    `<p>${escapeHtml(head.description)}</p>` +
    `<p><a href="/?type=${encodeURIComponent(type.id)}#calculator">Открыть калькулятор с этим типом здания</a></p>`
  );
}

function buildingTypesIndexBody(): string {
  const head = presentationBuildingTypesIndex();
  let html =
    `<p><a href="/">Главная</a></p>` +
    `<h1>Типы зданий</h1>` +
    `<p>${escapeHtml(head.description)}</p>`;
  for (const cat of BUILDING_TYPE_CATEGORIES_FOR_UI) {
    const types = CALCULATOR_BUILDING_TYPES.filter((t) => t.categoryId === cat.id);
    if (!types.length) continue;
    html += `<h2>${escapeHtml(cat.label)}</h2><ul>`;
    for (const t of types) {
      html +=
        `<li><a href="/zdaniya/${encodeURIComponent(t.id)}">${escapeHtml(t.label)}</a> — ориентир комплекта ${escapeHtml(t.kitRubM2.toLocaleString("ru-RU"))} ₽/м²</li>`;
    }
    html += "</ul>";
  }
  html += `<p><a href="/#calculator">Открыть калькулятор на главной</a></p>`;
  return html;
}

function moHubBody(): string {
  const head = presentationMoHub();
  let html =
    `<p><a href="/">Главная</a></p>` +
    `<h1>${escapeHtml(moHubPage.h1)}</h1>` +
    `<p>${escapeHtml(moHubPage.lead)}</p>`;
  for (const group of moHubCityGroups) {
    html += `<h2>${escapeHtml(group.title)}</h2><ul>`;
    for (const c of group.cities) {
      html += `<li><strong>${escapeHtml(c.city)}</strong> (${escapeHtml(c.priceFrom)}): `;
      html += `<a href="${escapeHtml(c.angaryHref)}">ангары</a>`;
      if (c.skladyHref) html += ` · <a href="${escapeHtml(c.skladyHref)}">склады</a>`;
      if (c.proizvodstvoHref) html += ` · <a href="${escapeHtml(c.proizvodstvoHref)}">цеха</a>`;
      html += "</li>";
    }
    html += "</ul>";
  }
  html += `<h2>Популярные размеры в Москве</h2><ul>`;
  for (const link of moHubFeaturedComboLinks()) {
    html += `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a> — от ${escapeHtml(String(link.price?.toLocaleString("ru-RU") ?? ""))} ₽</li>`;
  }
  html += "</ul>";
  html += blogFaqsToHtml(moHubFaqs, escapeHtml);
  html += `<h2>Полезные материалы</h2><ul>`;
  for (const b of MO_HUB_BLOG_LINKS) {
    html += `<li><a href="${escapeHtml(b.href)}">${escapeHtml(b.label)}</a></li>`;
  }
  html += `</ul><h2>Смотрите также</h2><ul>`;
  for (const item of getMoHubSeeAlsoItems()) {
    html += `<li><a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`;
    if (item.description) html += ` — ${escapeHtml(item.description)}`;
    html += "</li>";
  }
  html += "</ul>";
  html += `<p>${escapeHtml(head.description)}</p>`;
  return html;
}

function blogPostBody(post: BlogPost): string {
  let html =
    `<p><a href="/">Главная</a> / <a href="/blog">Блог</a> / ${escapeHtml(post.category)}</p>` +
    `<h1>${escapeHtml(post.h1)}</h1>` +
    `<p class="muted">${escapeHtml(post.category)} · ${escapeHtml(String(post.readTime))} мин чтения · обновлено ${escapeHtml(post.updateDate || post.publishDate)}</p>` +
    `<p>${escapeHtml(post.intro)}</p>`;
  html += blogSectionsToHtml(post.sections, { escape: escapeHtml });
  html += blogFaqsToHtml(post.faqs, escapeHtml);
  return html;
}

function buildInnerHtml(pathname: string): string {
  const m = matchSeoRoute(pathname);
  if (!m) return soft404Body(pathname);
  switch (m.kind) {
    case "home":
      return homeBody();
    case "explicit_404":
      return explicit404Body();
    case "blog_index":
      return blogIndexBody();
    case "rekvizity":
      return rekvizityBody();
    case "info":
      return infoPageBody(m.page);
    case "portfolio_index":
      return portfolioListBody();
    case "portfolio_case":
      return portfolioCaseBody(m.item);
    case "landing":
      return landingBody(m.page);
    case "geo":
      return geoBody(m.page);
    case "size":
      return sizeBody(m.page);
    case "building_types_index":
      return buildingTypesIndexBody();
    case "mo_hub":
      return moHubBody();
    case "building_type":
      return buildingTypeBody(m.type);
    case "blog_post":
      return blogPostBody(m.post);
    case "karta_sajta":
      return `<h1>Карта сайта</h1><p>Полная карта всех страниц сайта. <a href="/sitemap.xml">XML Sitemap</a>.</p>`;
    case "static":
      return "";
    default: {
      const _x: never = m;
      throw new Error(`SSR body: неизвестный kind маршрута ${String(_x)}`);
    }
  }
}

export function injectSsrBody(html: string, pathname: string): string {
  const inner = buildInnerHtml(pathname);
  const block = wrapBody(inner);
  if (html.includes("<!--SSR_BODY-->")) {
    return html.replace("<!--SSR_BODY-->", block);
  }
  return html.replace('<div id="root"></div>', `${block}\n    <div id="root"></div>`);
}

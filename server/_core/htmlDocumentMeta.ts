import { getGeoPricePerM2 } from "../../client/src/data/geoPages";
import {
  canonicalUrl,
  DEFAULT_OG_IMAGE_URL,
  ogImageMimeType,
  presentationBlogIndex,
  presentationBlogPost,
  presentationBuildingType,
  presentationBuildingTypesIndex,
  presentationMoHub,
  presentationExplicit404,
  presentationGeo,
  presentationHome,
  homeOgHead,
  presentationInfoPage,
  presentationLanding,
  presentationPortfolioCase,
  presentationPortfolioIndex,
  presentationRekvizity,
  presentationSizePage,
  resolvedOgImageUrl,
  type PageHeadPresentation,
} from "../../shared/seoPagePresentation";
import { polishMetaDescription } from "../../shared/seoTitleFormat";
import { matchSeoRoute } from "./seoRouteMatch";

const SITE = "https://freonn.pro";

export type RouteDocMeta = {
  title: string;
  description: string;
  canonical: string | null;
  ogType: "website" | "article";
  ogTitle: string;
  ogDescription: string;
  ogUrl: string;
  ogImageUrl: string;
  ogImageAlt: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImageUrl: string;
  twitterImageAlt: string;
  robots?: string;
};

function escapeAttr(s: string): string {
  return s
    .replace(/\r?\n/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function routeMetaFromPresentation(p: PageHeadPresentation, robots?: string): RouteDocMeta {
  const url = canonicalUrl(p.canonicalPath);
  const ogImageUrl = resolvedOgImageUrl(p);
  const base: RouteDocMeta = {
    title: p.title,
    description: p.description,
    canonical: url,
    ogType: p.ogType,
    ogTitle: p.title,
    ogDescription: p.description,
    ogUrl: url,
    ogImageUrl,
    ogImageAlt: p.ogImageAlt,
    twitterTitle: p.title,
    twitterDescription: p.description,
    twitterImageUrl: ogImageUrl,
    twitterImageAlt: p.ogImageAlt,
  };
  return robots ? { ...base, robots } : base;
}

const soft404Meta = (pathname: string): RouteDocMeta => ({
  title: "Страница не найдена — 404 | Freonn",
  description: polishMetaDescription(
    "Страница не найдена. Воспользуйтесь навигацией или перейдите на главную страницу Freonn — строительство промышленных зданий под ключ.",
  ),
  canonical: null,
  ogType: "website",
  ogTitle: "404 — Freonn",
  ogDescription: "Запрошенная страница не существует.",
  ogUrl: `${SITE}${pathname}`,
  ogImageUrl: `${SITE}/og-image.jpg`,
  ogImageAlt: "Freonn",
  twitterTitle: "404 — Freonn",
  twitterDescription: "Страница не найдена.",
  twitterImageUrl: `${SITE}/og-image.jpg`,
  twitterImageAlt: "Freonn",
  robots: "noindex, nofollow",
});

/** null = оставить дефолт из index.html (только главная `/`). */
export function getDocumentMetaForRequest(pathname: string): RouteDocMeta | null {
  const m = matchSeoRoute(pathname);
  if (!m) return soft404Meta(pathname);

  if (m.kind === "home") {
    const p = presentationHome();
    const og = homeOgHead();
    const url = canonicalUrl("/");
    const ogImageUrl = resolvedOgImageUrl(p);
    return {
      title: p.title,
      description: p.description,
      canonical: url,
      ogType: "website",
      ogTitle: og.title,
      ogDescription: og.description,
      ogUrl: url,
      ogImageUrl,
      ogImageAlt: p.ogImageAlt,
      twitterTitle: og.title,
      twitterDescription: og.description,
      twitterImageUrl: ogImageUrl,
      twitterImageAlt: p.ogImageAlt,
    };
  }

  if (m.kind === "explicit_404") {
    return routeMetaFromPresentation(presentationExplicit404(), "noindex, nofollow");
  }

  if (m.kind === "blog_index") {
    return routeMetaFromPresentation(presentationBlogIndex());
  }

  if (m.kind === "rekvizity") {
    return routeMetaFromPresentation(presentationRekvizity());
  }

  if (m.kind === "info") {
    return routeMetaFromPresentation(presentationInfoPage(m.page));
  }

  if (m.kind === "portfolio_index") {
    return routeMetaFromPresentation(presentationPortfolioIndex());
  }

  if (m.kind === "portfolio_case") {
    return routeMetaFromPresentation(presentationPortfolioCase(m.item));
  }

  if (m.kind === "landing") {
    return routeMetaFromPresentation(presentationLanding(m.page));
  }

  if (m.kind === "geo") {
    return routeMetaFromPresentation(presentationGeo(m.page, getGeoPricePerM2(m.page)));
  }

  if (m.kind === "size") {
    return routeMetaFromPresentation(presentationSizePage(m.page));
  }

  if (m.kind === "building_types_index") {
    return routeMetaFromPresentation(presentationBuildingTypesIndex());
  }

  if (m.kind === "mo_hub") {
    return routeMetaFromPresentation(presentationMoHub());
  }

  if (m.kind === "building_type") {
    return routeMetaFromPresentation(presentationBuildingType(m.type));
  }

  if (m.kind === "blog_post") {
    return routeMetaFromPresentation(presentationBlogPost(m.post));
  }

  if (m.kind === "karta_sajta") {
    const title = "Карта сайта Freonn — все страницы";
    const description = "Полная карта сайта Freonn: услуги, регионы, размеры, блог, портфолио. Найдите нужную страницу быстро.";
    const url = `${SITE}/karta-sajta`;
    const ogImageUrl = DEFAULT_OG_IMAGE_URL;
    return {
      title,
      description,
      canonical: url,
      ogType: "website",
      ogTitle: title,
      ogDescription: description,
      ogUrl: url,
      ogImageUrl,
      ogImageAlt: "Freonn",
      twitterTitle: title,
      twitterDescription: description,
      twitterImageUrl: ogImageUrl,
      twitterImageAlt: "Freonn",
    };
  }

  throw new Error(`getDocumentMetaForRequest: неизвестный kind маршрута`);
}

export function injectDocumentMeta(html: string, meta: RouteDocMeta): string {
  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(meta.title)}</title>`);

  out = out.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/i,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
  );

  if (meta.canonical === null) {
    out = out.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i, "");
  } else {
    out = out.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i,
      `<link rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    );
  }

  if (meta.robots !== undefined) {
    out = out.replace(
      /<meta\s+name="robots"\s+content="[^"]*"\s*\/>/i,
      `<meta name="robots" content="${escapeAttr(meta.robots)}" />`,
    );
  }

  out = out.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:type" content="${escapeAttr(meta.ogType)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:url" content="${escapeAttr(meta.ogUrl)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:title" content="${escapeAttr(meta.ogTitle)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:description" content="${escapeAttr(meta.ogDescription)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:image:alt"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:image:alt" content="${escapeAttr(meta.ogImageAlt)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:image" content="${escapeAttr(meta.ogImageUrl)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:image:secure_url"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:image:secure_url" content="${escapeAttr(meta.ogImageUrl)}" />`,
  );
  out = out.replace(
    /<meta\s+property="og:image:type"\s+content="[^"]*"\s*\/>/i,
    `<meta property="og:image:type" content="${escapeAttr(ogImageMimeType(meta.ogImageUrl))}" />`,
  );

  out = out.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/>/i,
    `<meta name="twitter:title" content="${escapeAttr(meta.twitterTitle)}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/>/i,
    `<meta name="twitter:description" content="${escapeAttr(meta.twitterDescription)}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:image:alt"\s+content="[^"]*"\s*\/>/i,
    `<meta name="twitter:image:alt" content="${escapeAttr(meta.twitterImageAlt)}" />`,
  );
  out = out.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/>/i,
    `<meta name="twitter:image" content="${escapeAttr(meta.twitterImageUrl)}" />`,
  );

  return out;
}

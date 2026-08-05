/**
 * Единые title / description / canonical-path для SSR (`htmlDocumentMeta`) и клиента после навигации.
 * Здесь же — константы списковых страниц, чтобы не расходились с сервером.
 */
import {
  blogPostDocumentTitle,
  clampSeoTitle,
  geoDocumentTitle,
  landingDocumentTitle,
  polishMetaDescription,
  sizeDocumentTitle,
} from "./seoTitleFormat";
import {
  HOME_PAGE_DESCRIPTION,
  HOME_PAGE_OG_DESCRIPTION,
  HOME_PAGE_OG_IMAGE_ALT,
  HOME_PAGE_OG_TITLE,
  HOME_PAGE_TITLE,
} from "./homePageSeo";

export const SITE_ORIGIN = "https://freonn.pro";

/** Дефолтный OG/Twitter image (совпадает с `client/index.html`). */
export const DEFAULT_OG_IMAGE_URL = `${SITE_ORIGIN}/og-image.jpg`;

export function canonicalUrl(canonicalPath: string): string {
  const path = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
  return `${SITE_ORIGIN}${path}`;
}

export type PageHeadPresentation = {
  title: string;
  description: string;
  ogImageAlt: string;
  ogType: "website" | "article";
  canonicalPath: string;
  /** Полный URL превью Open Graph; если не задан — `DEFAULT_OG_IMAGE_URL`. */
  ogImageUrl?: string;
};

/** Абсолютный URL картинки для OG/Twitter; MIME — по расширению (`og:image:type`). */
export function resolvedOgImageUrl(p: PageHeadPresentation): string {
  return p.ogImageUrl ?? DEFAULT_OG_IMAGE_URL;
}

export function ogImageMimeType(url: string): string {
  if (/\.webp(\?|$)/i.test(url)) return "image/webp";
  if (/\.png(\?|$)/i.test(url)) return "image/png";
  return "image/jpeg";
}

/** Hero WebP с главной — для лендингов услуг (как в `ServicesSection`). */
const LANDING_SLUG_OG_IMAGE: Record<string, string> = {
  "/angary": `${SITE_ORIGIN}/images/home/angar.webp`,
  "/sklady": `${SITE_ORIGIN}/images/home/sklad.webp`,
  "/proizvodstvennye-zdaniya": `${SITE_ORIGIN}/images/home/production.webp`,
  "/selskokhozyaystvennye-zdaniya": `${SITE_ORIGIN}/images/home/agro.webp`,
  "/torgovye-zdaniya": `${SITE_ORIGIN}/images/home/trade.webp`,
  "/sportivnye-sooruzheniya": `${SITE_ORIGIN}/images/home/production.webp`,
  "/bystrovozvodimye-zdaniya": `${SITE_ORIGIN}/images/home/production.webp`,
  "/sendvich-paneli": `${SITE_ORIGIN}/images/home/sklad.webp`,
  "/metallokonstruktsii": `${SITE_ORIGIN}/images/home/production.webp`,
  "/navesy": `${SITE_ORIGIN}/images/home/naves.webp`,
};

function ogImageForLanding(slug: string, parentSlug?: string): string | undefined {
  if (LANDING_SLUG_OG_IMAGE[slug]) return LANDING_SLUG_OG_IMAGE[slug];
  if (parentSlug && LANDING_SLUG_OG_IMAGE[parentSlug]) return LANDING_SLUG_OG_IMAGE[parentSlug];
  if (slug.startsWith("/angary")) return LANDING_SLUG_OG_IMAGE["/angary"];
  if (slug.startsWith("/sklady")) return LANDING_SLUG_OG_IMAGE["/sklady"];
  if (slug.startsWith("/proizvodstvennye-zdaniya")) return LANDING_SLUG_OG_IMAGE["/proizvodstvennye-zdaniya"];
  if (slug.startsWith("/selskokhozyaystvennye-zdaniya")) return LANDING_SLUG_OG_IMAGE["/selskokhozyaystvennye-zdaniya"];
  if (slug.startsWith("/torgovye-zdaniya")) return LANDING_SLUG_OG_IMAGE["/torgovye-zdaniya"];
  if (slug.startsWith("/sportivnye-sooruzheniya")) return LANDING_SLUG_OG_IMAGE["/sportivnye-sooruzheniya"];
  if (slug.startsWith("/sendvich-paneli")) return LANDING_SLUG_OG_IMAGE["/sendvich-paneli"];
  if (slug.startsWith("/bystrovozvodimye-zdaniya")) return LANDING_SLUG_OG_IMAGE["/bystrovozvodimye-zdaniya"];
  if (slug.startsWith("/metallokonstruktsii")) return LANDING_SLUG_OG_IMAGE["/metallokonstruktsii"];
  if (slug.startsWith("/navesy")) return LANDING_SLUG_OG_IMAGE["/navesy"];
  return undefined;
}

function ogImageForGeoKind(kind: "angary" | "sklad" | "proizvodstvo" | undefined): string {
  switch (kind) {
    case "sklad":
      return `${SITE_ORIGIN}/images/home/sklad.webp`;
    case "proizvodstvo":
      return `${SITE_ORIGIN}/images/home/production.webp`;
    default:
      return `${SITE_ORIGIN}/images/home/angar.webp`;
  }
}

function ogImageForBuildingIconFamily(f: string): string {
  switch (f) {
    case "sklad":
      return `${SITE_ORIGIN}/images/home/sklad.webp`;
    case "naves":
      return `${SITE_ORIGIN}/images/home/naves.webp`;
    case "karkas":
      return `${SITE_ORIGIN}/images/home/production.webp`;
    case "selhoz":
      return `${SITE_ORIGIN}/images/home/agro.webp`;
    case "angar":
    case "other":
    default:
      return `${SITE_ORIGIN}/images/home/angar.webp`;
  }
}

/** Блог: список постов */
export const BLOG_INDEX_TITLE = "Блог Freonn — статьи о строительстве промышленных зданий";
export const BLOG_INDEX_DESCRIPTION_RAW =
  "Экспертные статьи о строительстве ангаров, складов, производственных зданий. Цены 2026, технологии, документы, советы от Freonn.";
export const BLOG_INDEX_OG_ALT = "Freonn — блог о промышленных зданиях";

const REKVIZITY_TITLE_RAW = "Реквизиты компании Freonn — ООО «ЭКС» | ИНН, ОГРН, адрес";
const REKVIZITY_DESCRIPTION_RAW =
  "Реквизиты ООО «ЭКС»: ИНН 3604084591, ОГРН 1243600003569. Юридический адрес, телефон, электронная почта, банковские реквизиты строительной компании Freonn.";

const PORTFOLIO_INDEX_TITLE_RAW = "Портфолио Freonn — реализованные промышленные здания | кейсы";
const PORTFOLIO_INDEX_DESCRIPTION_RAW =
  "Кейсы Freonn: склады, ангары, производственные и торговые здания по России. Площади, регионы, сроки. ООО «ЭКС», с 2011 года, гарантия 5 лет.";

const EXPLICIT_404_TITLE = "Страница не найдена — 404 | Freonn";
const EXPLICIT_404_DESCRIPTION_RAW =
  "Страница не найдена. Воспользуйтесь навигацией или перейдите на главную страницу Freonn — строительство промышленных зданий под ключ.";

export function sizePriceHintFromFloorPrice(priceFrom: number): string {
  return `от ${(priceFrom / 1_000_000).toFixed(1).replace(".", ",")} млн ₽`;
}

export function presentationHome(): PageHeadPresentation {
  return {
    title: clampSeoTitle(HOME_PAGE_TITLE),
    description: polishMetaDescription(HOME_PAGE_DESCRIPTION),
    ogImageAlt: HOME_PAGE_OG_IMAGE_ALT,
    ogType: "website",
    canonicalPath: "/",
    ogImageUrl: `${SITE_ORIGIN}/images/home/sklad.webp`,
  };
}

/** OG title/description для главной (короче title). */
export function homeOgHead(): { title: string; description: string } {
  return { title: HOME_PAGE_OG_TITLE, description: HOME_PAGE_OG_DESCRIPTION };
}

export function presentationBlogIndex(): PageHeadPresentation {
  return {
    title: clampSeoTitle(BLOG_INDEX_TITLE),
    description: polishMetaDescription(BLOG_INDEX_DESCRIPTION_RAW),
    ogImageAlt: BLOG_INDEX_OG_ALT,
    ogType: "website",
    canonicalPath: "/blog",
  };
}

export function presentationRekvizity(): PageHeadPresentation {
  return {
    title: clampSeoTitle(REKVIZITY_TITLE_RAW),
    description: polishMetaDescription(REKVIZITY_DESCRIPTION_RAW),
    ogImageAlt: "Freonn — реквизиты ООО «ЭКС»",
    ogType: "website",
    canonicalPath: "/rekvizity",
  };
}

export function presentationPortfolioIndex(): PageHeadPresentation {
  return {
    title: clampSeoTitle(PORTFOLIO_INDEX_TITLE_RAW),
    description: polishMetaDescription(PORTFOLIO_INDEX_DESCRIPTION_RAW),
    ogImageAlt: "Портфолио Freonn",
    ogType: "website",
    canonicalPath: "/portfolio",
    ogImageUrl: `${SITE_ORIGIN}/images/home/sklad.webp`,
  };
}

export function presentationExplicit404(): PageHeadPresentation {
  return {
    title: clampSeoTitle(EXPLICIT_404_TITLE),
    description: polishMetaDescription(EXPLICIT_404_DESCRIPTION_RAW),
    ogImageAlt: "Freonn",
    ogType: "website",
    canonicalPath: "/404",
  };
}

export function presentationInfoPage(page: {
  h1: string;
  title: string;
  metaDescription: string;
  slug: string;
}): PageHeadPresentation {
  return {
    title: clampSeoTitle(page.title),
    description: polishMetaDescription(page.metaDescription),
    ogImageAlt: page.h1,
    ogType: "website",
    canonicalPath: page.slug,
  };
}

export function presentationPortfolioCase(item: {
  h1: string;
  title: string;
  metaDescription: string;
  slug: string;
  buildingType: string;
}): PageHeadPresentation {
  const bt = item.buildingType.toLowerCase();
  let ogImagePath = "/images/home/angar.webp";
  if (bt.includes("склад")) ogImagePath = "/images/home/sklad.webp";
  else if (bt.includes("производ") || bt.includes("цех")) ogImagePath = "/images/home/production.webp";
  else if (bt.includes("торгов")) ogImagePath = "/images/home/trade.webp";
  else if (bt.includes("зерн") || bt.includes("сельхоз")) ogImagePath = "/images/home/agro.webp";
  return {
    title: clampSeoTitle(item.title),
    description: polishMetaDescription(item.metaDescription),
    ogImageAlt: item.h1,
    ogType: "website",
    canonicalPath: item.slug,
    ogImageUrl: `${SITE_ORIGIN}${ogImagePath}`,
  };
}

export function presentationLanding(landing: {
  h1: string;
  metaDescription: string;
  price: string;
  slug: string;
  parentSlug?: string;
}): PageHeadPresentation {
  const ogImageUrl = ogImageForLanding(landing.slug, landing.parentSlug);
  return {
    title: landingDocumentTitle(landing.h1, landing.price),
    description: polishMetaDescription(landing.metaDescription),
    ogImageAlt: landing.h1,
    ogType: "website",
    canonicalPath: landing.slug,
    ...(ogImageUrl ? { ogImageUrl } : {}),
  };
}

export function presentationGeo(
  geo: {
    h1: string;
    metaDescription: string;
    slug: string;
    kind?: "angary" | "sklad" | "proizvodstvo";
  },
  priceHint: string,
): PageHeadPresentation {
  return {
    title: geoDocumentTitle(geo.h1, priceHint),
    description: polishMetaDescription(geo.metaDescription),
    ogImageAlt: `${geo.h1} — Freonn`,
    ogType: "website",
    canonicalPath: geo.slug,
    ogImageUrl: ogImageForGeoKind(geo.kind),
  };
}

export function presentationSizePage(page: {
  h1: string;
  metaDescription: string;
  priceFrom: number;
  slug: string;
}): PageHeadPresentation {
  const priceHint = sizePriceHintFromFloorPrice(page.priceFrom);
  return {
    title: sizeDocumentTitle(page.h1, priceHint),
    description: polishMetaDescription(page.metaDescription),
    ogImageAlt: `${page.h1} — Freonn`,
    ogType: "website",
    canonicalPath: page.slug,
    ogImageUrl: page.slug.includes("sklad")
      ? `${SITE_ORIGIN}/images/home/sklad.webp`
      : page.slug.includes("tsekh")
        ? `${SITE_ORIGIN}/images/home/production.webp`
        : `${SITE_ORIGIN}/images/home/angar.webp`,
  };
}

export function presentationBlogPost(post: {
  h1: string;
  metaDescription: string;
  slug: string;
  ogImageUrl?: string;
}): PageHeadPresentation {
  return {
    title: blogPostDocumentTitle(post.h1),
    description: polishMetaDescription(post.metaDescription),
    ogImageAlt: post.h1,
    ogType: "article",
    canonicalPath: post.slug,
    ...(post.ogImageUrl ? { ogImageUrl: post.ogImageUrl } : {}),
  };
}

/** SEO для страниц калькуляторных типов зданий: `/zdaniya/:id` */
export function presentationBuildingType(b: {
  id: string;
  label: string;
  categoryLabel: string;
  kitRubM2: number;
  iconFamily: string;
}): PageHeadPresentation {
  const canonicalPath = `/zdaniya/${b.id}`;
  const priceStr = `от ${b.kitRubM2.toLocaleString("ru-RU")} ₽/м²`;
  const title = clampSeoTitle(`${b.label} под ключ — ${priceStr} | Freonn`);
  const descRaw = `Строительство «${b.label}» из ЛСТК и металлоконструкций: проектирование, завод, монтаж по России. Раздел: ${b.categoryLabel}. Ориентир комплекта ${priceStr}. ООО «ЭКС» (Freonn), с 2011 года, гарантия 5 лет.`;
  return {
    title,
    description: polishMetaDescription(descRaw),
    ogImageAlt: `${b.label} — Freonn`,
    ogType: "website",
    canonicalPath,
    ogImageUrl: ogImageForBuildingIconFamily(b.iconFamily),
  };
}

const BUILDING_TYPES_INDEX_TITLE_RAW =
  "Каталог типов зданий для расчёта стоимости — ангары, склады, с/х, производство | Freonn";
const BUILDING_TYPES_INDEX_DESC_RAW =
  "Полный перечень типов промышленных и сельхоз зданий из калькулятора Freonn: у каждого типа отдельная страница и переход в конфигуратор с предвыбором. ООО «ЭКС», с 2011 года, гарантия 5 лет.";

/** Хаб `/zdaniya` — список всех типов для SEO и навигации */
export function presentationBuildingTypesIndex(): PageHeadPresentation {
  return {
    title: clampSeoTitle(BUILDING_TYPES_INDEX_TITLE_RAW),
    description: polishMetaDescription(BUILDING_TYPES_INDEX_DESC_RAW),
    ogImageAlt: "Каталог типов зданий Freonn",
    ogType: "website",
    canonicalPath: "/zdaniya",
    ogImageUrl: `${SITE_ORIGIN}/images/home/angar.webp`,
  };
}

const MO_HUB_TITLE_RAW = "Ангары и склады в Московской области под ключ | Freonn";
const MO_HUB_DESC_RAW =
  "Строительство ангаров, складов и цехов в Московской области: 40+ городов Подмосковья, выезд инженера за 24 ч, 87+ объектов. Офис в Москве, монтаж под ключ.";

/** Хаб `/moskovskaya-oblast` — гео-страницы МО */
export function presentationMoHub(): PageHeadPresentation {
  return {
    title: clampSeoTitle(MO_HUB_TITLE_RAW),
    description: polishMetaDescription(MO_HUB_DESC_RAW),
    ogImageAlt: "Строительство в Московской области — Freonn",
    ogType: "website",
    canonicalPath: "/moskovskaya-oblast",
    ogImageUrl: `${SITE_ORIGIN}/images/home/sklad.webp`,
  };
}

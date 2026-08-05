import type { PageHeadPresentation } from "@shared/seoPagePresentation";
import { canonicalUrl, ogImageMimeType, resolvedOgImageUrl } from "@shared/seoPagePresentation";

function ensureMetaByName(name: string): HTMLMetaElement {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  return el;
}

function ensureMetaByProperty(prop: string): HTMLMetaElement {
  let el = document.querySelector(`meta[property="${prop}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", prop);
    document.head.appendChild(el);
  }
  return el;
}

function ensureCanonical(): HTMLLinkElement {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  return el;
}

/** Яндекс / Google: самоссылка hreflang для одноязычного RU-сайта */
export function syncHreflangAlternates(pageUrl: string): void {
  const upsert = (code: string) => {
    const sel = `link[rel="alternate"][hreflang="${code}"]`;
    let el = document.querySelector(sel) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement("link");
      el.rel = "alternate";
      el.setAttribute("hreflang", code);
      document.head.appendChild(el);
    }
    el.href = pageUrl;
  };
  upsert("ru-RU");
  upsert("x-default");
  document.documentElement.lang = "ru-RU";
}

/**
 * Синхронизирует `<title>`, description, canonical и стандартный пакет OG/Twitter для `og:type` website или article.
 * Используется после клиентской навигации; поля должны совпадать с `getDocumentMetaForRequest` + `presentation*`.
 */
export function syncStandardPageHead(p: PageHeadPresentation): void {
  const pageUrl = canonicalUrl(p.canonicalPath);
  const ogImage = resolvedOgImageUrl(p);

  document.title = p.title;
  ensureMetaByName("description").content = p.description;
  ensureCanonical().href = pageUrl;
  syncHreflangAlternates(pageUrl);

  ensureMetaByProperty("og:title").content = p.title;
  ensureMetaByProperty("og:description").content = p.description;
  ensureMetaByProperty("og:url").content = pageUrl;
  ensureMetaByProperty("og:type").content = p.ogType;
  ensureMetaByProperty("og:image").content = ogImage;
  ensureMetaByProperty("og:image:secure_url").content = ogImage;
  ensureMetaByProperty("og:image:type").content = ogImageMimeType(ogImage);
  ensureMetaByProperty("og:image:width").content = "1200";
  ensureMetaByProperty("og:image:height").content = "630";
  ensureMetaByProperty("og:image:alt").content = p.ogImageAlt;
  ensureMetaByProperty("og:locale").content = "ru_RU";
  ensureMetaByProperty("og:site_name").content = "Freonn";

  ensureMetaByName("twitter:card").content = "summary_large_image";
  ensureMetaByName("twitter:title").content = p.title;
  ensureMetaByName("twitter:description").content = p.description;
  ensureMetaByName("twitter:image").content = ogImage;
  ensureMetaByName("twitter:image:alt").content = p.ogImageAlt;
}

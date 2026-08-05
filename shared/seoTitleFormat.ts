/** Единые правила title/description для серверной инъекции и клиента (Яндекс/Google SERP). */

const BRAND = "Freonn";

/** Жёсткие лимиты SERP — единый источник для seoTitleFormat и seoAuditChecks. */
export const SEO_TITLE_MAX = 60;
export const SEO_DESC_MAX = 160;
export const SEO_DESC_MIN = 120;

const DESC_TAIL =
  " Под ключ с 2011 года, гарантия 5 лет. Бесплатный расчёт: 8 (800) 101-20-09.";

export function clampSeoTitle(s: string, maxLen = SEO_TITLE_MAX): string {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= maxLen) return t;
  const cut = t.slice(0, maxLen - 1).trimEnd();
  const lastSpace = cut.lastIndexOf(" ");
  let out = (lastSpace > 28 ? cut.slice(0, lastSpace) : cut) + "…";
  if (out.length > maxLen) out = out.slice(0, maxLen - 1) + "…";
  return out.length <= maxLen ? out : out.slice(0, maxLen);
}

/** Description 120–160 символов с УТП, без переспама. */
export function polishMetaDescription(base: string): string {
  let s = base.replace(/\s+/g, " ").trim();
  if (s.length < SEO_DESC_MIN) {
    s = (s + DESC_TAIL).replace(/\s+/g, " ").trim();
  }
  if (s.length > SEO_DESC_MAX) {
    s = s.slice(0, SEO_DESC_MAX - 1).trimEnd();
    const sp = s.lastIndexOf(" ");
    if (sp > 80) s = s.slice(0, sp);
    s += "…";
  }
  if (s.length > SEO_DESC_MAX) {
    s = s.slice(0, SEO_DESC_MAX - 1).trimEnd() + "…";
  }
  return s.length <= SEO_DESC_MAX ? s : s.slice(0, SEO_DESC_MAX);
}

export function landingDocumentTitle(h1: string, price: string): string {
  return clampSeoTitle(`${h1} — ${ price} | ${BRAND}`);
}

export function sizeDocumentTitle(h1: string, priceHint: string): string {
  return clampSeoTitle(`${h1} — ${ priceHint} | ${BRAND}`);
}

export function geoDocumentTitle(h1: string, pricePerM2: string): string {
  return clampSeoTitle(`${h1} — ${ pricePerM2} | ${BRAND}`);
}

export function blogPostDocumentTitle(h1: string): string {
  return clampSeoTitle(`${h1} | ${BRAND}`);
}

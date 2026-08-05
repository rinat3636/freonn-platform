import {
  moscowPriceForKind,
  normalizeBuildingKind,
  MO_BASE_RUB_M2,
  MO_PROIZVODSTVO_BASE_RUB_M2,
  type MoscowBuildingKind,
} from "./moscowPricing";

export type { MoscowBuildingKind } from "./moscowPricing";
import { skladSizePages, tsekhSizePages } from "../client/src/data/sizePages";
import {
  getGeoPortfolioSeeAlso as getGeoPortfolioSeeAlsoFromData,
  MO_HUB_FEATURED_PORTFOLIO,
  MO_PORTFOLIO_FALLBACK as MO_PORTFOLIO_FALLBACK_DATA,
} from "../client/src/data/portfolioItems";

export type MoLink = { href: string; label: string; description?: string; price?: number };

export { MO_PORTFOLIO_FALLBACK_DATA as MO_PORTFOLIO_FALLBACK };

export function getGeoPortfolioSeeAlso(slugKey: string): MoLink {
  const item = getGeoPortfolioSeeAlsoFromData(slugKey);
  return { href: item.href, label: item.label, description: item.description };
}

export const MO_HUB_SLUG = "/moskovskaya-oblast";

import { MO_TIER1_CITIES } from "../client/src/data/moGeoCities";
import { MO_TIER1_COMBO_SIZES, MOSCOW_COMBO_SIZES, type MoscowComboSize } from "./seoSizes";
import { isMoTier1SlugKey } from "./seoRegionTier";
import { peripheralMoRubM2 } from "./moscowPricing";

export {
  MO_TIER1_COMBO_SIZES,
  MOSCOW_COMBO_SIZES,
  STANDALONE_KIND_SIZES,
  isMoscowComboSize,
  isMoTier1ComboSize,
  type MoscowComboSize,
  type MoTier1ComboSize,
} from "./seoSizes";
export { isMoTier1SlugKey, regionTierForPath, type SeoRegionTier } from "./seoRegionTier";

export type MoscowComboPrefix = "angar" | "sklad" | "tsekh";

export function comboPrefixFromKind(kind: MoscowBuildingKind): MoscowComboPrefix {
  const k = normalizeBuildingKind(kind);
  if (k === "sklad") return "sklad";
  if (k === "proizvodstvo") return "tsekh";
  return "angar";
}

export function buildingKindLabel(kind: MoscowBuildingKind, capitalized = true): string {
  const k = normalizeBuildingKind(kind);
  if (k === "sklad") return capitalized ? "Склад" : "склад";
  if (k === "proizvodstvo") return capitalized ? "Цех" : "цех";
  return capitalized ? "Ангар" : "ангар";
}

export function moscowComboHref(kind: MoscowBuildingKind, size: number): string {
  return `/${comboPrefixFromKind(kind)}-${size}-m2-moskva`;
}

export function moTier1ComboHref(kind: MoscowBuildingKind, size: number, slugKey: string): string {
  return `/${comboPrefixFromKind(kind)}-${size}-m2-${slugKey}`;
}

export function moTier1ComboLabel(kind: MoscowBuildingKind, size: number, cityName: string): string {
  return `${buildingKindLabel(kind)} ${size.toLocaleString("ru-RU")} m² в ${cityName}`;
}

export function moTier1PriceForKind(
  kind: MoscowBuildingKind,
  size: number,
  priceCoeff: number,
): number {
  const k = normalizeBuildingKind(kind);
  const rubM2 = peripheralMoRubM2(priceCoeff, k === "proizvodstvo" ? "proizvodstvo" : k === "sklad" ? "sklad" : "angar");
  return Math.round(size * rubM2);
}

export function moTier1ComboLinksForKind(kind: MoscowBuildingKind, slugKey: string): MoLink[] {
  const city = MO_TIER1_CITIES.find((c) => c.slugKey === slugKey);
  if (!city) return [];
  return MO_TIER1_COMBO_SIZES.map((size) => ({
    href: moTier1ComboHref(kind, size, slugKey),
    label: moTier1ComboLabel(kind, size, city.cityPred),
    price: moTier1PriceForKind(kind, size, city.priceCoeff),
  }));
}

export function moscowComboLabel(kind: MoscowBuildingKind, size: number): string {
  return `${buildingKindLabel(kind)} ${size.toLocaleString("ru-RU")} m²`;
}

export function isMoRegion(region: string, city?: string): boolean {
  return region === "Московская область" || city === "Москва";
}

export function moscowComboLinksForKind(kind: MoscowBuildingKind): MoLink[] {
  return MOSCOW_COMBO_SIZES.map((size) => ({
    href: moscowComboHref(kind, size),
    label: moscowComboLabel(kind, size),
    price: moscowPriceForKind(kind, size),
  }));
}

export const MO_HUB_FEATURED_COMBOS: { kind: MoscowBuildingKind; size: MoscowComboSize }[] = [
  { kind: "angar", size: 1000 },
  { kind: "sklad", size: 1000 },
  { kind: "proizvodstvo", size: 1000 },
];

export function moHubFeaturedComboLinks(): MoLink[] {
  return MO_HUB_FEATURED_COMBOS.map(({ kind, size }) => ({
    href: moscowComboHref(kind, size),
    label: moscowComboLabel(kind, size),
    price: moscowPriceForKind(kind, size),
  }));
}

export const MO_HUB_BLOG_LINKS: MoLink[] = [
  { href: "/blog/stroitelstvo-angarov-moskovskaya-oblast", label: "Строительство ангаров в МО" },
  { href: "/blog/sklad-pod-klyuch-moskva", label: "Склад под ключ в Москве" },
  { href: "/blog/stoimost-sklada-1000-m2-moskva", label: "Склад 1000 m²: цена в Москве" },
  { href: "/blog/proizvodstvenny-ceh-moskovskaya-oblast", label: "Производственный цех в МО" },
  { href: "/blog/sklad-2000-m2-moskovskaya-oblast", label: "Склад 2000 m² в МО" },
  { href: "/blog/ckad-logistika-moskovskaya-oblast", label: "Логистика у ЦКАД" },
];

export const MO_HUB_FEATURED_CASES: MoLink[] = MO_HUB_FEATURED_PORTFOLIO.map((c) => ({
  href: c.href,
  label: c.label,
  description: c.description,
}));

const ANGAR_SIZE_GRID: { size: number; priceHint: string }[] = [
  { size: 200, priceHint: "от 1,2 млн ₽" },
  { size: 300, priceHint: "от 1,7 млн ₽" },
  { size: 500, priceHint: "от 2,8 млн ₽" },
  { size: 1000, priceHint: "от 5,5 млн ₽" },
  { size: 1500, priceHint: "от 8 млн ₽" },
  { size: 2000, priceHint: "от 10,5 млн ₽" },
  { size: 3000, priceHint: "от 15 млн ₽" },
  { size: 5000, priceHint: "от 24 млн ₽" },
  { size: 10000, priceHint: "от 46 млн ₽" },
];

export type GeoSizeGridItem = { size: string; href: string; price: string };

/** Ссылки на size/combo-страницы для geo-лендингов. */
export function getGeoSizeGridLinks(
  kind: MoscowBuildingKind,
  isMo: boolean,
  geoSlugKey?: string,
): GeoSizeGridItem[] {
  const normalized = normalizeBuildingKind(kind);

  if (
    isMo &&
    geoSlugKey &&
    geoSlugKey !== "moskva" &&
    isMoTier1SlugKey(geoSlugKey)
  ) {
    const city = MO_TIER1_CITIES.find((c) => c.slugKey === geoSlugKey);
    if (city) {
      return MO_TIER1_COMBO_SIZES.map((size) => ({
        size: `${size.toLocaleString("ru-RU")} m²`,
        href: moTier1ComboHref(normalized, size, geoSlugKey),
        price: `от ${moTier1PriceForKind(normalized, size, city.priceCoeff).toLocaleString("ru-RU")} ₽`,
      }));
    }
  }

  if (normalized === "sklad" || normalized === "proizvodstvo") {
    if (!isMo) return getGeoNonMoFallbackLinks(kind);
    return MOSCOW_COMBO_SIZES.map((size) => ({
      size: `${size.toLocaleString("ru-RU")} m²`,
      href: moscowComboHref(normalized, size),
      price: `от ${moscowPriceForKind(normalized, size).toLocaleString("ru-RU")} ₽`,
    }));
  }

  if (isMo && geoSlugKey && geoSlugKey !== "moskva" && isMoTier1SlugKey(geoSlugKey)) {
    const city = MO_TIER1_CITIES.find((c) => c.slugKey === geoSlugKey);
    if (city) {
      return MO_TIER1_COMBO_SIZES.map((size) => ({
        size: `${size.toLocaleString("ru-RU")} m²`,
        href: moTier1ComboHref("angar", size, geoSlugKey),
        price: `от ${moTier1PriceForKind("angar", size, city.priceCoeff).toLocaleString("ru-RU")} ₽`,
      }));
    }
  }

  return ANGAR_SIZE_GRID.map(({ size, priceHint }) => ({
    size: size === 10000 ? "10 000 m²" : `${size.toLocaleString("ru-RU")} m²`,
    href: `/angar-${size}-m2`,
    price: priceHint,
  }));
}

/** Перекрёстные ссылки между angar/sklad/tsekh на Moscow combo-страницах. */
export function moscowComboCrossLinks(
  kind: MoscowBuildingKind,
  size: MoscowComboSize,
): MoLink[] {
  const k = normalizeBuildingKind(kind);
  const all: MoscowBuildingKind[] = ["angar", "sklad", "proizvodstvo"];
  return all
    .filter((other) => other !== k)
    .map((other) => ({
      href: moscowComboHref(other, size),
      label: `${buildingKindLabel(other)} ${size} m² в Москве`,
      description:
        other === "sklad"
          ? "Логистика, доки, класс B"
          : other === "proizvodstvo"
            ? "Производство, крановые пути"
            : "Типовые пролёты, холодные решения",
    }));
}

/** Fallback size-grid для geo sklad/proizvodstvo вне МО. */
export function getGeoNonMoFallbackLinks(kind: MoscowBuildingKind): GeoSizeGridItem[] {
  const normalized = normalizeBuildingKind(kind);
  if (normalized === "sklad") {
    return skladSizePages.map((p) => ({
      size: `${p.size.toLocaleString("ru-RU")} m²`,
      href: p.slug,
      price: `от ${p.priceFrom.toLocaleString("ru-RU")} ₽`,
    }));
  }
  if (normalized === "proizvodstvo") {
    return tsekhSizePages.map((p) => ({
      size: `${p.size.toLocaleString("ru-RU")} m²`,
      href: p.slug,
      price: `от ${p.priceFrom.toLocaleString("ru-RU")} ₽`,
    }));
  }
  return [];
}

/** Цены для AggregateOffer на geo-страницах (500/1000/2000 m²). */
export function geoAggregateOfferPrices(
  kind: MoscowBuildingKind,
  priceCoeff: number,
): { lowPrice: number; highPrice: number; offerCount: number } {
  const normalized = normalizeBuildingKind(kind);
  const base = normalized === "proizvodstvo" ? MO_PROIZVODSTVO_BASE_RUB_M2 : MO_BASE_RUB_M2;
  const warmMult = normalized === "proizvodstvo" ? 1.18 : 1.35;
  const prices = MOSCOW_COMBO_SIZES.map((size) => Math.round(base * priceCoeff * size));
  const lowPrice = Math.min(...prices);
  const highPrice = Math.round(Math.max(...prices) * warmMult);
  return { lowPrice, highPrice, offerCount: MOSCOW_COMBO_SIZES.length };
}

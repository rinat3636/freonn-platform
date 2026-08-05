/**
 * Региональные tier'ы для MO-first SEO: sitemap priority, turbo order, аналитика.
 */
import {
  MO_TIER1_SLUG_KEYS,
  MO_TIER2_SLUG_KEYS,
  MO_TIER3_SLUG_KEYS,
} from "../client/src/data/moGeoCities";

export type SeoRegionTier = "moscow_core" | "mo_tier1" | "mo_tier2" | "federal";

export function geoSlugKeyFromGeoPath(path: string): string | null {
  const m = path.match(/^\/(?:angary|sklady|proizvodstvennye-zdaniya)-([a-z0-9-]+)$/);
  return m?.[1] ?? null;
}

export function geoSlugKeyFromMoComboPath(path: string): string | null {
  const m = path.match(/^\/(?:angar|sklad|tsekh)-\d+(?:x\d+)?-m2-([a-z0-9-]+)$/);
  return m?.[1] ?? null;
}

export function regionTierForGeoSlugKey(slugKey: string): SeoRegionTier {
  if (slugKey === "moskva") return "moscow_core";
  if ((MO_TIER1_SLUG_KEYS as readonly string[]).includes(slugKey)) return "mo_tier1";
  if (
    (MO_TIER2_SLUG_KEYS as readonly string[]).includes(slugKey) ||
    (MO_TIER3_SLUG_KEYS as readonly string[]).includes(slugKey)
  ) {
    return "mo_tier2";
  }
  return "federal";
}

/** Tier для geo-URL и MO combo size (`/angar-1000-m2-podolsk`). */
export function regionTierForPath(path: string): SeoRegionTier | null {
  if (path === "/moskovskaya-oblast") return "moscow_core";
  if (path.endsWith("-m2-moskva") || /-(moskva)(?:$|\/)/.test(path)) return "moscow_core";

  const comboKey = geoSlugKeyFromMoComboPath(path);
  if (comboKey) return regionTierForGeoSlugKey(comboKey);

  const geoKey = geoSlugKeyFromGeoPath(path);
  if (geoKey) return regionTierForGeoSlugKey(geoKey);

  return null;
}

/** Sitemap priority по tier (MO-first). */
export function sitemapPriorityForRegionTier(tier: SeoRegionTier | null, fallback: string): string {
  switch (tier) {
    case "moscow_core":
      return "0.95";
    case "mo_tier1":
      return "0.90";
    case "mo_tier2":
      return "0.82";
    case "federal":
      return "0.50";
    default:
      return fallback;
  }
}

export function isMoTier1SlugKey(slugKey: string): boolean {
  return (MO_TIER1_SLUG_KEYS as readonly string[]).includes(slugKey);
}

/** Число geo-URL с tier=federal (sitemap priority 0.50). */
export function countFederalGeoPaths(paths: readonly string[]): number {
  return paths.filter((p) => regionTierForPath(p) === "federal").length;
}

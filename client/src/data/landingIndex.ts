/**
 * Единая точка доступа к landing-данным (root + subpages).
 * Root landings включают nicheLandingPages через landingPages.ts.
 */
import { landingPages, type LandingPage, resolveLandingBySlug, getLandingBySlug } from "./landingPages";
import { allLandingSubpages, getLandingSubpageBySlug, landingSubpagesForParent } from "./landingSubpages";

export { landingPages, allLandingSubpages, resolveLandingBySlug, getLandingBySlug, getLandingSubpageBySlug, landingSubpagesForParent };
export type { LandingPage };

/** Все landing URL (root + sub) для инвентаризации и audit. */
export function allLandings(): LandingPage[] {
  return [...landingPages, ...allLandingSubpages];
}

export function allLandingSlugs(): string[] {
  return allLandings().map((p) => p.slug);
}

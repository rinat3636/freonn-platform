/**
 * Единое разрешение URL для SEO: meta, JSON-LD, SSR-тело, признак SPA.
 * Порядок веток совпадает с прежней логикой — при добавлении типа страницы обновляйте все потребители через этот модуль.
 */
import type { BlogPost } from "../../client/src/data/blogPosts";
import { getBlogBySlug } from "../../client/src/data/blogPosts";
import type { CalculatorBuildingType } from "../../shared/buildingCatalog";
import { getBuildingTypeDef } from "../../shared/buildingCatalog";
import type { GeoPage } from "../../client/src/data/geoPages";
import { getGeoBySlug } from "../../client/src/data/geoPages";
import type { InfoPage } from "../../client/src/data/infoPages";
import { getInfoPageBySlug } from "../../client/src/data/infoPages";
import { resolveLandingBySlug } from "../../client/src/data/landingPages";
import type { PortfolioItem } from "../../client/src/data/portfolioItems";
import { getPortfolioBySlug } from "../../client/src/data/portfolioItems";
import type { SizePage } from "../../client/src/data/sizePages";
import { getSizeBySlug } from "../../client/src/data/sizePages";
import { getMoHubPageBySlug } from "../../client/src/data/moHubPage";

export type SeoRouteMatch =
  | { kind: "home" }
  | { kind: "explicit_404" }
  | { kind: "blog_index" }
  | { kind: "rekvizity" }
  | { kind: "info"; page: InfoPage }
  | { kind: "portfolio_index" }
  | { kind: "portfolio_case"; item: PortfolioItem }
  | { kind: "landing"; page: import("../../client/src/data/landingPages").LandingPage }
  | { kind: "geo"; page: GeoPage }
  | { kind: "size"; page: SizePage }
  | { kind: "building_types_index" }
  | { kind: "mo_hub" }
  | { kind: "building_type"; type: CalculatorBuildingType }
  | { kind: "blog_post"; post: BlogPost }
  | { kind: "karta_sajta" }
  | { kind: "static" };

export function normalizeSpaPathname(url: string): string {
  const pathOnly = url.split("?")[0].split("#")[0];
  if (pathOnly === "" || pathOnly === "/") return "/";
  return pathOnly.replace(/\/+$/, "") || "/";
}

/**
 * Распознаёт контентный маршрут SPA. `null` — нет приложения под этим path (отдаём soft 404 HTML + 404 meta).
 */
export function matchSeoRoute(pathname: string): SeoRouteMatch | null {
  if (pathname === "/") return { kind: "home" };
  if (pathname === "/404") return { kind: "explicit_404" };
  if (pathname === "/blog") return { kind: "blog_index" };
  if (pathname === "/rekvizity") return { kind: "rekvizity" };
  if (pathname === "/llms.txt") return { kind: "static" };

  const infoPage = getInfoPageBySlug(pathname);
  if (infoPage) return { kind: "info", page: infoPage };

  if (pathname === "/portfolio") return { kind: "portfolio_index" };

  const portfolioCase = getPortfolioBySlug(pathname);
  if (portfolioCase) return { kind: "portfolio_case", item: portfolioCase };

  const landing = resolveLandingBySlug(pathname);
  if (landing) return { kind: "landing", page: landing };

  const geo = getGeoBySlug(pathname);
  if (geo) return { kind: "geo", page: geo };

  const size = getSizeBySlug(pathname);
  if (size) return { kind: "size", page: size };

  if (pathname === "/zdaniya") {
    return { kind: "building_types_index" };
  }

  if (getMoHubPageBySlug(pathname)) {
    return { kind: "mo_hub" };
  }

  if (pathname.startsWith("/zdaniya/")) {
    const id = pathname.slice("/zdaniya/".length);
    if (id && !id.includes("/")) {
      const bt = getBuildingTypeDef(id);
      if (bt) return { kind: "building_type", type: bt };
    }
  }

  const post = getBlogBySlug(pathname);
  if (post) return { kind: "blog_post", post };

  if (pathname === "/karta-sajta") return { kind: "karta_sajta" };

  return null;
}

export function isSpaRoute(url: string): boolean {
  return matchSeoRoute(normalizeSpaPathname(url)) !== null;
}

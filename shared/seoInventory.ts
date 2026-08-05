/**
 * URL inventory breakdown — единый источник для seo:audit и docs/SEO/URL_INVENTORY.md.
 */
import { blogPosts } from "../client/src/data/blogPosts";
import { geoSlugs } from "../client/src/data/geoPages";
import { infoPages } from "../client/src/data/infoPages";
import { landingPages } from "../client/src/data/landingPages";
import { allLandingSubpages } from "../client/src/data/landingSubpages";
import { portfolioItems } from "../client/src/data/portfolioItems";
import { allSizePages } from "../client/src/data/sizePages";
import { CALCULATOR_BUILDING_TYPES } from "./buildingCatalog";
import { MO_HUB_SLUG } from "../client/src/data/moHubPage";

export type UrlInventoryRow = {
  type: string;
  count: number;
  dataFiles: string;
  reactPage: string;
  ssr: string;
  turbo: string;
};

/** Sitemap URL counts by content type (must match buildSitemapXml). */
export function getUrlInventoryBreakdown(): UrlInventoryRow[] {
  const utility = 4; // /, /blog, /portfolio, /rekvizity
  const moHub = 1;
  const zdaniyaHub = 1;

  return [
    {
      type: "home + utility",
      count: utility,
      dataFiles: "homePageSeo.ts, blogPosts (index)",
      reactPage: "Home, BlogListPage, PortfolioListPage, RekvizityPage",
      ssr: "htmlBodyPrerender homeBody",
      turbo: "— (list pages excluded)",
    },
    {
      type: "MO hub",
      count: moHub,
      dataFiles: "moHubPage.ts",
      reactPage: "MoHubPage",
      ssr: "moHubBody",
      turbo: "moHubTurboHtml",
    },
    {
      type: "landing root + sub",
      count: landingPages.length + allLandingSubpages.length,
      dataFiles: "landingPages.ts, nicheLandingPages.ts, landingSubpages*.ts",
      reactPage: "LandingPage",
      ssr: "landingBody",
      turbo: "landingTurboHtml",
    },
    {
      type: "geo",
      count: geoSlugs.length,
      dataFiles: "geoPages.ts, moGeoCities.ts",
      reactPage: "GeoPage",
      ssr: "geoBody",
      turbo: "geoTurboHtml",
    },
    {
      type: "size (standalone + combo + dimension)",
      count: allSizePages.length,
      dataFiles: "sizePages.ts, moTier1ComboSizePages.ts",
      reactPage: "SizePage",
      ssr: "sizeBody",
      turbo: "sizeTurboHtml",
    },
    {
      type: "info / services",
      count: infoPages.length,
      dataFiles: "infoPages.ts",
      reactPage: "InfoArticlePage",
      ssr: "infoBody",
      turbo: "infoPageTurboHtml",
    },
    {
      type: "portfolio cases",
      count: portfolioItems.length,
      dataFiles: "portfolioItems.ts",
      reactPage: "PortfolioDetailPage",
      ssr: "portfolioCaseBody",
      turbo: "portfolioTurboHtml",
    },
    {
      type: "blog posts",
      count: blogPosts.length,
      dataFiles: "blogPosts.ts + blogPostsSeoExpansion.ts",
      reactPage: "BlogPostPage",
      ssr: "blogPostBody",
      turbo: "blogPostTurboHtml",
    },
    {
      type: "zdaniya catalog",
      count: zdaniyaHub + CALCULATOR_BUILDING_TYPES.length,
      dataFiles: "shared/buildingCatalog.ts",
      reactPage: "BuildingTypesHubPage, BuildingTypePage",
      ssr: "buildingTypesBody",
      turbo: "buildingTypeTurboHtml",
    },
  ];
}

export function totalSitemapUrlCount(): number {
  return getUrlInventoryBreakdown().reduce((n, r) => n + r.count, 0);
}

/** Paths used for Wouter vs matchSeoRoute parity smoke. */
export const WOUTER_PARITY_SMOKE_PATHS: readonly string[] = [
  "/",
  MO_HUB_SLUG,
  "/angary-moskva",
  "/sklady-himki",
  "/proizvodstvennye-zdaniya-schelkovo",
  "/angary/holodnye",
  "/bystrovozvodimye-zdaniya",
  "/angar-1000-m2",
  "/sklad-2000-m2-moskva",
  "/angar-1000-m2-podolsk",
  "/tsekh-2000-m2-balashiha",
  "/angar-20x40-m2",
  "/angar-24x60-m2",
  "/zdaniya/angar",
  "/blog/bystrovozvodimye-zdaniya-tehnologiya-2026",
  "/blog/odintsovo-sklad-klass-a-zapad-mo",
  "/blog/domodedovo-sklad-aeroport-m4",
  "/angary-ekaterinburg",
  "/sklad-1000-m2-odintsovo",
  "/portfolio/sklad-himki",
  "/tseny",
  "/garantii",
];

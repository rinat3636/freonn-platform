# URL Inventory — freonn.pro

> Auto-generated 2026-07-19 · `pnpm seo:inventory`

## Summary

| Metric | Count |
|--------|------:|
| Sitemap (audit) | 621 |
| Inventory sum | 620 |
| Geo | 172 |
| Size | 135 |
| Blog | 77 |

## Breakdown by type

| Type | Count | Data files | React | SSR | Turbo |
|------|------:|------------|-------|-----|-------|
| home + utility | 4 | homePageSeo.ts, blogPosts (index) | Home, BlogListPage, PortfolioListPage, RekvizityPage | htmlBodyPrerender homeBody | — (list pages excluded) |
| MO hub | 1 | moHubPage.ts | MoHubPage | moHubBody | moHubTurboHtml |
| landing root + sub | 61 | landingPages.ts, nicheLandingPages.ts, landingSubpages*.ts | LandingPage | landingBody | landingTurboHtml |
| geo | 172 | geoPages.ts, moGeoCities.ts | GeoPage | geoBody | geoTurboHtml |
| size (standalone + combo + dimension) | 135 | sizePages.ts, moTier1ComboSizePages.ts | SizePage | sizeBody | sizeTurboHtml |
| info / services | 12 | infoPages.ts | InfoArticlePage | infoBody | infoPageTurboHtml |
| portfolio cases | 21 | portfolioItems.ts | PortfolioDetailPage | portfolioCaseBody | portfolioTurboHtml |
| blog posts | 77 | blogPosts.ts + blogPostsSeoExpansion.ts | BlogPostPage | blogPostBody | blogPostTurboHtml |
| zdaniya catalog | 137 | shared/buildingCatalog.ts | BuildingTypesHubPage, BuildingTypePage | buildingTypesBody | buildingTypeTurboHtml |

## Matcher hub

Все path → `server/_core/seoRouteMatch.ts` → `matchSeoRoute()`.

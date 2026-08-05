# SEO Audit — Gaps (P0–P3)

> Обновлено: 2026-06-10

## Закрыто ✅

| ID | Задача | Статус |
|----|--------|--------|
| P1-meta | Title/desc ≤60/160, audit на presentation titles | ✅ 0 outliers |
| P1-federal | Federal geo sitemap priority 0.72→**0.50** | ✅ `seoRegionTier.ts` |
| P1-tier1 | Unique sklad/prod intros Tier1 (15 cities) | ✅ `moTier1GeoIntros.ts` |
| P1-blog | 4 MO blog posts (Odintsovo, Mytishchi, Krasnogorsk, Domodedovo) | ✅ |
| P2-audit | Federal geo count в `seo:audit`, Wouter parity paths | ✅ |
| P3-sameAs | Organization sameAs Yandex/2GIS | ✅ уже было |

## P0 — ops (ручное) ⏳

- [ ] Railway `SEO_CONTENT_REVISION=2026-06-20`
- [ ] Webmaster + GSC resubmit sitemap/turbo
- [ ] Tier0 recrawl 20 URL ([INDEXING_PLAN.md](./INDEXING_PLAN.md))
- [ ] GSC baseline 90d export

## P1 — пропущено / backlog

- Root landing FAQs — уже ~10 на каждый root; отдельный блок не нужен
- 2 MO blog posts/week — см. [CONTENT_BACKLOG.md](./CONTENT_BACKLOG.md)

## P2 — tech debt

- [ ] Merge `blogPosts.ts` + `blogPostsSeoExpansion.ts` в единый entry (сейчас spread-merge работает)
- [ ] DRY landing/geo/size SSR+turbo (blog DRY done)
- [ ] Central `ogImageForPath()` export (сейчас `seoPagePresentation` per-type)
- [ ] Portfolio real photos — owner blocker

## P3 — off-page

- Metrika dashboard — см. [MONITORING.md](./MONITORING.md)
- Citations / reviews — вне scope кода

## Команды

```bash
SEO_AUDIT_FEDERAL_GEO=1 pnpm seo:audit   # список federal trim candidates (warn-only)
```

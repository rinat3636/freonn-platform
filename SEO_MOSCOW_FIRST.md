> **Архив.** Актуально: [docs/SEO/README.md](docs/SEO/README.md)

# MO-First SEO Strategy — freonn.pro

> **Принцип:** Scale wide, rank narrow — много URL, но 65–75% органического трафика из Москвы и МО.

## Tier-модель

| Tier | Регион | Sitemap priority | Link equity |
|------|--------|------------------|-------------|
| **0** | Москва, `*-moskva`, `/moskovskaya-oblast` | 0.92–0.96 | ~70% |
| **1** | 16 городов MO Tier 1 (Подольск, Химки, …) | 0.90 | ~20% |
| **2** | MO Tier 2–3 | 0.82 | ~5% |
| **3** | Federal (СПб, Екб, …) | 0.72 | ~5% |

Код: `shared/seoRegionTier.ts` → `regionTierForPath()`, `sitemapPriorityForRegionTier()`.

## URL-матрица (цель ~650–700)

| Блок | Статус |
|------|--------|
| Landing root + sub (~46) | ✅ |
| Geo MO 3×36 | ✅ |
| Combo `*-m2-moskva` | ✅ |
| **Combo Tier1 `*-m2-{city}`** | ✅ `moTier1ComboSizePages.ts` |
| Size габариты | ✅ |
| Блог MO (70% статей) | ✅ 73 поста, `blog_drafts` 34/34 |

## Combo Tier 1

- Размеры: **1000, 2000 m²**
- Виды: angar + sklad + prod (по `moCityCapabilities`)
- Примеры: `/angar-1000-m2-podolsk`, `/sklad-2000-m2-himki`
- ~96 URL (16 городов × 2 размера × ~3 вида)

## Контент MO

1. **Логистика** — sklady, класс A/B, ЦКАД
2. **Производство** — tsekh, light industrial, кран
3. **Ангары** — холодные/тёплые, промзоны

Блог: `[услуга] + [город MO] + [intent]`. Очередь: `blog_drafts.md`.

## Директ

- Кампании MO: minus-слова `-новосибирск`, `-екaterinburg`, …
- SEO landing Tier 0–1 в объявлениях, не `/zdaniya/*`

## KPI (6 мес)

- Organic Moscow+MO ≥ **70%**
- GSC top impressions: `/angary-moskva`, `/sklady-moskva`, `/moskovskaya-oblast`
- Sitemap **650–700** URL → **592** (цель близка; рост — новые geo/combo по Metrika)
- Топ-10 Яндекс: **≥8/20** контрольных запросов с «москва/мо»

## Deploy checklist

```bash
pnpm seo:audit && pnpm check
git push origin main
# SEO_CONTENT_REVISION=YYYY-MM-DD in production .env
# Yandex Webmaster → Переобход sitemap
```

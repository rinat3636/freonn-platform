# Monitoring — SEO

> Обновлено: 2026-06-10

## Yandex Metrika

Цели (события уже в коде):

| Goal | Где | Назначение |
|------|-----|------------|
| `seo_landing_view` | LandingPage | root/sub landings |
| `seo_geo_view` | GeoPage | geo MO + federal |
| `seo_size_view` | SizePage | standalone + combo |
| `cross_nav_chip` | seeAlso, portfolio | внутренняя перелинковка |

**Дашборд (создать в Metrika):**
- Визиты по сегментам: `/angary-*`, `/sklady-*`, `/proizvodstvennye-*`, `/angar-*-m2-*`, `/blog/*`
- Конверсии: форма + `tel:` + калькulator
- Сравнение MO tier1 vs federal geo (URL filter)

## Search Console / Webmaster

| Метрика | Частота | Порог |
|---------|---------|-------|
| Indexed vs submitted | weekly | ≥95% Tier0 |
| Coverage errors | weekly | 0 critical |
| CWV (mobile) | monthly | LCP <2.5s, CLS <0.1 |
| Impressions MO queries | monthly | +10% QoQ |

## Turbo feeds

- Split routes: `/turbo-geo.xml`, `/turbo-blog.xml` (порог split: 900 items)
- После >900 turbo items — проверить Webmaster на ошибки RSS

## CI

```bash
pnpm seo:audit   # route parity, meta, relatedPosts, sitemap count
pnpm seo:inventory  # docs/SEO/URL_INVENTORY.md regen
```

## Organization off-page

`shared/freonnOrganizationJsonLd.ts` — `sameAs`: freonn.ru, Yandex Maps, 2GIS, MAX.  
Обновлять при смене профилей; не дублировать NAP в footer.

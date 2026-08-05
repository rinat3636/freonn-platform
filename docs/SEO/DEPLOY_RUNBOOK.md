# Deploy Runbook — SEO

> Обновлено: 2026-06-10

## Pre-push (локально)

```bash
pnpm check
pnpm seo:audit
pnpm build:ci   # опционально перед крупным релизом
```

Ожидания после P1:
- Sitemap **≥596** `<loc>`
- Blog posts **77** (73 + 4 MO)
- Meta outliers **0** (title ≤60, desc ≤160)
- Federal geo: sitemap priority **0.50**

## Push → Railway

1. `git push origin main`
2. Дождаться деплоя Railway (build + health)
3. В Railway env выставить **`SEO_CONTENT_REVISION=2026-06-20`** (или дата релиза)
4. Redeploy если revision менялся после последнего билда

## Post-deploy smoke (5 мин)

```bash
curl -sI https://freonn.pro/sitemap.xml | head -1
curl -s https://freonn.pro/sitemap.xml | grep -c "<loc>"
curl -sI https://freonn.pro/turbo-geo.xml | head -1
curl -sI https://freonn.pro/turbo-blog.xml | head -1
curl -s https://freonn.pro/sklady-himki | grep -c "ld-ssr-page"
curl -s https://freonn.pro/sklady-himki | grep -c "<!--SSR_BODY-->"
```

- HTTP **200** на sitemap и turbo
- `<loc>` count ≥596
- На sample URL: есть `ld-ssr-page`, **нет** `<!--SSR_BODY-->`

## Webmaster / GSC

1. [Yandex Webmaster](https://webmaster.yandex.ru) → Индексирование → Sitemap → **Переотправить**:
   - `https://freonn.pro/sitemap.xml`
   - `https://freonn.pro/turbo.xml` (или split: `turbo-geo.xml`, `turbo-blog.xml`)
2. Google Search Console → Sitemaps → resubmit `sitemap.xml`
3. Tier0 URL — ручной «Проверить URL» / Request indexing (см. [INDEXING_PLAN.md](./INDEXING_PLAN.md))

## Rollback

- Railway → предыдущий deployment → Promote
- Откатить `SEO_CONTENT_REVISION` не обязателен (lastmod только вперёд)

# Indexing Plan — P0

> Обновлено: 2026-06-10

## Tier0 — ручной recrawl (20 URL)

Приоритет: MO-first hub + Tier1 geo + combo + ключевой блог.  
В Yandex Webmaster / GSC: «Проверить URL» → «Запросить индексирование».

| # | URL | Тип |
|---|-----|-----|
| 1 | `/` | home |
| 2 | `/moskovskaya-oblast` | MO hub |
| 3 | `/angary-moskva` | geo core |
| 4 | `/sklady-moskva` | geo core |
| 5 | `/proizvodstvennye-zdaniya-moskva` | geo core |
| 6 | `/angary-podolsk` | MO tier1 |
| 7 | `/sklady-himki` | MO tier1 |
| 8 | `/sklady-mytishchi` | MO tier1 |
| 9 | `/sklady-odintsovo` | MO tier1 |
| 10 | `/sklady-domodedovo` | MO tier1 |
| 11 | `/angar-1000-m2-podolsk` | combo size |
| 12 | `/sklad-2000-m2-moskva` | combo size |
| 13 | `/angar-1000-m2-mytishchi` | combo size |
| 14 | `/blog/stroitelstvo-angarov-moskovskaya-oblast` | blog pillar |
| 15 | `/blog/sklad-pod-klyuch-moskva` | blog pillar |
| 16 | `/blog/odintsovo-sklad-klass-a-zapad-mo` | blog MO (new) |
| 17 | `/blog/domodedovo-sklad-aeroport-m4` | blog MO (new) |
| 18 | `/portfolio/sklad-himki` | portfolio |
| 19 | `/angary/holodnye` | landing sub |
| 20 | `/zdaniya/angar` | catalog |

## Sitemap resubmit

После каждого SEO-релиза с новыми URL или `SEO_CONTENT_REVISION`:
- `sitemap.xml`
- `turbo.xml` или split feeds

## GSC baseline (90 дней)

Экспорт один раз после P0 deploy:

1. GSC → Performance → Last 3 months → Export
2. Сохранить CSV: `docs/SEO/artifacts/gsc-baseline-YYYY-MM-DD.csv` (gitignore ok)
3. Зафиксировать в MONITORING.md: impressions, clicks, avg position по brand + non-brand MO

## Federal geo

Federal pages остаются в sitemap с priority **0.50** — не удалять, но не включать в Tier0 recrawl batch.

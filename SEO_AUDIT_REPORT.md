> **Архив.** Актуально: [docs/SEO/README.md](docs/SEO/README.md)

# SEO — отчёт по внедрению (2026-05-11)

## Сделано (дополнение — блок 2 КФ / E-E-A-T)

1. Информационные страницы: `/garantii`, `/litsenzii`, `/o-kompanii`, `/komanda`, `/kontakty`, `/vakansii` — данные в `client/src/data/infoPages.ts`, UI `InfoArticlePage`, SSR meta/body/JSON-LD, sitemap.
2. **Портфолио:** `/portfolio` и кейсы `/portfolio/...` — `portfolioItems.ts`, список и карточка, `CreativeWork` в JSON-LD.
3. **Отзывы:** секция на главной и на всех landing; единый граф отзывов `shared/reviewsJsonLd.ts` в `HOME_PAGE_JSON_LD`, на landing в `htmlJsonLd`, клиент `ReviewsSection` с `id="ld-reviews"`.
4. **Футер:** ссылки на новые разделы; ИНН/ОГРН — ссылка на `/rekvizity`.
5. **Блог:** поле `author?` в типе поста, `getBlogArticleAuthor`, отображение и `Article.author` (Person) в SSR и на клиенте.

---

## Сделано (ранее)

1. **Динамический sitemap** — `server/_core/seoFeeds.ts` + маршрут в `server/_core/index.ts` до Vite/статики; lastmod для постов из `updateDate || publishDate`.
2. **Динамический turbo RSS** — `buildTurboXml()` с CDATA-экранированием `]]>` для Яндекс.Турбо.
3. **Серверная JSON-LD** — `server/_core/htmlJsonLd.ts`, инъекция в HTML через `<!--SSR_JSONLD-->`, id `ld-ssr`.
4. **Канонические редиректы** — `server/_core/seoHttpMiddleware.ts` (production).
5. **Синхронизация meta с клиентом** — `@shared/seoTitleFormat` на основных страницах + `polishMetaDescription`.
6. **Очистка дублей JSON-LD при навигации** — `client/src/lib/seoJsonLdDom.ts`.
7. **Главная: ленивый калькулятор** — отдельный чанк, меньше начальный JS.
8. **robots.txt** — Host + Clean-param для Яндекса; ссылки на sitemap остаются на `https://freonn.pro/...`.

## Требуются данные от владельца

- Реальные отзывы с компанией/должностью, фото объектов, сканы СРО/лицензий, точная ссылка Я.Карт для `sameAs`.
- Решение по поддоменам/зеркалам в проде (middleware рассчитан на `freonn.pro` без www).

## Проверка после деплоя

1. `curl -sI https://freonn.pro/sitemap.xml` — `200`, `Content-Type: application/xml`.
2. Яндекс.Вебмастер: переобход sitemap; Турбо — подключить RSS `https://freonn.pro/turbo.xml`.
3. Google Search Console: sitemap.
4. PageSpeed Insights (mobile) — LCP/CLS/INP.
5. [validator.schema.org](https://validator.schema.org/) — по одному URL каждого типа (главная, landing, size, geo, blog, blog post, rekvizity).

## Тесты

`pnpm run build` — успешно. `pnpm exec vitest run` в среде без `GROQ_API_KEY` / `MAX_BOT_TOKEN` падает на существующих интеграционных проверках — не регрессия SEO-изменений.

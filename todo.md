# FREONN Website TODO

## Completed
- [x] White/light theme redesign
- [x] Hero section with video background
- [x] Loading animation (blueprint style)
- [x] Header with transparent background + ЗАЯВКА button
- [x] Remove reviews section
- [x] Replace "металлические здания" with "промышленные здания"
- [x] Year 2011 everywhere
- [x] No "собственный завод" mentions
- [x] 3 floating buttons (AI chat, MAX, phone)
- [x] AI chat via Groq API
- [x] MAX bot integration in server
- [x] /api/submit-form endpoint created in server
- [x] Fix ContactSection form — connect to /api/submit-form (real API call)
- [x] Update contact info: phone 8(800)101-2009, email info@freonn.pro, address г. Москва
- [x] Add FREONN favicon (favicon.ico, favicon-16x16.png, favicon-32x32.png)
- [x] Remove "Отзывы" link from footer navigation
- [x] MAX_BOT_TOKEN verified — test message delivered to both users
- [x] FloatingButtons with MAX channel link and phone 8(800)101-2009

## Pending
- [x] Save checkpoint and push to GitHub
- [x] Change email to freonn@internet.ru everywhere (ContactSection, Footer)
- [x] SEO: Add full meta tags, Open Graph, Twitter Card in index.html
- [x] SEO: Create sitemap.xml
- [x] SEO: Create robots.txt
- [x] SEO: Add JSON-LD structured data (Organization, LocalBusiness)
- [x] SEO MAX: Add semantic HTML5 tags (header, nav, main, section, footer, article) to all components
- [x] SEO MAX: Add aria-label to Header nav, logo button, mobile menu
- [x] SEO MAX: Add descriptive alt to AboutSection image
- [x] SEO MAX: Add JSON-LD FAQ schema from FAQSection data
- [x] SEO MAX: Add JSON-LD WebSite with SearchAction
- [x] SEO MAX: Add JSON-LD BreadcrumbList
- [x] SEO MAX: Add preload for critical fonts in index.html
- [x] SEO MAX: Add meta theme-color, apple-mobile-web-app tags
- [x] SEO MAX: Add hreflang for ru
- [x] SEO MAX: Optimize HeroSection subheading with keywords
- [x] Fix: ContactSection MapPin href="#" → Yandex Maps link
- [x] Fix: ContactSection Clock href="#" → remove href (not clickable)
- [x] Fix: Footer "Политика конфиденциальности" button → mailto link
- [x] Fix: Footer "Публичная оферта" button → mailto link
- [x] Fix: Calculator handleSubmit → now sends data to /api/submit-form
- [x] SEO Landing: Create /angary page (ангары под ключ)
- [x] SEO Landing: Create /sklady page (склады металлические)
- [x] SEO Landing: Create /proizvodstvennye-zdaniya page
- [x] SEO Landing: Create /selskokhozyaystvennye-zdaniya page
- [x] SEO Landing: Create /torgovye-zdaniya page
- [x] SEO Landing: Create /sportivnye-sooruzheniya page
- [x] SEO Landing: Dynamic <title> and <meta description> per page
- [x] SEO Landing: JSON-LD Service schema per page
- [x] SEO Landing: Update sitemap.xml with all landing pages
- [x] SEO Landing: Add internal links from Header/Footer to all landing pages
- [x] SEO Landing: Add dynamic canonical, OG, Twitter tags per landing page
- [x] SEO Landing: Clean sitemap.xml (remove #fragment entries)

## SEO Mega System

(Фактически реализовано в репозитории: гео-страницы, размеры, блог, `/zdaniya`, калькулятор, sitemap/turbo, внутренние ссылки.)

- [x] SEO Mega: Create geo pages data (50+ cities)
- [x] SEO Mega: Create size pages data (500/1000/1500/2000/3000/5000 m2)
- [x] SEO Mega: Create niche pages data (grain, equipment, auto, farm, logistics) — покрыто лендингами, блогом и гео
- [x] SEO Mega: Create blog articles data (20+ articles)
- [x] SEO Mega: Create GeoPage component with unique content per city
- [x] SEO Mega: Create SizePage component with price calculator per size
- [x] SEO Mega: Create NichePage component — отдельный тип не выделен; см. лендинги и статьи
- [x] SEO Mega: Create BlogPage and BlogArticle components
- [x] SEO Mega: Upgrade Calculator with region, insulation, type fields
- [x] SEO Mega: Add mega-menu navigation to Header
- [x] SEO Mega: Add internal linking blocks to all pages
- [x] SEO Mega: Update sitemap.xml with 200+ URLs
- [x] Add "Группа компаний Freonn" block linking to freonn.ru (engineering) in Footer and Home page

---

## Поэтапный план дальше (roadmap)

### Этап 1 — база готовности (сделано в коде по мере коммитов)
- [x] Health-check `/health`, `/api/health` для мониторинга
- [x] Rate limit на API, усиленные security headers
- [x] Шапка: «стекло» при скролле, выравнивание `container`
- [x] SEO: OG по маршрутам, sitemap lastmod, блог `ogImageUrl`
- [x] LCP: `fetchpriority="high"` на `<link rel="preload" as="video">` в `index.html`, убран лишний preconnect к CloudFront

### Этап 2 — доверие и комплаенс
- [x] Баннер согласия на cookies / обработку ПДн (запись выбора, ссылка на `/politika-konfidencialnosti`; GA и Метрика только после «Принять»)
- [ ] Страница «Согласие на маркетинг» или блок в оферте — по решению юриста
- [ ] Экспорт целей Метрики / GA в одну таблицу (док для маркетинга)

### Этап 3 — скорость и стабильность
- [x] Web Vitals (LCP/CLS/INP) → `ymParams` + событие GA `web_vitals` после согласия (`reportWebVitals.ts`, `web-vitals`)
- [x] `width`/`height` у крупных `<img>` (Services, About, Group, FreonnLogo, ManusDialog) по реальным размерам WebP
- [x] Smoke k6: `pnpm run k6:smoke` (`scripts/k6/smoke.js`) — `/api/health`, `/api/config`, POST `/api/generate-kp` с пустым телом (ранняя 400/лимит)

### Этап 4 — контент и SEO рост
- [ ] Новые кластеры запросов: отдельные URL «ниш» (логистика, зерно, АЗС и т.д.) — по приоритету семантики
- [ ] Расширение блога / кейсов под небрендовый трафик
- [x] Внутренняя перелинковка: блок «Смотрите также» на гео (`getGeoSeeAlsoItems`) и размерах (`getSizeSeeAlsoItems`) + `SeeAlsoSection`

### Этап 5 — процессы
- [ ] Staging-окружение (отдельный домен + `noindex`)
- [x] CI: GitHub Actions `.github/workflows/ci.yml` — `pnpm install`, `check`, `test`, `build:ci` (без `puppeteer/install` на раннере)
- [ ] Алерты по падению `/health` (UptimeRobot / Yandex Monitoring / Grafana)

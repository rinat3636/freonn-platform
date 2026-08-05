import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Phone, CheckCircle, ChevronRight, MapPin, ArrowRight, Ruler } from "lucide-react";
import { presentationSizePage } from "@shared/seoPagePresentation";
import { isMoscowComboSize } from "@shared/seoSizes";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import {
  getSizeBySlug,
  sizePages,
  moscowAngarPriceForSize,
  moscowComboSizePages,
  moscowComboSkladSizePages,
  moscowComboTsekhSizePages,
  getSizeBuildingMeta,
  getMoscowComboPagesForKind,
  getStandaloneSizePagesForKind,
  moscowSkladPriceForSize,
  moscowTsekhPriceForSize,
} from "@/data/sizePages";
import { getSizeSeeAlsoItems } from "@/data/seeAlsoForPages";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ContactSection from "@/components/ContactSection";
import SeeAlsoSection from "@/components/SeeAlsoSection";
import { ymGoal } from "@/lib/ym";

const GEO_CITY_SLUGS = [
  { city: "Москва", slug: "moskva" },
  { city: "Санкт-Петербург", slug: "sankt-peterburg" },
  { city: "Новосибирск", slug: "novosibirsk" },
  { city: "Екатеринбург", slug: "ekaterinburg" },
  { city: "Казань", slug: "kazan" },
  { city: "Нижний Новгород", slug: "nizhny-novgorod" },
  { city: "Челябинск", slug: "chelyabinsk" },
  { city: "Самара", slug: "samara" },
  { city: "Омск", slug: "omsk" },
  { city: "Ростов-на-Дону", slug: "rostov-na-donu" },
  { city: "Краснодар", slug: "krasnodar" },
  { city: "Воронеж", slug: "voronezh" },
] as const;

function resolveSizeSlug(
  matchTsekhTier1: boolean,
  paramsTsekhTier1: Record<string, string> | null,
  matchSkladTier1: boolean,
  paramsSkladTier1: Record<string, string> | null,
  matchAngarTier1: boolean,
  paramsAngarTier1: Record<string, string> | null,
  matchTsekhMo: boolean,
  paramsTsekhMo: Record<string, string> | null,
  matchSkladMo: boolean,
  paramsSkladMo: Record<string, string> | null,
  matchTsekh: boolean,
  paramsTsekh: Record<string, string> | null,
  matchSklad: boolean,
  paramsSklad: Record<string, string> | null,
  matchMo: boolean,
  paramsMo: Record<string, string> | null,
  matchM2: boolean,
  paramsM2: Record<string, string> | null,
): string {
  if (matchTsekhTier1 && paramsTsekhTier1) return `/tsekh-${paramsTsekhTier1.sizeVal}-m2-${paramsTsekhTier1.moCity}`;
  if (matchSkladTier1 && paramsSkladTier1) return `/sklad-${paramsSkladTier1.sizeVal}-m2-${paramsSkladTier1.moCity}`;
  if (matchAngarTier1 && paramsAngarTier1) return `/angar-${paramsAngarTier1.sizeVal}-m2-${paramsAngarTier1.moCity}`;
  if (matchTsekhMo && paramsTsekhMo) return `/tsekh-${paramsTsekhMo.sizeVal}-m2-moskva`;
  if (matchSkladMo && paramsSkladMo) return `/sklad-${paramsSkladMo.sizeVal}-m2-moskva`;
  if (matchTsekh && paramsTsekh) return `/tsekh-${paramsTsekh.sizeVal}-m2`;
  if (matchSklad && paramsSklad) return `/sklad-${paramsSklad.sizeVal}-m2`;
  if (matchMo && paramsMo) return `/angar-${paramsMo.sizeVal}-m2-moskva`;
  if (matchM2 && paramsM2) return `/angar-${paramsM2.sizeVal}-m2`;
  return "";
}

function primaryPriceLabel(kind: ReturnType<typeof getSizeBuildingMeta>["kind"]): string {
  if (kind === "sklad") return "Холодный склад";
  if (kind === "proizvodstvo") return "Без крана";
  return "Цена без утепления";
}

function secondaryPriceLabel(kind: ReturnType<typeof getSizeBuildingMeta>["kind"]): string {
  if (kind === "sklad") return "Класс B, утепление";
  if (kind === "proizvodstvo") return "С краном 5 т";
  return "Цена с утеплением";
}

function secondaryPriceMultiplier(kind: ReturnType<typeof getSizeBuildingMeta>["kind"]): number {
  return kind === "proizvodstvo" ? 1.18 : 1.35;
}

export default function SizePage() {
  const [matchTsekhTier1, paramsTsekhTier1] = useRoute("/tsekh-:sizeVal-m2-:moCity");
  const [matchSkladTier1, paramsSkladTier1] = useRoute("/sklad-:sizeVal-m2-:moCity");
  const [matchAngarTier1, paramsAngarTier1] = useRoute("/angar-:sizeVal-m2-:moCity");
  const [matchTsekhMo, paramsTsekhMo] = useRoute("/tsekh-:sizeVal-m2-moskva");
  const [matchSkladMo, paramsSkladMo] = useRoute("/sklad-:sizeVal-m2-moskva");
  const [matchTsekh, paramsTsekh] = useRoute("/tsekh-:sizeVal-m2");
  const [matchSklad, paramsSklad] = useRoute("/sklad-:sizeVal-m2");
  const [matchMo, paramsMo] = useRoute("/angar-:sizeVal-m2-moskva");
  const [matchM2, paramsM2] = useRoute("/angar-:sizeVal-m2");
  const slug = resolveSizeSlug(
    Boolean(matchTsekhTier1),
    matchTsekhTier1 ? (paramsTsekhTier1 as Record<string, string>) : null,
    Boolean(matchSkladTier1),
    matchSkladTier1 ? (paramsSkladTier1 as Record<string, string>) : null,
    Boolean(matchAngarTier1),
    matchAngarTier1 ? (paramsAngarTier1 as Record<string, string>) : null,
    Boolean(matchTsekhMo),
    matchTsekhMo ? (paramsTsekhMo as Record<string, string>) : null,
    Boolean(matchSkladMo),
    matchSkladMo ? (paramsSkladMo as Record<string, string>) : null,
    Boolean(matchTsekh),
    matchTsekh ? (paramsTsekh as Record<string, string>) : null,
    Boolean(matchSklad),
    matchSklad ? (paramsSklad as Record<string, string>) : null,
    Boolean(matchMo),
    matchMo ? (paramsMo as Record<string, string>) : null,
    Boolean(matchM2),
    matchM2 ? (paramsM2 as Record<string, string>) : null,
  );
  const page = getSizeBySlug(slug);
  const meta = page ? getSizeBuildingMeta(page) : null;

  useEffect(() => {
    if (!page || !meta) return;
    clearRoutePageJsonLd();
    const head = presentationSizePage(page);
    syncStandardPageHead(head);
    ymGoal("seo_size_view", { slug: page.slug, kind: meta.kind });

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          name: page.h1,
          description: page.intro,
          brand: { "@type": "Organization", name: "Freonn", url: "https://freonn.pro" },
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "RUB",
            lowPrice: page.priceFrom,
            highPrice: page.priceTo,
            offerCount: 1,
            availability: "https://schema.org/InStock",
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: page.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: "https://freonn.pro" },
            { "@type": "ListItem", position: 2, name: meta.landingLabel, item: `https://freonn.pro${meta.landingHref}` },
            { "@type": "ListItem", position: 3, name: page.h1, item: `https://freonn.pro${page.slug}` },
          ],
        },
      ],
    };
    const script = document.createElement("script");
    script.id = "ld-size";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [page, meta]);

  if (!page || !meta) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--ms-black)" }}>
        <h1 className="text-white text-2xl mb-4">Страница не найдена</h1>
        <Link href="/" className="text-red-500 hover:underline">На главную</Link>
      </div>
    );
  }

  const otherSizes = page.geoCity
    ? getMoscowComboPagesForKind(meta.kind).filter((s) => s.size !== page.size)
    : getStandaloneSizePagesForKind(meta.kind).filter((s) => s.slug !== page.slug && s.size !== page.size);

  const otherSizesTitle =
    meta.kind === "sklad"
      ? page.geoCity
        ? "Другие размеры складов в Москве"
        : "Другие размеры складов"
      : meta.kind === "proizvodstvo"
        ? page.geoCity
          ? "Другие размеры цехов в Москве"
          : "Другие размеры цехов"
        : "Другие размеры ангаров";

  return (
    <div className="min-h-screen" style={{ background: "var(--ms-black)" }}>
      <Header />

      <section className="relative pt-32 pb-16 overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0000 50%, #0a0a0a 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ED1C24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container relative z-10 max-w-6xl mx-auto px-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6 text-gray-400">
            <Link href="/" className="hover:text-red-400 transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={meta.landingHref} className="hover:text-red-400 transition-colors">{meta.landingLabel}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">{page.size} m²</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="w-5 h-5 text-red-500" />
              <span className="text-red-400 font-medium">{page.width} × {page.length} m · высота {page.height} m</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">{page.h1}</h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">{page.intro}</p>
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="bg-red-600/20 border border-red-600/40 rounded-lg px-4 py-3">
                <div className="text-red-400 text-sm">{primaryPriceLabel(meta.kind)}</div>
                <div className="text-white font-bold text-lg">от {page.priceFrom.toLocaleString("ru-RU")} ₽</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <div className="text-gray-400 text-sm">{secondaryPriceLabel(meta.kind)}</div>
                <div className="text-white font-bold text-lg">
                  от {Math.round(page.priceFrom * secondaryPriceMultiplier(meta.kind)).toLocaleString("ru-RU")} ₽
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <div className="text-gray-400 text-sm">Срок монтажа</div>
                <div className="text-white font-bold text-lg">{page.specs.find((s) => s.label === "Срок монтажа")?.value}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <a href="tel:+78001012009" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg">
                <Phone className="w-5 h-5" />
                8(800)101-2009
              </a>
              <a href="#contact" className="inline-flex items-center gap-2 border border-white/20 hover:border-red-500 text-white font-bold py-4 px-8 rounded-lg transition-colors text-lg">
                Получить расчёт
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-10">Технические характеристики</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {page.specs.map((spec, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-gray-400 text-sm mb-1">{spec.label}</div>
                <div className="text-white font-bold text-xl">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-10">Для чего подходит {meta.buildingWord} {page.size} m²</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {page.useCases.map((uc, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
                <CheckCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <span className="text-white font-medium">{uc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!page.geoCity && (meta.kind === "angar" || isMoscowComboSize(page.size)) && (
        <section className="py-16 border-t border-white/5" style={{ background: "rgba(237,28,36,0.04)" }}>
          <div className="container max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="text-red-400 font-medium">Москва и Московская область</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-4">
              {meta.buildingWordCap} {page.size} m² в Москве и Подмосковье
            </h2>
            <p className="text-gray-400 mb-6 max-w-2xl">
              {meta.kind === "sklad" ? (
                <>
                  Ориентир для холодного склада {page.size} m² в регионе — от{" "}
                  {moscowSkladPriceForSize(page.size).toLocaleString("ru-RU")} ₽ (9 180 ₽/m² у МКАД). В периферии МО — на 5–12% ниже.
                </>
              ) : meta.kind === "proizvodstvo" ? (
                <>
                  Ориентир для цеха {page.size} m² без крана в регионе — от{" "}
                  {moscowTsekhPriceForSize(page.size).toLocaleString("ru-RU")} ₽ (13 800 ₽/m² у МКАД). В периферии МО — на 5–12% ниже.
                </>
              ) : (
                <>
                  Ориентир для холодного ангара {page.size} m² в регионе — от{" "}
                  {moscowAngarPriceForSize(page.size).toLocaleString("ru-RU")} ₽ (9 775 ₽/m² у МКАД). В периферии МО — на 5–12% ниже.
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {isMoscowComboSize(page.size) && (
                <Link
                  href={`/${meta.comboPrefix}-${page.size}-m2-moskva`}
                  className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/40 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600/30 transition-colors"
                >
                  Подробнее: {meta.buildingWord} {page.size} m² в Москве
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {meta.kind === "angar" && moscowComboSkladSizePages.some((p) => p.size === page.size) && (
                <Link href={`/sklad-${page.size}-m2-moskva`} className="inline-flex items-center gap-2 bg-white/5 border border-white/15 text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:border-red-500/40 transition-colors">
                  Склад {page.size} m² в Москве
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              {meta.kind === "angar" && moscowComboTsekhSizePages.some((p) => p.size === page.size) && (
                <Link href={`/tsekh-${page.size}-m2-moskva`} className="inline-flex items-center gap-2 bg-white/5 border border-white/15 text-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:border-red-500/40 transition-colors">
                  Цех {page.size} m² в Москве
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link href={meta.moGeoHref} className="inline-flex items-center gap-2 border border-white/15 text-gray-300 px-4 py-2 rounded-lg text-sm hover:border-red-500/50 transition-colors">
                {meta.landingLabel} в Москве
              </Link>
              <Link href="/moskovskaya-oblast" className="inline-flex items-center gap-2 border border-white/15 text-gray-300 px-4 py-2 rounded-lg text-sm hover:border-red-500/50 transition-colors">
                Все города МО
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
              {(() => {
                const base =
                  meta.kind === "sklad"
                    ? moscowSkladPriceForSize(page.size)
                    : meta.kind === "proizvodstvo"
                      ? moscowTsekhPriceForSize(page.size)
                      : moscowAngarPriceForSize(page.size);
                const warmMult = meta.kind === "proizvodstvo" ? 1.18 : 1.35;
                return [
                  { label: "У МКАД", price: base },
                  { label: "Подмосковье", price: Math.round(base * 0.93) },
                  { label: meta.kind === "proizvodstvo" ? "С краном 5 т" : "С утеплением", price: Math.round(base * warmMult) },
                ].map((row) => (
                  <div key={row.label} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="text-gray-500 text-xs mb-1">{row.label}</div>
                    <div className="text-white font-bold">от {row.price.toLocaleString("ru-RU")} ₽</div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-10">Частые вопросы</h2>
          <div className="space-y-4 max-w-3xl">
            {page.faq.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-bold text-lg mb-3">{item.q}</h3>
                <p className="text-gray-400 leading-relaxed">{item.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-4">Строим по всей России</h2>
          <p className="text-gray-400 mb-8">{meta.buildingWordCap} {page.size} m² в вашем городе</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {GEO_CITY_SLUGS.map((item) => (
              <Link key={item.slug} href={`/${meta.geoPathPrefix}-${item.slug}`}
                className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-2 hover:border-red-500/40 transition-all text-xs group">
                <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
                <span className="text-gray-300 group-hover:text-white transition-colors">{item.city}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-10">{otherSizesTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherSizes.map((s) => (
              <Link key={s.slug} href={s.slug}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-red-500/40 hover:bg-red-500/5 transition-all group">
                <div className="text-white font-bold text-lg group-hover:text-red-400 transition-colors">{s.size} m²</div>
                <div className="text-gray-500 text-xs mt-1">{s.width}×{s.length} m</div>
                <div className="text-red-400 text-xs mt-1">от {(s.priceFrom / 1_000_000).toFixed(1)} млн ₽</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SeeAlsoSection items={getSizeSeeAlsoItems(page)} />

      <div id="contact">
        <ContactSection />
      </div>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

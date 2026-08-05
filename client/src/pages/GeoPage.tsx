import { useEffect } from "react";
import { useRoute, Link } from "wouter";
import { MapPin, Phone, CheckCircle, ChevronRight, Building2, ArrowRight } from "lucide-react";
import { presentationGeo } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import {
  getGeoBySlug,
  allGeoPages,
  getGeoPriceHint,
  getGeoPricePerM2,
  getGeoHub,
  getGeoKind,
} from "@/data/geoPages";
import { buildGeoPageJsonLd } from "@shared/geoJsonLd";
import { MO_HUB_SLUG } from "@/data/moHubPage";
import { getGeoSeeAlsoItems } from "@/data/seeAlsoForPages";
import {
  buildingKindLabel,
  getGeoSizeGridLinks,
  isMoRegion,
  isMoTier1SlugKey,
  moTier1ComboLinksForKind,
  moscowComboLinksForKind,
} from "@shared/moSeo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ContactSection from "@/components/ContactSection";
import SeeAlsoSection from "@/components/SeeAlsoSection";
import { ymGoal } from "@/lib/ym";

export default function GeoPage() {
  const [angMatch, angParams] = useRoute("/angary-:city");
  const [skladMatch, skladParams] = useRoute("/sklady-:city");
  const [prodMatch, prodParams] = useRoute("/proizvodstvennye-zdaniya-:city");
  const slug =
    angMatch && angParams
      ? `/angary-${angParams.city}`
      : skladMatch && skladParams
        ? `/sklady-${skladParams.city}`
        : prodMatch && prodParams
          ? `/proizvodstvennye-zdaniya-${prodParams.city}`
          : "";
  const page = getGeoBySlug(slug);

  useEffect(() => {
    if (!page) return;
    clearRoutePageJsonLd();
    const head = presentationGeo(page, getGeoPricePerM2(page));
    syncStandardPageHead(head);
    ymGoal("seo_geo_view", { slug: page.slug, kind: getGeoKind(page) });
    const jsonLd = buildGeoPageJsonLd(page);
    const script = document.createElement("script");
    script.id = "ld-geo";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [page]);

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "var(--ms-black)" }}>
        <h1 className="text-white text-2xl mb-4">Страница не найдена</h1>
        <Link href="/" className="text-red-500 hover:underline">На главную</Link>
      </div>
    );
  }

  const priceHint = getGeoPriceHint(page);
  const hub = getGeoHub(page);
  const geoKind = getGeoKind(page);
  const otherCities = allGeoPages
    .filter((c) => {
      if (getGeoKind(c) !== geoKind || c.slug === page.slug) return false;
      if (page.region === "Московская область") return c.region === "Московская область";
      return true;
    })
    .slice(0, 8);
  const sizeBlockTitle =
    geoKind === "sklad"
      ? `Популярные площади в ${page.cityPred}`
      : geoKind === "proizvodstvo"
        ? `Типовые площади под производство в ${page.cityPred}`
        : `Ангары по размерам в ${page.cityPred}`;
  const sizeBlockLead =
    geoKind === "angary"
      ? "Выберите нужную площадь — получите точную цену"
      : "Ориентир по метражу; точная смета — после ТЗ и геологии";
  const isMo = isMoRegion(page.region, page.city);
  const geoSlugKey = page.slug.replace(/^\/(angary|sklady|proizvodstvennye-zdaniya)-/, "");
  const sizeGridLinks = getGeoSizeGridLinks(geoKind, isMo, geoSlugKey);
  const isTier1Mo = isMo && isMoTier1SlugKey(geoSlugKey) && geoSlugKey !== "moskva";
  const moComboLinks = isTier1Mo
    ? moTier1ComboLinksForKind(geoKind, geoSlugKey)
    : isMo && geoKind === "angary" && geoSlugKey === "moskva"
      ? moscowComboLinksForKind("angar")
      : [];

  return (
    <div className="min-h-screen" style={{ background: "var(--ms-black)" }}>
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-16 overflow-hidden" style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a0000 50%, #0a0a0a 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ED1C24' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="container relative z-10 max-w-6xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6 text-gray-400">
            <Link href="/" className="hover:text-red-400 transition-colors">Главная</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={hub.href} className="hover:text-red-400 transition-colors">{hub.name}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">{page.city}</span>
          </nav>

          <div className="geo-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="text-red-400 font-medium">{page.city}, {page.region}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              {page.h1}
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">{page.intro}</p>
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="bg-red-600/20 border border-red-600/40 rounded-lg px-4 py-3">
                <div className="text-red-400 text-sm">Ориентир</div>
                <div className="text-white font-bold text-lg">{priceHint}</div>
                <div className="text-gray-500 text-xs mt-1">за объект 1 000 м²</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <div className="text-gray-400 text-sm">Срок монтажа</div>
                <div className="text-white font-bold text-lg">{page.deliveryDays} дней</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
                <div className="text-gray-400 text-sm">Объектов в регионе</div>
                <div className="text-white font-bold text-lg">{page.completedProjects}+</div>
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
          </div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-10">
            Почему выбирают Freonn в {page.cityPred}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Собственное производство", desc: "Металлоконструкции изготавливаем на собственном заводе — без посредников, ниже цена" },
              { title: `${page.completedProjects}+ объектов в регионе`, desc: `Знаем специфику ${page.cityRod}: климат, грунты, нормативы, логистику` },
              { title: "Фиксированная цена", desc: "Стоимость прописана в договоре — никаких доплат в процессе строительства" },
              { title: `Монтаж за ${page.deliveryDays} дней`, desc: "Собственные монтажные бригады в регионе — быстрый выезд и чёткие сроки" },
              { title: "Гарантия 5 лет", desc: "Гарантия на конструкции и монтаж — 5 лет. Срок службы конструкций — 50+ лет." },
              { title: "Проект бесплатно", desc: "Разрабатываем проектную документацию бесплатно при заключении договора" },
            ].map((item, i) => (
              <div key={i} className="geo-fade-in bg-white/5 border border-white/10 rounded-xl p-6 hover:border-red-500/30 transition-colors" style={{ animationDelay: `${i * 0.1}s` }}>
                <CheckCircle className="w-8 h-8 text-red-500 mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building types */}
      <section className="py-16 border-t border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-4">
            Что строим в {page.cityPred}
          </h2>
          <p className="text-gray-400 mb-10">Полный спектр металлических зданий под ключ</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Ангары", href: "/angary", desc: "Быстровозводимые ангары любых размеров" },
              { name: "Склады", href: "/sklady", desc: "Металлические склады класса A, B, C" },
              { name: "Производственные здания", href: "/proizvodstvennye-zdaniya", desc: "Цеха, заводы, производственные комплексы" },
              { name: "С/х здания", href: "/selskokhozyaystvennye-zdaniya", desc: "Зернохранилища, коровники, птицефабрики" },
              { name: "Торговые здания", href: "/torgovye-zdaniya", desc: "Торговые центры, павильоны, гипермаркеты" },
              { name: "Спортивные сооружения", href: "/sportivnye-sooruzheniya", desc: "Спортзалы, манежи, крытые корты" },
            ].map((item, i) => (
              <Link key={i} href={item.href}
                className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-red-500/40 hover:bg-red-500/5 transition-all group">
                <Building2 className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div>
                  <div className="text-white font-semibold group-hover:text-red-400 transition-colors">{item.name}</div>
                  <div className="text-gray-500 text-sm">{item.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 ml-auto group-hover:text-red-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Size pages */}
      {sizeGridLinks.length > 0 && (
      <section className="py-16 border-t border-white/5">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-4">
            {sizeBlockTitle}
          </h2>
          <p className="text-gray-400 mb-10">{sizeBlockLead}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {sizeGridLinks.map((item, i) => (
              <Link key={i} href={item.href}
                className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-red-500/40 hover:bg-red-500/5 transition-all group">
                <div className="text-white font-bold text-lg group-hover:text-red-400 transition-colors">{item.size}</div>
                <div className="text-gray-500 text-xs mt-1">{item.price}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      )}

      {moComboLinks.length > 0 && (
        <section className="py-16 border-t border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
          <div className="container max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-black text-white mb-4">
              {isTier1Mo
                ? `${buildingKindLabel(geoKind)} в ${page.cityPred} по размерам`
                : `${buildingKindLabel("angar")} в Москве и МО по размерам`}
            </h2>
            <p className="text-gray-400 mb-10">
              {isTier1Mo
                ? `Комбо «размер + ${page.city}» — выезд инженера из Москвы за 24 ч`
                : "Комбо-страницы с ценами для столицы и Подмосковья — выезд инженера за 24 ч"}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {moComboLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-red-500/40 hover:bg-red-500/5 transition-all group"
                >
                  <div className="text-white font-bold text-xl group-hover:text-red-400 transition-colors">
                    {link.label}
                  </div>
                  <div className="text-gray-500 text-sm mt-2">Москва и Московская область</div>
                  <div className="text-red-400 font-semibold mt-3">
                    от {link.price?.toLocaleString("ru-RU")} ₽
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-gray-500 text-sm mt-6">
              <Link href={MO_HUB_SLUG} className="text-red-400 hover:underline">
                Все 40+ городов Подмосковья →
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Other cities */}
      <section className="py-16 border-t border-white/5" style={{ background: "rgba(255,255,255,0.02)" }}>
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-10">
            {page.region === "Московская область" ? "Другие города Московской области" : "Строим по всей России"}
          </h2>
          {page.region === "Московская область" && (
            <p className="text-gray-400 mb-6">
              <Link href={MO_HUB_SLUG} className="text-red-400 hover:underline">
                Полный список городов МО →
              </Link>
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {otherCities.map((city, i) => (
              <Link key={i} href={city.slug}
                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-3 hover:border-red-500/40 transition-all group text-sm">
                <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-gray-300 group-hover:text-white transition-colors">{city.city}</span>
              </Link>
            ))}
            <Link href={hub.href} className="flex items-center gap-2 bg-red-600/10 border border-red-600/30 rounded-lg p-3 hover:border-red-500 transition-all text-sm">
              <span className="text-red-400">Все города →</span>
            </Link>
          </div>
        </div>
      </section>

      <SeeAlsoSection items={getGeoSeeAlsoItems(page)} />

      {/* Contact */}
      <div id="contact">
        <ContactSection />
      </div>

      <Footer />
      <FloatingButtons />
    </div>
  );
}

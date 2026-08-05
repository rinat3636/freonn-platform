/**
 * SEO-страница для каждого типа здания из калькулятора — URL `/zdaniya/:id`
 */
import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ChevronRight, Building2, Calculator } from "lucide-react";
import { presentationBuildingType } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import { getBuildingTypeDef, buildingTypeSeoExtraParagraph } from "@shared/buildingCatalog";
import type { CalculatorBuildingType } from "@shared/buildingCatalog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import SeeAlsoSection from "@/components/SeeAlsoSection";
import { getBuildingTypeSeeAlsoItems } from "@/data/seeAlsoForPages";

const CATEGORY_LANDING: Record<string, string> = {
  popular: "/angary",
  selhoz: "/selskokhozyaystvennye-zdaniya",
  commercial: "/sklady",
  common: "/angary",
  tech: "/angary",
  sport: "/sportivnye-sooruzheniya",
  industry: "/proizvodstvennye-zdaniya",
};

function categoryLandingHref(t: CalculatorBuildingType): string {
  return CATEGORY_LANDING[t.categoryId] ?? "/";
}

export default function BuildingTypePage() {
  const [, params] = useRoute("/zdaniya/:id");
  const id = params?.id ?? "";
  const type = getBuildingTypeDef(id);

  useEffect(() => {
    const t = getBuildingTypeDef(id);
    if (!t) return;
    clearRoutePageJsonLd();
    const head = presentationBuildingType(t);
    syncStandardPageHead(head);
    const url = `https://freonn.pro${head.canonicalPath}`;
    const script = document.createElement("script");
    script.id = "ld-building-type";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          name: t.label,
          description: head.description,
          url,
        },
        {
          "@type": "Service",
          "@id": `${url}#service`,
          name: `${t.label} — строительство под ключ`,
          description: head.description,
          provider: {
            "@type": "Organization",
            name: "Freonn",
            url: "https://freonn.pro",
          },
          areaServed: { "@type": "Country", name: "Russia" },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: "https://freonn.pro/" },
            {
              "@type": "ListItem",
              position: 2,
              name: "Типы зданий",
              item: "https://freonn.pro/zdaniya",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: t.label,
              item: url,
            },
          ],
        },
      ],
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [id]);

  if (!type) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#F8F8F8" }}>
        <p className="mb-4" style={{ fontFamily: "Barlow, sans-serif", color: "#1A1A2E" }}>
          Тип здания не найден
        </p>
        <Link href="/" style={{ color: "#ED1C24" }}>
          На главную
        </Link>
      </div>
    );
  }

  const head = presentationBuildingType(type);
  const calcHref = `/?type=${encodeURIComponent(type.id)}#calculator`;
  const sectorHref = categoryLandingHref(type);
  const priceStr = `от ${type.kitRubM2.toLocaleString("ru-RU")} ₽/м²`;

  return (
    <div className="min-h-screen" style={{ background: "#F8F8F8" }}>
      <Header />
      <section className="pt-32 pb-12" style={{ background: "#1A1A2E" }}>
        <div className="container max-w-3xl">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol
              className="flex items-center gap-2 flex-wrap"
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.08em",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              <li>
                <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  Главная
                </Link>
              </li>
              <li>
                <ChevronRight size={10} />
              </li>
              <li>
                <Link href="/zdaniya" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  Типы зданий
                </Link>
              </li>
              <li>
                <ChevronRight size={10} />
              </li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>{type.label}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={22} style={{ color: "#ED1C24" }} />
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              {type.categoryLabel}
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              color: "#FFFFFF",
              letterSpacing: "0.04em",
              lineHeight: 1.05,
              marginBottom: "0.75rem",
            }}
          >
            {type.label}
          </h1>
          <p
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.55,
              maxWidth: "36rem",
            }}
          >
            Проектирование, изготовление металлоконструкций и монтаж «{type.label}» под ключ по России. Ориентир стоимости
            комплекта в конфигураторе — <strong style={{ color: "#ED1C24" }}>{priceStr}</strong> (без доставки и СМР;
            итог по смете после ТЗ).
          </p>
        </div>
      </section>

      <article className="container max-w-3xl py-12 px-4">
        <div
          className="prose prose-neutral max-w-none"
          style={{ fontFamily: "Barlow, sans-serif", fontSize: "1rem", color: "rgba(26,26,46,0.82)", lineHeight: 1.75 }}
        >
          <p>
            ООО «ЭКС» (бренд <strong>Freonn</strong>) строит быстровозводимые здания из ЛСТК и сэндвич-панелей с 2011 года.
            Для объекта «{type.label}» мы готовим коммерческое предложение в формате ТЗ (как у крупных производителей
            металлоконструкций): габариты, шаг рам, угол кровли, регион, объём работ и опции — с ориентиром по срокам и
            графику платежей.
          </p>
          <p>
            Раздел каталога: <strong>{type.categoryLabel}</strong>. Типовые решения по ограждающим конструкциям и
            несущему каркасу согласуются на этапе КМ/ОК; при необходимости подключаем геологию и проект КЖ для фундамента.
          </p>
          <p>{buildingTypeSeoExtraParagraph(type)}</p>
          <h2
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "1.75rem",
              color: "#1A1A2E",
              letterSpacing: "0.04em",
              marginTop: "2rem",
              marginBottom: "0.75rem",
            }}
          >
            Расчёт и заявка
          </h2>
          <p>
            Откройте конфигуратор с уже выбранным типом «{type.label}» — укажите длину, ширину и высоту, регион и пакет
            услуг; скачайте PDF коммерческого предложения или отправьте заявку инженеру.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href={calcHref}
              className="inline-flex items-center gap-2 ms-btn-primary"
              style={{ textDecoration: "none" }}
            >
              <Calculator size={16} />
              Рассчитать «{type.label}»
            </Link>
            <Link
              href={sectorHref}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-colors"
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.8rem",
                borderColor: "rgba(26,26,46,0.15)",
                color: "#1A1A2E",
                textDecoration: "none",
              }}
            >
              Обзор: {type.categoryLabel}
            </Link>
          </div>
          <p className="mt-8 text-sm" style={{ color: "rgba(26,26,46,0.45)" }}>
            Канонический URL этой страницы: <code style={{ fontSize: "0.85em" }}>{head.canonicalPath}</code> — для
            индексации и ссылок из смет и тендерной документации.
          </p>
        </div>
      </article>

      <SeeAlsoSection
        variant="light"
        trackSource="building_type"
        items={getBuildingTypeSeeAlsoItems(type)}
        title="Смотрите также"
        lead="Смежные типы в каталоге, калькулятор и обзор направления."
      />

      <Footer />
      <FloatingButtons />
    </div>
  );
}

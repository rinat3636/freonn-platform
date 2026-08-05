/**
 * Хаб каталога типов зданий — `/zdaniya` (SEO + перелинковка на `/zdaniya/:id`).
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight, Building2 } from "lucide-react";
import { presentationBuildingTypesIndex } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import {
  BUILDING_TYPE_CATEGORIES_FOR_UI,
  CALCULATOR_BUILDING_TYPES,
} from "@shared/buildingCatalog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import SeeAlsoSection from "@/components/SeeAlsoSection";
import { getBuildingTypesHubSeeAlsoItems } from "@/data/seeAlsoForPages";

const SITE = "https://freonn.pro";

export default function BuildingTypesHubPage() {
  useEffect(() => {
    clearRoutePageJsonLd();
    const head = presentationBuildingTypesIndex();
    syncStandardPageHead(head);
    const url = `${SITE}${head.canonicalPath}`;
    const itemList = CALCULATOR_BUILDING_TYPES.map((t, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      name: t.label,
      item: `${SITE}/zdaniya/${encodeURIComponent(t.id)}`,
    }));
    const script = document.createElement("script");
    script.id = "ld-building-types-hub";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          name: "Каталог типов зданий",
          description: head.description,
          url,
        },
        {
          "@type": "ItemList",
          "@id": `${url}#itemlist`,
          name: "Типы зданий Freonn",
          numberOfItems: CALCULATOR_BUILDING_TYPES.length,
          itemListElement: itemList,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Типы зданий", item: url },
          ],
        },
      ],
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  const head = presentationBuildingTypesIndex();

  return (
    <div className="min-h-screen" style={{ background: "#F8F8F8" }}>
      <Header />
      <section className="pt-32 pb-12" style={{ background: "#1A1A2E" }}>
        <div className="container max-w-4xl">
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
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Типы зданий</li>
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
              Каталог для расчёта
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
            Типы зданий
          </h1>
          <p
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "1.05rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.55,
              maxWidth: "40rem",
            }}
          >
            {head.description}
          </p>
          <Link
            href="/#calculator"
            className="inline-flex items-center gap-2 mt-8 ms-btn-primary"
            style={{ textDecoration: "none" }}
          >
            Открыть калькулятор
          </Link>
        </div>
      </section>

      <div className="container max-w-5xl py-12 px-4">
        {BUILDING_TYPE_CATEGORIES_FOR_UI.map((cat) => {
          const types = CALCULATOR_BUILDING_TYPES.filter((t) => t.categoryId === cat.id);
          if (!types.length) return null;
          return (
            <section key={cat.id} className="mb-12">
              <h2
                className="mb-4 pb-2 border-b"
                style={{
                  fontFamily: "Bebas Neue, sans-serif",
                  fontSize: "1.65rem",
                  letterSpacing: "0.04em",
                  color: "#1A1A2E",
                  borderColor: "rgba(26,26,46,0.1)",
                }}
              >
                {cat.label}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0 m-0">
                {types.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/zdaniya/${encodeURIComponent(t.id)}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white"
                      style={{
                        fontFamily: "Barlow, sans-serif",
                        fontSize: "0.95rem",
                        color: "#1A1A2E",
                        textDecoration: "none",
                        border: "1px solid rgba(26,26,46,0.08)",
                        background: "rgba(255,255,255,0.6)",
                      }}
                    >
                      <span>{t.label}</span>
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: "0.58rem",
                          color: "rgba(26,26,46,0.35)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        от {t.kitRubM2.toLocaleString("ru-RU")} ₽/м²
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <SeeAlsoSection
        variant="light"
        trackSource="building_types_hub"
        items={getBuildingTypesHubSeeAlsoItems()}
        title="Дальше по сайту"
        lead="Услуги, калькулятор и материалы для выбора решения."
      />

      <Footer />
      <FloatingButtons />
    </div>
  );
}

import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ChevronRight, Building2 } from "lucide-react";
import { presentationPortfolioCase } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import { getPortfolioBySlug, portfolioCoverImage, portfolioGeoHref, portfolioItems } from "@/data/portfolioItems";
import { ymGoal } from "@/lib/ym";
import { gaEvent } from "@/lib/ga";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ContactSection from "@/components/ContactSection";

export default function PortfolioDetailPage() {
  const [, params] = useRoute("/portfolio/:slug");
  const pathname = params?.slug ? `/portfolio/${params.slug}` : "";
  const item = pathname ? getPortfolioBySlug(pathname) : undefined;

  useEffect(() => {
    if (!item) return;
    clearRoutePageJsonLd();
    const head = presentationPortfolioCase(item);
    syncStandardPageHead(head);
    const script = document.createElement("script");
    script.id = "ld-portfolio";
    script.type = "application/ld+json";
    const url = `https://freonn.pro${item.slug}`;
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CreativeWork",
          "@id": url,
          name: item.h1,
          description: head.description,
          dateCreated: String(item.year),
          spatialCoverage: { "@type": "Place", name: item.region },
          about: { "@type": "Thing", name: item.buildingType },
          abstract: item.intro,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: "https://freonn.pro/" },
            { "@type": "ListItem", position: 2, name: "Портфолио", item: "https://freonn.pro/portfolio" },
            { "@type": "ListItem", position: 3, name: item.h1, item: url },
          ],
        },
      ],
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [item]);

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#F8F8F8" }}>
        <p className="mb-4" style={{ fontFamily: "Barlow, sans-serif", color: "#1A1A2E" }}>
          Кейс не найден
        </p>
        <Link href="/portfolio" style={{ color: "#ED1C24" }}>
          Все кейсы
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8F8F8" }}>
      <Header />
      <section className="pt-32 pb-12" style={{ background: "#1A1A2E" }}>
        <div className="container max-w-3xl">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol
              className="flex items-center gap-2 flex-wrap text-xs"
              style={{ fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}
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
                <Link href="/portfolio" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  Портфолио
                </Link>
              </li>
              <li>
                <ChevronRight size={10} />
              </li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>{item.buildingType}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <Building2 size={22} style={{ color: "#ED1C24" }} />
          </div>
          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              color: "#FFFFFF",
              lineHeight: 1.1,
              marginBottom: "0.75rem",
            }}
          >
            {item.h1}
          </h1>
          <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.55)" }}>
            {item.region} · {item.areaM2.toLocaleString("ru-RU")} м² · {item.year} · {item.duration}
          </p>
        </div>
      </section>

      <article className="py-14">
        <div className="container max-w-3xl">
          {(() => {
            const cover = portfolioCoverImage(item);
            return (
              <img
                src={cover.src}
                alt={cover.alt}
                width={960}
                height={540}
                loading="lazy"
                decoding="async"
                className="w-full rounded-xl mb-8"
                style={{ aspectRatio: "16/9", objectFit: "cover", border: "1px solid rgba(26,26,46,0.08)" }}
              />
            );
          })()}
          <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "1rem", lineHeight: 1.75, color: "rgba(26,26,46,0.85)", marginBottom: "1.25rem" }}>
            {item.intro}
          </p>
          <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.9rem", color: "rgba(26,26,46,0.55)", marginBottom: "1.5rem" }}>
            Заказчик: {item.clientLabel}
          </p>
          <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#1A1A2E", marginBottom: "0.75rem" }}>
            Особенности объекта
          </h2>
          <ul style={{ paddingLeft: "1.25rem", marginBottom: "2rem" }}>
            {item.highlights.map((h) => (
              <li key={h} style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.95rem", color: "rgba(26,26,46,0.8)", marginBottom: "0.35rem" }}>
                {h}
              </li>
            ))}
          </ul>
          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", color: "rgba(26,26,46,0.4)", marginBottom: "1.5rem" }}>
            Детальные чертежи, акты и фото — по запросу после NDA.
          </p>
          {portfolioGeoHref(item) && (
            <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "0.95rem", marginBottom: "2rem" }}>
              <Link href={portfolioGeoHref(item)!} style={{ color: "#ED1C24", textDecoration: "none", fontWeight: 600 }}>
                Строительство в регионе →
              </Link>
            </p>
          )}
        </div>
      </article>

      <section className="pb-14">
        <div className="container max-w-3xl">
          <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1.1rem", color: "#1A1A2E", marginBottom: "1rem" }}>
            Другие кейсы
          </h2>
          <div className="flex flex-wrap gap-3">
            {portfolioItems
              .filter((p) => p.slug !== item.slug)
              .map((p) => (
                <Link
                  key={p.slug}
                  href={p.slug}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg"
                  style={{
                    background: "rgba(237,28,36,0.06)",
                    border: "1px solid rgba(237,28,36,0.2)",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  {p.buildingType} {p.areaM2} м²
                  <ChevronRight size={14} style={{ color: "#ED1C24" }} />
                </Link>
              ))}
          </div>
        </div>
      </section>

      <section className="pb-4" aria-label="Связанные инструменты">
        <div className="container max-w-3xl">
          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.62rem", letterSpacing: "0.1em", color: "rgba(26,26,46,0.45)" }}>
            <Link
              href="/zdaniya"
              style={{ color: "#ED1C24", textDecoration: "none" }}
              onClick={() => {
                ymGoal("cross_nav_chip", { source: "portfolio_case", href: "/zdaniya" });
                gaEvent("cross_nav_chip", { source: "portfolio_case", href: "/zdaniya" });
              }}
            >
              Каталог типов зданий
            </Link>
            <span style={{ color: "rgba(26,26,46,0.2)" }}> · </span>
            <Link
              href="/#calculator"
              style={{ color: "rgba(26,26,46,0.55)", textDecoration: "none" }}
              onClick={() => {
                ymGoal("cross_nav_chip", { source: "portfolio_case", href: "/#calculator" });
                gaEvent("cross_nav_chip", { source: "portfolio_case", href: "/#calculator" });
              }}
            >
              Калькулятор ориентира
            </Link>
          </p>
        </div>
      </section>

      <ContactSection />
      <Footer />
      <FloatingButtons />
    </div>
  );
}

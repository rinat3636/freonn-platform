import { useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight, Building2 } from "lucide-react";
import { presentationPortfolioIndex } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import { portfolioItems, portfolioCoverImage } from "@/data/portfolioItems";
import { ymGoal } from "@/lib/ym";
import { gaEvent } from "@/lib/ga";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ContactSection from "@/components/ContactSection";

export default function PortfolioListPage() {
  useEffect(() => {
    clearRoutePageJsonLd();
    const head = presentationPortfolioIndex();
    syncStandardPageHead(head);
    const script = document.createElement("script");
    script.id = "ld-portfolio-list";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: head.title,
          url: "https://freonn.pro/portfolio",
          description: head.description,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: "https://freonn.pro/" },
            { "@type": "ListItem", position: 2, name: "Портфолио", item: "https://freonn.pro/portfolio" },
          ],
        },
      ],
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#F8F8F8" }}>
      <Header />
      <section className="pt-32 pb-12" style={{ background: "#1A1A2E" }}>
        <div className="container max-w-5xl">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol
              className="flex items-center gap-2"
              style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}
            >
              <li>
                <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  Главная
                </Link>
              </li>
              <li>
                <ChevronRight size={10} />
              </li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Портфолио</li>
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
              Кейсы
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "#FFFFFF",
              lineHeight: 1.05,
              marginBottom: "0.5rem",
            }}
          >
            Реализованные объекты
          </h1>
          <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.55)", maxWidth: "640px" }}>
            Подборка типовых кейсов по площади и региону. Детальные параметры и фото объектов — по запросу у менеджера.
          </p>
          <p className="mt-5" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.1em" }}>
            <Link
              href="/zdaniya"
              style={{ color: "#ED1C24", textDecoration: "none" }}
              onClick={() => {
                ymGoal("cross_nav_chip", { source: "portfolio_list_hero", href: "/zdaniya" });
                gaEvent("cross_nav_chip", { source: "portfolio_list_hero", href: "/zdaniya" });
              }}
            >
              Каталог типов зданий
            </Link>
            <span style={{ color: "rgba(255,255,255,0.25)" }}> · </span>
            <Link
              href="/#calculator"
              style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}
              onClick={() => {
                ymGoal("cross_nav_chip", { source: "portfolio_list_hero", href: "/#calculator" });
                gaEvent("cross_nav_chip", { source: "portfolio_list_hero", href: "/#calculator" });
              }}
            >
              Калькулятор стоимости
            </Link>
          </p>
        </div>
      </section>

      <section className="py-14">
        <div className="container max-w-5xl grid md:grid-cols-2 gap-6">
          {portfolioItems.map((it) => {
            const cover = portfolioCoverImage(it);
            return (
            <Link
              key={it.slug}
              href={it.slug}
              className="block rounded-xl overflow-hidden transition-colors"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(26,26,46,0.08)",
                textDecoration: "none",
              }}
            >
              <img
                src={cover.src}
                alt={cover.alt}
                width={640}
                height={360}
                loading="lazy"
                decoding="async"
                className="w-full"
                style={{ aspectRatio: "16/9", objectFit: "cover" }}
              />
              <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem", color: "rgba(26,26,46,0.45)" }}>
                  {it.buildingType} · {it.year}
                </span>
                <ChevronRight size={16} style={{ color: "#ED1C24" }} />
              </div>
              <h2 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#1A1A2E", marginBottom: "0.5rem" }}>
                {it.h1}
              </h2>
              <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.88rem", color: "rgba(26,26,46,0.65)", lineHeight: 1.6 }}>
                {it.region} · {it.areaM2.toLocaleString("ru-RU")} м² · {it.duration}
              </p>
              </div>
            </Link>
            );
          })}
        </div>
      </section>

      <ContactSection />
      <Footer />
      <FloatingButtons />
    </div>
  );
}

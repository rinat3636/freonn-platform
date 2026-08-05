import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, FileText } from "lucide-react";
import { presentationInfoPage } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import { getInfoPageBySlug } from "@/data/infoPages";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ContactSection from "@/components/ContactSection";

export default function InfoArticlePage() {
  const [loc] = useLocation();
  const page = getInfoPageBySlug(loc);

  useEffect(() => {
    if (!page) return;
    clearRoutePageJsonLd();
    const head = presentationInfoPage(page);
    syncStandardPageHead(head);

    const script = document.createElement("script");
    script.id = "ld-info";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: page.h1,
          description: head.description,
          url: `https://freonn.pro${page.slug}`,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: "https://freonn.pro/" },
            { "@type": "ListItem", position: 2, name: page.h1, item: `https://freonn.pro${page.slug}` },
          ],
        },
      ],
    });
    document.head.appendChild(script);
    return () => script.remove();
  }, [page]);

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#F8F8F8" }}>
        <p className="mb-4" style={{ fontFamily: "Barlow, sans-serif", color: "#1A1A2E" }}>
          Страница не найдена
        </p>
        <Link href="/" style={{ color: "#ED1C24" }}>
          На главную
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
              className="flex items-center gap-2 flex-wrap"
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
              <li style={{ color: "rgba(255,255,255,0.7)" }}>{page.h1}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <FileText size={20} style={{ color: "#ED1C24" }} />
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Информация
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              color: "#FFFFFF",
              lineHeight: 1.1,
              letterSpacing: "0.02em",
              marginBottom: "0.75rem",
            }}
          >
            {page.h1}
          </h1>
          <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.55)" }}>{page.lead}</p>
        </div>
      </section>

      <article className="py-14">
        <div className="container max-w-3xl">
          {page.sections.map((sec, idx) => (
            <section key={`${sec.heading}-${idx}`} className="mb-10">
              <h2
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.35rem",
                  color: "#1A1A2E",
                  marginBottom: "0.75rem",
                }}
              >
                {sec.heading}
              </h2>
              {sec.paragraphs.map((p, pi) => (
                <p
                  key={`${idx}-${pi}`}
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.95rem",
                    lineHeight: 1.75,
                    color: "rgba(26,26,46,0.78)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>

      <ContactSection />
      <Footer />
      <FloatingButtons />
    </div>
  );
}

/**
 * SEO-хаб «Московская область» — `/moskovskaya-oblast`.
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight, MapPin } from "lucide-react";
import { presentationMoHub } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import ContactSection from "@/components/ContactSection";
import SeeAlsoSection from "@/components/SeeAlsoSection";
import { getMoHubSeeAlsoItems } from "@/data/seeAlsoForPages";
import { moHubCityGroups, moHubFaqs, moHubPage } from "@/data/moHubPage";
import {
  MO_HUB_BLOG_LINKS,
  MO_HUB_FEATURED_CASES,
  MO_HUB_SLUG,
  moHubFeaturedComboLinks,
} from "@shared/moSeo";

import { buildMoHubJsonLd } from "@shared/geoJsonLd";

export default function MoHubPage() {
  useEffect(() => {
    clearRoutePageJsonLd();
    const head = presentationMoHub();
    syncStandardPageHead(head);

    const script = document.createElement("script");
    script.id = "ld-mo-hub";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(buildMoHubJsonLd(head.description));
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  const head = presentationMoHub();

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
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Московская область</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={22} style={{ color: "#ED1C24" }} />
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Москва и Подмосковье
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
            {moHubPage.h1}
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
            {moHubPage.lead}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          {moHubCityGroups.map((group) => (
            <div key={group.title} className="mb-12">
              <h2
                className="mb-5"
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "1.35rem",
                  color: "#1A1A2E",
                }}
              >
                {group.title}
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
                {group.cities.map((c) => (
                  <li
                    key={c.slugKey}
                    className="p-4"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(26,26,46,0.08)",
                      borderRadius: "0.5rem",
                    }}
                  >
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "0.6rem",
                        color: "var(--ms-orange)",
                      }}
                    >
                      {c.priceFrom}
                    </div>
                    <div
                      className="mb-2"
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "#1A1A2E",
                      }}
                    >
                      {c.city}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      <Link href={c.angaryHref}>
                        <a style={{ color: "rgba(26,26,46,0.65)", textDecoration: "none" }}>Ангары</a>
                      </Link>
                      {c.skladyHref && (
                        <Link href={c.skladyHref}>
                          <a style={{ color: "rgba(26,26,46,0.65)", textDecoration: "none" }}>Склады</a>
                        </Link>
                      )}
                      {c.proizvodstvoHref && (
                        <Link href={c.proizvodstvoHref}>
                          <a style={{ color: "rgba(26,26,46,0.65)", textDecoration: "none" }}>Цеха</a>
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mb-12">
            <h2
              className="mb-5"
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#1A1A2E",
              }}
            >
              Популярные размеры в Москве
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 list-none p-0 m-0">
              {moHubFeaturedComboLinks().map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <a
                      className="block p-4 h-full"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(26,26,46,0.08)",
                        borderRadius: "0.5rem",
                        fontFamily: "Barlow, sans-serif",
                        fontSize: "0.9rem",
                        color: "#1A1A2E",
                        textDecoration: "none",
                      }}
                    >
                      <div className="font-semibold">{link.label}</div>
                      <div style={{ color: "var(--ms-orange)", marginTop: "0.35rem" }}>
                        от {link.price?.toLocaleString("ru-RU")} ₽
                      </div>
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-12">
            <h2
              className="mb-5"
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#1A1A2E",
              }}
            >
              Кейсы в Москве и МО
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none p-0 m-0">
              {MO_HUB_FEATURED_CASES.map((c) => (
                <li key={c.href}>
                  <Link href={c.href}>
                    <a
                      className="block p-4"
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(26,26,46,0.08)",
                        borderRadius: "0.5rem",
                        fontFamily: "Barlow, sans-serif",
                        fontSize: "0.9rem",
                        color: "#1A1A2E",
                        textDecoration: "none",
                      }}
                    >
                      {c.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-12">
            <h2
              className="mb-5"
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#1A1A2E",
              }}
            >
              Полезные материалы
            </h2>
            <ul className="space-y-2 list-none p-0 m-0">
              {MO_HUB_BLOG_LINKS.map((b) => (
                <li key={b.href}>
                  <Link href={b.href}>
                    <a
                      style={{
                        fontFamily: "Barlow, sans-serif",
                        fontSize: "0.9rem",
                        color: "var(--ms-orange)",
                        textDecoration: "none",
                      }}
                    >
                      {b.label} →
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-12">
            <h2
              className="mb-5"
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#1A1A2E",
              }}
            >
              Частые вопросы
            </h2>
            <dl className="space-y-4">
              {moHubFaqs.map((f) => (
                <div key={f.q}>
                  <dt
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#1A1A2E",
                      marginBottom: "0.35rem",
                    }}
                  >
                    {f.q}
                  </dt>
                  <dd
                    style={{
                      fontFamily: "Barlow, sans-serif",
                      fontSize: "0.9rem",
                      lineHeight: 1.65,
                      color: "rgba(26,26,46,0.55)",
                      margin: 0,
                    }}
                  >
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.85rem",
              color: "rgba(26,26,46,0.45)",
            }}
          >
            {head.description}
          </p>
        </div>
      </section>

      <SeeAlsoSection items={getMoHubSeeAlsoItems()} trackSource="mo_hub" />
      <ContactSection />
      <Footer />
      <FloatingButtons />
    </div>
  );
}

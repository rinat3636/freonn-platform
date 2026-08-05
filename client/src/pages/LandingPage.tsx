/**
 * SEO Landing Page — Freonn
 * Dynamic page for each building type with full SEO optimization
 */
import { useEffect, lazy, Suspense } from "react";
import { useLocation, Link } from "wouter";
import { ChevronRight, Phone, MessageSquare, CheckCircle2, ChevronDown, BookOpen, ArrowRight } from "lucide-react";
import { useState } from "react";
import { presentationLanding } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import { resolveLandingBySlug, landingSubpagesForParent } from "@/data/landingPages";
import { getLandingSeeAlsoItems } from "@/data/seeAlsoForPages";
import { gaEvent } from "@/lib/ga";
import { ymGoal } from "@/lib/ym";
import { buildingTypesForSeoLanding } from "@/data/buildingTypesForLanding";
import { proizvodstvoGeoPages, skladGeoPages } from "@/data/geoPages";
import { landingMoComboLinks, landingMoGeoLinks, landingStandaloneSizeLinks } from "@/data/moHubPage";
import { MO_HUB_SLUG } from "@shared/moSeo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
const ReviewsSection = lazy(() => import("@/components/ReviewsSection"));
import SeeAlsoSection from "@/components/SeeAlsoSection";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b"
      style={{ borderColor: "rgba(26,26,46,0.1)" }}
    >
      <button
        className="w-full text-left py-4 flex items-center justify-between gap-4"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 600,
            fontSize: "1rem",
            color: "#1A1A2E",
          }}
        >
          {q}
        </span>
        <ChevronDown
          size={18}
          style={{
            color: "#ED1C24",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>
      {open && (
        <p
          className="pb-4"
          style={{
            fontFamily: "Barlow, sans-serif",
            fontSize: "0.9rem",
            color: "rgba(26,26,46,0.7)",
            lineHeight: 1.6,
          }}
        >
          {a}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [location] = useLocation();
  const page = resolveLandingBySlug(location);

  useEffect(() => {
    if (page) {
      clearRoutePageJsonLd();
      syncStandardPageHead(presentationLanding(page));
      ymGoal("seo_landing_view", { slug: page.slug, parent: page.parentSlug ?? page.slug });
    }
  }, [page]);

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ fontFamily: "Barlow, sans-serif", color: "#1A1A2E" }}>
          Страница не найдена.{" "}
          <Link href="/" style={{ color: "#ED1C24" }}>
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const childLandings = !page.parentSlug ? landingSubpagesForParent(page.slug) : [];

  return (
    <div className="min-h-screen" style={{ background: "#F8F8F8" }}>
      <Header />

      {/* Hero */}
      <section
        className="relative pt-32 pb-20 overflow-hidden"
        style={{ background: "#1A1A2E" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        <div className="container relative z-10">
          {/* Breadcrumb */}
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>
              <li>
                <Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                  Главная
                </Link>
              </li>
              <li><ChevronRight size={10} /></li>
              {page.parentSlug && page.parentBreadcrumb ? (
                <>
                  <li>
                    <Link href={page.parentSlug} style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
                      {page.parentBreadcrumb}
                    </Link>
                  </li>
                  <li><ChevronRight size={10} /></li>
                </>
              ) : null}
              <li style={{ color: "rgba(255,255,255,0.7)" }}>{page.breadcrumb}</li>
            </ol>
          </nav>

          <h1
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              color: "#FFFFFF",
              lineHeight: 1,
              letterSpacing: "0.02em",
              marginBottom: "1rem",
            }}
          >
            {page.h1}
          </h1>

          <p
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontSize: "clamp(1rem, 2vw, 1.25rem)",
              color: "rgba(255,255,255,0.6)",
              maxWidth: "600px",
              marginBottom: "2rem",
            }}
          >
            {page.subtitle}
          </p>

          <div
            className="flex flex-wrap gap-4 items-center"
          >
            <div
              style={{
                fontFamily: "Bebas Neue, sans-serif",
                fontSize: "2rem",
                color: "#ED1C24",
                letterSpacing: "0.04em",
              }}
            >
              {page.price}
            </div>
            <a
              href="tel:+78001012009"
              onClick={() => {
                ymGoal("phone_click", { source: "landing_hero" });
                gaEvent("phone_click", { event_category: "contact", event_label: "landing_hero", value: 1 });
              }}
              className="inline-flex items-center gap-2 px-6 py-3"
              style={{
                background: "#ED1C24",
                color: "#FFFFFF",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                letterSpacing: "0.06em",
                textDecoration: "none",
                borderRadius: "0.5rem",
              }}
            >
              <Phone size={16} />
              Бесплатный расчёт
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3"
              style={{
                background: "transparent",
                color: "#FFFFFF",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                letterSpacing: "0.06em",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "0.5rem",
              }}
            >
              <MessageSquare size={16} />
              Написать
            </a>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section className="py-16" style={{ background: "#FFFFFF" }}>
        <div className="container">
          <h2
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              color: "#1A1A2E",
              letterSpacing: "0.04em",
              marginBottom: "2rem",
            }}
          >
            Технические характеристики
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {page.specs.map((spec) => (
              <div
                key={spec.label}
                className="p-4"
                style={{
                  background: "rgba(26,26,46,0.03)",
                  border: "1px solid rgba(26,26,46,0.08)",
                  borderRadius: "0.75rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.55rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(26,26,46,0.4)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {spec.label}
                </div>
                <div
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#1A1A2E",
                  }}
                >
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {childLandings.length > 0 ? (
        <section className="py-12" style={{ background: "#FFFFFF" }}>
          <div className="container">
            <h2
              style={{
                fontFamily: "Bebas Neue, sans-serif",
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                color: "#1A1A2E",
                letterSpacing: "0.04em",
                marginBottom: "1.25rem",
              }}
            >
              Подтипы и решения
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {childLandings.map((sub) => (
                <Link
                  key={sub.slug}
                  href={sub.slug}
                  className="block p-4 rounded-lg transition-colors"
                  style={{
                    border: "1px solid rgba(26,26,46,0.1)",
                    textDecoration: "none",
                    background: "#F8F8F8",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: "#1A1A2E",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {sub.breadcrumb}
                  </span>
                  <p
                    className="mt-1"
                    style={{
                      fontFamily: "Barlow, sans-serif",
                      fontSize: "0.85rem",
                      color: "rgba(26,26,46,0.6)",
                      lineHeight: 1.4,
                    }}
                  >
                    {sub.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Description + Advantages */}
      <section className="py-16" style={{ background: "#F8F8F8" }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2
                style={{
                  fontFamily: "Bebas Neue, sans-serif",
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  color: "#1A1A2E",
                  letterSpacing: "0.04em",
                  marginBottom: "1.5rem",
                }}
              >
                О строительстве
              </h2>
              <p
                style={{
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "1rem",
                  color: "rgba(26,26,46,0.75)",
                  lineHeight: 1.7,
                }}
              >
                {page.description}
              </p>
              {page.longDescription && (
                <p
                  className="mt-4"
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.95rem",
                    color: "rgba(26,26,46,0.65)",
                    lineHeight: 1.7,
                  }}
                >
                  {page.longDescription}
                </p>
              )}
              <p
                className="mt-4"
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.7rem",
                  color: "rgba(26,26,46,0.4)",
                  letterSpacing: "0.04em",
                }}
              >
                {page.priceNote}
              </p>
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "Bebas Neue, sans-serif",
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  color: "#1A1A2E",
                  letterSpacing: "0.04em",
                  marginBottom: "1.5rem",
                }}
              >
                Преимущества
              </h2>
              <ul className="space-y-3">
                {page.advantages.map((adv) => (
                  <li key={adv} className="flex items-start gap-3">
                    <CheckCircle2
                      size={18}
                      style={{ color: "#ED1C24", flexShrink: 0, marginTop: "2px" }}
                    />
                    <span
                      style={{
                        fontFamily: "Barlow, sans-serif",
                        fontSize: "0.95rem",
                        color: "rgba(26,26,46,0.8)",
                      }}
                    >
                      {adv}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16" style={{ background: "#FFFFFF" }}>
        <div className="container max-w-3xl mx-auto">
          <h2
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              color: "#1A1A2E",
              letterSpacing: "0.04em",
              marginBottom: "2rem",
            }}
          >
            Часто задаваемые вопросы
          </h2>
          <div>
            {page.faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Related blog posts */}
      {page.relatedBlogPosts && page.relatedBlogPosts.length > 0 && (
        <section className="py-12" style={{ background: "#F8F8F8" }}>
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen size={18} style={{ color: "#ED1C24" }} />
              <h2
                style={{
                  fontFamily: "Bebas Neue, sans-serif",
                  fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
                  color: "#1A1A2E",
                  letterSpacing: "0.04em",
                }}
              >
                Полезные статьи по теме
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {page.relatedBlogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={post.slug}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    className="p-5 h-full flex flex-col"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(26,26,46,0.08)",
                      borderRadius: "0.75rem",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(237,28,36,0.3)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(237,28,36,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.08)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    <div style={{ background: "#ED1C24", height: "2px", marginBottom: "1rem", borderRadius: "1px" }} />
                    <p
                      className="flex-1"
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 600,
                        fontSize: "1rem",
                        color: "#1A1A2E",
                        lineHeight: 1.3,
                      }}
                    >
                      {post.title}
                    </p>
                    <div
                      className="flex items-center gap-1 mt-3"
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: "#ED1C24",
                      }}
                    >
                      Читать <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section
        id="contact"
        className="py-16"
        style={{ background: "#ED1C24" }}
      >
        <div className="container text-center">
          <h2
            style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "#FFFFFF",
              letterSpacing: "0.04em",
              marginBottom: "1rem",
            }}
          >
            Получить расчёт бесплатно
          </h2>
          <p
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "1rem",
              color: "rgba(255,255,255,0.8)",
              marginBottom: "2rem",
            }}
          >
            Ответим за 15 минут в рабочее время. Расчёт — за 1 день.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="tel:+78001012009"
              onClick={() => {
                ymGoal("phone_click", { source: "landing_cta" });
                gaEvent("phone_click", { event_category: "contact", event_label: "landing_cta", value: 1 });
              }}
              className="inline-flex items-center gap-2 px-8 py-4"
              style={{
                background: "#FFFFFF",
                color: "#ED1C24",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                letterSpacing: "0.06em",
                textDecoration: "none",
                borderRadius: "0.5rem",
              }}
            >
              <Phone size={18} />
              8(800)101-2009
            </a>
            <a
              href="mailto:freonn@internet.ru"
              className="inline-flex items-center gap-2 px-8 py-4"
              style={{
                background: "transparent",
                color: "#FFFFFF",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                letterSpacing: "0.06em",
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.5)",
                borderRadius: "0.5rem",
              }}
            >
              freonn@internet.ru
            </a>
          </div>
        </div>
      </section>

      {buildingTypesForSeoLanding(page.slug).length > 0 && (
        <section className="py-12" style={{ background: "#FFFFFF", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <div className="container">
            <h3
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(26,26,46,0.4)",
                marginBottom: "0.75rem",
              }}
            >
              Типы зданий в калькуляторе
            </h3>
            <p
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.95rem",
                color: "rgba(26,26,46,0.55)",
                marginBottom: "1.25rem",
                maxWidth: "42rem",
                lineHeight: 1.55,
              }}
            >
              Отдельные страницы под расчёт и индексацию: выберите тип — откроется карточка и конфигуратор с предвыбором.
            </p>
            <div className="flex flex-wrap gap-2">
              {buildingTypesForSeoLanding(page.slug).map((t) => (
                <Link
                  key={t.id}
                  href={`/zdaniya/${encodeURIComponent(t.id)}`}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg transition-colors"
                  style={{
                    background: "#F8F8F8",
                    border: "1px solid rgba(26,26,46,0.08)",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  {t.label}
                  <ChevronRight size={12} style={{ color: "#ED1C24" }} />
                </Link>
              ))}
            </div>
            <div className="mt-5">
              <Link
                href="/zdaniya"
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.62rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#ED1C24",
                  textDecoration: "none",
                }}
              >
                Полный каталог типов →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Related pages */}
      <section className="py-12" style={{ background: "#F8F8F8" }}>
        <div className="container">
          <h3
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(26,26,46,0.4)",
              marginBottom: "1rem",
            }}
          >
            Другие направления
          </h3>
          <div className="flex flex-wrap gap-3">
            {page.relatedPages.map((rel) => (
              <Link
                key={rel.slug}
                href={rel.slug}
                className="inline-flex items-center gap-1 px-4 py-2"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,26,46,0.1)",
                  borderRadius: "0.5rem",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#1A1A2E",
                  textDecoration: "none",
                }}
              >
                {rel.label}
                <ChevronRight size={14} style={{ color: "#ED1C24" }} />
              </Link>
            ))}
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-4 py-2"
              style={{
                background: "transparent",
                border: "1px solid rgba(26,26,46,0.1)",
                borderRadius: "0.5rem",
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                color: "rgba(26,26,46,0.5)",
                textDecoration: "none",
              }}
            >
              На главную
              <ChevronRight size={14} />
            </Link>
          </div>
          <h3
            className="mt-10"
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(26,26,46,0.4)",
              marginBottom: "1rem",
            }}
          >
            Цены и услуги
          </h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Ориентиры цен", slug: "/tseny" },
              { label: "Проектирование", slug: "/proektirovanie" },
              { label: "Монтаж", slug: "/montazh" },
              { label: "Доставка МК", slug: "/dostavka" },
            ].map((row) => (
              <Link
                key={row.slug}
                href={row.slug}
                className="inline-flex items-center gap-1 px-4 py-2"
                style={{
                  background: "rgba(26,26,46,0.04)",
                  border: "1px solid rgba(26,26,46,0.12)",
                  borderRadius: "0.5rem",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#1A1A2E",
                  textDecoration: "none",
                }}
              >
                {row.label}
                <ChevronRight size={14} style={{ color: "#ED1C24" }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Geo pages — only show for /angary */}
      {page.slug === "/angary" && (
        <>
        <section className="py-12" style={{ background: "#F4F5F7", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <div className="container">
            <h3
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#1A1A2E",
                marginBottom: "0.5rem",
              }}
            >
              Подмосковье
            </h3>
            <p
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.85rem",
                color: "rgba(26,26,46,0.5)",
                marginBottom: "1rem",
                maxWidth: "36rem",
              }}
            >
              40+ городов МО — ангары от 8 330 ₽/m². Выезд инженера за 24 ч из офиса на Варшавском шоссе.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              {landingMoGeoLinks("angary").map((geo) => (
                <Link
                  key={geo.slug}
                  href={geo.slug}
                  className="inline-flex items-center gap-1 px-4 py-2"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(26,26,46,0.1)",
                    borderRadius: "0.5rem",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  {geo.label}
                  <ChevronRight size={14} style={{ color: "#ED1C24" }} />
                </Link>
              ))}
            </div>
            <Link href={MO_HUB_SLUG}>
              <a
                style={{
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.9rem",
                  color: "#ED1C24",
                  textDecoration: "none",
                }}
              >
                Все города Московской области →
              </a>
            </Link>
          </div>
        </section>
        <section className="py-12" style={{ background: "#FFFFFF", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <div className="container">
            <h3
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#1A1A2E",
                marginBottom: "0.5rem",
              }}
            >
              Размер + Москва
            </h3>
            <p
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.85rem",
                color: "rgba(26,26,46,0.5)",
                marginBottom: "1rem",
                maxWidth: "36rem",
              }}
            >
              Комбо-страницы: ангары, склады и цеха 500–2000 m² в Москве и МО.
            </p>
            <div className="flex flex-wrap gap-3">
              {landingMoComboLinks("angar").map((item) => (
                <Link
                  key={item.slug}
                  href={item.slug}
                  className="inline-flex items-center gap-1 px-4 py-2"
                  style={{
                    background: "rgba(237,28,36,0.04)",
                    border: "1px solid rgba(237,28,36,0.15)",
                    borderRadius: "0.5rem",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                  <ChevronRight size={14} style={{ color: "#ED1C24" }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="py-12" style={{ background: "#FFFFFF", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <div className="container">
            <h3
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(26,26,46,0.4)",
                marginBottom: "1rem",
              }}
            >
              Строим по всей России
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Ангары в Москве", slug: "/angary-moskva" },
                { label: "Ангары в Санкт-Петербурге", slug: "/angary-sankt-peterburg" },
                { label: "Ангары в Екатеринбурге", slug: "/angary-ekaterinburg" },
                { label: "Ангары в Новосибирске", slug: "/angary-novosibirsk" },
                { label: "Ангары в Казани", slug: "/angary-kazan" },
                { label: "Ангары в Уфе", slug: "/angary-ufa" },
                { label: "Ангары в Краснодаре", slug: "/angary-krasnodar" },
                { label: "Ангары в Челябинске", slug: "/angary-chelyabinsk" },
                { label: "Ангары в Ростове-на-Дону", slug: "/angary-rostov-na-donu" },
                { label: "Ангары в Самаре", slug: "/angary-samara" },
                { label: "Ангары в Нижнем Новгороде", slug: "/angary-nizhny-novgorod" },
                { label: "Ангары в Перми", slug: "/angary-perm" },
              ].map((geo) => (
                <Link
                  key={geo.slug}
                  href={geo.slug}
                  className="inline-flex items-center gap-1 px-4 py-2"
                  style={{
                    background: "rgba(237,28,36,0.04)",
                    border: "1px solid rgba(237,28,36,0.15)",
                    borderRadius: "0.5rem",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  {geo.label}
                  <ChevronRight size={14} style={{ color: "#ED1C24" }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
        </>
      )}

      {page.slug === "/sklady" && (
        <>
        <section className="py-12" style={{ background: "#F4F5F7", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <div className="container">
            <h3
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#1A1A2E",
                marginBottom: "0.5rem",
              }}
            >
              Склады в Москве и МО
            </h3>
            <p
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.85rem",
                color: "rgba(26,26,46,0.5)",
                marginBottom: "1rem",
                maxWidth: "36rem",
              }}
            >
              Комбо-страницы по метражу — от 4,6 до 18,4 млн ₽ холодный склад. Логистика у МКАД и в Подмосковье.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              {[
                ...landingStandaloneSizeLinks("sklad"),
                ...landingMoComboLinks("sklad"),
                { label: "Склады в Москве", slug: "/sklady-moskva" },
              ].map((item) => (
                <Link
                  key={item.slug}
                  href={item.slug}
                  className="inline-flex items-center gap-1 px-4 py-2"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(26,26,46,0.1)",
                    borderRadius: "0.5rem",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                  <ChevronRight size={14} style={{ color: "#ED1C24" }} />
                </Link>
              ))}
            </div>
            <Link href={MO_HUB_SLUG}>
              <a
                style={{
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "0.9rem",
                  color: "#ED1C24",
                  textDecoration: "none",
                }}
              >
                Все города Московской области →
              </a>
            </Link>
          </div>
        </section>
        <section className="py-12" style={{ background: "#FFFFFF", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <div className="container">
            <h3
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(26,26,46,0.4)",
                marginBottom: "1rem",
              }}
            >
              Склады в крупных городах
            </h3>
            <div className="flex flex-wrap gap-3">
              {skladGeoPages.map((geo) => (
                <Link
                  key={geo.slug}
                  href={geo.slug}
                  className="inline-flex items-center gap-1 px-4 py-2"
                  style={{
                    background: "rgba(237,28,36,0.04)",
                    border: "1px solid rgba(237,28,36,0.15)",
                    borderRadius: "0.5rem",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  Склады в {geo.city}
                  <ChevronRight size={14} style={{ color: "#ED1C24" }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
        </>
      )}

      {page.slug === "/proizvodstvennye-zdaniya" && (
        <>
        <section className="py-12" style={{ background: "#F4F5F7", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <div className="container">
            <h3
              style={{
                fontFamily: "Barlow Condensed, sans-serif",
                fontWeight: 700,
                fontSize: "1.35rem",
                color: "#1A1A2E",
                marginBottom: "0.5rem",
              }}
            >
              Цеха в Москве и МО
            </h3>
            <p
              style={{
                fontFamily: "Barlow, sans-serif",
                fontSize: "0.85rem",
                color: "rgba(26,26,46,0.5)",
                marginBottom: "1rem",
                maxWidth: "36rem",
              }}
            >
              Производственные здания от 6,9 до 27,6 млн ₽ — крановые пути, промзоны Подмосковья.
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              {[
                ...landingStandaloneSizeLinks("proizvodstvo"),
                ...landingMoComboLinks("proizvodstvo"),
                { label: "Цеха в Москве", slug: "/proizvodstvennye-zdaniya-moskva" },
              ].map((item) => (
                <Link
                  key={item.slug}
                  href={item.slug}
                  className="inline-flex items-center gap-1 px-4 py-2"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(26,26,46,0.1)",
                    borderRadius: "0.5rem",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  {item.label}
                  <ChevronRight size={14} style={{ color: "#ED1C24" }} />
                </Link>
              ))}
            </div>
            <Link href={MO_HUB_SLUG}>
              <a style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.9rem", color: "#ED1C24", textDecoration: "none" }}>
                Все города Московской области →
              </a>
            </Link>
          </div>
        </section>
        <section className="py-12" style={{ background: "#FFFFFF", borderTop: "1px solid rgba(26,26,46,0.06)" }}>
          <div className="container">
            <h3
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(26,26,46,0.4)",
                marginBottom: "1rem",
              }}
            >
              Производственные здания в регионах
            </h3>
            <div className="flex flex-wrap gap-3">
              {proizvodstvoGeoPages.map((geo) => (
                <Link
                  key={geo.slug}
                  href={geo.slug}
                  className="inline-flex items-center gap-1 px-4 py-2"
                  style={{
                    background: "rgba(237,28,36,0.04)",
                    border: "1px solid rgba(237,28,36,0.15)",
                    borderRadius: "0.5rem",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  Цеха в {geo.city}
                  <ChevronRight size={14} style={{ color: "#ED1C24" }} />
                </Link>
              ))}
            </div>
          </div>
        </section>
        </>
      )}

      <SeeAlsoSection
        variant="light"
        trackSource={`landing_${page.slug.replace(/^\//, "")}`}
        items={getLandingSeeAlsoItems(page.slug)}
        title="Смотрите также"
        lead="Каталог типов зданий, калькулятор, портфолио и другие направления Freonn."
      />

      <Suspense fallback={null}>
        <ReviewsSection />
      </Suspense>

      <Footer />
      <FloatingButtons />
    </div>
  );
}

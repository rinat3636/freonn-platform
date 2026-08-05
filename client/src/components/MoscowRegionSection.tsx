/*
 * SEO-блок «Москва и область» — перелинковка на geo-лендинги и кейс.
 * Без framer-motion — легче для LCP/INP на главной.
 */
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "wouter";
import {
  MOSCOW_ANGAR_RUB_M2,
  MOSCOW_SKLAD_RUB_M2,
  MOSCOW_TSEKH_RUB_M2,
} from "@shared/moscowPricing";
import { MO_HUB_SLUG, MO_PORTFOLIO_FALLBACK } from "@shared/moSeo";
import { landingMoGeoLinks } from "@/data/moHubPage";

const cards = [
  {
    title: "Ангары в Москве",
    desc: "Быстровозводимые ангары под ключ. Монтаж от 20 дней, доставка по МКАД и МО.",
    href: "/angary-moskva",
    price: `от ${MOSCOW_ANGAR_RUB_M2.toLocaleString("ru-RU")} ₽/m²`,
  },
  {
    title: "Склады в Москве",
    desc: "Логистические и температурные склады. Промзоны Подольска, Домодедово, Химок.",
    href: "/sklady-moskva",
    price: `от ${MOSCOW_SKLAD_RUB_M2.toLocaleString("ru-RU")} ₽/m²`,
  },
  {
    title: "Производственные здания",
    desc: "Цеха с крановым оборудованием, усиленные пролёты. Проект и монтаж в одном договоре.",
    href: "/proizvodstvennye-zdaniya-moskva",
    price: `от ${MOSCOW_TSEKH_RUB_M2.toLocaleString("ru-RU")} ₽/m²`,
  },
];

const moCityLinks = landingMoGeoLinks("angary", 4);

export default function MoscowRegionSection() {
  return (
    <section
      id="moskva-mo"
      aria-label="Строительство промышленных зданий в Москве и Московской области"
      className="relative py-20 lg:py-28 overflow-hidden mo-fade-in"
      style={{ background: "#F4F5F7" }}
    >
      <div className="container relative z-10">
        <div className="mb-12 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={16} style={{ color: "var(--ms-orange)" }} />
            <span className="ms-label">Москва и Московская область</span>
          </div>
          <h2
            className="ms-heading mb-4"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "#1A1A2E" }}
          >
            Строим в Москве и Подмосковье
          </h2>
          <p
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.95rem",
              lineHeight: 1.75,
              color: "rgba(26,26,46,0.85)",
              fontWeight: 400,
            }}
          >
            Офис на Варшавском шоссе, 125Ж. Выезд инженера по Москве и МО за 24 часа. Более 87 объектов
            в регионе — от складов 8 500 m² до производственных цехов. Работаем по МКАД, ЦКАД и
            промзонам области.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {cards.map((card) => (
            <Link key={card.href} href={card.href}>
              <a
                className="block h-full p-6 transition-all duration-200 group"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,26,46,0.08)",
                  borderRadius: "0.75rem",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(237,28,36,0.35)";
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(26,26,46,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(26,26,46,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="mb-3"
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.1em",
                    color: "var(--ms-orange)",
                  }}
                >
                  {card.price}
                </div>
                <h3
                  className="mb-2 group-hover:underline"
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    color: "#1A1A2E",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    fontFamily: "Barlow, sans-serif",
                    fontSize: "0.82rem",
                    lineHeight: 1.65,
                    color: "rgba(26,26,46,0.85)",
                    fontWeight: 300,
                  }}
                >
                  {card.desc}
                </p>
                <span
                  className="inline-flex items-center gap-1 mt-4"
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.6rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--ms-orange)",
                  }}
                >
                  Подробнее
                  <ArrowRight size={12} />
                </span>
              </a>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
          <Link href={MO_HUB_SLUG}>
            <a
              className="inline-flex items-center gap-2 text-sm transition-colors font-medium"
              style={{
                fontFamily: "Barlow, sans-serif",
                color: "var(--ms-orange)",
                textDecoration: "none",
              }}
            >
              Все города Московской области
              <ArrowRight size={14} />
            </a>
          </Link>
          <Link href={MO_PORTFOLIO_FALLBACK.href}>
            <a
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{
                fontFamily: "Barlow, sans-serif",
                color: "rgba(26,26,46,0.85)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ms-orange)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,26,46,0.85)")}
            >
              {MO_PORTFOLIO_FALLBACK.label}: {MO_PORTFOLIO_FALLBACK.description}
              <ArrowRight size={14} />
            </a>
          </Link>
          {moCityLinks.map((link) => (
            <Link key={link.slug} href={link.slug}>
              <a
                className="inline-flex items-center gap-1 text-sm transition-colors"
                style={{
                  fontFamily: "Barlow, sans-serif",
                  color: "rgba(26,26,46,0.85)",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ms-orange)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,26,46,0.85)")}
              >
                {link.label}
              </a>
            </Link>
          ))}
          <Link href="/kontakty">
            <a
              className="inline-flex items-center gap-2 text-sm transition-colors"
              style={{
                fontFamily: "Barlow, sans-serif",
                color: "rgba(26,26,46,0.85)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ms-orange)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,26,46,0.85)")}
            >
              Контакты и схема проезда
              <ArrowRight size={14} />
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
}

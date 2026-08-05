/*
 * Freonn — подвал сайта: навигация, контакты, юридические ссылки
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import FreonnLogo from "./FreonnLogo";
import { ymGoal } from "../lib/ym";
import { MO_HUB_SLUG, MO_PORTFOLIO_FALLBACK } from "@shared/moSeo";

const navCols = [
  {
    title: "Здания",
    links: [
      "Ангары",
      "Холодные ангары",
      "Тёплые склады",
      "Склад класса A",
      "Быстровозводимые здания",
      "Сэндвич-панели",
      "Склады",
      "Производственные здания",
      "С/х здания",
      "Торговые здания",
      "Спортивные сооружения",
      "Каталог типов зданий",
    ],
  },
  {
    title: "Москва и МО",
    links: [
      "Ангары в Москве",
      "Склады в Москве",
      "Цеха в Москве",
      "Все города МО",
      "Кейс: склад в МО",
      "Контакты",
    ],
  },
  {
    title: "Компания",
    links: [
      "О компании",
      "Команда",
      "Наши объекты",
      "Гарантия",
      "Лицензии",
      "Контакты",
      "Вакансии",
      "Этапы работы",
      "Цены",
      "FAQ",
      "Блог",
      "Реквизиты",
      "Карта сайта",
    ],
  },
  {
    title: "Услуги",
    links: ["Проектирование", "Изготовление", "Монтаж", "Доставка", "Под ключ", "Фундамент", "Инженерные системы"],
  },
];

export default function Footer() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const sectionMap: Record<string, string> = {
    "О компании": "/o-kompanii",
    "Команда": "/komanda",
    "Наши объекты": "/portfolio",
    "Гарантия": "/garantii",
    "Лицензии": "/litsenzii",
    "Контакты": "/kontakty",
    "Вакансии": "/vakansii",
    "Этапы работы": "#process",
    "Цены": "/tseny",
    "FAQ": "#faq",
    "Блог": "/blog",
    "Реквизиты": "/rekvizity",
    "Карта сайта": "/karta-sajta",
    "Ангары": "/angary",
    "Холодные ангары": "/angary/holodnye",
    "Тёплые склады": "/sklady/teplye",
    "Склад класса A": "/sklady/klass-a",
    "Быстровозводимые здания": "/bystrovozvodimye-zdaniya",
    "Сэндвич-панели": "/sendvich-paneli",
    "Склады": "/sklady",
    "Производственные здания": "/proizvodstvennye-zdaniya",
    "С/х здания": "/selskokhozyaystvennye-zdaniya",
    "Торговые здания": "/torgovye-zdaniya",
    "Спортивные сооружения": "/sportivnye-sooruzheniya",
    "Каталог типов зданий": "/zdaniya",
    "Ангары в Москве": "/angary-moskva",
    "Склады в Москве": "/sklady-moskva",
    "Цеха в Москве": "/proizvodstvennye-zdaniya-moskva",
    "Все города МО": MO_HUB_SLUG,
    "Кейс: склад в МО": MO_PORTFOLIO_FALLBACK.href,
    "Проектирование": "/proektirovanie",
    "Изготовление": "#services",
    "Монтаж": "/montazh",
    "Доставка": "/dostavka",
    "Под ключ": "#services",
    "Фундамент": "#process",
    "Инженерные системы": "https://www.freonn.ru",
  };

  return (
    <footer
      className="relative overflow-hidden"
      aria-label="Подвал сайта Freonn"
      style={{ background: '#F4F5F7', borderTop: '1px solid rgba(26,26,46,0.1)' }}
    >
      {/* Grid bg */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(26,26,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container relative z-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-5">
              <FreonnLogo height={28} />
            </div>

            <p
              className="mb-6"
              style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.82rem',
                lineHeight: 1.7,
                color: 'rgba(26,26,46,0.5)',
                fontWeight: 300,
                maxWidth: '260px',
              }}
            >
              Промышленные здания под ключ с 2011 года. Офис в Москве, монтаж по Москве и области и по всей России.
            </p>

            {/* MAX channel link */}
            <a
              href="https://max.ru/id3604084591_biz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mb-5 px-4 py-2 transition-all duration-200"
              style={{
                background: 'rgba(237,28,36,0.08)',
                border: '1px solid rgba(237,28,36,0.25)',
                borderRadius: '999px',
                textDecoration: 'none',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '0.62rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ms-orange)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(237,28,36,0.15)'; e.currentTarget.style.borderColor = 'rgba(237,28,36,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(237,28,36,0.08)'; e.currentTarget.style.borderColor = 'rgba(237,28,36,0.25)'; }}
            >
              <ExternalLink size={10} />
              Наши работы на MAX
            </a>

            <div className="space-y-2">
              <a
                href="tel:+78001012009"
                onClick={() => ymGoal('phone_click', { source: 'footer' })}
                className="flex items-center gap-2 transition-colors duration-200"
                style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'rgba(26,26,46,0.7)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ms-orange)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(26,26,46,0.7)'}
              >
                <Phone size={12} style={{ color: 'var(--ms-orange)' }} />
                8(800)101-2009
              </a>
              <a
                href="mailto:freonn@internet.ru"
                className="flex items-center gap-2 transition-colors duration-200"
                style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  color: 'rgba(26,26,46,0.4)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ms-orange)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(26,26,46,0.4)'}
              >
                <Mail size={12} style={{ color: 'rgba(237,28,36,0.5)' }} />
                freonn@internet.ru
              </a>
              <div
                className="flex items-start gap-2"
                style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.78rem',
                  color: 'rgba(26,26,46,0.3)',
                  fontWeight: 300,
                }}
              >
                <MapPin size={12} className="flex-shrink-0 mt-0.5" style={{ color: 'rgba(237,28,36,0.4)' }} />
                г. Москва, Варшавское шоссе, д. 125Ж
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {navCols.map((col) => (
            <nav key={col.title} aria-label={`Навигация: ${col.title}`}>
              <div
                className="mb-4"
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'rgba(26,26,46,0.3)',
                }}
              >
                {col.title}
              </div>
              <ul className="space-y-2">
                {col.links.map((link) => {
                  const dest = sectionMap[link] || "#";
                  const isExternal = dest.startsWith("http");
                  const isPage = (dest.startsWith("/") && !dest.startsWith("/#")) || isExternal;
                  return (
                    <li key={link}>
                      {isPage ? (
                        <a
                          href={dest}
                          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          style={{
                            fontFamily: 'Barlow, sans-serif',
                            fontSize: '0.82rem',
                            color: 'rgba(26,26,46,0.55)',
                            fontWeight: 300,
                            textDecoration: 'none',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ms-orange)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(26,26,46,0.55)'}
                        >
                          {link}
                        </a>
                      ) : (
                        <button
                          onClick={() => scrollTo(dest)}
                          style={{
                            fontFamily: 'Barlow, sans-serif',
                            fontSize: '0.82rem',
                            color: 'rgba(26,26,46,0.55)',
                            fontWeight: 300,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ms-orange)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(26,26,46,0.55)'}
                        >
                          {link}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(26,26,46,0.1)' }}
        >
          <div
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '0.58rem',
              letterSpacing: '0.08em',
              color: 'rgba(26,26,46,0.2)',
            }}
          >
            © 2011–2026 ООО «ЭКС» ·{" "}
            <a href="/rekvizity" style={{ color: "inherit", textDecoration: "underline", textUnderlineOffset: "2px" }}>
              ИНН 3604084591 · ОГРН 1243600003569
            </a>
            {" · "}Все права защищены
            {' · '}
            <a href="https://www.freonn.ru" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(26,26,46,0.35)', textDecoration: 'none' }} onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = '#4B5FBF'} onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(26,26,46,0.35)'}>
              Инженерные системы: freonn.ru
            </a>
          </div>
          <div className="flex gap-4">
            {[
              { label: "Политика конфиденциальности", href: "/politika-konfidencialnosti" },
              { label: "Правовая информация", href: "/publichnaya-oferta" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.55rem',
                  letterSpacing: '0.06em',
                  color: 'rgba(26,26,46,0.4)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(26,26,46,0.7)'}
                onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(26,26,46,0.3)'}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

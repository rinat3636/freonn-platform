import { useEffect } from "react";
import { presentationRekvizity } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import { Link } from "wouter";
import { ChevronRight, Building2, Phone, Mail, MapPin, FileText, Calculator } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import { ymGoal } from "@/lib/ym";
import { gaEvent } from "@/lib/ga";

const row = (label: string, value: string) => ({ label, value });

const requisites = [
  row("Полное наименование", "Общество с ограниченной ответственностью «ЭКС»"),
  row("Сокращённое наименование", "ООО «ЭКС»"),
  row("ИНН", "3604084591"),
  row("ОГРН", "1243600003569"),
  row("КПП", "360401001"),
  row("ОКПО", "52847830"),
  row("ОКВЭД (основной)", "41.20 — Строительство жилых и нежилых зданий"),
  row("Юридический адрес", "117105, г. Москва, Варшавское шоссе, д. 125Ж"),
  row("Фактический адрес", "117105, г. Москва, Варшавское шоссе, д. 125Ж"),
  row("Телефон", "8(800)101-2009 (бесплатно по РФ)"),
  row("Электронная почта", "freonn@internet.ru"),
  row("Сайт", "https://freonn.pro"),
];

export default function RekvizityPage() {
  useEffect(() => {
    clearRoutePageJsonLd();
    syncStandardPageHead(presentationRekvizity());

    const script = document.createElement("script");
    script.id = "ld-rekvizity";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ООО «ЭКС»",
      "legalName": "Общество с ограниченной ответственностью «ЭКС»",
      "url": "https://freonn.pro",
      "logo": "https://freonn.pro/apple-touch-icon.png",
      "taxID": "3604084591",
      "vatID": "3604084591",
      "identifier": [
        { "@type": "PropertyValue", "name": "ИНН", "value": "3604084591" },
        { "@type": "PropertyValue", "name": "ОГРН", "value": "1243600003569" },
        { "@type": "PropertyValue", "name": "КПП", "value": "360401001" },
      ],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Варшавское шоссе, д. 125Ж",
        "addressLocality": "Москва",
        "postalCode": "117105",
        "addressCountry": "RU",
      },
      "telephone": "+78001012009",
      "email": "freonn@internet.ru",
      "foundingDate": "2011",
    });
    document.head.appendChild(script);
    return () => { document.getElementById("ld-rekvizity")?.remove(); };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#F8F8F8" }}>
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12" style={{ background: "#1A1A2E" }}>
        <div className="container">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>
              <li><Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Главная</Link></li>
              <li><ChevronRight size={10} /></li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Реквизиты</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <FileText size={20} style={{ color: "#ED1C24" }} />
            <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
              Юридическая информация
            </span>
          </div>
          <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#FFFFFF", lineHeight: 1, letterSpacing: "0.02em", marginBottom: "0.75rem" }}>
            Реквизиты компании
          </h1>
          <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.5)" }}>
            ООО «ЭКС» — строительство промышленных зданий под ключ с 2011 года
          </p>
        </div>
      </section>

      {/* Requisites table */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <div style={{ background: "#FFFFFF", border: "1px solid rgba(26,26,46,0.08)", borderRadius: "1rem", overflow: "hidden" }}>
            {requisites.map((r, i) => (
              <div
                key={r.label}
                className="flex flex-col sm:flex-row"
                style={{
                  borderBottom: i < requisites.length - 1 ? "1px solid rgba(26,26,46,0.06)" : "none",
                  padding: "1rem 1.5rem",
                  background: i % 2 === 0 ? "#FFFFFF" : "rgba(26,26,46,0.02)",
                }}
              >
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.06em", color: "rgba(26,26,46,0.4)", textTransform: "uppercase", minWidth: "220px", marginBottom: "0.25rem" }}>
                  {r.label}
                </span>
                <span style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.95rem", color: "#1A1A2E", fontWeight: 500 }}>
                  {r.label === "Электронная почта" ? (
                    <a href={`mailto:${r.value}`} style={{ color: "#ED1C24", textDecoration: "none" }}>{r.value}</a>
                  ) : r.label === "Телефон" ? (
                    <a href="tel:+78001012009" style={{ color: "#ED1C24", textDecoration: "none" }}>{r.value}</a>
                  ) : r.label === "Сайт" ? (
                    <a href={r.value} style={{ color: "#ED1C24", textDecoration: "none" }}>{r.value}</a>
                  ) : r.value}
                </span>
              </div>
            ))}
          </div>

          {/* Contact cards */}
          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            {[
              { icon: <Phone size={18} style={{ color: "#ED1C24" }} />, label: "Телефон", value: "8(800)101-2009", href: "tel:+78001012009" },
              { icon: <Mail size={18} style={{ color: "#ED1C24" }} />, label: "Email", value: "freonn@internet.ru", href: "mailto:freonn@internet.ru" },
              { icon: <MapPin size={18} style={{ color: "#ED1C24" }} />, label: "Адрес", value: "Москва, Варшавское ш., 125Ж", href: "https://yandex.ru/maps/?text=Москва%2C+Варшавское+шоссе+125Ж" },
            ].map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("https://yandex") ? "_blank" : undefined}
                rel={c.href.startsWith("https://yandex") ? "noopener noreferrer" : undefined}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  padding: "1.25rem",
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,26,46,0.08)",
                  borderRadius: "0.75rem",
                  textDecoration: "none",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(237,28,36,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(26,26,46,0.08)")}
              >
                {c.icon}
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(26,26,46,0.35)" }}>{c.label}</span>
                <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#1A1A2E" }}>{c.value}</span>
              </a>
            ))}
          </div>

          {/* Note */}
          <div className="mt-6 p-4" style={{ background: "rgba(237,28,36,0.04)", border: "1px solid rgba(237,28,36,0.12)", borderRadius: "0.75rem" }}>
            <div className="flex items-start gap-3">
              <Building2 size={16} style={{ color: "#ED1C24", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.85rem", color: "rgba(26,26,46,0.65)", lineHeight: 1.6 }}>
                Работаем с юридическими лицами и ИП. Все работы по договору с фиксацией стоимости, сроков и гарантийных обязательств. Принимаем оплату по безналичному расчёту, с НДС и без НДС. Участвуем в тендерах по ФЗ-44 и ФЗ-223.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center sm:text-left" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.62rem", letterSpacing: "0.08em", color: "rgba(26,26,46,0.4)" }}>
            <Calculator size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", color: "#ED1C24" }} />
            <Link
              href="/zdaniya"
              style={{ color: "#ED1C24", textDecoration: "none" }}
              onClick={() => {
                ymGoal("cross_nav_chip", { source: "rekvizity", href: "/zdaniya" });
                gaEvent("cross_nav_chip", { source: "rekvizity", href: "/zdaniya" });
              }}
            >
              Каталог типов зданий
            </Link>
            <span style={{ color: "rgba(26,26,46,0.2)" }}> · </span>
            <Link
              href="/#calculator"
              style={{ color: "rgba(26,26,46,0.55)", textDecoration: "none" }}
              onClick={() => {
                ymGoal("cross_nav_chip", { source: "rekvizity", href: "/#calculator" });
                gaEvent("cross_nav_chip", { source: "rekvizity", href: "/#calculator" });
              }}
            >
              Калькулятор ориентира по смете
            </Link>
          </p>
        </div>
      </section>

      <Footer />
      <FloatingButtons />
    </div>
  );
}

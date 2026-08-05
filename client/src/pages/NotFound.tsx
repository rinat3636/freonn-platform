import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Phone, ArrowRight, Home, BookOpen, Building2, Search, Calculator } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ymGoal } from "@/lib/ym";
import { gaEvent } from "@/lib/ga";

const popularPages = [
  { label: "Ангары под ключ", href: "/angary", desc: "от 3 800 ₽/м²" },
  { label: "Строительство складов", href: "/sklady", desc: "от 8 500 ₽/м²" },
  { label: "Производственные здания", href: "/proizvodstvennye-zdaniya", desc: "от 12 000 ₽/м²" },
  { label: "Торговые здания", href: "/torgovye-zdaniya", desc: "от 14 000 ₽/м²" },
  { label: "С/х здания", href: "/selskokhozyaystvennye-zdaniya", desc: "от 5 500 ₽/м²" },
  { label: "Спортивные сооружения", href: "/sportivnye-sooruzheniya", desc: "от 16 000 ₽/м²" },
];

export default function NotFound() {
  const [location] = useLocation();

  useEffect(() => {
    document.title = "Страница не найдена — 404 | Freonn";

    const setMeta = (name: string, content: string, attr = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, name); document.head.appendChild(el); }
      el.content = content;
    };

    // noindex — не индексировать 404 страницы
    setMeta("robots", "noindex, nofollow");
    setMeta("description", "Страница не найдена. Воспользуйтесь навигацией или перейдите на главную страницу Freonn — строительство промышленных зданий под ключ.");

    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      if (location === "/404") {
        canonical.href = "https://freonn.pro/404";
      } else {
        canonical.remove();
      }
    }

    return () => {
      setMeta("robots", "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1");
    };
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F8F8F8" }}>
      <Header />

      <main className="flex-1 pt-32 pb-20">
        <div className="container max-w-4xl">

          {/* Hero block */}
          <div className="text-center mb-16">
            <div
              style={{
                fontFamily: "Bebas Neue, sans-serif",
                fontSize: "clamp(5rem, 18vw, 10rem)",
                lineHeight: 1,
                color: "rgba(237,28,36,0.12)",
                letterSpacing: "0.05em",
                userSelect: "none",
              }}
            >
              404
            </div>
            <div style={{ marginTop: "-2rem", position: "relative" }}>
              <Search size={28} style={{ color: "#ED1C24", margin: "0 auto 1rem" }} />
              <h1
                style={{
                  fontFamily: "Bebas Neue, sans-serif",
                  fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
                  color: "#1A1A2E",
                  letterSpacing: "0.04em",
                  marginBottom: "0.75rem",
                }}
              >
                Страница не найдена
              </h1>
              <p
                style={{
                  fontFamily: "Barlow, sans-serif",
                  fontSize: "1rem",
                  color: "rgba(26,26,46,0.55)",
                  lineHeight: 1.6,
                  maxWidth: "480px",
                  margin: "0 auto 2rem",
                }}
              >
                Запрашиваемый адрес{" "}
                <code style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.85rem", background: "rgba(26,26,46,0.06)", padding: "2px 6px", borderRadius: "4px" }}>
                  {location}
                </code>{" "}
                не существует или был перемещён.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/"
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
                  <Home size={16} />
                  На главную
                </Link>
                <a
                  href="tel:+78001012009"
                  className="inline-flex items-center gap-2 px-6 py-3"
                  style={{
                    background: "transparent",
                    color: "#1A1A2E",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 600,
                    fontSize: "1rem",
                    letterSpacing: "0.06em",
                    textDecoration: "none",
                    border: "1px solid rgba(26,26,46,0.2)",
                    borderRadius: "0.5rem",
                  }}
                >
                  <Phone size={16} style={{ color: "#ED1C24" }} />
                  8(800)101-2009
                </a>
              </div>
            </div>
          </div>

          {/* Popular sections */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Building2 size={16} style={{ color: "#ED1C24" }} />
              <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,26,46,0.4)" }}>
                Популярные разделы
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {popularPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div
                    className="flex items-center justify-between p-4 group"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(26,26,46,0.08)",
                      borderRadius: "0.75rem",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(237,28,36,0.25)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(237,28,36,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.08)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    <div>
                      <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A1A2E", lineHeight: 1.2, marginBottom: "0.2rem" }}>
                        {p.label}
                      </p>
                      <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem", color: "#ED1C24", letterSpacing: "0.04em" }}>
                        {p.desc}
                      </p>
                    </div>
                    <ArrowRight size={16} style={{ color: "#ED1C24", flexShrink: 0, marginLeft: "0.5rem" }} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Blog link */}
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <Link
                href="/blog"
                style={{ textDecoration: "none", display: "block" }}
                onClick={() => {
                  ymGoal("404_nav", { target: "blog" });
                  gaEvent("404_nav", { target: "blog" });
                }}
              >
                <div
                  className="flex items-center justify-between p-4"
                  style={{
                    background: "#1A1A2E",
                    borderRadius: "0.75rem",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "0.9")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "1")}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen size={18} style={{ color: "#ED1C24" }} />
                    <div>
                      <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#FFFFFF", lineHeight: 1.2 }}>
                        Блог Freonn
                      </p>
                      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.8rem", color: "rgba(255,255,255,0.45)" }}>
                        12 статей о строительстве промышленных зданий
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: "#ED1C24", flexShrink: 0 }} />
                </div>
              </Link>
              <Link
                href="/zdaniya"
                style={{ textDecoration: "none", display: "block" }}
                onClick={() => {
                  ymGoal("404_nav", { target: "zdaniya" });
                  gaEvent("404_nav", { target: "zdaniya" });
                }}
              >
                <div
                  className="flex items-center justify-between p-4 h-full"
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid rgba(26,26,46,0.08)",
                    borderRadius: "0.75rem",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(237,28,36,0.25)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.08)")}
                >
                  <div className="flex items-center gap-3">
                    <Building2 size={18} style={{ color: "#ED1C24" }} />
                    <div>
                      <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1A1A2E", lineHeight: 1.2 }}>
                        Каталог типов зданий
                      </p>
                      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.8rem", color: "rgba(26,26,46,0.45)" }}>
                        Все позиции калькулятора с карточками
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: "#ED1C24", flexShrink: 0 }} />
                </div>
              </Link>
              <Link
                href="/#calculator"
                style={{ textDecoration: "none", display: "block" }}
                className="sm:col-span-2"
                onClick={() => {
                  ymGoal("404_nav", { target: "calculator" });
                  gaEvent("404_nav", { target: "calculator" });
                }}
              >
                <div
                  className="flex items-center justify-between p-4"
                  style={{
                    background: "rgba(26,26,46,0.04)",
                    border: "1px solid rgba(26,26,46,0.1)",
                    borderRadius: "0.75rem",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Calculator size={18} style={{ color: "#ED1C24" }} />
                    <div>
                      <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1A1A2E", lineHeight: 1.2 }}>
                        Калькулятор стоимости
                      </p>
                      <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.8rem", color: "rgba(26,26,46,0.45)" }}>
                        Ориентир по размерам и региону
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: "#ED1C24", flexShrink: 0 }} />
                </div>
              </Link>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

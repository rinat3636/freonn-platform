/*
 * FREONN PRO HEADER — Clean Industrial
 * Logo left · Nav center · Phone + CTA right
 * Transparent → frosted glass on scroll
 */
import { useState, useEffect, type CSSProperties, type MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Menu, X, ChevronDown, ExternalLink } from "lucide-react";
import UnifiedAccountBanner from "@/components/freonn-group/UnifiedAccountBanner";
import { AuthNavActions } from "@/components/freonn-group/AuthNavActions";
import { isFreonnAuthNavVisible } from "@/lib/freonn-group/config";
import { Link, useLocation } from "wouter";
import { MO_HUB_SLUG } from "@shared/moSeo";
import FreonnLogo from "./FreonnLogo";
import { ymGoal } from "../lib/ym";
import TenderButton from "./TenderButton";

/** Якоря главной: на других маршрутах секций нет — переходим на `/` и прокручиваем после загрузки. */
function isSpaPathHref(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

const HOME_ONLY_ANCHORS = new Set([
  "#hero",
  "#about",
  "#services",
  "#advantages",
  "#projects",
  "#process",
  "#calculator",
  "#pricing",
  "#faq",
  "#group",
  "#contact",
]);

/** Дочерние ссылки: путь `/…` — переход на SEO-лендинг; `#…` — якорь на главной */
const navItems = [
  { label: "О компании", href: "#about" },
  {
    label: "Здания",
    href: "#services",
    children: [
      { label: "Ангары", href: "/angary" },
      { label: "Холодные ангары", href: "/angary/holodnye" },
      { label: "Тёплые ангары", href: "/angary/teplye" },
      { label: "Склады", href: "/sklady" },
      { label: "Склад класса A", href: "/sklady/klass-a" },
      { label: "Производственные здания", href: "/proizvodstvennye-zdaniya" },
      { label: "Быстровозводимые здания", href: "/bystrovozvodimye-zdaniya" },
      { label: "Сэндвич-панели", href: "/sendvich-paneli" },
      { label: "С/х здания", href: "/selskokhozyaystvennye-zdaniya" },
      { label: "Торговые здания", href: "/torgovye-zdaniya" },
      { label: "Спортивные сооружения", href: "/sportivnye-sooruzheniya" },
      { label: "Ангар 1000 м²", href: "/angar-1000-m2" },
      { label: "Склад 2000 м²", href: "/sklad-2000-m2" },
      { label: "Московская область", href: MO_HUB_SLUG },
      { label: "Каталог типов (A–Я)", href: "/zdaniya", isLink: true },
    ],
  },
  { label: "Цены", href: "#pricing" },
  { label: "Калькулятор", href: "#calculator" },
  { label: "Объекты", href: "#projects" },
  { label: "Этапы", href: "#process" },
  { label: "Блог", href: "/blog", isLink: true },
  { label: "Контакты", href: "#contact" },
];

export default function Header() {
  const [loc, setLocation] = useLocation();
  const showFreonnAuth = isFreonnAuthNavVisible();
  const headerTop = showFreonnAuth ? 36 : 0;
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    setOpenDropdown(null);
    if (!href.startsWith("#")) return;
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (HOME_ONLY_ANCHORS.has(href) && loc !== "/") {
      try {
        sessionStorage.setItem("freonn:pendingScroll", href);
      } catch {
        /* ignore */
      }
      setLocation("/");
    }
  };

  return (
    <>
      {showFreonnAuth ? (
        <div className="fixed inset-x-0 top-0 z-[60]">
          <UnifiedAccountBanner />
        </div>
      ) : null}
      <motion.header
        className="fixed inset-x-0 z-50 w-full max-w-[100%]"
        style={{
          top: headerTop,
          background: scrolled ? "rgba(255,255,255,0.94)" : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(26,26,46,0.08)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.06)" : "none",
          transition: "background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, backdrop-filter 0.22s ease",
        }}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <div className="container">
          {/* ─── Single row: Logo | Nav | Right ─── */}
          <div
            className="flex w-full min-w-0 items-center"
            style={{
              height: "68px",
            }}
          >
            {/* ── Logo ── */}
            <button
              type="button"
              className="shrink-0"
              onClick={() => scrollTo("#hero")}
              aria-label="Freonn PRO — перейти на главную"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                flexShrink: 0,
                marginTop: "10px", /* offset for PRO badge */
              }}
            >
              <FreonnLogo height={34} />
            </button>

            {/* ── Desktop Nav (centered) ── */}
            <nav
              className="hidden min-w-0 flex-1 lg:flex"
              aria-label="Основная навигация"
              style={{
                flexBasis: 0,
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                paddingRight: "16px",
              }}
            >
              {navItems.map((item) => (
                <div
                  key={item.label}
                  style={{ position: "relative" }}
                  onMouseEnter={() =>
                    item.children && setOpenDropdown(item.label)
                  }
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  {item.isLink ? (
                    <Link
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                        padding: "8px 12px",
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 600,
                        fontSize: "0.78rem",
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        color: "rgba(26,26,46,0.65)",
                        transition: "color 0.18s",
                        whiteSpace: "nowrap",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "#ED1C24")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(26,26,46,0.65)")
                      }
                    >
                      {item.label}
                    </Link>
                  ) : (
                  <button
                    onClick={() => scrollTo(item.href)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      padding: "8px 12px",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "rgba(26,26,46,0.65)",
                      transition: "color 0.18s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#ED1C24")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "rgba(26,26,46,0.65)")
                    }
                  >
                    {item.label}
                    {item.children && (
                      <ChevronDown
                        size={11}
                        style={{ opacity: 0.6, marginTop: "1px" }}
                      />
                    )}
                  </button>
                  )}

                  {/* Dropdown */}
                  <AnimatePresence>
                    {item.children && openDropdown === item.label && (
                      <motion.div
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: "50%",
                          transform: "translateX(-50%)",
                          paddingTop: "8px",
                          zIndex: 100,
                        }}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div
                          style={{
                            background: "rgba(255,255,255,0.99)",
                            border: "1px solid rgba(26,26,46,0.09)",
                            borderRadius: "14px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                            backdropFilter: "blur(20px)",
                            padding: "8px 0",
                            minWidth: "210px",
                          }}
                        >
                          {item.children.map((child) => {
                            const childStyle: CSSProperties = {
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              padding: "9px 18px",
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontFamily: "Barlow Condensed, sans-serif",
                              fontWeight: 500,
                              fontSize: "0.78rem",
                              letterSpacing: "0.07em",
                              textTransform: "uppercase",
                              color: "rgba(26,26,46,0.6)",
                              transition: "color 0.15s, background 0.15s",
                              textDecoration: "none",
                              boxSizing: "border-box",
                            };
                            const hoverIn = (e: MouseEvent<HTMLElement>) => {
                              e.currentTarget.style.color = "#ED1C24";
                              e.currentTarget.style.background = "rgba(237,28,36,0.05)";
                            };
                            const hoverOut = (e: MouseEvent<HTMLElement>) => {
                              e.currentTarget.style.color = "rgba(26,26,46,0.6)";
                              e.currentTarget.style.background = "transparent";
                            };
                            if (isSpaPathHref(child.href)) {
                              return (
                                <Link
                                  key={child.label}
                                  href={child.href}
                                  onClick={() => setOpenDropdown(null)}
                                  style={childStyle}
                                  onMouseEnter={hoverIn}
                                  onMouseLeave={hoverOut}
                                >
                                  {child.label}
                                </Link>
                              );
                            }
                            return (
                              <button
                                key={child.label}
                                type="button"
                                onClick={() => {
                                  setOpenDropdown(null);
                                  scrollTo(child.href);
                                }}
                                style={childStyle}
                                onMouseEnter={hoverIn}
                                onMouseLeave={hoverOut}
                              >
                                {child.label}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* ── Right: phone + CTA (desktop) ── */}
            <div className="hidden shrink-0 items-center gap-3 lg:flex" style={{ marginLeft: "48px" }}>
              {/* Phone */}
              <a
                href="tel:+78001012009"
                onClick={() => ymGoal("phone_click", { source: "header" })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  padding: "8px 12px",
                  minWidth: "24px",
                  minHeight: "24px",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  letterSpacing: "0.04em",
                  color: "#1A1A2E",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "color 0.18s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#ED1C24")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#1A1A2E")
                }
              >
                <Phone size={13} style={{ color: "#ED1C24", flexShrink: 0 }} />
                8(800)101-2009
              </a>

              {/* CTA */}
              <button
                onClick={() => scrollTo("#calculator")}
                className="ms-btn-primary"
                style={{ fontSize: "0.72rem", padding: "9px 18px" }}
              >
                Расчёт стоимости
              </button>

              {showFreonnAuth ? <AuthNavActions /> : null}

              <TenderButton variant="outline-dark" size="sm" />
            </div>

            {/* ── Mobile controls ── */}
            <div
              className="flex items-center gap-2 lg:hidden"
              style={{ marginLeft: "auto" }}
            >
              {showFreonnAuth ? <AuthNavActions className="scale-[0.85] gap-1" /> : null}
              <button
                onClick={() => scrollTo("#contact")}
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#ED1C24",
                  border: "2px solid #ED1C24",
                  borderRadius: "2rem",
                  background: "transparent",
                  padding: "6px 16px",
                  cursor: "pointer",
                  transition: "background 0.18s, color 0.18s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#ED1C24";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "#ED1C24";
                }}
              >
                ЗАЯВКА
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  padding: "6px",
                  cursor: "pointer",
                  color: "#1A1A2E",
                }}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Закрыть меню" : "Открыть меню"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* ─── Mobile menu ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(255,255,255,0.98)",
                backdropFilter: "blur(20px)",
              }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              style={{
                position: "relative",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                height: "100%",
                paddingTop: "80px",
                paddingBottom: "32px",
                paddingLeft: "24px",
                paddingRight: "24px",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <nav
                id="mobile-nav"
                style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}
                aria-label="Мобильная навигация"
              >
                {navItems.map((item, i) => {
                  const delay = { delay: i * 0.05 };
                  if (item.isLink) {
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={delay}
                        style={{ borderBottom: "1px solid rgba(26,26,46,0.08)" }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          style={{
                            display: "block",
                            padding: "16px 0",
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 700,
                            fontSize: "1.4rem",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "rgba(26,26,46,0.85)",
                            textDecoration: "none",
                          }}
                        >
                          {item.label}
                        </Link>
                      </motion.div>
                    );
                  }
                  if (item.children) {
                    return (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={delay}
                        style={{ borderBottom: "1px solid rgba(26,26,46,0.08)", paddingBottom: "8px" }}
                      >
                        <button
                          type="button"
                          onClick={() => scrollTo(item.href)}
                          style={{
                            textAlign: "left",
                            padding: "16px 0 8px",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 700,
                            fontSize: "1.4rem",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "rgba(26,26,46,0.85)",
                            width: "100%",
                          }}
                        >
                          {item.label}
                        </button>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "4px" }}>
                          {item.children.map((child) =>
                            isSpaPathHref(child.href) ? (
                              <Link
                                key={child.label}
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                style={{
                                  display: "block",
                                  padding: "10px 0 10px 12px",
                                  fontFamily: "Barlow Condensed, sans-serif",
                                  fontWeight: 600,
                                  fontSize: "1rem",
                                  letterSpacing: "0.05em",
                                  textTransform: "uppercase",
                                  color: "rgba(26,26,46,0.55)",
                                  textDecoration: "none",
                                  borderLeft: "2px solid rgba(237,28,36,0.35)",
                                }}
                              >
                                {child.label}
                              </Link>
                            ) : (
                              <button
                                key={child.label}
                                type="button"
                                onClick={() => {
                                  setMobileOpen(false);
                                  scrollTo(child.href);
                                }}
                                style={{
                                  display: "block",
                                  width: "100%",
                                  textAlign: "left",
                                  padding: "10px 0 10px 12px",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontFamily: "Barlow Condensed, sans-serif",
                                  fontWeight: 600,
                                  fontSize: "1rem",
                                  letterSpacing: "0.05em",
                                  textTransform: "uppercase",
                                  color: "rgba(26,26,46,0.55)",
                                  borderLeft: "2px solid rgba(26,26,46,0.12)",
                                }}
                              >
                                {child.label}
                              </button>
                            ),
                          )}
                        </div>
                      </motion.div>
                    );
                  }
                  return (
                    <motion.button
                      key={item.label}
                      type="button"
                      onClick={() => scrollTo(item.href)}
                      style={{
                        textAlign: "left",
                        padding: "16px 0",
                        background: "none",
                        border: "none",
                        borderBottom: "1px solid rgba(26,26,46,0.08)",
                        cursor: "pointer",
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        fontSize: "1.4rem",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "rgba(26,26,46,0.85)",
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={delay}
                    >
                      {item.label}
                    </motion.button>
                  );
                })}
              </nav>

              {showFreonnAuth ? (
                <div style={{ marginTop: "16px", padding: "0 4px" }}>
                  <AuthNavActions variant="stack" onNavigate={() => setMobileOpen(false)} />
                </div>
              ) : null}

              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <a
                  href="tel:+78001012009"
                  onClick={() => ymGoal("phone_click", { source: "header_mobile" })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.2rem",
                    color: "#1A1A2E",
                    textDecoration: "none",
                  }}
                >
                  <Phone size={18} style={{ color: "#ED1C24" }} />
                  8(800)101-2009
                </a>
                <button
                  onClick={() => scrollTo("#calculator")}
                  className="ms-btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Рассчитать стоимость
                </button>
                <TenderButton
                  variant="outline-dark"
                  size="md"
                  className="w-full justify-center"
                />
                <a
                  href="https://max.ru/id3604084591_biz"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "12px",
                    background: "rgba(237,28,36,0.08)",
                    border: "1px solid rgba(237,28,36,0.3)",
                    borderRadius: "999px",
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#ED1C24",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={11} />
                  Наши работы на MAX
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

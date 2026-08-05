import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, ChevronRight, BookOpen, ArrowRight, Search } from "lucide-react";
import { presentationBlogIndex } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { syncStandardPageHead } from "@/lib/syncStandardPageHead";
import { blogPosts, blogCategories } from "@/data/blogPosts";
import { landingPages } from "@/data/landingPages";
import { ymGoal } from "@/lib/ym";
import { gaEvent } from "@/lib/ga";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

const POSTS_PER_PAGE = 9;

export default function BlogListPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Все");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("q")?.trim() ?? ""
      : "",
  );
  const [searchDraft, setSearchDraft] = useState(searchQuery);

  useEffect(() => {
    const syncFromUrl = () => {
      const q = new URLSearchParams(window.location.search).get("q")?.trim() ?? "";
      setSearchQuery(q);
      setSearchDraft(q);
      setPage(1);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  useEffect(() => {
    clearRoutePageJsonLd();
    const head = presentationBlogIndex();
    syncStandardPageHead(head);

    const script = document.createElement("script");
    script.id = "ld-blog";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Блог Freonn",
      "url": "https://freonn.pro/blog",
      "description": head.description,
      "publisher": { "@type": "Organization", "name": "Freonn", "url": "https://freonn.pro" },
    });
    document.head.appendChild(script);
    return () => { document.getElementById("ld-blog")?.remove(); };
  }, []);

  const categories = ["Все", ...blogCategories];
  const filtered = useMemo(() => {
    let list = activeCategory === "Все" ? blogPosts : blogPosts.filter((p) => p.category === activeCategory);
    const q = searchQuery.toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.h1.toLowerCase().includes(q) ||
        p.metaDescription.toLowerCase().includes(q) ||
        p.intro.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [activeCategory, searchQuery]);
  const total = Math.ceil(filtered.length / POSTS_PER_PAGE);
  const visible = filtered.slice(0, page * POSTS_PER_PAGE);

  return (
    <div className="min-h-screen" style={{ background: "#F8F8F8" }}>
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16" style={{ background: "#1A1A2E" }}>
        <div className="container">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>
              <li><Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Главная</Link></li>
              <li><ChevronRight size={10} /></li>
              <li style={{ color: "rgba(255,255,255,0.7)" }}>Блог</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={20} style={{ color: "#ED1C24" }} />
            <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>
              Экспертные материалы
            </span>
          </div>
          <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#FFFFFF", lineHeight: 1, letterSpacing: "0.02em", marginBottom: "1rem" }}>
            Блог Freonn
          </h1>
          <p style={{ fontFamily: "Barlow Condensed, sans-serif", fontSize: "1.15rem", color: "rgba(255,255,255,0.6)", maxWidth: "560px" }}>
            Цены, технологии, документы и советы по строительству промышленных зданий от практикующих инженеров
          </p>
          <form
            className="mt-8 flex flex-wrap gap-2 max-w-xl"
            role="search"
            aria-label="Поиск по блогу"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = searchDraft.trim();
              const path = trimmed ? `/blog?q=${encodeURIComponent(trimmed)}` : "/blog";
              window.history.replaceState(null, "", path);
              setSearchQuery(trimmed);
              setPage(1);
            }}
          >
            <input
              type="search"
              name="q"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Поиск по статьям…"
              className="flex-1 min-w-[200px] px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/35 outline-none focus:border-red-500/50"
              style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.95rem" }}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-500 border-0 cursor-pointer"
              style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.04em" }}
            >
              <Search size={18} />
              Найти
            </button>
          </form>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6" style={{ background: "#FFFFFF", borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
        <div className="container">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setPage(1);
                  window.history.replaceState(null, "", "/blog");
                  setSearchQuery("");
                  setSearchDraft("");
                }}
                className="px-4 py-2 rounded-full transition-all"
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.04em",
                  background: activeCategory === cat ? "#ED1C24" : "rgba(26,26,46,0.05)",
                  color: activeCategory === cat ? "#FFFFFF" : "rgba(26,26,46,0.7)",
                  border: activeCategory === cat ? "none" : "1px solid rgba(26,26,46,0.1)",
                  cursor: "pointer",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Внутренняя перелинковка на коммерческие URL (SEO + пользователи) */}
      <section className="py-8" style={{ background: "#F4F5F7", borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
        <div className="container">
          <p
            className="mb-3"
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(26,26,46,0.45)",
            }}
          >
            Разделы сайта
          </p>
          <div className="flex flex-wrap gap-2">
            {landingPages.map((p) => (
              <Link
                key={p.slug}
                href={p.slug}
                className="inline-block px-3 py-2 rounded-lg transition-colors"
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.04em",
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,26,46,0.1)",
                  color: "rgba(26,26,46,0.75)",
                  textDecoration: "none",
                }}
                onClick={() => {
                  ymGoal("cross_nav_chip", { source: "blog_list", href: p.slug });
                  gaEvent("cross_nav_chip", { source: "blog_list", href: p.slug });
                }}
              >
                {p.breadcrumb}
              </Link>
            ))}
            {[
              { href: "/portfolio", label: "Портфолио" },
              { href: "/zdaniya", label: "Типы зданий" },
              { href: "/tseny", label: "Цены" },
              { href: "/kontakty", label: "Контакты" },
            ].map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="inline-block px-3 py-2 rounded-lg transition-colors"
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  letterSpacing: "0.04em",
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,26,46,0.1)",
                  color: "rgba(26,26,46,0.75)",
                  textDecoration: "none",
                }}
                onClick={() => {
                  ymGoal("cross_nav_chip", { source: "blog_list", href: x.href });
                  gaEvent("cross_nav_chip", { source: "blog_list", href: x.href });
                }}
              >
                {x.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 9) * 0.05 }}
                className="group"
              >
                <Link href={post.slug} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    className="h-full flex flex-col"
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid rgba(26,26,46,0.08)",
                      borderRadius: "1rem",
                      overflow: "hidden",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(237,28,36,0.3)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 24px rgba(237,28,36,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(26,26,46,0.08)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Category bar */}
                    <div style={{ background: "#ED1C24", height: "3px" }} />

                    <div className="p-6 flex flex-col flex-1">
                      {/* Category + read time */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "0.6rem",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "#ED1C24",
                            background: "rgba(237,28,36,0.08)",
                            padding: "2px 8px",
                            borderRadius: "4px",
                          }}
                        >
                          {post.category}
                        </span>
                        <span
                          className="flex items-center gap-1"
                          style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem", color: "rgba(26,26,46,0.4)" }}
                        >
                          <Clock size={10} />
                          {post.readTime} мин
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        className="mb-3 group-hover:text-red-600 transition-colors"
                        style={{
                          fontFamily: "Barlow Condensed, sans-serif",
                          fontWeight: 700,
                          fontSize: "1.15rem",
                          color: "#1A1A2E",
                          lineHeight: 1.3,
                        }}
                      >
                        {post.h1}
                      </h2>

                      {/* Intro */}
                      <p
                        className="flex-1 mb-4"
                        style={{
                          fontFamily: "Barlow, sans-serif",
                          fontSize: "0.875rem",
                          color: "rgba(26,26,46,0.65)",
                          lineHeight: 1.6,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        } as React.CSSProperties}
                      >
                        {post.intro}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontFamily: "IBM Plex Mono, monospace",
                              fontSize: "0.55rem",
                              letterSpacing: "0.06em",
                              color: "rgba(26,26,46,0.4)",
                              background: "rgba(26,26,46,0.04)",
                              padding: "2px 6px",
                              borderRadius: "3px",
                            }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: "0.6rem",
                            color: "rgba(26,26,46,0.35)",
                          }}
                        >
                          {new Date(post.updateDate || post.publishDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        <span
                          className="flex items-center gap-1 group-hover:gap-2 transition-all"
                          style={{
                            fontFamily: "Barlow Condensed, sans-serif",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            color: "#ED1C24",
                          }}
                        >
                          Читать <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Load more */}
          {page < total && (
            <div className="text-center mt-12">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-8 py-4"
                style={{
                  background: "transparent",
                  border: "2px solid rgba(26,26,46,0.2)",
                  borderRadius: "0.5rem",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "1rem",
                  letterSpacing: "0.06em",
                  color: "#1A1A2E",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ED1C24")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(26,26,46,0.2)")}
              >
                Загрузить ещё ({filtered.length - visible.length} статей)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16" style={{ background: "#1A1A2E" }}>
        <div className="container text-center">
          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "1rem" }}>
            Нужна консультация эксперта?
          </p>
          <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#FFFFFF", letterSpacing: "0.04em", marginBottom: "1rem" }}>
            Рассчитаем стоимость вашего объекта
          </h2>
          <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.6)", marginBottom: "2rem" }}>
            Бесплатный расчёт за 1 рабочий день
          </p>
          <Link
            href="/#contact"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "#ED1C24",
              color: "#FFFFFF",
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.06em",
              padding: "16px 40px",
              borderRadius: "0.5rem",
              textDecoration: "none",
            }}
          >
            Получить расчёт <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
      <FloatingButtons />
    </div>
  );
}

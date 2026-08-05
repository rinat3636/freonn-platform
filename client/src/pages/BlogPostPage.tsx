import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, Calendar, ChevronRight, ArrowRight, ChevronDown, Phone } from "lucide-react";
import { presentationBlogPost } from "@shared/seoPagePresentation";
import { clearRoutePageJsonLd } from "@/lib/seoJsonLdDom";
import { getBlogArticleAuthor, getBlogBySlug, getRelatedPosts } from "@/data/blogPosts";
import type { BlogSection } from "@/data/blogPosts";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

function Section({ s }: { s: BlogSection }) {
  const base: React.CSSProperties = { fontFamily: "Barlow, sans-serif" };

  if (s.type === "h2") {
    return (
      <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", color: "#1A1A2E", letterSpacing: "0.02em", marginTop: "2.5rem", marginBottom: "1rem" }}>
        {s.content}
      </h2>
    );
  }
  if (s.type === "h3") {
    return (
      <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#1A1A2E", marginTop: "1.75rem", marginBottom: "0.75rem" }}>
        {s.content}
      </h3>
    );
  }
  if (s.type === "p") {
    return (
      <p style={{ ...base, fontSize: "1rem", color: "rgba(26,26,46,0.8)", lineHeight: 1.8, marginBottom: "1rem" }}>
        {s.content}
      </p>
    );
  }
  if (s.type === "ul") {
    return (
      <ul className="space-y-2 mb-4" style={{ paddingLeft: "0" }}>
        {s.items?.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ED1C24", flexShrink: 0, marginTop: "9px" }} />
            <span style={{ ...base, fontSize: "0.95rem", color: "rgba(26,26,46,0.8)", lineHeight: 1.7 }}>{item}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (s.type === "ol") {
    return (
      <ol className="space-y-2 mb-4" style={{ paddingLeft: "0", counterReset: "ol-counter" }}>
        {s.items?.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              style={{
                minWidth: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#ED1C24",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 700,
                fontFamily: "IBM Plex Mono, monospace",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              {i + 1}
            </span>
            <span style={{ ...base, fontSize: "0.95rem", color: "rgba(26,26,46,0.8)", lineHeight: 1.7 }}>{item}</span>
          </li>
        ))}
      </ol>
    );
  }
  if (s.type === "table") {
    return (
      <div className="overflow-x-auto mb-6 rounded-xl" style={{ border: "1px solid rgba(26,26,46,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1A1A2E" }}>
              {s.headers?.map((h) => (
                <th
                  key={h}
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    letterSpacing: "0.04em",
                    color: "#FFFFFF",
                    padding: "10px 14px",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {s.rows?.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? "#FFFFFF" : "rgba(26,26,46,0.02)" }}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      fontFamily: ci === 0 ? "Barlow Condensed, sans-serif" : "Barlow, sans-serif",
                      fontWeight: ci === 0 ? 600 : 400,
                      fontSize: "0.875rem",
                      color: ci === 0 ? "#1A1A2E" : "rgba(26,26,46,0.75)",
                      padding: "9px 14px",
                      borderBottom: "1px solid rgba(26,26,46,0.06)",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (s.type === "callout") {
    return (
      <div
        className="my-6 p-5 rounded-xl flex items-start gap-4"
        style={{ background: "rgba(237,28,36,0.06)", border: "1px solid rgba(237,28,36,0.2)" }}
      >
        <div style={{ width: "4px", background: "#ED1C24", borderRadius: "2px", minHeight: "48px", flexShrink: 0 }} />
        <p style={{ ...base, fontSize: "0.95rem", color: "#1A1A2E", lineHeight: 1.7, margin: 0 }}>{s.content}</p>
      </div>
    );
  }
  return null;
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(26,26,46,0.08)" }}>
      <button
        className="w-full text-left py-4 flex items-center justify-between gap-4"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: "1rem", color: "#1A1A2E" }}>
          {q}
        </span>
        <ChevronDown size={18} style={{ color: "#ED1C24", flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </button>
      {open && (
        <p className="pb-4" style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.9rem", color: "rgba(26,26,46,0.7)", lineHeight: 1.7 }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params ? `/blog/${params.slug}` : "";
  const post = getBlogBySlug(slug);
  const related = post ? getRelatedPosts(post.relatedPosts) : [];

  useEffect(() => {
    if (!post) return;
    clearRoutePageJsonLd();
    const head = presentationBlogPost(post);
    document.title = head.title;

    const setMeta = (attr: string, val: string, attrName = "name") => {
      let el = document.querySelector(`meta[${attrName}="${attr}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute(attrName, attr); document.head.appendChild(el); }
      el.content = val;
    };

    setMeta("description", head.description);
    setMeta("keywords", post.tags.join(", "));

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) canonical.href = `https://freonn.pro${post.slug}`;

    // Open Graph — тип article для Яндекс и ВКонтакте
    setMeta("og:type", "article", "property");
    setMeta("og:title", head.title, "property");
    setMeta("og:description", head.description, "property");
    setMeta("og:url", `https://freonn.pro${post.slug}`, "property");
    setMeta("og:image", "https://freonn.pro/og-image.jpg", "property");
    setMeta("og:image:secure_url", "https://freonn.pro/og-image.jpg", "property");
    setMeta("og:image:type", "image/jpeg", "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("og:locale", "ru_RU", "property");
    setMeta("og:site_name", "Freonn", "property");

    // og:article — Яндекс использует для определения типа контента
    setMeta("article:published_time", post.publishDate, "property");
    setMeta("article:modified_time", post.updateDate || post.publishDate, "property");
    const auth = getBlogArticleAuthor(post);
    setMeta("article:author", auth.name, "property");
    setMeta("article:section", post.category, "property");
    post.tags.forEach((tag, i) => {
      let el = document.querySelector(`meta[property="article:tag"][data-idx="${i}"]`) as HTMLMetaElement | null;
      if (!el) { el = document.createElement("meta"); el.setAttribute("property", "article:tag"); el.setAttribute("data-idx", String(i)); document.head.appendChild(el); }
      el.content = tag;
    });

    // Twitter / VK
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", head.title);
    setMeta("twitter:description", head.description);
    setMeta("twitter:image", "https://freonn.pro/og-image.jpg");

    const script = document.createElement("script");
    script.id = "ld-post";
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": post.h1,
          "description": head.description,
          "datePublished": post.publishDate,
          "dateModified": post.updateDate || post.publishDate,
          "author": {
            "@type": "Person",
            "name": auth.name,
            "jobTitle": auth.jobTitle,
            "worksFor": { "@type": "Organization", "name": "Freonn", "url": "https://freonn.pro" },
          },
          "publisher": {
            "@type": "Organization",
            "name": "Freonn",
            "logo": { "@type": "ImageObject", "url": "https://freonn.pro/apple-touch-icon.png" },
          },
          "mainEntityOfPage": { "@type": "WebPage", "@id": `https://freonn.pro${post.slug}` },
          "image": "https://freonn.pro/og-image.jpg",
          "keywords": post.tags.join(", "),
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://freonn.pro" },
            { "@type": "ListItem", "position": 2, "name": "Блог", "item": "https://freonn.pro/blog" },
            { "@type": "ListItem", "position": 3, "name": post.h1, "item": `https://freonn.pro${post.slug}` },
          ],
        },
        ...(post.faqs.length > 0 ? [{
          "@type": "FAQPage",
          "mainEntity": post.faqs.map((f) => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": { "@type": "Answer", "text": f.a },
          })),
        }] : []),
      ],
    });
    document.head.appendChild(script);
    return () => { document.getElementById("ld-post")?.remove(); };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: "#F8F8F8" }}>
        <h1 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "2rem", color: "#1A1A2E", marginBottom: "1rem" }}>
          Статья не найдена
        </h1>
        <Link href="/blog" style={{ color: "#ED1C24" }}>← Вернуться в блог</Link>
      </div>
    );
  }

  const articleAuthor = getBlogArticleAuthor(post);

  return (
    <div className="min-h-screen" style={{ background: "#F8F8F8" }}>
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-12" style={{ background: "#1A1A2E" }}>
        <div className="container max-w-4xl mx-auto">
          <nav aria-label="Хлебные крошки" className="mb-6">
            <ol className="flex items-center gap-2 flex-wrap" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>
              <li><Link href="/" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Главная</Link></li>
              <li><ChevronRight size={10} /></li>
              <li><Link href="/blog" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Блог</Link></li>
              <li><ChevronRight size={10} /></li>
              <li style={{ color: "rgba(255,255,255,0.6)" }}>{post.category}</li>
            </ol>
          </nav>

          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <span
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#ED1C24",
                background: "rgba(237,28,36,0.15)",
                padding: "3px 10px",
                borderRadius: "4px",
              }}
            >
              {post.category}
            </span>
            <span className="flex items-center gap-1" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>
              <Clock size={10} /> {post.readTime} мин чтения
            </span>
            <span className="flex items-center gap-1" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>
              <Calendar size={10} />
              {new Date(post.updateDate || post.publishDate).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#FFFFFF", lineHeight: 1.05, letterSpacing: "0.02em", marginBottom: "1.25rem" }}
          >
            {post.h1}
          </motion.h1>

          <p
            className="mb-3"
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.88rem",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{articleAuthor.name}</span>
            {" — "}
            {articleAuthor.jobTitle}
          </p>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontFamily: "Barlow, sans-serif", fontSize: "1.05rem", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: "680px" }}
          >
            {post.intro}
          </motion.p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "IBM Plex Mono, monospace",
                  fontSize: "0.55rem",
                  letterSpacing: "0.08em",
                  color: "rgba(255,255,255,0.4)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "3px 8px",
                  borderRadius: "4px",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Article body */}
      <section className="py-12">
        <div className="container max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Main content */}
            <article className="lg:col-span-2">
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: "1rem",
                  padding: "clamp(1.5rem, 4vw, 2.5rem)",
                  border: "1px solid rgba(26,26,46,0.07)",
                }}
              >
                {post.sections.map((s, i) => (
                  <Section key={i} s={s} />
                ))}
              </div>

              {/* FAQ */}
              {post.faqs.length > 0 && (
                <div
                  className="mt-8"
                  style={{
                    background: "#FFFFFF",
                    borderRadius: "1rem",
                    padding: "clamp(1.5rem, 4vw, 2rem)",
                    border: "1px solid rgba(26,26,46,0.07)",
                  }}
                >
                  <h2 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.75rem", color: "#1A1A2E", letterSpacing: "0.04em", marginBottom: "1.5rem" }}>
                    Часто задаваемые вопросы
                  </h2>
                  {post.faqs.map((faq) => (
                    <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                  ))}
                </div>
              )}
            </article>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* CTA card */}
              <div
                style={{
                  background: "#ED1C24",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  position: "sticky",
                  top: "100px",
                }}
              >
                <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: "0.75rem" }}>
                  Бесплатная консультация
                </p>
                <h3 style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.5rem", color: "#FFFFFF", letterSpacing: "0.04em", marginBottom: "0.75rem", lineHeight: 1.1 }}>
                  Рассчитаем стоимость вашего объекта
                </h3>
                <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.8)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                  Ответим за 15 минут, расчёт — за 1 рабочий день
                </p>
                <a
                  href="tel:+78001012009"
                  className="flex items-center gap-2 mb-3 px-4 py-3 rounded-lg"
                  style={{ background: "#FFFFFF", color: "#ED1C24", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "0.04em", textDecoration: "none" }}
                >
                  <Phone size={16} /> 8(800)101-2009
                </a>
                <Link
                  href="/#contact"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#FFFFFF", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: "0.95rem", textDecoration: "none", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  Оставить заявку <ArrowRight size={14} />
                </Link>
              </div>

              {/* Related posts */}
              {related.length > 0 && (
                <div style={{ background: "#FFFFFF", borderRadius: "1rem", padding: "1.5rem", border: "1px solid rgba(26,26,46,0.07)" }}>
                  <h3 style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#1A1A2E", letterSpacing: "0.04em", marginBottom: "1rem", textTransform: "uppercase" }}>
                    Читайте также
                  </h3>
                  <div className="space-y-3">
                    {related.map((rel) => (
                      <Link
                        key={rel.slug}
                        href={rel.slug}
                        className="flex items-start gap-2 group"
                        style={{ textDecoration: "none" }}
                      >
                        <div style={{ width: "3px", background: "#ED1C24", borderRadius: "2px", height: "40px", flexShrink: 0, marginTop: "3px" }} />
                        <span
                          style={{
                            fontFamily: "Barlow, sans-serif",
                            fontSize: "0.875rem",
                            color: "rgba(26,26,46,0.75)",
                            lineHeight: 1.4,
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#ED1C24")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(26,26,46,0.75)")}
                        >
                          {rel.h1}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Back to blog */}
              <Link
                href="/blog"
                className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg"
                style={{
                  background: "rgba(26,26,46,0.05)",
                  border: "1px solid rgba(26,26,46,0.1)",
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "rgba(26,26,46,0.6)",
                  textDecoration: "none",
                }}
              >
                ← Все статьи блога
              </Link>
            </aside>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingButtons />
    </div>
  );
}

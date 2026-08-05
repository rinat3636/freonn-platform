/*
 * METALSTROY SERVICES SECTION — What We Build
 * 3D render cards with rounded corners, dark industrial style
 * SEO: each card links to its dedicated landing page
 */
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

/** WebP ≤1200px (pnpm run images:optimize), same-origin. */
const IMG_ANGAR = "/images/home/angar.webp";
const IMG_SKLAD = "/images/home/sklad.webp";
const IMG_PRODUCTION = "/images/home/production.webp";
const IMG_NAVES = "/images/home/naves.webp";
const IMG_AGRO = "/images/home/agro.webp";
const IMG_TRADE = "/images/home/trade.webp";

function srcSetFor(base: string): string {
  const root = base.replace(/\.webp$/, "");
  return `${root}-400.webp 400w, ${root}-800.webp 800w, ${base} 1200w`;
}

const services = [
  {
    id: "01",
    title: "Ангары",
    subtitle: "от 5 200 ₽/м²",
    desc: "Холодные и тёплые ангары для хранения техники, зерна, материалов. Пролёт до 60 м без промежуточных опор. Монтаж от 14 дней.",
    img: IMG_ANGAR,
    tags: ["Холодный", "Тёплый", "Арочный"],
    href: "/angary",
    altText: "Строительство металлических ангаров под ключ — Freonn",
  },
  {
    id: "02",
    title: "Склады",
    subtitle: "от 9 500 ₽/м²",
    desc: "Складские комплексы с АБК, рампами, воротами. Сэндвич-панели 100–150 мм. Полный цикл — от проекта до сдачи.",
    img: IMG_SKLAD,
    tags: ["С АБК", "С рампой", "Многопролётный"],
    href: "/sklady",
    altText: "Строительство металлических складов под ключ — Freonn",
  },
  {
    id: "03",
    title: "Производство",
    subtitle: "от 12 000 ₽/м²",
    desc: "Производственные цеха с мостовыми кранами, антресолями, системами вентиляции. Нагрузка на кровлю — до 500 кг/м².",
    img: IMG_PRODUCTION,
    tags: ["С краном", "Многоэтажный", "Под ключ"],
    href: "/proizvodstvennye-zdaniya",
    altText: "Строительство производственных зданий под ключ — Freonn",
  },
  {
    id: "04",
    title: "Навесы",
    subtitle: "от 3 800 ₽/м²",
    desc: "Навесы для парковки, открытых складов, сельхозтехники. Быстрый монтаж — от 7 дней. Пролёт до 30 м.",
    img: IMG_NAVES,
    tags: ["Парковочный", "Открытый", "С/х"],
    href: "/angary",
    altText: "Строительство навесов и лёгких конструкций — Freonn",
  },
  {
    id: "05",
    title: "С/х здания",
    subtitle: "от 5 500 ₽/м²",
    desc: "Коровники, свинарники, птичники, зернохранилища. Специальные решения для агропромышленного комплекса.",
    img: IMG_AGRO,
    tags: ["Коровник", "Зернохранилище", "Птичник"],
    href: "/selskokhozyaystvennye-zdaniya",
    altText: "Строительство сельскохозяйственных зданий под ключ — Freonn",
  },
  {
    id: "06",
    title: "Торговые здания",
    subtitle: "от 11 000 ₽/м²",
    desc: "Торговые павильоны, ТЦ, гипермаркеты из металлоконструкций. Витражное остекление, современный фасад, быстрый монтаж.",
    img: IMG_TRADE,
    tags: ["Павильон", "ТЦ", "Гипермаркет"],
    href: "/torgovye-zdaniya",
    altText: "Строительство торговых зданий и павильонов под ключ — Freonn",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" aria-label="Виды промышленных зданий" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* Subtle grid bg */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(rgba(26,26,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.04) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-px" style={{ background: 'var(--ms-orange)' }} />
            <span className="ms-label">Что мы строим</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2
              className="ms-heading"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                color: '#1A1A2E',
                maxWidth: '560px',
              }}
            >
              Промышленные здания любого назначения
            </h2>
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="ms-btn-ghost self-start lg:self-auto whitespace-nowrap"
            >
              Получить расчёт <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 items-start sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, i) => (
            <motion.div
              key={svc.id}
              className="group relative overflow-hidden"
              style={{
                borderRadius: '1.5rem',
                background: 'rgba(26,26,46,0.04)',
                border: '1px solid rgba(26,26,46,0.1)',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              {/* Wrap entire card in Link for SEO */}
              <Link href={svc.href} style={{ textDecoration: 'none', display: 'block' }}>
                {/* Image */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    borderRadius: "1.5rem 1.5rem 0 0",
                    height: "220px",
                  }}
                >
                  <img
                    src={svc.img}
                    srcSet={srcSetFor(svc.img)}
                    alt={svc.altText}
                    width={1200}
                    height={800}
                    className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading={i < 2 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={i === 0 ? "high" : undefined}
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 z-[1]"
                    style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(26,26,46,0.75) 100%)' }}
                  />
                  {/* ID badge */}
                  <div
                    className="absolute top-4 left-4 z-[2] ms-mono text-xs px-2 py-1"
                    style={{
                      background: 'rgba(237,28,36,0.9)',
                      color: 'white',
                      borderRadius: '0.5rem',
                      fontSize: '0.65rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {svc.id}
                  </div>
                  {/* Price badge */}
                  <div
                    className="absolute top-4 right-4 z-[2] ms-mono text-xs px-2 py-1"
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      color: 'rgba(26,26,46,0.8)',
                      borderRadius: '0.5rem',
                      fontSize: '0.65rem',
                      letterSpacing: '0.05em',
                      border: '1px solid rgba(26,26,46,0.12)',
                    }}
                  >
                    {svc.subtitle}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3
                    className="ms-heading mb-2"
                    style={{ fontSize: '1.35rem', color: '#1A1A2E' }}
                  >
                    {svc.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '0.82rem',
                      lineHeight: 1.65,
                      color: 'rgba(26,26,46,0.55)',
                      fontWeight: 300,
                      marginBottom: '1rem',
                    }}
                  >
                    {svc.desc}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {svc.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'IBM Plex Mono, monospace',
                          fontSize: '0.58rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          color: 'rgba(237,28,36,0.75)',
                          background: 'rgba(237,28,36,0.08)',
                          border: '1px solid rgba(237,28,36,0.2)',
                          padding: '2px 10px',
                          borderRadius: '999px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA row */}
                  <div
                    className="flex items-center gap-1 group-hover:gap-2 transition-all duration-200"
                    style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--ms-orange)',
                    }}
                  >
                    Подробнее <ArrowRight size={12} />
                  </div>
                </div>
              </Link>

              {/* Hover border glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  borderRadius: '1.5rem',
                  border: '1px solid rgba(237,28,36,0.3)',
                  boxShadow: 'inset 0 0 40px rgba(237,28,36,0.05)',
                }}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-12 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          aria-label="Дополнительные материалы"
        >
          <span
            className="ms-mono"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(26,26,46,0.35)",
            }}
          >
            Услуги и ориентиры
          </span>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { href: "/zdaniya", label: "Каталог типов" },
              { href: "/tseny", label: "Цены" },
              { href: "/proektirovanie", label: "Проектирование" },
              { href: "/montazh", label: "Монтаж" },
              { href: "/dostavka", label: "Доставка" },
            ].map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors"
                style={{
                  fontFamily: "Barlow Condensed, sans-serif",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "rgba(26,26,46,0.55)",
                  border: "1px solid rgba(26,26,46,0.12)",
                  textDecoration: "none",
                  background: "rgba(26,26,46,0.03)",
                }}
              >
                {x.label}
                <ArrowRight size={12} style={{ color: "var(--ms-orange)" }} />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

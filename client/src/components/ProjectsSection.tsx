/*
 * METALSTROY PROJECTS SECTION — MAX Channel CTA
 * Clean dark block with MAX channel link, no project cards
 */
import { motion } from "framer-motion";
import { ExternalLink, Play } from "lucide-react";

const MAX_URL = "https://max.ru/id3604084591_biz";

const stats = [
  { val: "500+", label: "реализованных объектов" },
  { val: "47", label: "регионов России" },
  { val: "14", label: "лет опыта" },
];

export default function ProjectsSection() {
  return (
    <section id="projects" aria-label="Реализованные проекты" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#F4F5F7' }}>
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `linear-gradient(rgba(26,26,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Red accent line left */}
      <div
        className="absolute left-0 top-1/4 w-1 h-48 hidden lg:block"
        style={{ background: 'linear-gradient(to bottom, transparent, var(--ms-orange), transparent)' }}
      />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-px" style={{ background: 'var(--ms-orange)' }} />
            <span className="ms-label">Наши объекты</span>
          </div>
          <h2
            className="ms-heading"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: '#1A1A2E',
              maxWidth: '600px',
            }}
          >
            Реализованные проекты
          </h2>
        </motion.div>

        {/* Main CTA block */}
        <motion.div
          className="relative overflow-hidden"
          style={{
            borderRadius: '2rem',
            background: 'rgba(26,26,46,0.04)',
            border: '1px solid rgba(26,26,46,0.1)',
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 70% 50%, rgba(237,28,36,0.07) 0%, transparent 60%)`,
            }}
          />

          <div className="relative z-10 p-8 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: text */}
              <div>
                {/* MAX badge */}
                <div
                  className="inline-flex items-center gap-2 mb-8 px-4 py-2"
                  style={{
                    background: 'rgba(237,28,36,0.1)',
                    border: '1px solid rgba(237,28,36,0.3)',
                    borderRadius: '999px',
                  }}
                >
                  <Play size={12} style={{ color: 'var(--ms-orange)' }} fill="currentColor" />
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '0.65rem',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      color: 'var(--ms-orange)',
                    }}
                  >
                    Канал MAX
                  </span>
                </div>

                <h3
                  className="ms-heading mb-6"
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                    color: '#1A1A2E',
                    lineHeight: 1.2,
                  }}
                >
                  Все наши работы — в канале MAX
                </h3>

                <p
                  className="mb-10"
                  style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.95rem',
                    lineHeight: 1.8,
                    color: 'rgba(26,26,46,0.55)',
                    fontWeight: 300,
                    maxWidth: '420px',
                  }}
                >
                  Фото и видео реализованных объектов: ангары, склады, производственные цеха, навесы. Более 500 проектов по всей России — от небольших фермерских ангаров до крупных логистических комплексов.
                </p>

                <a
                  href={MAX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-btn inline-flex items-center gap-3 group"
                  style={{ textDecoration: 'none', borderRadius: '999px', padding: '0.9rem 2rem' }}
                >
                  <span>Смотреть все объекты</span>
                  <ExternalLink size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </a>
              </div>

              {/* Right: stats */}
              <div className="grid grid-cols-1 gap-4">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    className="flex items-center gap-6 p-6"
                    style={{
                      borderRadius: '1.25rem',
                      background: 'rgba(26,26,46,0.04)',
                      border: '1px solid rgba(26,26,46,0.08)',
                    }}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div
                      className="ms-display shrink-0"
                      style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        color: i === 0 ? 'var(--ms-orange)' : '#1A1A2E',
                        minWidth: '80px',
                      }}
                    >
                      {s.val}
                    </div>
                    <div
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: '0.7rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'rgba(26,26,46,0.4)',
                        lineHeight: 1.5,
                      }}
                    >
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mt-12 text-center max-w-xl mx-auto px-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p
            className="mb-5"
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.95rem",
              color: "rgba(26,26,46,0.5)",
              lineHeight: 1.6,
            }}
          >
            Нужна ориентировочная смета под ваш объект? Откройте конфигуратор — укажите размеры и получите вилку цены и PDF.
          </p>
          <button
            type="button"
            className="ms-btn-primary"
            style={{ cursor: "pointer", border: "none" }}
            onClick={() => document.querySelector("#calculator")?.scrollIntoView({ behavior: "smooth" })}
          >
            Открыть калькулятор
          </button>
        </motion.div>
      </div>
    </section>
  );
}

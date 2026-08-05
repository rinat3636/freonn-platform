/*
 * METALSTROY ABOUT SECTION — Dark Industrial Brutalism
 * Asymmetric layout, steel-chrome stats, engineering precision
 */
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Factory, Shield, Truck, Clock } from "lucide-react";

const IMG_WAREHOUSE = "/images/home/about.webp";

const stats = [
  { val: 2011, suffix: "", label: "год основания" },
  { val: 500, suffix: "+", label: "объектов сдано" },
  { val: 47, suffix: "", label: "регионов России" },
  { val: 5, suffix: " лет", label: "гарантия" },
  { val: 65000, suffix: "", label: "м² смонтировано" },
  { val: 1, suffix: " день", label: "расчёт стоимости" },
];

const pillars = [
  { icon: Factory, title: "Качественные материалы", desc: "Работаем только с проверенными поставщиками металлопроката. Контроль качества на каждом этапе." },
  { icon: Shield, title: "Гарантия 5 лет", desc: "Фиксированная цена в договоре. Гарантия на конструкции и монтаж — 5 лет." },
  { icon: Truck, title: "Доставка по всей России", desc: "Организуем доставку конструкций в любой регион. Монтажные бригады выезжают на объект." },
  { icon: Clock, title: "Сроки в договоре", desc: "Строительство от 30 дней. Сроки фиксируются в договоре и соблюдаются." },
];

function CountUp({ target, suffix, start }: { target: number; suffix: string; start: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const duration = 1800;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, start]);

  return (
    <span>
      {count.toLocaleString("ru-RU")}{suffix}
    </span>
  );
}

export default function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" aria-label="О компании Freonn" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#F4F5F7' }}>
      {/* Grid bg */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: `linear-gradient(rgba(26,26,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Section number */}
      <div
        className="absolute top-8 right-8 ms-section-num hidden lg:block"
        style={{ color: 'rgba(26,26,46,0.04)' }}
      >
        01
      </div>

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
            <span className="ms-label">О компании</span>
          </div>
          <h2
            className="ms-heading"
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: '#1A1A2E',
              maxWidth: '600px',
            }}
          >
            Строим промышленные здания с 2011 года
          </h2>
        </motion.div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-20">
          {/* Left: text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="space-y-5 mb-8"
              style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.95rem',
                lineHeight: 1.8,
                color: 'rgba(26,26,46,0.6)',
                fontWeight: 300,
              }}
            >
              <p>
                Мы — строительная компания полного цикла. Проектное бюро и монтажные бригады позволяют нам контролировать качество на каждом этапе и держать конкурентные цены.
              </p>
              <p>
                За 14 лет работы реализовали более 500 объектов по всей России: от небольших фермерских ангаров до крупных логистических комплексов площадью свыше 20 000 м². Среди наших клиентов — агрохолдинги, торговые сети, промышленные предприятия и государственные структуры.
              </p>
              <p>
                Работаем по договору с фиксированной ценой. Гарантия на конструкции — 5 лет. Сроки строительства — от 30 дней.
              </p>
            </div>

            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 group"
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ms-orange)',
              }}
            >
              Связаться с нами
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Right: image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div
              className="relative h-72 overflow-hidden"
              style={{ border: '1px solid rgba(26,26,46,0.08)', borderRadius: '1.5rem' }}
            >
              <img
                src={IMG_WAREHOUSE}
                alt="Freonn — строительство промышленного склада под ключ, металлоконструкции"
                width={1920}
                height={1434}
                className="absolute inset-0 z-0 h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 1023px) 100vw, 50vw"
              />
              <div
                className="absolute inset-0 z-[1]"
                style={{ background: 'linear-gradient(to top, rgba(26,26,46,0.82) 0%, transparent 58%)' }}
              />
              {/* Corner marks */}
              <div className="absolute top-3 left-3 z-[2] w-4 h-4" style={{ borderTop: '1px solid var(--ms-orange)', borderLeft: '1px solid var(--ms-orange)' }} />
              <div className="absolute top-3 right-3 z-[2] w-4 h-4" style={{ borderTop: '1px solid var(--ms-orange)', borderRight: '1px solid var(--ms-orange)' }} />
              <div className="absolute bottom-3 left-3 z-[2] w-4 h-4" style={{ borderBottom: '1px solid var(--ms-orange)', borderLeft: '1px solid var(--ms-orange)' }} />
              <div className="absolute bottom-3 right-3 z-[2] w-4 h-4" style={{ borderBottom: '1px solid var(--ms-orange)', borderRight: '1px solid var(--ms-orange)' }} />
            </div>
          </motion.div>
        </div>

        {/* Stats grid */}
        <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-20">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="ms-glass p-5 group hover:border-red-600/30 transition-colors duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <div
                className="ms-display mb-1"
                style={{
                  fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                  color: i % 2 === 0 ? '#1A1A2E' : 'var(--ms-orange)',
                }}
              >
                <CountUp target={stat.val} suffix={stat.suffix} start={inView} />
              </div>
              <div
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.6rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(26,26,46,0.45)',
                }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.title}
                className="ms-glass p-6 group hover:border-red-600/25 transition-all duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div
                  className="w-10 h-10 flex items-center justify-center mb-4 transition-colors duration-300"
                  style={{
                    background: 'rgba(237,28,36,0.1)',
                    border: '1px solid rgba(237,28,36,0.2)',
                    borderRadius: '0.75rem',
                  }}
                >
                  <Icon size={18} style={{ color: 'var(--ms-orange)' }} />
                </div>
                <h3
                  className="ms-heading mb-2"
                  style={{ fontSize: '0.95rem', color: '#1A1A2E' }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.82rem',
                    lineHeight: 1.6,
                    color: 'rgba(26,26,46,0.5)',
                    fontWeight: 300,
                  }}
                >
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

/*
 * METALSTROY ADVANTAGES SECTION — Dark Industrial Brutalism
 * Full-bleed dark section with large numbered advantages
 */
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const advantages = [
  {
    num: "01",
    title: "Опыт 14 лет",
    desc: "С 2011 года реализуем проекты по всей России. Каждый объект сдаётся в срок и без дополнительных расходов.",
    metric: "2011",
  },
  {
    num: "02",
    title: "Фиксированная цена",
    desc: "Цена прописывается в договоре и не меняется. Никаких скрытых доплат и пересмотра сметы в процессе строительства.",
    metric: "0 доплат",
  },
  {
    num: "03",
    title: "Сроки по договору",
    desc: "Сроки строительства фиксируются в договоре. За нарушение сроков — штрафные санкции в пользу заказчика.",
    metric: "от 30 дней",
  },
  {
    num: "04",
    title: "Гарантия 5 лет",
    desc: "Гарантия на конструкции и монтаж — 5 лет. Срок службы здания при правильной эксплуатации — 50+ лет.",
    metric: "50+ лет",
  },
  {
    num: "05",
    title: "Работаем по всей России",
    desc: "Реализованы объекты в 47 регионах. Монтажные бригады выезжают в любой регион. Организуем доставку конструкций в срок.",
    metric: "47 регионов",
  },
  {
    num: "06",
    title: "Полный цикл",
    desc: "Проектирование, производство, доставка, монтаж, отделка — всё в одном договоре. Один ответственный подрядчик.",
    metric: "1 договор",
  },
];

export default function AdvantagesSection() {
  return (
    <section id="advantages" aria-label="Преимущества Freonn" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* Grid bg */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(26,26,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Orange diagonal accent */}
      <div
        className="absolute top-0 right-0 w-px h-full"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(237,28,36,0.15), transparent)' }}
      />

      {/* Section number */}
      <div className="absolute top-8 right-8 ms-section-num hidden lg:block">02</div>

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
            <span className="ms-label">Почему мы</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2
              className="ms-heading"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#1A1A2E', maxWidth: '500px' }}
            >
              Наши преимущества
            </h2>
            <button
              onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 group self-start lg:self-auto"
              style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 700,
                fontSize: '0.8rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--ms-orange)',
              }}
            >
              Получить КП
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {advantages.map((adv, i) => (
            <motion.div
              key={adv.num}
              className="relative p-6 group overflow-hidden"
              style={{
                background: 'rgba(26,26,46,0.04)',
                border: '1px solid rgba(26,26,46,0.08)',
                borderRadius: '1.25rem',
              }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(237,28,36,0.25)';
                e.currentTarget.style.background = 'rgba(237,28,36,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.background = 'rgba(26,26,46,0.04)';
              }}
            >
              {/* Large number bg */}
              <div
                className="absolute top-2 right-4 transition-opacity duration-300"
                style={{
                  fontFamily: 'Bebas Neue, sans-serif',
                  fontSize: '5rem',
                  color: 'rgba(255,255,255,0.025)',
                  lineHeight: 1,
                  userSelect: 'none',
                }}
              >
                {adv.num}
              </div>

              {/* Metric */}
              <div
                className="ms-display mb-3"
                style={{
                  fontSize: '1.6rem',
                  color: 'var(--ms-orange)',
                }}
              >
                {adv.metric}
              </div>

              {/* Title */}
              <h3
                className="ms-heading mb-2"
                style={{ fontSize: '1rem', color: '#1A1A2E' }}
              >
                {adv.title}
              </h3>

              {/* Desc */}
              <p
                style={{
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '0.82rem',
                  lineHeight: 1.65,
                  color: 'rgba(26,26,46,0.4)',
                  fontWeight: 300,
                }}
              >
                {adv.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

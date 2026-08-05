/*
 * METALSTROY PRICING SECTION — Dark Industrial Brutalism
 * Price table with highlighted "recommended" tier
 */
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const plans = [
  {
    id: "cold",
    name: "Холодный",
    subtitle: "Без утепления",
    price: "от 4 650",
    unit: "₽/м²",
    desc: "Каркас + профнастил. Идеально для хранения техники, зерна, материалов.",
    features: [
      "Металлокаркас ЛМК",
      "Профнастил Н-60",
      "Ворота секционные",
      "Водосточная система",
      "Гарантия 5 лет",
    ],
    recommended: false,
  },
  {
    id: "warm",
    name: "Тёплый",
    subtitle: "С утеплением",
    price: "от 8 500",
    unit: "₽/м²",
    desc: "Сэндвич-панели 100 мм. Для производства, склада, торговли.",
    features: [
      "Металлокаркас ЛМК",
      "Сэндвич-панели 100 мм",
      "Ворота секционные",
      "Водосточная система",
      "Отопление (опция)",
      "АБК (опция)",
      "Гарантия 5 лет",
    ],
    recommended: true,
  },
  {
    id: "premium",
    name: "Под ключ",
    subtitle: "Полный цикл",
    price: "от 12 000",
    unit: "₽/м²",
    desc: "Проект + фундамент + монтаж + отделка + инженерные системы.",
    features: [
      "Проектирование",
      "Фундамент",
      "Металлокаркас ЛМК",
      "Сэндвич-панели 150 мм",
      "Инженерные системы",
      "Промышленный пол",
      "АБК",
      "Гарантия 5 лет",
    ],
    recommended: false,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" aria-label="Цены на промышленные здания" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#F4F5F7' }}>
      {/* Grid bg */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(26,26,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />

      {/* Section number */}
      <div className="absolute top-8 right-8 ms-section-num hidden lg:block">06</div>

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px" style={{ background: 'var(--ms-orange)' }} />
            <span className="ms-label">Стоимость</span>
            <div className="w-10 h-px" style={{ background: 'var(--ms-orange)' }} />
          </div>
          <h2
            className="ms-heading"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#1A1A2E' }}
          >
            Цены на промышленные здания
          </h2>
          <p
            className="mt-3 mx-auto max-w-lg"
            style={{
              fontFamily: 'Barlow, sans-serif',
              fontSize: '0.9rem',
              color: 'rgba(26,26,46,0.4)',
              fontWeight: 300,
            }}
          >
            Цены указаны за 1 м² площади здания. Точная стоимость рассчитывается индивидуально.
          </p>
          <p className="mt-4" style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.88rem", fontWeight: 400 }}>
            <Link
              href="/tseny"
              className="inline-flex items-center gap-1.5 transition-colors"
              style={{ color: "var(--ms-orange)", textDecoration: "none", fontWeight: 600 }}
            >
              Подробнее об ориентирах цен по типам зданий
              <ArrowRight size={14} />
            </Link>
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              className="relative overflow-hidden"
              style={{
                background: plan.recommended ? 'rgba(237,28,36,0.06)' : 'rgba(26,26,46,0.04)',
                border: `1px solid ${plan.recommended ? 'rgba(237,28,36,0.4)' : 'rgba(26,26,46,0.1)'}`,
                transform: plan.recommended ? 'scale(1.02)' : 'scale(1)',
                borderRadius: '1.5rem',
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              {/* Recommended badge */}
              {plan.recommended && (
                <div
                  className="absolute top-0 left-0 right-0 py-1.5 text-center"
                  style={{
                    background: 'var(--ms-orange)',
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '0.58rem',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'white',
                  }}
                >
                  Рекомендуем
                </div>
              )}

              <div className={`p-6 ${plan.recommended ? 'pt-10' : ''}`}>
                {/* Name */}
                <div className="mb-4">
                  <h3
                    className="ms-heading mb-1"
                    style={{ fontSize: '1.3rem', color: '#1A1A2E' }}
                  >
                    {plan.name}
                  </h3>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '0.62rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(26,26,46,0.45)',
                    }}
                  >
                    {plan.subtitle}
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(26,26,46,0.08)' }}>
                  <span
                    className="ms-display"
                    style={{
                      fontSize: '2rem',
                      color: plan.recommended ? 'var(--ms-orange)' : '#1A1A2E',
                    }}
                  >
                    {plan.price}
                  </span>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Mono, monospace',
                      fontSize: '0.7rem',
                      color: 'rgba(26,26,46,0.4)',
                      marginLeft: '4px',
                    }}
                  >
                    {plan.unit}
                  </span>
                </div>

                {/* Desc */}
                <p
                  className="mb-5"
                  style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.82rem',
                    lineHeight: 1.6,
                    color: 'rgba(26,26,46,0.5)',
                    fontWeight: 300,
                  }}
                >
                  {plan.desc}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                        style={{
                          background: plan.recommended ? 'rgba(237,28,36,0.2)' : 'rgba(26,26,46,0.05)',
                          border: `1px solid ${plan.recommended ? 'rgba(237,28,36,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        }}
                      >
                        <Check size={9} style={{ color: plan.recommended ? 'var(--ms-orange)' : 'rgba(26,26,46,0.4)' }} />
                      </div>
                      <span
                        style={{
                          fontFamily: 'Barlow, sans-serif',
                          fontSize: '0.8rem',
                          color: 'rgba(26,26,46,0.6)',
                          fontWeight: 300,
                        }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => document.querySelector("#calculator")?.scrollIntoView({ behavior: "smooth" })}
                  className={plan.recommended ? "ms-btn-primary w-full justify-center" : "ms-btn-ghost w-full justify-center"}
                >
                  Рассчитать
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          className="text-center mt-8"
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '0.62rem',
            letterSpacing: '0.08em',
            color: 'rgba(26,26,46,0.2)',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          * Цены актуальны на май 2026 г. Точная стоимость зависит от размеров, комплектации и региона.
        </motion.p>
      </div>
    </section>
  );
}

/*
 * METALSTROY PROCESS SECTION — Premium Timeline
 * Vertical timeline with animated connectors, badge durations, scroll reveal
 * Dark Industrial Brutalism design
 */
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

const steps = [
  { num: "01", title: "Заявка / Составление ТЗ / Расчёт КП", desc: "Принимаем заявку, выезжаем на объект или проводим онлайн-консультацию. Определяем тип здания, площадь и бюджет. Составляем техническое задание.", duration: "1 день" },
  { num: "02", title: "Подписание договора", desc: "Фиксируем стоимость, сроки и технические характеристики в договоре. Цена не меняется в процессе строительства.", duration: "1 день" },
  { num: "03", title: "Согласование эскиза", desc: "Разрабатываем и согласовываем архитектурный эскиз здания с учётом всех пожеланий заказчика.", duration: "3 дня" },
  { num: "04", title: "Разработка проектной документации", desc: "Разрабатываем рабочую документацию: КМ, КМД, архитектурный раздел. Согласовываем с заказчиком.", duration: "15–20 дней" },
  { num: "05", title: "Получение задания на фундамент", desc: "Проводим геологические изыскания, подбираем тип фундамента, выдаём задание на фундаментные работы.", duration: "10 дней" },
  { num: "06", title: "Фундаментные работы", desc: "Устройство фундамента: свайный (буронабивные или винтовые сваи) или ленточный фундамент.", duration: "15–20 дней" },
  { num: "07", title: "Изготовление металлоконструкций", desc: "Изготовление металлоконструкций по рабочей документации. Контроль качества на каждом этапе.", duration: "20–25 дней" },
  { num: "08", title: "Монтаж металлоконструкций", desc: "Доставка конструкций на объект. Монтаж силами опытных бригад в строгом соответствии с проектом.", duration: "15–20 дней" },
  { num: "09", title: "Монтаж ограждающих конструкций", desc: "Обшивка стен и кровли профнастилом или сэндвич-панелями. Устройство пароизоляции и утепления.", duration: "10–15 дней" },
  { num: "10", title: "Устройство пола", desc: "Бетонная стяжка, армирование, промышленный пол с упрочнённым покрытием.", duration: "5–10 дней" },
  { num: "11", title: "Водосточная система / ворота / двери", desc: "Установка водосточной системы, ворот (секционные, рулонные), дверей, окон. Финальная проверка и сдача объекта.", duration: "5–10 дней" },
];

export default function ProcessSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section id="process" aria-label="Этапы строительства" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#F4F5F7' }}>
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
      <div className="absolute top-8 right-8 ms-section-num hidden lg:block">04</div>

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
            <span className="ms-label">Как мы работаем</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <h2
              className="ms-heading"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#1A1A2E', maxWidth: '500px' }}
            >
              Этапы строительства под ключ
            </h2>
            <div
              className="ms-glass px-4 py-2 flex items-center gap-2"
              style={{ alignSelf: 'flex-end' }}
            >
              <span
                style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: '0.65rem',
                  letterSpacing: '0.1em',
                  color: 'rgba(26,26,46,0.4)',
                  textTransform: 'uppercase',
                }}
              >
                Общий срок:
              </span>
              <span
                style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'var(--ms-orange)',
                }}
              >
                от 30 дней
              </span>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <div ref={ref} className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-6 lg:left-8 top-0 bottom-0 w-px"
            style={{ background: 'rgba(26,26,46,0.07)' }}
          >
            <motion.div
              className="absolute top-0 left-0 right-0"
              style={{ background: 'linear-gradient(to bottom, var(--ms-orange), rgba(237,28,36,0.1))', transformOrigin: 'top' }}
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="relative flex gap-6 lg:gap-10 group"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                {/* Node */}
                <div className="flex flex-col items-center flex-shrink-0" style={{ width: '48px' }}>
                  <div
                    className="relative z-10 w-12 h-12 flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: '#F4F5F7',
                      border: '1px solid rgba(26,26,46,0.1)',
                      borderRadius: '50%',
                    }}
                  >
                    <span
                      className="ms-mono"
                      style={{
                        fontSize: '0.7rem',
                        color: 'rgba(26,26,46,0.4)',
                        fontWeight: 500,
                        transition: 'color 0.3s',
                      }}
                    >
                      {step.num}
                    </span>
                    {/* Orange dot on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ border: '1px solid rgba(237,28,36,0.5)', background: 'rgba(237,28,36,0.05)', borderRadius: '50%' }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div
                  className="flex-1 pb-8 border-b transition-colors duration-300"
                  style={{ borderColor: 'rgba(26,26,46,0.08)' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2 pt-3">
                    <h3
                      className="ms-heading transition-colors duration-300 group-hover:text-orange-400"
                      style={{ fontSize: '1rem', color: 'rgba(26,26,46,0.85)' }}
                    >
                      {step.title}
                    </h3>
                    {/* Duration badge */}
                    <span
                      className="flex-shrink-0 px-3 py-1 self-start"
                      style={{
                        background: 'rgba(237,28,36,0.08)',
                        border: '1px solid rgba(237,28,36,0.2)',
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: '0.6rem',
                        letterSpacing: '0.1em',
                        color: 'var(--ms-orange)',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        borderRadius: '999px',
                      }}
                    >
                      {step.duration}
                    </span>
                  </div>
                  <p
                    style={{
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '0.82rem',
                      lineHeight: 1.65,
                      color: 'rgba(26,26,46,0.4)',
                      fontWeight: 300,
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: "0.85rem",
              color: "rgba(26,26,46,0.45)",
            }}
          >
            <span className="w-full sm:w-auto" style={{ fontWeight: 500 }}>
              Подробные разделы:
            </span>
            {[
              { href: "/proektirovanie", label: "Проектирование" },
              { href: "/montazh", label: "Монтаж МК" },
              { href: "/dostavka", label: "Доставка" },
              { href: "/tseny", label: "Ориентиры цен" },
            ].map((x) => (
              <Link
                key={x.href}
                href={x.href}
                className="inline-flex items-center gap-1 transition-colors hover:opacity-90"
                style={{
                  color: "var(--ms-orange)",
                  fontWeight: 600,
                  textDecoration: "none",
                  fontFamily: "Barlow Condensed, sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                {x.label}
                <ArrowRight size={12} />
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

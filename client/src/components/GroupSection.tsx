/*
 * ГРУППА КОМПАНИЙ FREONN — блок на freonn.pro
 * Рекламирует только freonn.ru (инженерные системы)
 */
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight, CheckCircle2 } from "lucide-react";
import { ymGoal } from "../lib/ym";

const LOGO_RU = "/images/home/logo-ru.webp";

export default function GroupSection() {
  return (
    <section
      id="group"
      aria-label="Группа компаний Freonn"
      className="py-20 relative overflow-hidden"
      style={{ background: "var(--ms-black)" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(var(--ms-red) 1px, transparent 1px), linear-gradient(90deg, var(--ms-red) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 bg-red-500/10 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm font-medium tracking-widest uppercase">
              Группа компаний
            </span>
          </div>
          <h2
            className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4"
            style={{ color: "var(--ms-white)" }}
          >
            FREONN GROUP
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Мы строим промышленные здания и оснащаем их инженерными системами — всё
            в рамках одной группы компаний, без посредников.
          </p>
        </motion.div>

        {/* Single card — freonn.ru */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <a
            href="https://www.freonn.ru"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => ymGoal('partner_link_click', { partner: 'freonn_ru', source: 'group_section' })}
            className="block relative rounded-2xl overflow-hidden border border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 group hover:-translate-y-1"
            style={{ background: "rgba(45,48,146,0.06)", textDecoration: "none" }}
          >
            {/* Top gradient bar */}
            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #2D3092, #0F1340)" }} />

            <div className="p-8 md:p-10">
              {/* Badge + external icon */}
              <div className="flex items-start justify-between mb-6">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{
                    background: "rgba(45,48,146,0.15)",
                    color: "#6B8DD6",
                    border: "1px solid rgba(45,48,146,0.3)",
                  }}
                >
                  Также занимаемся
                </span>
                <ExternalLink size={18} className="text-blue-400/40 group-hover:text-blue-300 transition-colors flex-shrink-0" />
              </div>

              {/* Logo + Title */}
              <div className="flex items-center gap-5 mb-5">
                <div className="w-16 h-16 rounded-xl flex items-center justify-center bg-white flex-shrink-0 p-2">
                  <img
                    src={LOGO_RU}
                    alt="Freonn RU"
                    width={1200}
                    height={378}
                    className="w-full h-full object-contain"
                    decoding="async"
                    loading="lazy"
                  />
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                    FREONN RU
                  </p>
                  <h3 className="text-2xl font-black" style={{ color: "var(--ms-white)" }}>
                    Инженерные системы
                  </h3>
                  <p className="text-blue-400/70 text-sm mt-0.5">freonn.ru</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-5">
                Монтаж инженерных систем под ключ в Москве и МО. Вентиляция, кондиционирование,
                дымоудаление, отопление, электроснабжение — для промышленности и бизнеса.
                Более 1280 объектов, гарантия 3 года.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["Вентиляция", "Кондиционирование", "Дымоудаление", "Отопление", "Электрика"].map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs border border-blue-800/40 text-gray-400"
                  >
                    <CheckCircle2 size={10} className="text-blue-500/50" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-gray-800/60 mb-5">
                {[
                  { value: "1280+", label: "объектов" },
                  { value: "15+", label: "лет опыта" },
                  { value: "25", label: "бригад" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl font-black" style={{ color: "#6B8DD6" }}>
                      {stat.value}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-400/60 group-hover:text-blue-300 transition-colors">
                <span>Перейти на freonn.ru</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>
        </motion.div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center text-gray-600 text-sm mt-8"
        >
          Единый телефон для обоих направлений:{" "}
          <a href="tel:+78001012009" onClick={() => ymGoal('phone_click', { source: 'group_section' })} className="text-gray-400 hover:text-white transition-colors">
            8(800)101-2009
          </a>
        </motion.p>
      </div>
    </section>
  );
}

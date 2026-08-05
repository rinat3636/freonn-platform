/*
 * METALSTROY FAQ SECTION — Dark Industrial Brutalism
 * Accordion-style FAQ with animated expand
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { HOME_FAQ_ITEMS } from "@shared/homeFaq";

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" aria-label="Часто задаваемые вопросы" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#FFFFFF' }}>
      {/* Section number */}
      <div className="absolute top-8 right-8 ms-section-num hidden lg:block">08</div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-px" style={{ background: 'var(--ms-orange)' }} />
              <span className="ms-label">FAQ</span>
            </div>
            <h2
              className="ms-heading mb-4"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1A1A2E' }}
            >
              Часто задаваемые вопросы
            </h2>
            <p
              style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.85rem',
                lineHeight: 1.7,
                color: 'rgba(26,26,46,0.4)',
                fontWeight: 300,
              }}
            >
              Не нашли ответ на свой вопрос? Позвоните нам или оставьте заявку — ответим в течение часа.
            </p>
          </motion.div>

          {/* Right — accordion */}
          <div className="space-y-3">
            {HOME_FAQ_ITEMS.map((faq, i) => {
              const isOpen = openIdx === i;
              return (
                <motion.div
                  key={faq.q}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  style={{
                    border: '1px solid rgba(26,26,46,0.08)',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                    background: isOpen ? 'rgba(237,28,36,0.02)' : 'transparent',
                  }}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    aria-expanded={isOpen}
                  >
                    <span
                      style={{
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontWeight: 600,
                        fontSize: '1rem',
                        color: '#1A1A2E',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {faq.q}
                    </span>
                    <span style={{ color: 'var(--ms-orange)', flexShrink: 0 }}>
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <p
                          className="px-5 pb-5"
                          style={{
                            fontFamily: 'Barlow, sans-serif',
                            fontSize: '0.85rem',
                            lineHeight: 1.75,
                            color: 'rgba(26,26,46,0.55)',
                            fontWeight: 300,
                          }}
                        >
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

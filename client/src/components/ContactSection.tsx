/*
 * Freonn — блок контактов и формы заявки
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Phone, Mail, MapPin, Clock, ArrowRight, Check, ExternalLink } from "lucide-react";
import PhoneInput from "./PhoneInput";
import { ymGoal } from "../lib/ym";
import { gaEvent } from "../lib/ga";
import TenderButton from "./TenderButton";

const contactInfo = [
  { icon: Phone, label: "Телефон", val: "8(800)101-2009", sub: "Бесплатно по России", href: "tel:+78001012009" },
  { icon: Mail, label: "Email", val: "freonn@internet.ru", sub: "Ответим в течение часа", href: "mailto:freonn@internet.ru" },
  { icon: MapPin, label: "Офис", val: "г. Москва, Варшавское шоссе, д. 125Ж", sub: "Пн–Пт 9:00–18:00", href: "https://yandex.ru/maps/?text=Москва+Варшавское+шоссе+125Ж" },
  { icon: Clock, label: "Режим работы", val: "Пн–Пт 9:00–18:00", sub: "Заявки принимаем круглосуточно", href: "" },
];

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        try {
          const { isLoggedIn } = await import("@/lib/freonn-group/auth-storage");
          const { isFreonnApiConfigured } = await import("@/lib/freonn-group/config");
          const { submitMetalstroyRequest } = await import("@/lib/freonn-group/orders");
          if (isFreonnApiConfigured() && isLoggedIn()) {
            await submitMetalstroyRequest({
              buildingType: "Заявка с сайта",
              comment: [form.name, form.phone, form.email, form.message].filter(Boolean).join("\n"),
            });
          }
        } catch (syncErr) {
          console.warn("[Contact] Freonn Group request sync", syncErr);
        }
        setSent(true);
        ymGoal('form_submit');
        gaEvent('form_submit', { event_category: 'lead', event_label: 'contact_form', value: 1 });
      } else {
        setError(data.error || "Ошибка отправки. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка соединения. Позвоните нам: 8(800)101-2009");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" aria-label="Форма обратной связи" className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#F4F5F7' }}>
      {/* Grid bg */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(26,26,46,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.05) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.5,
        }}
      />
      {/* Orange glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(237,28,36,0.05) 0%, transparent 70%)' }}
      />

      {/* Section number */}
      <div className="absolute top-8 right-8 ms-section-num hidden lg:block">09</div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20">
          {/* Left: form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-px" style={{ background: 'var(--ms-orange)' }} />
              <span className="ms-label">Связаться с нами</span>
            </div>
            <h2
              className="ms-heading mb-2"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#1A1A2E' }}
            >
              Получить коммерческое предложение
            </h2>
            <p
              className="mb-8"
              style={{
                fontFamily: 'Barlow, sans-serif',
                fontSize: '0.9rem',
                color: 'rgba(26,26,46,0.4)',
                fontWeight: 300,
              }}
            >
              Оставьте заявку — менеджер свяжется в течение 1 рабочего дня и подготовит КП с ценой и сроками.
            </p>

            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="contact-name" className="ms-label block mb-2">Ваше имя *</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Иван Иванов"
                      className="w-full px-4 py-3 outline-none transition-colors duration-200"
                      style={{
                        background: 'rgba(26,26,46,0.04)',
                        border: '1px solid rgba(26,26,46,0.1)',
                        color: '#1A1A2E',
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: '0.9rem',
                        borderRadius: '0.75rem',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(237,28,36,0.5)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-phone" className="ms-label block mb-2">Телефон *</label>
                    <PhoneInput
                      id="contact-phone"
                      value={form.phone}
                      onChange={(val) => setForm(f => ({ ...f, phone: val }))}
                      required
                      className="w-full px-4 py-3 outline-none transition-colors duration-200"
                      style={{
                        background: 'rgba(26,26,46,0.04)',
                        border: '1px solid rgba(26,26,46,0.1)',
                        color: '#1A1A2E',
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: '0.9rem',
                        borderRadius: '0.75rem',
                      }}
                      onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(237,28,36,0.5)'}
                      onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-email" className="ms-label block mb-2">Email</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="ivan@company.ru"
                    className="w-full px-4 py-3 outline-none transition-colors duration-200"
                    style={{
                      background: 'rgba(26,26,46,0.04)',
                      border: '1px solid rgba(26,26,46,0.1)',
                      color: '#1A1A2E',
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '0.9rem',
                      borderRadius: '0.75rem',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(237,28,36,0.5)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'}
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="ms-label block mb-2">Опишите задачу</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Тип здания, площадь, регион, сроки..."
                    className="w-full px-4 py-3 outline-none transition-colors duration-200 resize-none"
                    style={{
                      background: 'rgba(26,26,46,0.04)',
                      border: '1px solid rgba(26,26,46,0.1)',
                      color: '#1A1A2E',
                      fontFamily: 'Barlow, sans-serif',
                      fontSize: '0.9rem',
                      borderRadius: '0.75rem',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(237,28,36,0.5)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(26,26,46,0.1)'}
                  />
                </div>
                {error && (
                  <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.85rem', color: '#B91C1C', padding: '8px 12px', background: 'rgba(185,28,28,0.08)', borderRadius: '0.5rem' }}>
                    {error}
                  </p>
                )}
                <button type="submit" disabled={loading} className="ms-btn-primary w-full justify-center" style={{ opacity: loading ? 0.7 : 1 }}>
                  {loading ? "Отправляем..." : "Отправить заявку"}
                  {!loading && <ArrowRight size={16} />}
                </button>
                <TenderButton variant="ghost" size="md" className="w-full justify-center" />
                <p style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.55rem', color: 'rgba(26,26,46,0.2)', letterSpacing: '0.08em' }}>
                  Нажимая кнопку, вы соглашаетесь с{" "}
                  <Link href="/politika-konfidencialnosti" style={{ color: "rgba(26,26,46,0.45)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                    политикой конфиденциальности
                  </Link>
                </p>
              </form>
            ) : (
              <motion.div
                className="flex flex-col items-center justify-center py-16 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div
                  className="w-16 h-16 flex items-center justify-center mb-6"
                  style={{ background: 'rgba(237,28,36,0.1)', border: '1px solid rgba(237,28,36,0.3)', borderRadius: '50%' }}
                >
                  <Check size={28} style={{ color: 'var(--ms-orange)' }} />
                </div>
                <h3 className="ms-heading mb-2" style={{ fontSize: '1.4rem', color: '#1A1A2E' }}>
                  Заявка отправлена!
                </h3>
                <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.9rem', color: 'rgba(26,26,46,0.55)', fontWeight: 300 }}>
                  Менеджер свяжется с вами в течение 1 рабочего дня
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Right: contact info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-4"
          >
            {contactInfo.map((item, i) => {
              const Icon = item.icon;
              const Tag = item.href ? motion.a : motion.div;
              return (
                <Tag
                  key={item.label}
                  {...(item.href ? { href: item.href, target: item.href.startsWith('http') ? '_blank' : undefined, rel: item.href.startsWith('http') ? 'noopener noreferrer' : undefined } : {})}
                  className="flex items-start gap-4 p-5 group transition-all duration-300"
                  style={{
                    background: 'rgba(26,26,46,0.04)',
                    border: '1px solid rgba(26,26,46,0.08)',
                    textDecoration: 'none',
                    borderRadius: '1rem',
                  }}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(237,28,36,0.25)';
                    e.currentTarget.style.background = 'rgba(237,28,36,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    e.currentTarget.style.background = 'rgba(26,26,46,0.04)';
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'rgba(237,28,36,0.1)',
                      border: '1px solid rgba(237,28,36,0.2)',
                      borderRadius: '0.75rem',
                    }}
                  >
                    <Icon size={16} style={{ color: 'var(--ms-orange)' }} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontFamily: 'IBM Plex Mono, monospace',
                        fontSize: '0.58rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'rgba(26,26,46,0.3)',
                        marginBottom: '3px',
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Barlow Condensed, sans-serif',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#1A1A2E',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {item.val}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Barlow, sans-serif',
                        fontSize: '0.75rem',
                        color: 'rgba(26,26,46,0.45)',
                        fontWeight: 300,
                      }}
                    >
                      {item.sub}
                    </div>
                  </div>
                </Tag>
              );
            })}

            {/* MAX channel link */}
            <motion.a
              href="https://max.ru/id3604084591_biz"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 transition-all duration-300"
              style={{
                background: 'rgba(237,28,36,0.05)',
                border: '1px solid rgba(237,28,36,0.2)',
                borderRadius: '1rem',
                textDecoration: 'none',
              }}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(237,28,36,0.45)';
                e.currentTarget.style.background = 'rgba(237,28,36,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(237,28,36,0.2)';
                e.currentTarget.style.background = 'rgba(237,28,36,0.05)';
              }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(237,28,36,0.15)',
                  border: '1px solid rgba(237,28,36,0.3)',
                  borderRadius: '0.75rem',
                }}
              >
                <ExternalLink size={16} style={{ color: 'var(--ms-orange)' }} />
              </div>
              <div className="flex-1">
                <div
                  style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: '0.58rem',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'rgba(26,26,46,0.3)',
                    marginBottom: '3px',
                  }}
                >
                  Наши работы
                </div>
                <div
                  style={{
                    fontFamily: 'Barlow Condensed, sans-serif',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--ms-orange)',
                    letterSpacing: '0.02em',
                  }}
                >
                  Канал MAX — 500+ объектов
                </div>
                <div
                  style={{
                    fontFamily: 'Barlow, sans-serif',
                    fontSize: '0.75rem',
                    color: 'rgba(26,26,46,0.45)',
                    fontWeight: 300,
                  }}
                >
                  Фото и видео реализованных проектов
                </div>
              </div>
            </motion.a>

            {/* Guarantee badge */}
            <div
              className="p-5 mt-4"
              style={{
                background: 'rgba(237,28,36,0.06)',
                border: '1px solid rgba(237,28,36,0.2)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 flex items-center justify-center" style={{ background: 'rgba(237,28,36,0.15)', border: '1px solid rgba(237,28,36,0.3)' }}>
                  <Check size={14} style={{ color: 'var(--ms-orange)' }} />
                </div>
                <span className="ms-heading" style={{ fontSize: '0.95rem', color: '#1A1A2E' }}>
                  Гарантия 5 лет
                </span>
              </div>
              <p style={{ fontFamily: 'Barlow, sans-serif', fontSize: '0.8rem', color: 'rgba(26,26,46,0.5)', fontWeight: 300, lineHeight: 1.6 }}>
                Фиксированная цена в договоре. Сроки соблюдаются. Гарантия на конструкции и монтаж — 5 лет.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

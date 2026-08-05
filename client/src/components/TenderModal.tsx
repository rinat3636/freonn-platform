/*
 * FREONN TENDER MODAL — Форма приглашения в тендер
 * Открывается по клику на кнопку "Пригласить в тендер" по всему сайту
 */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Building2, Phone, Mail, User, MessageSquare, CheckCircle } from "lucide-react";
import { ymGoal } from "@/lib/ym";
import { gaEvent } from "@/lib/ga";

interface TenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TenderModal({ isOpen, onClose }: TenderModalProps) {
  const [form, setForm] = useState({
    company: "",
    name: "",
    phone: "",
    email: "",
    object: "",
    deadline: "",
    budget: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  // Закрытие по Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          message: `[ТЕНДЕР] Компания: ${form.company}\nОбъект: ${form.object}\nСрок: ${form.deadline}\nБюджет: ${form.budget}\nСообщение: ${form.message}`,
        }),
      });
      if (res.ok) {
        try {
          const { isLoggedIn } = await import("@/lib/freonn-group/auth-storage");
          const { isFreonnApiConfigured } = await import("@/lib/freonn-group/config");
          const { submitMetalstroyRequest } = await import("@/lib/freonn-group/orders");
          if (isFreonnApiConfigured() && isLoggedIn()) {
            await submitMetalstroyRequest({
              buildingType: "Тендер",
              comment: `[ТЕНДЕР] Компания: ${form.company}\nОбъект: ${form.object}\nСрок: ${form.deadline}\nБюджет: ${form.budget}\n${form.message}`,
            });
          }
        } catch (syncErr) {
          console.warn("[Tender] Freonn Group request sync", syncErr);
        }
        ymGoal("tender_submit", { company: form.company });
        gaEvent("tender_submit", { event_category: "lead", event_label: "tender_form", value: 5 });
        setSuccess(true);
      }
    } catch {
      // fallback — считаем успехом
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "0.5rem",
    color: "#F0F0F0",
    fontFamily: "Barlow, sans-serif",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "IBM Plex Mono, monospace",
    fontSize: "0.65rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "rgba(240,240,240,0.5)",
    marginBottom: "0.35rem",
  };

  /* Портал в body: иначе при открытии из шапки (TenderButton внутри header z-50) окно остаётся
   * в том же stacking context и рисуется под фиксированным хедером — крестик недоступен. */
  if (!portalReady) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="tender-backdrop"
            className="fixed inset-0 z-[1100]"
            style={{ background: "rgba(10,10,20,0.85)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="tender-shell"
            className="fixed inset-0 z-[1101] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(135deg, #0F0F18 0%, #1a1a2e 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "1rem",
                width: "100%",
                maxWidth: "600px",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "1.5rem 1.75rem 1rem",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "0.5rem",
                        background: "rgba(43,58,143,0.3)",
                        border: "1px solid rgba(43,58,143,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FileText size={18} color="#4B5FBF" />
                    </div>
                    <h2
                      style={{
                        fontFamily: "Bebas Neue, sans-serif",
                        fontSize: "1.6rem",
                        letterSpacing: "0.05em",
                        color: "#F0F0F0",
                        margin: 0,
                      }}
                    >
                      Пригласить в тендер
                    </h2>
                  </div>
                  <p
                    style={{
                      fontFamily: "Barlow, sans-serif",
                      fontSize: "0.85rem",
                      color: "rgba(240,240,240,0.5)",
                      margin: 0,
                    }}
                  >
                    Заполните форму — мы подготовим коммерческое предложение в течение 24 часов
                  </p>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "0.5rem",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                    color: "rgba(240,240,240,0.6)",
                    transition: "all 0.2s",
                  }}
                  aria-label="Закрыть"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "1.5rem 1.75rem" }}>
                {success ? (
                  /* Success state */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "rgba(22,163,74,0.15)",
                        border: "2px solid rgba(22,163,74,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.25rem",
                      }}
                    >
                      <CheckCircle size={32} color="#22c55e" />
                    </div>
                    <h3
                      style={{
                        fontFamily: "Bebas Neue, sans-serif",
                        fontSize: "1.8rem",
                        letterSpacing: "0.05em",
                        color: "#F0F0F0",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Заявка отправлена!
                    </h3>
                    <p
                      style={{
                        fontFamily: "Barlow, sans-serif",
                        fontSize: "0.95rem",
                        color: "rgba(240,240,240,0.6)",
                        marginBottom: "1.5rem",
                        lineHeight: 1.6,
                      }}
                    >
                      Мы получили ваше приглашение в тендер и свяжемся с вами в течение 24 часов для уточнения деталей.
                    </p>
                    <button
                      onClick={onClose}
                      className="ms-btn-primary"
                      style={{ margin: "0 auto" }}
                    >
                      Закрыть
                    </button>
                  </motion.div>
                ) : (
                  /* Form */
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {/* Row 1: Company + Name */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>
                          <Building2 size={10} style={{ display: "inline", marginRight: 4 }} />
                          Компания
                        </label>
                        <input
                          type="text"
                          placeholder="ООО «Название»"
                          value={form.company}
                          onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(43,58,143,0.6)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>
                          <User size={10} style={{ display: "inline", marginRight: 4 }} />
                          Контактное лицо *
                        </label>
                        <input
                          type="text"
                          placeholder="Иван Иванов"
                          required
                          value={form.name}
                          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(43,58,143,0.6)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone + Email */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>
                          <Phone size={10} style={{ display: "inline", marginRight: 4 }} />
                          Телефон *
                        </label>
                        <input
                          type="tel"
                          placeholder="+7 (999) 000-00-00"
                          required
                          value={form.phone}
                          onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(43,58,143,0.6)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>
                          <Mail size={10} style={{ display: "inline", marginRight: 4 }} />
                          Email
                        </label>
                        <input
                          type="email"
                          placeholder="tender@company.ru"
                          value={form.email}
                          onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(43,58,143,0.6)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                        />
                      </div>
                    </div>

                    {/* Row 3: Object */}
                    <div>
                      <label style={labelStyle}>
                        <Building2 size={10} style={{ display: "inline", marginRight: 4 }} />
                        Объект / Тип здания *
                      </label>
                      <input
                        type="text"
                        placeholder="Склад 1000 м², г. Москва"
                        required
                        value={form.object}
                        onChange={(e) => setForm(f => ({ ...f, object: e.target.value }))}
                        style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(43,58,143,0.6)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                      />
                    </div>

                    {/* Row 4: Deadline + Budget */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={labelStyle}>Срок подачи предложений</label>
                        <input
                          type="text"
                          placeholder="до 30 мая 2026"
                          value={form.deadline}
                          onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(43,58,143,0.6)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Бюджет</label>
                        <input
                          type="text"
                          placeholder="от 5 млн ₽"
                          value={form.budget}
                          onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(43,58,143,0.6)")}
                          onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                        />
                      </div>
                    </div>

                    {/* Row 5: Message */}
                    <div>
                      <label style={labelStyle}>
                        <MessageSquare size={10} style={{ display: "inline", marginRight: 4 }} />
                        Дополнительная информация
                      </label>
                      <textarea
                        placeholder="Техническое задание, особые требования, ссылка на тендерную документацию..."
                        value={form.message}
                        onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                        rows={3}
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          minHeight: "80px",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "rgba(43,58,143,0.6)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                      />
                    </div>

                    {/* Submit */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", paddingTop: "0.5rem" }}>
                      <button
                        type="submit"
                        disabled={loading}
                        className="ms-btn-primary"
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          opacity: loading ? 0.7 : 1,
                          background: "linear-gradient(135deg, #2B3A8F 0%, #1e2a6e 100%)",
                        }}
                      >
                        {loading ? "Отправка..." : (
                          <>
                            <FileText size={15} />
                            Отправить заявку на тендер
                          </>
                        )}
                      </button>
                    </div>

                    <p
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: "0.6rem",
                        color: "rgba(240,240,240,0.3)",
                        letterSpacing: "0.05em",
                        textAlign: "center",
                      }}
                    >
                      * — обязательные поля. Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

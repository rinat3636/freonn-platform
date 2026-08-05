/**
 * FreonnAIChat — AI consultant widget powered by Groq
 *
 * SAFETY: Uses useGroqChat hook which has full graceful fallback.
 * If Groq is unavailable — shows static contact info, never crashes.
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Sparkles, User, Loader2, AlertCircle, Phone, CheckCircle2 } from "lucide-react";
import { useGroqChat } from "@/hooks/useGroqChat";
import { ymGoal } from "@/lib/ym";

const SUGGESTED_PROMPTS = [
  "Сколько стоит строительство ангара?",
  "Работаете ли вы по всей России?",
  "Как быстро можно построить склад?",
  "Какие гарантии вы даёте?",
];

const WELCOME_MESSAGE =
  "Здравствуйте! Я AI-консультант FREONN. Задайте любой вопрос о строительстве промышленных зданий — ангары, склады, производственные и торговые здания под ключ. Отвечу быстро и по делу.";

type PhoneFormState = "hidden" | "open" | "sending" | "sent";

export default function FreonnAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, isLoading, sendMessage, clearMessages, isFallback } = useGroqChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const hasInteracted = useRef(false);

  // Phone form state
  const [phoneForm, setPhoneForm] = useState<PhoneFormState>("hidden");
  const [phoneName, setPhoneName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+7");
  const [phoneError, setPhoneError] = useState("");

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, phoneForm]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Focus phone input when form opens
  useEffect(() => {
    if (phoneForm === "open") {
      setTimeout(() => phoneInputRef.current?.focus(), 100);
    }
  }, [phoneForm]);

  const handleOpen = () => {
    setIsOpen(true);
    if (!hasInteracted.current) {
      ymGoal("ai_chat_open");
      hasInteracted.current = true;
    }
  };

  const handleClose = () => setIsOpen(false);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage(prompt);
  };

  const handleClear = () => {    setPhoneError("");
    setPhoneForm("hidden");
    setPhoneName("");
    setPhoneNumber("+7");
    setPhoneError("");  };

  const handleLeavePhone = () => {
    setPhoneNumber("+7");
    setPhoneForm("open");
    setPhoneError("");
  };

  const handlePhoneSubmit = async () => {
    const phone = phoneNumber.trim();
    const name = phoneName.trim() || "Не указано";
    if (!phone || phone.length < 7) {
      setPhoneError("Введите корректный номер телефона");
      return;
    }
    setPhoneError("");
    setPhoneForm("sending");
    try {
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          message: "Заявка из AI-чата — перезвоните",
          service: "Обратный звонок",
        }),
      });
      if (res.ok) {
        try {
          const { isLoggedIn } = await import("@/lib/freonn-group/auth-storage");
          const { isFreonnApiConfigured } = await import("@/lib/freonn-group/config");
          const { submitMetalstroyRequest } = await import("@/lib/freonn-group/orders");
          if (isFreonnApiConfigured() && isLoggedIn()) {
            await submitMetalstroyRequest({
              buildingType: "Обратный звонок",
              comment: `AI-чат: ${name}, ${phone}`,
            });
          }
        } catch (syncErr) {
          console.warn("[FreonnAIChat] Freonn Group request sync", syncErr);
        }
        setPhoneForm("sent");
        ymGoal("phone_left_in_chat");
      } else {
        setPhoneError("Ошибка отправки. Позвоните нам: 8(800)101-2009");
        setPhoneForm("open");
      }
    } catch {
      setPhoneError("Ошибка сети. Позвоните нам: 8(800)101-2009");
      setPhoneForm("open");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Фиксируем +7 — нельзя удалить
    if (!val.startsWith("+7")) {
      val = "+7" + val.replace(/^\+?7?/, "");
    }
    // Оставляем только цифры после +7
    const digits = val.slice(2).replace(/\D/g, "").slice(0, 10);
    setPhoneNumber("+7" + digits);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handlePhoneSubmit();
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.5 }}
        onClick={handleOpen}
        className={`w-14 h-14 bg-[#2D3092] text-white flex items-center justify-center shadow-xl hover:bg-[#0F1340] transition-colors hover:scale-110 active:scale-95 relative rounded-full ${isOpen ? "hidden" : "flex"}`}
        title="AI-консультант Freonn"
        aria-label="Открыть AI-консультант"
      >
        <MessageCircle size={24} />
        {/* Notification dot */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50"
            style={{ maxHeight: "min(70vh, 560px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0F1340] text-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                  <Sparkles size={16} className="text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">AI-консультант</p>
                  <p className="text-xs text-blue-200 leading-tight">FREONN · Промышленные здания</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-blue-200 hover:text-white transition-colors px-2 py-1 rounded"
                    title="Очистить чат"
                  >
                    Очистить
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Закрыть"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Fallback warning */}
            {isFallback && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-xs">
                <AlertCircle size={14} className="shrink-0" />
                <span>AI временно недоступен — показываем контактную информацию</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Welcome message */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 shrink-0 rounded-full bg-[#0F1340]/10 flex items-center justify-center mt-0.5">
                  <Sparkles size={14} className="text-[#2D3092]" />
                </div>
                <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-700 max-w-[85%]">
                  {WELCOME_MESSAGE}
                </div>
              </div>

              {/* Suggested prompts (shown when no messages) */}
              {messages.length === 0 && phoneForm === "hidden" && (
                <div className="flex flex-wrap gap-2 pl-9">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestedPrompt(prompt)}
                      disabled={isLoading}
                      className="text-xs bg-[#2D3092]/5 hover:bg-[#2D3092]/10 text-[#2D3092] border border-[#2D3092]/20 rounded-full px-3 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Conversation */}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center mt-0.5 ${
                    msg.role === "user"
                      ? "bg-[#2D3092] text-white"
                      : "bg-[#0F1340]/10"
                  }`}>
                    {msg.role === "user"
                      ? <User size={14} />
                      : <Sparkles size={14} className="text-[#2D3092]" />
                    }
                  </div>
                  <div className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-[#2D3092] text-white rounded-tr-sm"
                      : "bg-gray-50 text-gray-700 rounded-tl-sm"
                  }`}>
                    {msg.content
                      ? msg.content.split("**").map((part, j) =>
                          j % 2 === 1 ? <strong key={j}>{part}</strong> : <span key={j}>{part}</span>
                        )
                      : msg.role === "assistant" && isLoading
                        ? <Loader2 size={14} className="animate-spin text-gray-400" />
                        : null
                    }
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-[#0F1340]/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-[#2D3092]" />
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2">
                    <Loader2 size={14} className="animate-spin text-gray-400" />
                  </div>
                </div>
              )}

              {/* ── Phone form ── */}
              {phoneForm === "open" || phoneForm === "sending" ? (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-[#0F1340]/10 flex items-center justify-center mt-0.5">
                    <Phone size={14} className="text-[#2D3092]" />
                  </div>
                  <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-3 text-sm text-gray-700 max-w-[85%] w-full space-y-2">
                    <p className="font-medium text-[#0F1340]">Оставьте номер — перезвоним в течение 15 минут</p>
                    <input
                      ref={phoneInputRef}
                      type="text"
                      placeholder="Ваше имя (необязательно)"
                      value={phoneName}
                      onChange={e => setPhoneName(e.target.value)}
                      disabled={phoneForm === "sending"}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3092]/30 focus:border-[#2D3092] disabled:opacity-50"
                    />
                    <input
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      onFocus={e => {
                        // Курсор в конец
                        if (e.target.value === "+7") {
                          setTimeout(() => { const el = e.target; el.setSelectionRange(el.value.length, el.value.length); }, 0);
                        }
                        // Скроллим поле в видимую область когда открывается клавиатура
                        setTimeout(() => {
                          e.target.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 300);
                      }}
                      disabled={phoneForm === "sending"}
                      className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3092]/30 focus:border-[#2D3092] disabled:opacity-50"
                    />
                    {phoneError && (
                      <p className="text-xs text-red-500">{phoneError}</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handlePhoneSubmit}
                        disabled={phoneForm === "sending"}
                        className="flex-1 bg-[#B91C1C] hover:bg-[#991B1B] text-white text-sm font-medium rounded-lg py-1.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {phoneForm === "sending"
                          ? <><Loader2 size={14} className="animate-spin" /> Отправка...</>
                          : <><Phone size={14} /> Перезвоните мне</>
                        }
                      </button>
                      <button
                        onClick={() => setPhoneForm("hidden")}
                        disabled={phoneForm === "sending"}
                        className="px-3 text-gray-400 hover:text-gray-600 text-sm transition-colors disabled:opacity-50"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                </div>
              ) : phoneForm === "sent" ? (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <CheckCircle2 size={14} className="text-green-600" />
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-green-800 max-w-[85%]">
                    ✅ Номер получен! Наш менеджер перезвонит вам в течение 15 минут.
                  </div>
                </div>
              ) : null}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100 bg-white">
              {/* Leave phone button */}
              {phoneForm === "hidden" && (
                <button
                  onClick={handleLeavePhone}
                  className="w-full mb-2 flex items-center justify-center gap-2 bg-[#B91C1C]/8 hover:bg-[#B91C1C]/15 text-[#B91C1C] border border-[#B91C1C]/25 rounded-xl py-2 text-sm font-medium transition-colors"
                >
                  <Phone size={15} />
                  Оставить номер — перезвоним
                </button>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Задайте вопрос об инженерных системах..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D3092]/30 focus:border-[#2D3092] max-h-24 overflow-y-auto"
                  style={{ minHeight: "38px" }}
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 shrink-0 bg-[#2D3092] text-white rounded-xl flex items-center justify-center hover:bg-[#0F1340] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Отправить"
                >
                  {isLoading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Send size={16} />
                  }
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 text-center">
                AI-ответы носят информационный характер · <a href="tel:+78001012009" className="underline">8(800)101-2009</a>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

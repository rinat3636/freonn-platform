import { useEffect, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Link2, Phone, Mail, Gift, Bell, ShoppingBag, User } from "lucide-react";
import {
  loginEmail,
  registerAccount,
  sendOtp,
  verifyOtp,
} from "@/lib/freonn-group/auth";
import { isFreonnApiConfigured } from "@/lib/freonn-group/config";
import {
  UNIFIED_ACCOUNT_BENEFITS,
  UNIFIED_ACCOUNT_BRAND,
  UNIFIED_ACCOUNT_SUBTITLE,
  UNIFIED_ACCOUNT_TAGLINE,
} from "@/lib/freonn-group/copy";
import { useFreonnAuth } from "@/contexts/FreonnAuthContext";

type Tab = "phone" | "email" | "register";

export default function UnifiedLoginPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const { refresh } = useFreonnAuth();
  const [tab, setTab] = useState<Tab>("phone");

  useEffect(() => {
    const t = new URLSearchParams(search).get("tab");
    if (t === "phone" || t === "email" || t === "register") {
      setTab(t);
    }
  }, [search]);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!isFreonnApiConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
        <p className="text-slate-600 text-center">
          Настройте VITE_FREONN_API_BASE_URL для единого входа Freonn Group
        </p>
      </div>
    );
  }

  const afterLogin = async () => {
    await refresh();
    navigate("/");
  };

  const onSendOtp = async () => {
    const normalized = phone.replace(/\D/g, "");
    if (normalized.length < 10) {
      setError("Введите корректный телефон");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await sendOtp(normalized);
      setOtpSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка отправки SMS");
    } finally {
      setPending(false);
    }
  };

  const onVerifyOtp = async () => {
    const normalized = phone.replace(/\D/g, "");
    if (otp.length !== 6) {
      setError("Введите 6-значный код");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await verifyOtp(normalized, otp);
      await afterLogin();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неверный код");
    } finally {
      setPending(false);
    }
  };

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await loginEmail(email.trim(), password);
      await afterLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setPending(false);
    }
  };

  const onRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await registerAccount({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.replace(/\D/g, "") || undefined,
        password: password || undefined,
      });
      await afterLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setPending(false);
    }
  };

  const icons = [User, ShoppingBag, Gift, Bell];

  return (
    <div className="min-h-screen bg-[#0b234d] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
          <Link2 size={32} className="text-orange-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{UNIFIED_ACCOUNT_BRAND}</h1>
        <p className="text-white/80 text-sm max-w-md mb-1">{UNIFIED_ACCOUNT_TAGLINE}</p>
        <p className="text-white/50 text-xs max-w-sm">{UNIFIED_ACCOUNT_SUBTITLE}</p>
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["freonn.pro", "Freonn", "Energolyx"].map((b) => (
            <span
              key={b}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/25"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-t-3xl px-4 py-8 max-w-lg w-full mx-auto shadow-xl">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Вход в единый аккаунт</h2>

        <div className="flex gap-2 mb-6">
          {(
            [
              { id: "phone" as const, label: "Телефон", Icon: Phone },
              { id: "email" as const, label: "Email", Icon: Mail },
              { id: "register" as const, label: "Регистрация", Icon: User },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setError(null);
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold border ${
                tab === id
                  ? "bg-[#0b234d] text-white border-[#0b234d]"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="text-red-600 text-sm mb-4 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        ) : null}

        {tab === "phone" ? (
          <div className="space-y-3">
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              placeholder="+7 (999) 000-00-00"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {otpSent ? (
              <>
                <input
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm tracking-widest text-center"
                  placeholder="Код из SMS"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => void onVerifyOtp()}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg disabled:opacity-60"
                >
                  {pending ? "Проверка…" : "Войти"}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => void onSendOtp()}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg disabled:opacity-60"
              >
                {pending ? "Отправка…" : "Получить код"}
              </button>
            )}
          </div>
        ) : null}

        {tab === "email" ? (
          <form onSubmit={(e) => void onEmailLogin(e)} className="space-y-3">
            <input
              type="email"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg disabled:opacity-60"
            >
              {pending ? "Вход…" : "Войти"}
            </button>
          </form>
        ) : null}

        {tab === "register" ? (
          <form onSubmit={(e) => void onRegister(e)} className="space-y-3">
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              placeholder="Телефон"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="password"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm"
              placeholder="Пароль (от 6 символов)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-[#0b234d] hover:bg-[#0a1f42] text-white font-semibold py-3 rounded-lg disabled:opacity-60"
            >
              {pending ? "Создание…" : "Создать аккаунт"}
            </button>
          </form>
        ) : null}

        <ul className="mt-8 space-y-3 border-t border-slate-100 pt-6">
          {UNIFIED_ACCOUNT_BENEFITS.map((b, i) => {
            const Icon = icons[i] ?? Link2;
            return (
              <li key={b.title} className="flex gap-3 text-left">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#0b234d]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{b.title}</p>
                  <p className="text-xs text-slate-500">{b.description}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="text-center text-xs text-slate-400 mt-6">
          Тот же аккаунт, что в{" "}
          <Link href="/" className="text-blue-600 underline">
            приложении Freonn Group
          </Link>
        </p>
      </div>
    </div>
  );
}

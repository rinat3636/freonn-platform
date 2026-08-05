import { Link } from "wouter";
import { Gift, Link2 } from "lucide-react";
import { UNIFIED_ACCOUNT_TAGLINE } from "@/lib/freonn-group/copy";
import { isFreonnApiConfigured } from "@/lib/freonn-group/config";
import { useFreonnAuth } from "@/contexts/FreonnAuthContext";

export default function UnifiedAccountBanner() {
  const { configured, isAuthenticated, user, cashbackBalance, loading } = useFreonnAuth();

  if (!configured || loading) return null;

  if (isAuthenticated && user) {
    return (
      <div className="bg-[#0b234d] text-white text-sm">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-2 px-4">
          <span className="flex items-center gap-2 min-w-0">
            <Link2 size={16} className="text-orange-400 shrink-0" />
            <span className="truncate">
              {user.name || user.phone || user.email} — единый аккаунт Freonn Group
            </span>
          </span>
          <span className="flex items-center gap-3 shrink-0">
            {cashbackBalance > 0 ? (
              <span className="flex items-center gap-1 text-orange-300 font-semibold">
                <Gift size={14} />
                {Math.round(cashbackBalance).toLocaleString("ru-RU")} ₽ кешбэк
              </span>
            ) : null}
            <Link href="/#contact" className="underline text-white/90 text-xs">
              Заявки
            </Link>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 border-b border-slate-200 text-sm">
      <div className="container flex flex-wrap items-center gap-2 py-2.5 px-4">
        <Link2 size={16} className="text-orange-500 shrink-0" />
        <span className="flex-1 min-w-0 text-[#0b234d]">
          <span className="font-bold">Единый аккаунт Freonn Group</span>
          <span className="text-slate-500 hidden sm:inline"> — {UNIFIED_ACCOUNT_TAGLINE}</span>
        </span>
        <Link
          href="/auth/login"
          className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-bold text-white no-underline"
        >
          Войти
        </Link>
        <Link
          href="/auth/login?tab=register"
          className="rounded-md border-2 border-[#0b234d] bg-white px-3 py-1.5 text-xs font-bold text-[#0b234d] no-underline"
        >
          Регистрация
        </Link>
      </div>
    </div>
  );
}

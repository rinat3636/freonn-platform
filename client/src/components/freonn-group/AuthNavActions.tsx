import { Link } from "wouter";
import { LogOut, User } from "lucide-react";
import { useFreonnAuth } from "@/contexts/FreonnAuthContext";
import { isFreonnApiConfigured } from "@/lib/freonn-group/config";

type Variant = "row" | "stack";

type AuthNavActionsProps = {
  variant?: Variant;
  onNavigate?: () => void;
  className?: string;
};

export function AuthNavActions({
  variant = "row",
  onNavigate,
  className = "",
}: AuthNavActionsProps) {
  const auth = useFreonnAuth();
  if (!isFreonnApiConfigured() || auth.loading) return null;

  const done = () => onNavigate?.();

  if (auth.isAuthenticated && auth.user) {
    const name = auth.user.name?.split(" ")[0] ?? "Аккаунт";
    if (variant === "stack") {
      return (
        <div className={`flex flex-col gap-2 px-4 py-3 border-b border-slate-200 ${className}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-[#0b234d] truncate">{name}</span>
            <button
              type="button"
              onClick={() => {
                auth.logout();
                done();
              }}
              className="text-xs text-slate-500 font-semibold underline"
            >
              Выйти
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="flex flex-col items-center gap-0.5 text-[11px] text-slate-600">
          <User size={18} />
          <span className="max-w-[72px] truncate font-bold">{name}</span>
        </span>
        <button
          type="button"
          onClick={() => auth.logout()}
          aria-label="Выйти"
          className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-600"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  const wrap = variant === "stack" ? "flex flex-col gap-2 w-full" : "flex items-center gap-2";
  const btnIn =
    variant === "stack"
      ? "flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold"
      : "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-bold";

  return (
    <div className={`${wrap} ${className}`}>
      <Link
        href="/auth/login"
        onClick={done}
        className={`${btnIn} bg-orange-500 text-white no-underline`}
      >
        <User size={14} />
        Войти
      </Link>
      <Link
        href="/auth/login?tab=register"
        onClick={done}
        className={`${btnIn} border-2 border-[#0b234d] bg-white text-[#0b234d] no-underline`}
      >
        Регистрация
      </Link>
    </div>
  );
}

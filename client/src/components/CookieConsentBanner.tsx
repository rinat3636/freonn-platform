import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

type Props = {
  onAccept: () => Promise<void>;
  onDecline: () => void;
};

export default function CookieConsentBanner({ onAccept, onDecline }: Props) {
  const [busy, setBusy] = useState(false);

  const handleAccept = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await onAccept();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-[#0F0F18]/95 p-4 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md md:p-5"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="container mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="min-w-0 space-y-2 text-sm leading-relaxed text-white/90">
          <p id="cookie-consent-title" className="font-semibold text-white">
            Файлы cookie и аналитика
          </p>
          <p id="cookie-consent-desc" className="text-white/80">
            Мы используем cookie и сервисы веб-аналитики (Яндекс.Метрика, Google Analytics) для
            обезличенной статистики посещений. Технические cookie нужны для работы сайта. Вы можете
            принять аналитику или отказаться — в последнем случае счётчики не загружаются.
          </p>
          <p className="text-xs text-white/55">
            Подробнее:{" "}
            <Link
              href="/politika-konfidencialnosti"
              className="text-[#ED1C24] underline-offset-2 hover:underline"
            >
              Политика конфиденциальности
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            onClick={onDecline}
            disabled={busy}
          >
            Отклонить аналитику
          </Button>
          <Button
            type="button"
            variant="default"
            className="bg-[#D31622] text-white hover:bg-[#D31622]/90 font-bold"
            onClick={handleAccept}
            disabled={busy}
          >
            {busy ? "Загрузка…" : "Принять"}
          </Button>
        </div>
      </div>
    </div>
  );
}

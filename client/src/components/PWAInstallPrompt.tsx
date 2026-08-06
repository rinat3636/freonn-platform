import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";

export function PWAInstallPrompt() {
  const promptRef = useRef<any>(null);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e;
      toast.info("Установить Freonn Platform", {
        duration: 10000,
        action: {
          label: (
            <span className="inline-flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              Установить
            </span>
          ),
          onClick: () => {
            const prompt = promptRef.current;
            if (!prompt) return;
            prompt.prompt();
            prompt.userChoice.then((choice: { outcome: string }) => {
              promptRef.current = null;
              if (choice.outcome === "accepted") {
                toast.success("Приложение установлено");
              }
            });
          },
        },
      });
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return null;
}

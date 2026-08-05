import { usePwaInstall } from "@/hooks/usePwaInstall";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";

export function PWAInstallButton({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const { isInstalled, canInstall, install } = usePwaInstall();

  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2 text-xs text-muted-foreground ${variant === "sidebar" ? "px-3 py-2" : ""}`}>
        <Check className="h-4 w-4" /> Установлено
      </div>
    );
  }
  if (!canInstall) return null;

  return (
    <Button variant="outline" size="sm" className={variant === "sidebar" ? "w-full justify-start" : ""} onClick={() => install()}>
      <Download className="mr-2 h-4 w-4" />
      Установить приложение
    </Button>
  );
}

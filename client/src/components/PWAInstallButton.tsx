import { usePwaInstall } from "@/hooks/usePwaInstall";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";

export function PWAInstallButton({ variant = "default" }: { variant?: "default" | "sidebar" }) {
  const { isInstalled, canInstall, install } = usePwaInstall();

  if (isInstalled) {
    return (
      <div className={`flex items-center gap-2 text-xs font-medium text-muted-foreground ${variant === "sidebar" ? "px-3 py-2.5 rounded-xl bg-muted/50" : ""}`}>
        <Check className="h-4 w-4 text-emerald-600" /> Установлено
      </div>
    );
  }
  if (!canInstall) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className={`border-dashed hover:border-primary/40 hover:bg-primary/5 ${variant === "sidebar" ? "w-full justify-start h-10 rounded-xl" : ""}`}
      onClick={() => install()}
    >
      <Download className="mr-2 h-4 w-4" />
      Установить приложение
    </Button>
  );
}

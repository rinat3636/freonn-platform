import { useEffect, useState } from "react";

export function usePwaInstall() {
  const [prompt, setPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const ready = () => setIsInstalled(true);
    if (window.matchMedia("(display-mode: standalone)").matches) ready();

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const install = async () => {
    if (!prompt) return false;
    prompt.prompt();
    const result = await prompt.userChoice;
    setPrompt(null);
    return result?.outcome === "accepted";
  };

  return { isInstalled, canInstall: !!prompt, install };
}

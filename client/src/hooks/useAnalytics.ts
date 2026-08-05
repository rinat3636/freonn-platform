import { useEffect } from "react";
import { gaEvent } from "@/lib/ga";
import { ymGoal } from "@/lib/ym";

const EXT_DOWNLOADS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".rar"];
const SCROLL_MILESTONES = [50, 90];

function trackInteraction(href: string, label?: string) {
  if (!href) return;
  let type = "link_click";
  let name = label || href;

  if (href.startsWith("tel:")) {
    type = "phone_click";
    name = label || "phone";
  } else if (href.startsWith("mailto:")) {
    type = "email_click";
    name = label || "email";
  } else if (href.includes("wa.me") || href.includes("whatsapp")) {
    type = "whatsapp_click";
    name = label || "whatsapp";
  } else if (EXT_DOWNLOADS.some((ext) => href.toLowerCase().endsWith(ext))) {
    type = "file_download";
    name = label || href.split("/").pop() || "download";
  }

  ymGoal(type, { target: name });
  gaEvent(type, { method: name, link_url: href });

  if (type === "phone_click" || type === "email_click" || type === "whatsapp_click") {
    gaEvent("generate_lead", { method: type, link_url: href, page_path: window.location.pathname });
  }
}

export function useAnalytics() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      trackInteraction(href, anchor.textContent?.trim() || anchor.getAttribute("aria-label") || undefined);
    };

    document.addEventListener("click", onClick);

    const reached = new Set<number>();
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
        for (const milestone of SCROLL_MILESTONES) {
          if (pct >= milestone && !reached.has(milestone)) {
            reached.add(milestone);
            ymGoal(`scroll_${milestone}`, { page: window.location.pathname });
            gaEvent(`scroll_${milestone}`, { percent: milestone, page_path: window.location.pathname });
          }
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}

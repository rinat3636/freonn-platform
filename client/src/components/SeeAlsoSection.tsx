import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { SeeAlsoItem } from "@/data/seeAlsoForPages";
import { gaEvent } from "@/lib/ga";
import { ymGoal } from "@/lib/ym";

type Props = {
  title?: string;
  lead?: string;
  items: SeeAlsoItem[];
  /** Тёмный блок (гео) или светлый (лендинги, каталог). */
  variant?: "dark" | "light";
  /** Если задан — цель Метрики/GA при клике по карточке. */
  trackSource?: string;
};

function trackSeeAlso(trackSource: string | undefined, href: string) {
  if (!trackSource) return;
  ymGoal("see_also_click", { source: trackSource, href });
  gaEvent("see_also_click", { event_category: "cross_nav", event_label: href, value: 1 });
}

function SeeAlsoCard({
  item,
  index,
  variant,
  trackSource,
}: {
  item: SeeAlsoItem;
  index: number;
  variant: "dark" | "light";
  trackSource?: string;
}) {
  const isLight = variant === "light";
  const className = isLight
    ? "flex items-start gap-3 bg-white border rounded-xl p-4 transition-all group text-left w-full shadow-sm border-gray-200 hover:border-red-300 hover:shadow-md"
    : "flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4 hover:border-red-500/40 hover:bg-red-500/5 transition-all group text-left w-full";

  const titleClass = isLight
    ? "text-gray-900 font-semibold group-hover:text-red-600 transition-colors"
    : "text-white font-semibold group-hover:text-red-400 transition-colors";
  const descClass = isLight ? "text-gray-600 text-sm mt-1 leading-snug" : "text-gray-500 text-sm mt-1 leading-snug";
  const chevronClass = isLight
    ? "w-4 h-4 text-gray-400 mt-1 shrink-0 group-hover:text-red-500 transition-colors"
    : "w-4 h-4 text-gray-600 mt-1 shrink-0 group-hover:text-red-400 transition-colors";

  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className={titleClass}>{item.label}</div>
        <div className={descClass}>{item.description}</div>
      </div>
      <ChevronRight className={chevronClass} />
    </>
  );

  if (item.href.startsWith("/#")) {
    return (
      <motion.li
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
      >
        <a
          href={item.href}
          className={className}
          onClick={() => trackSeeAlso(trackSource, item.href)}
        >
          {inner}
        </a>
      </motion.li>
    );
  }

  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <Link
        href={item.href}
        className={className}
        onClick={() => trackSeeAlso(trackSource, item.href)}
      >
        {inner}
      </Link>
    </motion.li>
  );
}

export default function SeeAlsoSection({
  title = "Смотрите также",
  lead = "Связные разделы и инструменты — без лишних кликов.",
  items,
  variant = "dark",
  trackSource,
}: Props) {
  if (items.length === 0) return null;

  const isLight = variant === "light";

  return (
    <section
      className={isLight ? "py-16 border-t border-gray-200" : "py-16 border-t border-white/5"}
      style={isLight ? { background: "#f4f4f8" } : { background: "rgba(255,255,255,0.02)" }}
      aria-labelledby="see-also-heading"
    >
      <div className="container max-w-6xl mx-auto px-4">
        <h2
          id="see-also-heading"
          className={isLight ? "text-3xl font-black text-gray-900 mb-3" : "text-3xl font-black text-white mb-3"}
        >
          {title}
        </h2>
        <p className={isLight ? "text-gray-600 mb-8 max-w-2xl" : "text-gray-400 mb-8 max-w-2xl"}>{lead}</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none p-0 m-0">
          {items.map((item, i) => (
            <SeeAlsoCard key={item.href} item={item} index={i} variant={variant} trackSource={trackSource} />
          ))}
        </ul>
      </div>
    </section>
  );
}

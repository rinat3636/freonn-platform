/**
 * Сопоставление строк сметы WebSteel (текст + сумма) с полями,
 * которые ожидают PDF/график оплат (комплект, доставка, монтаж, фундамент).
 */
import type { WebsteelPriceLine } from "./websteel";

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Разбор строк таблицы WebSteel → статьи для `computeKpBreakdown`-совместимой структуры */
export function mapWebsteelLinesToParts(
  lines: WebsteelPriceLine[],
  totalRub: number
): { kitMid: number; deliveryRub: number; montazhRub: number; fundamentRub: number; otherRub: number } {
  let kit = 0;
  let deliveryRub = 0;
  let montazhRub = 0;
  let fundamentRub = 0;
  let other = 0;

  for (const { label, amountRub } of lines) {
    if (!Number.isFinite(amountRub) || amountRub <= 0) continue;
    const L = norm(label);
    if (L.includes("доставк")) deliveryRub += amountRub;
    else if (L.includes("монтаж")) montazhRub += amountRub;
    else if (L.includes("фундамент") || (L.includes("земельн") && L.includes("работ"))) fundamentRub += amountRub;
    else if (
      L.includes("комплект") ||
      L.includes("здания") ||
      L.includes("металлокаркас") ||
      L.includes("лстк") ||
      L.includes("сэндвич") ||
      L.includes("кровл") ||
      L.includes("стенов") ||
      L.includes("изготовлен") ||
      L.includes("конструкт")
    )
      kit += amountRub;
    else other += amountRub;
  }

  const kitBucket = kit + other;
  let kitMid = kitBucket;
  if (totalRub > 0) {
    const fixed = Math.round(deliveryRub + montazhRub + fundamentRub);
    const rest = Math.round(totalRub - fixed);
    if (rest > 0) {
      kitMid = rest;
    } else if (kitBucket <= 0) {
      kitMid = totalRub;
    } else {
      kitMid = Math.max(0, Math.round(kitBucket));
    }
  }

  return {
    kitMid: Math.max(0, Math.round(kitMid)),
    deliveryRub: Math.max(0, Math.round(deliveryRub)),
    montazhRub: Math.max(0, Math.round(montazhRub)),
    fundamentRub: Math.max(0, Math.round(fundamentRub)),
    otherRub: 0,
  };
}

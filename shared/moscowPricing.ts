/** Ориентиры ₽/m² для Москвы (МКАД) и база для периферии МО. */

export const MOSCOW_ANGAR_RUB_M2 = 9775;
export const MOSCOW_SKLAD_RUB_M2 = 9180;
export const MOSCOW_TSEKH_RUB_M2 = 13_800;

/** База для geo/hub в Подмосковье (× priceCoeff). */
export const MO_BASE_RUB_M2 = 8500;
export const MO_PROIZVODSTVO_BASE_RUB_M2 = 12_000;

export type MoscowBuildingKind = "angar" | "sklad" | "proizvodstvo" | "angary";

export function normalizeBuildingKind(kind: MoscowBuildingKind): "angar" | "sklad" | "proizvodstvo" {
  if (kind === "angary") return "angar";
  return kind;
}

export function moscowAngarPriceForSize(sizeM2: number): number {
  return Math.round(sizeM2 * MOSCOW_ANGAR_RUB_M2);
}

export function moscowSkladPriceForSize(sizeM2: number): number {
  return Math.round(sizeM2 * MOSCOW_SKLAD_RUB_M2);
}

export function moscowTsekhPriceForSize(sizeM2: number): number {
  return Math.round(sizeM2 * MOSCOW_TSEKH_RUB_M2);
}

export function moscowPriceForKind(kind: MoscowBuildingKind, sizeM2: number): number {
  const k = normalizeBuildingKind(kind);
  if (k === "sklad") return moscowSkladPriceForSize(sizeM2);
  if (k === "proizvodstvo") return moscowTsekhPriceForSize(sizeM2);
  return moscowAngarPriceForSize(sizeM2);
}

export function moscowRubM2ForKind(kind: MoscowBuildingKind): number {
  const k = normalizeBuildingKind(kind);
  if (k === "sklad") return MOSCOW_SKLAD_RUB_M2;
  if (k === "proizvodstvo") return MOSCOW_TSEKH_RUB_M2;
  return MOSCOW_ANGAR_RUB_M2;
}

export function peripheralMoRubM2(
  priceCoeff: number,
  kind: "angar" | "sklad" | "proizvodstvo" = "angar",
): number {
  const base = kind === "proizvodstvo" ? MO_PROIZVODSTVO_BASE_RUB_M2 : MO_BASE_RUB_M2;
  return Math.round(base * priceCoeff);
}

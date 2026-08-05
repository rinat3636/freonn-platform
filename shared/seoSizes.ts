/** Размеры для combo «тип + Москва» и standalone sklad/tsekh (семантика Я.Директ). */
export const MOSCOW_COMBO_SIZES = [500, 1000, 1500, 2000, 3000, 5000] as const;
export const STANDALONE_KIND_SIZES = MOSCOW_COMBO_SIZES;
/** Combo «размер + Tier 1 MO» — только площади с высоким intent. */
export const MO_TIER1_COMBO_SIZES = [1000, 2000] as const;
export type MoscowComboSize = (typeof MOSCOW_COMBO_SIZES)[number];
export type MoTier1ComboSize = (typeof MO_TIER1_COMBO_SIZES)[number];

export function isMoscowComboSize(size: number): size is MoscowComboSize {
  return (MOSCOW_COMBO_SIZES as readonly number[]).includes(size);
}

export function isMoTier1ComboSize(size: number): size is MoTier1ComboSize {
  return (MO_TIER1_COMBO_SIZES as readonly number[]).includes(size);
}

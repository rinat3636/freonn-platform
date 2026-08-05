import { CALCULATOR_BUILDING_TYPES, type CalculatorBuildingType } from "@shared/buildingCatalog";

/** Как на `BuildingTypePage`: лендинг по умолчанию для категории калькулятора */
const CATEGORY_LANDING: Record<string, string> = {
  popular: "/angary",
  selhoz: "/selskokhozyaystvennye-zdaniya",
  commercial: "/sklady",
  common: "/angary",
  tech: "/angary",
  sport: "/sportivnye-sooruzheniya",
  industry: "/proizvodstvennye-zdaniya",
};

function landingSlugForCategory(categoryId: string): string {
  return CATEGORY_LANDING[categoryId] ?? "/";
}

/** Лендинги, где привязка идёт не только через `CATEGORY_LANDING` */
const LANDING_HANDPICK: Record<string, readonly string[]> = {
  "/torgovye-zdaniya": [
    "torgovye_zdaniya",
    "torgovye_centry",
    "rynki",
    "kafe",
    "apteki",
    "ofisnoe_zdanie",
    "teplye_sklady",
    "sklady",
  ],
};

/** Типы из калькулятора, релевантные SEO-лендингу (для блока внутренних ссылок). */
export function buildingTypesForSeoLanding(landingSlug: string, limit = 14): CalculatorBuildingType[] {
  const hand = LANDING_HANDPICK[landingSlug];
  if (hand) {
    const byId = new Map(CALCULATOR_BUILDING_TYPES.map((t) => [t.id, t]));
    const out = hand.map((id) => byId.get(id)).filter((t): t is CalculatorBuildingType => Boolean(t));
    return out.slice(0, limit);
  }
  const list = CALCULATOR_BUILDING_TYPES.filter((t) => landingSlugForCategory(t.categoryId) === landingSlug);
  return list.slice(0, limit);
}

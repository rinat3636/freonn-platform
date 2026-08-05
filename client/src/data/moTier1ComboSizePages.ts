/**
 * Combo size-страницы: размер × Tier 1 MO (Podolsk, Himki, …).
 * MO-first SEO: /angar-1000-m2-podolsk, /sklad-2000-m2-himki, …
 */
import { moCityHasProizvodstvo, moCityHasSklad } from "@shared/moCityCapabilities";
import { peripheralMoRubM2 } from "@shared/moscowPricing";
import { MO_TIER1_CITIES } from "./moGeoCities";
import type { SizePage } from "./sizePages";

const SKLAD_USE_CASES: Record<number, string[]> = {
  1000: ["Логистический хаб", "Склад класса B", "Fulfilment", "Транзитный склад", "Производственный склад"],
  2000: ["Региональный РЦ", "Склад класса A/B", "Холодильный склад", "Склад маркетплейса", "Склад с доками"],
};

const TSEKH_USE_CASES: Record<number, string[]> = {
  1000: ["Машиностроение", "Приборостроение", "Сборочное производство", "Цех с краном 5 т", "Лёгкая промышленность"],
  2000: ["Заводской корпус", "Цех с мостовым краном", "Авиакосмический кластер", "Логистика + производство", "Комплекс с АБК"],
};

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

function moTier1AngarCombo(base: SizePage, city: (typeof MO_TIER1_CITIES)[number]): SizePage {
  const rubM2 = peripheralMoRubM2(city.priceCoeff, "angar");
  const cold = Math.round(base.size * rubM2);
  const warm = Math.round(cold * 1.35);
  return {
    ...base,
    slug: `/angar-${base.size}-m2-${city.slugKey}`,
    geoCity: city.city,
    geoSlugKey: city.slugKey,
    buildingKind: "angar",
    priceFrom: cold,
    priceTo: Math.round(cold * 1.2),
    title: `Ангар ${base.size} м² в ${city.cityPred} — от ${fmt(cold)} ₽ | Freonn`,
    metaDescription: `Ангар ${base.size} m² в ${city.cityPred} под ключ от ${fmt(cold)} ₽ (${fmt(rubM2)} ₽/m²). ${city.region}. Выезд инженера за 24 ч. 8(800)101-2009`,
    h1: `Ангар ${base.size} m² в ${city.cityPred} под ключ`,
    intro: `Ангар ${base.size} m² (${base.width}×${base.length} m) в ${city.cityPred} и ${city.region}. ${city.intro} Freonn — ${fmt(rubM2)} ₽/m², монтаж от ${city.deliveryDays.split("–")[0]} дней, ${city.completedProjects} объектов в регионе.`,
    specs: base.specs.map((s) => {
      if (s.label === "Цена без утепления") return { ...s, value: `от ${fmt(cold)} ₽` };
      if (s.label === "Цена с утеплением") return { ...s, value: `от ${fmt(warm)} ₽` };
      if (s.label === "Срок монтажа") return { ...s, value: `${city.deliveryDays} дней` };
      return s;
    }),
    faq: [
      {
        q: `Сколько стоит ангар ${base.size} m² в ${city.cityPred}?`,
        a: `Ориентир — от ${fmt(cold)} ₽ (${fmt(rubM2)} ₽/m²). Точная смета после ТЗ и геологии участка в ${city.cityPred}.`,
      },
      {
        q: `За сколько построят ангар в ${city.cityRod}?`,
        a: `Монтаж каркаса — ${city.deliveryDays} дней после фундамента. Доставка МК из центрального региона — 1 день.`,
      },
      {
        q: "Работаете ли вы в Москве и области?",
        a: "Да. Офис Freonn на Варшавском шоссе в Москве, выезд инженера в Подмосковье — в течение 24 часов.",
      },
    ],
  };
}

function moTier1SkladCombo(base: SizePage, city: (typeof MO_TIER1_CITIES)[number]): SizePage {
  const rubM2 = peripheralMoRubM2(city.priceCoeff, "sklad");
  const cold = Math.round(base.size * rubM2);
  const warm = Math.round(cold * 1.35);
  const useCases = SKLAD_USE_CASES[base.size] ?? base.useCases;
  return {
    ...base,
    buildingKind: "sklad",
    slug: `/sklad-${base.size}-m2-${city.slugKey}`,
    geoCity: city.city,
    geoSlugKey: city.slugKey,
    priceFrom: cold,
    priceTo: Math.round(cold * 1.25),
    title: `Склад ${base.size} m² в ${city.cityPred} — от ${fmt(cold)} ₽ | Freonn`,
    metaDescription: `Склад ${base.size} m² в ${city.cityPred} под ключ от ${fmt(cold)} ₽. Логистика, доки, класс B. 8(800)101-2009`,
    h1: `Склад ${base.size} m² в ${city.cityPred} под ключ`,
    intro: `Склад ${base.size} m² в ${city.cityPred}: логистика, fulfilment, класс B. ${city.intro} Freonn — ${fmt(rubM2)} ₽/m², монтаж ${city.deliveryDays} дней.`,
    useCases,
    specs: base.specs.map((s) => {
      if (s.label === "Цена без утепления") return { label: "Холодный склад", value: `от ${fmt(cold)} ₽` };
      if (s.label === "Цена с утеплением") return { label: "Класс B", value: `от ${fmt(warm)} ₽` };
      if (s.label === "Срок монтажа") return { ...s, value: `${city.deliveryDays} дней` };
      return s;
    }),
    faq: [
      {
        q: `Сколько стоит склад ${base.size} m² в ${city.cityPred}?`,
        a: `Холодный склад — от ${fmt(cold)} ₽; с утеплением класса B — от ${fmt(warm)} ₽.`,
      },
    ],
  };
}

function moTier1TsekhCombo(base: SizePage, city: (typeof MO_TIER1_CITIES)[number]): SizePage {
  const rubM2 = peripheralMoRubM2(city.priceCoeff, "proizvodstvo");
  const cold = Math.round(base.size * rubM2);
  const withCrane = Math.round(cold * 1.18);
  const useCases = TSEKH_USE_CASES[base.size] ?? base.useCases;
  return {
    ...base,
    buildingKind: "proizvodstvo",
    slug: `/tsekh-${base.size}-m2-${city.slugKey}`,
    geoCity: city.city,
    geoSlugKey: city.slugKey,
    priceFrom: cold,
    priceTo: Math.round(cold * 1.22),
    title: `Производственный цех ${base.size} m² в ${city.cityPred} — от ${fmt(cold)} ₽ | Freonn`,
    metaDescription: `Цех ${base.size} m² в ${city.cityPred} под ключ от ${fmt(cold)} ₽. Крановые пути, пролёты. 8(800)101-2009`,
    h1: `Производственный цех ${base.size} m² в ${city.cityPred} под ключ`,
    intro: `Производственное здание ${base.size} m² в ${city.cityPred}: усиленные пролёты, кран 3–5 т. ${city.intro} Freonn — ${fmt(rubM2)} ₽/m² без крана.`,
    useCases,
    specs: base.specs.map((s) => {
      if (s.label === "Цена без утепления") return { label: "Без крана", value: `от ${fmt(cold)} ₽` };
      if (s.label === "Цена с утеплением") return { label: "С краном 5 т", value: `от ${fmt(withCrane)} ₽` };
      if (s.label === "Срок монтажа") return { ...s, value: `${city.deliveryDays} дней` };
      return s;
    }),
    faq: [
      {
        q: `Сколько стоит цех ${base.size} m² в ${city.cityPred}?`,
        a: `Без крана — от ${fmt(cold)} ₽; с мостовым краном 5 т — от ${fmt(withCrane)} ₽.`,
      },
    ],
  };
}

function pagesForCity(city: (typeof MO_TIER1_CITIES)[number], bases: SizePage[]): SizePage[] {
  const out: SizePage[] = [];
  for (const base of bases) {
    out.push(moTier1AngarCombo(base, city));
    if (moCityHasSklad(city.slugKey)) out.push(moTier1SkladCombo(base, city));
    if (moCityHasProizvodstvo(city.slugKey)) out.push(moTier1TsekhCombo(base, city));
  }
  return out;
}

/** Генерация combo size × Tier 1 MO (без циклического import sizePages). */
export function buildMoTier1ComboSizePages(bases: SizePage[]): SizePage[] {
  return MO_TIER1_CITIES.flatMap((city) => pagesForCity(city, bases));
}

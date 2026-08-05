/** SEO-хаб «Московская область» — `/moskovskaya-oblast`. */
import { peripheralMoRubM2 } from "@shared/moscowPricing";
import { buildingKindLabel, moscowComboLinksForKind, MO_HUB_SLUG, type MoscowBuildingKind } from "@shared/moSeo";
import { skladSizePages, tsekhSizePages } from "./sizePages";
import { moCityHasProizvodstvo, moCityHasSklad } from "@shared/moCityCapabilities";
import { MO_TIER1_CITIES, MO_TIER2_CITIES, MO_TIER3_CITIES, type MoCitySeed } from "./moGeoCities";

export { MO_HUB_SLUG };

export type MoHubCityLink = {
  slugKey: string;
  city: string;
  angaryHref: string;
  skladyHref?: string;
  proizvodstvoHref?: string;
  priceFrom: string;
};

export const moHubPage = {
  slug: MO_HUB_SLUG,
  h1: "Строительство ангаров и складов в Московской области",
  title: "Ангары и склады в Московской области под ключ | Freonn",
  metaDescription:
    "Строительство ангаров, складов и цехов в Московской области: 40+ городов, выезд за 24 ч, 87+ объектов в регионе. Офис в Москве. 8(800)101-2009",
  lead:
    "Freonn проектирует и строит промышленные здания в Москве и по всей Московской области: от компактных ангаров 500 м² до складских комплексов 10 000 м². Собственное производство металлоконструкций, монтажные бригады в регионе, фиксированная цена в договоре.",
};

export const moHubFaqs = [
  {
    q: "В каких городах Подмосковья вы строите?",
    a: "Работаем во всех ключевых направлениях МО: Подольск, Химки, Балашиха, Домодедово, Мытищи, Одинцово, Королёв, Коломна, Ногинск и десятки других городов. Полный список — на этой странице.",
  },
  {
    q: "Сколько стоит ангар в Московской области?",
    a: "Ориентир для холодного ангара — от 8 330 ₽/m² в периферийных городах до 9 775 ₽/m² у МКАД. Склады и цеха дороже из‑за инженерии. Точная смета — за 1 рабочий день после ТЗ.",
  },
  {
    q: "Как быстро выезжаете на объект в МО?",
    a: "Инженер выезжает в течение 24 часов по Москве и ближнему Подмосковью. Для удалённых городов области — по согласованию, обычно 1–2 дня.",
  },
  {
    q: "Нужно ли разрешение на склад в Московской области?",
    a: "Для некапитальных объектов до 1 500 m² часто достаточно уведомления. Для капитальных складов и производств проектное бюро Freonn сопровождает разрешительную документацию.",
  },
  {
    q: "Есть ли офис в регионе?",
    a: "Головной офис — Москва, Варшавское шоссе, 125Ж. Выездные бригады и инженеры работают по всей области; производство металлоконструкций — с доставкой собственным транспортом.",
  },
];

const ALL_MO_SEEDS: MoCitySeed[] = [...MO_TIER1_CITIES, ...MO_TIER2_CITIES, ...MO_TIER3_CITIES];
const seedByKey = new Map(ALL_MO_SEEDS.map((s) => [s.slugKey, s]));

function linksFromSeed(s: MoCitySeed): MoHubCityLink {
  const perM2 = peripheralMoRubM2(s.priceCoeff).toLocaleString("ru-RU");
  return {
    slugKey: s.slugKey,
    city: s.city,
    angaryHref: `/angary-${s.slugKey}`,
    skladyHref: moCityHasSklad(s.slugKey) ? `/sklady-${s.slugKey}` : undefined,
    proizvodstvoHref: moCityHasProizvodstvo(s.slugKey)
      ? `/proizvodstvennye-zdaniya-${s.slugKey}`
      : undefined,
    priceFrom: `${perM2} ₽/m²`,
  };
}

const MOSCOW_LINK: MoHubCityLink = {
  slugKey: "moskva",
  city: "Москва",
  angaryHref: "/angary-moskva",
  skladyHref: "/sklady-moskva",
  proizvodstvoHref: "/proizvodstvennye-zdaniya-moskva",
  priceFrom: "9 775 ₽/m²",
};

function groupCities(slugKeys: string[]): MoHubCityLink[] {
  return slugKeys.flatMap((k) => {
    const s = seedByKey.get(k);
    return s ? [linksFromSeed(s)] : [];
  });
}

/** Региональные группы для UI и SSR. */
export const moHubCityGroups: { title: string; cities: MoHubCityLink[] }[] = [
  { title: "Москва", cities: [MOSCOW_LINK] },
  {
    title: "Юг и юго-восток",
    cities: groupCities(["podolsk", "domodedovo", "vidnoye", "serpukhov", "stupino", "kolomna", "chekhov"]),
  },
  {
    title: "Север и северо-запад",
    cities: groupCities([
      "himki",
      "mytishchi",
      "pushkino",
      "dolgoprudny",
      "lobnya",
      "dmitrov",
      "krasnogorsk",
      "odintsovo",
      "istra",
      "klin",
    ]),
  },
  {
    title: "Восток",
    cities: groupCities([
      "balashiha",
      "schelkovo",
      "noginsk",
      "orekhovo-zuevo",
      "elektrostal",
      "zhukovsky",
      "reutov",
      "lyubertsy",
      "korolev",
    ]),
  },
  {
    title: "Центр и прочие",
    cities: groupCities(["ramenskoye", "egorievsk", "pavlovsky-posad", "lytkarino", "fryazino", "protvino", "kashira", "mozhaysk", "volokolamsk"]),
  },
];

export function getMoHubPageBySlug(slug: string) {
  return slug === MO_HUB_SLUG ? moHubPage : undefined;
}

export type LandingMoLink = { label: string; slug: string };

/** Ссылки на geo-города для блоков на landing `/angary`, `/sklady`, `/proizvodstvennye-zdaniya`. */
export function landingMoGeoLinks(
  kind: "angary" | "sklad" | "proizvodstvo",
  limit = 8,
): LandingMoLink[] {
  const prefix =
    kind === "angary" ? "angary" : kind === "sklad" ? "sklady" : "proizvodstvennye-zdaniya";
  return MO_TIER1_CITIES.filter((s) => {
    if (kind === "angary") return true;
    if (kind === "sklad") return moCityHasSklad(s.slugKey);
    return moCityHasProizvodstvo(s.slugKey);
  })
    .slice(0, limit)
    .map((s) => ({ label: s.city, slug: `/${prefix}-${s.slugKey}` }));
}

/** Combo-ссылки 500/1000/2000 m² для landing (Москва + МО). */
export function landingMoComboLinks(buildingKind: MoscowBuildingKind | "angary"): LandingMoLink[] {
  const normalized: MoscowBuildingKind = buildingKind === "angary" ? "angar" : buildingKind;
  return moscowComboLinksForKind(normalized).map((l) => ({
    label: `${l.label} в Москве`,
    slug: l.href,
  }));
}

/** Standalone size-страницы склад/цех для landing. */
export function landingStandaloneSizeLinks(kind: "sklad" | "proizvodstvo"): LandingMoLink[] {
  const pages = kind === "sklad" ? skladSizePages : tsekhSizePages;
  const normalized = kind === "sklad" ? "sklad" : "proizvodstvo";
  return pages.map((p) => ({
    label: `${buildingKindLabel(normalized)} ${p.size.toLocaleString("ru-RU")} m²`,
    slug: p.slug,
  }));
}

import { allGeoPages, getGeoHub, getGeoKind, type GeoPage } from "./geoPages";
import { landingPages, resolveLandingBySlug } from "./landingPages";
import { landingSubpagesForParent } from "./landingSubpages";
import type { SizePage } from "./sizePages";
import { getSizeBuildingMeta } from "./sizePages";
import { geoSlugFromPageSlug } from "@shared/geoPlaceCoords";
import { getGeoPortfolioSeeAlso } from "@/data/portfolioItems";
import {
  buildingKindLabel,
  isMoRegion,
  MO_HUB_SLUG,
  moscowComboCrossLinks,
  moscowComboHref,
  MOSCOW_COMBO_SIZES,
  type MoscowComboSize,
} from "@shared/moSeo";
import { CALCULATOR_BUILDING_TYPES, type CalculatorBuildingType } from "@shared/buildingCatalog";

export type SeeAlsoItem = {
  href: string;
  label: string;
  description: string;
};

function dedupPush(items: SeeAlsoItem[], seen: Set<string>, item: SeeAlsoItem): void {
  if (seen.has(item.href)) return;
  seen.add(item.href);
  items.push(item);
}

/** Перекрёстные ссылки: другие типы зданий в том же городе + каталог, портфолио, калькулятор. */
export function getGeoSeeAlsoItems(page: GeoPage): SeeAlsoItem[] {
  const seen = new Set<string>();
  const out: SeeAlsoItem[] = [];

  for (const p of allGeoPages) {
    if (p.city !== page.city || p.slug === page.slug) continue;
    const k = getGeoKind(p);
    const label =
      k === "sklad"
        ? `Склады в ${page.cityPred}`
        : k === "proizvodstvo"
          ? `Производственные здания в ${page.cityPred}`
          : `Ангары в ${page.cityPred}`;
    const description =
      k === "sklad"
        ? "Складские и логистические комплексы"
        : k === "proizvodstvo"
          ? "Цеха и промышленные здания"
          : "Быстровозводимые ангары";
    dedupPush(out, seen, { href: p.slug, label, description });
  }

  if (isMoRegion(page.region, page.city)) {
    dedupPush(out, seen, {
      href: MO_HUB_SLUG,
      label: "Все города Московской области",
      description: "40+ городов Подмосковья — ангары, склады, цеха",
    });
    const kind = getGeoKind(page);
    const prefix =
      kind === "sklad" ? "/sklady-" : kind === "proizvodstvo" ? "/proizvodstvennye-zdaniya-" : "/angary-";
    const neighbors = allGeoPages
      .filter((p) => p.region === "Московская область" && p.city !== page.city && p.slug.startsWith(prefix))
      .slice(0, 4);
    for (const n of neighbors) {
      dedupPush(out, seen, {
        href: n.slug,
        label: n.h1.replace("Строительство ", "").replace(" под ключ", ""),
        description: `${n.city}, ${n.region}`,
      });
    }
    const slugKey = geoSlugFromPageSlug(page.slug);
    const portfolioCase = getGeoPortfolioSeeAlso(slugKey);
    dedupPush(out, seen, { ...portfolioCase, description: portfolioCase.description ?? "" });
    const blogMo =
      kind === "sklad"
        ? "/blog/sklad-pod-klyuch-moskva"
        : kind === "proizvodstvo"
          ? "/blog/proizvodstvennyy-tsekh-pod-klyuch"
          : "/blog/stroitelstvo-angarov-moskovskaya-oblast";
    dedupPush(out, seen, {
      href: blogMo,
      label: "Материалы блога",
      description: "Гайды по строительству в Москве и МО",
    });
    dedupPush(out, seen, {
      href: moscowComboHref(kind, 1000),
      label: `${buildingKindLabel(kind)} 1000 m² в Москве`,
      description: "Комбо-страница размер + регион",
    });
  }

  const hub = getGeoHub(page);
  dedupPush(out, seen, {
    href: hub.href,
    label: `${hub.name} в России`,
    description: "Обзор услуги и типовые решения",
  });
  dedupPush(out, seen, {
    href: "/zdaniya",
    label: "Каталог типов зданий",
    description: "НФС, пролёты, типовые решения по видам объектов",
  });
  dedupPush(out, seen, {
    href: "/portfolio",
    label: "Реализованные объекты",
    description: "Фото и описание построенных зданий",
  });
  dedupPush(out, seen, {
    href: "/blog",
    label: "Блог",
    description: "Сроки, смета, нормативы",
  });
  dedupPush(out, seen, {
    href: "/#calculator",
    label: "Калькулятор стоимости",
    description: "Ориентир по цене по вашим параметрам",
  });

  return out.slice(0, 10);
}

/** С размерных страниц — на услуги, каталог и инструменты. */
export function getSizeSeeAlsoItems(page: SizePage): SeeAlsoItem[] {
  const meta = getSizeBuildingMeta(page);
  const kind = meta.kind;
  const isSklad = kind === "sklad";
  const isProd = kind === "proizvodstvo";
  const landingHref = meta.landingHref;
  const landingLabel = isSklad ? "Склады под ключ" : isProd ? "Цеха под ключ" : "Ангары под ключ";
  const landingDesc = isSklad
    ? "Доки, классы A/B/C, температурные режимы"
    : isProd
      ? "Крановые пути, усиленные пролёты"
      : "Типовые пролёты, сроки и комплектация";

  const items: SeeAlsoItem[] = [
    { href: landingHref, label: landingLabel, description: landingDesc },
    {
      href: isSklad || isProd ? "/angary" : "/sklady",
      label: isSklad || isProd ? "Ангары" : "Склады",
      description: isSklad || isProd ? "Типовые пролёты и цены" : "Температурные режимы, рампы, классы A/B/C",
    },
    ...(isProd
      ? [{ href: "/sklady", label: "Склады", description: "Логистика и хранение" }]
      : [{
          href: "/proizvodstvennye-zdaniya",
          label: "Производственные здания",
          description: "Крановые пути и усиленные пролёты",
        }]),
    {
      href: "/zdaniya",
      label: "Каталог типов зданий",
      description: "Подбор решения по задаче и типу объекта",
    },
    {
      href: "/#calculator",
      label: "Калькулятор",
      description: "Предварительный расчёт за 1 минуту",
    },
    {
      href: "/blog",
      label: "Блог",
      description: "Гайды по металлоконструкциям и смете",
    },
    {
      href: "/portfolio",
      label: "Портфолио",
      description: "Реализованные проекты по России",
    },
  ];

  if (!page.geoCity) {
    const moGeoHref = meta.moGeoHref;
    const moGeoLabel =
      kind === "proizvodstvo" ? "Цеха в Москве" : kind === "sklad" ? "Склады в Москве" : "Ангары в Москве";
    const rubM2 = meta.moscowRubM2;
    items.splice(1, 0, {
      href: moGeoHref,
      label: moGeoLabel,
      description: `Ориентир ${page.size} м² — от ${Math.round(page.size * rubM2).toLocaleString("ru-RU")} ₽`,
    });
    if (page.size === 500 || page.size === 1000 || page.size === 2000) {
      items.splice(2, 0, {
        href: `/${meta.comboPrefix}-${page.size}-m2-moskva`,
        label: `${buildingKindLabel(kind)} ${page.size} м² в Москве`,
        description: "Цены и сроки для Москвы и МО",
      });
      if ((MOSCOW_COMBO_SIZES as readonly number[]).includes(page.size)) {
        for (const link of moscowComboCrossLinks(kind, page.size as MoscowComboSize)) {
          items.splice(3, 0, { href: link.href, label: link.label, description: link.description ?? "" });
        }
      }
    }
    items.push({
      href: "/moskovskaya-oblast",
      label: "Города Московской области",
      description: "Geo-страницы по Подмосковью",
    });
  } else if (page.geoCity === "Москва" && (page.size === 500 || page.size === 1000 || page.size === 2000)) {
    items.unshift({
      href: meta.moGeoHref,
      label: kind === "proizvodstvo" ? "Цеха в Москве" : kind === "sklad" ? "Склады в Москве" : "Ангары в Москве",
      description: "Все решения для региона",
    });
    for (const link of moscowComboCrossLinks(kind, page.size as MoscowComboSize)) {
      items.unshift({ href: link.href, label: link.label, description: link.description ?? "" });
    }
    items.push({
      href: "/moskovskaya-oblast",
      label: "Города Московской области",
      description: "40+ городов Подмосковья",
    });
    if (page.size === 1000 && isSklad) {
      items.push({
        href: "/blog/stoimost-sklada-1000-m2-moskva",
        label: "Блог: склад 1000 м²",
        description: "Разбор сметы и сроков",
      });
    }
    if (page.size === 1000 && isProd) {
      items.push({
        href: "/blog/proizvodstvenny-ceh-moskovskaya-oblast",
        label: "Блог: цех в МО",
        description: "Города, цены, краны",
      });
    }
  }

  return items;
}

const CATEGORY_LANDING_SLUG: Record<string, string> = {
  popular: "/angary",
  selhoz: "/selskokhozyaystvennye-zdaniya",
  commercial: "/sklady",
  common: "/angary",
  tech: "/angary",
  sport: "/sportivnye-sooruzheniya",
  industry: "/proizvodstvennye-zdaniya",
};

/** Посадочные: другие услуги + каталог + инструменты (текущая страница исключается). */
export function getLandingSeeAlsoItems(currentSlug: string): SeeAlsoItem[] {
  const current = resolveLandingBySlug(currentSlug);
  const seen = new Set<string>([currentSlug]);
  const out: SeeAlsoItem[] = [];

  if (current?.parentSlug) {
    const parent = resolveLandingBySlug(current.parentSlug);
    if (parent) {
      dedupPush(out, seen, {
        href: parent.slug,
        label: parent.breadcrumb ?? parent.h1,
        description: parent.subtitle.slice(0, 120),
      });
    }
    for (const sib of landingSubpagesForParent(current.parentSlug)) {
      if (sib.slug === currentSlug) continue;
      dedupPush(out, seen, {
        href: sib.slug,
        label: sib.breadcrumb,
        description: sib.subtitle.slice(0, 120),
      });
      if (out.length >= 6) break;
    }
  } else if (current) {
    for (const sub of landingSubpagesForParent(currentSlug).slice(0, 4)) {
      dedupPush(out, seen, {
        href: sub.slug,
        label: sub.breadcrumb,
        description: sub.subtitle.slice(0, 120),
      });
    }
  }

  for (const p of landingPages) {
    if (p.slug === currentSlug || seen.has(p.slug)) continue;
    dedupPush(out, seen, {
      href: p.slug,
      label: p.h1,
      description: p.subtitle.slice(0, 120),
    });
    if (out.length >= 8) break;
  }

  dedupPush(out, seen, {
    href: "/zdaniya",
    label: "Каталог типов зданий",
    description: "Подбор типа здания под задачу и ориентир по комплекту",
  });
  dedupPush(out, seen, {
    href: "/#calculator",
    label: "Калькулятор стоимости",
    description: "Ориентир цены по габаритам и региону",
  });
  dedupPush(out, seen, {
    href: "/portfolio",
    label: "Портфолио",
    description: "Кейсы по регионам и типам объектов",
  });
  dedupPush(out, seen, {
    href: "/blog",
    label: "Блог",
    description: "Смета, сроки, нормативы",
  });
  dedupPush(out, seen, {
    href: "/rekvizity",
    label: "Реквизиты",
    description: "ООО «ЭКС», ИНН, договорная работа",
  });

  return out.slice(0, 10);
}

/** Хаб каталога `/zdaniya` — услуги и инструменты. */
export function getBuildingTypesHubSeeAlsoItems(): SeeAlsoItem[] {
  return [
    { href: "/angary", label: "Ангары под ключ", description: "Холодные и тёплые решения, типовые пролёты" },
    { href: "/sklady", label: "Склады", description: "Логистика, температурные режимы, классы" },
    { href: "/proizvodstvennye-zdaniya", label: "Производственные здания", description: "Цеха, крановые пути, усиленный каркас" },
    { href: "/#calculator", label: "Калькулятор", description: "Ориентир стоимости под ваши размеры" },
    { href: "/portfolio", label: "Портфолио", description: "Реализованные объекты" },
    { href: "/blog", label: "Блог", description: "Материалы для заказчика и проектировщика" },
  ];
}

/** Карточка типа здания: хаб, отраслевой лендинг, «соседи» по категории. */
export function getBuildingTypeSeeAlsoItems(type: CalculatorBuildingType): SeeAlsoItem[] {
  const self = `/zdaniya/${encodeURIComponent(type.id)}`;
  const seen = new Set<string>([self]);
  const out: SeeAlsoItem[] = [];

  dedupPush(out, seen, {
    href: "/zdaniya",
    label: "Все типы зданий",
    description: "Каталог и переход к расчёту",
  });

  const sector = CATEGORY_LANDING_SLUG[type.categoryId] ?? "/angary";
  dedupPush(out, seen, {
    href: sector,
    label: "Обзор направления",
    description: "Цены, FAQ и типовые решения по услуге",
  });

  const siblings = CALCULATOR_BUILDING_TYPES.filter(t => t.categoryId === type.categoryId && t.id !== type.id).slice(0, 4);
  for (const t of siblings) {
    const href = `/zdaniya/${encodeURIComponent(t.id)}`;
    dedupPush(out, seen, {
      href,
      label: t.label,
      description: `Тот же раздел: ${t.categoryLabel}`,
    });
  }

  dedupPush(out, seen, {
    href: "/#calculator",
    label: "Калькулятор",
    description: `Расчёт с типом «${type.label}»`,
  });
  dedupPush(out, seen, {
    href: "/portfolio",
    label: "Портфолио",
    description: "Примеры построенных зданий",
  });
  dedupPush(out, seen, {
    href: "/blog",
    label: "Блог",
    description: "Статьи по металлоконструкциям и смете",
  });

  return out.slice(0, 10);
}

/** Хаб `/moskovskaya-oblast` — перелинковка на услуги и инструменты. */
export function getMoHubSeeAlsoItems(): SeeAlsoItem[] {
  return [
    { href: "/angary-moskva", label: "Ангары в Москве", description: "От 9 775 ₽/m², 87+ объектов" },
    { href: "/sklady-moskva", label: "Склады в Москве", description: "Логистика, доки, классы A/B" },
    { href: "/angary", label: "Ангары по России", description: "Типовые пролёты и цены" },
    { href: "/proizvodstvennye-zdaniya-moskva", label: "Цеха в Москве", description: "От 13 800 ₽/m², крановые пути" },
    { href: "/sklad-1000-m2", label: "Склад 1000 m²", description: "Логистика, доки, класс B" },
    { href: "/tsekh-1000-m2", label: "Цех 1000 m²", description: "Крановые пути, пролёты" },
    { href: "/sklad-1000-m2-moskva", label: "Склад 1000 m² в Москве", description: "Комбо размер + geo" },
    { href: "/tsekh-1000-m2-moskva", label: "Цех 1000 m² в Москве", description: "Крановые пути, пролёты" },
    { href: "/angar-1000-m2-moskva", label: "Ангар 1000 m² в Москве", description: "Комбо-страница размер + geo" },
    { href: "/portfolio", label: "Кейсы в МО", description: "14+ объектов в портфолио" },
    { href: "/blog/stroitelstvo-angarov-moskovskaya-oblast", label: "Блог: ангары в МО", description: "Города, цены, сроки" },
    { href: "/#calculator", label: "Калькулятор", description: "Ориентир сметы за 1 минуту" },
  ];
}

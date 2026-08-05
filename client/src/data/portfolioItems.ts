/** Кейсы для страницы портфолио (коммерческий фактор; часть полей — ориентиры, без выдуманных имён заказчиков). */

export type PortfolioItem = {
  slug: string;
  h1: string;
  title: string;
  metaDescription: string;
  buildingType: string;
  areaM2: number;
  region: string;
  year: number;
  /** Заказчик: публичное имя или нейтральная формулировка после согласования NDA */
  clientLabel: string;
  duration: string;
  intro: string;
  highlights: string[];
  /** Ключ geo-города для перелинковки (`podolsk`, `himki`, …). */
  geoSlugKey?: string;
  /** Текст для блока «Смотрите также» на geo-странице. */
  seeAlsoLabel?: string;
  seeAlsoDescription?: string;
  /** SEO alt для обложки (если не задан — генерируется из h1 и региона). */
  imageAlt?: string;
  /** Переопределение обложки (иначе — по типу здания). */
  imageUrl?: string;
};

export const portfolioItems: PortfolioItem[] = [
  {
    slug: "/portfolio/sklad-moskovskaya-obl",
    h1: "Складской комплекс 8 500 м² — Московская область",
    title: "Кейс: склад 8 500 м² с АБК | Freonn",
    metaDescription:
      "Строительство складского комплекса 8 500 м² в Московской области: сроки, площадь, тип здания. Freonn — промышленные здания под ключ.",
    buildingType: "Склад",
    areaM2: 8500,
    region: "Московская область",
    year: 2023,
    clientLabel: "Логистический оператор (NDA)",
    duration: "4 мес. монтаж каркаса",
    intro: "Температурный склад с АБК и доковыми воротами. Проектирование и поставка металлоконструкций, монтаж под ключ.",
    highlights: ["Мостовые ворота по периметру", "Утепление сэндвич-панелями", "Промышленные полы под нагрузку"],
    seeAlsoLabel: "Кейс: склад в МО",
    seeAlsoDescription: "8 500 m² в Московской области",
  },
  {
    slug: "/portfolio/angar-podolsk",
    h1: "Ангар 1 800 м² — Подольск, Московская область",
    title: "Кейс: ангар 1 800 м² в Подольске | Freonn",
    metaDescription:
      "Строительство ангара 1 800 м² в Подольске: металлокаркас, монтаж 38 дней. Freonn — промышленные здания в МО под ключ.",
    buildingType: "Ангар",
    areaM2: 1800,
    region: "Московская область",
    year: 2024,
    clientLabel: "Производственная компания (NDA)",
    duration: "38 дней монтаж",
    intro: "Холодный ангар для хранения готовой продукции в промзоне Подольска. Каркас ЛСТК, профнастил, секционные ворота 4×4 м.",
    highlights: ["Пролёт 24 м без колонн", "Доставка МК за 1 день из региона", "Сдача с актом и гарантией 5 лет"],
    geoSlugKey: "podolsk",
    seeAlsoLabel: "Кейс: ангар в Подольске",
    seeAlsoDescription: "1 800 m², юг МО",
  },
  {
    slug: "/portfolio/sklad-himki",
    h1: "Склад 3 200 м² — Химки, Московская область",
    title: "Кейс: склад 3 200 м² в Химках | Freonn",
    metaDescription:
      "Логистический склад 3 200 м² в Химках у МКАД: утепление, доковые ворота, сроки монтажа. Freonn — склады в МО.",
    buildingType: "Склад",
    areaM2: 3200,
    region: "Московская область",
    year: 2024,
    clientLabel: "3PL-оператор (NDA)",
    duration: "3 мес. под ключ",
    intro: "Нетемпературный склад для e-commerce: 12 доковых ворот, антипылевые полы, освещение LED по проекту.",
    highlights: ["Близость к МКАД и Шереметьево", "Сэндвич-панели 100 мм", "Пожарные отсеки по ТЗ"],
    geoSlugKey: "himki",
    seeAlsoLabel: "Кейс: склад в Химках",
    seeAlsoDescription: "3 200 m² у МКАД",
  },
  {
    slug: "/portfolio/tsekh-balashiha",
    h1: "Производственный цех 2 100 м² — Балашиха",
    title: "Кейс: цех 2 100 м² в Балашихе | Freonn",
    metaDescription:
      "Производственный цех 2 100 м² в Балашихе: крановые пути, усиленный каркас. Freonn — цеха в Московской области.",
    buildingType: "Производственное здание",
    areaM2: 2100,
    region: "Московская область",
    year: 2023,
    clientLabel: "Машиностроительное предприятие (NDA)",
    duration: "5 мес. под ключ",
    intro: "Цех с мостовым краном 5 т, пролёт 18 м. Координация с технологами на этапе КМД, усиленные колонны под крановые нагрузки.",
    highlights: ["Крановые балки", "Пролётные ворота 6 м", "Интеграция вентиляции"],
    geoSlugKey: "balashiha",
    seeAlsoLabel: "Кейс: цех в Балашихе",
    seeAlsoDescription: "2 100 m² с краном",
  },
  {
    slug: "/portfolio/angar-kolomna",
    h1: "Ангар 1 200 м² — Коломна, Московская область",
    title: "Кейс: ангар 1 200 м² в Коломне | Freonn",
    metaDescription:
      "Ангар 1 200 м² в Коломне для логистики: монтаж 42 дня, цена ниже столичной. Freonn — ангары в юго-востоке МО.",
    buildingType: "Ангар",
    areaM2: 1200,
    region: "Московская область",
    year: 2024,
    clientLabel: "Логистическая компания (NDA)",
    duration: "42 дня монтаж",
    intro: "Складской ангар на участке в промзоне Коломны. Экономичное решение для юга МО без потери качества каркаса.",
    highlights: ["Оптимизация сметы под регион", "Ворота для фуры", "Антикоррозийная обработка"],
    geoSlugKey: "kolomna",
    seeAlsoLabel: "Кейс: ангар в Коломне",
    seeAlsoDescription: "1 200 m², юго-восток МО",
  },
  {
    slug: "/portfolio/sklad-domodedovo",
    h1: "Распределительный центр 4 500 м² — Домодедово",
    title: "Кейс: РЦ 4 500 м² в Домодедово | Freonn",
    metaDescription:
      "Распределительный центр 4 500 м² в Домодедово: логистика М4, температурные зоны. Freonn — склады в МО под ключ.",
    buildingType: "Склад",
    areaM2: 4500,
    region: "Московская область",
    year: 2023,
    clientLabel: "Ритейл-оператор (NDA)",
    duration: "4 мес. монтаж",
    intro: "Склад с зонированием под холодный и тёплый контур, доковая линия, АБК 200 м². Объект у трассы М4.",
    highlights: ["Температурные зоны", "16 доковых мест", "Собственная подстанция по проекту"],
    geoSlugKey: "domodedovo",
    seeAlsoLabel: "Кейс: РЦ в Домодедово",
    seeAlsoDescription: "4 500 m²",
  },
  {
    slug: "/portfolio/angar-mytishchi",
    h1: "Ангар 800 м² — Мытищи, Московская область",
    title: "Кейс: ангар 800 м² в Мытищах | Freonn",
    metaDescription:
      "Ангар 800 м² в Мытищах: северное направление МО, монтаж 35 дней. Freonn — ангары в Подмосковье под ключ.",
    buildingType: "Ангар",
    areaM2: 800,
    region: "Московская область",
    year: 2024,
    clientLabel: "Сервисная компания (NDA)",
    duration: "35 дней монтаж",
    intro: "Компактный ангар для хранения техники и материалов. Быстрый монтаж — бригада из северного направления МО.",
    highlights: ["Пролёт 18 м", "Секционные ворота", "Сдача за 35 дней"],
    geoSlugKey: "mytishchi",
    seeAlsoLabel: "Кейс: ангар в Мытищах",
    seeAlsoDescription: "800 m², север МО",
  },
  {
    slug: "/portfolio/sklad-odintsovo",
    h1: "Склад 1 500 м² — Одинцово, Московская область",
    title: "Кейс: склад 1 500 м² в Одинцово | Freonn",
    metaDescription:
      "Склад 1 500 м² в Одинцово: западное направление МО, логистика для ритейла. Freonn — склады под ключ.",
    buildingType: "Склад",
    areaM2: 1500,
    region: "Московская область",
    year: 2023,
    clientLabel: "Дистрибьютор (NDA)",
    duration: "3 мес. под ключ",
    intro: "Склад класса B с утеплением 80 мм, ramp-доками и офисным блоком 120 м². Участок в промзоне Одинцово.",
    highlights: ["Утепление сэндвич-панелями", "4 доковых места", "Офисный блок в составе"],
    geoSlugKey: "odintsovo",
    seeAlsoLabel: "Кейс: склад в Одинцово",
    seeAlsoDescription: "1 500 m² класс B",
  },
  {
    slug: "/portfolio/angar-moskva",
    h1: "Ангар 1 200 м² — Москва",
    title: "Кейс: ангар 1 200 м² в Москве | Freonn",
    metaDescription:
      "Ангар 1 200 м² в Москве: строительство под ключ, сроки и комплектация. Freonn — промышленные здания в столице.",
    buildingType: "Ангар",
    areaM2: 1200,
    region: "Москва",
    year: 2024,
    clientLabel: "Производитель (NDA)",
    duration: "40 дней монтаж",
    intro: "Ангар в черте Москвы для производственного склада. Согласование с городскими нормами, доставка МК ночными окнами.",
    highlights: ["Работа в черте Москвы", "Ночная доставка негабарита", "Пожарные отсеки по ТЗ"],
    geoSlugKey: "moskva",
    seeAlsoLabel: "Кейс: ангар в Москве",
    seeAlsoDescription: "1 200 m² в столице",
  },
  {
    slug: "/portfolio/tsekh-ramenskoye",
    h1: "Производственный цех 1 400 m² — Раменское, Московская область",
    title: "Кейс: цех 1 400 m² в Раменском | Freonn",
    metaDescription:
      "Производственный цех 1 400 m² в Раменском: авиационный кластер МО, кран 3 т. Freonn — цеха в Подмосковье.",
    buildingType: "Производственное здание",
    areaM2: 1400,
    region: "Московская область",
    year: 2024,
    clientLabel: "Производитель комплектующих (NDA)",
    duration: "4 мес. под ключ",
    intro: "Цех сборки с кран-балкой 3 т и пролётом 16 m в промзоне Раменского. Координация с технологами заказчика на этапе КМД.",
    highlights: ["Кран-балка 3 т", "Пролёт 16 m", "Сдача с актом и гарантией 5 лет"],
    geoSlugKey: "ramenskoye",
    seeAlsoLabel: "Кейс: цех в Раменском",
    seeAlsoDescription: "1 400 m², кран 3 т",
  },
  {
    slug: "/portfolio/sklad-lytkarino",
    h1: "Склад 1 200 m² — Лыткарино, Московская область",
    title: "Кейс: склад 1 200 m² в Лыткарино | Freonn",
    metaDescription:
      "Склад 1 200 m² в Лыткарино: юго-восток МО, логистика для производства. Freonn — склады в Подмосковье под ключ.",
    buildingType: "Склад",
    areaM2: 1200,
    region: "Московская область",
    year: 2024,
    clientLabel: "Производственная компания (NDA)",
    duration: "40 дней монтаж",
    intro: "Нетемпературный склад для сырья и готовой продукции в промзоне Лыткарино. Каркас ЛСТК, профнастил, рампа для фуры.",
    highlights: ["Пролёт 20 m", "Рампа 1,2 m", "Монтаж за 40 дней"],
    geoSlugKey: "lytkarino",
    seeAlsoLabel: "Кейс: склад в Лыткарино",
    seeAlsoDescription: "1 200 m²",
  },
  {
    slug: "/portfolio/angar-fryazino",
    h1: "Ангар 900 m² — Фрязино, Московская область",
    title: "Кейс: ангар 900 m² во Фрязино | Freonn",
    metaDescription:
      "Ангар 900 m² во Фрязино: наукоград МО, монтаж 32 дня. Freonn — ангары в восточном Подмосковье.",
    buildingType: "Ангар",
    areaM2: 900,
    region: "Московская область",
    year: 2024,
    clientLabel: "Технологическая компания (NDA)",
    duration: "32 дня монтаж",
    intro: "Компактный ангар для хранения оборудования и комплектующих. Удобная логистика по Щёлковскому шоссе.",
    highlights: ["Пролёт 15 m", "Ворота 4×4 m", "Близость к МКАД"],
    geoSlugKey: "fryazino",
    seeAlsoLabel: "Кейс: ангар во Фрязино",
    seeAlsoDescription: "900 m², наукоград",
  },
  {
    slug: "/portfolio/angar-korolev",
    h1: "Ангар 1 100 m² — Королёв, Московская область",
    title: "Кейс: ангар 1 100 m² в Королёве | Freonn",
    metaDescription:
      "Ангар 1 100 m² в Королёве: наукоград северо-востока МО, монтаж 36 дней. Freonn — промышленные здания в Подмосковье.",
    buildingType: "Ангар",
    areaM2: 1100,
    region: "Московская область",
    year: 2024,
    clientLabel: "Производитель электроники (NDA)",
    duration: "36 дней монтаж",
    intro: "Ангар для сборочного производства в промзоне Королёва. Каркас ЛСТК, утепление 80 mm, ворота под фуру.",
    highlights: ["Пролёт 20 m", "Близость к Ярославскому ш.", "Сдача с гарантией 5 лет"],
    geoSlugKey: "korolev",
    seeAlsoLabel: "Кейс: ангар в Королёве",
    seeAlsoDescription: "1 100 m², наукоград",
  },
  {
    slug: "/portfolio/sklad-schelkovo",
    h1: "Склад 2 400 m² — Щёлково, Московская область",
    title: "Кейс: склад 2 400 m² в Щёлково | Freonn",
    metaDescription:
      "Логистический склад 2 400 m² в Щёлково: восток МО, доки, класс B. Freonn — склады в Подмосковье под ключ.",
    buildingType: "Склад",
    areaM2: 2400,
    region: "Московская область",
    year: 2023,
    clientLabel: "Дистрибьютор (NDA)",
    duration: "4 мес. под ключ",
    intro: "Склад класса B с 8 доковыми воротами и офисным блоком. Участок в промзоне Щёлково с выездом на Щёлковское шоссе.",
    highlights: ["8 доковых мест", "Утепление 100 mm", "LED-освещение по проекту"],
    geoSlugKey: "schelkovo",
    seeAlsoLabel: "Кейс: склад в Щёлково",
    seeAlsoDescription: "2 400 m², восток МО",
  },
  {
    slug: "/portfolio/angar-noginsk",
    h1: "Ангар 950 m² — Ногинск, Московская область",
    title: "Кейс: ангар 950 m² в Ногинске | Freonn",
    metaDescription:
      "Ангар 950 m² в Ногинске: текстильный кластер востока МО, монтаж 34 дня. Freonn — ангары под ключ.",
    buildingType: "Ангар",
    areaM2: 950,
    region: "Московская область",
    year: 2024,
    clientLabel: "Производитель текстиля (NDA)",
    duration: "34 дня монтаж",
    intro: "Складской ангар для сырья и готовой продукции в промзоне Ногинска. Оптимизация сметы под регион.",
    highlights: ["Пролёт 18 m", "Ворота 5×4 m", "Антикоррозийная обработка"],
    geoSlugKey: "noginsk",
    seeAlsoLabel: "Кейс: ангар в Ногинске",
    seeAlsoDescription: "950 m², восток МО",
  },
  {
    slug: "/portfolio/sklad-lyubertsy",
    h1: "Склад 1 800 m² — Люберцы, Московская область",
    title: "Кейс: склад 1 800 m² в Люберцах | Freonn",
    metaDescription:
      "Склад 1 800 m² в Люберцах: юго-восток МО, логистика для ритейла. Freonn — склады под ключ.",
    buildingType: "Склад",
    areaM2: 1800,
    region: "Московская область",
    year: 2024,
    clientLabel: "Ритейл-оператор (NDA)",
    duration: "3 мес. под ключ",
    intro: "Нетемпературный склад с рампой и зоной комплектации. Участок в промзоне Люберец с доступом к МКАД.",
    highlights: ["Рампа 1,2 m", "Пролёт 22 m", "4 доковых места"],
    geoSlugKey: "lyubertsy",
    seeAlsoLabel: "Кейс: склад в Люберцах",
    seeAlsoDescription: "1 800 m², юго-восток МО",
  },
  {
    slug: "/portfolio/angar-krasnogorsk",
    h1: "Ангар 1 400 m² — Красногорск, Московская область",
    title: "Кейс: ангар 1 400 m² в Красногорске | Freonn",
    metaDescription:
      "Ангар 1 400 m² в Красногорске: западное направление МО, монтаж 38 дней. Freonn — ангары в Подмосковье.",
    buildingType: "Ангар",
    areaM2: 1400,
    region: "Московская область",
    year: 2023,
    clientLabel: "Строительная компания (NDA)",
    duration: "38 дней монтаж",
    intro: "Ангар для хранения стройматериалов в промзоне Красногорска. Близость к Рублёво-Успенскому шоссе.",
    highlights: ["Пролёт 24 m", "Ворота для фуры", "Монтаж за 38 дней"],
    geoSlugKey: "krasnogorsk",
    seeAlsoLabel: "Кейс: ангар в Красногорске",
    seeAlsoDescription: "1 400 m², запад МО",
  },
  {
    slug: "/portfolio/sklad-klin",
    h1: "Склад 1 100 m² — Клин, Московская область",
    title: "Кейс: склад 1 100 m² в Клину | Freonn",
    metaDescription:
      "Склад 1 100 m² в Клину: северо-запад МО, Ленинградское шоссе, монтаж 38 дней. Freonn — склады в Подмосковье.",
    buildingType: "Склад",
    areaM2: 1100,
    region: "Московская область",
    year: 2024,
    clientLabel: "Производитель (NDA)",
    duration: "38 дней монтаж",
    intro: "Нетемпературный склад для сырья и готовой продукции в промзоне Клина. Каркас ЛСТК, рампа, полы под стеллажи.",
    highlights: ["Пролёт 18 m", "Рампа 1,2 m", "Близость к Ленинградскому ш."],
    geoSlugKey: "klin",
    seeAlsoLabel: "Кейс: склад в Клину",
    seeAlsoDescription: "1 100 m², северо-запад МО",
  },
  {
    slug: "/portfolio/angar-krasnodar",
    h1: "Ангар 2 400 m² — Краснодарский край",
    title: "Кейс: зернохранилище-ангар 2 400 м² | Freonn",
    metaDescription:
      "Ангар 2 400 м² в Краснодарском крае: сельхоз назначение, сроки монтажа. Freonn — металлоконструкции и монтаж по России.",
    buildingType: "Ангар / зернохранилище",
    areaM2: 2400,
    region: "Краснодарский край",
    year: 2024,
    clientLabel: "Агропредприятие (NDA)",
    duration: "45 дней монтаж",
    intro: "Высокий пролёт, усиленные фермы под снеговую нагрузку региона. Сдача в согласованный договором срок.",
    highlights: ["Усиленный каркас", "Ворота для техники", "Антикоррозийная защита по проекту"],
  },
  {
    slug: "/portfolio/tsekh-sverdlovsk",
    h1: "Производственный цех 3 200 м² — Свердловская область",
    title: "Кейс: цех 3 200 м² с крановым оборудованием | Freonn",
    metaDescription:
      "Производственный цех 3 200 м², Свердловская область: мостовой кран, металлокаркас. Freonn — производственные здания под ключ.",
    buildingType: "Производственное здание",
    areaM2: 3200,
    region: "Свердловская область",
    year: 2022,
    clientLabel: "Промышленное предприятие (NDA)",
    duration: "6 мес. под ключ",
    intro: "Каркас под мостовой кран, просвет под оборудование. Координация с технологами заказчика на этапе КМ/КМД.",
    highlights: ["Крановые балки", "Пролётные ворота", "Интеграция технологических проёмов"],
  },
  {
    slug: "/portfolio/torgovyy-novosibirsk",
    h1: "Торговый объект 5 600 м² — Новосибирск",
    title: "Кейс: торговый объект 5 600 м² | Freonn",
    metaDescription:
      "Торговое здание 5 600 м² в Новосибирске: фасад, сроки, площадь. Freonn — торговые и общественные здания из МК.",
    buildingType: "Торговое здание",
    areaM2: 5600,
    region: "Новосибирск",
    year: 2023,
    clientLabel: "Девелопер (NDA)",
    duration: "По графику заказчика",
    intro: "Работы с учётом смежной застройки, фасадные решения по брендбуку заказчика.",
    highlights: ["Фасадные панели", "Планировка торговых залов", "Координация с сетями"],
  },
];

const PORTFOLIO_TYPE_IMAGES: Record<string, string> = {
  angar: "/images/home/angar.webp",
  sklad: "/images/home/sklad.webp",
  prod: "/images/home/production.webp",
  trade: "/images/home/trade.webp",
  agro: "/images/home/agro.webp",
};

function portfolioTypeKey(buildingType: string): keyof typeof PORTFOLIO_TYPE_IMAGES {
  const bt = buildingType.toLowerCase();
  if (bt.includes("склад")) return "sklad";
  if (bt.includes("производ") || bt.includes("цех")) return "prod";
  if (bt.includes("торгов")) return "trade";
  if (bt.includes("зерн") || bt.includes("сельхоз") || bt.includes("агро")) return "agro";
  return "angar";
}

/** Alt-текст обложки кейса для SEO и доступности. */
export function portfolioImageAlt(item: Pick<PortfolioItem, "h1" | "buildingType" | "areaM2" | "region" | "imageAlt">): string {
  if (item.imageAlt) return item.imageAlt;
  return `${item.buildingType} ${item.areaM2.toLocaleString("ru-RU")} м² — ${item.region}, строительство под ключ Freonn`;
}

/** Обложка кейса для list/detail. */
export function portfolioCoverImage(item: PortfolioItem): { src: string; alt: string } {
  const key = portfolioTypeKey(item.buildingType);
  return {
    src: item.imageUrl ?? PORTFOLIO_TYPE_IMAGES[key],
    alt: portfolioImageAlt(item),
  };
}

/** Geo-страница для перелинковки с кейса. */
export function portfolioGeoHref(item: Pick<PortfolioItem, "geoSlugKey" | "buildingType">): string | undefined {
  if (!item.geoSlugKey) return undefined;
  const key = portfolioTypeKey(item.buildingType);
  if (key === "sklad") return `/sklady-${item.geoSlugKey}`;
  if (key === "prod") return `/proizvodstvennye-zdaniya-${item.geoSlugKey}`;
  return `/angary-${item.geoSlugKey}`;
}

export const portfolioSlugs = new Set(portfolioItems.map((p) => p.slug));

export function getPortfolioBySlug(pathname: string): PortfolioItem | undefined {
  return portfolioItems.find((p) => p.slug === pathname);
}

export type PortfolioSeeAlso = { href: string; label: string; description: string };

export const MO_PORTFOLIO_FALLBACK: PortfolioSeeAlso = {
  href: "/portfolio/sklad-moskovskaya-obl",
  label: "Кейс: склад в МО",
  description: "8 500 m² в Московской области",
};

const portfolioByGeoSlug = new Map(
  portfolioItems
    .filter((p) => p.geoSlugKey && p.seeAlsoLabel)
    .map((p) => [
      p.geoSlugKey!,
      {
        href: p.slug,
        label: p.seeAlsoLabel!,
        description: p.seeAlsoDescription ?? "",
      } satisfies PortfolioSeeAlso,
    ]),
);

/** Кейс портфолио для geo-перелинковки по slugKey города. */
export function getGeoPortfolioSeeAlso(slugKey: string): PortfolioSeeAlso {
  return portfolioByGeoSlug.get(slugKey) ?? MO_PORTFOLIO_FALLBACK;
}

/** Кейсы для хаба `/moskovskaya-oblast`. */
export const MO_HUB_FEATURED_PORTFOLIO: PortfolioSeeAlso[] = [
  { href: "/portfolio/sklad-moskovskaya-obl", label: "Склад 8 500 m² — МО", description: "" },
  { href: "/portfolio/sklad-himki", label: "Склад 3 200 m² — Химки", description: "" },
  { href: "/portfolio/angar-podolsk", label: "Ангар 1 800 m² — Подольск", description: "" },
  { href: "/portfolio/tsekh-balashiha", label: "Цех 2 100 m² — Балашиха", description: "" },
];

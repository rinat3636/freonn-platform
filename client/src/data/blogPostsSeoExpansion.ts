import type { BlogPost } from "./blogPosts";

/** Фаза C SEO: новые статьи под landing/geo/size кластеры. */
export const blogPostsSeoExpansion: BlogPost[] = [
  {
    slug: "/blog/bystrovozvodimye-zdaniya-tehnologiya-2026",
    ogImageUrl: "https://freonn.pro/images/home/production.webp",
    title: "Быстровозводимые здания: технология и сроки 2026 | Freonn",
    h1: "Быстровозводимые здания: как устроена технология",
    metaDescription:
      "Быстровозводимые здания из металлоконструкций: этапы, сроки, цены от 4 200 ₽/m². Сравнение с капитальным строительством. Freonn — 500+ объектов.",
    publishDate: "2026-06-08",
    category: "Технологии",
    readTime: 7,
    tags: ["быстровозводимые", "металлоконструкции", "ангары", "склады"],
    intro:
      "Быстровозводимые здания — стандарт для логистики и производства, когда важны сроки ввода и предсказуемый бюджет. Разбираем этапы: проект, фундамент, МК, оболочка.",
    sections: [
      { type: "h2", content: "Этапы строительства" },
      {
        type: "p",
        content:
          "1) Техническое задание и проект КМ — 5–10 дней. 2) Фундамент — 2–4 недели. 3) Изготовление металлоконструкций — 10–20 дней. 4) Монтаж каркаса и оболочки — 14–45 дней. Подробнее на /bystrovozvodimye-zdaniya.",
      },
      { type: "h2", content: "Сроки vs капитальное строительство" },
      {
        type: "p",
        content:
          "Типовой ангар 1000 m² — 2–3 месяца под ключ вместо 9–12 месяцев кирпича. Экономия — на фундаменте, отсутствии «мокрых» процессов и параллельном производстве МК.",
      },
    ],
    faqs: [
      {
        q: "Сколько стоит быстровозводимое здание 1000 m²?",
        a: "Ориентир — от 4,2 до 6,5 млн ₽ в зависимости от утепления и региона. КП за 1 день — 8(800)101-2009.",
      },
    ],
    relatedPosts: ["/blog/bystrovozdyvaemye-zdaniya", "/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/sklad-pod-klyuch-moskva"],
  },
  {
    slug: "/blog/sendvich-paneli-dlya-sklada-vybor-tolshchiny",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Сэндвич-панели для склада: толщина и цена 2026 | Freonn",
    h1: "Как выбрать сэндвич-панели для склада",
    metaDescription:
      "Толщина сэндвич-панелей для склада: 80, 100, 120, 150 mm. PIR vs минвата, огнестойкость, цены. Freonn — проект и монтаж.",
    publishDate: "2026-06-08",
    category: "Технологии",
    readTime: 6,
    tags: ["сэндвич-панели", "склад", "утепление", "логистика"],
    intro:
      "Склад из сэндвич-панелей — баланс скорости монтажа и энергоэффективности. Главный параметр — толщина утеплителя под температурный режим.",
    sections: [
      { type: "h2", content: "Толщина под задачу" },
      {
        type: "ul",
        items: [
          "80 mm — класс B, +5…+12 °C без активного отопления",
          "100–120 mm — стабильный режим, fulfilment",
          "150 mm — холодильные камеры и фарма",
        ],
      },
      { type: "h2", content: "Стоимость" },
      {
        type: "p",
        content: "Склад из сэндвич-панелей — от 12 000 ₽/m² под ключ в MO. Страница услуги: /sendvich-paneli и /sklady/sendvich-paneli.",
      },
    ],
    faqs: [
      { q: "PIR или минвата?", a: "PIR — выше цена, лучше теплотехника на mm. Минвата — огнестойкость EI60, стандарт для промышленных складов." },
    ],
    relatedPosts: ["/blog/holodnyy-ili-teplyy-sklad", "/blog/logisticheskie-sklady-mo-mkad", "/blog/sklad-pod-klyuch-moskva"],
  },
  {
    slug: "/blog/montazh-metallokonstruktsiy-stoimost-etapy",
    ogImageUrl: "https://freonn.pro/images/home/production.webp",
    title: "Монтаж металлоконструкций: этапы и стоимость | Freonn",
    h1: "Монтаж металлоконструкций на объекте",
    metaDescription:
      "Монтаж металлоконструкций: подготовка площадки, кран, бригада, сроки. Цена за тонну и за m². Freonn — СРО, аттестация НАКС.",
    publishDate: "2026-06-09",
    category: "Технологии",
    readTime: 6,
    tags: ["монтаж", "металлоконструкции", "каркас", "сро"],
    intro:
      "Монтаж металлоконструкций — критический этап быстровозводимого здания. От качества стыков зависят пролёт, безопасность и срок службы каркаса.",
    sections: [
      { type: "h2", content: "Что входит в монтаж" },
      {
        type: "p",
        content: "Разметка осей, установка колонн, монтаж ферм и балок, кровельные прогоны, антикоррозийная защита стыков. Подробнее: /metallokonstruktsii/montazh и /montazh.",
      },
      { type: "h2", content: "Сроки" },
      {
        type: "p",
        content: "Каркас ангара 1000 m² — 15–25 рабочих дней при двух сменах. Зимний монтаж возможен при температуре до −15 °C с прогревом сварных швов.",
      },
    ],
    faqs: [
      { q: "Можно заказать только монтаж?", a: "Да, по готовым КМ/КМД или нашим чертежам. Выезд инженера — бесплатно." },
    ],
    relatedPosts: ["/blog/proizvodstvennyy-tsekh-pod-klyuch", "/blog/bystrovozdyvaemye-zdaniya", "/blog/stroitelstvo-angarov-moskovskaya-oblast"],
  },
  {
    slug: "/blog/logisticheskiy-sklad-2000-m2-proekt",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Логистический склад 2000 m²: проект и смета | Freonn",
    h1: "Логистический склад 2000 m² под ключ",
    metaDescription:
      "Склад 2000 m² для логистики: доки, класс B, полы под стеллажи. Цена от 17 млн ₽. Freonn — проект за 5 дней.",
    publishDate: "2026-06-09",
    category: "Типы зданий",
    readTime: 7,
    tags: ["склад", "2000 m²", "логистика", "доки"],
    intro:
      "Склад 2000 m² — типовой формат для регионального РЦ и e-commerce. Разбираем габариты, доковую систему и ориентиры цены.",
    sections: [
      { type: "h2", content: "Габариты и пролёт" },
      {
        type: "p",
        content: "Типовые схемы: 40×50 m или 30×67 m, высота 10–12 m под стеллажное хранение. Страница размера: /sklad-2000-m2 и /sklady/logisticheskie.",
      },
      { type: "h2", content: "Стоимость" },
      {
        type: "p",
        content: "Холодный склад — от 17–22 млн ₽; класс B с утеплением — от 24–30 млн ₽ в MO. Точная смета после ТЗ и геологии.",
      },
    ],
    faqs: [
      { q: "Сколько доков нужно на 2000 m²?", a: "Ориентир — 4–8 доков на 2000 m² для e-commerce; для транзитного РЦ — до 12 с учётом маневров фур." },
    ],
    relatedPosts: ["/blog/logisticheskie-sklady-mo-mkad", "/blog/sklad-pod-klyuch-moskva", "/blog/holodnyy-ili-teplyy-sklad"],
  },
  {
    slug: "/blog/angar-20x40-gabarity-i-tsena",
    ogImageUrl: "https://freonn.pro/images/home/angar.webp",
    title: "Ангар 20×40 м (800 m²): габариты и цена под ключ | Freonn",
    h1: "Ангар 20×40 метров — площадь 800 m²",
    metaDescription:
      "Ангар 20×40 m (800 m²) под ключ: пролёт, высота, цена от 4,5 млн ₽. Монтаж 25–35 дней. Freonn — расчёт бесплатно.",
    publishDate: "2026-06-10",
    category: "Цены и расчёт",
    readTime: 5,
    tags: ["ангар", "20x40", "800 m²", "габариты"],
    intro:
      "Ангар 20×40 m — популярный габарит для среднего склада и производства. Площадь 800 m², пролёт 20 m без промежуточных колонн.",
    sections: [
      { type: "h2", content: "Технические параметры" },
      {
        type: "p",
        content: "Пролёт 20 m, длина 40 m, типовая высота 6–7 m. Каркас из стали С245/С345, оболочка — профлист или сэндвич 80–100 mm. Подробнее: /angar-20x40-m2.",
      },
      { type: "h2", content: "Цена 2026" },
      {
        type: "p",
        content: "Холодный ангар — от 4,5 млн ₽; с утеплением — от 6,0 млн ₽. В MO коэффициент +5–12% к базовой цене.",
      },
    ],
    faqs: [
      { q: "Чем 20×40 отличается от ангара 800 m² других пропорций?", a: "Пролёт 20 m определяет сечение колонн и ферм; длину можно наращивать секциями по 6–12 m." },
    ],
    relatedPosts: ["/blog/skolko-stoit-angar-2026", "/blog/bystrovozdyvaemye-zdaniya", "/blog/stroitelstvo-angarov-moskovskaya-oblast"],
  },
  {
    slug: "/blog/zernokhranilishche-metallokarkas-agro",
    ogImageUrl: "https://freonn.pro/images/home/agro.webp",
    title: "Зернохранилище из металлоконструкций: проект АПК | Freonn",
    h1: "Зернохранилище под ключ для агробизнеса",
    metaDescription:
      "Зернохранилища: напольное хранение, силосы, аэрация. Металлокаркас от 5 500 ₽/m². Freonn — субсидии АПК.",
    publishDate: "2026-06-10",
    category: "Типы зданий",
    readTime: 6,
    tags: ["зернохранилище", "агро", "сельхоз", "металлоконструкции"],
    intro:
      "Зернохранилище на металлокаркасе — быстрый способ нарастить мощности элеватора или КФХ. Учитываем аэрацию, температуру зерна и требования Росрезерва.",
    sections: [
      { type: "h2", content: "Типы хранения" },
      {
        type: "ul",
        items: ["Напольное в ангаре с аэрационными каналами", "Металлические силосы", "Комбинированные комплексы с сушилкой"],
      },
      { type: "h2", content: "Услуга Freonn" },
      {
        type: "p",
        content: "Проект, МК, монтаж и инженерия — под ключ. Landing: /selskokhozyaystvennye-zdaniya/zernokhranilishche.",
      },
    ],
    faqs: [
      { q: "Можно ли получить субсидию?", a: "Да, при соответствии программе МСХ. Помогаем с комплектом документов для заявки." },
    ],
    relatedPosts: ["/blog/zernokhranilishche-pod-klyuch", "/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/bystrovozdyvaemye-zdaniya"],
  },
  {
    slug: "/blog/navesy-dlya-tehniki-selhoz-i-prom",
    ogImageUrl: "https://freonn.pro/images/home/naves.webp",
    title: "Навесы для техники: сельхоз и промышленность | Freonn",
    h1: "Металлические навесы для техники",
    metaDescription:
      "Навесы для тракторов, комбайнов, погрузчиков. От 2 800 ₽/m², монтаж от 7 дней. Freonn — проект и монтаж.",
    publishDate: "2026-06-10",
    category: "Типы зданий",
    readTime: 5,
    tags: ["навес", "техника", "сельхоз", "металлоконструкции"],
    intro:
      "Навес защищает технику от осадков и UV без полноценного капитального здания. Лёгкий фундамент, быстрый монтаж, бюджет ниже ангара на 30–40%.",
    sections: [
      { type: "h2", content: "Когда выбирают навес" },
      {
        type: "p",
        content: "Хранение тракторов и комбайнов, зона погрузки, парковка автопарка. Страницы: /navesy, /navesy/avto, /navesy/tehnika.",
      },
    ],
    faqs: [
      { q: "Сколько стоит навес 300 m²?", a: "Ориентир — от 840 000 до 1,2 млн ₽ в зависимости от пролёта и обшивки." },
    ],
    relatedPosts: ["/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/bystrovozdyvaemye-zdaniya", "/blog/zernokhranilishche-pod-klyuch"],
  },
  {
    slug: "/blog/holodilnyy-sklad-proekt-i-stoimost",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Холодильный склад под ключ: проект и стоимость | Freonn",
    h1: "Холодильный склад: от проекта до ввода",
    metaDescription:
      "Холодильный и морозильный склад: температурный контур, изоляция, холодильное оборудование. Freonn — проект и монтаж. 8(800)101-2009.",
    publishDate: "2026-06-11",
    category: "Типы зданий",
    readTime: 7,
    tags: ["холодильный склад", "морозильный", "логистика", "продукты"],
    intro:
      "Холодильный склад требует точного температурного контура, пароизоляции и подбора холодильного оборудования. Freonn проектирует каркас и оболочку с учётом режима −18…+5 °C.",
    sections: [
      { type: "h2", content: "Компоненты холодильного склада" },
      {
        type: "ul",
        items: [
          "Утепление 150–200 mm, пароизоляция без мостиков холода",
          "Холодильные камеры и шлюзы",
          "Полы под нагрузку погрузчика и антискользящее покрытие",
        ],
      },
      { type: "h2", content: "Услуга Freonn" },
      {
        type: "p",
        content: "Строим холодильные склады под ключ: /sklady/holodilnye. Смета — после ТЗ и выбора температурного режима.",
      },
    ],
    faqs: [
      { q: "Сколько стоит холодильный склад 1000 m²?", a: "Ориентир — от 28 до 45 млн ₽ с оборудованием. Точная смета после проекта и подбора агрегатов." },
    ],
    relatedPosts: ["/blog/holodnyy-ili-teplyy-sklad", "/blog/logisticheskiy-sklad-2000-m2-proekt", "/blog/sklad-pod-klyuch-moskva"],
  },
  {
    slug: "/blog/sklad-klassa-a-i-b-sravnenie",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Склад класса A и B: отличия и цена 2026 | Freonn",
    h1: "Склад класса A vs класса B",
    metaDescription:
      "Чем отличается склад класса A от B: высота, полы, доки, спринклер. Цены и сроки строительства. Freonn — проект под ключ.",
    publishDate: "2026-06-11",
    category: "Технологии",
    readTime: 6,
    tags: ["склад класса a", "класс b", "логистика", "склад"],
    intro:
      "Класс склада определяет требования инвесторов и арендаторов: высота хранения, нагрузка на пол, инженерия и доковая система.",
    sections: [
      { type: "h2", content: "Класс A" },
      {
        type: "p",
        content: "Высота 10–12 m, полы 5–8 т/м², спринклер, температурный режим +5…+25 °C. Ориентир — от 14 000 ₽/m². Страница: /sklady/klass-a.",
      },
      { type: "h2", content: "Класс B" },
      {
        type: "p",
        content: "Высота 8–10 m, утепление 80–120 mm, доки по ТЗ. Ориентир — от 12 000 ₽/m². Страница: /sklady/klass-b.",
      },
    ],
    faqs: [
      { q: "Какой класс нужен для e-commerce?", a: "Чаще класс B с температурой +5…+12 °C; для фармы и продуктов — A или холодильный контур." },
    ],
    relatedPosts: ["/blog/logisticheskie-sklady-mo-mkad", "/blog/sklad-pod-klyuch-moskva", "/blog/sendvich-paneli-dlya-sklada-vybor-tolshchiny"],
  },
  {
    slug: "/blog/angar-sendvich-paneli-teplovoy-kontur",
    ogImageUrl: "https://freonn.pro/images/home/angar.webp",
    title: "Ангар из сэндвич-панелей: тёплый контур и цена | Freonn",
    h1: "Ангар из сэндвич-панелей под ключ",
    metaDescription:
      "Тёплый ангар из сэндвич-панелей: утепление 80–150 mm, энергоэффективность, монтаж от 21 дня. Freonn — от 5 500 ₽/m².",
    publishDate: "2026-06-11",
    category: "Типы зданий",
    readTime: 6,
    tags: ["ангар", "сэндвич-панели", "утепление", "теплый ангар"],
    intro:
      "Ангар из сэндвич-панелей сохраняет температуру и снижает расходы на отопление — оптимален для производств и складов с режимом выше +5 °C.",
    sections: [
      { type: "h2", content: "Когда выбирают сэндвич" },
      {
        type: "p",
        content: "Нужен стабильный микроклимат, чистое производство или склад с постоянным персоналом. Landing: /angary/sendvich-paneli и /angary/teplye.",
      },
      { type: "h2", content: "Сроки и цена" },
      {
        type: "p",
        content: "1000 m² — 2–3 месяца под ключ. Ориентир — от 5 500 до 7 500 ₽/m² в зависимости от толщины панели и региона.",
      },
    ],
    faqs: [
      { q: "Можно ли комбинировать профлист и сэндвич?", a: "Да: фасад и торцы — сэндвич, кровля — профлист с утеплением, если бюджет ограничен." },
    ],
    relatedPosts: ["/blog/sendvich-paneli-dlya-sklada-vybor-tolshchiny", "/blog/bystrovozvodimye-zdaniya-tehnologiya-2026", "/blog/holodnyy-ili-teplyy-sklad"],
  },
  {
    slug: "/blog/light-industrial-tsekh-pod-klyuch",
    ogImageUrl: "https://freonn.pro/images/home/production.webp",
    title: "Light industrial: лёгкое производство под ключ | Freonn",
    h1: "Light industrial — цеха лёгкой промышленности",
    metaDescription:
      "Light industrial здания: сборка, пищевое производство, fulfilment. От 13 000 ₽/m². Freonn — проект и монтаж.",
    publishDate: "2026-06-12",
    category: "Типы зданий",
    readTime: 6,
    tags: ["light industrial", "цех", "производство", "сэндвич"],
    intro:
      "Light industrial — производственные здания без тяжёлых крановых нагрузок: сборка, упаковка, лёгкая металлообработка, пищевые цеха.",
    sections: [
      { type: "h2", content: "Типовые параметры" },
      {
        type: "p",
        content: "Пролёт 12–24 m, высота 6–8 m, сэндвич 80–120 mm, инженерия под чистые производства. Страница: /proizvodstvennye-zdaniya/legkoe.",
      },
      { type: "h2", content: "Сроки" },
      {
        type: "p",
        content: "Объект 1000 m² — 3–4 месяца с проектом и фундаментом. Монтаж каркаса — 30–45 дней.",
      },
    ],
    faqs: [
      { q: "Нужен ли мостовой кран?", a: "Для light industrial часто достаточно кран-балки 1–3 т; тяжёлые цеха проектируем с усиленным каркасом." },
    ],
    relatedPosts: ["/blog/proizvodstvennyy-tsekh-pod-klyuch", "/blog/bystrovozvodimye-zdaniya-tehnologiya-2026", "/blog/montazh-metallokonstruktsiy-stoimost-etapy"],
  },
  {
    slug: "/blog/sportivnyy-manezh-metallokonstruktsii",
    ogImageUrl: "https://freonn.pro/images/home/production.webp",
    title: "Спортивный манеж из металлоконструкций | Freonn",
    h1: "Крытый спортивный манеж под ключ",
    metaDescription:
      "Спортивные манежи: пролёт до 60 m без колонн, высота до 12 m. Футбол, лёгкая атлетика, конный спорт. Freonn.",
    publishDate: "2026-06-12",
    category: "Типы зданий",
    readTime: 6,
    tags: ["манеж", "спорт", "металлоконструкции", "пролёт"],
    intro:
      "Спортивный манеж требует больших пролётов и высоты под трибуны и спортивное покрытие. Металлокаркас Freonn — без промежуточных опор до 60 m.",
    sections: [
      { type: "h2", content: "Конструктив" },
      {
        type: "p",
        content: "Ферменный каркас, высота до 12 m, вентиляция и освещение по нормам для спортивных залов. Landing: /sportivnye-sooruzheniya/manezh.",
      },
      { type: "h2", content: "Стоимость" },
      {
        type: "p",
        content: "Ориентир — от 16 000 ₽/m² в зависимости от пролёта, региона и инженерии. КП за 1 рабочий день.",
      },
    ],
    faqs: [
      { q: "Можно ли совместить манеж с другими функциями?", a: "Да — проектируем многофункциональные залы с трансформируемым покрытием и акустикой." },
    ],
    relatedPosts: ["/blog/bystrovozvodimye-zdaniya-tehnologiya-2026", "/blog/proizvodstvennyy-tsekh-pod-klyuch", "/blog/stroitelstvo-angarov-moskovskaya-oblast"],
  },
  {
    slug: "/blog/angary-podolsk-stroitelstvo-pod-klyuch",
    ogImageUrl: "https://freonn.pro/images/home/angar.webp",
    title: "Ангары в Подольске под ключ — цены и промзоны | Freonn",
    h1: "Строительство ангаров в Подольске",
    metaDescription: "Ангары в Подольске от 8 670 ₽/m². Промзоны юга МО, логистика, e-commerce. Freonn — выезд за 24 ч.",
    publishDate: "2026-06-12",
    category: "Типы зданий",
    readTime: 6,
    tags: ["ангар", "подольск", "московская область", "промзона"],
    intro: "Подольск — крупнейший промышленный центр юга МО. Строим ангары и склады для логистики, производства и e-commerce.",
    sections: [
      { type: "h2", content: "Почему Подольск" },
      { type: "p", content: "Логистические кластеры, доступ к М4 и ЦКАД, участки дешевле, чем у МКАД. Geo: /angary-podolsk, combo: /angar-1000-m2-podolsk." },
      { type: "h2", content: "Цены" },
      { type: "p", content: "Ориентир — от 8 670 ₽/m² (коэфф. 1,02). Ангар 1000 m² — от 8,7 млн ₽." },
    ],
    faqs: [{ q: "Сколько стоит ангар 1000 m² в Подольске?", a: "От 8,7 млн ₽ холодный; с утеплением — от 11,7 млн ₽." }],
    relatedPosts: ["/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/sklad-pod-klyuch-moskva", "/blog/logisticheskie-sklady-mo-mkad"],
  },
  {
    slug: "/blog/sklady-himki-logistika-mkad",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Склады в Химках: логистика у МКАД и Шереметьево | Freonn",
    h1: "Строительство складов в Химках",
    metaDescription: "Склады в Химках от 9 180 ₽/m². Fulfilment, класс A/B, у МКАД. Freonn.",
    publishDate: "2026-06-12",
    category: "Типы зданий",
    readTime: 6,
    tags: ["склад", "химки", "логистика", "мкад"],
    intro: "Химки — премиальная локация для складов: МКАД, аэропорт Шереметьевo, высокий спрос на fulfilment.",
    sections: [
      { type: "h2", content: "Типовые решения" },
      { type: "p", content: "Склады 1000–2000 m² класса B, температурные режимы +5…+12 °C. /sklady-himki, /sklad-1000-m2-himki." },
    ],
    faqs: [{ q: "Сколько стоит склад 2000 m² в Химках?", a: "Ориентир — от 18–22 млн ₽ класс B." }],
    relatedPosts: ["/blog/sklad-pod-klyuch-moskva", "/blog/logisticheskie-sklady-mo-mkad", "/blog/stoimost-sklada-1000-m2-moskva"],
  },
  {
    slug: "/blog/angary-balashiha-mashinostroenie",
    ogImageUrl: "https://freonn.pro/images/home/angar.webp",
    title: "Ангары в Балашихе — машиностроение и логистика | Freonn",
    h1: "Ангары и цеха в Балашихе",
    metaDescription: "Ангары в Балашихе от 8 925 ₽/m². Машиностроение, склады, близость к Москве. Freonn.",
    publishDate: "2026-06-13",
    category: "Типы зданий",
    readTime: 5,
    tags: ["ангар", "балашиха", "мо", "производство"],
    intro: "Балашиха — один из крупнейших городов МО: машиностроение, логистика, торговые склады.",
    sections: [{ type: "p", content: "Geo: /angary-balashiha. Combo: /angar-1000-m2-balashiha, /tsekh-1000-m2-balashiha." }],
    faqs: [{ q: "Выезжаете в Балашиху?", a: "Да, инженер — в течение 24 часов." }],
    relatedPosts: ["/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/angary-podolsk-stroitelstvo-pod-klyuch", "/blog/proizvodstvennyy-tsekh-pod-klyuch"],
  },
  {
    slug: "/blog/sklad-ramenskoye-aerokosmicheskiy-klaster",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Склады и цеха в Раменском — аэрокосмический кластер | Freonn",
    h1: "Строительство в Раменском",
    metaDescription: "Склады и производственные здания в Раменском. Аэропорт Жуковский, М5. Freonn.",
    publishDate: "2026-06-13",
    category: "Типы зданий",
    readTime: 5,
    tags: ["раменское", "склад", "цех", "аэрокосмос"],
    intro: "Раменское — аэрокосмический кластер востока МО. Строим склады и цеха с усиленными пролётами.",
    sections: [{ type: "p", content: "/sklady-ramenskoye, /proizvodstvennye-zdaniya-ramenskoye, /sklad-2000-m2-ramenskoye." }],
    faqs: [{ q: "Есть кейсы в Раменском?", a: "Да — см. /portfolio/tsekh-ramenskoye." }],
    relatedPosts: ["/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/light-industrial-tsekh-pod-klyuch", "/blog/logisticheskiy-sklad-2000-m2-proekt"],
  },
  {
    slug: "/blog/sklady-domodedovo-avialogistika",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Склады в Домодедово: авиалогистика и таможня | Freonn",
    h1: "Склады в Домодедово под ключ",
    metaDescription: "Склады в Домодедово от 8 755 ₽/m². Аэропорт, таможенные РЦ, М4. Freonn.",
    publishDate: "2026-06-13",
    category: "Типы зданий",
    readTime: 6,
    tags: ["домодедово", "склад", "логистика", "аэропорт"],
    intro: "Домодедово — авиационно-логистический узел юга МО. Склады для таможенных и распределительных центров.",
    sections: [{ type: "p", content: "/sklady-domodedovo, /sklad-1000-m2-domodedovo. Опыт объектов у трассы М4." }],
    faqs: [{ q: "Можно ли строить склад у аэропорта?", a: "Да, с учётом ограничений по высоте и шума — проектируем по ТЗ." }],
    relatedPosts: ["/blog/logisticheskie-sklady-mo-mkad", "/blog/sklad-pod-klyuch-moskva", "/blog/ckad-logistika-moskovskaya-oblast"],
  },
  {
    slug: "/blog/sklad-klin-severo-zapad-mo",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Склад в Клину: северо-запад МО, цены и промзоны | Freonn",
    h1: "Строительство склада в Клину",
    metaDescription:
      "Склад в Клину от 8 580 ₽/m². Северо-запад МО, Ленинградское шоссе, логистика для производства. Freonn — выезд за 24 ч.",
    publishDate: "2026-06-14",
    category: "Типы зданий",
    readTime: 6,
    tags: ["склад", "клин", "московская область", "логистика"],
    intro:
      "Клин — компактный промышленный центр северо-запада МО. Строим склады для производств, дистрибуции и хранения сырья.",
    sections: [
      { type: "h2", content: "Почему Клин" },
      {
        type: "p",
        content:
          "Участки дешевле столичных, доступ к Ленинградскому шоссе и ЦКАД. Geo: /sklady-klin, combo: /sklad-1000-m2-klin при расширении логистики.",
      },
      { type: "h2", content: "Типовые решения" },
      {
        type: "p",
        content:
          "Склады 800–2000 m² класса B: нетемпературные и утеплённые, рампы, полы под стеллажи 5 т/m². Срок монтажа — от 35 дней.",
      },
    ],
    faqs: [
      { q: "Сколько стоит склад 1000 m² в Клину?", a: "Ориентир — от 8,6 млн ₽ без утепления; с сэндвич-панелями 100 mm — от 11,5 млн ₽." },
    ],
    relatedPosts: ["/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/sklady-himki-logistika-mkad", "/blog/sklad-pod-klyuch-moskva"],
  },
  {
    slug: "/blog/tsekh-volokolamsk-proizvodstvo-mo",
    ogImageUrl: "https://freonn.pro/images/home/production.webp",
    title: "Производственный цех в Волоколамск: запад МО | Freonn",
    h1: "Строительство цеха в Волоколамск",
    metaDescription:
      "Производственный цех в Волоколамск от 9 100 ₽/m². Запад МО, light industrial, кран-балка. Freonn — проект и монтаж под ключ.",
    publishDate: "2026-06-14",
    category: "Типы зданий",
    readTime: 6,
    tags: ["цех", "волоколамск", "московская область", "производство"],
    intro:
      "Волоколамск — западное направление МО с доступом к Рижскому шоссе. Строим цеха и light industrial под машиностроение и переработку.",
    sections: [
      { type: "h2", content: "Типовые объекты" },
      {
        type: "p",
        content:
          "Цеха 1000–2000 m² с пролётом 18–24 m, кран-балка до 5 т, вентиляция по СП. Geo: /proizvodstvennye-zdaniya-volokolamsk, landing: /proizvodstvennye-zdaniya/legkoe.",
      },
      { type: "h2", content: "Сроки и цены" },
      {
        type: "p",
        content: "Монтаж каркаса — 20–45 дней после фундамента. Ориентир — от 9,1 млн ₽ за 1000 m² холодный цех.",
      },
    ],
    faqs: [{ q: "Есть ли combo-страницы для Волоколамск?", a: "Да — /tsekh-1000-m2-volokolamsk и /tsekh-2000-m2-volokolamsk." }],
    relatedPosts: ["/blog/proizvodstvennyy-tsekh-pod-klyuch", "/blog/light-industrial-tsekh-pod-klyuch", "/blog/stroitelstvo-angarov-moskovskaya-oblast"],
  },
  {
    slug: "/blog/angar-24x60-m2-proekt-i-stoimost",
    ogImageUrl: "https://freonn.pro/images/home/angar.webp",
    title: "Ангар 24×60 м (1440 m²): проект, пролёт, цена | Freonn",
    h1: "Ангар 24×60 м — 1440 m² под ключ",
    metaDescription:
      "Ангар 24×60 м (1440 m²) под ключ от 8 млн ₽. Пролёт 24 m, высота 7 m. Freonn — проект, МК, монтаж за 25–40 дней.",
    publishDate: "2026-06-15",
    category: "Типы зданий",
    readTime: 7,
    tags: ["ангар", "24x60", "1440 м2", "габариты"],
    intro:
      "Ангар 24×60 m — один из самых запрашиваемых габаритов для логистики и производства: пролёт 24 m без колонн, площадь 1440 m².",
    sections: [
      { type: "h2", content: "Конструктив" },
      {
        type: "p",
        content:
          "Ферменный каркас ЛСТК, высота 7 m, ворота под фуру 4×4 m. Страница размера: /angar-24x60-m2. Сравнение: /angar-20x40-m2 (800 m²) и /angar-30x60-m2 (1800 m²).",
      },
      { type: "h2", content: "Стоимость" },
      {
        type: "p",
        content: "Холодный ангар — от 8,0–12,0 млн ₽; с утеплением сэндвич-панелями 100 mm — от 10,8 млн ₽. КП за 1 рабочий день.",
      },
    ],
    faqs: [
      { q: "Сколько весит каркас ангара 24×60?", a: "Ориентир — 45–55 т МК; доставка фурой за 1–2 рейса из региона." },
      { q: "Нужен ли капитальный фундамент?", a: "Для 1440 m² — ленточный или свайно-ростверковый по геологии; проектируем в составе КП." },
    ],
    relatedPosts: ["/blog/angar-20x40-gabarity-i-tsena", "/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/bystrovozvodimye-zdaniya-tehnologiya-2026"],
  },
  {
    slug: "/blog/angar-30x60-m2-logistika-i-proizvodstvo",
    ogImageUrl: "https://freonn.pro/images/home/angar.webp",
    title: "Ангар 30×60 м (1800 m²): логистика и производство | Freonn",
    h1: "Ангар 30×60 m — 1800 m² под ключ",
    metaDescription:
      "Ангар 30×60 m (1800 m²) под ключ от 10 млн ₽. Пролёт 30 m, высота 8 m. Freonn — склады и цеха в МО и регионах.",
    publishDate: "2026-06-15",
    category: "Типы зданий",
    readTime: 7,
    tags: ["ангар", "30x60", "1800 м2", "логистика"],
    intro:
      "Ангар 30×60 m (1800 m²) — решение для крупной логистики, автопарка или производственного участка с широким пролётом.",
    sections: [
      { type: "h2", content: "Применение" },
      {
        type: "p",
        content:
          "Распределительные центры, производство с краном, хранение техники. URL: /angar-30x60-m2. Для Москвы и МО — combo /angar-2000-m2-moskva.",
      },
      { type: "h2", content: "Особенности монтажа" },
      {
        type: "p",
        content: "Пролёт 30 m требует усиленных ферм; монтаж 30–45 дней бригадой 6–8 человек. Антикоррозийная обработка по ГОСТ.",
      },
    ],
    faqs: [{ q: "Можно ли добавить мостовой кран?", a: "Да — проектируем усиленные колонны и крановые балки; см. /proizvodstvennye-zdaniya/s-kranom." }],
    relatedPosts: ["/blog/angar-24x60-m2-proekt-i-stoimost", "/blog/logisticheskiy-sklad-2000-m2-proekt", "/blog/proizvodstvennyy-tsekh-pod-klyuch"],
  },
  {
    slug: "/blog/teplyy-sklad-fulfilment-moskva-mo",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Тёплый склад fulfilment: проект +5…+12 °C | Freonn",
    h1: "Тёплый склад для fulfilment и e-commerce",
    metaDescription:
      "Тёплый склад fulfilment под ключ: утепление, температурный режим +5…+12 °C, доки. Freonn — /sklady/teplye, Москва и МО.",
    publishDate: "2026-06-16",
    category: "Типы зданий",
    readTime: 8,
    tags: ["тёплый склад", "fulfilment", "e-commerce", "утепление"],
    intro:
      "Тёплый склад — must-have для fulfilment, маркетплейсов и дистрибуции с температурным режимом +5…+12 °C круглый год.",
    sections: [
      { type: "h2", content: "Конструктив и утепление" },
      {
        type: "p",
        content:
          "Сэндвич-панели 100–150 mm PIR или минвата, герметичные стыки, отопление и вентиляция по ТЗ. Landing: /sklady/teplye, холодные — /sklady/holodilnye.",
      },
      { type: "h2", content: "Логистика fulfilment" },
      {
        type: "p",
        content:
          "12+ доковых ворот, зоны комплектации, антипылевые полы, LED-освещение 300 lux. Примеры: /sklady-himki, /sklad-2000-m2-moskva.",
      },
      { type: "h2", content: "Стоимость" },
      {
        type: "p",
        content: "Тёплый склад 1000 m² — от 12–16 млн ₽ под ключ в МО; срок ввода — 3–4 месяца с фундаментом.",
      },
    ],
    faqs: [
      { q: "Чем тёплый склад отличается от холодильного?", a: "Тёплый — +5…+12 °C для хранения без заморозки; холодильный — 0…+5 °C или ниже, см. /sklady/holodilnye." },
      { q: "Какой класс склада нужен для маркетплейса?", a: "Обычно класс B с температурным режимом и доками; для крупных РЦ — класс A, см. /sklady/klass-a." },
    ],
    relatedPosts: ["/blog/sklady-himki-logistika-mkad", "/blog/sklad-klassa-a-i-b-sravnenie", "/blog/holodilnyy-sklad-proekt-i-stoimost"],
  },
  {
    slug: "/blog/magazin-iz-metallokonstruktsiy-pod-klyuch",
    ogImageUrl: "https://freonn.pro/images/home/trade.webp",
    title: "Магазин из металлоконструкций: проект и цена 2026 | Freonn",
    h1: "Магазин из металлоконструкций под ключ",
    metaDescription:
      "Магазин из металлоконструкций под ключ: фасад, планировка, сроки от 2 мес. Freonn — /torgovye-zdaniya/magazin, торговые здания в МО.",
    publishDate: "2026-06-17",
    category: "Типы зданий",
    readTime: 7,
    tags: ["магазин", "торговое здание", "металлоконструкции", "фасад"],
    intro:
      "Магазин из металлоконструкций — быстрый способ открыть торговую точку или павильон: каркас, фасадные панели, инженерия по брендбуку.",
    sections: [
      { type: "h2", content: "Типовые решения" },
      {
        type: "p",
        content:
          "Одноэтажные павильоны 200–800 m² и двухуровневые магазины до 2 000 m². Landing: /torgovye-zdaniya/magazin, хаб: /torgovye-zdaniya.",
      },
      { type: "h2", content: "Сроки и стоимость" },
      {
        type: "p",
        content: "Монтаж каркаса — 14–30 дней; под ключ с фасадом — от 18 000 ₽/m². КП за 1 рабочий день.",
      },
    ],
    faqs: [{ q: "Нужно ли разрешение на магазин?", a: "Зависит от площади и назначения участка — консультируем на этапе ТЗ." }],
    relatedPosts: ["/blog/torgovyy-tsentr-iz-metallokonstryktsiy", "/blog/bystrovozvodimye-zdaniya-tehnologiya-2026", "/blog/sendvich-paneli-dlya-sklada-vybor-tolshchiny"],
  },
  {
    slug: "/blog/korovnik-metallokarkas-pod-klyuch",
    ogImageUrl: "https://freonn.pro/images/home/agro.webp",
    title: "Коровник из металлоконструкций под ключ | Freonn",
    h1: "Коровник из металлоконструкций",
    metaDescription:
      "Коровник из металлоконструкций: микроклимат, навозоудаление, вентиляция. Freonn — /selskokhozyaystvennye-zdaniya/korovnik, с/х здания под ключ.",
    publishDate: "2026-06-17",
    category: "С/х здания",
    readTime: 7,
    tags: ["коровник", "сельхоз", "металлоконструкции", "животноводство"],
    intro:
      "Коровник на металлокаркасе — стандарт для молочных и мясных ферм: пролёты 12–24 m, вентиляция, навозные системы по ветнормам.",
    sections: [
      { type: "h2", content: "Конструктив" },
      {
        type: "p",
        content:
          "Каркас ЛСТК, утепление 80–100 mm, кровля с уклоном под снеговую нагрузку региона. Страница: /selskokhozyaystvennye-zdaniya/korovnik.",
      },
      { type: "h2", content: "Инженерия" },
      {
        type: "p",
        content: "Принудительная вентиляция, автоматика микроклимата, зоны доения и содержания — проектируем по ТЗ хозяйства.",
      },
    ],
    faqs: [{ q: "Сколько стоит коровник на 100 голов?", a: "Ориентир — от 4 500 ₽/m²; точная смета после ТЗ и геологии." }],
    relatedPosts: ["/blog/zernokhranilishche-metallokarkas-agro", "/blog/navesy-dlya-tehniki-selhoz-i-prom", "/blog/bystrovozvodimye-zdaniya-tehnologiya-2026"],
  },
  {
    slug: "/blog/ptichnik-mikroklimat-i-ventilyatsiya",
    ogImageUrl: "https://freonn.pro/images/home/agro.webp",
    title: "Птичник под ключ: микроклимат и вентиляция | Freonn",
    h1: "Птичник из металлоконструкций",
    metaDescription:
      "Птичник под ключ: микроклимат, вентиляция, плотность посадки. Freonn — /selskokhozyaystvennye-zdaniya/ptichnik, с/х здания.",
    publishDate: "2026-06-18",
    category: "С/х здания",
    readTime: 6,
    tags: ["птичник", "бройлер", "микроклимат", "сельхоз"],
    intro:
      "Птичник на металлокаркасе требует точного микроклимата: температура, влажность, кратность воздухообмена по породе и технологии.",
    sections: [
      { type: "h2", content: "Проектирование" },
      {
        type: "p",
        content:
          "Зонирование кормления, поения, выгульных площадок. Landing: /selskokhozyaystvennye-zdaniya/ptichnik, зерно — /selskokhozyaystvennye-zdaniya/zernokhranilishche.",
      },
      { type: "h2", content: "Сроки" },
      { type: "p", content: "Монтаж каркаса — 20–35 дней; полный цикл с инженерией — 2–3 месяца." },
    ],
    faqs: [{ q: "Можно ли утеплить птичник сэндвич-панелями?", a: "Да — подбираем толщину и покрытие под санитарные требования." }],
    relatedPosts: ["/blog/korovnik-metallokarkas-pod-klyuch", "/blog/zernokhranilishche-metallokarkas-agro", "/blog/sendvich-paneli-dlya-sklada-vybor-tolshchiny"],
  },
  {
    slug: "/blog/km-kmd-izgotovlenie-metallokonstruktsiy",
    ogImageUrl: "https://freonn.pro/images/home/production.webp",
    title: "КМ и КМД: изготовление металлоконструкций | Freonn",
    h1: "Изготовление КМ и КМД на заводе Freonn",
    metaDescription:
      "Изготовление металлоконструкций КМ/КМД: проект, производство, антикор. Freonn — /metallokonstruktsii, монтаж /metallokonstruktsii/montazh.",
    publishDate: "2026-06-18",
    category: "Технологии",
    readTime: 8,
    tags: ["КМ", "КМД", "металлоконструкции", "изготовление"],
    intro:
      "КМ (конструкции металлические) и КМД (деталировка) — основа любого ангара, склада или цеха. Собственное производство Freonn — контроль сроков и качества.",
    sections: [
      { type: "h2", content: "Этапы" },
      {
        type: "p",
        content:
          "1) Расчёт и проект КМ — 5–10 дней. 2) КМД и карты раскроя. 3) Изготовление на заводе — 10–20 дней. 4) Антикор и маркировка. Хаб: /metallokonstruktsii.",
      },
      { type: "h2", content: "Монтаж" },
      { type: "p", content: "Монтажные бригады в МО и регионах — /metallokonstruktsii/montazh, статья: /blog/montazh-metallokonstruktsiy-stoimost-etapy." },
    ],
    faqs: [{ q: "Работаете по чертежам заказчика?", a: "Да — изготавливаем по готовому КМД или разрабатываем проект с нуля." }],
    relatedPosts: ["/blog/montazh-metallokonstruktsiy-stoimost-etapy", "/blog/bystrovozvodimye-zdaniya-tehnologiya-2026", "/blog/proizvodstvennyy-tsekh-pod-klyuch"],
  },
  {
    slug: "/blog/naves-dlya-avto-metallokonstruktsii",
    ogImageUrl: "https://freonn.pro/images/home/naves.webp",
    title: "Навес для автомобиля из металлоконструкций | Freonn",
    h1: "Навес для авто под ключ",
    metaDescription:
      "Навес для автомобиля: каркас, кровля, сроки от 7 дней. Freonn — /navesy/avto, навесы для техники и авто в МО.",
    publishDate: "2026-06-19",
    category: "Типы зданий",
    readTime: 5,
    tags: ["навес", "авто", "гараж", "металлоконструкции"],
    intro:
      "Навес для автомобиля защищает от осадков и солнца: компактные решения 3×6 m и крупные стоянки для автопарка.",
    sections: [
      { type: "h2", content: "Типовые размеры" },
      {
        type: "p",
        content: "Один автомобиль — от 3×6 m; два — 6×6 m. Landing: /navesy/avto, общий хаб: /navesy, техника — /navesy/tehnika.",
      },
      { type: "h2", content: "Цена" },
      { type: "p", content: "Ориентир — от 120 000 ₽ за навес 3×6 m под ключ с фундаментом." },
    ],
    faqs: [{ q: "Нужен ли фундамент?", a: "Для стационарного навеса — ленточный или столбчатый; для временного — анкеровка по проекту." }],
    relatedPosts: ["/blog/navesy-dlya-tehniki-selhoz-i-prom", "/blog/bystrovozvodimye-zdaniya-tehnologiya-2026", "/blog/montazh-metallokonstruktsiy-stoimost-etapy"],
  },
  {
    slug: "/blog/angar-vs-sklad-chto-vybrat",
    ogImageUrl: "https://freonn.pro/images/home/angar.webp",
    title: "Ангар или склад: что выбрать для бизнеса | Freonn",
    h1: "Ангар vs склад — сравнение для заказчика",
    metaDescription:
      "Ангар или склад: отличия по утеплению, докам, классу, цене. Freonn — /angary, /sklady, подбор решения под задачу.",
    publishDate: "2026-06-19",
    category: "Сравнения",
    readTime: 7,
    tags: ["ангар", "склад", "сравнение", "логистика"],
    intro:
      "Ангар и склад часто путают: оба — металлокаркас, но назначение, утепление и инженерия различаются. Разбираем, что выбрать под вашу задачу.",
    sections: [
      { type: "h2", content: "Когда достаточно ангара" },
      {
        type: "p",
        content:
          "Хранение техники, сырья без температурного режима, производство с естественной вентиляцией. /angary, /angary/holodnye, /angary/teplye.",
      },
      { type: "h2", content: "Когда нужен склад" },
      {
        type: "p",
        content:
          "Логистика, fulfilment, температурный режим, доковые ворота, класс A/B. /sklady, /sklady/teplye, /sklady/holodilnye.",
      },
    ],
    faqs: [{ q: "Можно ли переделать ангар в склад?", a: "Да — утепление, полы, доки и инженерия; оценим каркас на этапе обследования." }],
    relatedPosts: ["/blog/metallicheskiy-sklad-vs-kirpichnyy", "/blog/holodnyy-ili-teplyy-sklad", "/blog/sklad-klassa-a-i-b-sravnenie"],
  },
  {
    slug: "/blog/angar-s-kranom-kran-balka-montazh",
    ogImageUrl: "https://freonn.pro/images/home/angar.webp",
    title: "Ангар с кран-балкой: проект и монтаж | Freonn",
    h1: "Кран-балка в ангаре и цехе",
    metaDescription:
      "Ангар с краном: кран-балка 1–10 т, усиленный каркас, монтаж. Freonn — /proizvodstvennye-zdaniya/s-kranom, ангары и цеха с краном.",
    publishDate: "2026-06-20",
    category: "Технологии",
    readTime: 7,
    tags: ["кран-балка", "ангар", "мостовой кран", "производство"],
    intro:
      "Кран-балка или мостовой кран в ангаре/цехе требует усиленных колонн, крановых балок и согласования нагрузок на этапе КМ.",
    sections: [
      { type: "h2", content: "Типы кранов" },
      {
        type: "p",
        content:
          "Кран-балка 1–5 т — light industrial; мостовой 5–10 т — машиностроение. Landing: /proizvodstvennye-zdaniya/s-kranom, ангары — /angary.",
      },
      { type: "h2", content: "Проектирование" },
      { type: "p", content: "Координация с технологами заказчика на этапе КМД; опыт: /portfolio/tsekh-balashiha, /portfolio/tsekh-ramenskoye." },
    ],
    faqs: [{ q: "Можно ли добавить кран в готовый ангар?", a: "Только после расчёта несущей способности каркаса — часто требуется усиление." }],
    relatedPosts: ["/blog/proizvodstvennyy-tsekh-pod-klyuch", "/blog/light-industrial-tsekh-pod-klyuch", "/blog/montazh-metallokonstruktsiy-stoimost-etapy"],
  },
  {
    slug: "/blog/proizvodstvo-schelkovo-vostok-mo",
    ogImageUrl: "https://freonn.pro/images/home/production.webp",
    title: "Производство в Щёлково: цеха и склады востока МО | Freonn",
    h1: "Строительство в Щёлково",
    metaDescription:
      "Цеха и склады в Щёлково: восток МО, Щёлковское шоссе. Freonn — /proizvodstvennye-zdaniya-schelkovo, /sklady-schelkovo, кейс /portfolio/sklad-schelkovo.",
    publishDate: "2026-06-20",
    category: "Типы зданий",
    readTime: 6,
    tags: ["щёлково", "цех", "склад", "московская область"],
    intro:
      "Щёлково — крупный город востока МО с развитой промзоной и логистикой по Щёлковскому шоссе. Строим склады и цеха под ключ.",
    sections: [
      { type: "h2", content: "Типовые объекты" },
      {
        type: "p",
        content:
          "Склады 1500–3000 m² класса B, цеха light industrial. Geo: /proizvodstvennye-zdaniya-schelkovo, /sklady-schelkovo, combo: /angar-1000-m2-schelkovo.",
      },
      { type: "h2", content: "Кейс" },
      { type: "p", content: "Склад 2 400 m² — см. /portfolio/sklad-schelkovo." },
    ],
    faqs: [{ q: "Выезжаете в Щёлково?", a: "Да, инженер — в течение 24 часов по МО." }],
    relatedPosts: ["/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/sklad-ramenskoye-aerokosmicheskiy-klaster", "/blog/light-industrial-tsekh-pod-klyuch"],
  },
  {
    slug: "/blog/odintsovo-sklad-klass-a-zapad-mo",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Склад класса A в Одинцово: запад МО | Freonn",
    h1: "Склады в Одинцово — запад Подмосковья",
    metaDescription:
      "Склад класса A/B в Одинцово: на М1, premium-логистика. Freonn — /sklady-odintsovo, /sklad-1000-m2-odintsovo, кейс /portfolio/sklad-odintsovo.",
    publishDate: "2026-06-22",
    category: "Регионы",
    readTime: 6,
    tags: ["одincovo", "склад", "класс a", "московская область"],
    intro:
      "Одинцово — premium-локация западного Подмосковья: офисно-складские блоки, низкая конкуренция участков, удобный выезд на М1 и МКАД.",
    sections: [
      { type: "h2", content: "Типовые решения" },
      {
        type: "p",
        content:
          "Склады 1000–3000 m² класса B/A, доки, полы 5 т/m². Geo: /sklady-odintsovo, combo: /sklad-1000-m2-odintsovo, /sklad-2000-m2-odintsovo.",
      },
      { type: "h2", content: "Кейс Freonn" },
      { type: "p", content: "Склад 1 800 m² — /portfolio/sklad-odintsovo." },
    ],
    faqs: [{ q: "Сколько стоит склад 1000 m² в Одинцово?", a: "От 12–16 млн ₽ холодный, от 18 млн ₽ класс B — после выезда инженера." }],
    relatedPosts: ["/blog/sklad-pod-klyuch-moskva", "/blog/ckad-logistika-moskovskaya-oblast", "/blog/krasnogorsk-sklad-biznes-parki"],
  },
  {
    slug: "/blog/mytishchi-logistika-yaroslavka-mo",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Склады в Мытищах: Ярославское шоссе | Freonn",
    h1: "Логистика в Мытищах — север МО",
    metaDescription:
      "Склады и ангары в Мытищах у Ярославки: e-commerce, производство. Freonn — /sklady-mytishchi, /angary-mytishchi, /angar-1000-m2-mytishchi.",
    publishDate: "2026-06-22",
    category: "Регионы",
    readTime: 6,
    tags: ["мытищи", "логистика", "ярославское шоссе", "мо"],
    intro:
      "Мытищи — ключевой узел северного Подмосковья: Ярославское шоссе, спрос на склады для ритейла и производственно-складские блоки.",
    sections: [
      { type: "h2", content: "Форматы зданий" },
      {
        type: "p",
        content:
          "Ангары 500–2000 m², склады класса B, цеха light industrial. Geo: /angary-mytishchi, /sklady-mytishchi, /proizvodstvennye-zdaniya-mytishchi.",
      },
      { type: "h2", content: "Кейс" },
      { type: "p", content: "Ангар 1 200 m² — /portfolio/angar-mytishchi." },
    ],
    faqs: [{ q: "Выезд инженера в Мытищи?", a: "Да, в течение 24 часов по МО." }],
    relatedPosts: ["/blog/angary-sever-mo-korolev-himki", "/blog/logisticheskie-sklady-mo-mkad", "/blog/proizvodstvo-schelkovo-vostok-mo"],
  },
  {
    slug: "/blog/krasnogorsk-sklad-biznes-parki",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Склады в Красногорске: бизнес-парки | Freonn",
    h1: "Склады и цеха в Красногорске",
    metaDescription:
      "Склады класса A/B в Красногорске: запад МО, бизнес-парки. Freonn — /sklady-krasnogorsk, combo /sklad-1000-m2-krasnogorsk.",
    publishDate: "2026-06-23",
    category: "Регионы",
    readTime: 5,
    tags: ["красногорск", "склад", "бизнес-парк", "мо"],
    intro:
      "Красногорск — развивающийся западный коридор МО: офисно-складские комплексы, чистые производственные блоки, доступ к М9.",
    sections: [
      { type: "p", content: "Geo: /sklady-krasnogorsk, /proizvodstvennye-zdaniya-krasnogorsk. Combo: /angar-1000-m2-krasnogorsk, /sklad-2000-m2-krasnogorsk." },
    ],
    faqs: [{ q: "Есть ли участки под склад в Красногорске?", a: "Подбираем площадку под ТЗ — промзоны и бизнес-парки." }],
    relatedPosts: ["/blog/odintsovo-sklad-klass-a-zapad-mo", "/blog/sklad-pod-klyuch-moskva", "/blog/stroitelstvo-angarov-moskovskaya-oblast"],
  },
  {
    slug: "/blog/domodedovo-sklad-aeroport-m4",
    ogImageUrl: "https://freonn.pro/images/home/sklad.webp",
    title: "Склад у Домодедово и M4: юг МО | Freonn",
    h1: "Склады в Домодедово — аэропорт и M4",
    metaDescription:
      "Склады в Домодедово: таможенная логистика, M4, аэропорт. Freonn — /sklady-domodedovo, /angary-domodedovo, combo-страницы.",
    publishDate: "2026-06-23",
    category: "Регионы",
    readTime: 6,
    tags: ["domodedovo", "m4", "склад", "логистика"],
    intro:
      "Домодедово — южные ворота МО: аэропорт, M4, таможенные склады и распределительные центры для юга России.",
    sections: [
      { type: "p", content: "Geo: /angary-domodedovo, /sklady-domodedovo. Combo: /angar-1000-m2-domodedovo, /tsekh-1000-m2-domodedovo." },
      { type: "p", content: "См. также /blog/logisticheskie-sklady-mo-mkad и /blog/stroitelstvo-angarov-moskovskaya-oblast." },
    ],
    faqs: [{ q: "Подходит ли Домодедово для таможенного склада?", a: "Да, проектируем зоны хранения и доки под ваш режим." }],
    relatedPosts: ["/blog/logisticheskie-sklady-mo-mkad", "/blog/ckad-logistika-moskovskaya-oblast", "/blog/angary-podolsk-stroitelstvo-pod-klyuch"],
  },
];

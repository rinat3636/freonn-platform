/**
 * Каталог типов для калькулятора / КП.
 * Номенклатура собрана по разделам каталога ПК Веста:
 * https://pkvesta.ru/buildings_catalog/
 * База комплекта ₽/м² — внутренняя оценка (не копия цен Веста).
 */

export type BuildingIconFamily = "angar" | "sklad" | "naves" | "karkas" | "selhoz" | "other";

export interface CalculatorBuildingType {
  id: string;
  label: string;
  categoryId: string;
  categoryLabel: string;
  iconFamily: BuildingIconFamily;
  kitRubM2: number;
}

type RawType = { id: string; label: string; iconFamily: BuildingIconFamily; kitRubM2: number };

function withCategory(categoryId: string, categoryLabel: string, rows: RawType[]): CalculatorBuildingType[] {
  return rows.map(r => ({ ...r, categoryId, categoryLabel }));
}

const popular = withCategory("popular", "Распространённые типы", [
  { id: "angar", label: "Ангар", iconFamily: "angar", kitRubM2: 10500 },
  { id: "sklad", label: "Склад", iconFamily: "sklad", kitRubM2: 15600 },
  { id: "naves", label: "Навес", iconFamily: "naves", kitRubM2: 5800 },
  { id: "karkas", label: "Каркас здания", iconFamily: "karkas", kitRubM2: 12800 },
  { id: "other", label: "Другое", iconFamily: "other", kitRubM2: 11500 },
]);

const selhoz = withCategory("selhoz", "Сельское хозяйство", [
  { id: "agrokompleks", label: "Агрокомплексы", iconFamily: "selhoz", kitRubM2: 9800 },
  { id: "akvaferma", label: "Акваферма", iconFamily: "sklad", kitRubM2: 10500 },
  { id: "vinoferma", label: "Вино ферма", iconFamily: "selhoz", kitRubM2: 9200 },
  { id: "gribnye_fermy", label: "Грибные фермы", iconFamily: "sklad", kitRubM2: 10400 },
  { id: "gusinaya_ferma", label: "Гусиная ферма", iconFamily: "selhoz", kitRubM2: 9000 },
  { id: "zernohranilische", label: "Зернохранилища", iconFamily: "sklad", kitRubM2: 8400 },
  { id: "kartofelhranilische", label: "Картофелехранилища", iconFamily: "sklad", kitRubM2: 8600 },
  { id: "kozya_ferma", label: "Козья ферма", iconFamily: "selhoz", kitRubM2: 9000 },
  { id: "konnye_manezhi", label: "Конные манежи", iconFamily: "angar", kitRubM2: 9500 },
  { id: "konyushni", label: "Конюшни", iconFamily: "selhoz", kitRubM2: 8900 },
  { id: "korovniki", label: "Коровники", iconFamily: "selhoz", kitRubM2: 9800 },
  { id: "krolikofermy", label: "Кроликофермы", iconFamily: "selhoz", kitRubM2: 9100 },
  { id: "kurinye_fermy", label: "Куриные фермы", iconFamily: "selhoz", kitRubM2: 9600 },
  { id: "molochnaya_ferma", label: "Молочная ферма", iconFamily: "selhoz", kitRubM2: 10200 },
  { id: "ovoshehranilische", label: "Овощехранилища", iconFamily: "sklad", kitRubM2: 8800 },
  { id: "ovce_ferma", label: "Овце ферма", iconFamily: "selhoz", kitRubM2: 9200 },
  { id: "ovcharnya", label: "Овчарня", iconFamily: "selhoz", kitRubM2: 9000 },
  { id: "perepelinaya_ferma", label: "Перепелиная ферма", iconFamily: "selhoz", kitRubM2: 9400 },
  { id: "pitomnik_rasteniy", label: "Питомник для растений", iconFamily: "karkas", kitRubM2: 8200 },
  { id: "porosyatniki", label: "Поросятники", iconFamily: "selhoz", kitRubM2: 9500 },
  { id: "ptichniki", label: "Птичники", iconFamily: "selhoz", kitRubM2: 9500 },
  { id: "razvedenie_krevetok", label: "Разведение креветок", iconFamily: "sklad", kitRubM2: 10600 },
  { id: "rakovaya_ferma", label: "Раковая ферма", iconFamily: "sklad", kitRubM2: 10400 },
  { id: "ryboferma", label: "Рыбоферма", iconFamily: "sklad", kitRubM2: 10000 },
  { id: "svinarnik_100", label: "Свинарник на 100 голов", iconFamily: "selhoz", kitRubM2: 9700 },
  { id: "svinarnik_200", label: "Свинарник на 200 голов", iconFamily: "selhoz", kitRubM2: 9600 },
  { id: "svinarnik_50", label: "Свинарник на 50 голов", iconFamily: "selhoz", kitRubM2: 9900 },
  { id: "svinarniki", label: "Свинарники", iconFamily: "selhoz", kitRubM2: 9700 },
  { id: "senohranilische", label: "Сенохранилища", iconFamily: "sklad", kitRubM2: 8300 },
  { id: "strausinaya_ferma", label: "Страусиная ферма", iconFamily: "selhoz", kitRubM2: 9300 },
  { id: "syrovarni", label: "Сыроварни", iconFamily: "sklad", kitRubM2: 10800 },
  { id: "teplicy", label: "Теплицы", iconFamily: "karkas", kitRubM2: 11800 },
  { id: "fazanya_ferma", label: "Фазанья ферма", iconFamily: "selhoz", kitRubM2: 9000 },
  { id: "ferma_krs_100", label: "Ферма для КРС на 100 голов", iconFamily: "selhoz", kitRubM2: 9800 },
  { id: "ferma_krs_200", label: "Ферма для КРС на 200 голов", iconFamily: "selhoz", kitRubM2: 9700 },
  { id: "fermy", label: "Фермы", iconFamily: "selhoz", kitRubM2: 8900 },
  { id: "fermy_dlya_krs", label: "Фермы для КРС", iconFamily: "selhoz", kitRubM2: 9800 },
  { id: "fruktohranilische", label: "Фруктохранилища", iconFamily: "sklad", kitRubM2: 8700 },
  { id: "cvetochnaya_ferma", label: "Цветочная ферма", iconFamily: "karkas", kitRubM2: 8400 },
  { id: "selhoz_other", label: "С/х здание (другое)", iconFamily: "selhoz", kitRubM2: 8600 },
]);

const commercial = withCategory("commercial", "Коммерческие здания", [
  { id: "sklady", label: "Склады", iconFamily: "sklad", kitRubM2: 15600 },
  { id: "apteki", label: "Аптеки", iconFamily: "other", kitRubM2: 15800 },
  { id: "gostinicy", label: "Гостиницы", iconFamily: "other", kitRubM2: 17600 },
  { id: "detskie_sadiki", label: "Детские садики", iconFamily: "other", kitRubM2: 18200 },
  { id: "kazino", label: "Казино", iconFamily: "other", kitRubM2: 20500 },
  { id: "kafe", label: "Кафе", iconFamily: "other", kitRubM2: 17200 },
  { id: "kliniki", label: "Клиники", iconFamily: "other", kitRubM2: 18800 },
  { id: "kotelnaya", label: "Котельная", iconFamily: "karkas", kitRubM2: 14200 },
  { id: "light_industrial", label: "Лайт индастриал (light industrial)", iconFamily: "karkas", kitRubM2: 15100 },
  { id: "minikhranilishcha", label: "Минихранилища", iconFamily: "sklad", kitRubM2: 13200 },
  { id: "obshejitiya", label: "Общежитие", iconFamily: "other", kitRubM2: 16900 },
  { id: "oteli", label: "Отели", iconFamily: "other", kitRubM2: 17800 },
  { id: "ofisnoe_zdanie", label: "Офисное здание", iconFamily: "other", kitRubM2: 18100 },
  { id: "pekarni", label: "Пекарни", iconFamily: "karkas", kitRubM2: 16600 },
  { id: "rynki", label: "Рынок", iconFamily: "naves", kitRubM2: 12100 },
  { id: "sklady_holodilniki", label: "Склады-холодильники", iconFamily: "sklad", kitRubM2: 18200 },
  { id: "stolovye", label: "Столовые", iconFamily: "other", kitRubM2: 16900 },
  { id: "teplye_sklady", label: "Теплые склады", iconFamily: "sklad", kitRubM2: 16400 },
  { id: "torgovye_zdaniya", label: "Торговые здания, магазины", iconFamily: "other", kitRubM2: 17300 },
  { id: "torgovye_centry", label: "Торговые центры", iconFamily: "other", kitRubM2: 18600 },
  { id: "hostely", label: "Хостелы", iconFamily: "other", kitRubM2: 16500 },
  { id: "shkoly", label: "Школы", iconFamily: "other", kitRubM2: 19100 },
]);

const common = withCategory("common", "Общие здания", [
  { id: "barnhaus", label: "Барнхаус", iconFamily: "other", kitRubM2: 16200 },
  { id: "bytovki", label: "Бытовки", iconFamily: "other", kitRubM2: 13700 },
  { id: "vakhtovye_gorodki", label: "Вахтовые городки", iconFamily: "other", kitRubM2: 15100 },
  { id: "garazhi", label: "Гаражи", iconFamily: "angar", kitRubM2: 10900 },
  { id: "doma", label: "Дома", iconFamily: "other", kitRubM2: 17200 },
  { id: "doma_glamping", label: "Дома под глэмпинг", iconFamily: "other", kitRubM2: 16800 },
  { id: "mchs_airport", label: "Здание МЧС в аэропорту", iconFamily: "karkas", kitRubM2: 17400 },
  { id: "kottedzhi", label: "Коттеджи", iconFamily: "other", kitRubM2: 17600 },
  { id: "kpp_posty", label: "КПП и посты охраны", iconFamily: "other", kitRubM2: 15200 },
  { id: "mansardnyj_kompleks", label: "Мансардный комплекс", iconFamily: "other", kitRubM2: 18400 },
  { id: "pozharnoe_depo", label: "Пожарное депо", iconFamily: "karkas", kitRubM2: 16700 },
  { id: "taunhausy", label: "Таунхаусы", iconFamily: "other", kitRubM2: 17900 },
  { id: "cerkvi", label: "Церкви", iconFamily: "other", kitRubM2: 19500 },
  { id: "chasovni", label: "Часовни", iconFamily: "other", kitRubM2: 17100 },
  { id: "angary_flat_roof", label: "Ангары с плоской крышей", iconFamily: "angar", kitRubM2: 11100 },
  { id: "angary_gable", label: "Двухскатные ангары", iconFamily: "angar", kitRubM2: 10500 },
  { id: "angary_single_slope", label: "Односкатные ангары", iconFamily: "angar", kitRubM2: 10800 },
]);

const tech = withCategory("tech", "Техника", [
  { id: "avia_angary", label: "Авиа ангары", iconFamily: "angar", kitRubM2: 12600 },
  { id: "avtomojka", label: "Автомойка", iconFamily: "karkas", kitRubM2: 14700 },
  { id: "avtomojka_gruz", label: "Автомойка для грузовых машин", iconFamily: "karkas", kitRubM2: 15400 },
  { id: "avtonavesy", label: "Автонавесы", iconFamily: "naves", kitRubM2: 8900 },
  { id: "avtosalon", label: "Автосалон", iconFamily: "other", kitRubM2: 17400 },
  { id: "avtoservis", label: "Автосервис", iconFamily: "karkas", kitRubM2: 16300 },
  { id: "angar_autodrom", label: "Ангар для автодрома", iconFamily: "angar", kitRubM2: 11800 },
  { id: "angar_machines", label: "Ангар для машин", iconFamily: "angar", kitRubM2: 11200 },
  { id: "garazh_gruz", label: "Гараж для грузовых машин", iconFamily: "angar", kitRubM2: 11400 },
  { id: "garazh_three", label: "Гараж для трех машин", iconFamily: "angar", kitRubM2: 11600 },
  { id: "mini_parking", label: "Мини паркинг", iconFamily: "naves", kitRubM2: 9400 },
  { id: "navesy_tech", label: "Навесы", iconFamily: "naves", kitRubM2: 8600 },
]);

const sport = withCategory("sport", "Спортивные здания", [
  { id: "bassejn", label: "Бассейн", iconFamily: "other", kitRubM2: 18900 },
  { id: "legkoatlet_manezh", label: "Легкоатлетический манеж", iconFamily: "angar", kitRubM2: 14100 },
  { id: "ice_arena", label: "Ледовая арена/Каток", iconFamily: "angar", kitRubM2: 19600 },
  { id: "ozdorov_kompleks", label: "Оздоровительный комплекс", iconFamily: "other", kitRubM2: 18300 },
  { id: "sport_zal", label: "Спортивный зал", iconFamily: "angar", kitRubM2: 15700 },
  { id: "sport_kompleks", label: "Спортивный комплекс", iconFamily: "other", kitRubM2: 17800 },
  { id: "tennis_kort", label: "Теннисный корт", iconFamily: "angar", kitRubM2: 13800 },
  { id: "fitness_club", label: "Фитнес центр- клуб", iconFamily: "other", kitRubM2: 17100 },
  { id: "fok", label: "ФОК", iconFamily: "other", kitRubM2: 17400 },
  { id: "football_manezh", label: "Футбольный манеж", iconFamily: "angar", kitRubM2: 14600 },
]);

const industry = withCategory("industry", "Промышленность", [
  { id: "industry_angary", label: "Ангары", iconFamily: "angar", kitRubM2: 11100 },
  { id: "administrativnye", label: "Административные", iconFamily: "other", kitRubM2: 17300 },
  { id: "azs", label: "АЗС", iconFamily: "karkas", kitRubM2: 16500 },
  { id: "bumazhnaya_fabrika", label: "Бумажная фабрика", iconFamily: "karkas", kitRubM2: 16100 },
  { id: "gazopereabatyv_zavod", label: "Газоперерабатывающий завод", iconFamily: "karkas", kitRubM2: 17600 },
  { id: "gres", label: "ГРЭС", iconFamily: "karkas", kitRubM2: 18200 },
  { id: "zavody", label: "Заводы", iconFamily: "karkas", kitRubM2: 16200 },
  { id: "kirpichnyj_zavod", label: "Кирпичный завод", iconFamily: "karkas", kitRubM2: 15800 },
  { id: "laboratorii", label: "Лаборатории", iconFamily: "other", kitRubM2: 18900 },
  { id: "logistic_kompleksy", label: "Логистические комплексы", iconFamily: "sklad", kitRubM2: 14900 },
  { id: "mashiny_oborudovanie", label: "Машины и оборудование", iconFamily: "karkas", kitRubM2: 15900 },
  { id: "metallurg_zavod", label: "Металлургический завод", iconFamily: "karkas", kitRubM2: 17400 },
  { id: "mineral_products", label: "Минеральные продукты", iconFamily: "karkas", kitRubM2: 15800 },
  { id: "modul_moloch_zavod", label: "Модульный молочный завод", iconFamily: "karkas", kitRubM2: 16600 },
  { id: "musoroszhig", label: "Мусоросжигательный завод", iconFamily: "karkas", kitRubM2: 17200 },
  { id: "neftepererabatyv_zavod", label: "Нефтеперерабатывающий завод", iconFamily: "karkas", kitRubM2: 17800 },
  { id: "obogatitelnaya_fabrika", label: "Обогатительная фабрика", iconFamily: "karkas", kitRubM2: 16800 },
  { id: "obrabotka_drevesiny", label: "Обработка древесины", iconFamily: "karkas", kitRubM2: 15400 },
  { id: "ochistnye_sooruzheniya", label: "Очистные сооружения", iconFamily: "karkas", kitRubM2: 16000 },
  { id: "proizvodstvennoe_zdanie", label: "Производственное здание", iconFamily: "karkas", kitRubM2: 15700 },
  { id: "plastmassa_proizvodstvo", label: "Производство пластмассы", iconFamily: "karkas", kitRubM2: 16600 },
  { id: "transport_sredstva", label: "Транспортные средства", iconFamily: "karkas", kitRubM2: 16200 },
  { id: "fabriki", label: "Фабрики", iconFamily: "karkas", kitRubM2: 16100 },
  { id: "cement_zavod", label: "Цементный завод", iconFamily: "karkas", kitRubM2: 16900 },
  { id: "ceha", label: "Цеха", iconFamily: "karkas", kitRubM2: 15500 },
  { id: "shvejnaya_fabrika", label: "Швейная фабрика", iconFamily: "karkas", kitRubM2: 15600 },
  { id: "electro_oborudovanie", label: "Электрооборудование", iconFamily: "karkas", kitRubM2: 16400 },
  { id: "electrostancii", label: "Электростанции", iconFamily: "karkas", kitRubM2: 17700 },
  { id: "energo_obekty", label: "Энергетические объекты", iconFamily: "karkas", kitRubM2: 17300 },
  { id: "yadernaya_stanciya", label: "Ядерные станции", iconFamily: "karkas", kitRubM2: 19500 },
]);

export const CALCULATOR_BUILDING_TYPES: CalculatorBuildingType[] = [
  ...popular,
  ...selhoz,
  ...commercial,
  ...common,
  ...tech,
  ...sport,
  ...industry,
];

export const VESTA_BUILDINGS_CATALOG_URL = "https://pkvesta.ru/buildings_catalog/";

const byId = new Map(CALCULATOR_BUILDING_TYPES.map(t => [t.id, t]));
export function getBuildingTypeDef(id: string): CalculatorBuildingType | undefined {
  return byId.get(id);
}

export const BUILDING_KIT_BASE_RUB_M2: Record<string, number> = Object.fromEntries(
  CALCULATOR_BUILDING_TYPES.map(t => [t.id, t.kitRubM2]),
);

export const BUILDING_TYPE_CATEGORIES_FOR_UI: { id: string; label: string }[] = [
  { id: "popular", label: "Распространённые типы" },
  { id: "selhoz", label: "Сельское хозяйство" },
  { id: "commercial", label: "Коммерческие здания" },
  { id: "common", label: "Общие здания" },
  { id: "tech", label: "Техника" },
  { id: "sport", label: "Спортивные здания" },
  { id: "industry", label: "Промышленность" },
];

/** Доп. абзац на SEO-странице типа: вариативность по иконке/назначению без ручного словаря на каждый id. */
export function buildingTypeSeoExtraParagraph(t: CalculatorBuildingType): string {
  const { label, categoryLabel } = t;
  switch (t.iconFamily) {
    case "angar":
      return `Для «${label}» типичны большие пролёты и быстрый монтаж каркаса; узлы и профиль подбираем под снеговой район и ветровой район объекта. Раздел каталога: ${categoryLabel}.`;
    case "sklad":
      return `«${label}» чаще всего утепляют сэндвичем и закладывают логистику ворот и доков уже на этапе КМ; согласуем с вашими температурными режимами и нагрузкой на пол. Категория: ${categoryLabel}.`;
    case "naves":
      return `«${label}» — открытые или частично ограждённые решения: быстрее цикл производства и монтажа, ниже металлоёмкость на м²; при необходимости добавляем ограждение по периметру. Раздел: ${categoryLabel}.`;
    case "karkas":
      return `Для «${label}» каркас ЛМК даёт свободу планировки и навесных кранов; ограждающие конструкции и инженерные системы фиксируем в смете отдельными статьями. Категория: ${categoryLabel}.`;
    case "selhoz":
      return `«${label}» в АПК требует учёта вентиляции, полов и узлов крепления оборудования — в КП закладываем типовые решения и доработки под вашу технологию. Раздел: ${categoryLabel}.`;
    case "other":
    default:
      return `По объекту «${label}» уточняем нормативы, пожарные классы и сценарий эксплуатации, чтобы КП совпало с реальным объёмом СМР. Категория каталога: ${categoryLabel}.`;
  }
}

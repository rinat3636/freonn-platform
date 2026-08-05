import {
  MOSCOW_ANGAR_RUB_M2,
  MOSCOW_SKLAD_RUB_M2,
  MOSCOW_TSEKH_RUB_M2,
  moscowAngarPriceForSize,
  moscowSkladPriceForSize,
  moscowTsekhPriceForSize,
} from "@shared/moscowPricing";
import { MOSCOW_COMBO_SIZES, STANDALONE_KIND_SIZES, MO_TIER1_COMBO_SIZES } from "@shared/seoSizes";
import { buildMoTier1ComboSizePages } from "./moTier1ComboSizePages";

export {
  MOSCOW_ANGAR_RUB_M2,
  MOSCOW_SKLAD_RUB_M2,
  MOSCOW_TSEKH_RUB_M2,
  moscowAngarPriceForSize,
  moscowSkladPriceForSize,
  moscowTsekhPriceForSize,
};

export interface SizePage {
  slug: string;
  size: number; // м2
  width: number;
  length: number;
  height: number;
  priceFrom: number;
  priceTo: number;
  title: string;
  metaDescription: string;
  h1: string;
  intro: string;
  specs: { label: string; value: string }[];
  useCases: string[];
  faq: { q: string; a: string }[];
  /** Комбо «размер + geo» (напр. `/angar-1000-m2-moskva`). */
  geoCity?: string;
  /** Slug-key города для MO combo (`podolsk`, `himki`). */
  geoSlugKey?: string;
  /** По умолчанию — ангар; `sklad` / `proizvodstvo` для комбо `/sklad-*`, `/tsekh-*`. */
  buildingKind?: "angar" | "sklad" | "proizvodstvo";
}

export const sizePages: SizePage[] = [
  {
    slug: "/angar-200-m2",
    size: 200,
    width: 10,
    length: 20,
    height: 5,
    priceFrom: 1_200_000,
    priceTo: 1_800_000,
    title: "Ангар 200 м² под ключ — цена от 1 200 000 ₽ | Freonn",
    metaDescription: "Ангар 200 м² под ключ. Цена от 1 200 000 ₽. Монтаж за 15 дней. Размер 10×20 м. Расчёт бесплатно: 8(800)101-2009",
    h1: "Ангар 200 м² под ключ",
    intro: "Ангар площадью 200 м² — оптимальное решение для малого бизнеса, фермерского хозяйства или небольшого производства. Типовой размер 10×20 м, высота 5 м. Монтаж за 15–20 дней.",
    specs: [
      { label: "Площадь", value: "200 м²" },
      { label: "Размер", value: "10 × 20 м" },
      { label: "Высота", value: "5 м" },
      { label: "Цена без утепления", value: "от 1 200 000 ₽" },
      { label: "Цена с утеплением", value: "от 1 600 000 ₽" },
      { label: "Срок монтажа", value: "15–20 дней" },
    ],
    useCases: ["Гараж для техники", "Небольшой склад", "Мастерская", "Фермерский склад", "Автосервис"],
    faq: [
      { q: "Сколько стоит ангар 200 м²?", a: "Цена ангара 200 м² начинается от 1 200 000 ₽ без утепления и от 1 600 000 ₽ с утеплением. Точная стоимость зависит от комплектации, фундамента и региона." },
      { q: "За сколько дней строится ангар 200 м²?", a: "Монтаж ангара 200 м² занимает 15–20 дней. Изготовление металлоконструкций — 10–15 дней." },
      { q: "Нужен ли фундамент для ангара 200 м²?", a: "Для ангара 200 м² достаточно ленточного фундамента или столбчатых опор. Стоимость фундамента — от 150 000 ₽." },
      { q: "Можно ли утеплить ангар 200 м²?", a: "Да, утепляем ангары минватой 100–150 мм или сэндвич-панелями. Утеплённый ангар 200 м² — от 1 600 000 ₽." },
      { q: "Какие документы нужны для строительства ангара 200 м²?", a: "Для ангара до 500 м² на собственном участке разрешение на строительство не требуется. Мы помогаем с оформлением документов." },
    ],
  },
  {
    slug: "/angar-300-m2",
    size: 300,
    width: 15,
    length: 20,
    height: 6,
    priceFrom: 1_700_000,
    priceTo: 2_500_000,
    title: "Ангар 300 м² под ключ — цена от 1 700 000 ₽ | Freonn",
    metaDescription: "Ангар 300 м² под ключ. Цена от 1 700 000 ₽. Размер 15×20 м. Монтаж за 18 дней. 8(800)101-2009",
    h1: "Ангар 300 м² под ключ",
    intro: "Ангар 300 м² — популярный размер для небольшого производства, автосервиса или фермерского склада. Типовой размер 15×20 м, высота 6 м. Монтаж за 18–25 дней.",
    specs: [
      { label: "Площадь", value: "300 м²" },
      { label: "Размер", value: "15 × 20 м" },
      { label: "Высота", value: "6 м" },
      { label: "Цена без утепления", value: "от 1 700 000 ₽" },
      { label: "Цена с утеплением", value: "от 2 300 000 ₽" },
      { label: "Срок монтажа", value: "18–25 дней" },
    ],
    useCases: ["Автосервис", "Небольшое производство", "Склад стройматериалов", "Зернохранилище", "Цех"],
    faq: [
      { q: "Сколько стоит ангар 300 м²?", a: "Цена ангара 300 м² — от 1 700 000 ₽ без утепления, от 2 300 000 ₽ с утеплением. Цена под ключ с фундаментом — от 2 100 000 ₽." },
      { q: "Какой размер у ангара 300 м²?", a: "Стандартный размер 15×20 м или 12×25 м, высота 6 м. Возможны индивидуальные размеры." },
      { q: "За сколько строится ангар 300 м²?", a: "Монтаж занимает 18–25 дней. Полный цикл с фундаментом — 35–45 дней." },
      { q: "Нужно ли разрешение на ангар 300 м²?", a: "Для ангара до 500 м² на собственном участке разрешение не требуется. Мы консультируем по всем юридическим вопросам." },
      { q: "Можно ли сделать ворота в ангаре 300 м²?", a: "Да, устанавливаем распашные, откатные или секционные ворота любых размеров." },
    ],
  },
  {
    slug: "/angar-500-m2",
    size: 500,
    width: 20,
    length: 25,
    height: 7,
    priceFrom: 2_800_000,
    priceTo: 4_200_000,
    title: "Ангар 500 м² под ключ — цена от 2 800 000 ₽ | Freonn",
    metaDescription: "Ангар 500 м² под ключ. Цена от 2 800 000 ₽. Размер 20×25 м. Монтаж за 20 дней. 8(800)101-2009",
    h1: "Ангар 500 м² под ключ",
    intro: "Ангар 500 м² — универсальный размер для среднего производства, склада или сельхозпредприятия. Типовой размер 20×25 м, высота 7 м. Монтаж за 20–30 дней.",
    specs: [
      { label: "Площадь", value: "500 м²" },
      { label: "Размер", value: "20 × 25 м" },
      { label: "Высота", value: "7 м" },
      { label: "Цена без утепления", value: "от 2 800 000 ₽" },
      { label: "Цена с утеплением", value: "от 3 800 000 ₽" },
      { label: "Срок монтажа", value: "20–30 дней" },
    ],
    useCases: ["Производственный цех", "Логистический склад", "Зернохранилище", "Автопарк", "Торговый склад"],
    faq: [
      { q: "Сколько стоит ангар 500 м²?", a: "Цена ангара 500 м² — от 2 800 000 ₽ без утепления, от 3 800 000 ₽ с утеплением. Под ключ с фундаментом — от 3 500 000 ₽." },
      { q: "Какой размер у ангара 500 м²?", a: "Стандартный размер 20×25 м или 25×20 м, высота 7 м. Возможны варианты 15×33 м, 18×28 м." },
      { q: "Нужно ли разрешение на ангар 500 м²?", a: "Для ангара 500 м² на собственном участке разрешение может не требоваться. Уточняйте в местной администрации — мы помогаем с документами." },
      { q: "Можно ли установить кран-балку в ангаре 500 м²?", a: "Да, проектируем ангары с кран-балкой грузоподъёмностью от 1 до 10 тонн." },
      { q: "Какой фундамент нужен для ангара 500 м²?", a: "Для ангара 500 м² рекомендуем ленточный фундамент или монолитную плиту. Стоимость фундамента — от 400 000 ₽." },
    ],
  },
  {
    slug: "/angar-1000-m2",
    size: 1000,
    width: 25,
    length: 40,
    height: 8,
    priceFrom: 5_500_000,
    priceTo: 8_500_000,
    title: "Ангар 1000 м² под ключ — цена от 5 500 000 ₽ | Freonn",
    metaDescription: "Ангар 1000 м² под ключ. Цена от 5 500 000 ₽. Размер 25×40 м. Монтаж за 25 дней. 8(800)101-2009",
    h1: "Ангар 1000 м² под ключ",
    intro: "Ангар 1000 м² — наиболее востребованный размер для производства, логистики и хранения. Типовой размер 25×40 м, высота 8 м. Монтаж за 25–40 дней.",
    specs: [
      { label: "Площадь", value: "1 000 м²" },
      { label: "Размер", value: "25 × 40 м" },
      { label: "Высота", value: "8 м" },
      { label: "Цена без утепления", value: "от 5 500 000 ₽" },
      { label: "Цена с утеплением", value: "от 7 500 000 ₽" },
      { label: "Срок монтажа", value: "25–40 дней" },
    ],
    useCases: ["Производственный цех", "Логистический склад", "Зернохранилище 1000 т", "Торговый центр", "Спортивный зал"],
    faq: [
      { q: "Сколько стоит ангар 1000 м²?", a: "Цена ангара 1000 м² — от 5 500 000 ₽ без утепления, от 7 500 000 ₽ с утеплением. Под ключ с фундаментом — от 7 000 000 ₽." },
      { q: "Какой размер у ангара 1000 м²?", a: "Популярные размеры: 25×40 м, 20×50 м, 30×33 м. Высота 7–10 м. Проектируем под ваши нужды." },
      { q: "Нужно ли разрешение на строительство ангара 1000 м²?", a: "Да, для ангара 1000 м² требуется разрешение на строительство. Мы помогаем с получением всех разрешений." },
      { q: "Сколько зерна помещается в ангар 1000 м²?", a: "В ангаре 1000 м² с высотой насыпи 3 м помещается около 1500–2000 тонн зерна." },
      { q: "Можно ли поставить кран-балку в ангаре 1000 м²?", a: "Да, устанавливаем кран-балки грузоподъёмностью 1–32 тонны. Проектируем подкрановые пути." },
    ],
  },
  {
    slug: "/angar-1500-m2",
    size: 1500,
    width: 30,
    length: 50,
    height: 9,
    priceFrom: 8_000_000,
    priceTo: 12_500_000,
    title: "Ангар 1500 м² под ключ — цена от 8 000 000 ₽ | Freonn",
    metaDescription: "Ангар 1500 м² под ключ. Цена от 8 000 000 ₽. Размер 30×50 м. Монтаж за 30 дней. 8(800)101-2009",
    h1: "Ангар 1500 м² под ключ",
    intro: "Ангар 1500 м² — крупный объект для промышленного производства или логистического центра. Типовой размер 30×50 м, высота 9 м. Монтаж за 30–45 дней.",
    specs: [
      { label: "Площадь", value: "1 500 м²" },
      { label: "Размер", value: "30 × 50 м" },
      { label: "Высота", value: "9 м" },
      { label: "Цена без утепления", value: "от 8 000 000 ₽" },
      { label: "Цена с утеплением", value: "от 11 000 000 ₽" },
      { label: "Срок монтажа", value: "30–45 дней" },
    ],
    useCases: ["Крупный производственный цех", "Логистический центр", "Зернохранилище 2500 т", "Холодильный склад", "Автодилерский центр"],
    faq: [
      { q: "Сколько стоит ангар 1500 м²?", a: "Цена ангара 1500 м² — от 8 000 000 ₽ без утепления, от 11 000 000 ₽ с утеплением. Под ключ с фундаментом — от 10 000 000 ₽." },
      { q: "Какой размер у ангара 1500 м²?", a: "Популярные размеры: 30×50 м, 25×60 м, 36×42 м. Высота 8–12 м." },
      { q: "Сколько строится ангар 1500 м²?", a: "Монтаж занимает 30–45 дней. Полный цикл с фундаментом и инженерными системами — 60–90 дней." },
      { q: "Нужна ли пожарная сигнализация в ангаре 1500 м²?", a: "Да, для ангаров свыше 1000 м² требуется пожарная сигнализация и автоматическое пожаротушение. Проектируем и монтируем." },
      { q: "Можно ли построить ангар 1500 м² в два этажа?", a: "Да, проектируем двухэтажные здания с антресолями и межэтажными перекрытиями." },
    ],
  },
  {
    slug: "/angar-2000-m2",
    size: 2000,
    width: 40,
    length: 50,
    height: 10,
    priceFrom: 10_500_000,
    priceTo: 16_000_000,
    title: "Ангар 2000 м² под ключ — цена от 10 500 000 ₽ | Freonn",
    metaDescription: "Ангар 2000 м² под ключ. Цена от 10 500 000 ₽. Размер 40×50 м. Монтаж за 35 дней. 8(800)101-2009",
    h1: "Ангар 2000 м² под ключ",
    intro: "Ангар 2000 м² — крупный промышленный объект для производства, логистики или хранения. Типовой размер 40×50 м, высота 10 м. Монтаж за 35–50 дней.",
    specs: [
      { label: "Площадь", value: "2 000 м²" },
      { label: "Размер", value: "40 × 50 м" },
      { label: "Высота", value: "10 м" },
      { label: "Цена без утепления", value: "от 10 500 000 ₽" },
      { label: "Цена с утеплением", value: "от 14 500 000 ₽" },
      { label: "Срок монтажа", value: "35–50 дней" },
    ],
    useCases: ["Крупный склад класса B", "Производственный комплекс", "Зернохранилище 3500 т", "Логистический терминал", "Торговый комплекс"],
    faq: [
      { q: "Сколько стоит ангар 2000 м²?", a: "Цена ангара 2000 м² — от 10 500 000 ₽ без утепления, от 14 500 000 ₽ с утеплением. Под ключ с фундаментом — от 13 000 000 ₽." },
      { q: "Какой размер у ангара 2000 м²?", a: "Популярные размеры: 40×50 м, 50×40 м, 36×56 м. Высота 9–12 м." },
      { q: "Сколько строится ангар 2000 м²?", a: "Монтаж занимает 35–50 дней. Полный цикл — 75–100 дней." },
      { q: "Нужно ли разрешение на ангар 2000 м²?", a: "Да, требуется разрешение на строительство, проектная документация и экспертиза. Мы ведём все согласования." },
      { q: "Какая нагрузка на пол в ангаре 2000 м²?", a: "Стандартная нагрузка на пол — 5 т/м². По запросу проектируем усиленные полы до 20 т/м²." },
    ],
  },
  {
    slug: "/angar-3000-m2",
    size: 3000,
    width: 50,
    length: 60,
    height: 12,
    priceFrom: 15_000_000,
    priceTo: 23_000_000,
    title: "Ангар 3000 м² под ключ — цена от 15 000 000 ₽ | Freonn",
    metaDescription: "Ангар 3000 м² под ключ. Цена от 15 000 000 ₽. Размер 50×60 м. Монтаж за 40 дней. 8(800)101-2009",
    h1: "Ангар 3000 м² под ключ",
    intro: "Ангар 3000 м² — масштабный объект для крупного производства или логистического центра. Типовой размер 50×60 м, высота 12 м. Монтаж за 40–60 дней.",
    specs: [
      { label: "Площадь", value: "3 000 м²" },
      { label: "Размер", value: "50 × 60 м" },
      { label: "Высота", value: "12 м" },
      { label: "Цена без утепления", value: "от 15 000 000 ₽" },
      { label: "Цена с утеплением", value: "от 21 000 000 ₽" },
      { label: "Срок монтажа", value: "40–60 дней" },
    ],
    useCases: ["Склад класса A", "Производственный завод", "Зернохранилище 5000 т", "Логистический комплекс", "Торгово-складской комплекс"],
    faq: [
      { q: "Сколько стоит ангар 3000 м²?", a: "Цена ангара 3000 м² — от 15 000 000 ₽ без утепления, от 21 000 000 ₽ с утеплением. Под ключ с фундаментом — от 19 000 000 ₽." },
      { q: "Какой размер у ангара 3000 м²?", a: "Популярные размеры: 50×60 м, 60×50 м, 40×75 м. Высота 10–15 м." },
      { q: "Сколько строится ангар 3000 м²?", a: "Монтаж занимает 40–60 дней. Полный цикл — 90–120 дней." },
      { q: "Нужна ли экспертиза проекта для ангара 3000 м²?", a: "Да, для объектов свыше 1500 м² требуется государственная или негосударственная экспертиза проекта." },
      { q: "Можно ли построить ангар 3000 м² с офисной частью?", a: "Да, проектируем здания с офисными, административными и бытовыми помещениями." },
    ],
  },
  {
    slug: "/angar-5000-m2",
    size: 5000,
    width: 60,
    length: 84,
    height: 14,
    priceFrom: 24_000_000,
    priceTo: 38_000_000,
    title: "Ангар 5000 м² под ключ — цена от 24 000 000 ₽ | Freonn",
    metaDescription: "Ангар 5000 м² под ключ. Цена от 24 000 000 ₽. Размер 60×84 м. Монтаж за 50 дней. 8(800)101-2009",
    h1: "Ангар 5000 м² под ключ",
    intro: "Ангар 5000 м² — крупный промышленный или логистический комплекс. Типовой размер 60×84 м, высота 14 м. Монтаж за 50–70 дней.",
    specs: [
      { label: "Площадь", value: "5 000 м²" },
      { label: "Размер", value: "60 × 84 м" },
      { label: "Высота", value: "14 м" },
      { label: "Цена без утепления", value: "от 24 000 000 ₽" },
      { label: "Цена с утеплением", value: "от 34 000 000 ₽" },
      { label: "Срок монтажа", value: "50–70 дней" },
    ],
    useCases: ["Склад класса A+", "Крупный производственный завод", "Зернохранилище 8000 т", "Дистрибуционный центр", "Авиационный ангар"],
    faq: [
      { q: "Сколько стоит ангар 5000 м²?", a: "Цена ангара 5000 м² — от 24 000 000 ₽ без утепления, от 34 000 000 ₽ с утеплением. Под ключ с фундаментом — от 30 000 000 ₽." },
      { q: "Какой размер у ангара 5000 м²?", a: "Популярные размеры: 60×84 м, 70×72 м, 50×100 м. Высота 12–18 м." },
      { q: "Сколько строится ангар 5000 м²?", a: "Монтаж занимает 50–70 дней. Полный цикл — 120–150 дней." },
      { q: "Можно ли построить ангар 5000 м² с несколькими пролётами?", a: "Да, проектируем многопролётные здания с промежуточными опорами или без них (пролёт до 60 м)." },
      { q: "Нужна ли пожарная автоматика в ангаре 5000 м²?", a: "Да, для объектов свыше 3500 м² обязательна автоматическая система пожаротушения (спринклерная или дренчерная)." },
    ],
  },
  {
    slug: "/angar-10000-m2",
    size: 10000,
    width: 100,
    length: 100,
    height: 16,
    priceFrom: 46_000_000,
    priceTo: 72_000_000,
    title: "Ангар 10000 м² под ключ — цена от 46 000 000 ₽ | Freonn",
    metaDescription: "Ангар 10000 м² под ключ. Цена от 46 000 000 ₽. Размер 100×100 м. Монтаж за 60 дней. 8(800)101-2009",
    h1: "Ангар 10 000 м² под ключ",
    intro: "Ангар 10 000 м² — масштабный промышленный комплекс для крупного производства или регионального логистического центра. Размер 100×100 м, высота 16 м. Монтаж за 60–90 дней.",
    specs: [
      { label: "Площадь", value: "10 000 м²" },
      { label: "Размер", value: "100 × 100 м" },
      { label: "Высота", value: "16 м" },
      { label: "Цена без утепления", value: "от 46 000 000 ₽" },
      { label: "Цена с утеплением", value: "от 65 000 000 ₽" },
      { label: "Срок монтажа", value: "60–90 дней" },
    ],
    useCases: ["Региональный склад класса A", "Крупный завод", "Зернохранилище 15 000 т", "Логистический хаб", "Торгово-промышленный комплекс"],
    faq: [
      { q: "Сколько стоит ангар 10 000 м²?", a: "Цена ангара 10 000 м² — от 46 000 000 ₽ без утепления, от 65 000 000 ₽ с утеплением. Под ключ с фундаментом — от 58 000 000 ₽." },
      { q: "Какой размер у ангара 10 000 м²?", a: "Популярные размеры: 100×100 м, 80×125 м, 60×167 м. Высота 14–20 м." },
      { q: "Сколько строится ангар 10 000 м²?", a: "Монтаж занимает 60–90 дней. Полный цикл — 150–180 дней." },
      { q: "Нужна ли государственная экспертиза для ангара 10 000 м²?", a: "Да, для объектов свыше 1500 м² обязательна государственная экспертиза проектной документации." },
      { q: "Можно ли построить ангар 10 000 м² без промежуточных колонн?", a: "Да, проектируем здания с пролётом до 60 м без промежуточных опор. Для пролётов 60–100 м используем специальные конструкции." },
    ],
  },
];

const SKLAD_USE_CASES: Record<number, string[]> = {
  500: ["Мини-склад e-commerce", "Склад стройматериалов", "Транзитный склад", "Склад запчастей", "Склад класса C"],
  1000: ["Логистический хаб", "Склад класса B", "Fulfilment", "Транзитный склад", "Производственный склад"],
  1500: ["Распределительный центр", "Склад класса B", "Fulfilment + cross-dock", "Склад маркетплейса", "Логистика e-commerce"],
  2000: ["Региональный РЦ", "Склад класса A/B", "Холодильный склад", "Склад маркетплейса", "Склад с доками"],
  3000: ["Логистический терминал", "Склад класса A", "Холодильный комплекс", "Fulfilment 3PL", "Склад с доками и рампами"],
  5000: ["Региональный РЦ класса A", "Склад маркетплейса", "Холодильный логистический хаб", "Транзитный терминал", "Склад с 6+ доками"],
};

const TSEKH_USE_CASES: Record<number, string[]> = {
  500: ["Металлообработка", "Сборочный цех", "Пищевое производство", "Автосервис и кузовной", "Мастерская"],
  1000: ["Машиностроение", "Приборостроение", "Сборочное производство", "Цех с краном 5 т", "Лёгкая промышленность"],
  1500: ["Машиностроительный цех", "Сборочное производство", "Цех с краном 5–10 т", "Пищевое производство", "Мебельное производство"],
  2000: ["Заводской корпус", "Цех с мостовым краном", "Авиакосмический кластер", "Логистика + производство", "Комплекс с АБК"],
  3000: ["Крупный производственный корпус", "Цех с краном 10 т", "Машиностроение", "Логистика + производство", "Комплекс с АБК"],
  5000: ["Заводской комплекс", "Цех с мостовым краном 10 т", "Тяжёлое машиностроение", "Производство + склад", "Промышленный парк"],
};

function moscowComboSizePage(base: SizePage): SizePage {
  const cold = Math.round(base.size * MOSCOW_ANGAR_RUB_M2);
  const warm = Math.round(cold * 1.35);
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  return {
    ...base,
    slug: `${base.slug}-moskva`,
    geoCity: "Москва",
    priceFrom: cold,
    priceTo: Math.round(cold * 1.2),
    title: `Ангар ${base.size} м² в Москве под ключ — от ${fmt(cold)} ₽ | Freonn`,
    metaDescription: `Ангар ${base.size} м² в Москве и МО под ключ от ${fmt(cold)} ₽. Размер ${base.width}×${base.length} м, монтаж от 20 дней. Офис на Варшавском ш. 8(800)101-2009`,
    h1: `Ангар ${base.size} м² в Москве под ключ`,
    intro: `Ангар ${base.size} м² (${base.width}×${base.length} м) для строительства в Москве и Подмосковье: промзоны юга и запада МО, логистика по МКАД и ЦКАД. Freonn — выезд инженера за 24 ч, ${fmt(MOSCOW_ANGAR_RUB_M2)} ₽/m², монтаж от 20 дней. Более 87 объектов в регионе.`,
    specs: base.specs.map((s) => {
      if (s.label === "Цена без утепления") return { ...s, value: `от ${fmt(cold)} ₽` };
      if (s.label === "Цена с утеплением") return { ...s, value: `от ${fmt(warm)} ₽` };
      if (s.label === "Срок монтажа") return { ...s, value: "20–40 дней" };
      return s;
    }),
    faq: [
      {
        q: `Сколько стоит ангар ${base.size} м² в Москве?`,
        a: `Ориентир для холодного ангара ${base.size} м² в Москве — от ${fmt(cold)} ₽ (${fmt(MOSCOW_ANGAR_RUB_M2)} ₽/m²). С утеплением — от ${fmt(warm)} ₽. Точная смета после ТЗ и геологии участка.`,
      },
      {
        q: `За сколько построят ангар ${base.size} м² в Московской области?`,
        a: `Монтаж каркаса — 20–40 дней после фундамента. В Подольске, Химках, Домодедово и других городах МО сроки сопоставимы; доставка МК — 1 день из центрального региона.`,
      },
      {
        q: "Нужно ли разрешение на ангар в Москве?",
        a: `Для некапитальных объектов до 1 500 м² часто достаточно уведомления. Для ${base.size >= 1000 ? "капитальных" : "типовых"} ангаров Freonn сопровождает проект и разрешительную документацию.`,
      },
      {
        q: "Где выгоднее строить — в Москве или в области?",
        a: "У МКАД выше стоимость земли и логистики; в Подольске, Коломне, Серпухове цена за м² ниже на 5–12%. Инженер подберёт оптимальный участок под ваш бюджет.",
      },
      ...base.faq.slice(0, 2),
    ],
  };
}

function moscowComboSkladPage(base: SizePage): SizePage {
  const cold = Math.round(base.size * MOSCOW_SKLAD_RUB_M2);
  const warm = Math.round(cold * 1.35);
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const useCases = SKLAD_USE_CASES[base.size] ?? base.useCases.map((u) => u.replace(/^Ангар|^Производственный цех/, "Склад"));
  return {
    ...base,
    buildingKind: "sklad",
    slug: `/sklad-${base.size}-m2-moskva`,
    geoCity: "Москва",
    priceFrom: cold,
    priceTo: Math.round(cold * 1.25),
    title: `Склад ${base.size} м² в Москве под ключ — от ${fmt(cold)} ₽ | Freonn`,
    metaDescription: `Склад ${base.size} м² в Москве и МО под ключ от ${fmt(cold)} ₽. Размер ${base.width}×${base.length} м, доки, класс B. Офис на Варшавском ш. 8(800)101-2009`,
    h1: `Склад ${base.size} м² в Москве под ключ`,
    intro: `Склад ${base.size} м² (${base.width}×${base.length} м) для логистики в Москве и Подмосковье: промзоны юга и запада МО, доступ к МКАД и ЦКАД. Freonn — выезд инженера за 24 ч, ${fmt(MOSCOW_SKLAD_RUB_M2)} ₽/m² для холодного склада, монтаж от 25 дней. Доки, полы под нагрузку, классы A/B/C.`,
    useCases,
    specs: base.specs.map((s) => {
      if (s.label === "Цена без утепления") return { label: "Холодный склад", value: `от ${fmt(cold)} ₽` };
      if (s.label === "Цена с утеплением") return { label: "Класс B, утепление", value: `от ${fmt(warm)} ₽` };
      if (s.label === "Срок монтажа") return { ...s, value: "25–45 дней" };
      return s;
    }),
    faq: [
      {
        q: `Сколько стоит склад ${base.size} м² в Москве?`,
        a: `Холодный склад ${base.size} м² в Москве — от ${fmt(cold)} ₽ (${fmt(MOSCOW_SKLAD_RUB_M2)} ₽/m²). Класс B с утеплением — от ${fmt(warm)} ₽. Доки и усиленные полы — +15–25%. Точная смета после ТЗ.`,
      },
      {
        q: `За сколько построят склад ${base.size} м² в Московской области?`,
        a: "Проект — 2–4 недели, фундамент — 2–3 недели, монтаж каркаса — 25–45 дней. В Подольске, Химках, Домодедово сроки сопоставимы с Москвой.",
      },
      {
        q: "Нужны ли доки и рампы для склада у МКАД?",
        a: `Для логистики ${base.size >= 1000 ? "от 2–4 доков" : "от 1–2 доков"} — типовое решение. Проектируем рампы, leveler и зоны погрузки под ваш транспорт.`,
      },
      {
        q: "Где выгоднее — Москва или Подмосковье?",
        a: "У МКАД выше стоимость земли; в Подольске, Коломне, Серпухове холодный склад на 5–12% дешевле. Инженер подберёт участок под бюджет и логистику.",
      },
      ...base.faq.slice(0, 1).map((f) => ({
        q: f.q.replace(/ангара?/gi, "склада"),
        a: f.a.replace(/ангара?/gi, "склада"),
      })),
    ],
  };
}

function moscowComboTsekhPage(base: SizePage): SizePage {
  const basePrice = Math.round(base.size * MOSCOW_TSEKH_RUB_M2);
  const withCrane = Math.round(basePrice * 1.18);
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const useCases = TSEKH_USE_CASES[base.size] ?? ["Производство", "Сборка", "Металлообработка"];
  return {
    ...base,
    buildingKind: "proizvodstvo",
    slug: `/tsekh-${base.size}-m2-moskva`,
    geoCity: "Москва",
    priceFrom: basePrice,
    priceTo: Math.round(basePrice * 1.22),
    title: `Производственный цех ${base.size} м² в Москве — от ${fmt(basePrice)} ₽ | Freonn`,
    metaDescription: `Цех ${base.size} m² в Москве и МО под ключ от ${fmt(basePrice)} ₽. Пролёт ${base.width}×${base.length} м, крановые пути. Офис на Варшавском ш. 8(800)101-2009`,
    h1: `Производственный цех ${base.size} m² в Москве под ключ`,
    intro: `Производственное здание ${base.size} m² (${base.width}×${base.length} m) в Москве и Подмосковье: промзоны Подольска, Балашихи, Химок. Freonn — выезд инженера за 24 ч, ${fmt(MOSCOW_TSEKH_RUB_M2)} ₽/m² без крана, монтаж от 30 дней. Крановые пути, усиленные пролёты.`,
    useCases,
    specs: base.specs.map((s) => {
      if (s.label === "Цена без утепления") return { label: "Без крана", value: `от ${fmt(basePrice)} ₽` };
      if (s.label === "Цена с утеплением") return { label: "С краном 5 т", value: `от ${fmt(withCrane)} ₽` };
      if (s.label === "Срок монтажа") return { ...s, value: "30–50 дней" };
      return s;
    }),
    faq: [
      {
        q: `Сколько стоит цех ${base.size} m² в Москве?`,
        a: `Производственное здание ${base.size} m² без крана — от ${fmt(basePrice)} ₽ (${fmt(MOSCOW_TSEKH_RUB_M2)} ₽/m²). С мостовым краном 5 т — от ${fmt(withCrane)} ₽. Точная смета после ТЗ и геологии.`,
      },
      {
        q: `За сколько построят цех ${base.size} m² в Московской области?`,
        a: "Проект и КМД — 3–5 недель, фундамент — 3–4 недели, монтаж каркаса — 30–50 дней. В Подольске, Щёлково, Раменском сроки сопоставимы.",
      },
      {
        q: "Нужен ли мостовой кран в цехе?",
        a: `Для ${base.size >= 1000 ? "пролётов от 18 м" : "компактных цехов"} типовая нагрузка — кран 3–5 т. Проектируем усиленные колонны и крановые балки под вашу технологию.`,
      },
      {
        q: "Где выгоднее строить цех — Москва или МО?",
        a: "В Подольске, Домодедово, Коломне смета на 5–12% ниже, чем у МКАД. Freonn подберёт участок в промзоне с учётом логистики и разрешений.",
      },
    ],
  };
}

const SKLAD_ANGAR_PRICE_RATIO = MOSCOW_SKLAD_RUB_M2 / MOSCOW_ANGAR_RUB_M2;
const TSEKH_ANGAR_PRICE_RATIO = MOSCOW_TSEKH_RUB_M2 / MOSCOW_ANGAR_RUB_M2;

function sizePagesForSizes(sizes: readonly number[]): SizePage[] {
  return sizes
    .map((sq) => sizePages.find((p) => p.size === sq))
    .filter((p): p is SizePage => Boolean(p));
}

function standaloneSkladSizePage(base: SizePage): SizePage {
  const cold = Math.round(base.priceFrom * SKLAD_ANGAR_PRICE_RATIO);
  const warm = Math.round(cold * 1.35);
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const useCases = SKLAD_USE_CASES[base.size] ?? base.useCases;
  return {
    ...base,
    buildingKind: "sklad",
    slug: `/sklad-${base.size}-m2`,
    priceFrom: cold,
    priceTo: Math.round(cold * 1.25),
    title: `Склад ${base.size} m² под ключ — от ${fmt(cold)} ₽ | Freonn`,
    metaDescription: `Склад ${base.size} m² под ключ. Цена от ${fmt(cold)} ₽. Размер ${base.width}×${base.length} m, доки, класс B. Расчёт бесплатно: 8(800)101-2009`,
    h1: `Склад ${base.size} m² под ключ`,
    intro: `Склад ${base.size} m² (${base.width}×${base.length} m) для логистики и хранения: холодный или класс B с утеплением, рампы и доковые ворота. Freonn — проект, металлокаркас и монтаж под ключ по России.`,
    useCases,
    specs: base.specs.map((s) => {
      if (s.label === "Цена без утепления") return { label: "Холодный склад", value: `от ${fmt(cold)} ₽` };
      if (s.label === "Цена с утеплением") return { label: "Класс B, утепление", value: `от ${fmt(warm)} ₽` };
      if (s.label === "Срок монтажа") return { ...s, value: "25–45 дней" };
      return s;
    }),
    faq: [
      {
        q: `Сколько стоит склад ${base.size} m²?`,
        a: `Холодный склад ${base.size} m² — от ${fmt(cold)} ₽. Класс B с утеплением — от ${fmt(warm)} ₽. Доки и усиленные полы — +15–25% к смете.`,
      },
      {
        q: `За сколько построят склад ${base.size} m²?`,
        a: "Проект — 2–4 недели, фундамент — 2–3 недели, монтаж каркаса — 25–45 дней. Срок зависит от региона и комплектации.",
      },
      {
        q: "Какой класс склада выбрать?",
        a: "Холодный (класс C) — для нечувствительных грузов; класс B с утеплением 80–100 mm — для стабильной температуры; класс A — с полной инженерией и температурным контуром.",
      },
      {
        q: "Нужны ли доки для склада?",
        a: `Для ${base.size >= 1000 ? "логистического хаба от 2–4 доков" : "компактного склада от 1–2 доков"} — типовое решение. Проектируем рампы и зоны погрузки под ваш транспорт.`,
      },
    ],
  };
}

function standaloneTsekhSizePage(base: SizePage): SizePage {
  const basePrice = Math.round(base.priceFrom * TSEKH_ANGAR_PRICE_RATIO);
  const withCrane = Math.round(basePrice * 1.18);
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const useCases = TSEKH_USE_CASES[base.size] ?? ["Производство", "Сборка", "Металлообработка"];
  return {
    ...base,
    buildingKind: "proizvodstvo",
    slug: `/tsekh-${base.size}-m2`,
    priceFrom: basePrice,
    priceTo: Math.round(basePrice * 1.22),
    title: `Производственный цех ${base.size} m² под ключ — от ${fmt(basePrice)} ₽ | Freonn`,
    metaDescription: `Цех ${base.size} m² под ключ от ${fmt(basePrice)} ₽. Пролёт ${base.width}×${base.length} m, крановые пути. Freonn — проект и монтаж: 8(800)101-2009`,
    h1: `Производственный цех ${base.size} m² под ключ`,
    intro: `Производственное здание ${base.size} m² (${base.width}×${base.length} m): усиленный каркас, пролёты без колонн или с крановыми путями. Freonn проектирует и монтирует цеха под ключ по России.`,
    useCases,
    specs: base.specs.map((s) => {
      if (s.label === "Цена без утепления") return { label: "Без крана", value: `от ${fmt(basePrice)} ₽` };
      if (s.label === "Цена с утеплением") return { label: "С краном 5 т", value: `от ${fmt(withCrane)} ₽` };
      if (s.label === "Срок монтажа") return { ...s, value: "30–50 дней" };
      return s;
    }),
    faq: [
      {
        q: `Сколько стоит цех ${base.size} m²?`,
        a: `Производственное здание ${base.size} m² без крана — от ${fmt(basePrice)} ₽. С мостовым краном 5 т — от ${fmt(withCrane)} ₽. Точная смета после ТЗ.`,
      },
      {
        q: `За сколько построят цех ${base.size} m²?`,
        a: "Проект и КМД — 3–5 недель, фундамент — 3–4 недели, монтаж каркаса — 30–50 дней.",
      },
      {
        q: "Нужен ли мостовой кран?",
        a: `Для ${base.size >= 1000 ? "пролётов от 18 m" : "компактных цехов"} типовая нагрузка — кран 3–5 т. Проектируем усиленные колонны под крановые балки.`,
      },
      {
        q: "Какие пролёты возможны?",
        a: `Для ${base.size} m² типовой пролёт ${base.width} m без промежуточных колонн. Индивидуальные схемы — по технологии заказчика.`,
      },
    ],
  };
}

/** Standalone size-страницы складов (без привязки к Москве). */
export const skladSizePages: SizePage[] = sizePagesForSizes(STANDALONE_KIND_SIZES).map(standaloneSkladSizePage);

/** Standalone size-страницы цехов. */
export const tsekhSizePages: SizePage[] = sizePagesForSizes(STANDALONE_KIND_SIZES).map(standaloneTsekhSizePage);

/** Комбо-страницы «размер + Москва». */
export const moscowComboSizePages: SizePage[] = sizePagesForSizes(MOSCOW_COMBO_SIZES).map(moscowComboSizePage);

/** Комбо-страницы «склад + размер + Москва». */
export const moscowComboSkladSizePages: SizePage[] = sizePagesForSizes(MOSCOW_COMBO_SIZES).map(moscowComboSkladPage);

/** Комбо-страницы «цех + размер + Москва». */
export const moscowComboTsekhSizePages: SizePage[] = sizePagesForSizes(MOSCOW_COMBO_SIZES).map(moscowComboTsekhPage);

const ANGAR_DIMENSIONS: ReadonlyArray<{ width: number; length: number; height: number }> = [
  { width: 20, length: 40, height: 6 },
  { width: 24, length: 60, height: 7 },
  { width: 30, length: 60, height: 8 },
  { width: 12, length: 24, height: 5 },
  { width: 15, length: 30, height: 6 },
  { width: 18, length: 36, height: 6 },
];

function dimensionAngarSizePage(dim: { width: number; length: number; height: number }): SizePage {
  const size = dim.width * dim.length;
  const dimLabel = `${dim.width}×${dim.length}`;
  const dimSlug = `${dim.width}x${dim.length}`;
  const priceFrom = Math.round(size * 5_600);
  const priceTo = Math.round(size * 8_400);
  const fmt = (n: number) => n.toLocaleString("ru-RU");
  return {
    slug: `/angar-${dimSlug}-m2`,
    size,
    width: dim.width,
    length: dim.length,
    height: dim.height,
    priceFrom,
    priceTo,
    title: `Ангар ${dimLabel} м (${size} м²) под ключ — от ${fmt(priceFrom)} ₽ | Freonn`,
    metaDescription: `Ангар ${dimLabel} м (${size} м²) под ключ от ${fmt(priceFrom)} ₽. Монтаж 20–45 дней. 8(800)101-2009`,
    h1: `Ангар ${dimLabel} м (${size} м²) под ключ`,
    intro: `Ангар габаритом ${dimLabel} м (площадь ${size} м², высота ${dim.height} м) — типовое решение для склада, производства или сельхозобъекта. Freonn проектирует каркас под ваш пролёт, изготавливает МК и монтирует под ключ.`,
    specs: [
      { label: "Площадь", value: `${size} м²` },
      { label: "Размер", value: dimLabel.replace("×", " × ") + " м" },
      { label: "Высота", value: `${dim.height} м` },
      { label: "Цена без утепления", value: `от ${fmt(priceFrom)} ₽` },
      { label: "Цена с утеплением", value: `от ${fmt(Math.round(priceFrom * 1.35))} ₽` },
      { label: "Срок монтажа", value: "20–45 дней" },
    ],
    useCases: ["Логистический склад", "Производственный цех", "Сельхозтехника", "Автопарк", "Зернохранилище"],
    faq: [
      {
        q: `Сколько стоит ангар ${dimLabel} м?`,
        a: `Ангар ${size} м² (${dimLabel} м) — от ${fmt(priceFrom)} ₽ без утепления. Точная смета зависит от региона, фундамента и комплектации.`,
      },
      {
        q: `Какой пролёт у ангара ${dimLabel} м?`,
        a: `Типовой пролёт ${dim.width} м без промежуточных колонн при высоте ${dim.height} м. Индивидуальные схемы — по технологии заказчика.`,
      },
      {
        q: "Нужно ли разрешение на строительство?",
        a: "Для некапитальных ангаров до 1500 м² на собственном участке часто достаточно уведомления. Помогаем с документами.",
      },
    ],
  };
}

/** SEO: страницы по габаритам (20×40, 24×60 и т.д.). */
export const dimensionAngarSizePages: SizePage[] = ANGAR_DIMENSIONS.map(dimensionAngarSizePage);

/** Combo size × Tier 1 MO (`/angar-1000-m2-podolsk`, …). */
const moTier1Bases = sizePagesForSizes(MO_TIER1_COMBO_SIZES);
export const moTier1ComboSizePages: SizePage[] = buildMoTier1ComboSizePages(moTier1Bases);

export const allSizePages: SizePage[] = [
  ...sizePages,
  ...dimensionAngarSizePages,
  ...skladSizePages,
  ...tsekhSizePages,
  ...moscowComboSizePages,
  ...moscowComboSkladSizePages,
  ...moscowComboTsekhSizePages,
  ...moTier1ComboSizePages,
];

export function getSizeBySlug(slug: string): SizePage | undefined {
  return allSizePages.find((s) => s.slug === slug);
}

export const sizeSlugs = allSizePages.map((s) => s.slug);

export type SizeBuildingKind = "angar" | "sklad" | "proizvodstvo";

export interface SizeBuildingMeta {
  kind: SizeBuildingKind;
  landingHref: string;
  landingLabel: string;
  buildingWord: string;
  buildingWordCap: string;
  moscowRubM2: number;
  moGeoHref: string;
  geoPathPrefix: string;
  comboPrefix: "angar" | "sklad" | "tsekh";
}

export function getSizeBuildingMeta(page: SizePage): SizeBuildingMeta {
  const kind = page.buildingKind ?? "angar";
  const moGeoSuffix = page.geoSlugKey ?? "moskva";

  if (kind === "sklad") {
    return {
      kind,
      landingHref: "/sklady",
      landingLabel: "Склады",
      buildingWord: "склад",
      buildingWordCap: "Склад",
      moscowRubM2: MOSCOW_SKLAD_RUB_M2,
      moGeoHref: `/sklady-${moGeoSuffix}`,
      geoPathPrefix: "sklady",
      comboPrefix: "sklad",
    };
  }
  if (kind === "proizvodstvo") {
    return {
      kind,
      landingHref: "/proizvodstvennye-zdaniya",
      landingLabel: "Производственные здания",
      buildingWord: "цех",
      buildingWordCap: "Цех",
      moscowRubM2: MOSCOW_TSEKH_RUB_M2,
      moGeoHref: `/proizvodstvennye-zdaniya-${moGeoSuffix}`,
      geoPathPrefix: "proizvodstvennye-zdaniya",
      comboPrefix: "tsekh",
    };
  }
  return {
    kind: "angar",
    landingHref: "/angary",
    landingLabel: "Ангары",
    buildingWord: "ангар",
    buildingWordCap: "Ангар",
    moscowRubM2: MOSCOW_ANGAR_RUB_M2,
    moGeoHref: `/angary-${moGeoSuffix}`,
    geoPathPrefix: "angary",
    comboPrefix: "angar",
  };
}

export function getMoscowComboPagesForKind(kind: SizeBuildingKind): SizePage[] {
  if (kind === "sklad") return moscowComboSkladSizePages;
  if (kind === "proizvodstvo") return moscowComboTsekhSizePages;
  return moscowComboSizePages;
}

export function getStandaloneSizePagesForKind(kind: SizeBuildingKind): SizePage[] {
  if (kind === "sklad") return skladSizePages;
  if (kind === "proizvodstvo") return tsekhSizePages;
  return sizePages;
}

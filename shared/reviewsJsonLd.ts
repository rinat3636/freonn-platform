/** Данные отзывов для JSON-LD (синхронно с `ReviewsSection.tsx`). */
const SITE = "https://freonn.pro";

export type ReviewSeed = {
  name: string;
  company: string;
  region: string;
  rating: number;
  text: string;
};

export const FREONN_REVIEW_SEEDS: ReviewSeed[] = [
  {
    name: "Алексей Петров",
    company: "АгроХолдинг «Нива»",
    region: "Краснодарский край",
    rating: 5,
    text: "Построили зернохранилище 2400 м² за 45 дней. Сдали точно в срок, качество отличное. Особенно понравилась прозрачность на всех этапах — всегда знали, что происходит на стройке.",
  },
  {
    name: "Дмитрий Соколов",
    company: "ООО «ЛогистикПро»",
    region: "Московская обл.",
    rating: 5,
    text: "Заказывали складской комплекс 8500 м² с АБК. Цена оказалась ниже, чем у конкурентов, при лучшем качестве. Рекомендую всем, кто ищет надёжного подрядчика.",
  },
  {
    name: "Ирина Новикова",
    company: "ИП Новикова",
    region: "Ростовская обл.",
    rating: 5,
    text: "Строили ангар для хранения сельхозтехники. Всё сделали под ключ — от проекта до ворот. Очень довольна результатом, уже планируем второй объект.",
  },
  {
    name: "Сергей Иванов",
    company: "ПАО «УралМаш»",
    region: "Свердловская обл.",
    rating: 5,
    text: "Производственный цех 3200 м² с мостовым краном. Сложный объект, но команда справилась на отлично. Сроки соблюдены, качество сварных швов проверяли — всё в норме.",
  },
  {
    name: "Наталья Козлова",
    company: "ТЦ «Меркурий»",
    region: "Новосибирск",
    rating: 5,
    text: "Торговый центр 5600 м². Работали быстро, не мешали торговле на соседнем объекте. Фасад получился красивый, покупатели хвалят.",
  },
  {
    name: "Елена Морозова",
    company: "ООО «ТехноСклад»",
    region: "Москва",
    rating: 5,
    text: "Строили склад 3 200 м² в Химках. Смета не изменилась после подписания договора, монтаж шёл по графику. Удобно, что офис и инженеры — в Москве, а бригада была на площадке через два дня.",
  },
  {
    name: "Михаил Фёдоров",
    company: "КФХ «Фёдоров»",
    region: "Татарстан",
    rating: 5,
    text: "Небольшой ангар 600 м² для фермерского хозяйства. Думал, что маленький заказ не возьмут — взяли и сделали отлично. Цена честная, никаких скрытых доплат.",
  },
  {
    name: "Андрей Волков",
    company: "Машиностроительный холдинг (NDA)",
    region: "Балашиха, МО",
    rating: 5,
    text: "Цех 2 100 m² с мостовым краном 5 т — сроки выдержали, смета зафиксирована в договоре. Freonn координировал КМД с нашими технологами на площадке в Балашихе.",
  },
  {
    name: "Олег Зайцев",
    company: "Производственная компания (NDA)",
    region: "Подольск, МО",
    rating: 5,
    text: "Ангар 1 800 m² в Подольске смонтировали за 38 дней. Пролёт 24 m без колонн — как в проекте. Доставка металлоконструкций заняла один день.",
  },
];

/** AggregateRating для LocalBusiness / Organization. */
export function buildFreonnAggregateRating(): Record<string, unknown> {
  return {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: String(FREONN_REVIEW_SEEDS.length),
    bestRating: "5",
    worstRating: "1",
  };
}

const orgItemReviewed = { "@type": "Organization" as const, name: "Freonn", url: SITE };

/** Узлы для добавления в `@graph` главной и коммерческих страниц. */
export function buildFreonnReviewsGraphNodes(): Record<string, unknown>[] {
  const n = FREONN_REVIEW_SEEDS.length;
  const reviews = FREONN_REVIEW_SEEDS.map((r, i) => ({
    "@type": "Review",
    "@id": `${SITE}/#review-${i + 1}`,
    author: { "@type": "Person", name: r.name },
    reviewBody: r.text,
    reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
    itemReviewed: orgItemReviewed,
    publisher: { "@type": "Organization", name: r.company },
  }));
  const aggregateRating = buildFreonnAggregateRating();
  aggregateRating.itemReviewed = orgItemReviewed;
  return [aggregateRating, ...reviews];
}

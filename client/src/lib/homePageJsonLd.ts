/**
 * JSON-LD для главной: WebSite, VideoObject, FAQ, ItemList, HowTo.
 * Карточка Organization / LocalBusiness подставляется на сервере (`injectSsrJsonLd`) для всех индексируемых URL.
 */
import { HOME_FAQ_ITEMS } from "@shared/homeFaq";

export const HOME_PAGE_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Freonn",
      url: "https://freonn.pro",
      description:
        "Строительство ангаров, складов и производственных зданий в Москве, Московской области и по России",
      inLanguage: "ru-RU",
      publisher: {
        "@type": "Organization",
        name: "Freonn",
        url: "https://freonn.pro",
        logo: {
          "@type": "ImageObject",
          url: "https://freonn.pro/apple-touch-icon.png",
        },
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://freonn.pro/blog?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "VideoObject",
      inLanguage: "ru-RU",
      name: "Строительство промышленных зданий под ключ — Freonn",
      description:
        "Freonn — строительство ангаров, складов и производственных зданий в Москве и МО. Более 500 объектов по России с 2011 года.",
      thumbnailUrl: "https://freonn.pro/og-image.jpg",
      uploadDate: "2026-01-01",
      duration: "PT1M",
      publisher: {
        "@type": "Organization",
        name: "Freonn",
        logo: {
          "@type": "ImageObject",
          url: "https://freonn.pro/apple-touch-icon.png",
        },
      },
      contentUrl: "https://freonn.pro/hero-video.mp4",
      embedUrl: "https://freonn.pro/",
      isFamilyFriendly: true,
    },
    {
      "@type": "FAQPage",
      inLanguage: "ru-RU",
      mainEntity: HOME_FAQ_ITEMS.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    },
    {
      "@type": "ItemList",
      inLanguage: "ru-RU",
      name: "Услуги Freonn",
      description: "Строительство промышленных зданий под ключ в Москве и области",
      itemListElement: [
        { "@type": "ListItem", position: 1, url: "https://freonn.pro/angary-moskva", name: "Ангары в Москве" },
        { "@type": "ListItem", position: 2, url: "https://freonn.pro/sklady-moskva", name: "Склады в Москве" },
        { "@type": "ListItem", position: 3, url: "https://freonn.pro/proizvodstvennye-zdaniya-moskva", name: "Производственные здания в Москве" },
        { "@type": "ListItem", position: 4, url: "https://freonn.pro/moskovskaya-oblast", name: "Строительство в Московской области" },
        { "@type": "ListItem", position: 5, url: "https://freonn.pro/angary", name: "Ангары под ключ" },
        { "@type": "ListItem", position: 6, url: "https://freonn.pro/sklady", name: "Строительство складов" },
        {
          "@type": "ListItem",
          position: 7,
          url: "https://freonn.pro/proizvodstvennye-zdaniya",
          name: "Производственные здания",
        },
        {
          "@type": "ListItem",
          position: 8,
          url: "https://freonn.pro/selskokhozyaystvennye-zdaniya",
          name: "Сельскохозяйственные здания",
        },
        { "@type": "ListItem", position: 9, url: "https://freonn.pro/torgovye-zdaniya", name: "Торговые здания" },
        { "@type": "ListItem", position: 10, url: "https://freonn.pro/tseny", name: "Цены и ориентиры по типам зданий" },
        { "@type": "ListItem", position: 11, url: "https://freonn.pro/proektirovanie", name: "Проектирование промышленных зданий" },
        { "@type": "ListItem", position: 12, url: "https://freonn.pro/angar-1000-m2-moskva", name: "Ангар 1000 m² в Москве" },
        { "@type": "ListItem", position: 13, url: "https://freonn.pro/sklad-1000-m2-moskva", name: "Склад 1000 m² в Москве" },
        { "@type": "ListItem", position: 14, url: "https://freonn.pro/tsekh-1000-m2-moskva", name: "Цех 1000 m² в Москве" },
        { "@type": "ListItem", position: 15, url: "https://freonn.pro/blog/stroitelstvo-angarov-moskovskaya-oblast", name: "Блог: ангары в МО" },
      ],
    },
    {
      "@type": "HowTo",
      inLanguage: "ru-RU",
      name: "Как заказать строительство промышленного здания в Freonn",
      description: "Пошаговый процесс заказа и строительства промышленного здания под ключ в Москве и МО",
      totalTime: "P60D",
      estimatedCost: {
        "@type": "MonetaryAmount",
        currency: "RUB",
        value: "от 4650 за м²",
      },
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Оставьте заявку",
          text: "Оставьте заявку на сайте или позвоните по номеру 8-800-101-20-09. Менеджер свяжется с вами в течение 15 минут.",
          url: "https://freonn.pro/#contact",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Расчёт стоимости",
          text: "Наш инженер подготовит коммерческое предложение с указанием цены, сроков и спецификаций в течение 1 рабочего дня.",
          url: "https://freonn.pro/#calculator",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Заключение договора",
          text: "Подписываем договор с фиксацией цены, сроков и гарантий. Работаем по ФЗ-44 и ФЗ-223.",
          url: "https://freonn.pro/#contact",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Проектирование",
          text: "Наши проектировщики разрабатывают рабочую документацию и проект в соответствии с СП, ГОСТ и СНИП.",
          url: "https://freonn.pro/proektirovanie",
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Строительство и сдача",
          text: "Монтаж конструкций собственными бригадами. Сдача объекта с подписанием акта выполненных работ и гарантийными обязательствами.",
          url: "https://freonn.pro/montazh",
        },
      ],
    },
  ],
};

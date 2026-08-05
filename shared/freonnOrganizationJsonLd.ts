/**
 * Единый JSON-LD Organization / LocalBusiness для индексируемых страниц.
 * Инъекция на сервере (`htmlJsonLd.injectSsrJsonLd`); не вшивается в index.html,
 * чтобы на soft-404 не отдавалась «полная карточка компании».
 *
 * Координаты geo согласованы с адресом (Варшавское шоссе, Москва).
 */
export const FREONN_ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Organization", "ConstructionBusiness"],
  "@id": "https://freonn.pro/#organization",
  name: "Freonn",
  legalName: "Общество с ограниченной ответственностью «ЭКС»",
  url: "https://freonn.pro",
  alternateName: ["Фреонн", "Freonn строй", "ООО «ЭКС»"],
  slogan: "Промышленные здания под ключ",
  logo: {
    "@type": "ImageObject",
    url: "https://freonn.pro/apple-touch-icon.png",
    width: 180,
    height: 180,
  },
  image: {
    "@type": "ImageObject",
    url: "https://freonn.pro/og-image.jpg",
    width: 1200,
    height: 630,
  },
  description:
    "Строительство промышленных зданий под ключ: ангары, склады, производственные здания из металлоконструкций. Более 500 объектов с 2011 года.",
  inLanguage: "ru-RU",
  foundingDate: "2011",
  numberOfEmployees: {
    "@type": "QuantitativeValue",
    value: 100,
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+78001012009",
      contactType: "customer service",
      areaServed: "RU",
      availableLanguage: "Russian",
      contactOption: "TollFree",
      hoursAvailable: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    },
    {
      "@type": "ContactPoint",
      email: "freonn@internet.ru",
      contactType: "sales",
      areaServed: "RU",
      availableLanguage: "Russian",
    },
  ],
  telephone: "+78001012009",
  email: "freonn@internet.ru",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Варшавское шоссе, д. 125Ж",
    addressLocality: "Москва",
    addressRegion: "Москва",
    postalCode: "117105",
    addressCountry: "RU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 55.632,
    longitude: 37.62,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  priceRange: "₽₽",
  currenciesAccepted: "RUB",
  paymentAccepted: "Наличные, безналичный расчёт, рассрочка",
  taxID: "3604084591",
  vatID: "3604084591",
  identifier: [
    { "@type": "PropertyValue", name: "ИНН", value: "3604084591" },
    { "@type": "PropertyValue", name: "ОГРН", value: "1243600003569" },
  ],
  hasMap:
    "https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%92%D0%B0%D1%80%D1%88%D0%B0%D0%B2%D1%81%D0%BA%D0%BE%D0%B5%20%D1%88%D0%BE%D1%81%D1%81%D0%B5%2C%20125%D0%96&ll=37.62%2C55.632&z=16",
  sameAs: [
    "https://freonn.ru",
    "https://freonn.pro",
    "https://max.ru/id3604084591_biz",
    "https://2gis.ru/search/Freonn",
    "https://yandex.ru/maps/org/freonn",
  ],
  areaServed: [
    { "@type": "City", name: "Москва" },
    { "@type": "AdministrativeArea", name: "Московская область" },
    { "@type": "Country", name: "Russia" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Промышленные здания",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Строительство ангаров",
          description: "Холодные и тёплые ангары от 4 650 ₽/м²",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Строительство складов",
          description: "Складские комплексы с АБК, рампами, воротами от 8 500 ₽/м²",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Производственные здания",
          description: "Производственные цеха с мостовыми кранами от 12 000 ₽/м²",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Сельскохозяйственные здания",
          description: "Коровники, свинарники, птичники, зернохранилища от 5 500 ₽/м²",
        },
      },
    ],
  },
} as const;

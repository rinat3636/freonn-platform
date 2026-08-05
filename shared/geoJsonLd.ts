import type { GeoPage } from "../client/src/data/geoPages";
import {
  getGeoFaqEntities,
  getGeoHub,
  getGeoKind,
  getGeoLocalBusinessName,
  getGeoSchemaOfferDescription,
} from "../client/src/data/geoPages";
import { geoSlugFromPageSlug, placeJsonLdForGeoSlug } from "./geoPlaceCoords";
import { geoAggregateOfferPrices } from "./moSeo";
import { freonnOrgRef, FREONN_EMAIL, FREONN_PHONE_E164, FREONN_SITE } from "./freonnNap";
import { buildFreonnAggregateRating } from "./reviewsJsonLd";
import { moHubCityGroups, moHubFaqs, moHubPage } from "../client/src/data/moHubPage";

const SITE = FREONN_SITE;

function orgRef() {
  return freonnOrgRef();
}

const GEO_OG_IMAGES = {
  angary: `${SITE}/images/home/angar.webp`,
  sklad: `${SITE}/images/home/sklad.webp`,
  proizvodstvo: `${SITE}/images/home/production.webp`,
} as const;

/** JSON-LD @graph для geo-страниц — единый источник для SSR и клиента. */
export function buildGeoPageJsonLd(page: GeoPage): Record<string, unknown> {
  const hub = getGeoHub(page);
  const url = `${SITE}${page.slug}`;
  const slugKey = geoSlugFromPageSlug(page.slug);
  const place = placeJsonLdForGeoSlug(slugKey, page.city, page.region);
  const kind = getGeoKind(page);
  const buildingKind = kind === "sklad" ? "sklad" : kind === "proizvodstvo" ? "proizvodstvo" : "angar";
  const aggregate = geoAggregateOfferPrices(buildingKind, page.priceCoeff);
  const geoImage = GEO_OG_IMAGES[kind === "angary" ? "angary" : kind];

  const graph: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      name: page.h1,
      description: page.intro,
      url,
    },
    {
      "@type": ["LocalBusiness", "ConstructionBusiness"],
      "@id": `${url}#localbusiness`,
      name: getGeoLocalBusinessName(page),
      description: page.intro,
      url,
      image: geoImage,
      telephone: FREONN_PHONE_E164,
      email: FREONN_EMAIL,
      priceRange: "₽₽",
      currenciesAccepted: "RUB",
      aggregateRating: buildFreonnAggregateRating(),
      areaServed: { "@type": "City", name: page.city },
      address: {
        "@type": "PostalAddress",
        addressLocality: page.city,
        addressRegion: page.region,
        addressCountry: "RU",
      },
      parentOrganization: orgRef(),
    },
    {
      "@type": "Service",
      name: page.h1,
      description: page.intro,
      provider: orgRef(),
      areaServed: { "@type": "City", name: page.city },
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "RUB",
        lowPrice: aggregate.lowPrice,
        highPrice: aggregate.highPrice,
        offerCount: aggregate.offerCount,
        description: getGeoSchemaOfferDescription(page),
      },
    },
    {
      "@type": "Product",
      name: page.h1,
      description: page.intro,
      brand: orgRef(),
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "RUB",
        lowPrice: aggregate.lowPrice,
        highPrice: aggregate.highPrice,
        offerCount: aggregate.offerCount,
        url,
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: getGeoFaqEntities(page).map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: hub.name, item: `${SITE}${hub.href}` },
        { "@type": "ListItem", position: 3, name: page.h1, item: url },
      ],
    },
  ];

  if (place) graph.push(place);
  return { "@context": "https://schema.org", "@graph": graph };
}

export function buildMoHubItemList(): {
  "@type": "ListItem";
  position: number;
  name: string;
  item: string;
}[] {
  return moHubCityGroups.flatMap((g, gi) =>
    g.cities.map((c, ci) => ({
      "@type": "ListItem" as const,
      position: gi * 20 + ci + 1,
      name: `Ангары в ${c.city}`,
      item: `${SITE}${c.angaryHref}`,
    })),
  );
}

/** JSON-LD @graph для хаба `/moskovskaya-oblast`. */
export function buildMoHubJsonLd(description: string): Record<string, unknown> {
  const url = `${SITE}/moskovskaya-oblast`;
  const itemList = buildMoHubItemList();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        name: moHubPage.h1,
        description,
        url,
      },
      {
        "@type": "ItemList",
        "@id": `${url}#itemlist`,
        name: "Города Московской области — Freonn",
        numberOfItems: itemList.length,
        itemListElement: itemList,
      },
      {
        "@type": "FAQPage",
        mainEntity: moHubFaqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Московская область", item: url },
        ],
      },
    ],
  };
}

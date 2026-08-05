import { getBlogArticleAuthor } from "../../client/src/data/blogPosts";
import { placeJsonLdForGeoSlug } from "../../shared/geoPlaceCoords";
import { buildGeoPageJsonLd, buildMoHubJsonLd } from "../../shared/geoJsonLd";
import { HOME_PAGE_JSON_LD } from "../../client/src/lib/homePageJsonLd";
import { FREONN_ORGANIZATION_JSON_LD } from "../../shared/freonnOrganizationJsonLd";
import { polishMetaDescription } from "../../shared/seoTitleFormat";
import {
  DEFAULT_OG_IMAGE_URL,
  presentationBuildingType,
  presentationBuildingTypesIndex,
  presentationMoHub,
} from "../../shared/seoPagePresentation";
import { buildFreonnReviewsGraphNodes } from "../../shared/reviewsJsonLd";
import { matchSeoRoute } from "./seoRouteMatch";
import { getSizeBuildingMeta } from "../../client/src/data/sizePages";

const SITE = "https://freonn.pro";

function scriptJson(data: unknown, id: string): string {
  return `<script id="${id}" type="application/ld+json">\n${JSON.stringify(data)}\n</script>`;
}

function orgRef() {
  return { "@type": "Organization" as const, name: "Freonn", url: SITE };
}

export function buildRouteJsonLd(pathname: string): unknown | null {
  const m = matchSeoRoute(pathname);
  if (!m || m.kind === "explicit_404") return null;

  if (m.kind === "home") {
    return HOME_PAGE_JSON_LD;
  }

  if (m.kind === "blog_index") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Blog",
          name: "Блог Freonn",
          url: `${SITE}/blog`,
          description: "Экспертные статьи о строительстве промышленных зданий",
          publisher: orgRef(),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Блог", item: `${SITE}/blog` },
          ],
        },
      ],
    };
  }

  if (m.kind === "rekvizity") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Реквизиты", item: `${SITE}/rekvizity` },
          ],
        },
      ],
    };
  }

  if (m.kind === "info") {
    const infoPage = m.page;
    const url = `${SITE}${infoPage.slug}`;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: infoPage.h1,
          description: polishMetaDescription(infoPage.metaDescription),
          url,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: infoPage.h1, item: url },
          ],
        },
      ],
    };
  }

  if (m.kind === "portfolio_index") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          name: "Портфолио Freonn",
          url: `${SITE}/portfolio`,
          description: "Реализованные промышленные здания под ключ",
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Портфолио", item: `${SITE}/portfolio` },
          ],
        },
      ],
    };
  }

  if (m.kind === "portfolio_case") {
    const portfolioCase = m.item;
    const url = `${SITE}${portfolioCase.slug}`;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CreativeWork",
          "@id": url,
          name: portfolioCase.h1,
          description: portfolioCase.intro,
          dateCreated: String(portfolioCase.year),
          spatialCoverage: { "@type": "Place", name: portfolioCase.region },
          about: { "@type": "Thing", name: portfolioCase.buildingType },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Портфолио", item: `${SITE}/portfolio` },
            { "@type": "ListItem", position: 3, name: portfolioCase.h1, item: url },
          ],
        },
      ],
    };
  }

  if (m.kind === "landing") {
    const landing = m.page;
    const url = `${SITE}${landing.slug}`;
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Service",
          "@id": `${url}#service`,
          name: landing.h1,
          description: landing.description,
          serviceType: landing.breadcrumb,
          provider: orgRef(),
          areaServed: { "@type": "Country", name: "Russia" },
          offers: {
            "@type": "Offer",
            priceCurrency: "RUB",
            description: landing.price,
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: landing.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: landing.parentSlug && landing.parentBreadcrumb
            ? [
                { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
                { "@type": "ListItem", position: 2, name: landing.parentBreadcrumb, item: `${SITE}${landing.parentSlug}` },
                { "@type": "ListItem", position: 3, name: landing.breadcrumb, item: url },
              ]
            : [
                { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
                { "@type": "ListItem", position: 2, name: landing.breadcrumb, item: url },
              ],
        },
        ...buildFreonnReviewsGraphNodes(),
      ],
    };
  }

  if (m.kind === "geo") {
    return buildGeoPageJsonLd(m.page);
  }

  if (m.kind === "size") {
    const size = m.page;
    const meta = getSizeBuildingMeta(size);
    const url = `${SITE}${size.slug}`;
    const graph: Record<string, unknown>[] = [
      {
        "@type": "Product",
        name: size.h1,
        description: size.intro,
        brand: orgRef(),
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "RUB",
          lowPrice: size.priceFrom,
          highPrice: size.priceTo,
          offerCount: 1,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: size.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: meta.landingLabel, item: `${SITE}${meta.landingHref}` },
          { "@type": "ListItem", position: 3, name: size.h1, item: url },
        ],
      },
    ];
    if (size.geoCity === "Москва") {
      const place = placeJsonLdForGeoSlug("moskva", "Москва", "Московская область");
      if (place) graph.push(place);
    }
    return { "@context": "https://schema.org", "@graph": graph };
  }

  if (m.kind === "building_types_index") {
    const url = `${SITE}/zdaniya`;
    const head = presentationBuildingTypesIndex();
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${url}#webpage`,
          name: "Каталог типов зданий",
          description: head.description,
          url,
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Типы зданий", item: url },
          ],
        },
      ],
    };
  }

  if (m.kind === "mo_hub") {
    const head = presentationMoHub();
    return buildMoHubJsonLd(head.description);
  }

  if (m.kind === "building_type") {
    const t = m.type;
    const url = `${SITE}/zdaniya/${t.id}`;
    const head = presentationBuildingType(t);
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          "@id": `${url}#webpage`,
          name: t.label,
          description: head.description,
          url,
        },
        {
          "@type": "Service",
          "@id": `${url}#service`,
          name: `${t.label} — строительство под ключ`,
          description: head.description,
          provider: orgRef(),
          areaServed: { "@type": "Country", name: "Russia" },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Типы зданий", item: `${SITE}/zdaniya` },
            { "@type": "ListItem", position: 3, name: t.label, item: url },
          ],
        },
      ],
    };
  }

  if (m.kind === "blog_post") {
    const post = m.post;
    const url = `${SITE}${post.slug}`;
    const auth = getBlogArticleAuthor(post);
    const graph: Record<string, unknown>[] = [
      {
        "@type": "Article",
        headline: post.h1,
        description: post.metaDescription,
        datePublished: post.publishDate,
        dateModified: post.updateDate || post.publishDate,
        author: {
          "@type": "Person",
          name: auth.name,
          jobTitle: auth.jobTitle,
          worksFor: orgRef(),
        },
        publisher: {
          ...orgRef(),
          logo: { "@type": "ImageObject", url: `${SITE}/apple-touch-icon.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: post.ogImageUrl ?? DEFAULT_OG_IMAGE_URL,
        keywords: post.tags.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Блог", item: `${SITE}/blog` },
          { "@type": "ListItem", position: 3, name: post.h1, item: url },
        ],
      },
    ];
    if (post.faqs.length) {
      graph.push({
        "@type": "FAQPage",
        mainEntity: post.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      });
    }
    return { "@context": "https://schema.org", "@graph": graph };
  }

  if (m.kind === "karta_sajta") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: "Карта сайта",
          url: `${SITE}/karta-sajta`,
          description: "Полная карта сайта Freonn.",
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: `${SITE}/` },
            { "@type": "ListItem", position: 2, name: "Карта сайта", item: `${SITE}/karta-sajta` },
          ],
        },
      ],
    };
  }

  throw new Error(`buildRouteJsonLd: неизвестный kind маршрута`);
}

export function injectSsrJsonLd(html: string, pathname: string): string {
  const m = matchSeoRoute(pathname);
  let block = "";

  if (!m || m.kind === "explicit_404") {
    block = "";
  } else {
    const orgBlock = scriptJson(FREONN_ORGANIZATION_JSON_LD, "ld-ssr-org");
    const routeData = buildRouteJsonLd(pathname);
    block = routeData ? `${orgBlock}\n${scriptJson(routeData, "ld-ssr-page")}` : orgBlock;
  }

  if (html.includes("<!--SSR_JSONLD-->")) {
    return html.replace("<!--SSR_JSONLD-->", block);
  }
  return html.replace("</body>", `${block}\n</body>`);
}

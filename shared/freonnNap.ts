/** Единый NAP (Name/Address/Phone) для schema, футера и SSR. */
export const FREONN_SITE = "https://freonn.pro";

export const FREONN_PHONE_E164 = "+78001012009";
export const FREONN_PHONE_DISPLAY = "8(800)101-2009";
export const FREONN_EMAIL = "freonn@internet.ru";

export const FREONN_POSTAL_ADDRESS = {
  "@type": "PostalAddress" as const,
  streetAddress: "Варшавское шоссе, д. 125Ж",
  addressLocality: "Москва",
  addressRegion: "Москва",
  postalCode: "117105",
  addressCountry: "RU",
};

export const FREONN_GEO = {
  "@type": "GeoCoordinates" as const,
  latitude: 55.632,
  longitude: 37.62,
};

export function freonnOrgRef() {
  return {
    "@type": "Organization" as const,
    "@id": `${FREONN_SITE}/#organization`,
    name: "Freonn",
    url: FREONN_SITE,
    telephone: FREONN_PHONE_E164,
    email: FREONN_EMAIL,
  };
}

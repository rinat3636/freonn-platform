/** Координаты для JSON-LD Place на geo-страницах (Москва и ключевые города МО). */
export const GEO_SLUG_COORDS: Record<string, { lat: number; lng: number }> = {
  moskva: { lat: 55.7558, lng: 37.6173 },
  podolsk: { lat: 55.4311, lng: 37.5467 },
  himki: { lat: 55.897, lng: 37.4298 },
  balashiha: { lat: 55.7963, lng: 37.9382 },
  mytishchi: { lat: 55.9116, lng: 37.7308 },
  lyubertsy: { lat: 55.6765, lng: 37.8939 },
  krasnogorsk: { lat: 55.8317, lng: 37.3294 },
  odintsovo: { lat: 55.678, lng: 37.2637 },
  domodedovo: { lat: 55.4367, lng: 37.7667 },
  schelkovo: { lat: 55.923, lng: 38.018 },
  korolev: { lat: 55.922, lng: 37.854 },
  elektrostal: { lat: 55.784, lng: 38.444 },
  ramenskoye: { lat: 55.567, lng: 38.23 },
  pushkino: { lat: 56.017, lng: 37.867 },
  vidnoye: { lat: 55.551, lng: 37.708 },
  serpukhov: { lat: 54.915, lng: 37.411 },
  kolomna: { lat: 55.079, lng: 38.778 },
  dolgoprudny: { lat: 55.938, lng: 37.52 },
  reutov: { lat: 55.761, lng: 37.857 },
  noginsk: { lat: 55.852, lng: 38.441 },
  dmitrov: { lat: 56.344, lng: 37.52 },
  zhukovsky: { lat: 55.595, lng: 38.12 },
  lytkarino: { lat: 55.586, lng: 37.903 },
  fryazino: { lat: 55.961, lng: 38.045 },
  egorievsk: { lat: 55.383, lng: 39.029 },
  "pavlovsky-posad": { lat: 55.782, lng: 38.651 },
  kashira: { lat: 54.834, lng: 38.151 },
  chekhov: { lat: 55.147, lng: 37.453 },
  "orekhovo-zuevo": { lat: 55.809, lng: 38.978 },
  lobnya: { lat: 56.012, lng: 37.482 },
  istra: { lat: 55.914, lng: 36.859 },
  klin: { lat: 56.333, lng: 36.728 },
  stupino: { lat: 54.886, lng: 38.078 },
  protvino: { lat: 54.868, lng: 37.218 },
  mozhaysk: { lat: 55.508, lng: 36.025 },
  volokolamsk: { lat: 56.039, lng: 35.958 },
};

export function geoSlugFromPageSlug(slug: string): string {
  return slug.replace(/^\/(angary|sklady|proizvodstvennye-zdaniya)-/, "");
}

export function placeJsonLdForGeoSlug(slugKey: string, city: string, region: string) {
  const coords = GEO_SLUG_COORDS[slugKey];
  if (!coords) return null;
  return {
    "@type": "Place" as const,
    name: city,
    address: {
      "@type": "PostalAddress" as const,
      addressLocality: city,
      addressRegion: region,
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates" as const,
      latitude: coords.lat,
      longitude: coords.lng,
    },
  };
}

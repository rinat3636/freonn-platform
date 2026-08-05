/** Префиксы path для root + nested landing (App routes + sitemap). */
export const LANDING_PATH_PREFIXES = [
  "angary",
  "sklady",
  "proizvodstvennye-zdaniya",
  "selskokhozyaystvennye-zdaniya",
  "torgovye-zdaniya",
  "sportivnye-sooruzheniya",
  "bystrovozvodimye-zdaniya",
  "sendvich-paneli",
  "metallokonstruktsii",
  "navesy",
] as const;

export type LandingPathPrefix = (typeof LANDING_PATH_PREFIXES)[number];

/**
 * Единый реестр возможностей MO-городов (sklad / proizvodstvo).
 * Hub, geoPages и landing используют один источник.
 */
export const MO_SKLAD_SLUG_KEYS = new Set([
  "moskva",
  "podolsk",
  "himki",
  "balashiha",
  "mytishchi",
  "lyubertsy",
  "krasnogorsk",
  "odintsovo",
  "domodedovo",
  "korolev",
  "vidnoye",
  "kolomna",
  "noginsk",
  "schelkovo",
  "elektrostal",
  "chekhov",
  "dmitrov",
  "orekhovo-zuevo",
  "reutov",
  "lytkarino",
  "fryazino",
  "egorievsk",
  "pavlovsky-posad",
  "kashira",
  "protvino",
  "mozhaysk",
  "volokolamsk",
  "ramenskoye",
  "pushkino",
  "serpukhov",
  "dolgoprudny",
  "lobnya",
  "istra",
  "klin",
  "zhukovsky",
  "stupino",
]);

export const MO_PROD_SLUG_KEYS = new Set([
  "moskva",
  "podolsk",
  "himki",
  "balashiha",
  "domodedovo",
  "mytishchi",
  "lyubertsy",
  "korolev",
  "odintsovo",
  "krasnogorsk",
  "zhukovsky",
  "schelkovo",
  "elektrostal",
  "ramenskoye",
  "kolomna",
  "noginsk",
  "vidnoye",
  "pushkino",
  "chekhov",
  "dmitrov",
  "orekhovo-zuevo",
  "reutov",
  "stupino",
  "serpukhov",
  "lobnya",
  "dolgoprudny",
  "istra",
  "fryazino",
  "lytkarino",
  "egorievsk",
  "protvino",
  "pavlovsky-posad",
  "kashira",
  "mozhaysk",
  "klin",
  "volokolamsk",
]);

export const FEDERAL_SKLAD_GEO_KEYS = [
  "sankt-peterburg",
  "novosibirsk",
  "ekaterinburg",
  "kazan",
  "nizhny-novgorod",
  "samara",
  "krasnodar",
  "rostov-na-donu",
  "ufa",
] as const;

export const FEDERAL_PROD_GEO_KEYS = [
  "sankt-peterburg",
  "ekaterinburg",
  "chelyabinsk",
  "tula",
] as const;

export function moCityHasSklad(slugKey: string): boolean {
  return MO_SKLAD_SLUG_KEYS.has(slugKey);
}

export function moCityHasProizvodstvo(slugKey: string): boolean {
  return MO_PROD_SLUG_KEYS.has(slugKey);
}

export const SKLAD_GEO_KEYS = [...Array.from(MO_SKLAD_SLUG_KEYS), ...FEDERAL_SKLAD_GEO_KEYS] as const;

export const PROIZVODSTVO_GEO_KEYS = [...Array.from(MO_PROD_SLUG_KEYS), ...FEDERAL_PROD_GEO_KEYS] as const;

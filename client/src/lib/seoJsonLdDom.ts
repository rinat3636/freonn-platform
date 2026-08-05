/** Скрипты маршрутной JSON-LD (серверный `ld-ssr-page` + клиентские id). `ld-ssr-org` не удаляем — общий Organization. */
const ROUTE_JSON_LD_IDS = [
  "ld-ssr",
  "ld-ssr-page",
  "ld-home-graph",
  "ld-landing",
  "ld-post",
  "ld-geo",
  "ld-size",
  "ld-blog",
  "ld-rekvizity",
  "ld-info",
  "ld-portfolio-list",
  "ld-portfolio",
  "ld-reviews",
  "ld-building-types-hub",
  "ld-building-type",
  "ld-mo-hub",
] as const;

export function clearRoutePageJsonLd(): void {
  for (const id of ROUTE_JSON_LD_IDS) {
    document.getElementById(id)?.remove();
  }
  document.querySelector('script[data-type="size-ld"]')?.remove();
  document.querySelector('script[data-type="geo-ld"]')?.remove();
}

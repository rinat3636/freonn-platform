import { onCLS, onINP, onLCP } from "web-vitals";
import type { MetricType } from "web-vitals";
import { gaEvent } from "./ga";
import { ymParams } from "./ym";

let started = false;

function reportMetric(metric: MetricType): void {
  const { name, value, rating, id, navigationType } = metric;
  const valueRounded =
    name === "CLS" ? Math.round(value * 100_000) / 100_000 : Math.round(value);
  const valueForGa = name === "CLS" ? Math.round(value * 1000) : Math.round(value);

  ymParams({
    wv_name: name,
    wv_value: valueRounded,
    wv_rating: rating,
    wv_id: id,
    wv_nav: navigationType,
  });

  gaEvent("web_vitals", {
    metric: name,
    value: valueForGa,
    rating,
  });
}

/** Вызывать только после согласия на аналитику и загрузки счётчиков. */
export function startWebVitalsReporting(): void {
  if (typeof window === "undefined" || started) return;
  started = true;

  onLCP(reportMetric);
  onCLS(reportMetric);
  onINP(reportMetric);
}

/**
 * Согласие на аналитику (152-ФЗ / ePrivacy): запись в localStorage, отложенная загрузка GA + Метрики.
 */
import { GA_MEASUREMENT_ID } from "./ga";
import { COUNTER_ID } from "./ym";

export const ANALYTICS_CONSENT_STORAGE_KEY = "freonn_analytics_consent";

export type AnalyticsConsentValue = "accepted" | "declined";

declare global {
  interface Window {
    __FREONN_ANALYTICS_LOADED__?: boolean;
  }
}

let loadPromise: Promise<void> | null = null;

export function readAnalyticsConsentFromStorage(): AnalyticsConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    if (v === "accepted" || v === "declined") return v;
  } catch {
    /* private mode / disabled storage */
  }
  return null;
}

function injectGtag(): Promise<void> {
  return new Promise((resolve) => {
    const inline = document.createElement("script");
    inline.textContent = [
      "window.dataLayer=window.dataLayer||[];",
      "function gtag(){dataLayer.push(arguments);}",
      "window.gtag=gtag;",
      "gtag('js', new Date());",
    ].join("");
    document.head.appendChild(inline);

    const ext = document.createElement("script");
    ext.async = true;
    ext.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    ext.onload = () => {
      window.gtag?.("config", GA_MEASUREMENT_ID, {
        page_path: window.location.pathname,
        send_page_view: false,
      });
      resolve();
    };
    ext.onerror = () => resolve();
    document.head.appendChild(ext);
  });
}

function injectYm(): Promise<void> {
  const id = COUNTER_ID;
  const src = `https://mc.yandex.ru/metrika/tag.js?id=${id}`;
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.textContent = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script",${JSON.stringify(src)},"ym");ym(${id},"init",{defer:true,webvisor:true,clickmap:true,trackLinks:true,accurateTrackBounce:true,trackHash:true,ecommerce:"dataLayer"});`;
    document.head.appendChild(s);
    resolve();
  });
}

/** Идемпотентно подключает GA4 и Яндекс.Метрику (после согласия пользователя). */
export function loadAnalyticsScripts(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.__FREONN_ANALYTICS_LOADED__) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = Promise.all([injectGtag(), injectYm()])
    .then(() => {
      window.__FREONN_ANALYTICS_LOADED__ = true;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

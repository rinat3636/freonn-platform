/**
 * Яндекс.Метрика — вспомогательные функции для трекинга событий
 * Counter ID: 108575303
 */

declare global {
  interface Window {
    ym?: (
      counterId: number,
      action: string,
      goalOrUrl?: string | Record<string, unknown>,
      params?: Record<string, unknown>
    ) => void;
  }
}

export const COUNTER_ID = 108575303;

/**
 * Отправить цель в Яндекс.Метрику
 * @param goalName — идентификатор цели (например, "form_submit")
 * @param params — дополнительные параметры (необязательно)
 */
export function ymGoal(goalName: string, params?: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.ym === "function") {
    window.ym(COUNTER_ID, "reachGoal", goalName, params);
  }
}

/**
 * Отправить просмотр страницы в Яндекс.Метрику (для SPA)
 * Вызывать при каждой смене маршрута
 * @param url — текущий URL (по умолчанию window.location.href)
 * @param title — заголовок страницы (по умолчанию document.title)
 */
export function ymHit(url?: string, title?: string): void {
  if (typeof window !== "undefined" && typeof window.ym === "function") {
    window.ym(COUNTER_ID, "hit", url ?? window.location.href, {
      title: title ?? document.title,
      referer: document.referrer,
    } as Record<string, unknown>);
  }
}

/**
 * Передать параметры визита в Яндекс.Метрику
 * Используется для сегментации аудитории по произвольным параметрам
 * @param params — объект с параметрами визита
 */
export function ymParams(params: Record<string, unknown>): void {
  if (typeof window !== "undefined" && typeof window.ym === "function") {
    window.ym(COUNTER_ID, "params", params);
  }
}

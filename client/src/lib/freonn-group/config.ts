/** Freonn Group unified API (app + PostgreSQL) */
export function getFreonnApiBaseUrl(): string {
  const url = import.meta.env.VITE_FREONN_API_BASE_URL?.trim();
  if (!url) {
    return "";
  }
  return url.replace(/\/$/, "");
}

export function isFreonnApiConfigured(): boolean {
  return Boolean(getFreonnApiBaseUrl());
}

/** Баннер «единый аккаунт» и Войти/Регистрация в шапке (временно выкл. по умолчанию). */
export function isFreonnAuthNavVisible(): boolean {
  const flag = import.meta.env.VITE_FREONN_AUTH_NAV_VISIBLE;
  if (flag === "true" || flag === "1") {
    return isFreonnApiConfigured();
  }
  return false;
}

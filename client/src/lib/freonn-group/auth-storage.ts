const ACCESS_KEY = "freonn_access_token";
const REFRESH_KEY = "freonn_refresh_token";

let accessTokenMemory: string | null = null;

export function getAccessToken(): string | null {
  if (accessTokenMemory) return accessTokenMemory;
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
}

export function setTokens(accessToken: string, refreshToken: string) {
  accessTokenMemory = accessToken;
  try {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
  } catch {
    /* ignore */
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function clearTokens() {
  accessTokenMemory = null;
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* ignore */
  }
}

export function isLoggedIn(): boolean {
  return Boolean(getAccessToken());
}

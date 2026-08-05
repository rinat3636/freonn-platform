import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth-storage";
import { getFreonnApiBaseUrl, isFreonnApiConfigured } from "./config";

export class FreonnApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const base = getFreonnApiBaseUrl();
  const refreshToken = getRefreshToken();
  if (!base || !refreshToken) return null;
  const res = await fetch(`${base}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = (await res.json()) as { accessToken: string };
  if (data.accessToken) {
    setTokens(data.accessToken, refreshToken);
    return data.accessToken;
  }
  return null;
}

export async function freonnFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  if (!isFreonnApiConfigured()) {
    throw new FreonnApiError(0, "VITE_FREONN_API_BASE_URL не задан");
  }
  const base = getFreonnApiBaseUrl();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (init.auth !== false) {
    let token = getAccessToken();
    if (!token) {
      throw new FreonnApiError(401, "Требуется вход в аккаунт Freonn Group");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(`${base}${path}`, { ...init, headers });

  if (res.status === 401 && init.auth !== false) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      res = await fetch(`${base}${path}`, { ...init, headers });
    }
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const err = (await res.json()) as { error?: string };
      if (err.error) message = err.error;
    } catch {
      /* ignore */
    }
    throw new FreonnApiError(res.status, message);
  }

  return res.json() as Promise<T>;
}

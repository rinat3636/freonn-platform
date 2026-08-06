import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

const TOKEN_KEY = "freonn_platform_token";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  );
  const me = trpc.auth.me.useQuery(undefined, {
    enabled: !!token,
    retry: false,
  });
  const isUnauthorized = me.error?.data?.code === "UNAUTHORIZED";

  useEffect(() => {
    if (me.error?.data?.code === "UNAUTHORIZED") {
      setToken(null);
    }
  }, [me.error]);

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    window.location.href = "/login";
  };

  return {
    token,
    setToken,
    user: me.data ?? null,
    isLoading: !!token && me.isLoading,
    isAuthenticated: !!token && !isUnauthorized && (!!me.data || !!me.error),
    logout,
  };
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

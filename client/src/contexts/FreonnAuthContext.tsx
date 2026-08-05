import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchAccountMe, logoutFreonn, type FreonnUser } from "@/lib/freonn-group/auth";
import { getAccessToken } from "@/lib/freonn-group/auth-storage";
import { isFreonnApiConfigured } from "@/lib/freonn-group/config";

type FreonnAuthState = {
  user: FreonnUser | null;
  cashbackBalance: number;
  loading: boolean;
  configured: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
};

const FreonnAuthContext = createContext<FreonnAuthState | null>(null);

export function FreonnAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FreonnUser | null>(null);
  const [cashbackBalance, setCashbackBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const configured = isFreonnApiConfigured();

  const refresh = useCallback(async () => {
    if (!configured || !getAccessToken()) {
      setUser(null);
      setCashbackBalance(0);
      setLoading(false);
      return;
    }
    try {
      const me = await fetchAccountMe();
      setUser(me.user);
      setCashbackBalance(me.cashback.balance);
    } catch {
      logoutFreonn();
      setUser(null);
      setCashbackBalance(0);
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    logoutFreonn();
    setUser(null);
    setCashbackBalance(0);
  }, []);

  const value = useMemo(
    () => ({
      user,
      cashbackBalance,
      loading,
      configured,
      isAuthenticated: Boolean(user),
      refresh,
      logout,
    }),
    [user, cashbackBalance, loading, configured, refresh, logout],
  );

  return <FreonnAuthContext.Provider value={value}>{children}</FreonnAuthContext.Provider>;
}

export function useFreonnAuth() {
  const ctx = useContext(FreonnAuthContext);
  if (!ctx) throw new Error("useFreonnAuth outside provider");
  return ctx;
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { setUnauthorizedHandler } from "../api/client";
import {
  login as loginRequest,
  type BusinessAccountSummary,
  type LoginResponse,
  type LoginUser,
} from "../api/auth";

const STORAGE_KEY = "goyohaeng_admin_auth";

interface StoredAuth {
  accessToken: string;
  user: LoginUser;
  businessAccount: BusinessAccountSummary;
}

interface AuthContextValue {
  accessToken: string | null;
  user: LoginUser | null;
  businessAccount: BusinessAccountSummary | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<LoginResponse>;
  logout: () => void;
  setBusinessAccount: (account: BusinessAccountSummary) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStorage(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredAuth | null>(() => readStorage());

  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem(STORAGE_KEY);
      setState(null);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    });
  }, []);

  const persist = (next: StoredAuth | null) => {
    if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else localStorage.removeItem(STORAGE_KEY);
    setState(next);
  };

  const login = async (username: string, password: string) => {
    const res = await loginRequest(username, password);
    persist({ accessToken: res.accessToken, user: res.user, businessAccount: res.businessAccount });
    return res;
  };

  const logout = () => persist(null);

  const setBusinessAccount = (account: BusinessAccountSummary) => {
    setState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, businessAccount: account };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: state?.accessToken ?? null,
      user: state?.user ?? null,
      businessAccount: state?.businessAccount ?? null,
      isAuthenticated: !!state?.accessToken,
      login,
      logout,
      setBusinessAccount,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

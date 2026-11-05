"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_BASE, api, type User } from "@/lib/api";

interface LoginResult {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isFarmer: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const persistUser = (nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) localStorage.setItem("pt_user", JSON.stringify(nextUser));
    else localStorage.removeItem("pt_user");
  };

  const refresh = useCallback(async () => {
    const token = localStorage.getItem("pt_token");
    if (!token) {
      persistUser(null);
      return;
    }
    try {
      const response = await api.get<User>("/api/v1/auth/me");
      persistUser(response.data);
    } catch {
      localStorage.removeItem("pt_token");
      persistUser(null);
    }
  }, []);

  useEffect(() => {
    const cached = localStorage.getItem("pt_user");
    if (cached) {
      try {
        setUser(JSON.parse(cached) as User);
      } catch {
        localStorage.removeItem("pt_user");
      }
    }
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<LoginResult>("/api/v1/auth/login", { email, password });
    localStorage.setItem("pt_token", response.data.token);
    persistUser(response.data.user);
    return response.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("pt_token");
    persistUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === "ADMIN",
      isFarmer: user?.role === "FARMER",
      login,
      logout,
      refresh,
    }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export { API_BASE };

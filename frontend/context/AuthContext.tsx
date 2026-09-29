"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMe, User } from "@/lib/api";
import { clearAuth, getStoredToken, getStoredUser, saveAuth } from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
      setToken(storedToken);
    } catch {
      clearAuth();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Restore from localStorage on mount
    const storedToken = getStoredToken();
    const storedUser = getStoredUser<User>();
    if (storedToken && storedUser) {
      setUser(storedUser);
      setToken(storedToken);
      setIsLoading(false);
      // Background refresh to verify token is still valid
      getMe().then(setUser).catch(() => {
        clearAuth();
        setUser(null);
        setToken(null);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    saveAuth(newToken, newUser);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

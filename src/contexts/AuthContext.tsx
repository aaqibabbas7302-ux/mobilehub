"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AdminUser, getAdminSession, setAdminSession, clearAdminSession, validateCredentials } from "@/lib/auth";

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const session = getAdminSession();
    setUser(session);
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    if (validateCredentials(username, password)) {
      setAdminSession(username);
      setUser(getAdminSession());
      return true;
    }
    return false;
  };

  const logout = () => {
    clearAdminSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

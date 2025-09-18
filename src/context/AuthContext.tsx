"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

export type Role = "citizen" | "admin";
export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (params: { email: string; password: string; role: Role }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, { password: string; name: string; role: Role }> = {
  "citizen@demo.dev": { password: "123456", name: "Alex Citizen", role: "citizen" },
  "admin@demo.dev": { password: "admin123", name: "Riley Admin", role: "admin" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login: AuthContextType["login"] = async ({ email, password, role }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const match = DEMO_USERS[email];
    if (match && match.password === password && match.role === role) {
      setUser({ id: "1", name: match.name, email, role });
    } else {
      throw new Error("Invalid credentials");
    }
    setLoading(false);
  };

  const logout = () => setUser(null);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
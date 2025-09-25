"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export type Role = "citizen" | "admin";
export type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (params: { email: string; password: string; role: Role }) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from Supabase session
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const sUser = data.user;
      if (mounted && sUser) {
        const role = (sUser.user_metadata?.role as Role) || "citizen";
        setUser({ id: sUser.id, name: sUser.user_metadata?.name ?? sUser.user_metadata?.full_name ?? null, email: sUser.email ?? null, role });
      }
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const sUser = session?.user;
      if (sUser) {
        const role = (sUser.user_metadata?.role as Role) || "citizen";
        setUser({ id: sUser.id, name: sUser.user_metadata?.name ?? sUser.user_metadata?.full_name ?? null, email: sUser.email ?? null, role });
      } else {
        setUser(null);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login: AuthContextType["login"] = async ({ email, password, role }) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Graceful demo fallback when Supabase isn't configured
      if ((error.message || "").toLowerCase().includes("supabase not configured")) {
        const inferredRole: Role = role || (email?.toLowerCase().includes("admin") ? "admin" : "citizen");
        setUser({ id: "demo-user", name: null, email, role: inferredRole });
        setLoading(false);
        return;
      }
      setLoading(false);
      throw new Error(error.message || "Invalid credentials");
    }
    // user state will be set by onAuthStateChange
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
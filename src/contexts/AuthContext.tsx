import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type UserRole = "admin" | "doctor" | "patient";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role: UserRole; phone: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<AppUser, "name" | "phone">> & { password?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function loadUser(userId: string, email: string): Promise<AppUser | null> {
  const [{ data: profile }, { data: roleRow }] = await Promise.all([
    supabase.from("profiles").select("name, phone").eq("user_id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
  ]);
  return {
    id: userId,
    email,
    name: profile?.name || "",
    phone: profile?.phone || "",
    role: (roleRow?.role as UserRole) || "patient",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        setTimeout(async () => {
          const u = await loadUser(sess.user.id, sess.user.email || "");
          setUser(u);
        }, 0);
      } else {
        setUser(null);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: sess } }) => {
      setSession(sess);
      if (sess?.user) {
        const u = await loadUser(sess.user.id, sess.user.email || "");
        setUser(u);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; role: UserRole; phone: string }) => {
    const role = data.role === "admin" ? "patient" : data.role;
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { name: data.name, phone: data.phone, role },
      },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshUser = useCallback(async () => {
    if (session?.user) {
      const u = await loadUser(session.user.id, session.user.email || "");
      setUser(u);
    }
  }, [session]);

  const updateProfile = useCallback(async (data: Partial<Pick<AppUser, "name" | "phone">> & { password?: string }) => {
    if (!session?.user) throw new Error("Not authenticated");
    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("profiles").update(updates).eq("user_id", session.user.id);
      if (error) throw error;
    }
    if (data.password) {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;
    }
    await refreshUser();
  }, [session, refreshUser]);

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

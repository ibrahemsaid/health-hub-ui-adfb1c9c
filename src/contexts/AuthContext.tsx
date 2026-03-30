import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "admin" | "doctor" | "patient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: Omit<User, "id"> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demo
const MOCK_USERS: (User & { password: string })[] = [
  { id: "1", name: "Dr. Admin", email: "admin@health.com", role: "admin", phone: "+1234567890", password: "admin123" },
  { id: "2", name: "Dr. Sarah Johnson", email: "doctor@health.com", role: "doctor", phone: "+1234567891", password: "doctor123" },
  { id: "3", name: "John Smith", email: "patient@health.com", role: "patient", phone: "+1234567892", password: "patient123" },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("health_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) throw new Error("Invalid credentials");
    const { password: _, ...userData } = found;
    setUser(userData);
    localStorage.setItem("health_user", JSON.stringify(userData));
  }, []);

  const register = useCallback(async (data: Omit<User, "id"> & { password: string }) => {
    const newUser: User = { ...data, id: crypto.randomUUID() };
    setUser(newUser);
    localStorage.setItem("health_user", JSON.stringify(newUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("health_user");
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem("health_user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

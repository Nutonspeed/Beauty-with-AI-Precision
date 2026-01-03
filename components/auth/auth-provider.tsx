"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  clinicId?: string;
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("auth-user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Mock authentication - replace with actual auth
      if (email === "demo@clinic.com" && password === "demo123") {
        const userData: User = {
          id: "demo-user",
          email,
          name: "Demo Clinic",
          role: "clinic_owner",
          phone: "02-XXX-XXXX",
          clinicId: "demo-clinic"
        };
        setUser(userData);
        localStorage.setItem("auth-user", JSON.stringify(userData));
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
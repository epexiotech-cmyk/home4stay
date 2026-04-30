"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, loginType: "customer" | "partner" | "admin") => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Auth Init Error:", error);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();
    return () => { isMounted = false; };
  }, []);

  const login = async (email: string, password: string, loginType: "customer" | "partner" | "admin") => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, loginType }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = typeof data.error === 'object' ? data.error.message : data.error;
      throw new Error(errorMessage || "Login failed");
    }

    await fetchUser();
    
    // Redirect based on role
    const role = data.user.role;
    if (role === "customer") {
      router.push("/");
    } else if (["owner", "manager"].includes(role)) {
      router.push("/partner/dashboard");
    } else if (["admin", "super_admin"].includes(role)) {
      router.push("/admin/dashboard");
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser }}>
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

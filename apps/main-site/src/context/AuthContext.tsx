"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  city?: string;
  image_url?: string;
  created_at?: string;
  kycStatus?: string;
  propertyId?: string;
  onboardingStatus?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
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
        const userData = data.data?.user || data.user || data.data;
        setUser(userData);
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
          const userData = data.data?.user || data.user || data.data;
          setUser(userData);
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

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMessage = typeof data.error === 'object' ? data.error.message : data.error;
      throw new Error(errorMessage || "Login failed");
    }

    await fetchUser();
    
    // Redirect based on role
    const user = data.data?.user || data.user;
    const role = user.role;
    
    if (role === "customer") {
      router.push("/");
    } else if (["owner", "manager", "partner"].includes(role)) {
      const onboardingStatus = user.onboardingStatus;
      let redirectTarget = "";
      
      if (
          onboardingStatus === "COMPLETED" ||
          onboardingStatus === "LIVE"
      ) {
          redirectTarget = "/partner/dashboard";
      } else {
          redirectTarget = "/partner/onboarding";
      }
      
      console.log({
          onboardingStatus,
          redirectTarget
      });
      
      router.push(redirectTarget);
    } else if (["admin", "super_admin"].includes(role)) {
      router.push("/admin/dashboard");
    }
  };

  const logout = async () => {
    try {
      if (user?.propertyId) {
        localStorage.removeItem(`home4stay_onboarding_draft_${user.propertyId}`);
        localStorage.removeItem(`home4stay_onboarding_offline_cache_${user.propertyId}`);
      }
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
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

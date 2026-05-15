"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { propertyThemes } from "@/config/propertyThemes";
import { getSubdomain } from "@/lib/getSubdomain";
import { adjustColor } from "@/lib/colorUtils";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      return (savedTheme === "light" || savedTheme === "dark") ? savedTheme : "system";
    }
    return "system";
  });

  const [mounted, setMounted] = useState(false);

  // Only handle mounting in the effect to satisfy linter and prevent hydration mismatch
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Derive resolvedTheme instead of using state to avoid extra renders
  const getResolvedTheme = useCallback((): "light" | "dark" => {
    if (!mounted || typeof window === "undefined") return "light";
    if (theme !== "system") return theme as "light" | "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, [theme, mounted]);

  const resolvedTheme = getResolvedTheme();

  // Handle DOM synchronization and system listener
  useEffect(() => {
    if (!mounted) return;

    const applyTheme = (resolved: "light" | "dark") => {
      document.documentElement.setAttribute("data-theme", resolved);
      if (resolved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Apply the initial/changed theme
    applyTheme(resolvedTheme);

    // Setup listener for system theme changes
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const newResolved = media.matches ? "dark" : "light";
        applyTheme(newResolved);
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme, mounted, resolvedTheme]);

  // Effect 5: Apply dynamic property branding
  useEffect(() => {
    if (!mounted) return;

    const subdomain = getSubdomain();
    if (subdomain && propertyThemes[subdomain]) {
      const { primary, foreground } = propertyThemes[subdomain];
      const root = document.documentElement;

      // Primary Branding Colors
      root.style.setProperty("--primary", primary);
      root.style.setProperty("--primary-hover", adjustColor(primary, -0.1));
      root.style.setProperty("--primary-light", adjustColor(primary, 0.4));
      root.style.setProperty("--primary-foreground", foreground || "#ffffff");
      
      // Legacy compatibility
      root.style.setProperty("--theme-primary", primary);
    }
  }, [mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { propertyThemes } from "@/config/propertyThemes";
import { getSubdomain } from "@/lib/getSubdomain";
import { adjustColor, hexToRgba } from "@/lib/colorUtils";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Effect 1: Only handle mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect 2: Handle theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setThemeState(savedTheme);
    } else {
      setThemeState("system");
    }
  }, []);

  // Effect 3: Apply theme in separate effect
  useEffect(() => {
    if (!mounted) return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const systemDark = media.matches;

    const resolved =
      theme === "system"
        ? (systemDark ? "dark" : "light")
        : (theme as "light" | "dark");

    setResolvedTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, [theme, mounted]);

  // Effect 4: Keep system listener separate
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      if (theme === "system") {
        const resolved = media.matches ? "dark" : "light";
        setResolvedTheme(resolved);
        document.documentElement.setAttribute("data-theme", resolved);
      }
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

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

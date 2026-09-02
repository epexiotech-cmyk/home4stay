"use client";

import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { PropertyTheme } from "@/properties-data/types";

interface ThemeContextType {
  theme: PropertyTheme | null;
}

const ThemeContext = createContext<ThemeContextType>({ theme: null });

export const useTheme = () => useContext(ThemeContext);

const defaultTheme: PropertyTheme = {
  primary: "#4A69BD", // Default Home4Stay Blue
  secondary: "#6A89CC",
  accent: "#FAD390",
};

interface ThemeProviderProps {
  theme?: PropertyTheme;
  children: ReactNode;
}

export default function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const activeTheme = theme || defaultTheme;

  useEffect(() => {
    // Apply CSS variables to the document root or a specific container
    // Using document.documentElement allows global availability
    const root = document.documentElement;
    
    root.style.setProperty("--primary", activeTheme.primary);
    root.style.setProperty("--secondary", activeTheme.secondary);
    root.style.setProperty("--accent", activeTheme.accent);
    
    if (activeTheme.background) {
      root.style.setProperty("--theme-bg", activeTheme.background);
    } else {
      root.style.setProperty("--theme-bg", "#ffffff");
    }

    // Optional: Add a class for theme-specific targeting
    root.classList.add("property-themed");

    return () => {
      // Optional cleanup if needed when navigating away
      // root.classList.remove("property-themed");
    };
  }, [activeTheme]);

  return (
    <ThemeContext.Provider value={{ theme: activeTheme }}>
      <div className="min-h-screen transition-colors duration-500">
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

"use client";

import React, { memo } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const ThemeSwitcher = memo(() => {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();

  // Loading state placeholder with theme-aware background
  if (!mounted) {
    return (
      <div className="p-2">
        <div className="h-32 w-full animate-pulse bg-[var(--text)] opacity-5 rounded-2xl" />
      </div>
    );
  }

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <div className="p-2 space-y-1">
      {/* Current Mode Display */}
      <div className="px-3 py-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text)] opacity-50 flex items-center justify-between">
          <span>Appearance</span>
          <span className="text-theme-primary bg-theme-primary/10 px-2 py-0.5 rounded-md text-[9px]">
            {resolvedTheme.toUpperCase()} MODE
          </span>
        </p>
      </div>
      
      {/* Options Grid */}
      <div className="grid grid-cols-1 gap-1">
        {options.map((option) => {
          const Icon = option.icon;
          const isActive = theme === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] ${
                isActive 
                  ? "bg-theme-primary/10 text-theme-primary border border-theme-primary/20 shadow-sm shadow-theme-primary/5" 
                  : "text-[var(--text)] hover:bg-[var(--text)]/5"
              }`}
              role="button"
              aria-pressed={isActive}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-theme-primary/10" : "bg-transparent"}`}>
                <Icon size={16} className={isActive ? "text-theme-primary" : "text-[var(--text)] opacity-60"} />
              </div>
              <span>{option.label}</span>
              {isActive && (
                <div className="ml-auto flex items-center">
                   <div className="w-1.5 h-1.5 rounded-full bg-theme-primary shadow-[0_0_10px_rgba(var(--primary),0.8)] animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
});

ThemeSwitcher.displayName = "ThemeSwitcher";
export default ThemeSwitcher;

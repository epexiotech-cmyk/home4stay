"use client";

import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  show?: boolean;
  onToggle?: () => void;
}

export function PasswordInput({ label, error, success, show, onToggle, className = "", ...props }: PasswordInputProps) {
  const [internalShow, setInternalShow] = useState(false);
  
  const isShown = show !== undefined ? show : internalShow;
  const handleToggle = onToggle || (() => setInternalShow(!internalShow));

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          {...props}
          type={isShown ? "text" : "password"}
          className={`w-full h-12 rounded-xl border bg-background pl-4 pr-12 outline-none transition-all duration-300 focus:ring-4 focus:ring-primary/5 ${
            error 
              ? "border-red-300 focus:border-red-500" 
              : success
                ? "border-green-300 focus:border-green-500"
                : "border-border focus:border-primary"
          } ${className}`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {success && (
            <CheckCircle2 size={18} className="text-green-500 animate-in zoom-in duration-300" />
          )}
          <button
            type="button"
            onClick={handleToggle}
            className="p-2 text-gray-400 hover:text-primary transition-colors duration-300 rounded-lg hover:bg-primary/5 active:scale-90"
            tabIndex={-1}
            aria-label={isShown ? "Hide password" : "Show password"}
          >
            {isShown ? (
              <EyeOff size={18} className="animate-in fade-in zoom-in duration-300" />
            ) : (
              <Eye size={18} className="animate-in fade-in zoom-in duration-300" />
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

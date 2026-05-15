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
        <label className="block text-[11px] font-black text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest mb-2 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          {...props}
          type={isShown ? "text" : "password"}
          className={`w-full h-14 rounded-2xl border bg-white/50 dark:bg-white/5 pl-6 pr-12 outline-none transition-all duration-300 focus:ring-4 focus:ring-[#0E5A75]/10 dark:focus:ring-[#0983B0]/10 ${
            error 
              ? "border-[#F24633] focus:border-[#F24633]" 
              : success
                ? "border-[#159665] focus:border-[#159665]"
                : "border-[#0E5A75]/10 dark:border-white/10 focus:border-[#0E5A75] dark:focus:border-[#0983B0]"
          } text-[#0E5A75] dark:text-white font-medium placeholder:text-[#0E5A75]/30 dark:placeholder:text-white/20 ${className}`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {success && (
            <CheckCircle2 size={18} className="text-[#159665] animate-in zoom-in duration-300" />
          )}
          <button
            type="button"
            onClick={handleToggle}
            className="p-2 text-[#29655C] dark:text-[#0983B0] hover:text-[#0E5A75] dark:hover:text-white transition-colors duration-300 rounded-lg hover:bg-[#0E5A75]/5 active:scale-90"
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
        <p className="mt-2 text-[10px] font-black text-[#F24633] uppercase tracking-widest ml-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

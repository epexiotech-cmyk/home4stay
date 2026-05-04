"use client";

import React from "react";
import { validatePassword } from "@/lib/client/password";

interface PasswordStrengthIndicatorProps {
  password: string;
}


const RequirementItem = ({ label }: { label: string }) => (
  <div className="flex items-center space-x-2 text-xs font-bold text-red-500 animate-in fade-in slide-in-from-left-2 duration-300">
    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
    <span className="uppercase tracking-tight">{label}</span>
  </div>
);

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  if (!password) return null;

  const { strength, requirements } = validatePassword(password);

  const getStrengthColor = () => {
    switch (strength) {
      case "weak": return "bg-red-500";
      case "fair": return "bg-yellow-500";
      case "good": return "bg-blue-500";
      case "strong": return "bg-green-500";
      default: return "bg-gray-200";
    }
  };

  const getStrengthWidth = () => {
    switch (strength) {
      case "weak": return "w-1/4";
      case "fair": return "w-2/4";
      case "good": return "w-3/4";
      case "strong": return "w-full";
      default: return "w-0";
    }
  };

  const unmetRequirements = [
    { label: "8+ Characters", met: requirements.length },
    { label: "Uppercase", met: requirements.uppercase },
    { label: "Lowercase", met: requirements.lowercase },
    { label: "Number", met: requirements.number },
    { label: "Special Character", met: requirements.special },
  ].filter(req => !req.met);

  return (
    <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Strength Bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full transition-all duration-500 ease-out ${getStrengthColor()} ${getStrengthWidth()}`} />
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-secondary/40">Strength: {strength.toUpperCase()}</span>
      </div>

      {/* Checklist - Only show unmet */}
      {unmetRequirements.length > 0 && (
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 p-4 rounded-xl bg-red-50/30 border border-red-100/50">
          {unmetRequirements.map((req) => (
            <RequirementItem key={req.label} label={req.label} />
          ))}
        </div>
      )}
    </div>
  );
};

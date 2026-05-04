"use client";

import React from "react";
import BasePhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { CheckCircle2, Phone } from "lucide-react";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

export function PhoneInput({ value, onChange, label, error }: PhoneInputProps) {
  const isValid = value ? isValidPhoneNumber(value) : false;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-black text-secondary uppercase tracking-widest mb-2 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10 pointer-events-none">
          <Phone size={18} />
        </div>
        <BasePhoneInput
          international
          countryCallingCodeEditable={false}
          defaultCountry="IN"
          value={value}
          onChange={(val: string | undefined) => onChange(val || "")}
          className={`custom-phone-input ${
            error 
              ? "border-red-300 ring-red-50" 
              : isValid
                ? "border-green-300 ring-green-50"
                : "border-border focus-within:border-primary focus-within:ring-primary/5"
          }`}
          placeholder="Enter mobile number"
        />
        
        {isValid && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <CheckCircle2 size={18} className="text-green-500 animate-in zoom-in duration-300" />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1 animate-in slide-in-from-top-1">
          {error}
        </p>
      )}
      {!isValid && value && !error && (
        <p className="mt-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-widest ml-1 animate-in fade-in duration-300">
          Invalid phone number format
        </p>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

// 1. TextField component
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, icon, className, required, ...props }, ref) => {
    return (
      <div className={cn("space-y-1.5 w-full", className)}>
        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-1 ml-1 select-none">
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 shrink-0 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-13 px-5 rounded-2xl border bg-surface-alt outline-none font-bold text-sm text-primary transition-all duration-300",
              icon ? "pl-12" : "",
              error
                ? "border-destructive/30 focus:border-destructive ring-4 ring-destructive/5"
                : "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            )}
            {...props}
          />
        </div>
        {error && <ValidationMessage error={error} />}
      </div>
    );
  }
);
TextField.displayName = "TextField";

// 2. TextArea component
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, required, ...props }, ref) => {
    return (
      <div className={cn("space-y-1.5 w-full", className)}>
        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-1 ml-1 select-none">
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
        </label>
        <textarea
          ref={ref}
          className={cn(
            "w-full p-5 rounded-2xl border bg-surface-alt outline-none font-bold text-sm text-primary transition-all duration-300 resize-none min-h-[120px]",
            error
              ? "border-destructive/30 focus:border-destructive ring-4 ring-destructive/5"
              : "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
          )}
          {...props}
        />
        {error && <ValidationMessage error={error} />}
      </div>
    );
  }
);
TextArea.displayName = "TextArea";

// 3. SelectField component
interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, error, className, required, ...props }, ref) => {
    return (
      <div className={cn("space-y-1.5 w-full", className)}>
        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-1 ml-1 select-none">
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
        </label>
        <div className="relative">
          <select
            ref={ref}
            className={cn(
              "w-full h-13 px-5 rounded-2xl border bg-surface-alt outline-none font-bold text-sm text-primary transition-all duration-300 appearance-none cursor-pointer",
              error
                ? "border-destructive/30 focus:border-destructive ring-4 ring-destructive/5"
                : "border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary/60 w-0 h-0" />
        </div>
        {error && <ValidationMessage error={error} />}
      </div>
    );
  }
);
SelectField.displayName = "SelectField";

// 4. MultiSelect components (Checklist Card Picker)
interface MultiSelectProps {
  label: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  options: { value: string; label: string; description?: string }[];
  error?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  selected,
  onChange,
  options,
  error,
}) => {
  const toggleOption = (value: string) => {
    const updated = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(updated);
  };

  return (
    <div className="space-y-2.5 w-full">
      <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 block select-none">
        {label}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.value);
          return (
            <div
              key={opt.value}
              onClick={() => toggleOption(opt.value)}
              className={cn(
                "p-4 border rounded-2xl cursor-pointer hover-lift select-none transition-all duration-300 flex flex-col justify-between min-h-[90px]",
                isSelected
                  ? "bg-primary/[0.02] border-primary ring-2 ring-primary/10"
                  : "bg-white border-border hover:border-primary/20"
              )}
            >
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-black text-primary leading-tight">
                  {opt.label}
                </span>
                <div
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center border transition-all shrink-0",
                    isSelected
                      ? "bg-primary border-primary text-white"
                      : "bg-white border-border"
                  )}
                >
                  {isSelected && <CheckCircle size={10} className="stroke-[3px]" />}
                </div>
              </div>
              {opt.description && (
                <p className="text-[9px] font-medium text-secondary/50 mt-2 leading-relaxed">
                  {opt.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {error && <ValidationMessage error={error} />}
    </div>
  );
};

// 5. ToggleSwitch component
interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  description,
  disabled,
}) => {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        "flex items-center justify-between p-4 border border-border bg-white rounded-2xl cursor-pointer select-none hover-lift transition-all",
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
    >
      <div className="space-y-1">
        <label className="text-[11px] font-black uppercase tracking-wider text-primary select-none cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-[9px] font-medium text-secondary/40">{description}</p>
        )}
      </div>
      
      {/* Switch Body */}
      <div
        className={cn(
          "w-10 h-6 rounded-full p-0.5 transition-colors duration-300 relative shrink-0",
          checked ? "bg-primary" : "bg-border"
        )}
      >
        <div
          className={cn(
            "w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 absolute top-0.5",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </div>
    </div>
  );
};

// 6. StepCard component
interface StepCardProps {
  children: React.ReactNode;
  className?: string;
}

export const StepCard: React.FC<StepCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "card-premium p-8 bg-white border border-border rounded-[28px] space-y-6 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
};

// 7. SectionGroup component
interface SectionGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const SectionGroup: React.FC<SectionGroupProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="space-y-4">
      <div className="border-b border-border pb-2">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          {title}
        </h4>
        {description && (
          <p className="text-[9px] font-medium text-secondary/40 mt-1 uppercase tracking-wider">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-4 pt-1">{children}</div>
    </div>
  );
};

// 8. ValidationMessage component
interface ValidationMessageProps {
  error?: string;
  info?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  error,
  info,
}) => {
  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
        <AlertCircle size={10} className="shrink-0 text-destructive" />
        <span>{error}</span>
      </div>
    );
  }

  if (info) {
    return (
      <div className="flex items-center gap-1.5 text-[9px] font-bold text-secondary/50 uppercase tracking-widest italic animate-in fade-in duration-300">
        <Info size={10} className="shrink-0 text-secondary/40" />
        <span>{info}</span>
      </div>
    );
  }

  return null;
};

// 9. ProgressIndicator component
interface ProgressIndicatorProps {
  percentage: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  percentage,
}) => {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest shrink-0">
        Completions
      </div>
      <div className="h-1.5 w-24 bg-primary/10 rounded-full overflow-hidden shrink-0">
        <div
          className="h-full bg-primary transition-all duration-500 shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-[9px] font-black text-primary tracking-widest shrink-0">
        {percentage}%
      </div>
    </div>
  );
};

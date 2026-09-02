import * as React from "react";
import { cn } from "./utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary: "bg-zinc-900 text-white hover:bg-zinc-800",
      secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "rounded-lg px-6 py-3 font-bold transition-all duration-200 disabled:opacity-50 active:scale-95",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

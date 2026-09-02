import * as React from "react";
import { cn } from "./utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn("rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm", className)}>
      {children}
    </div>
  );
}

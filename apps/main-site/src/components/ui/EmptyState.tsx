import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * Premium Hospitality Empty State Component
 * 
 * Replaces generic software blanks with an intentional, calm, and 
 * emotionally reassuring representation. Configured with:
 * - Ambient background layered lighting to anchor empty visual weight
 * - Calibrated, responsive typography hierarchy
 * - World-class concierge microcopy styling
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "w-full flex flex-col items-center justify-center p-12 md:p-16 text-center relative overflow-hidden rounded-[32px] border border-black/5 dark:border-white/5 bg-white/20 dark:bg-black/10 backdrop-blur-md contain-layout-paint",
      className
    )}>
      {/* Immersive Atmospheric Lighting Backdrop */}
      <div className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-[#0E5A75]/10 to-[#0983B0]/5 dark:from-[#0983B0]/10 dark:to-transparent blur-3xl pointer-events-none -translate-y-4" />

      {/* Floating Premium Icon Anchor */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-[#0E5A75]/5 dark:bg-white/5 scale-150 animate-pulse pointer-events-none" />
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white dark:bg-[#0E5A75]/40 border border-[#0E5A75]/10 dark:border-white/10 flex items-center justify-center text-[#0E5A75] dark:text-[#0983B0] shadow-xl relative z-10">
          <Icon size={32} strokeWidth={1.5} className="md:scale-110 transition-transform duration-500 hover:scale-125" />
        </div>
      </div>

      {/* Narrative Microcopy */}
      <h3 className="text-xl md:text-2xl font-black text-[#053344] dark:text-white tracking-tight leading-tight mb-2 relative z-10 max-w-md">
        {title}
      </h3>
      
      <p className="text-xs md:text-sm font-medium text-[#0E5A75]/70 dark:text-white/60 leading-relaxed max-w-md mx-auto mb-8 relative z-10 italic">
        {description}
      </p>

      {/* Integrated Concierge Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="relative z-10 px-8 py-4 rounded-2xl bg-[#0E5A75] hover:bg-[#0A4459] text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0E5A75]/20 transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

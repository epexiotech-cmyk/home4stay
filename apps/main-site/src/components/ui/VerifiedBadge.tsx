import React from "react";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  status: "verified" | "pending" | "none" | "rejected";
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  status,
  showText = false,
  size = "md",
  className
}) => {
  const config = {
    verified: {
      icon: ShieldCheck,
      color: "text-[#0983B0]",
      bg: "bg-[#0983B0]/10",
      border: "border-[#0983B0]/20",
      text: "Verified Guest",
      glow: "shadow-[0_0_15px_rgba(9,131,176,0.3)]"
    },
    pending: {
      icon: Shield,
      color: "text-[#FCBC43]",
      bg: "bg-[#FCBC43]/10",
      border: "border-[#FCBC43]/20",
      text: "Verification Pending",
      glow: ""
    },
    rejected: {
      icon: ShieldAlert,
      color: "text-[#F24633]",
      bg: "bg-[#F24633]/10",
      border: "border-[#F24633]/20",
      text: "Verification Failed",
      glow: ""
    },
    none: {
      icon: Shield,
      color: "text-[#0E5A75]/40",
      bg: "bg-[#0E5A75]/5",
      border: "border-transparent",
      text: "Not Verified",
      glow: ""
    }
  };

  const { icon: Icon, color, bg, border, text, glow } = config[status] || config.none;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[8px] gap-1",
    md: "px-3 py-1.5 text-[10px] gap-2",
    lg: "px-4 py-2.5 text-xs gap-3"
  };

  const iconSizes = {
    sm: 10,
    md: 14,
    lg: 18
  };

  return (
    <motion.div
      initial={status === "verified" ? { scale: 0.8, opacity: 0 } : false}
      animate={status === "verified" ? { scale: 1, opacity: 1 } : false}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={cn(
        "inline-flex items-center rounded-full font-black uppercase tracking-[0.15em] border transition-all",
        bg,
        color,
        border,
        glow,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={iconSizes[size]} className={cn(status === "verified" && "animate-pulse")} />
      {showText && <span>{text}</span>}
    </motion.div>
  );
};

"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
  link?: boolean;
}

const sizes = {
  sm: { height: 32, width: 128, iconWidth: 32 },
  md: { height: 40, width: 160, iconWidth: 40 },
  lg: { height: 64, width: 256, iconWidth: 64 },
};

export default function Logo({
  variant = "full",
  size = "md",
  className = "",
  link = true,
}: LogoProps) {
  const { height, width, iconWidth } = sizes[size];
  
  const logoPath = variant === "full" 
    ? "/logo/logo-full.png" 
    : "/logo/logo-icon.png";
    
  const logoWidth = variant === "full" ? width : iconWidth;

  const content = (
    <div className={`relative flex items-center ${className}`}>
      <Image
        src={logoPath}
        alt="Home4Stay Logo"
        width={logoWidth}
        height={height}
        className="object-contain hover:opacity-90 transition-opacity duration-300"
        priority
      />
    </div>
  );

  if (link) {
    return (
      <Link href="/" className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}

import React from "react";
import { MapPin } from "lucide-react";

interface HeroSectionViewProps {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  backgroundImage?: string;
  overlayOpacity?: number;
  textAlign?: "left" | "center" | "right";
}

export default function HeroSectionView({
  title = "Alpine Sanctuary",
  subtitle = "Immersive atmosphere curated above cloud horizon pathways.",
  ctaText = "Reserve Stay",
  backgroundImage: bgImg = "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
  overlayOpacity: opacity = 0.4,
  textAlign: align = "left"
}: HeroSectionViewProps) {

  return (
    <div className="relative h-[360px] w-full flex flex-col justify-end p-6 overflow-hidden flex-shrink-0 select-none">
      {/* Background asset mapping */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bgImg} alt="Hero Layout View" className="w-full h-full object-cover" />
      </div>

      {/* Opacity shade mask filter */}
      <div className="absolute inset-0 z-10 bg-black transition-opacity duration-300" style={{ opacity }} />
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full glass-matte border-white/20 text-white backdrop-blur-md flex items-center gap-1">
          <MapPin size={10} className="text-[#0983B0]" /> Registry Block View
        </span>
      </div>

      {/* Copy content block */}
      <div className={`relative z-20 space-y-2 max-w-lg transition-all duration-300 ${
        align === "center" ? "mx-auto text-center" : align === "right" ? "ml-auto text-right" : "text-left"
      }`}>
        <p className="text-[10px] font-black text-[#0983B0] uppercase tracking-[0.3em]">Cinematic Release Module</p>
        <h2 className="text-3xl font-black tracking-tight leading-none text-white drop-shadow-md">
          {title}
        </h2>
        <p className="text-xs text-white/80 line-clamp-2 italic font-medium">
          &ldquo;{subtitle}&rdquo;
        </p>

        {ctaText && (
          <div className="pt-2">
            <span className="inline-block px-5 py-2 rounded-full bg-white text-[#0E5A75] text-[10px] font-black uppercase tracking-widest shadow-xl scale-95 origin-left">
              {ctaText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

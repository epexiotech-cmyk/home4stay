"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Star, Phone, MessageCircle, Sun, Share2, Heart, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_FALLBACK_IMAGE, getValidImageUrl } from "@/lib/utils";

interface BrandedHeroProps {
  name: string;
  image: string;
  location?: string;
  rating?: number;
  tagline?: string;
  phone?: string;
  whatsapp?: string;
}

export default function BrandedHero({
  name,
  image,
  location,
  rating,
  tagline,
  phone,
  whatsapp,
}: BrandedHeroProps) {
  const safeImage = getValidImageUrl(image) || DEFAULT_FALLBACK_IMAGE;

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
      {/* 1. Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={safeImage}
          alt={name || "Property hero"}
          fill
          priority
          className="object-cover scale-105 animate-slow-zoom"
        />
        {/* Layered Atmospheric Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#053344] via-[#053344]/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/20 z-10" />
        <div className="absolute inset-0 backdrop-blur-[2px] opacity-30 z-10" />
      </div>

      {/* 2. Top Navigation Overlay (Minimal) */}
      <div className="absolute top-24 md:top-32 left-0 right-0 z-30 p-8 flex justify-between items-start pointer-events-none pt-4">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="glass-matte px-4 py-2 rounded-full border-white/20 flex items-center gap-2">
            <MapPin size={14} className="text-[#0983B0]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">{location}</span>
          </div>

        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <button className="p-3 rounded-full glass-matte border-white/20 text-white hover:bg-white hover:text-[#0E5A75] transition-all">
            <Share2 size={18} />
          </button>
          <button className="p-3 rounded-full glass-matte border-white/20 text-white hover:bg-white hover:text-[#F24633] transition-all">
            <Heart size={18} />
          </button>
        </div>
      </div>

      {/* 3. Hero Content */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end pb-24 px-8 md:px-20 max-w-[1440px] mx-auto">
        <div className="max-w-4xl space-y-6 animate-in slide-in-from-bottom duration-1000 translate-y-[20px]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-px bg-[#0983B0]" />
            <span className="text-xs font-black text-[#0983B0] uppercase tracking-[0.4em]">Cinematic Hospitality</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
            {name.split(' ').map((word, i) => (
              <span key={i} className={cn(i % 2 !== 0 && "text-[#0983B0]")}>{word} </span>
            ))}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-8 pt-4">
            {rating && (
              <div className="flex items-center gap-4">
                <div className="flex gap-1 text-[#FCBC43]">
                  {[...Array(5)].map((_, i) => <Star key={`hero-star-${i}`} size={20} fill={i < Math.floor(rating) ? "currentColor" : "none"} />)}
                </div>
                <span className="text-xl font-black text-white">{rating} <span className="text-white/40 text-sm font-bold uppercase tracking-widest ml-2">Verified Rating</span></span>
              </div>
            )}
            
            {tagline && (
              <p className="text-lg md:text-xl font-medium text-white/70 max-w-xl leading-relaxed italic">
                "{tagline}"
              </p>
            )}
          </div>

          <div className="flex items-center gap-6 pt-10">
            <button className="px-12 py-5 rounded-full bg-white text-[#0E5A75] text-sm font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all">
              Discover Stays
            </button>
            <div className="flex items-center gap-3">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} className="p-4 rounded-full glass-matte border-white/20 text-[#159665] hover:bg-[#159665] hover:text-white transition-all">
                  <MessageCircle size={24} />
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="p-4 rounded-full glass-matte border-white/20 text-[#0983B0] hover:bg-[#0983B0] hover:text-white transition-all">
                  <Phone size={24} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 animate-bounce opacity-40">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.4em] vertical-text">Scroll Down</span>
        <ChevronDown size={24} className="text-white" />
      </div>
    </section>
  );
}

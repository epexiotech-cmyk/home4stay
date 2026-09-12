"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Star, Phone, MessageCircle, Share2, Heart, ChevronDown } from "lucide-react";
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
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden flex flex-col justify-end">
      {/* 1. Cinematic Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={safeImage}
          alt={name || "Property hero"}
          fill
          priority
          className="object-cover scale-[1.02] transform transition-transform duration-[20s] ease-out hover:scale-105"
        />
        {/* Layered Atmospheric Overlays - Elegantly controlled */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 z-10" />
      </div>

      {/* 2. Top Navigation Actions Overlay */}
      <div className="absolute top-24 md:top-32 left-0 right-0 z-30 px-6 md:px-10 lg:px-20 max-w-[1440px] mx-auto flex justify-between items-start pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          {location && (
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-2">
              <MapPin size={14} className="text-white opacity-80" />
              <span className="text-[11px] font-medium tracking-widest text-white uppercase">{location}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 pointer-events-auto">
          <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300">
            <Share2 size={16} strokeWidth={1.5} />
          </button>
          <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:text-rose-400 transition-all duration-300">
            <Heart size={16} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* 3. Hero Content - Refined Typography */}
      <div className="relative z-20 pb-20 md:pb-28 px-6 md:px-10 lg:px-20 max-w-[1440px] mx-auto w-full">
        <div className="max-w-4xl space-y-6 animate-in slide-in-from-bottom-8 duration-1000 fade-in">
          
          <h1 className="text-5xl md:text-7xl font-serif text-white tracking-tight leading-[1.1] drop-shadow-lg">
            {name}
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 pt-2">
            {rating && (
              <div className="flex items-center gap-3">
                <div className="flex gap-1 text-[#FCBC43]">
                  {[...Array(5)].map((_, i) => <Star key={`hero-star-${i}`} size={16} fill={i < Math.floor(rating) ? "currentColor" : "none"} />)}
                </div>
                <span className="text-lg font-medium text-white">{rating}</span>
              </div>
            )}
            
            {tagline && (
              <p className="text-lg md:text-xl font-light text-white/90 max-w-xl leading-relaxed">
                {tagline}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-8">
            <a href="#rooms" className="px-8 py-4 rounded-sm bg-white text-black text-[13px] font-medium tracking-widest uppercase hover:bg-white/90 transition-all duration-300 shadow-xl">
              Discover Stays
            </a>
            <div className="flex items-center gap-3">
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp}`} className="p-4 rounded-sm bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                  <MessageCircle size={20} strokeWidth={1.5} />
                </a>
              )}
              {phone && (
                <a href={`tel:${phone}`} className="p-4 rounded-sm bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300">
                  <Phone size={20} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-60">
        <span className="text-[10px] font-medium text-white uppercase tracking-[0.3em]">Scroll</span>
        <ChevronDown size={20} strokeWidth={1} className="text-white animate-bounce" />
      </div>
    </section>
  );
}

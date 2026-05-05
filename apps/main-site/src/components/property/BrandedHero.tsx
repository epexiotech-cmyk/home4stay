"use client";

import React from "react";
import OptimizedImage from "@/components/OptimizedImage";
import { ChevronRight, Star, MapPin, Phone, MessageSquare, ShieldCheck, Award } from "lucide-react";

interface BrandedHeroProps {
  name: string;
  image: string;
  location: string;
  rating: number;
  tagline: string;
  phone?: string;
  whatsapp?: string;
}

export default function BrandedHero({ name, image, location, rating, tagline, phone, whatsapp }: BrandedHeroProps) {
  return (
    <section className="relative w-full h-screen min-h-[700px] overflow-hidden flex items-center justify-center">
      {/* Background Image with Parallax-like effect */}
      <div className="absolute inset-0 z-0">
        <OptimizedImage 
          src={image} 
          alt={name} 
          fill 
          className="object-cover scale-105"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-b from-[var(--primary)]/20 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-[var(--primary)]/5 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center text-white flex flex-col items-center">
        {/* Rating & Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 animate-in fade-in zoom-in duration-1000">
           <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/20">
              <div className="flex items-center gap-1">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} size={14} fill={i < Math.floor(rating) ? "white" : "transparent"} className={i < Math.floor(rating) ? "text-white" : "text-white/20"} />
                 ))}
              </div>
              <span className="text-xs font-black tracking-[0.2em] uppercase">{rating} Ultra-Luxury Stay</span>
           </div>
           
           <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-xl px-4 py-2.5 rounded-full border border-emerald-500/30 text-emerald-400">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-black tracking-[0.1em] uppercase">Verified Listing</span>
           </div>

           <div className="inline-flex items-center gap-2 bg-orange-500/20 backdrop-blur-xl px-4 py-2.5 rounded-full border border-orange-500/30 text-orange-400">
              <Award size={16} />
              <span className="text-[10px] font-black tracking-[0.1em] uppercase">Superhost</span>
           </div>
        </div>

        {/* Tagline */}
        <p className="text-theme-primary font-black text-sm md:text-base uppercase tracking-[0.3em] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
           {tagline}
        </p>

        {/* Main Title */}
        <h1 className="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter mb-10 leading-[0.85] drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {name}
        </h1>

        {/* Location Info */}
        <div className="flex items-center gap-3 text-lg md:text-xl font-medium opacity-80 mb-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
           <MapPin size={24} className="text-theme-primary" />
           {location}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          <button className="bg-theme-primary text-[var(--primary-foreground)] px-12 py-6 rounded-2xl font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 min-w-[280px] justify-center">
             Book Your Escape
             <ChevronRight size={24} strokeWidth={3} />
          </button>
          
          <div className="flex items-center gap-4">
             <a 
               href={`https://wa.me/${whatsapp?.replace(/\+/g, '').replace(/\s/g, '')}`} 
               target="_blank" 
               rel="noopener noreferrer"
               className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center text-white hover:bg-emerald-500 hover:border-emerald-500 hover:scale-110 transition-all group shadow-xl"
               title="WhatsApp Booking"
             >
                <MessageSquare size={32} />
             </a>
             <a 
               href={`tel:${phone}`} 
               className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl flex items-center justify-center text-white hover:bg-white hover:text-black hover:scale-110 transition-all group shadow-xl"
               title="Call Concierge"
             >
                <Phone size={32} />
             </a>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-50">
         <span className="text-[10px] font-black uppercase tracking-[0.4em] rotate-90 origin-left translate-x-3 mb-4">Scroll</span>
         <div className="w-px h-16 bg-gradient-to-b from-white/0 via-white to-white/0" />
      </div>
    </section>
  );
}

"use client";

import React from "react";
import OptimizedImage from "./OptimizedImage";
import { Star, Heart, MapPin } from "lucide-react";
import { getPropertyUrl } from "@/lib/utils/domains";

interface PropertyCardProps {
  property: {
    slug: string;
    name: string;
    image: string;
    type: string;
    location: string;
    price: number;
    rating: number;
  };
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <a 
      href={getPropertyUrl(property.slug)} 
      className="group relative flex flex-col cursor-pointer transition-all duration-500 hover:-translate-y-2"
    >
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.5rem] bg-[var(--bg-secondary)] shadow-sm transition-all duration-700 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        <OptimizedImage 
          src={property.image} 
          alt={property.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        />
        
        {/* TOP OVERLAY: WISHLIST & TAG */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-10">
          {property.rating >= 4.8 && (
            <div className="bg-white/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-sm flex items-center gap-1.5 border border-white/20">
              <span className="text-orange-500">★</span>
              <span className="text-gray-900">Guest Favorite</span>
            </div>
          )}
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all hover:bg-white hover:scale-110 shadow-sm"
          >
            <Heart size={20} className="text-white group-hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* BOTTOM OVERLAY: GRADIENT & TYPE */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute bottom-6 left-6 right-6 z-10 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
           <button className="w-full bg-white text-gray-900 font-black py-3 rounded-2xl shadow-xl hover:bg-gray-100 transition-all active:scale-95 text-sm uppercase tracking-widest">
              View Details
           </button>
        </div>

        <div className="absolute bottom-6 left-6 z-10 group-hover:opacity-0 transition-opacity duration-300">
          <div className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/10">
            {property.type}
          </div>
        </div>
      </div>

      {/* PROPERTY INFO */}
      <div className="mt-6 px-1">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-[var(--text)] text-xl group-hover:text-theme-primary transition-colors tracking-tight truncate flex-1">
            {property.name}
          </h3>
          <div className="flex items-center gap-1.5 ml-4 shrink-0 bg-[var(--bg-secondary)] px-2.5 py-1 rounded-full border border-[var(--border)]">
            <Star size={14} className="fill-orange-400 text-orange-400" />
            <span className="text-sm font-black text-[var(--text)]">{property.rating}</span>
            <span className="text-[11px] font-bold text-[var(--text-muted)]">(124)</span>
          </div>
        </div>
        
        <p className="text-sm font-bold text-[var(--text-subtle)] mb-5 flex items-center gap-1.5 uppercase tracking-wide">
          <MapPin size={14} className="text-primary" />
          {property.location}
        </p>

        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[var(--text)] tracking-tight">₹{property.price.toLocaleString("en-IN")}</span>
              <span className="text-sm font-bold text-[var(--text-muted)]">/ night</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">
              ₹{(property.price * 2).toLocaleString("en-IN")} total for 2 nights
            </p>
          </div>
        </div>
      </div>
    </a>
  );
}

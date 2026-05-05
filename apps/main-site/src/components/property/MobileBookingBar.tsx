"use client";

import React from "react";
import { Star, ChevronDown, Calendar } from "lucide-react";

interface MobileBookingBarProps {
  price: number;
  rating: number;
}

export default function MobileBookingBar({ price, rating }: MobileBookingBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 border-t border-white/60 px-6 py-5 flex items-center justify-between z-[100] shadow-[0_-20px_40px_rgba(0,0,0,0.05)] backdrop-blur-xl">
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-[#1a2b4b] tracking-tighter">₹{price.toLocaleString("en-IN")}</span>
          <span className="text-xs text-[#5c6b8a]/60 font-black uppercase tracking-tighter">night</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
           <div className="flex items-center gap-1">
              <Star size={10} fill="currentColor" className="text-theme-primary" />
              <span className="text-xs font-black text-[#1a2b4b]">{rating}</span>
           </div>
           <span className="text-gray-300 text-xs font-bold">·</span>
           <span className="text-[#5c6b8a]/60 text-[10px] font-black uppercase tracking-tight underline">May 15-20</span>
        </div>
      </div>

      <button className="bg-theme-primary text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-theme-primary/20 text-base">
        Reserve Now
      </button>
    </div>
  );
}

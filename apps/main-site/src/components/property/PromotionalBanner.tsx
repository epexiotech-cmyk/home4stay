"use client";

import React from "react";
import { motion } from "framer-motion";
import { Ticket, Zap, ChevronRight, Sparkles } from "lucide-react";

export interface Offer {
  id?: string;
  title: string;
  description: string;
  couponCode: string;
  discountType: 'percentage' | 'fixed' | string;
  discountValue: number;
  minimumBookingAmount: number;
  endDate: string | Date;
  isFeatured: boolean;
  isActive: boolean;
}

interface PromotionalBannerProps {
  offers: Offer[];
}

export default function PromotionalBanner({ offers = [] }: PromotionalBannerProps) {
  if (offers.length === 0) return null;

  // Show the most relevant/featured offer
  const mainOffer = offers.find(o => o.isFeatured && o.isActive) || offers.find(o => o.isActive);
  
  if (!mainOffer) return null;

  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full bg-[#053344] text-white rounded-[40px] overflow-hidden relative group"
    >
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-[#159665]/20 to-transparent pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FCBC43]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="px-10 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-8 text-center md:text-left">
           <div className="w-20 h-20 rounded-[32px] bg-[#159665] flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <Zap size={32} className="text-white fill-white" />
           </div>
           <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                 <span className="px-4 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest border border-white/10">Limited Time Offer</span>
                 <div className="flex items-center gap-1 text-[#FCBC43]">
                    <Sparkles size={12} fill="currentColor" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Seasonal Special</span>
                 </div>
              </div>
              <h2 className="text-3xl font-black tracking-tighter uppercase italic">{mainOffer.title}</h2>
              <p className="text-sm font-medium text-white/60 italic">{mainOffer.description}</p>
           </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-4">
           <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Use Coupon Code</span>
                 <span className="text-2xl font-black tracking-[0.2em] text-[#159665]">{mainOffer.couponCode}</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="text-center md:text-right">
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Discount</span>
                 <div className="text-3xl font-black italic">
                   {mainOffer.discountType === 'percentage' ? `${mainOffer.discountValue}%` : `₹${mainOffer.discountValue}`} <span className="text-sm">OFF</span>
                 </div>
              </div>
           </div>
           
           <button className="px-10 py-4 rounded-2xl bg-white text-[#053344] font-black text-xs uppercase tracking-widest hover:bg-[#159665] hover:text-white transition-all shadow-xl flex items-center gap-3 group/btn">
              Book with this Offer
              <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
           </button>
        </div>
      </div>

      <div className="bg-black/20 px-10 py-3 flex items-center justify-center md:justify-start gap-8">
         <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest">
            <Ticket size={14} className="text-[#159665]" />
            Valid until {new Date(mainOffer.endDate).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
         </div>
         <div className="w-1 h-1 rounded-full bg-white/20 hidden md:block" />
         <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest hidden md:flex">
            <span>*Min spend of ₹{mainOffer.minimumBookingAmount} applies</span>
         </div>
      </div>
    </motion.div>
  );
}

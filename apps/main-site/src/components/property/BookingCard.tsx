"use client";

import React, { useState } from "react";
import { Star, ChevronDown, Calendar, Info, ShieldCheck } from "lucide-react";

interface BookingCardProps {
  price: number;
  rating: number;
  slug: string;
}

export default function BookingCard({ price, rating, slug }: BookingCardProps) {
  const [guests, setGuests] = useState(1);
  const nights = 5;
  const cleaningFee = 1500;
  const serviceFee = 2400;
  const taxes = Math.round((price * nights) * 0.12);
  const total = (price * nights) + cleaningFee + serviceFee + taxes;

  return (
    <div className="sticky top-32 w-full max-w-[480px] mx-auto">
      {/* Background Depth Glow */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20 blur-[80px]"
        style={{
          background: 'var(--primary)'
        }}
      />

      <div className="relative z-10 bg-[var(--card)] backdrop-blur-xl border border-[var(--border)] rounded-[3rem] p-8 md:p-10 shadow-[0_32px_64px_var(--shadow)] transition-all hover:shadow-[0_48px_80px_var(--shadow)]">
        {/* Simplified Top Section */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black text-[var(--text)] tracking-tight">₹{price.toLocaleString("en-IN")}</span>
            <span className="text-[var(--text-muted)] font-medium text-sm">/ night</span>
          </div>
        </div>
        
        {/* Urgency Sub-line */}
        <div className="flex items-center gap-2 mb-8 ml-1">
          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
          <p className="text-xs font-bold text-rose-500">Only 2 slots left this week</p>
        </div>

        {/* Clean Date & Guest Section */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden mb-8 transition-all hover:bg-[var(--card-solid)] focus-within:ring-4 focus-within:ring-theme-primary/10">
          <div className="grid grid-cols-2 border-b border-[var(--border)]">
            <div className="p-6 border-r border-[var(--border)] cursor-pointer hover:bg-[var(--text)]/5 transition-all group">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-[var(--text-muted)] group-hover:text-theme-primary" />
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest group-hover:text-theme-primary">Check-in</label>
              </div>
              <div className="text-sm text-[var(--text)] font-black">May 15, 2026</div>
            </div>
            <div className="p-6 cursor-pointer hover:bg-[var(--text)]/5 transition-all group">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={12} className="text-[var(--text-muted)] group-hover:text-theme-primary" />
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest group-hover:text-theme-primary">Checkout</label>
              </div>
              <div className="text-sm text-[var(--text)] font-black">May 20, 2026</div>
            </div>
          </div>
          <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-[var(--text)]/5 transition-all group">
            <div>
              <label className="block text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest mb-1 group-hover:text-theme-primary">Guests</label>
              <div className="text-sm text-[var(--text)] font-black">{guests} {guests === 1 ? 'Guest' : 'Guests'}</div>
            </div>
            <ChevronDown size={20} className="text-[var(--text-muted)] group-hover:text-theme-primary transition-transform group-hover:translate-y-0.5" />
          </div>
        </div>

        {/* CTA Button */}
        <button className="w-full bg-gradient-to-r from-theme-primary to-[var(--primary-hover)] text-[var(--primary-foreground)] font-black py-6 rounded-[2rem] text-xl shadow-[0_20px_40px_-10px_var(--shadow)] hover:shadow-[0_25px_50px_-12px_var(--primary)] hover:scale-[1.02] transition-all active:scale-[0.98] mb-6">
          Check Availability
        </button>

        {/* Trust Signals */}
        <div className="flex items-center justify-center gap-6 mb-10">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
            <span className="text-[10px] font-black uppercase tracking-widest">No payment yet</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
            <span className="text-[10px] font-black uppercase tracking-widest">Free cancellation</span>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-4 mb-10 px-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-muted)] font-medium">₹{price.toLocaleString("en-IN")} × {nights} nights</span>
            <span className="font-bold text-[var(--text)]">₹{(price * nights).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-muted)] font-medium flex items-center gap-2">
              Cleaning fee <Info size={14} className="opacity-40" />
            </span>
            <span className="font-bold text-[var(--text)]">₹{cleaningFee.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-[var(--text-muted)] font-medium">Service fee</span>
            <span className="font-bold text-[var(--text)]">₹{serviceFee.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Total Section (Hero) */}
        <div className="pt-8 border-t border-[var(--border)] flex justify-between items-end mb-10">
          <div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Total inclusive of taxes</p>
            <p className="text-xs font-bold text-theme-primary bg-theme-primary/5 px-2 py-1 rounded-lg w-fit">Best price guarantee</p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-black text-theme-primary tracking-tighter">₹{total.toLocaleString("en-IN")}</p>
          </div>
        </div>

        {/* Price Guarantee (Minimal Card) */}
        <div className="p-5 bg-[var(--primary)]/5 rounded-[1.5rem] border border-[var(--primary)]/10 flex items-center gap-4 group cursor-pointer hover:bg-[var(--primary)]/10 transition-colors">
           <div className="w-10 h-10 bg-[var(--card-solid)] rounded-xl flex items-center justify-center text-theme-primary shadow-sm group-hover:scale-110 transition-transform">
              <ShieldCheck size={22} />
           </div>
           <p className="text-[10px] font-bold text-[var(--text-muted)] leading-snug flex-1">
              Find a lower price? We&apos;ll match it plus give you a <span className="text-theme-primary">₹1,000 credit</span>.
           </p>
        </div>
      </div>
    </div>
  );
}

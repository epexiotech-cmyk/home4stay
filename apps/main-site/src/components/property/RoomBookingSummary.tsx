"use client";

import React, { useEffect } from "react";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { getMainDomainUrl } from "@/lib/utils/domains";

export default function RoomBookingSummary({ room, propertyId }: { room: any; propertyId: string }) {
  const { state, setPropertyId, setRoom } = useBooking();
  const { user } = useAuth();
  
  useEffect(() => {
    setPropertyId(propertyId);
    setRoom(room.id, room.name, room.price);
  }, [propertyId, room.id, room.name, room.price, setPropertyId, setRoom]);

  const { pricing, guestCount, selectedExperiences, selectedMealPlanId } = state;
  const experienceCount = Object.keys(selectedExperiences).length;

  const handleReserve = () => {
    if (!user) {
      window.location.href = getMainDomainUrl(`/login?redirect=/booking/checkout`);
      return;
    }
    window.location.href = getMainDomainUrl(`/booking/checkout`);
  };

  return (
    <div className="sticky top-24 bg-[var(--card)] rounded-3xl p-6 shadow-xl border border-[var(--border)] overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-theme-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <h3 className="text-xl font-serif text-[var(--text)] tracking-tight mb-6">Booking Summary</h3>
      
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
          <span className="text-sm text-[var(--text-muted)] font-medium">Room</span>
          <span className="text-sm font-semibold text-[var(--text)]">{room.name}</span>
        </div>
        
        <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
          <span className="text-sm text-[var(--text-muted)] font-medium">Guests</span>
          <div className="flex items-center gap-1.5 text-[var(--text)]">
            <Users size={14} />
            <span className="text-sm font-semibold">{guestCount.adults + guestCount.children}</span>
          </div>
        </div>
        
        {selectedMealPlanId && selectedMealPlanId !== "EP" && (
          <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--text-muted)] font-medium">Meal Plan</span>
            <span className="text-sm font-semibold text-[var(--text)]">{selectedMealPlanId}</span>
          </div>
        )}
        
        {experienceCount > 0 && (
          <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
            <span className="text-sm text-[var(--text-muted)] font-medium">Experiences</span>
            <div className="flex items-center gap-1.5 text-theme-primary">
              <Sparkles size={14} />
              <span className="text-sm font-semibold">{experienceCount}</span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <p className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest mb-1">Estimated Total</p>
        <p className="text-3xl font-bold text-[var(--text)]">₹{pricing.total.toLocaleString()}</p>
        <p className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest mt-1">Includes taxes & fees</p>
      </div>

      <button 
        onClick={handleReserve}
        className="w-full py-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group bg-theme-primary text-white shadow-md hover:bg-theme-primary/90"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        <span>Reserve Your Stay</span>
        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
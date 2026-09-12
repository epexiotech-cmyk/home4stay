"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Share2,
  MessageCircle,
  X,
  LogIn,
  UserPlus
} from "lucide-react";
import { useBooking } from "@/context/BookingContext";
import { useAuth } from "@/context/AuthContext";
import { getMainDomainUrl } from "@/lib/utils/domains";

export default function FloatingBookingBar() {
  const { state } = useBooking();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { selectedRoomId, selectedRoomName, selectedExperiences, pricing, guestCount } = state;

  const hasSelection = !!selectedRoomId;
  const experienceCount = Object.keys(selectedExperiences).length;

  const handleReserve = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Proceed to checkout
    const isLocal = window.location.hostname.includes('localhost');
    const rootDomain = isLocal ? 'localhost:3000' : 'home4stay.homes';
    window.location.href = `${window.location.protocol}//${rootDomain}/booking/checkout`;
  };

  return (
    <AnimatePresence mode="wait">
      {hasSelection && (
        <div key="floating-booking-bar" className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 md:pb-8 pointer-events-none">
          <div className="max-w-[1440px] mx-auto w-full flex items-end justify-center">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full max-w-5xl pointer-events-auto"
            >
              <div className="bg-[var(--card)]/95 backdrop-blur-2xl rounded-3xl p-3 md:p-4 shadow-2xl border border-[var(--border)] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-theme-primary/5 to-transparent pointer-events-none" />

                {/* Selection Summary (Desktop) */}
                <div className="flex-1 flex items-center gap-8 px-4">
                  <div className="flex items-center gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="hidden md:block">
                      <p className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest mb-1">Your Selection</p>
                      <h4 className="text-[15px] font-medium text-[var(--text)] truncate max-w-[200px]">
                        {selectedRoomName || "Selected Room"}
                      </h4>
                    </div>
                    
                    <div className="h-10 w-px bg-black/5 dark:bg-white/10 hidden md:block" />

                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-1.5 text-[var(--text-muted)] mb-1">
                          <Users size={12} />
                          <span className="text-[11px] font-medium uppercase tracking-widest">{guestCount.adults + guestCount.children} Guests</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#053344] dark:text-white/60">
                          <Sparkles size={12} className="text-[#159665]" />
                          <span className="text-[11px] font-medium uppercase tracking-widest">{experienceCount} Experiences</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <p className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest mb-0.5">Total Estimated</p>
                        <p className="text-xl font-semibold text-theme-primary">₹{pricing.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="hidden sm:flex items-center gap-2 mr-4">
                    <button className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--text)]/5 transition-all">
                      <Share2 size={16} strokeWidth={1.5} />
                    </button>
                    <button className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--text)]/5 transition-all">
                      <MessageCircle size={16} strokeWidth={1.5} />
                    </button>
                  </div>

                  <button 
                    onClick={handleReserve}
                    className="flex-1 md:flex-none px-8 py-4 rounded-xl text-xs font-medium uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group bg-theme-primary text-white shadow-md hover:bg-theme-primary/90 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    <span>Reserve Your Escape</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Trust Badges (Desktop Only) */}
                <div className="hidden lg:flex absolute top-[-1px] left-1/2 -translate-x-1/2 px-6 py-1 rounded-b-xl bg-[#159665]/10 border-x border-b border-[#159665]/20 items-center gap-2">
                   <ShieldCheck size={10} className="text-[#159665]" />
                   <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#159665]">Verified Property • Instant Confirmation</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      <AuthPromptModal key="auth-prompt-modal" isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </AnimatePresence>
  );
}

function AuthPromptModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            key="auth-modal-content"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-[#053344]/80 backdrop-blur-2xl rounded-[48px] p-10 md:p-14 border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCBC43]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0983B0]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white z-10"
            >
              <X size={24} />
            </button>

            <div className="relative text-center z-10">
              <div className="w-20 h-20 bg-[#FCBC43] rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#FCBC43]/20 rotate-12">
                <Sparkles size={40} className="text-[#053344]" />
              </div>
              
              <h3 className="text-3xl font-black text-white tracking-tight mb-4 leading-tight">One last step to your escape</h3>
              <p className="text-white/70 text-sm font-bold leading-relaxed mb-12">
                Join our elite circle of travelers. Login or create an account to secure your reservation and unlock exclusive concierge benefits.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a 
                  href={getMainDomainUrl("/login")}
                  className="flex items-center justify-center gap-3 px-8 py-5 rounded-[24px] bg-white text-[#053344] font-black text-xs uppercase tracking-widest hover:bg-white/90 hover:scale-[1.02] transition-all shadow-xl shadow-black/20"
                >
                  <LogIn size={18} />
                  Login
                </a>
                <a 
                  href={getMainDomainUrl("/register?intent=customer")}
                  className="flex items-center justify-center gap-3 px-8 py-5 rounded-[24px] bg-[#FCBC43] text-[#053344] font-black text-xs uppercase tracking-widest hover:bg-[#F2AE29] hover:scale-[1.02] transition-all shadow-xl shadow-[#FCBC43]/20"
                >
                  <UserPlus size={18} />
                  Register
                </a>
              </div>

              <button 
                onClick={onClose}
                className="mt-8 text-[10px] font-black text-white/40 uppercase tracking-[0.4em] hover:text-[#FCBC43] transition-colors"
              >
                Continue Exploring
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

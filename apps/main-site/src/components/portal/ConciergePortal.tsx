"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plane, 
  Clock, 
  Sparkles, 
  Utensils, 
  Map, 
  Heart, 
  ShieldAlert, 
  Home, 
  ChevronRight, 
  ArrowLeft,
  X,
  MessageSquare,
  History,
  Upload
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type Category = {
  id: string;
  label: string;
  icon: React.ElementType;
  suggestion: string;
  color: string;
};

const CATEGORIES: Category[] = [
  { id: "airport-pickup", label: "Airport Pickup", icon: Plane, suggestion: "Arrival flight details required", color: "#0983B0" },
  { id: "early-checkin", label: "Early Check-In", icon: Clock, suggestion: "Subject to availability", color: "#159665" },
  { id: "decoration", label: "Decoration", icon: Sparkles, suggestion: "Anniversary or Birthday?", color: "#FCBC43" },
  { id: "dinner", label: "Private Dinner", icon: Utensils, suggestion: "Candlelight setup by the pool", color: "#F24633" },
  { id: "tour", label: "Local Tour", icon: Map, suggestion: "Bespoke village experiences", color: "#0E5A75" },
  { id: "custom", label: "Custom Request", icon: Heart, suggestion: "Tell us your unique needs", color: "#6366f1" },
  { id: "emergency", label: "Medical/Emergency", icon: ShieldAlert, suggestion: "24/7 priority response", color: "#ef4444" },
];

interface ConciergePortalProps {
  isOpen: boolean;
  onClose: () => void;
  isVerified?: boolean;
}

export function ConciergePortal({ isOpen, onClose, isVerified }: ConciergePortalProps) {
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [requestText, setRequestText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleReset = () => {
    setStep(1);
    setSelectedCategory(null);
    setRequestText("");
    setIsSuccess(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 md:p-10">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#053344]/95 backdrop-blur-3xl"
            onClick={onClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 40 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              marginTop: isScrolled ? "120px" : "280px",
              maxHeight: isScrolled ? "85vh" : "70vh"
            }}
            exit={{ opacity: 0, scale: 0.98, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-4xl h-full glass-premium dark:bg-white/[0.03] shadow-luxury rounded-[64px] border border-white/20 dark:border-white/10 overflow-hidden flex flex-col"
          >
            {/* Atmospheric Background Blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-[#0983B0]/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#159665]/20 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="p-8 md:p-10 border-b border-[#0E5A75]/5 dark:border-white/5 flex items-center justify-between relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[24px] bg-[#0983B0]/10 flex items-center justify-center text-[#0983B0] relative">
                  <Sparkles size={32} />
                  {isVerified && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#159665] border-4 border-[#FDF6F1] dark:border-[#0A0F1D] flex items-center justify-center">
                       <ShieldAlert size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#053344] dark:text-white tracking-tighter leading-none mb-2">Luxury Concierge</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/30 uppercase tracking-[0.3em]">Home4Stay Premium Support</span>
                    {isVerified && (
                      <span className="text-[9px] font-black bg-[#159665]/10 text-[#159665] px-2 py-0.5 rounded-full uppercase tracking-widest">VIP Priority Active</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex p-1 bg-[#0E5A75]/5 dark:bg-white/5 rounded-2xl border border-[#0E5A75]/10 dark:border-white/10">
                  <button 
                    onClick={() => setActiveTab("new")}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === "new" ? "bg-[#0E5A75] dark:bg-[#0983B0] text-white shadow-lg" : "text-[#0E5A75]/40 dark:text-white/40 hover:text-[#0E5A75]"
                    )}
                  >
                    New Request
                  </button>
                  <button 
                    onClick={() => setActiveTab("history")}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      activeTab === "history" ? "bg-[#0E5A75] dark:bg-[#0983B0] text-white shadow-lg" : "text-[#0E5A75]/40 dark:text-white/40 hover:text-[#0E5A75]"
                    )}
                  >
                    History
                  </button>
                </div>
                <button onClick={onClose} className="p-4 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#0E5A75] dark:text-white transition-all active:scale-90">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
              <AnimatePresence mode="wait">
                {activeTab === "new" ? (
                  !isSuccess ? (
                    <motion.div 
                      key="new-request"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="max-w-2xl mx-auto h-full flex flex-col"
                    >
                      {step === 1 ? (
                        <div className="space-y-10">
                          <div className="text-center md:text-left">
                            <h3 className="text-2xl font-black text-[#053344] dark:text-white mb-2">How can we assist you?</h3>
                            <p className="text-sm font-bold text-[#0E5A75]/60 dark:text-white/40 uppercase tracking-widest">Select a category to begin your bespoke experience</p>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setStep(2);
                                }}
                                className="group relative p-8 rounded-[40px] glass-matte dark:bg-white/[0.02] border border-white/10 dark:border-white/5 hover:border-[#0983B0] hover:bg-[#0983B0]/5 transition-all text-left overflow-hidden shadow-premium hover:shadow-2xl hover:-translate-y-1 duration-500"
                              >
                                <div className="flex items-center gap-5 relative z-10">
                                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: cat.color }}>
                                    <cat.icon size={24} />
                                  </div>
                                  <div>
                                    <h4 className="font-black text-[#053344] dark:text-white uppercase tracking-widest text-xs mb-1">{cat.label}</h4>
                                    <p className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-white/40">{cat.suggestion}</p>
                                  </div>
                                </div>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all">
                                  <ChevronRight size={20} className="text-[#0983B0]" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black text-[#0983B0] uppercase tracking-widest hover:underline">
                            <ArrowLeft size={14} /> Back to Categories
                          </button>
                          
                          <div className="flex items-center gap-4 p-6 rounded-[32px] bg-[#0E5A75]/5 dark:bg-white/5 border border-[#0E5A75]/10 dark:border-white/10">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: selectedCategory?.color }}>
                              {selectedCategory && <selectedCategory.icon size={24} />}
                            </div>
                            <div>
                              <h4 className="font-black text-[#053344] dark:text-white uppercase tracking-widest text-sm">{selectedCategory?.label}</h4>
                              <p className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-white/40">Premium Concierge Request</p>
                            </div>
                          </div>

                          <div className="space-y-6">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-[0.2em] ml-2">Request Details</label>
                              <textarea 
                                value={requestText}
                                onChange={(e) => setRequestText(e.target.value)}
                                placeholder="Describe your bespoke travel requirements..."
                                className="w-full min-h-[150px] p-8 rounded-[40px] glass-matte dark:bg-white/[0.02] border border-white/10 dark:border-white/5 focus:border-[#0983B0] outline-none text-base font-black text-[#053344] dark:text-white placeholder:text-[#0E5A75]/30 dark:placeholder:text-white/20 transition-all resize-none shadow-inner"
                              />
                            </div>
                            
                            <div className="flex flex-wrap gap-4">
                               <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-white/5 border border-[#0E5A75]/10 dark:border-white/10 text-[10px] font-black text-[#053344] dark:text-white uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all">
                                  <Clock size={16} className="text-[#0983B0]" /> Preferred Time
                               </button>
                               <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-white/5 border border-[#0E5A75]/10 dark:border-white/10 text-[10px] font-black text-[#053344] dark:text-white uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all">
                                  <Upload size={16} className="text-[#0983B0]" /> Attach Image
                               </button>
                               <button className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white dark:bg-white/5 border border-[#0E5A75]/10 dark:border-white/10 text-[10px] font-black text-[#053344] dark:text-white uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all">
                                  <Home size={16} className="text-[#0983B0]" /> Select Booking
                               </button>
                            </div>
                          </div>

                          <div className="pt-6">
                            <button 
                              onClick={handleSubmit}
                              disabled={!requestText || isSubmitting}
                              className={cn(
                                "w-full py-6 rounded-[32px] bg-[#0E5A75] dark:bg-[#0983B0] text-white text-xs font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale",
                                isSubmitting && "animate-pulse"
                              )}
                            >
                              {isSubmitting ? "Dispatching Request..." : "Submit Concierge Request"}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center space-y-8 h-full py-20"
                    >
                      <div className="w-32 h-32 rounded-[48px] bg-[#159665]/10 flex items-center justify-center text-[#159665] shadow-2xl relative">
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 12 }}
                        >
                          <ShieldAlert size={64} />
                        </motion.div>
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="absolute inset-0 rounded-[48px] border-4 border-[#159665]"
                        />
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter">Request Received</h3>
                        <p className="text-sm font-bold text-[#0E5A75]/60 dark:text-white/40 uppercase tracking-widest max-w-sm">Our luxury management team has been notified. You will receive a response shortly.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveTab("history");
                          handleReset();
                        }}
                        className="px-12 py-5 rounded-[24px] bg-[#053344] dark:bg-white dark:text-[#053344] text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all"
                      >
                        Track Progress
                      </button>
                    </motion.div>
                  )
                ) : (
                  <motion.div 
                    key="history"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">Active Assistance</h3>
                      <button className="text-[10px] font-black text-[#0983B0] uppercase tracking-widest hover:underline flex items-center gap-2">
                        <History size={14} /> View All Past Requests
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Placeholder Request Card */}
                      <RequestCard 
                        category="Airport Pickup"
                        status="UNDER_REVIEW"
                        date="Oct 24, 2:30 PM"
                        title="Pickup from IGI Terminal 3"
                      />
                      <RequestCard 
                        category="Private Dinner"
                        status="COMPLETED"
                        date="Oct 22, 8:00 PM"
                        title="Anniversary Surprise Setup"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Status */}
            <div className="p-8 border-t border-[#0E5A75]/5 dark:border-white/5 bg-[#0E5A75]/5 dark:bg-white/[0.02] flex items-center justify-center gap-8 text-[10px] font-black text-[#0E5A75]/40 dark:text-white/30 uppercase tracking-[0.4em]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#159665] animate-pulse" />
                Hospitality Pulse: Active
              </div>
              <div className="w-1 h-1 rounded-full bg-current opacity-20" />
              <div className="flex items-center gap-2">
                Secure Concierge Channel
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface RequestCardProps {
  category: string;
  status: string;
  date: string;
  title: string;
}

function RequestCard({ category, status, date, title }: RequestCardProps) {
  return (
    <div className="p-10 rounded-[48px] glass-matte dark:bg-white/[0.02] border border-white/10 dark:border-white/5 hover:shadow-2xl transition-all duration-700 group relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-[#0983B0]/10 flex items-center justify-center text-[#0983B0] group-hover:scale-110 transition-transform">
             {category.includes("Airport") ? <Plane size={28} /> : <Utensils size={28} />}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] font-black text-[#0983B0] uppercase tracking-widest">{category}</span>
              <div className="w-1 h-1 rounded-full bg-[#0E5A75]/20" />
              <span className="text-[10px] font-bold text-[#0E5A75]/40 dark:text-white/40">{date}</span>
            </div>
            <h4 className="text-xl font-black text-[#053344] dark:text-white tracking-tight">{title}</h4>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className={cn(
             "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border",
             status === "COMPLETED" ? "bg-[#159665]/10 text-[#159665] border-[#159665]/20" : "bg-[#FCBC43]/10 text-[#FCBC43] border-[#FCBC43]/20"
           )}>
             {status.replace("_", " ")}
           </div>
           <button className="w-12 h-12 rounded-full bg-[#0E5A75] dark:bg-[#0983B0] text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg active:scale-90">
             <MessageSquare size={20} />
           </button>
        </div>
      </div>
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0983B0]/5 to-transparent rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none" />
    </div>
  );
}

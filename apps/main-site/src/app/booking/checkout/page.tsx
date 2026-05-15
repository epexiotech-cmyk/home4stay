"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Users, 
  Coffee, 
  Sparkles, 
  CreditCard, 
  Zap, 
  MessageCircle, 
  PlaneTakeoff, 
  Navigation, 
  CheckCircle2, 
  Lock, 
  QrCode,
  Building,
  Wallet,
  Receipt,
  Info,
  ChevronUp,
  ArrowRight,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { AadhaarOTPVerification, AadhaarData } from "@/components/kyc/AadhaarOTPVerification";
import { motion, AnimatePresence } from "framer-motion";
import { ConciergeUpsell, CONCIERGE_SERVICES } from "@/components/booking/ConciergeUpsell";
import { useBooking } from "@/context/BookingContext";

// --- Types ---

type PaymentMethod = "upi" | "card" | "razorpay" | "netbanking" | "at_property";
type BookingMode = "instant" | "request";

interface Costs {
  base: number;
  concierge: number;
  gst: number;
  total: number;
}

// --- Constants ---

// Concierge Services are now managed via ConciergeUpsell.tsx constants

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-white/5 dark:border-white/5 shadow-premium overflow-hidden", className)}>
    {children}
  </div>
);

// --- Main Page ---

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [selectedConcierge, setSelectedConcierge] = useState<Record<string, unknown>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingMode, setBookingMode] = useState<BookingMode>("instant");
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [isKYCVerified, setIsKYCVerified] = useState(false);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycData, setKycData] = useState<AadhaarData | null>(null);
  
  const { state: bookingState } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Guest Form States
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const calculateTotal = (): Costs => {
    const basePrice = 45200;
    const conciergeTotal = Object.keys(selectedConcierge).reduce((sum, id) => {
      const service = CONCIERGE_SERVICES.find(s => s.id === id);
      return sum + (service?.price || 0);
    }, 0);
    const gst = (basePrice + conciergeTotal) * 0.12;
    return { base: basePrice, concierge: conciergeTotal, gst, total: basePrice + conciergeTotal + gst };
  };

  const costs = calculateTotal();

  const handleConfirm = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'idempotency-key': `book_${Date.now()}_${guestPhone}`
        },
        body: JSON.stringify({
          propertyId: "shivay-resort-id", // In real app, get from context/props
          roomId: bookingState.selectedRoomId,
          startDate: bookingState.dates.from,
          endDate: bookingState.dates.to,
          mealPlanId: bookingState.selectedMealPlanId,
          amount: costs.total,
          guestData: {
            fullName: guestName,
            email: guestEmail,
            mobile: guestPhone,
            kycVerified: isKYCVerified
          },
          conciergeServices: Object.keys(selectedConcierge).map(id => {
            const svc = CONCIERGE_SERVICES.find(s => s.id === id);
            return {
              serviceType: id,
              amount: svc?.price || 0,
              configData: selectedConcierge[id]
            };
          })
        })
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        const err = await response.json();
        alert(`Booking Error: ${err.message || 'Submission failed'}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Failed to connect to the booking server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (isSuccess) return <SuccessView mode={bookingMode} />;

  return (
    <div className="min-h-screen bg-[#FDF6F1] dark:bg-[#053344] pb-32 lg:pb-16 pt-8 md:pt-16 px-4 md:px-10 lg:px-20 relative">
      
      {/* Header */}
      <div className="max-w-[1440px] mx-auto mb-10 md:mb-16 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-px bg-[#0E5A75] dark:bg-[#FCBC43]" />
            <span className="text-[10px] md:text-xs font-black text-[#0E5A75] dark:text-[#FCBC43] uppercase tracking-[0.3em]">Concierge Checkout</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Complete your Stay</h1>
        </div>
        
        {/* Booking Mode Toggle (For demo/testing purposes) */}
        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="flex items-center gap-4 px-6 py-3 rounded-full glass-matte border-black/5 dark:border-white/5">
            <ShieldCheck size={18} className="text-[#159665]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#053344] dark:text-white italic">Booking Protected by Home4Stay</span>
          </div>
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-full">
            <button 
              onClick={() => setBookingMode("instant")}
              className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", bookingMode === "instant" ? "bg-white dark:bg-[#0E5A75] text-[#0E5A75] dark:text-white shadow-md" : "text-black/50 dark:text-white/50")}
            >
              Instant Book
            </button>
            <button 
              onClick={() => setBookingMode("request")}
              className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", bookingMode === "request" ? "bg-white dark:bg-[#0E5A75] text-[#0E5A75] dark:text-white shadow-md" : "text-black/50 dark:text-white/50")}
            >
              Request to Book
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start relative">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-8 md:space-y-10">
          
          {/* 1. Guest Information */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0E5A75] text-white flex items-center justify-center font-black text-sm">1</div>
              <h3 className="text-lg md:text-xl font-black text-[#053344] dark:text-white uppercase tracking-widest">Guest Information</h3>
            </div>
            <GlassCard className="space-y-8 relative overflow-hidden">
              {isKYCVerified && (
                <div className="absolute top-0 right-0 p-8">
                   <VerifiedBadge status="verified" showText size="sm" />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup 
                  label="Primary Guest Name" 
                  placeholder="e.g. Vikram Sethi" 
                  icon={Users} 
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                />
                <InputGroup 
                  label="Email Address" 
                  placeholder="e.g. vikram@example.com" 
                  icon={MessageCircle} 
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
                <InputGroup 
                  label="Phone Number" 
                  placeholder="+91 98765 43210" 
                  icon={Zap} 
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
                <InputGroup label="Estimated Arrival" placeholder="e.g. 2:00 PM" icon={Calendar} />
              </div>

              {!isKYCVerified ? (
                <div className="p-6 md:p-8 rounded-[32px] bg-[#0E5A75]/5 dark:bg-[#FCBC43]/5 border border-dashed border-[#0E5A75]/30 dark:border-[#FCBC43]/30 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2 text-center md:text-left">
                    <h4 className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                      <ShieldCheck size={18} className="text-[#0983B0]" /> Verify Identity for VIP Check-in
                    </h4>
                    <p className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-white/60 leading-relaxed max-w-xs uppercase tracking-widest">Complete KYC now to enjoy faster approval and verified guest status.</p>
                  </div>
                  <button 
                    onClick={() => setShowKYCModal(true)}
                    className="px-8 py-3 rounded-2xl bg-[#0E5A75] dark:bg-[#FCBC43] text-white dark:text-[#053344] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all whitespace-nowrap"
                  >
                    Verify Now
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-[32px] bg-[#159665]/5 border border-[#159665]/20 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#159665]/10 flex items-center justify-center text-[#159665]">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#053344] dark:text-white uppercase tracking-widest italic">Identity Verified Successfully</p>
                      <p className="text-[10px] font-bold text-[#159665] uppercase tracking-widest">ID: {kycData?.aadhaarMasked}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsKYCVerified(false)} className="text-[10px] font-black text-[#F24633] uppercase hover:underline">Reset</button>
                </div>
              )}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75] dark:text-[#FCBC43]">Celebrating an Occasion?</label>
                <div className="flex flex-wrap gap-3">
                  {["Birthday", "Anniversary", "Honeymoon", "First Visit", "Business"].map(tag => (
                    <button key={tag} className="px-5 py-2.5 rounded-xl border border-[#0E5A75]/20 dark:border-white/10 text-[10px] font-black text-[#053344] dark:text-white uppercase tracking-widest hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-all">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75] dark:text-[#FCBC43]">Special Requests</label>
                <textarea 
                  rows={3} 
                  placeholder="Any dietary restrictions, accessibility needs, or preferences?" 
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 dark:bg-[#0E5A75]/20 border border-[#0E5A75]/10 dark:border-white/10 focus:border-[#0E5A75]/40 dark:focus:border-[#FCBC43]/40 outline-none text-sm font-bold resize-none text-[#053344] dark:text-white placeholder:text-[#053344]/30 dark:placeholder:text-white/30"
                />
              </div>
            </GlassCard>
          </section>

          {/* 2. Concierge Experience Selection */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0E5A75] text-white flex items-center justify-center font-black text-sm">2</div>
              <h3 className="text-lg md:text-xl font-black text-[#053344] dark:text-white uppercase tracking-widest italic">Enhance Your Stay</h3>
            </div>
            <ConciergeUpsell 
              selectedServices={selectedConcierge}
              onServiceToggle={(id, config) => {
                setSelectedConcierge(prev => {
                  const newSelected = { ...prev };
                  if (config === null) delete newSelected[id];
                  else newSelected[id] = config;
                  return newSelected;
                });
              }}
            />
          </section>

          {/* 3. Payment / Request Method */}
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0E5A75] text-white flex items-center justify-center font-black text-sm">3</div>
              <h3 className="text-lg md:text-xl font-black text-[#053344] dark:text-white uppercase tracking-widest">
                {bookingMode === "instant" ? "Secure Payment" : "Booking Request"}
              </h3>
            </div>
            
            <GlassCard className="space-y-8">
              {bookingMode === "instant" ? (
                <>
                  <div className="flex overflow-x-auto pb-4 md:pb-0 md:grid md:grid-cols-5 gap-3 snap-x hide-scrollbar">
                    <PaymentTab active={paymentMethod === "upi"} onClick={() => setPaymentMethod("upi")} label="UPI" icon={QrCode} />
                    <PaymentTab active={paymentMethod === "card"} onClick={() => setPaymentMethod("card")} label="Card" icon={CreditCard} />
                    <PaymentTab active={paymentMethod === "razorpay"} onClick={() => setPaymentMethod("razorpay")} label="Razorpay" icon={Zap} />
                    <PaymentTab active={paymentMethod === "netbanking"} onClick={() => setPaymentMethod("netbanking")} label="Net Banking" icon={Building} />
                    <PaymentTab active={paymentMethod === "at_property"} onClick={() => setPaymentMethod("at_property")} label="Pay Later" icon={Wallet} />
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 p-6 md:p-8 rounded-[32px] bg-[#0E5A75]/5 dark:bg-black/20 border border-[#0E5A75]/10 dark:border-white/10">
                      <div className="w-40 h-40 bg-white p-4 rounded-2xl shadow-xl shrink-0">
                        <QrCode size={128} className="text-[#053344]" />
                      </div>
                      <div className="space-y-4 text-center md:text-left">
                        <h4 className="text-xl font-black text-[#053344] dark:text-white">Scan to Pay via UPI</h4>
                        <p className="text-xs font-bold text-[#053344]/60 dark:text-white/60 max-w-xs mx-auto md:mx-0 uppercase tracking-widest">Securely pay using any UPI app. Your booking will be instantly confirmed.</p>
                        <div className="flex justify-center md:justify-start gap-4 pt-2">
                           <div className="px-4 py-2 bg-white dark:bg-[#053344] rounded-lg border border-black/5 dark:border-white/10 text-[10px] font-black uppercase text-[#053344] dark:text-white">GPay</div>
                           <div className="px-4 py-2 bg-white dark:bg-[#053344] rounded-lg border border-black/5 dark:border-white/10 text-[10px] font-black uppercase text-[#053344] dark:text-white">PhonePe</div>
                           <div className="px-4 py-2 bg-white dark:bg-[#053344] rounded-lg border border-black/5 dark:border-white/10 text-[10px] font-black uppercase text-[#053344] dark:text-white">Paytm</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="p-6 md:p-8 rounded-[32px] bg-[#0E5A75]/5 dark:bg-black/20 border border-[#0E5A75]/10 dark:border-white/10 space-y-6">
                       <InputGroup label="Card Number" placeholder="0000 0000 0000 0000" icon={CreditCard} />
                       <div className="grid grid-cols-2 gap-6">
                         <InputGroup label="Expiry Date" placeholder="MM/YY" icon={Calendar} />
                         <InputGroup label="CVV" placeholder="123" icon={Lock} />
                       </div>
                       <InputGroup label="Name on Card" placeholder="Vikram Sethi" icon={Users} />
                    </div>
                  )}

                  {paymentMethod === "at_property" && (
                     <div className="p-6 md:p-8 rounded-[32px] bg-[#159665]/10 border border-[#159665]/20 text-center space-y-4">
                       <Wallet size={40} className="mx-auto text-[#159665]" />
                       <h4 className="text-xl font-black text-[#053344] dark:text-white">Pay on Arrival</h4>
                       <p className="text-sm font-bold text-[#053344]/60 dark:text-white/60">Your room is held. You can settle the bill directly at the property during check-in using Card, UPI, or Cash.</p>
                     </div>
                  )}

                  <div className="pt-4 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-[#0E5A75]/60 dark:text-[#FCBC43]/80 italic">
                      <Lock size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Bank-grade 256-bit SSL encrypted</span>
                    </div>
                    <div className="flex gap-2">
                       {/* Brand logos placeholder */}
                       <div className="w-8 h-5 bg-black/10 dark:bg-white/10 rounded" />
                       <div className="w-8 h-5 bg-black/10 dark:bg-white/10 rounded" />
                       <div className="w-8 h-5 bg-black/10 dark:bg-white/10 rounded" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-6 py-8">
                  <div className="w-20 h-20 rounded-full bg-[#FCBC43]/10 flex items-center justify-center mx-auto text-[#FCBC43]">
                    <MessageCircle size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-[#053344] dark:text-white mb-2">Host Approval Required</h4>
                    <p className="text-sm font-bold text-[#053344]/60 dark:text-white/60 max-w-md mx-auto">
                      This property requires host approval. You won&apos;t be charged right now. We will put a hold on your card once you submit the request.
                    </p>
                  </div>
                  <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 text-left inline-block w-full max-w-md">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-[#053344] dark:text-white mb-4">What happens next?</h5>
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#159665] shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-[#053344]/80 dark:text-white/80">Host reviews your request within 24 hours.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#159665] shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-[#053344]/80 dark:text-white/80">If approved, your booking is confirmed automatically.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 size={16} className="text-[#159665] shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-[#053344]/80 dark:text-white/80">If declined, you are not charged anything.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </GlassCard>
          </section>
        </div>

        {/* Right Column: Summary (Desktop Sticky) */}
        <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-10 space-y-8">
          <BookingSummaryCard 
            costs={costs} 
            selectedConcierge={selectedConcierge} 
            bookingMode={bookingMode} 
            isKYCVerified={isKYCVerified}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirm} 
          />
          <ReassuranceWidget />
        </aside>

      </div>

      {/* Self-KYC Sub-Modal */}
      <AnimatePresence>
        {showKYCModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#053344]/80 backdrop-blur-xl"
              onClick={() => setShowKYCModal(false)}
            />
            <motion.aside 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-lg bg-[#FDF6F1] dark:bg-[#0A0F1D] shadow-luxury rounded-[48px] border border-white/10 dark:border-white/5 overflow-hidden"
            >
              <div className="p-8 border-b border-[#0E5A75]/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0983B0]/10 flex items-center justify-center text-[#0983B0]">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#053344] dark:text-white tracking-tight">Guest Verification</h3>
                    <p className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-white/60 uppercase tracking-widest italic">Airbnb-style Trust Secure</p>
                  </div>
                </div>
                <button onClick={() => setShowKYCModal(false)} className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-[#0E5A75] dark:text-white"><ArrowRight className="rotate-45" size={24} /></button>
              </div>
              <div className="p-10">
                <AadhaarOTPVerification 
                  onVerified={(data: AadhaarData) => {
                    setKycData(data);
                    setIsKYCVerified(true);
                    setGuestName(data.fullName);
                    setTimeout(() => setShowKYCModal(false), 2000);
                  }}
                />
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Sticky Bottom CTA & Expandable Summary */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Expandable Summary Sheet */}
        <div 
          className={cn(
            "absolute bottom-full left-0 right-0 bg-[#053344] rounded-t-3xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
            mobileSummaryOpen ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="p-6 max-h-[70vh] overflow-y-auto hide-scrollbar pb-10">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" onClick={() => setMobileSummaryOpen(false)} />
             <BookingSummaryContent costs={costs} selectedConcierge={selectedConcierge} isKYCVerified={isKYCVerified} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="bg-white dark:bg-[#0E5A75] border-t border-black/10 dark:border-white/10 p-4 pb-safe flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.1)] relative z-10">
          <div className="flex-1" onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}>
            <p className="text-[10px] font-black text-[#053344]/50 dark:text-white/50 uppercase tracking-widest mb-1 flex items-center gap-1">
              Total <ChevronUp size={12} className={cn("transition-transform", mobileSummaryOpen && "rotate-180")} />
            </p>
            <p className="text-xl font-black text-[#053344] dark:text-white">₹{costs.total.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => setIsSuccess(true)}
            className="flex-1 py-4 rounded-2xl bg-[#053344] dark:bg-[#FCBC43] text-white dark:text-[#053344] text-sm font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all"
          >
            {bookingMode === "instant" ? "Pay Now" : "Request"}
          </button>
        </div>
      </div>

    </div>
  );
}

// --- Sub Components ---

function InputGroup({ label, placeholder, icon: Icon, value, onChange }: { label: string, placeholder: string, icon?: React.ElementType, value?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-3 relative group">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75] dark:text-[#FCBC43] ml-1">{label}</label>
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0E5A75]/40 dark:text-white/40 group-focus-within:text-[#0E5A75] dark:group-focus-within:text-[#FCBC43] transition-colors" />}
        <input 
          type="text" 
          value={value}
          onChange={onChange}
          placeholder={placeholder} 
          className={cn(
            "w-full py-4 rounded-2xl bg-white/50 dark:bg-[#0E5A75]/20 border border-[#0E5A75]/10 dark:border-white/10 focus:border-[#0E5A75]/40 dark:focus:border-[#FCBC43]/40 outline-none text-sm font-bold text-[#053344] dark:text-white placeholder:text-[#053344]/30 dark:placeholder:text-white/30 transition-all",
            Icon ? "pl-12 pr-6" : "px-6"
          )}
        />
      </div>
    </div>
  );
}

// AddOnCard is replaced by the motion cards in ConciergeUpsell.tsx

function PaymentTab({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: React.ElementType }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-4 md:p-5 rounded-2xl border transition-all duration-300 min-w-[90px] snap-center",
        active 
          ? "bg-[#0E5A75] dark:bg-[#FCBC43] border-[#0E5A75] dark:border-[#FCBC43] text-white dark:text-[#053344] shadow-xl shadow-[#0E5A75]/20 dark:shadow-[#FCBC43]/20 scale-105" 
          : "bg-white/50 dark:bg-white/5 border-transparent text-[#0E5A75] dark:text-white/60 hover:bg-white dark:hover:bg-white/10"
      )}
    >
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
    </button>
  );
}

function SummaryItem({ icon: Icon, label, value, subValue }: { icon: React.ElementType, label: string, value: string, subValue?: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 mt-1 shrink-0 rounded-xl bg-white/5 flex items-center justify-center text-white/60"><Icon size={18} /></div>
      <div>
        <p className="text-[9px] font-black text-[#FCBC43] uppercase tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
        {subValue && <p className="text-xs text-white/50 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}

function BookingSummaryContent({ costs, selectedConcierge, isKYCVerified }: { costs: Costs, selectedConcierge: Record<string, unknown>, isKYCVerified: boolean }) {
  const selectedCount = Object.keys(selectedConcierge).length;
  return (
    <div className="text-white">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0"><Building size={28} className="text-white" /></div>
        <div>
          <h3 className="text-2xl font-black tracking-tight leading-none mb-2">Grand Heritage Resort</h3>
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest flex items-center gap-1">
            <MapPin size={10} /> Udaipur, Rajasthan
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <SummaryItem icon={Calendar} label="Duration" value="May 15 - May 19 • 4 Nights" />
        <SummaryItem icon={Sparkles} label="Room Selected" value="Royal Heritage Suite" subValue="1 x King Bed, Lake View" />
        <SummaryItem icon={Coffee} label="Meal Plan" value="Continental Plan (CP)" subValue="Breakfast Included" />
        <SummaryItem icon={Users} label="Guests" value="2 Adults, 0 Children" />
        <SummaryItem 
          icon={ShieldCheck} 
          label="KYC Status" 
          value={isKYCVerified ? "Identity Verified" : "Pending Verification"} 
          subValue={isKYCVerified ? "Verified Guest Badge Active" : "Blocked at Check-in"} 
        />
      </div>

      <div className="mt-10 pt-10 border-t border-white/10 space-y-5">
        <div className="flex justify-between items-center text-white/80">
          <span className="text-xs font-black uppercase tracking-widest">Base Rate (4 Nights)</span>
          <span className="text-sm font-bold">₹{costs.base.toLocaleString()}</span>
        </div>
        {selectedCount > 0 && (
          <div className="flex justify-between items-start text-[#FCBC43]">
            <span className="text-xs font-black uppercase tracking-widest mt-1">Stay Enhancements</span>
            <div className="text-right">
              <span className="text-sm font-bold block">+ ₹{costs.concierge.toLocaleString()}</span>
              <span className="text-[9px] text-[#FCBC43]/60 uppercase tracking-widest">{selectedCount} Services</span>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center text-white/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest">GST & Taxes</span>
            <Info size={12} className="text-white/40 cursor-pointer hover:text-white" />
          </div>
          <span className="text-sm font-bold">₹{costs.gst.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-end pt-6 border-t border-white/10">
          <div>
            <p className="text-[10px] font-black text-[#FCBC43] uppercase tracking-widest mb-1">Total Payable</p>
            <p className="text-4xl font-black text-white">₹{costs.total.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-[#159665] uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
              <ShieldCheck size={12} /> Secure
            </p>
            <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Taxes Included</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingSummaryCard({ costs, selectedConcierge, bookingMode, onConfirm, isKYCVerified, isSubmitting }: { costs: Costs, selectedConcierge: Record<string, unknown>, bookingMode: BookingMode, onConfirm: () => void, isKYCVerified: boolean, isSubmitting?: boolean }) {
  return (
    <GlassCard className="p-0 border-none bg-transparent shadow-none">
      <div className="bg-[#053344] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full translate-x-16 -translate-y-16 blur-2xl" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 bg-[#159665]/20 px-3 py-1.5 rounded-full border border-[#159665]/30">
            <div className="w-2 h-2 rounded-full bg-[#159665] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#159665]">Rooms Available</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-white/40">ID: BKG-8472</span>
        </div>

        <BookingSummaryContent costs={costs} selectedConcierge={selectedConcierge} isKYCVerified={isKYCVerified} />
      </div>

      <button 
        onClick={onConfirm}
        disabled={isSubmitting}
        className={cn(
          "w-full mt-6 py-6 rounded-[32px] text-white text-lg font-black uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-3",
          isSubmitting ? "opacity-70 cursor-not-allowed" : "",
          bookingMode === "instant" 
            ? "bg-[#0E5A75] shadow-[#0E5A75]/30 hover:bg-[#0A4459]" 
            : "bg-[#FCBC43] text-[#053344] shadow-[#FCBC43]/30 hover:bg-[#F2AE29]"
        )}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            {bookingMode === "instant" ? "Pay & Confirm" : "Request to Book"}
            <ArrowRight size={20} />
          </>
        )}
      </button>

      <div className="mt-6 p-4 rounded-2xl border border-[#0E5A75]/10 dark:border-white/5 bg-white/40 dark:bg-white/5 text-center">
        <p className="text-[10px] font-black text-[#0E5A75]/60 dark:text-white/60 uppercase tracking-widest flex items-center justify-center gap-2">
          <Receipt size={14} /> Free cancellation before May 13
        </p>
      </div>
    </GlassCard>
  );
}

function ReassuranceWidget() {
  return (
    <GlassCard className="bg-white/60 dark:bg-white/5 border-[#0E5A75]/10 dark:border-white/5 p-6 flex flex-col gap-4">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#159665]/10 flex items-center justify-center text-[#159665] shrink-0"><Star size={18} /></div>
        <div>
           <h4 className="text-[11px] font-black text-[#053344] dark:text-white uppercase tracking-widest mb-1">Superhost Property</h4>
           <p className="text-[10px] font-bold text-[#053344]/60 dark:text-white/60 leading-relaxed">Highly rated host committed to providing great stays for guests.</p>
        </div>
      </div>
      <div className="h-px w-full bg-[#0E5A75]/5 dark:bg-white/5" />
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-[#FCBC43]/10 flex items-center justify-center text-[#FCBC43] shrink-0"><ShieldCheck size={18} /></div>
        <div>
           <h4 className="text-[11px] font-black text-[#053344] dark:text-white uppercase tracking-widest mb-1">Home4Stay Promise</h4>
           <p className="text-[10px] font-bold text-[#053344]/60 dark:text-white/60 leading-relaxed">Bookings are protected against host cancellations and listing inaccuracies.</p>
        </div>
      </div>
    </GlassCard>
  );
}

function SuccessView({ mode }: { mode: BookingMode }) {
  return (
    <div className="min-h-screen bg-[#053344] flex flex-col items-center justify-center text-center p-6 md:p-10 animate-in fade-in duration-1000 relative overflow-hidden">
      
      {/* Cinematic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#0E5A75]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-[#159665]/10 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#159665] flex items-center justify-center text-white mb-8 md:mb-10 shadow-[0_0_50px_rgba(21,150,101,0.4)] relative">
          <CheckCircle2 size={48} className="md:w-[64px] md:h-[64px] fill-white/20" />
          <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none mb-6">
          {mode === "instant" ? "Stay Confirmed." : "Request Sent."}
        </h1>
        
        <p className="text-lg md:text-xl font-medium text-white/70 max-w-2xl mx-auto leading-relaxed mb-12 italic">
          {mode === "instant" 
            ? `"Congratulations! Your luxury escape to Grand Heritage Resort is secured. We've sent the invoice and check-in details to your email."`
            : `"Your request has been sent to the host. They will review it within 24 hours. You won't be charged until it's approved."`
          }
        </p>

        {mode === "instant" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 w-full mb-12 md:mb-16">
            <SuccessCard icon={MessageCircle} label="WhatsApp Support" value="Active Concierge" />
            <SuccessCard icon={Navigation} label="Route Guidance" value="Interactive Map" />
            <SuccessCard icon={PlaneTakeoff} label="Arrival Setup" value="Pickup Scheduled" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto">
          {mode === "instant" && (
            <button className="px-8 md:px-10 py-4 md:py-5 rounded-[24px] border-2 border-white/20 text-white text-xs md:text-sm font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all w-full sm:w-auto">
              Download Invoice
            </button>
          )}
          <button 
            onClick={() => window.location.href = '/'}
            className="px-8 md:px-10 py-4 md:py-5 rounded-[24px] bg-[#FCBC43] text-[#053344] text-xs md:text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-[#FCBC43]/20 hover:bg-[#F2AE29] transition-all w-full sm:w-auto"
          >
            Explore More
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessCard({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
  return (
    <div className="p-6 md:p-8 rounded-[24px] md:rounded-[32px] bg-white/5 border border-white/10 text-white text-center space-y-3 hover:bg-white/10 transition-colors cursor-pointer group">
      <Icon size={28} className="mx-auto text-[#FCBC43] md:w-[32px] md:h-[32px] group-hover:scale-110 transition-transform" />
      <p className="text-[9px] md:text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{label}</p>
      <p className="text-xs md:text-sm font-bold">{value}</p>
    </div>
  );
}

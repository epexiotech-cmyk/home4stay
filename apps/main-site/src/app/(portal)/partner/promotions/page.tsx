"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket, 
  Tag, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  RefreshCcw, 
  Zap,
  TrendingUp,
  Percent,
  IndianRupee
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export interface PromotionOffer {
  id: string;
  title: string;
  description: string;
  offerType: string;
  couponCode: string;
  discountType: 'percentage' | 'fixed' | string;
  discountValue: number;
  minimumBookingAmount: number;
  endDate: string | Date;
  isFeatured: boolean;
  isActive: boolean;
}

export default function PartnerPromotionsPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<PromotionOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    couponCode: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minimumBookingAmount: "",
    startDate: "",
    endDate: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!propertyId) {
      alert("Property ID not found.");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        propertyId,
        title: formData.title,
        couponCode: formData.couponCode,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minimumBookingAmount: Number(formData.minimumBookingAmount),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: true
      };
      
      const res = await fetch("/api/property/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setIsAdding(false);
        setFormData({ title: "", couponCode: "", discountType: "PERCENTAGE", discountValue: "", minimumBookingAmount: "", startDate: "", endDate: "" });
        fetchOffers();
      } else {
        const err = await res.json();
        alert("Failed to create offer: " + JSON.stringify(err));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const propertyId = user?.propertyId;

  const fetchOffers = useCallback(async () => {
    if (!propertyId) return;
    try {
      const res = await fetch(`/api/property/promotions?propertyId=${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setOffers(data);
      }
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOffers(), 0);
    return () => clearTimeout(timer);
  }, [fetchOffers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      const res = await fetch(`/api/property/promotions?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchOffers();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/property/promotions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current })
      });
      if (res.ok) fetchOffers();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCcw className="animate-spin text-[#0E5A75]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none mb-3 italic">Campaign Manager</h1>
          <p className="text-sm font-bold text-[#0E5A75]/60 uppercase tracking-widest flex items-center gap-2">
            <Zap size={14} className="text-[#FCBC43]" />
            Active Promotions: <span className="text-[#0E5A75]">{offers.filter(o => o.isActive).length} Campaigns Live</span>
          </p>
        </div>
        
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#0E5A75] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0A4459] transition-all shadow-xl shadow-[#0E5A75]/20"
        >
          <Plus size={18} />
          Launch Campaign
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Total Revenue via Offers" value="₹1.2L" icon={TrendingUp} color="#159665" />
        <MetricCard label="Average Discount" value="12%" icon={Percent} color="#0983B0" />
        <MetricCard label="Active Coupons" value={offers.filter(o => o.isActive).length} icon={Ticket} color="#FCBC43" />
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {offers.length > 0 ? offers.map((offer) => (
          <OfferCard 
            key={offer.id} 
            offer={offer} 
            onDelete={handleDelete}
            onToggle={handleToggleActive}
          />
        )) : (
          <div className="col-span-full p-32 text-center space-y-4 bg-white dark:bg-white/5 rounded-[48px] border border-dashed border-[#0E5A75]/20">
            <div className="w-20 h-20 bg-[#0E5A75]/5 rounded-full flex items-center justify-center mx-auto text-[#0E5A75]/20">
              <Tag size={40} />
            </div>
            <p className="text-sm font-black text-[#0E5A75]/40 uppercase tracking-widest">No promotions launched yet.</p>
          </div>
        )}
      </div>

      {/* Create Modal (Simplified for demo) */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-white dark:bg-[#0b1220] rounded-[48px] overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="p-10 border-b border-black/5 flex items-center justify-between bg-[#0E5A75]/[0.02]">
                 <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight uppercase italic">New Promotion</h2>
                 <button onClick={() => setIsAdding(false)} className="p-2 text-[#0E5A75]/40 hover:text-[#0E5A75] transition-colors"><RefreshCcw size={20} /></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-6">
                    <Input label="Campaign Title" placeholder="e.g. Summer Escape" value={formData.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, title: e.target.value})} />
                    <Input label="Coupon Code" placeholder="e.g. SUMMER20" value={formData.couponCode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, couponCode: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 ml-4">Type</label>
                       <select 
                         className="w-full px-6 py-4 rounded-2xl bg-[#0E5A75]/5 border border-black/5 text-sm font-bold text-[#0E5A75] focus:outline-none"
                         value={formData.discountType}
                         onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                       >
                         <option value="PERCENTAGE">Percentage</option>
                         <option value="FLAT">Flat Discount</option>
                       </select>
                    </div>
                    <Input label="Value" placeholder="e.g. 15" value={formData.discountValue} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, discountValue: e.target.value})} />
                    <Input label="Min. Spend" placeholder="e.g. 5000" value={formData.minimumBookingAmount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, minimumBookingAmount: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <Input label="Start Date" type="date" value={formData.startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, startDate: e.target.value})} />
                    <Input label="End Date" type="date" value={formData.endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, endDate: e.target.value})} />
                 </div>
                 <button 
                   onClick={handleCreate}
                   disabled={isSubmitting}
                   className="w-full py-5 rounded-[24px] bg-[#159665] text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50"
                 >
                    {isSubmitting ? "Activating..." : "Activate Campaign"}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="p-8 rounded-[40px] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 shadow-luxury-sm group hover:border-[#0E5A75]/20 transition-all duration-500">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: color }}>
          <Icon size={18} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]/40">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter italic">{value}</span>
      </div>
    </div>
  );
}

function OfferCard({ offer, onDelete, onToggle }: { offer: PromotionOffer; onDelete: (id: string) => void; onToggle: (id: string, active: boolean) => void }) {
  const isExpired = new Date() > new Date(offer.endDate);

  return (
    <div className={cn(
      "p-8 rounded-[48px] border transition-all duration-500 relative group overflow-hidden",
      offer.isActive && !isExpired 
        ? "bg-white dark:bg-white/5 border-black/5 dark:border-white/10 shadow-luxury-sm" 
        : "bg-black/[0.02] dark:bg-white/[0.02] border-dashed border-black/10 grayscale"
    )}>
      {/* Background Decor */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#0E5A75]/5 rounded-full blur-3xl group-hover:bg-[#0E5A75]/10 transition-all" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-6 flex-1">
          <div className="flex items-center gap-3">
             <div className="px-4 py-1.5 rounded-full bg-[#FCBC43]/10 text-[#FCBC43] text-[10px] font-black uppercase tracking-widest border border-[#FCBC43]/20">
               {offer.offerType.replace('_', ' ')}
             </div>
             {offer.isFeatured && (
               <div className="px-4 py-1.5 rounded-full bg-[#159665]/10 text-[#159665] text-[10px] font-black uppercase tracking-widest border border-[#159665]/20">
                 Featured
               </div>
             )}
          </div>

          <div>
             <h3 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight uppercase mb-2 italic underline decoration-[#159665]/20 decoration-2 underline-offset-4">{offer.title}</h3>
             <p className="text-xs font-bold text-[#0E5A75]/60 dark:text-white/40 uppercase tracking-widest leading-relaxed">{offer.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-3xl bg-[#0E5A75]/5 border border-[#0E5A75]/10">
                <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Coupon Code</p>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-black text-[#0E5A75] tracking-[0.2em]">{offer.couponCode}</span>
                   <Ticket size={14} className="text-[#0E5A75]/30" />
                </div>
             </div>
             <div className="p-4 rounded-3xl bg-[#159665]/5 border border-[#159665]/10">
                <p className="text-[10px] font-black text-[#159665]/40 uppercase tracking-widest mb-1">Discount</p>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-black text-[#159665] tracking-tight">
                     {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `₹${offer.discountValue}`} OFF
                   </span>
                   {offer.discountType === 'percentage' ? <Percent size={14} className="text-[#159665]/30" /> : <IndianRupee size={14} className="text-[#159665]/30" />}
                </div>
             </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
             <div className="flex items-center gap-2 text-[10px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">
                <Calendar size={14} />
                <span>Expires: {format(new Date(offer.endDate), "MMM dd, yyyy")}</span>
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">
                <CheckCircle2 size={14} />
                <span>Min: ₹{offer.minimumBookingAmount}</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
           <button 
             onClick={() => onToggle(offer.id, offer.isActive)}
             className={cn(
               "p-4 rounded-2xl border transition-all shadow-sm",
               offer.isActive ? "bg-[#159665] text-white border-[#159665]" : "bg-white text-[#0E5A75]/40 border-black/5"
             )}
           >
             <CheckCircle2 size={20} />
           </button>
           <button 
             className="p-4 rounded-2xl border border-black/5 bg-white text-[#0E5A75]/20 hover:text-[#0E5A75] hover:border-[#0E5A75]/20 transition-all shadow-sm"
           >
             <RefreshCcw size={20} />
           </button>
           <button 
             onClick={() => onDelete(offer.id)}
             className="p-4 rounded-2xl border border-red-500/10 bg-white text-red-500/20 hover:text-red-500 hover:bg-red-500/5 transition-all shadow-sm"
           >
             <Trash2 size={20} />
           </button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", placeholder }: { label: string; type?: string; placeholder?: string }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 ml-4">{label}</label>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full px-8 py-4 rounded-2xl bg-[#0E5A75]/5 border border-black/5 text-sm font-bold text-[#053344] focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 placeholder:text-[#0E5A75]/30"
      />
    </div>
  );
}

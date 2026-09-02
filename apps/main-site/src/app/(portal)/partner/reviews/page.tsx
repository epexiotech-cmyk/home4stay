"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  Reply, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  User,
  ShieldCheck,
  Search,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

export interface Review {
  id: string;
  guestName: string;
  guestAvatar?: string;
  isVerified: boolean;
  createdAt: string | Date;
  stayType: string;
  roomType: string;
  rating: number;
  title: string;
  message: string;
  responseMessage?: string;
  responseAt?: string | Date;
  isPublished: boolean;
  isFeatured: boolean;
}

export interface ReviewStats {
  averageRating: string | number;
  totalReviews: number;
  responseRate?: number;
}

export default function PartnerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const propertyId = user?.propertyId || "shivay-resort-101";

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/property/reviews?propertyId=${propertyId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    const timer = setTimeout(() => fetchReviews(), 0);
    return () => clearTimeout(timer);
  }, [fetchReviews]);

  const handleToggleStatus = async (reviewId: string, currentStatus: boolean, field: 'isPublished' | 'isFeatured') => {
    setIsUpdating(reviewId);
    try {
      const res = await fetch("/api/property/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          [field]: !currentStatus
        })
      });
      if (res.ok) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to update review:", err);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsUpdating(reviewId);
    try {
      const res = await fetch("/api/property/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId,
          responseMessage: replyText
        })
      });
      if (res.ok) {
        setReplyingTo(null);
        setReplyText("");
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to reply to review:", err);
    } finally {
      setIsUpdating(null);
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
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none mb-3 italic underline decoration-[#159665]/20">Reputation Center</h1>
          <p className="text-sm font-bold text-[#0E5A75]/60 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-[#159665]" />
            Your Guest Sentiments: <span className="text-[#0E5A75]">{stats?.averageRating} / 5.0 Average</span>
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard label="Total Reviews" value={stats?.totalReviews} icon={MessageSquare} color="#0E5A75" />
        <StatCard label="Average Rating" value={stats?.averageRating} icon={Star} color="#FCBC43" suffix="/ 5.0" />
        <StatCard label="Response Rate" value={`${stats?.responseRate}%`} icon={Reply} color="#159665" />
        <StatCard label="Verified Stays" value="100%" icon={ShieldCheck} color="#0983B0" />
      </div>

      {/* Reviews List */}
      <div className="bg-white dark:bg-[#0b1220] rounded-[48px] border border-black/5 dark:border-white/5 shadow-luxury-sm overflow-hidden">
        <div className="p-10 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-[#0E5A75]/[0.02]">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-black text-[#053344] dark:text-white tracking-tight uppercase">Guest Feedback</h2>
            <div className="flex items-center gap-4">
               <FilterTab label="All" active count={reviews.length} />
               <FilterTab label="Needs Reply" count={reviews.filter(r => !r.responseMessage).length} />
               <FilterTab label="Featured" count={reviews.filter(r => r.isFeatured).length} />
            </div>
          </div>
          <div className="relative">
             <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0E5A75]/30" />
             <input 
               placeholder="Search guest name..."
               className="pl-12 pr-6 py-3 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-xs font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 w-64"
             />
          </div>
        </div>

        <div className="divide-y divide-black/5 dark:divide-white/5">
          {reviews.length > 0 ? reviews.map((review) => (
            <ReviewItem 
              key={review.id} 
              review={review} 
              onToggleStatus={handleToggleStatus}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              handleReply={handleReply}
              isUpdating={isUpdating === review.id}
            />
          )) : (
            <div className="p-32 text-center space-y-4">
              <div className="w-20 h-20 bg-[#0E5A75]/5 rounded-full flex items-center justify-center mx-auto text-[#0E5A75]/20">
                <MessageSquare size={40} />
              </div>
              <p className="text-sm font-black text-[#0E5A75]/40 uppercase tracking-widest">No reviews found for this property.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, suffix = "" }: { label: string; value: string | number | undefined; icon: React.ElementType; color: string; suffix?: string }) {
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
        {suffix && <span className="text-sm font-bold text-[#0E5A75]/40 uppercase">{suffix}</span>}
      </div>
    </div>
  );
}

function FilterTab({ label, active, count }: { label: string; active?: boolean; count: number }) {
  return (
    <button className={cn(
      "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border",
      active 
        ? "bg-[#0E5A75] text-white border-[#0E5A75] shadow-lg shadow-[#0E5A75]/20" 
        : "bg-white dark:bg-white/5 text-[#0E5A75]/40 border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20"
    )}>
      {label} <span className="ml-1 opacity-40">({count})</span>
    </button>
  );
}

function ReviewItem({ review, onToggleStatus, replyingTo, setReplyingTo, replyText, setReplyText, handleReply, isUpdating }: {
  review: Review;
  onToggleStatus: (id: string, currentStatus: boolean, field: 'isPublished' | 'isFeatured') => void;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handleReply: (id: string) => void;
  isUpdating: boolean;
}) {
  return (
    <div className={cn(
      "p-10 transition-colors group",
      review.isFeatured ? "bg-[#FCBC43]/[0.02]" : "hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
    )}>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[24px] bg-[#0E5A75]/5 flex items-center justify-center text-[#0E5A75] shadow-inner relative overflow-hidden">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             {review.guestAvatar ? <img src={review.guestAvatar} alt={`${review.guestName} Avatar`} className="w-full h-full object-cover" /> : <User size={24} />}
             {review.isVerified && (
               <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#159665] border-2 border-white dark:border-[#0b1220] flex items-center justify-center text-white">
                 <ShieldCheck size={12} />
               </div>
             )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-black text-[#053344] dark:text-white tracking-tight uppercase italic">{review.guestName}</h3>
              <div className="w-1 h-1 rounded-full bg-black/10" />
              <span className="text-[10px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">{format(new Date(review.createdAt), "MMM dd, yyyy")}</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex gap-0.5 text-[#FCBC43]">
                 {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />)}
               </div>
               <span className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest">{review.stayType} Trip • {review.roomType}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onToggleStatus(review.id, review.isFeatured, 'isFeatured')}
            className={cn(
              "p-3 rounded-2xl border transition-all flex items-center gap-2",
              review.isFeatured 
                ? "bg-[#FCBC43]/10 border-[#FCBC43]/20 text-[#FCBC43]" 
                : "border-black/5 text-[#0E5A75]/20 hover:border-[#FCBC43]/20 hover:text-[#FCBC43]"
            )}
            title="Feature on Website"
          >
            <Sparkles size={18} />
          </button>
          <button 
            onClick={() => onToggleStatus(review.id, review.isPublished, 'isPublished')}
            className={cn(
              "p-3 rounded-2xl border transition-all flex items-center gap-2",
              review.isPublished 
                ? "bg-[#159665]/10 border-[#159665]/20 text-[#159665]" 
                : "bg-red-500/10 border-red-500/20 text-red-500"
            )}
            title={review.isPublished ? "Visible on Site" : "Hidden"}
          >
            {review.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
      </div>

      <div className="pl-22 space-y-6">
        <div>
           <h4 className="text-base font-black text-[#053344] dark:text-white uppercase mb-2 tracking-tight italic">&quot;{review.title}&quot;</h4>
           <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60 leading-relaxed italic">{review.message}</p>
        </div>

        {review.responseMessage ? (
          <div className="p-8 rounded-[32px] bg-[#0E5A75]/5 dark:bg-white/[0.02] border border-[#0E5A75]/10 relative group-hover:border-[#0E5A75]/20 transition-all">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 rounded-xl bg-[#0E5A75] flex items-center justify-center text-white">
                 <Reply size={14} />
               </div>
               <span className="text-[10px] font-black text-[#0E5A75] uppercase tracking-[0.2em]">Management Response</span>
               <div className="w-1 h-1 rounded-full bg-[#0E5A75]/20" />
               <span className="text-[10px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">{review.responseAt ? format(new Date(review.responseAt), "MMM dd") : ""}</span>
            </div>
            <p className="text-sm font-medium text-[#0E5A75]/70 dark:text-white/50 leading-relaxed italic">{review.responseMessage}</p>
          </div>
        ) : (
          replyingTo === review.id ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <textarea 
                placeholder="Write your response to this guest..."
                className="w-full p-6 rounded-[32px] bg-[#0E5A75]/5 border border-[#0E5A75]/20 text-sm font-medium text-[#053344] focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/30 min-h-[120px] resize-none italic"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleReply(review.id)}
                  disabled={isUpdating}
                  className="px-8 py-3 rounded-2xl bg-[#0E5A75] text-white font-black text-[10px] uppercase tracking-widest hover:bg-[#0A4459] transition-all flex items-center gap-2"
                >
                  {isUpdating ? <RefreshCcw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  Publish Response
                </button>
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="px-8 py-3 rounded-2xl border border-black/5 text-[#0E5A75]/40 font-black text-[10px] uppercase tracking-widest hover:bg-black/5 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ) : (
            <button 
              onClick={() => setReplyingTo(review.id)}
              className="flex items-center gap-2 text-[#0E5A75] hover:text-[#0983B0] transition-colors"
            >
              <Reply size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Respond to Feedback</span>
            </button>
          )
        )}
      </div>
    </div>
  );
}

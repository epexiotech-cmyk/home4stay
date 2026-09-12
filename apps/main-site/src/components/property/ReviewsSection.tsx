"use client";

import { DEFAULT_FALLBACK_IMAGE, getValidImageUrl } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, Reply, RefreshCcw, User } from "lucide-react";
import { format } from "date-fns";

export interface Review {
  id: string;
  guestName: string;
  guestAvatar?: string;
  isVerified: boolean;
  createdAt: string | Date;
  stayType: string;
  rating: number;
  title: string;
  message: string;
  responseMessage?: string;
}

export interface ReviewStats {
  averageRating: string | number;
  totalReviews: number;
}

interface ReviewsSectionProps {
  propertyId: string;
}

export default function ReviewsSection({ propertyId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/property/reviews?propertyId=${propertyId}&isPublished=true`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews);
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch public reviews:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
  }, [propertyId]);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <RefreshCcw className="animate-spin text-[#0E5A75]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[#FCBC43]">
             <Star size={24} fill="currentColor" strokeWidth={1} />
             <span className="text-3xl font-serif text-[var(--text)] tracking-tight mt-1">{stats?.averageRating || "0.0"}</span>
          </div>
          <div className="w-px h-8 bg-[var(--border)] hidden sm:block" />
          <span className="text-sm font-medium text-[var(--text-muted)] tracking-widest uppercase mt-1">{stats?.totalReviews || 0} Reviews</span>
        </div>
        <button className="text-[11px] font-medium uppercase tracking-widest text-theme-primary hover:text-theme-primary/80 transition-all">
          Write a Review
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16">
        {reviews.length > 0 ? reviews.map((review) => (
          <div key={review.id} className="space-y-6 group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--text-subtle)] relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {getValidImageUrl(review.guestAvatar) ? <img src={getValidImageUrl(review.guestAvatar) || DEFAULT_FALLBACK_IMAGE} alt={`${review.guestName} Avatar`} className="w-full h-full object-cover rounded-full" /> : <User size={20} strokeWidth={1.5} />}
                {review.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-theme-primary flex items-center justify-center text-white border-2 border-[var(--bg)]">
                    <ShieldCheck size={8} strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-[15px] font-medium text-[var(--text)] tracking-tight">{review.guestName}</h4>
                <p className="text-[11px] font-light text-[var(--text-subtle)] uppercase tracking-widest mt-0.5">
                  {format(new Date(review.createdAt), "MMMM yyyy")} • {review.stayType} Trip
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[#FCBC43]">
                 {[...Array(5)].map((_, i) => (
                   <Star key={`star-${i}`} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                 ))}
              </div>
              <h5 className="text-[15px] font-medium text-[var(--text)]">&quot;{review.title}&quot;</h5>
              <p className="text-[14px] font-light text-[var(--text-muted)] leading-relaxed">
                {review.message}
              </p>
            </div>

            {review.responseMessage && (
              <div className="pl-6 border-l-2 border-[#159665]/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Reply size={12} className="text-[#159665]" />
                  <span className="text-[10px] font-black text-[#159665] uppercase tracking-widest">Management Response</span>
                </div>
                <p className="text-xs font-medium text-[#0E5A75]/50 dark:text-white/40 italic leading-relaxed">
                  {review.responseMessage}
                </p>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-2 py-20 text-center bg-[#0E5A75]/5 rounded-[40px] border border-dashed border-[#0E5A75]/10">
            <p className="text-sm font-black text-[#0E5A75]/40 uppercase tracking-widest">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
}

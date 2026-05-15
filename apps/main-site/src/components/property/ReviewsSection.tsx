"use client";

import React from "react";
import { Star, ThumbsUp } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    location: string;
  };
  rating: number;
  date: string;
  comment: string;
}

const reviews: Review[] = [
  {
    id: "1",
    user: {
      name: "Ananya Sharma",
      avatar: "https://i.pravatar.cc/150?u=ananya",
      location: "Mumbai, India"
    },
    rating: 5,
    date: "March 2026",
    comment: "Absolutely breathtaking! The view from the balcony is even better than the photos. The staff was incredibly helpful and made our stay very special."
  },
  {
    id: "2",
    user: {
      name: "James Wilson",
      avatar: "https://i.pravatar.cc/150?u=james",
      location: "London, UK"
    },
    rating: 5,
    date: "February 2026",
    comment: "One of the best villas I've ever stayed in. The attention to detail is remarkable. Highly recommend for anyone looking for a premium experience."
  }
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-24 border-b border-[var(--border)]">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-3">
          <Star size={24} fill="currentColor" className="text-theme-primary" />
          4.8 · 12 reviews
        </h2>
        <button className="text-sm font-bold underline text-[var(--text)] hover:text-theme-primary transition-colors">Show all reviews</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
        {reviews.map((review) => (
          <div key={review.id} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[var(--border)]">
                <OptimizedImage src={review.user.avatar} alt={review.user.name} fill className="object-cover" sizes="48px" />
              </div>
              <div>
                <h4 className="font-bold text-[var(--text)]">{review.user.name}</h4>
                <p className="text-[var(--text-muted)] text-xs font-medium">{review.user.location} · {review.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-0.5 text-primary">
               {[...Array(5)].map((_, i) => (
                 <Star key={`review-${review.id}-star-${i}`} size={12} fill={review.rating > i ? "currentColor" : "transparent"} />
               ))}
            </div>

            <p className="text-[var(--text-muted)] leading-relaxed text-sm md:text-base">
              {review.comment}
            </p>

            <button className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
               <ThumbsUp size={14} />
               Helpful
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

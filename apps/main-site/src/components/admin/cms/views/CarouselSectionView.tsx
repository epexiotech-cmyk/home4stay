"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";

interface CarouselCard {
  id: string;
  image: string;
  badge: string;
  title: string;
  description: string;
  isActive?: boolean;
  sortOrder?: number;
}

interface CarouselSectionViewProps {
  cards?: CarouselCard[];
}

export default function CarouselSectionView({ cards: propCards }: CarouselSectionViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Derive active deck array items
  const baseCards = Array.isArray(propCards) ? propCards : [];
  const activeCards = baseCards
    .filter((c: CarouselCard) => c.isActive !== false)
    .sort((a: CarouselCard, b: CarouselCard) => (a.sortOrder || 0) - (b.sortOrder || 0));

  // Fallback demo cards if empty setup
  const renderCards: CarouselCard[] = activeCards.length > 0 ? activeCards : [
    {
      id: "demo-card",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
      badge: "ARCHITECTURE",
      title: "Merged seamlessly with horizon",
      description: "wrapped in soft warm gold pathways.",
    }
  ];

  return (
    <div className="p-6 bg-[#051E28]/60 space-y-4 flex-shrink-0 select-none">
      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1 flex items-center justify-between">
        <span>Interactive Carousel Deck View</span>
        <span className="text-[#159665] lowercase font-mono">({renderCards.length} live)</span>
      </p>

      <div
        className="relative aspect-[4/5] w-full max-w-[240px] mx-auto select-none group cursor-pointer"
        onClick={() => setActiveIndex((prev) => (prev + 1) % renderCards.length)}
      >
        {renderCards.map((card: CarouselCard, idx: number) => {
          const relIdx = (idx - activeIndex + renderCards.length) % renderCards.length;
          const isTop = relIdx === 0;
          const isSec = relIdx === 1;

          if (relIdx > 2) return null;

          return (
            <div
              key={card.id || idx}
              className={`absolute inset-0 rounded-2xl overflow-hidden border border-white/10 transition-all duration-500 ease-out shadow-xl ${
                isTop
                  ? "z-30 scale-100 translate-y-0 rotate-0 opacity-100"
                  : isSec
                  ? "z-20 scale-95 -translate-y-2 translate-x-4 rotate-3 opacity-80"
                  : "z-10 scale-90 -translate-y-4 -translate-x-3 -rotate-2 opacity-40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.image} alt={card.badge} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

              <div className="absolute bottom-3 left-3 p-2.5 bg-black/60 rounded-xl border border-white/10 backdrop-blur-md max-w-[180px]">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#FCBC43]">{card.badge}</p>
                <p className="text-[10px] font-bold text-white truncate">{card.title}</p>
                <p className="text-[8px] text-white/70 truncate">{card.description}</p>
              </div>

              {isTop && renderCards.length > 1 && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[8px] font-bold text-white flex items-center gap-1">
                  <RefreshCw size={8} /> Shuffle
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

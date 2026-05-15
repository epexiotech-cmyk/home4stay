"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Layers, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface NarrativeCardStackProps {
  images: string[];
}

export default function NarrativeCardStack({ images }: NarrativeCardStackProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);

  // Fallback array if images are scarce
  const displayImages = images.length >= 3 ? images : [...images, ...images, ...images].slice(0, 4);

  // Story hints mapped per card index for high-fidelity concierge narratives
  const storyHints = [
    { title: "Architecture", desc: "Designed to merge seamlessly with the mountain horizon." },
    { title: "Interiors", desc: "Curated with raw local materials and ambient warming tones." },
    { title: "Surroundings", desc: "Private access trails wrapped in pristine golden light." },
    { title: "Atmosphere", desc: "Immersive silence tailored for undisturbed rejuvenation." },
  ];

  const handleNext = () => {
    if (animatingOut) return;
    setAnimatingOut(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % displayImages.length);
      setAnimatingOut(false);
    }, 400); // matches slide down transition duration
  };

  return (
    <div className="relative aspect-[4/5] w-full max-w-[538px] mx-auto select-none group">
      {/* Absolute Decorative Glow Layer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#0983B0]/20 to-[#159665]/10 blur-3xl rounded-[64px] pointer-events-none" />

      {displayImages.map((src, idx) => {
        // Calculate dynamic relative index in the shuffling sequence
        const relativeIndex = (idx - activeIndex + displayImages.length) % displayImages.length;
        const isTop = relativeIndex === 0;
        const isSecond = relativeIndex === 1;
        const isThird = relativeIndex === 2;

        // Custom narrative overlay per index
        const hint = storyHints[idx % storyHints.length];

        // Is this card currently animating down out of the deck?
        const isSlidingDown = isTop && animatingOut;

        return (
          <div
            key={idx}
            onClick={handleNext}
            className={cn(
              "absolute inset-0 rounded-[48px] md:rounded-[64px] overflow-hidden shadow-2xl cursor-pointer transition-all duration-500 ease-out border border-white/10 dark:border-white/5",
              // Layout kinetics mimicking stacked poker cards
              isTop && "z-30 scale-100 translate-y-0 rotate-0 opacity-100",
              isSecond && "z-20 scale-[0.95] translate-y-[-20px] translate-x-[32px] rotate-[4deg] opacity-90",
              isThird && "z-10 scale-[0.90] translate-y-[-40px] translate-x-[-28px] rotate-[-4deg] opacity-60",
              relativeIndex > 2 && "z-0 scale-[0.80] translate-y-[-50px] opacity-0 pointer-events-none",
              // Outgoing shuffling animation (sliding down/away)
              isSlidingDown && "translate-y-[110%] rotate-12 scale-90 opacity-0 pointer-events-none"
            )}
          >
            <Image
              src={src}
              alt={`Narrative perspective ${idx + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 538px"
              priority={idx < 2}
              className="object-cover"
            />
            {/* Cinematic Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#053344]/80 via-transparent to-transparent" />

            {/* Absolute Narrative Story Hint Badge */}
            <div className="absolute bottom-8 left-8 p-5 glass-premium rounded-3xl border-white/40 dark:border-white/5 text-[#053344] dark:text-white max-w-[240px]">
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={12} className="text-[#FCBC43]" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#FCBC43]">{hint.title}</p>
              </div>
              <p className="text-xs font-bold leading-relaxed dark:opacity-90">{hint.desc}</p>
            </div>

            {/* Shuffling CTA Helper Badge (Only visible on Top Card) */}
            {isTop && (
              <div className="absolute top-6 right-6 px-4 py-2 rounded-full glass-premium border-white/40 dark:border-white/5 text-[#053344]/80 dark:text-white/80 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Click to Shuffle</span>
                <RefreshCw size={12} className="animate-spin-slow" />
              </div>
            )}
          </div>
        );
      })}

      {/* Interactive Stack Helper Footnote */}
      <div className="absolute -bottom-12 left-0 right-0 flex items-center justify-center gap-2 text-xs font-bold text-[#0E5A75]/50 dark:text-white/40 pointer-events-none">
        <Layers size={14} />
        <span>Interactive Carousel Deck • Click stack to deal next visual</span>
      </div>
    </div>
  );
}

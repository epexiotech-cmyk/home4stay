"use client";

import { DEFAULT_FALLBACK_IMAGE, getValidImageUrl } from "@/lib/utils";
import React from "react";
import OptimizedImage from "@/components/OptimizedImage";
import { Bed, Sofa, BedDouble } from "lucide-react";
import { SleepingArrangement } from "@/properties-data/types";

interface SleepingArrangementsProps {
  arrangements: SleepingArrangement[];
}

export default function SleepingArrangements({ arrangements }: SleepingArrangementsProps) {
  if (!arrangements || arrangements.length === 0) return null;

  return (
    <section className="py-20 border-b border-[var(--border)]">
      <h2 className="text-2xl font-bold text-[var(--text)] mb-8">Where you&apos;ll sleep</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {arrangements.map((item, idx) => (
          <div key={idx} className="border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4 hover:border-[var(--text)] transition-all group shadow-sm hover:shadow-md bg-[var(--bg)]">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
               <OptimizedImage 
                 src={getValidImageUrl(item.image) || DEFAULT_FALLBACK_IMAGE} 
                 alt={item.name} 
                 fill 
                 className="object-cover group-hover:scale-105 transition-transform duration-500"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
            </div>
            
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center text-[var(--text)] group-hover:bg-theme-primary group-hover:text-white transition-all shadow-sm border border-[var(--border)] group-hover:border-theme-primary">
                     {item.beds.toLowerCase().includes('king') || item.beds.toLowerCase().includes('queen') ? (
                       <BedDouble size={20} />
                     ) : item.beds.toLowerCase().includes('sofa') ? (
                       <Sofa size={20} />
                     ) : (
                       <Bed size={20} />
                     )}
                  </div>
                  <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--text)] transition-colors">{item.name}</h3>
               </div>
               <p className="text-[var(--text-muted)] text-sm font-medium pl-[3.25rem]">{item.beds}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { Star, ShieldCheck, Award, MessageCircle, Clock, Globe, Phone } from "lucide-react";
import { Owner } from "@/properties-data/types";
import OptimizedImage from "@/components/OptimizedImage";

interface HostSectionProps {
  owner: Owner;
  whatsapp?: string;
}

export default function HostSection({ owner, whatsapp }: HostSectionProps) {
  if (!owner) return null;

  return (
    <section id="host" className="py-24 border-b border-[var(--border)]">
      <h2 className="text-2xl font-bold text-theme-primary mb-12">Meet your host</h2>
      
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-10 md:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row gap-12 items-start">
           {/* Left: Avatar & Stats */}
           <div className="flex flex-col items-center text-center gap-6 min-w-[200px]">
              <div className="relative w-32 h-32 md:w-40 md:h-40">
                 <OptimizedImage 
                   src={owner.avatar} 
                   alt={owner.name} 
                   fill 
                   className="rounded-full object-cover border-4 border-[var(--bg)] shadow-xl"
                   sizes="(max-width: 768px) 128px, 160px"
                 />
                 {owner.isSuperhost && (
                   <div className="absolute bottom-2 right-2 bg-orange-500 text-white p-2 rounded-full shadow-lg border-2 border-[var(--bg)]">
                      <Award size={20} />
                   </div>
                 )}
              </div>
              
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-theme-primary">{owner.name}</h3>
                 {owner.isSuperhost && (
                   <p className="text-xs font-black text-orange-500 uppercase tracking-widest">Superhost</p>
                 )}
              </div>

              <div className="flex items-center gap-6 py-4 border-y border-[var(--border)] w-full justify-center">
                 <div className="text-center">
                    <p className="text-lg font-black text-[var(--text)]">{owner.reviewsCount}</p>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Reviews</p>
                 </div>
                 <div className="w-px h-8 bg-gray-200" />
                 <div className="text-center">
                    <div className="flex items-center gap-1">
                       <p className="text-lg font-black text-[var(--text)]">{owner.rating}</p>
                       <Star size={12} fill="currentColor" className="text-theme-primary" />
                    </div>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Rating</p>
                 </div>
              </div>
           </div>

           {/* Right: Bio & Message & Meta */}
           <div className="flex-1 space-y-10">
              <div className="space-y-6">
                 <div className="flex items-center gap-2 text-theme-primary font-black text-sm uppercase tracking-widest">
                    <ShieldCheck size={18} />
                    Verified Identity
                 </div>
                 <p className="text-[var(--text-muted)] leading-relaxed text-lg italic">
                    &ldquo;{owner.bio}&rdquo;
                 </p>

                 {/* NEW: Response Time & Languages */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    {owner.responseTime && (
                      <div className="flex items-center gap-3 bg-[var(--card-solid)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
                         <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg">
                            <Clock size={18} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Response Time</p>
                            <p className="text-sm font-bold text-[var(--text)]">Responds {owner.responseTime} ⚡</p>
                         </div>
                      </div>
                    )}
                    {owner.languages && (
                      <div className="flex items-center gap-3 bg-[var(--card-solid)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
                         <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
                            <Globe size={18} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">Languages</p>
                            <p className="text-sm font-bold text-[var(--text)]">{owner.languages.join(", ")}</p>
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              <div className="bg-[var(--bg-secondary)] rounded-3xl p-8 border border-[var(--border)] shadow-sm relative">
                 <div className="absolute -top-4 -left-2 bg-theme-primary text-[var(--primary-foreground)] p-3 rounded-2xl shadow-lg">
                    <MessageCircle size={24} />
                 </div>
                 <h4 className="text-lg font-bold text-theme-primary mb-4 pl-4">A message from your host</h4>
                 <p className="text-[var(--text)] leading-relaxed pl-4 font-medium">
                    {owner.message}
                 </p>
                 
                 <div className="flex flex-col sm:flex-row gap-4 mt-8 ml-4">
                    <button className="flex-1 flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--bg)] px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg">
                       <MessageCircle size={20} />
                       Message Host
                    </button>
                    {whatsapp && (
                      <a 
                        href={`https://wa.me/${whatsapp.replace(/\+/g, "").replace(/\s/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#128C7E] transition-all active:scale-95 shadow-lg"
                      >
                         <Phone size={20} />
                         WhatsApp Host
                      </a>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}

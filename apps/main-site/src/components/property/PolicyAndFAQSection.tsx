"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, ShieldAlert, Clock, Info, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PolicyAndFAQSectionProps {
  faqs?: Array<{ question: string; answer: string }>;
  policies?: {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
    petPolicy?: string;
    houseRules?: string;
  };
}

export default function PolicyAndFAQSection({ faqs = [], policies }: PolicyAndFAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-20 md:py-32 border-b border-[var(--border)] relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* Policies Column */}
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-[var(--text-subtle)]" />
              <span className="text-[11px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.2em]">Guidelines</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-[var(--text)] tracking-tight mb-4">Property <span className="italic text-[var(--text-muted)]">Policies.</span></h2>
            <p className="text-base text-[var(--text-muted)] font-light leading-relaxed">Essential information to ensure a seamless experience for all guests.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies?.checkIn || policies?.checkOut ? (
              <PolicyCard 
                icon={Clock} 
                title="Check-in / Out" 
                content={`Check-in: ${policies?.checkIn || "N/A"} \n Check-out: ${policies?.checkOut || "N/A"}`} 
              />
            ) : null}
            {policies?.cancellation && (
              <PolicyCard 
                icon={ShieldAlert} 
                title="Cancellation" 
                content={policies?.cancellation} 
              />
            )}
            {policies?.houseRules && (
              <PolicyCard 
                icon={Info} 
                title="House Rules" 
                content={policies?.houseRules} 
              />
            )}
            {policies?.petPolicy && (
              <PolicyCard 
                icon={HelpCircle} 
                title="Pet Policy" 
                content={policies?.petPolicy} 
              />
            )}
          </div>
        </div>

        {/* FAQ Column */}
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-[var(--text-subtle)]" />
              <span className="text-[11px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.2em]">Common Queries</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif text-[var(--text)] tracking-tight mb-4">Frequently <span className="italic text-[var(--text-muted)]">Asked.</span></h2>
            <p className="text-base text-[var(--text-muted)] font-light leading-relaxed">Answers to common questions regarding your upcoming stay.</p>
          </div>

          <div className="space-y-4">
            {faqs.length > 0 ? faqs.map((faq, idx) => (
              <div 
                key={`faq-${idx}`}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                >
                  <span className="text-[14px] font-medium text-[var(--text)]">{faq.question}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300",
                    openFaq === idx ? "bg-theme-primary border-theme-primary text-white rotate-180" : "border-[var(--border)] text-[var(--text-subtle)] group-hover:border-theme-primary/50"
                  )}>
                    {openFaq === idx ? <Minus size={14} strokeWidth={1.5} /> : <Plus size={14} strokeWidth={1.5} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-2 text-[14px] font-light text-[var(--text-muted)] leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )) : (
              <p className="text-sm italic text-[#0E5A75]/40">No FAQs available for this property.</p>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}

function PolicyCard({ icon: Icon, title, content }: { icon: React.ElementType, title: string, content: string }) {
  return (
    <div className="p-6 md:p-8 rounded-3xl bg-[var(--card)] border border-[var(--border)] group hover:border-theme-primary/30 transition-all duration-300">
      <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] mb-6 group-hover:scale-110 group-hover:bg-theme-primary group-hover:text-white group-hover:border-theme-primary transition-all duration-500">
        <Icon size={18} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-medium text-[var(--text)] mb-2 tracking-tight">{title}</h3>
      <p className="text-[13px] font-light text-[var(--text-muted)] leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}

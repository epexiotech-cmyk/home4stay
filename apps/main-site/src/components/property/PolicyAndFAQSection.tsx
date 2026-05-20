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
  };
}

export default function PolicyAndFAQSection({ faqs = [], policies }: PolicyAndFAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-32 border-b border-black/5 dark:border-white/5 relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* Policies Column */}
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-[#0E5A75]" />
              <span className="text-[10px] font-black text-[#0E5A75] uppercase tracking-[0.3em]">Stay Rules</span>
            </div>
            <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter mb-4 italic">Property Policies</h2>
            <p className="text-sm text-[#0E5A75]/60 font-medium italic">Our standard guidelines to ensure a comfortable stay for everyone.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PolicyCard 
              icon={Clock} 
              title="Check-in / Out" 
              content={`Check-in: ${policies?.checkIn || "12:00 PM"} \n Check-out: ${policies?.checkOut || "10:00 AM"}`} 
            />
            <PolicyCard 
              icon={ShieldAlert} 
              title="Cancellation" 
              content={policies?.cancellation || "Standard cancellation rules apply."} 
            />
            <PolicyCard 
              icon={Info} 
              title="House Rules" 
              content="Respect quiet hours. No loud music after 10 PM. Please maintain local sensitivity." 
            />
            <PolicyCard 
              icon={HelpCircle} 
              title="Pet Policy" 
              content={policies?.petPolicy || "Please check with the host regarding pet friendliness."} 
            />
          </div>
        </div>

        {/* FAQ Column */}
        <div className="space-y-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-px bg-[#0983B0]" />
              <span className="text-[10px] font-black text-[#0983B0] uppercase tracking-[0.3em]">Common Queries</span>
            </div>
            <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter mb-4 italic">Frequently Asked</h2>
            <p className="text-sm text-[#0E5A75]/60 font-medium italic">Everything you need to know about your upcoming luxury escape.</p>
          </div>

          <div className="space-y-4">
            {faqs.length > 0 ? faqs.map((faq, idx) => (
              <div 
                key={`faq-${idx}`}
                className="bg-white dark:bg-[#0E5A75]/10 rounded-[32px] border border-black/5 dark:border-white/5 overflow-hidden transition-all duration-500"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <span className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-tight">{faq.question}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                    openFaq === idx ? "bg-[#0E5A75] text-white rotate-180" : "bg-black/5 dark:bg-white/5 text-[#0E5A75]"
                  )}>
                    {openFaq === idx ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-8 pb-8 text-sm font-medium text-[#0E5A75]/60 dark:text-white/60 italic leading-relaxed">
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
    <div className="p-8 rounded-[40px] bg-white dark:bg-[#0E5A75]/10 border border-black/5 dark:border-white/5 group hover:border-[#0E5A75]/20 transition-all duration-500">
      <div className="w-12 h-12 rounded-2xl bg-[#0E5A75]/5 dark:bg-[#FCBC43]/10 flex items-center justify-center text-[#0E5A75] dark:text-[#FCBC43] mb-6 group-hover:scale-110 transition-transform duration-500">
        <Icon size={20} />
      </div>
      <h3 className="text-lg font-black text-[#053344] dark:text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-xs font-medium text-[#0E5A75]/60 dark:text-white/60 leading-relaxed italic whitespace-pre-line">{content}</p>
    </div>
  );
}

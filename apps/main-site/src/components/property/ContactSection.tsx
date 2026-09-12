"use client";

import React from "react";
import { Phone, MessageSquare } from "lucide-react";

interface ContactSectionProps {
  name: string;
  phone?: string;
  whatsapp?: string;
}

export default function ContactSection({ name, phone, whatsapp }: ContactSectionProps) {
  return (
    <section id="contact" className="py-20 md:py-24 bg-[var(--bg-secondary)] text-[var(--text)] mx-auto max-w-[1440px] px-6 md:px-10 lg:px-20 overflow-hidden relative border-t border-[var(--border)]">

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div className="animate-in fade-in slide-in-from-left-10 duration-1000">
           <h2 className="text-4xl md:text-6xl font-serif text-[var(--text)] mb-6 leading-[1.15] tracking-tight">
             Ready to book your <br />
             <span className="text-theme-primary italic font-serif">dream stay?</span>
           </h2>
           <p className="text-[var(--text-muted)] text-base font-light mb-12 max-w-md leading-relaxed">
             Contact our concierge team directly for personalized booking assistance and exclusive offers at {name}.
           </p>

           <div className="space-y-8">
              <a href={`tel:${phone}`} className="flex items-center gap-6 group cursor-pointer w-fit">
                 <div className="w-16 h-16 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex items-center justify-center text-theme-primary group-hover:bg-theme-primary group-hover:text-white transition-all shadow-sm group-hover:shadow-theme-primary/20">
                    <Phone size={28} />
                 </div>
                 <div>
                    <p className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.2em] mb-1">Call Us</p>
                    <p className="text-xl font-medium tracking-wide tracking-tight text-[var(--text)] group-hover:text-theme-primary transition-colors">{phone || "+91 90000 00000"}</p>
                 </div>
              </a>

              <a href={`https://wa.me/${whatsapp?.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 group cursor-pointer w-fit">
                 <div className="w-16 h-16 bg-[var(--card)] border border-[var(--border)] rounded-2xl flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm group-hover:shadow-emerald-500/20">
                    <MessageSquare size={28} />
                 </div>
                 <div>
                    <p className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.2em] mb-1">WhatsApp Booking</p>
                    <p className="text-xl font-medium tracking-wide tracking-tight text-[var(--text)] group-hover:text-emerald-500 transition-colors">{whatsapp || "+91 90000 00000"}</p>
                 </div>
              </a>
           </div>
        </div>

        <div className="bg-[var(--card)] border border-[var(--border)] p-8 md:p-12 rounded-3xl shadow-lg relative overflow-hidden group animate-in fade-in slide-in-from-right-10 duration-1000">
           {/* Subtle radial glow */}
           <div className="absolute -top-20 -right-20 w-40 h-40 bg-theme-primary/10 blur-[50px] rounded-full group-hover:bg-theme-primary/20 transition-all duration-700" />
           
           <h3 className="text-2xl font-serif text-[var(--text)] mb-8 tracking-tight">Quick Inquiry</h3>
           <div className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2.5">
                    <label className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest ml-1">First Name</label>
                    <input type="text" placeholder="John" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-theme-primary transition-all placeholder:text-[var(--text-subtle)] font-light text-[var(--text)]" />
                 </div>
                 <div className="space-y-2.5">
                    <label className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest ml-1">Last Name</label>
                    <input type="text" placeholder="Doe" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-theme-primary transition-all placeholder:text-[var(--text-subtle)] font-light text-[var(--text)]" />
                 </div>
              </div>
              <div className="space-y-2.5">
                 <label className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest ml-1">Email Address</label>
                 <input type="email" placeholder="john@example.com" className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-theme-primary transition-all placeholder:text-[var(--text-subtle)] font-light text-[var(--text)]" />
              </div>
              <div className="space-y-2.5">
                 <label className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest ml-1">Message</label>
                 <textarea rows={4} placeholder="Tell us about your requirements..." className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 outline-none focus:border-theme-primary transition-all placeholder:text-[var(--text-subtle)] font-light text-[var(--text)] resize-none" />
              </div>
              <button className="w-full bg-gradient-to-r from-theme-primary to-indigo-600 text-[var(--primary-foreground)] font-black py-5 rounded-2xl shadow-sm hover:shadow-theme-primary/40 hover:scale-[1.02] hover:-translate-y-1 transition-all active:scale-95 text-xl tracking-tight mt-4">
                 Send Inquiry
              </button>
           </div>
        </div>
      </div>
    </section>
  );
}

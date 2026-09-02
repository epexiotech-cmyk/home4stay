"use client";

import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Star, 
  Calendar, 
  Award, 
  MessageSquare, 
  Mail, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Zap, 
  ShieldCheck,
  CreditCard,
  Smartphone,
  History,
  Home,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

type LoyaltyLevel = "Bronze" | "Silver" | "Gold" | "Platinum";
type GuestTag = "VIP" | "Repeat Guest" | "Honeymoon Couple" | "Family Traveler" | "Corporate" | "High Value" | "Needs Attention";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyalty: LoyaltyLevel;
  totalSpent: number;
  totalStays: number;
  lastStay: string;
  favoriteRoom: string;
  tags: GuestTag[];
  avatar?: string;
}

// --- Mock Data ---

const GUESTS: Guest[] = [
  {
    id: "G-101",
    name: "Ananya Sharma",
    email: "ananya.s@example.com",
    phone: "+91 98765 43210",
    loyalty: "Platinum",
    totalSpent: 245000,
    totalStays: 12,
    lastStay: "2 weeks ago",
    favoriteRoom: "Royal Heritage Suite",
    tags: ["VIP", "High Value", "Repeat Guest"]
  },
  {
    id: "G-102",
    name: "Rohan Malhotra",
    email: "rohan.m@example.com",
    phone: "+91 98234 56789",
    loyalty: "Gold",
    totalSpent: 85200,
    totalStays: 5,
    lastStay: "1 month ago",
    favoriteRoom: "Premium Villa",
    tags: ["Repeat Guest", "Corporate"]
  },
  {
    id: "G-103",
    name: "Priya Das",
    email: "priya.d@example.com",
    phone: "+91 91234 56789",
    loyalty: "Silver",
    totalSpent: 32000,
    totalStays: 3,
    lastStay: "3 days ago",
    favoriteRoom: "Deluxe Mountain View",
    tags: ["Family Traveler", "Honeymoon Couple"]
  }
];

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] p-6 hover-lift border border-white/5 dark:border-white/5 shadow-premium", className)}>
    {children}
  </div>
);

const TagBadge = ({ children }: { children: React.ReactNode }) => {
  const colors: Record<string, string> = {
    VIP: "bg-[#FCBC43]/10 text-[#FCBC43]",
    "Repeat Guest": "bg-[#159665]/10 text-[#159665]",
    "High Value": "bg-[#0983B0]/10 text-[#0983B0]",
    "Honeymoon Couple": "bg-[#F24633]/10 text-[#F24633]",
    "Family Traveler": "bg-[#29655C]/10 text-[#29655C]",
    default: "bg-[#0E5A75]/10 text-[#0E5A75]",
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap", colors[children as string] || colors.default)}>
      {children}
    </span>
  );
};

const LoyaltyBadge = ({ level }: { level: LoyaltyLevel }) => {
  const config = {
    Bronze: { color: "bg-[#CD7F32]/20 text-[#CD7F32]", icon: Award },
    Silver: { color: "bg-[#C0C0C0]/20 text-[#C0C0C0]", icon: ShieldCheck },
    Gold: { color: "bg-[#FFD700]/20 text-[#FFD700]", icon: Star },
    Platinum: { color: "bg-[#E5E4E2]/20 text-[#0E5A75]", icon: Zap },
  };
  const { color, icon: Icon } = config[level];
  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg", color)}>
      <Icon size={12} className="fill-current" />
      <span className="text-[10px] font-black uppercase tracking-widest">{level}</span>
    </div>
  );
};

// --- Main Page ---

export default function GuestsPage() {
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Guest Experience CRM</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Guest Relationships</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E5A75]/40" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email or ID..." 
              className="w-full pl-12 pr-4 py-4 rounded-[24px] glass-matte border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold"
            />
          </div>
          <button className="flex items-center gap-2 px-8 py-4 rounded-[24px] bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all group">
            <UserPlus size={20} />
            <span className="text-sm font-black uppercase tracking-widest">Add Guest</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Total Database" value="1,248" icon={Users} color="text-[#0E5A75]" />
        <StatWidget label="Repeat Guests" value="42%" icon={History} color="text-[#159665]" />
        <StatWidget label="VIP Members" value="54" icon={Zap} color="text-[#FCBC43]" />
        <StatWidget label="Active Arrivals" value="12" icon={Calendar} color="text-[#0983B0]" />
      </div>

      {/* 3. Guest CRM List */}
      <div className="space-y-4">
        {GUESTS.map((guest) => (
          <GuestListItem 
            key={guest.id} 
            guest={guest} 
            onClick={() => setSelectedGuest(guest)}
          />
        ))}
      </div>

      {/* 4. Guest Profile Side Drawer */}
      {selectedGuest && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-[#053344]/40 backdrop-blur-sm" onClick={() => setSelectedGuest(null)} />
          <aside className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1D] shadow-luxury h-full animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-2xl shadow-xl">
                  {selectedGuest.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight leading-none mb-2">{selectedGuest.name}</h2>
                  <div className="flex items-center gap-2">
                    <LoyaltyBadge level={selectedGuest.loyalty} />
                    <span className="text-[10px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">{selectedGuest.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedGuest(null)} className="p-3 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              
              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <InfoBox label="Email Address" value={selectedGuest.email} icon={Mail} />
                <InfoBox label="Phone Number" value={selectedGuest.phone} icon={Smartphone} />
                <InfoBox label="Total Spent" value={`₹${selectedGuest.totalSpent.toLocaleString()}`} icon={CreditCard} />
                <InfoBox label="Total Stays" value={`${selectedGuest.totalStays} Stays`} icon={History} />
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Guest Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-[24px] bg-[#0E5A75]/5 border border-[#0E5A75]/10">
                    <p className="text-[10px] font-black text-[#0E5A75]/50 uppercase tracking-widest mb-2">Favorite Accommodation</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white text-[#0E5A75] shadow-sm"><Home size={16} /></div>
                      <p className="text-sm font-bold text-[#053344] dark:text-white">{selectedGuest.favoriteRoom}</p>
                    </div>
                  </div>
                  <div className="p-5 rounded-[24px] bg-[#159665]/5 border border-[#159665]/10">
                    <p className="text-[10px] font-black text-[#159665]/50 uppercase tracking-widest mb-2">Dining Preference</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white text-[#159665] shadow-sm"><CheckCircle2 size={16} /></div>
                      <p className="text-sm font-bold text-[#053344] dark:text-white">MAP - Veg Friendly</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Profile Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedGuest.tags.map(tag => (
                    <TagBadge key={tag}>{tag}</TagBadge>
                  ))}
                  <button className="px-4 py-1.5 rounded-full border border-dashed border-[#0E5A75]/20 text-[#0E5A75]/40 text-[10px] font-bold uppercase tracking-widest hover:border-[#0E5A75]/40 transition-all">+ Add Tag</button>
                </div>
              </div>

              {/* Stay History Timeline */}
              <div className="space-y-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Stay History</h3>
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[#0E5A75]/10">
                  <TimelineItem date="May 08, 2026" title="Current Stay" detail="Royal Heritage Suite • 4 Nights" active />
                  <TimelineItem date="Dec 12, 2025" title="Completed Stay" detail="Deluxe Mountain View • 2 Nights" />
                  <TimelineItem date="Aug 15, 2025" title="Completed Stay" detail="Royal Heritage Suite • 3 Nights" />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-black/5 dark:border-white/5 flex gap-3">
              <button className="flex-1 py-4 rounded-2xl border border-[#0E5A75]/20 text-[#0E5A75] font-black uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all">Send Message</button>
              <button className="flex-1 py-4 rounded-2xl bg-[#0E5A75] text-white font-black uppercase tracking-widest shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all">Mark as VIP</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

// --- Helper Components ---

function StatWidget({ label, value, icon: Icon, color }: { label: string, value: string, icon: LucideIcon, color: string }) {
  return (
    <GlassCard className="p-5 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">{label}</p>
        <p className={cn("text-3xl font-black leading-none", color)}>{value}</p>
      </div>
      <div className={cn("p-3 rounded-2xl bg-white dark:bg-white/5 shadow-inner", color)}>
        <Icon size={20} />
      </div>
    </GlassCard>
  );
}

function GuestListItem({ guest, onClick }: { guest: Guest, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col lg:flex-row items-center gap-6 p-6 rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/10 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:translate-y-[-2px]"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-14 h-14 rounded-[18px] bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/10">
          {guest.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-black text-[#053344] dark:text-white leading-none">{guest.name}</h3>
            <LoyaltyBadge level={guest.loyalty} />
          </div>
          <p className="text-xs font-bold text-[#0E5A75]/40 uppercase tracking-widest">{guest.id} • {guest.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-12 shrink-0">
        <div className="hidden xl:block">
          <p className="text-[9px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Favorite Room</p>
          <p className="text-xs font-bold text-[#053344] dark:text-white">{guest.favoriteRoom}</p>
        </div>
        <div>
          <p className="text-[9px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Lifetime Spent</p>
          <p className="text-sm font-black text-[#159665]">₹{guest.totalSpent.toLocaleString()}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 justify-end max-w-[200px]">
          {guest.tags.slice(0, 2).map(tag => (
            <TagBadge key={tag}>{tag}</TagBadge>
          ))}
          {guest.tags.length > 2 && <TagBadge>+{guest.tags.length - 2}</TagBadge>}
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-black/5 dark:border-white/5 pl-6">
        <button className="p-2.5 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><MessageSquare size={18} /></button>
        <button className="p-2.5 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon: Icon }: { label: string, value: string, icon: LucideIcon }) {
  return (
    <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
      <div className="flex items-center gap-2 mb-2 text-[#0E5A75]/40">
        <Icon size={14} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-sm font-black text-[#053344] dark:text-white truncate">{value}</p>
    </div>
  );
}

function TimelineItem({ date, title, detail, active }: { date: string, title: string, detail: string, active?: boolean }) {
  return (
    <div className="flex gap-4 relative">
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 z-10 shadow-lg transition-all",
        active ? "bg-[#159665] scale-110" : "bg-[#0E5A75]/20"
      )}>
        {active ? <CheckCircle2 size={12} /> : <div className="w-2 h-2 rounded-full bg-white/40" />}
      </div>
      <div>
        <p className="text-[10px] font-black text-[#0983B0] uppercase tracking-widest leading-none mb-1">{date}</p>
        <p className="text-sm font-black text-[#053344] dark:text-white leading-tight">{title}</p>
        <p className="text-xs text-[#0E5A75]/60 font-bold mt-0.5">{detail}</p>
      </div>
    </div>
  );
}

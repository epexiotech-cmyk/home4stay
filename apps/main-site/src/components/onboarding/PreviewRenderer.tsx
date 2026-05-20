/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo } from "react";
import { useOnboarding } from "@/context/OnboardingContext";
import { 
  Waves, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  Compass, 
  MapPin, 
  Clock, 
  Coffee, 
  Wifi, 
  Utensils, 
  User,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewRendererProps {
  viewport: "desktop" | "tablet" | "mobile";
  isFullScreen?: boolean;
}

const THEME_MAP = {
  coastal: {
    name: "Coastal Sands",
    primary: "bg-[#0983B0] text-white hover:bg-[#0E5A75]",
    textPrimary: "text-[#0983B0]",
    textDark: "text-[#0E5A75]",
    bgLight: "bg-[#F0F9FF]",
    borderLight: "border-[#BAE6FD]",
    gradient: "from-[#F0F9FF] to-[#E0F2FE]",
    fontHeader: "font-serif",
    fontBody: "font-sans",
    buttonStyle: "rounded-full shadow-md bg-[#0983B0] hover:bg-[#0E5A75] text-white",
    cardStyle: "rounded-3xl border border-[#E0F2FE] bg-white shadow-sm",
    heroGradient: "from-black/60 via-black/20 to-transparent",
  },
  heritage: {
    name: "Heritage Luxury",
    primary: "bg-[#FCBC43] text-black hover:bg-[#E0A836]",
    textPrimary: "text-[#FCBC43]",
    textDark: "text-[#78350F]",
    bgLight: "bg-[#FFFBEB]",
    borderLight: "border-[#FDE68A]",
    gradient: "from-[#FFFBEB] to-[#FEF3C7]",
    fontHeader: "font-serif tracking-wide italic",
    fontBody: "font-serif",
    buttonStyle: "rounded-none border-2 border-[#FCBC43] bg-transparent text-[#FCBC43] hover:bg-[#FCBC43] hover:text-black font-extrabold transition-all",
    cardStyle: "rounded-none border border-[#FDE68A] bg-white shadow-md",
    heroGradient: "from-black/75 via-black/45 to-black/20",
  },
  alpine: {
    name: "Alpine Snow",
    primary: "bg-[#334155] text-white hover:bg-[#1E293B]",
    textPrimary: "text-[#475569]",
    textDark: "text-[#1E293B]",
    bgLight: "bg-[#F8FAFC]",
    borderLight: "border-[#E2E8F0]",
    gradient: "from-[#F8FAFC] to-[#F1F5F9]",
    fontHeader: "font-sans uppercase tracking-[0.2em] font-black",
    fontBody: "font-sans font-light",
    buttonStyle: "rounded-xl shadow-lg bg-[#334155] hover:bg-[#1E293B] text-white font-bold",
    cardStyle: "rounded-xl border border-[#E2E8F0] bg-white shadow-xl hover:shadow-2xl transition-all",
    heroGradient: "from-slate-900/60 via-slate-900/25 to-transparent",
  },
  jungle: {
    name: "Jungle Escape",
    primary: "bg-[#159665] text-white hover:bg-[#29655C]",
    textPrimary: "text-[#159665]",
    textDark: "text-[#29655C]",
    bgLight: "bg-[#ECFDF5]",
    borderLight: "border-[#A7F3D0]",
    gradient: "from-[#ECFDF5] to-[#D1FAE5]",
    fontHeader: "font-sans font-extrabold tracking-tight",
    fontBody: "font-sans",
    buttonStyle: "rounded-2xl shadow-md bg-[#159665] hover:bg-[#29655C] text-white",
    cardStyle: "rounded-[32px] border border-[#D1FAE5] bg-white/90 backdrop-blur-md shadow-sm",
    heroGradient: "from-black/50 via-emerald-950/15 to-transparent",
  }
};

const getExperienceImage = (title: string): string => {
  const lowercase = title.toLowerCase();
  if (lowercase.includes("yoga") || lowercase.includes("meditation")) {
    return "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80";
  }
  if (lowercase.includes("trek") || lowercase.includes("mountain")) {
    return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80";
  }
  if (lowercase.includes("cooking") || lowercase.includes("masterclass")) {
    return "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80";
  }
  if (lowercase.includes("wine") || lowercase.includes("cheese") || lowercase.includes("tasting")) {
    return "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=80";
  }
  return "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80";
};

const getAmenityIcon = (name: string) => {
  const lowercase = name.toLowerCase();
  if (lowercase.includes("pool") || lowercase.includes("deck")) return Waves;
  if (lowercase.includes("spa") || lowercase.includes("massage")) return Sparkles;
  if (lowercase.includes("chef") || lowercase.includes("dining")) return Utensils;
  if (lowercase.includes("wi-fi") || lowercase.includes("internet")) return Wifi;
  if (lowercase.includes("breakfast") || lowercase.includes("farm-to-table")) return Coffee;
  if (lowercase.includes("butler") || lowercase.includes("service")) return ShieldCheck;
  return Star;
};

export default function PreviewRenderer({ viewport }: PreviewRendererProps) {
  const { draftData } = useOnboarding();

  // Safeguard raw context values to prevent runtime hydration crashings
  const property = useMemo(() => draftData.property || { title: "", location: "", description: "", slug: "" }, [draftData.property]);
  const themeConfig = useMemo(() => draftData.theme || { themeId: "coastal" }, [draftData.theme]);
  const rooms = useMemo(() => draftData.rooms || { roomName: "Royal Heritage Suite", price: 12500 }, [draftData.rooms]);
  const amenities = useMemo(() => draftData.amenities || [], [draftData.amenities]);
  const experiences = useMemo(() => draftData.experiences || [], [draftData.experiences]);
  const gallery = useMemo(() => draftData.gallery || [], [draftData.gallery]);
  const policies = useMemo(() => draftData.policies || { checkIn: "02:00 PM", checkOut: "11:00 AM", cancellation: "flexible" }, [draftData.policies]);

  const activeThemeId = (themeConfig.themeId || "coastal") as keyof typeof THEME_MAP;
  const activeTheme = THEME_MAP[activeThemeId] || THEME_MAP.coastal;

  // Resolve cover image
  const coverImage = useMemo(() => {
    if (gallery.length > 0 && gallery[0]) return gallery[0];
    return "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"; // Luxury villa default
  }, [gallery]);

  return (
    <div className={cn(
      "w-full h-full flex flex-col bg-white text-slate-800 transition-all select-none overflow-y-auto scrollbar-hide",
      activeTheme.fontBody
    )}>
      
      {/* 1. BRAND NAVIGATION HEADER */}
      <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between z-20 shrink-0">
        <span className={cn("text-xs font-black tracking-widest uppercase transition-all duration-300", activeTheme.fontHeader, activeTheme.textDark)}>
          {property.title || "ESTATE SANCTUARY"}
        </span>
        
        {viewport !== "mobile" && (
          <div className="flex gap-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="hover:text-slate-900 transition-colors">Residences</span>
            <span className="hover:text-slate-900 transition-colors">Amenities</span>
            <span className="hover:text-slate-900 transition-colors">Experiences</span>
          </div>
        )}

        <button className={cn("px-3.5 py-1.5 text-[8px] font-black uppercase tracking-widest transition-all duration-300 shrink-0", activeTheme.buttonStyle)}>
          Book Direct
        </button>
      </nav>

      {/* 2. DYNAMIC HERO BRAND SHOWCASE */}
      <header className="relative w-full aspect-[16/9] md:aspect-[21/9] flex items-center justify-center overflow-hidden bg-slate-900 shrink-0">
        <img 
          src={coverImage} 
          alt={property.title || "Showcase Hero"}
          className="absolute inset-0 w-full h-full object-cover opacity-80 scale-100 hover:scale-105 transition-all duration-1000"
        />
        <div className={cn("absolute inset-0 bg-gradient-to-t", activeTheme.heroGradient)} />
        
        <div className="relative z-10 px-6 text-center max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white text-[8px] font-black uppercase tracking-[0.2em] border border-white/10">
            <MapPin size={8} className="text-[#FCBC43]" />
            <span>{property.location || "Indo-Gangetic Slopes"}</span>
          </div>

          {property.tagline && (
            <span className="text-[8px] sm:text-[10px] font-black text-[#FCBC43] uppercase tracking-[0.25em] block drop-shadow-md animate-in fade-in slide-in-from-top-2 duration-700 mb-1">
              {property.tagline}
            </span>
          )}

          <h1 className={cn(
            "text-lg sm:text-2xl md:text-3xl font-black text-white leading-tight transition-all duration-300 drop-shadow-md",
            activeTheme.fontHeader
          )}>
            {property.title || "The Estate Sanctuary"}
          </h1>

          <p className="text-[9px] sm:text-[11px] font-medium text-white/80 leading-relaxed max-w-md mx-auto line-clamp-2">
            {property.description || "A luxury hospitality retreat engineered for direct bookings and breathtaking memory making."}
          </p>
        </div>
      </header>

      {/* 3. CORE CONTENT GRID */}
      <main className="flex-1 p-6 space-y-12">
        
        {/* SECTION: THE PRIVATE RESIDENCE */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className={cn("text-[8px] font-black uppercase tracking-[0.25em]", activeTheme.textPrimary)}>
              Signature Suites
            </span>
            <h2 className={cn("text-sm sm:text-base font-extrabold tracking-tight text-slate-900", activeTheme.fontHeader)}>
              Private Luxury Residences
            </h2>
          </div>

          <div className={cn("overflow-hidden max-w-md mx-auto transition-all", activeTheme.cardStyle)}>
            <div className="aspect-[16/10] bg-slate-100 relative">
              <img 
                src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=600&q=80" 
                alt={rooms.roomName || "Grand Suite"}
                className="w-full h-full object-cover" 
              />
              <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-slate-800 shadow-sm border border-slate-100">
                0% Booking Fee
              </span>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    {rooms.roomName || "Royal Heritage Suite"}
                  </h3>
                  <p className="text-[9px] font-semibold text-slate-400 mt-1">
                    4 Guests &bull; 1 King Bed &bull; Scenic Mountain View
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={cn("text-xs font-black block", activeTheme.textPrimary)}>
                    ₹{Number(rooms.price || 12500).toLocaleString()}
                  </span>
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">per night</span>
                </div>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <span className="bg-slate-50 border border-slate-100 rounded px-2 py-0.5 text-[8px] font-bold text-slate-500">Premium Linens</span>
                <span className="bg-slate-50 border border-slate-100 rounded px-2 py-0.5 text-[8px] font-bold text-slate-500">Minibar</span>
                <span className="bg-slate-50 border border-slate-100 rounded px-2 py-0.5 text-[8px] font-bold text-slate-500">Espresso Station</span>
              </div>

              <button className={cn("w-full py-2.5 text-[9px] font-black uppercase tracking-widest transition-all", activeTheme.buttonStyle)}>
                Reserve Residence
              </button>
            </div>
          </div>
        </section>

        {/* SECTION: SIGNATURE AMENITIES */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className={cn("text-[8px] font-black uppercase tracking-[0.25em]", activeTheme.textPrimary)}>
              Atmosphere
            </span>
            <h2 className={cn("text-sm sm:text-base font-extrabold tracking-tight text-slate-900", activeTheme.fontHeader)}>
              High-End Signature Services
            </h2>
          </div>

          {amenities.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {amenities.map((item, idx) => {
                const AmenityIcon = getAmenityIcon(item);
                return (
                  <div key={idx} className={cn("p-4 flex gap-3 items-center", activeTheme.cardStyle)}>
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", activeTheme.bgLight, activeTheme.textPrimary)}>
                      <AmenityIcon size={14} className="stroke-[2.5px]" />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black text-slate-800 leading-tight uppercase tracking-wider">{item}</h4>
                      <span className="text-[7px] font-bold text-slate-400 block mt-0.5">Signature Inclusion</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto space-y-2">
              <Sparkles className="text-slate-300 mx-auto" size={24} />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select signature amenities on the left panel</p>
            </div>
          )}
        </section>

        {/* SECTION: CURATED LOCAL EXPERIENCES */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className={cn("text-[8px] font-black uppercase tracking-[0.25em]", activeTheme.textPrimary)}>
              Curated Expeditions
            </span>
            <h2 className={cn("text-sm sm:text-base font-extrabold tracking-tight text-slate-900", activeTheme.fontHeader)}>
              Excursions &amp; Local Adventures
            </h2>
          </div>

          {experiences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
              {experiences.map((exp, idx) => {
                const expImg = getExperienceImage(exp);
                return (
                  <div key={idx} className={cn("overflow-hidden flex flex-col justify-between", activeTheme.cardStyle)}>
                    <div className="aspect-[16/9] bg-slate-100">
                      <img src={expImg} alt={exp} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-wider leading-tight">{exp}</h4>
                      <div className="flex gap-3 text-[7px] font-bold text-slate-400 uppercase tracking-widest items-center">
                        <span className="flex items-center gap-1"><Clock size={9} /> Custom Timed</span>
                        <span className="flex items-center gap-1"><User size={9} /> Private Guide</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center max-w-md mx-auto space-y-2">
              <Compass className="text-slate-300 mx-auto" size={24} />
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Selected excursions appear directly here</p>
            </div>
          )}
        </section>

        {/* SECTION: GALLERY STORYTELLING */}
        {gallery.length > 0 && (
          <section className="space-y-6">
            <div className="text-center space-y-1">
              <span className={cn("text-[8px] font-black uppercase tracking-[0.25em]", activeTheme.textPrimary)}>
                Chronicles
              </span>
              <h2 className={cn("text-sm sm:text-base font-extrabold tracking-tight text-slate-900", activeTheme.fontHeader)}>
                Bespoke Visual Gallery
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {gallery.map((url, idx) => (
                <div key={idx} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                  <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: POLICIES */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <span className={cn("text-[8px] font-black uppercase tracking-[0.25em]", activeTheme.textPrimary)}>
              Guidelines
            </span>
            <h2 className={cn("text-sm sm:text-base font-extrabold tracking-tight text-slate-900", activeTheme.fontHeader)}>
              Stay Terms &amp; Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
            <div className={cn("p-4 space-y-3", activeTheme.cardStyle)}>
              <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                <Clock size={12} className={activeTheme.textPrimary} /> Check-In &amp; Check-Out
              </h4>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                <span>Check-in After:</span>
                <span className="text-slate-800 font-extrabold">{policies.checkIn || "02:00 PM"}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                <span>Check-out Before:</span>
                <span className="text-slate-800 font-extrabold">{policies.checkOut || "11:00 AM"}</span>
              </div>
            </div>

            <div className={cn("p-4 space-y-3", activeTheme.cardStyle)}>
              <h4 className="text-[9px] font-black text-slate-800 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-[#F24633]" /> Cancellation Policy
              </h4>
              <p className="text-[8px] font-semibold text-slate-500 leading-relaxed">
                {policies.cancellation === "flexible" && "Flexible: Full refund up to 24 hours prior to scheduled arrival."}
                {policies.cancellation === "moderate" && "Moderate: Full refund up to 5 days prior to scheduled check-in."}
                {policies.cancellation === "strict" && "Strict: 50% refund up to 7 days prior to check-in. Non-refundable thereafter."}
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-slate-100 bg-slate-50 px-6 py-8 text-center space-y-3 shrink-0">
        <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-1">
          <span>✓ 0% Commission Direct Booking Portal</span>
          <span>&bull;</span>
          <span>Secure Direct Payments</span>
        </p>
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.25em] block">
          Powered by Home4Stay
        </span>
      </footer>

    </div>
  );
}

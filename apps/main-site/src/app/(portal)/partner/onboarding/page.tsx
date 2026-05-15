"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Home, 
  Building2, 
  Palmtree, 
  Mountain, 
  Camera, 
  MapPin, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Info,
  Hotel,
  Tent,
  TreePine,
  Waves,
  Snowflake,
  Plus,
  Settings,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

type Step = "welcome" | "type" | "atmosphere" | "details" | "media" | "rooms" | "publish";

interface PropertyType {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

interface Atmosphere {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
}

// --- Constants ---

const PROPERTY_TYPES: PropertyType[] = [
  { id: "resort", name: "Resort", icon: Palmtree, description: "Luxury stays with full amenities & leisure." },
  { id: "villa", name: "Private Villa", icon: Home, description: "Exclusive standalone luxury homes." },
  { id: "boutique", name: "Boutique Hotel", icon: Hotel, description: "Unique, small-scale luxury hospitality." },
  { id: "homestay", name: "Homestay", icon: Building2, description: "Authentic local luxury living." },
  { id: "cottage", name: "Cottage", icon: Tent, description: "Cozy, high-end nature retreats." },
  { id: "farmstay", name: "Farmstay", icon: TreePine, description: "Organic, rural luxury experiences." },
];

const ATMOSPHERES: Atmosphere[] = [
  { id: "beach", name: "Beach", icon: Waves, color: "from-[#0983B0] to-[#0E5A75]" },
  { id: "mountain", name: "Mountain", icon: Mountain, color: "from-[#159665] to-[#29655C]" },
  { id: "heritage", name: "Heritage", icon: ShieldCheck, color: "from-[#FCBC43] to-[#F24633]" },
  { id: "luxury", name: "Modern Luxury", icon: Sparkles, color: "from-[#0E5A75] to-[#053344]" },
  { id: "jungle", name: "Jungle", icon: TreePine, color: "from-[#159665] to-[#0E5A75]" },
  { id: "snow", name: "Snow", icon: Snowflake, color: "from-[#E5E4E2] to-[#0983B0]" },
];

// --- Components ---

const GlassCard = ({ children, className, onClick, selected }: { children: React.ReactNode, className?: string, onClick?: () => void, selected?: boolean }) => (
  <div 
    onClick={onClick}
    className={cn(
      "glass-matte rounded-[32px] p-8 hover-lift border transition-all duration-500 cursor-pointer shadow-premium relative overflow-hidden group",
      selected ? "border-[#0E5A75] bg-[#0E5A75]/5 ring-4 ring-[#0E5A75]/10" : "border-white/5 hover:border-[#0E5A75]/20",
      className
    )}
  >
    {selected && <div className="absolute top-4 right-4 text-[#0E5A75]"><CheckCircle2 size={24} className="fill-[#0E5A75]/10" /></div>}
    {children}
  </div>
);

// --- Main Page ---

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [mounted, setMounted] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedAtmosphere, setSelectedAtmosphere] = useState<string | null>(null);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const steps: Step[] = ["welcome", "type", "atmosphere", "details", "media", "rooms", "publish"];
  const progress = ((steps.indexOf(step) + 1) / steps.length) * 100;

  if (!mounted) return null;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-10 max-w-6xl mx-auto px-6">
      
      {/* 1. Global Progress Tracker */}
      {step !== "welcome" && step !== "publish" && (
        <div className="w-full mb-16 space-y-4">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-[0.3em]">Setup Progress</p>
              <h4 className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-widest">{step.replace('_', ' ')}</h4>
            </div>
            <p className="text-sm font-black text-[#0E5A75]">{Math.round(progress)}%</p>
          </div>
          <div className="h-2 w-full bg-[#0E5A75]/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#0E5A75] to-[#0983B0] transition-all duration-700 ease-out shadow-[0_0_15px_rgba(14,90,117,0.4)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 2. Step Renderer */}
      <div className="w-full">
        {step === "welcome" && (
          <div className="text-center space-y-10 animate-in fade-in zoom-in duration-700">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-matte border-[#0E5A75]/20 text-[#0E5A75] mb-6">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Welcome to Home4Stay Hospitality OS</span>
            </div>
            <h1 className="text-6xl font-black text-[#053344] dark:text-white tracking-tighter leading-none max-w-4xl mx-auto">
              Ready to host the world&apos;s <span className="text-[#0E5A75]">finest guests?</span>
            </h1>
            <p className="text-lg font-medium text-[#0E5A75]/60 max-w-2xl mx-auto leading-relaxed">
              Launch your property in under 5 minutes with our guided hospitality setup. Calm, premium, and designed for your success.
            </p>
            <div className="pt-10">
              <button 
                onClick={() => setStep("type")}
                className="px-12 py-6 rounded-[32px] bg-[#0E5A75] text-white text-lg font-black uppercase tracking-[0.3em] shadow-2xl shadow-[#0E5A75]/40 hover:bg-[#0A4459] hover:scale-105 transition-all duration-500"
              >
                Begin Setup
              </button>
            </div>
            <div className="flex justify-center gap-12 pt-16">
              <FeatureMini icon={Zap} label="5 Min Setup" />
              <FeatureMini icon={ShieldCheck} label="Audit Ready" />
              <FeatureMini icon={Globe} label="Live Global" />
            </div>
          </div>
        )}

        {step === "type" && (
          <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
            <div className="text-center">
              <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tight mb-4">What type of property is this?</h2>
              <p className="text-[#0E5A75]/60 font-medium italic">Select the category that best fits your hospitality experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROPERTY_TYPES.map((type) => (
                <GlassCard 
                  key={type.id} 
                  selected={selectedType === type.id}
                  onClick={() => setSelectedType(type.id)}
                  className="flex flex-col items-center text-center py-10"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-[24px] flex items-center justify-center mb-6 transition-all duration-500",
                    selectedType === type.id ? "bg-[#0E5A75] text-white shadow-xl" : "bg-[#0E5A75]/5 text-[#0E5A75]"
                  )}>
                    <type.icon size={32} />
                  </div>
                  <h3 className="text-xl font-black text-[#053344] dark:text-white mb-2">{type.name}</h3>
                  <p className="text-xs font-bold text-[#0E5A75]/40 uppercase tracking-widest">{type.description}</p>
                </GlassCard>
              ))}
            </div>
            <StepActions onNext={() => setStep("atmosphere")} onBack={() => setStep("welcome")} nextDisabled={!selectedType} />
          </div>
        )}

        {step === "atmosphere" && (
          <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
            <div className="text-center">
              <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tight mb-4">Select your Hospitality Atmosphere</h2>
              <p className="text-[#0E5A75]/60 font-medium italic">This will set the visual theme for your customer-facing property page.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {ATMOSPHERES.map((atm) => (
                <GlassCard 
                  key={atm.id} 
                  selected={selectedAtmosphere === atm.id}
                  onClick={() => setSelectedAtmosphere(atm.id)}
                  className="flex flex-col items-center text-center p-6 min-h-[200px] justify-center"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br text-white shadow-lg transition-transform group-hover:rotate-12",
                    atm.color
                  )}>
                    <atm.icon size={24} />
                  </div>
                  <h3 className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-widest">{atm.name}</h3>
                </GlassCard>
              ))}
            </div>
            <StepActions onNext={() => setStep("details")} onBack={() => setStep("type")} nextDisabled={!selectedAtmosphere} />
          </div>
        )}

        {step === "details" && (
          <div className="max-w-3xl mx-auto space-y-12 animate-in slide-in-from-bottom duration-700">
            <div className="text-center">
              <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tight mb-4">Property Essentials</h2>
              <p className="text-[#0E5A75]/60 font-medium italic">Define the identity and location of your boutique stay.</p>
            </div>
            <GlassCard className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]/50">Property Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Grand Heritage Resort \u0026 Spa" 
                  className="w-full px-6 py-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 focus:border-[#0E5A75]/30 outline-none text-lg font-bold"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]/50">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E5A75]/40" size={20} />
                  <input 
                    type="text" 
                    placeholder="e.g. Udaipur, Rajasthan, India" 
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 focus:border-[#0E5A75]/30 outline-none text-lg font-bold"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]/50">Property Description</label>
                <textarea 
                  rows={4}
                  placeholder="Tell your guests about the luxury experience..." 
                  className="w-full px-6 py-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 focus:border-[#0E5A75]/30 outline-none text-lg font-bold resize-none"
                />
              </div>
            </GlassCard>
            <StepActions onNext={() => setStep("media")} onBack={() => setStep("atmosphere")} />
          </div>
        )}

        {step === "media" && (
          <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
            <div className="text-center">
              <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tight mb-4">Visual Storytelling</h2>
              <p className="text-[#0E5A75]/60 font-medium italic">High-quality photos are the first impression of your luxury stay.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GlassCard className="lg:col-span-2 p-10 border-dashed bg-transparent flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-[#0E5A75]/5 flex items-center justify-center text-[#0E5A75] mb-6">
                  <Camera size={40} />
                </div>
                <h3 className="text-xl font-black text-[#053344] dark:text-white mb-2">Drag \u0026 Drop Property Photos</h3>
                <p className="text-sm font-bold text-[#0E5A75]/40 uppercase tracking-widest mb-8 text-center max-w-sm">
                  Recommended: At least 10 high-resolution photos showing common areas, views, and surroundings.
                </p>
                <button className="px-10 py-4 rounded-2xl bg-[#0E5A75] text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all">
                  Browse Files
                </button>
              </GlassCard>
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/40 mb-4">Media Checklist</h4>
                  <div className="space-y-4">
                    <CheckItem label="Cover Photo selected" checked />
                    <CheckItem label="At least 5 photos uploaded" />
                    <CheckItem label="High-res resolution check" />
                    <CheckItem label="Room specific galleries" />
                  </div>
                </GlassCard>
                <div className="p-6 rounded-[24px] bg-[#FCBC43]/10 border border-[#FCBC43]/20 flex gap-4">
                  <Info className="text-[#FCBC43] shrink-0" size={20} />
                  <p className="text-xs font-bold text-[#FCBC43] leading-relaxed italic">
                    Properties with verified professional photos see 4x more bookings on average.
                  </p>
                </div>
              </div>
            </div>
            <StepActions onNext={() => setStep("rooms")} onBack={() => setStep("details")} />
          </div>
        )}

        {step === "rooms" && (
          <div className="space-y-12 animate-in slide-in-from-bottom duration-700">
            <div className="text-center">
              <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tight mb-4">Inventory \u0026 Pricing</h2>
              <p className="text-[#0E5A75]/60 font-medium italic">Define your room categories and starting rate plans.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-[#053344] dark:text-white">Room Categories</h3>
                  <button className="p-2 rounded-xl bg-[#0E5A75] text-white"><Plus size={18} /></button>
                </div>
                <div className="space-y-4">
                  <RoomMiniCard name="Royal Heritage Suite" type="Suite" price="₹12,500" />
                  <RoomMiniCard name="Premium Garden Room" type="Deluxe" price="₹8,200" />
                  <button className="w-full py-4 rounded-2xl border-2 border-dashed border-[#0E5A75]/10 text-[#0E5A75]/40 font-black uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all">
                    Add another Room Type
                  </button>
                </div>
              </GlassCard>
              <GlassCard className="p-10 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black text-[#053344] dark:text-white">Global Policies</h3>
                  <Settings className="text-[#0E5A75]/40" size={20} />
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-5 rounded-2xl bg-[#0E5A75]/5 border border-[#0E5A75]/10">
                    <div>
                      <p className="text-xs font-black text-[#0E5A75] uppercase tracking-widest">Booking Mode</p>
                      <p className="text-sm font-bold text-[#053344] dark:text-white mt-1">Instant Booking</p>
                    </div>
                    <ChevronRight size={18} className="text-[#0E5A75]/40" />
                  </div>
                  <div className="flex justify-between items-center p-5 rounded-2xl bg-[#0E5A75]/5 border border-[#0E5A75]/10">
                    <div>
                      <p className="text-xs font-black text-[#0E5A75] uppercase tracking-widest">Cancellation</p>
                      <p className="text-sm font-bold text-[#053344] dark:text-white mt-1">Flexible (48h)</p>
                    </div>
                    <ChevronRight size={18} className="text-[#0E5A75]/40" />
                  </div>
                </div>
              </GlassCard>
            </div>
            <StepActions onNext={() => setStep("publish")} onBack={() => setStep("media")} />
          </div>
        )}

        {step === "publish" && (
          <div className="text-center space-y-12 animate-in fade-in zoom-in duration-1000">
            <div className="w-32 h-32 rounded-full bg-[#159665] flex items-center justify-center text-white mx-auto shadow-2xl shadow-[#159665]/40 relative">
              <CheckCircle2 size={64} className="fill-white/20" />
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
            </div>
            <div className="space-y-4">
              <h1 className="text-6xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Your property is <span className="text-[#159665]">now live.</span></h1>
              <p className="text-xl font-medium text-[#0E5A75]/60 max-w-2xl mx-auto leading-relaxed">
                Congratulations! Grand Heritage Resort \u0026 Spa is now accepting bookings globally.
              </p>
            </div>
            <div className="flex flex-col md:flex-row justify-center gap-6 pt-10">
              <button className="px-10 py-5 rounded-[24px] border-2 border-[#0E5A75] text-[#0E5A75] text-sm font-black uppercase tracking-[0.2em] hover:bg-[#0E5A75]/5 transition-all">
                Preview Listing
              </button>
              <button 
                onClick={() => window.location.href = '/partner/dashboard'}
                className="px-10 py-5 rounded-[24px] bg-[#0E5A75] text-white text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all"
              >
                Go to Dashboard
              </button>
            </div>
            <div className="pt-20 opacity-30">
              <div className="w-16 h-px bg-[#0E5A75] mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#0E5A75]">Home4Stay Hospitality OS</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Helper Components ---

function FeatureMini({ icon: Icon, label }: { icon: LucideIcon, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/10 flex items-center justify-center text-[#0E5A75] shadow-lg">
        <Icon size={20} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60">{label}</span>
    </div>
  );
}

function StepActions({ onNext, onBack, nextDisabled }: { onNext: () => void, onBack: () => void, nextDisabled?: boolean }) {
  return (
    <div className="flex justify-between items-center pt-10">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-[#0E5A75]/20 text-[#0E5A75] text-xs font-black uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all"
      >
        <ChevronLeft size={18} /> Back
      </button>
      <button 
        onClick={onNext}
        disabled={nextDisabled}
        className={cn(
          "flex items-center gap-2 px-12 py-5 rounded-2xl text-white text-sm font-black uppercase tracking-widest shadow-xl transition-all duration-300",
          nextDisabled ? "bg-gray-400 cursor-not-allowed opacity-50" : "bg-[#0E5A75] shadow-[#0E5A75]/20 hover:bg-[#0A4459] hover:translate-x-2"
        )}
      >
        Continue <ChevronRight size={20} />
      </button>
    </div>
  );
}

function CheckItem({ label, checked }: { label: string, checked?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        "w-5 h-5 rounded-md flex items-center justify-center border transition-all",
        checked ? "bg-[#159665] border-[#159665] text-white" : "border-black/10 dark:border-white/10 text-transparent"
      )}>
        <CheckCircle2 size={12} className="fill-current" />
      </div>
      <span className={cn("text-xs font-bold", checked ? "text-[#053344] dark:text-white" : "text-[#0E5A75]/40")}>{label}</span>
    </div>
  );
}

function RoomMiniCard({ name, type, price }: { name: string, type: string, price: string }) {
  return (
    <div className="flex justify-between items-center p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#0E5A75]/5 flex items-center justify-center text-[#0E5A75]"><Hotel size={18} /></div>
        <div>
          <h4 className="text-sm font-black text-[#053344] dark:text-white leading-none mb-1">{name}</h4>
          <p className="text-[10px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">{type}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs font-black text-[#159665]">{price}</p>
        <p className="text-[8px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">Base Rate</p>
      </div>
    </div>
  );
}

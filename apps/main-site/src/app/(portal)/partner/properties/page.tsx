"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  Plus, 
  Home, 
  Bed, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Settings, 
  Activity,
  Edit3,
  Wifi,
  Wind,
  Coffee,
  Tv,
  X,
  Camera,
  Layers,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

type PropertyStatus = "active" | "draft" | "maintenance" | "blocked";

interface Property {
  id: string;
  name: string;
  type: string;
  location: string;
  rooms: number;
  occupancy: string;
  rating: number;
  status: PropertyStatus;
  image: string;
}

interface RoomType {
  id: string;
  name: string;
  count: number;
  basePrice: number;
  amenities: string[];
}

// --- Mock Data ---

const PROPERTIES: Property[] = [
  {
    id: "shivay-resort-101",
    name: "Shivay Resort",
    type: "Resort",
    location: "Manali, Himachal Pradesh",
    rooms: 12,
    occupancy: "84%",
    rating: 4.8,
    status: "active",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "royal-villa-202",
    name: "Royal Villa",
    type: "Villa",
    location: "Goa",
    rooms: 4,
    occupancy: "90%",
    rating: 4.6,
    status: "active",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "taj-villa-303",
    name: "Taj Villa",
    type: "Villa",
    location: "Agra, Uttar Pradesh",
    rooms: 6,
    occupancy: "75%",
    rating: 4.9,
    status: "active",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "ocean-view-404",
    name: "Ocean View Resort",
    type: "Resort",
    location: "Varkala, Kerala",
    rooms: 15,
    occupancy: "88%",
    rating: 4.7,
    status: "active",
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=800"
  }
];

const ROOM_TYPES: RoomType[] = [
  { id: "RT-1", name: "Royal Heritage Suite", count: 4, basePrice: 12500, amenities: ["Wifi", "Bathtub", "Balcony", "AC"] },
  { id: "RT-2", name: "Premium Garden Room", count: 12, basePrice: 8500, amenities: ["Wifi", "AC", "Garden Access"] },
  { id: "RT-3", name: "Deluxe Mountain View", count: 8, basePrice: 6500, amenities: ["Wifi", "AC", "Smart TV"] },
];

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] p-6 hover-lift border border-white/5 dark:border-white/5 shadow-premium", className)}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default", className }: { children: React.ReactNode, variant?: string, className?: string }) => {
  const variants: Record<string, string> = {
    active: "bg-[#159665]/10 text-[#159665]",
    draft: "bg-gray-500/10 text-gray-500",
    maintenance: "bg-[#F24633]/10 text-[#F24633]",
    blocked: "bg-[#F24633]/10 text-[#F24633]",
    success: "bg-[#159665]/10 text-[#159665]",
    warning: "bg-[#FCBC43]/10 text-[#FCBC43]",
    info: "bg-[#0983B0]/10 text-[#0983B0]",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em]", variants[variant] || variants.info, className)}>
      {children}
    </span>
  );
};

// --- Main Page ---

export default function PropertiesPage() {
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [showRoomDetail, setShowRoomDetail] = useState(false);

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Inventory Management</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Property Portfolio</h1>
        </div>

        <button className="flex items-center gap-2 px-8 py-4 rounded-[24px] bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm font-black uppercase tracking-widest">Add New Property</span>
        </button>
      </div>

      {/* 2. Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Total Properties" value="03" icon={Home} color="text-[#0E5A75]" />
        <StatWidget label="Active Rooms" value="31" icon={Bed} color="text-[#159665]" />
        <StatWidget label="Avg Occupancy" value="76%" icon={Activity} color="text-[#0983B0]" />
        <StatWidget label="Draft Listings" value="01" icon={Edit3} color="text-[#FCBC43]" />
      </div>

      {/* 3. Main Content: Property Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {PROPERTIES.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            active={activeProperty?.id === property.id}
            onSelect={() => setActiveProperty(property)}
          />
        ))}
      </div>

      {/* 4. Room Management Section (Conditional) */}
      {activeProperty && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-[#0E5A75] rounded-full" />
              <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">
                Rooms in {activeProperty.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-5 py-2 rounded-xl glass-matte text-xs font-bold uppercase tracking-widest text-[#0E5A75] hover:bg-[#0E5A75] hover:text-white transition-all">
                Add Room Type
              </button>
              <button className="p-2 rounded-xl glass-matte text-[#0E5A75]">
                <Settings size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ROOM_TYPES.map((type) => (
              <RoomTypeCard 
                key={type.id} 
                type={type} 
                onEdit={() => setShowRoomDetail(true)}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Room Detail Drawer (Mock) */}
      {showRoomDetail && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-[#053344]/40 backdrop-blur-sm" onClick={() => setShowRoomDetail(false)} />
          <aside className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1D] shadow-luxury h-full animate-in slide-in-from-right duration-500 flex flex-col overflow-hidden">
            <div className="p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <Badge variant="info" className="mb-2">RT-104</Badge>
                <h2 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">Royal Heritage Suite</h2>
              </div>
              <button onClick={() => setShowRoomDetail(false)} className="p-3 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75]"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Photo Gallery Mock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Room Gallery</h3>
                  <button className="text-xs font-bold text-[#0983B0] flex items-center gap-1"><Camera size={14} /> Add Photos</button>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="aspect-video rounded-2xl bg-[#0E5A75]/10 border-2 border-dashed border-[#0E5A75]/20 flex items-center justify-center text-[#0E5A75]/40"><Plus /></div>
                  <div className="aspect-video rounded-2xl bg-gray-200" />
                  <div className="aspect-video rounded-2xl bg-gray-200" />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  <AmenityChip icon={Wifi} label="High-speed WiFi" active />
                  <AmenityChip icon={Wind} label="Air Conditioning" active />
                  <AmenityChip icon={Coffee} label="Mini Bar" active />
                  <AmenityChip icon={Tv} label="Smart TV" active />
                  <AmenityChip icon={Layers} label="King Bed" active />
                  <button className="px-4 py-2 rounded-xl border border-dashed border-[#0E5A75]/20 text-[#0E5A75]/40 text-xs font-bold uppercase tracking-widest hover:border-[#0E5A75]/40 transition-all">+ Add More</button>
                </div>
              </div>

              {/* Pricing Plans */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Rate Plans</h3>
                <div className="space-y-3">
                  <RatePlanItem plan="EP" price="12,500" detail="Room Only" />
                  <RatePlanItem plan="CP" price="14,200" detail="Room + Breakfast" />
                  <RatePlanItem plan="MAP" price="16,800" detail="Room + Breakfast + Lunch/Dinner" active />
                  <RatePlanItem plan="AP" price="19,500" detail="All Meals Included" />
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-black/5 dark:border-white/5 flex gap-3">
              <button className="flex-1 py-4 rounded-2xl border border-[#0E5A75]/20 text-[#0E5A75] font-black uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all">Save as Draft</button>
              <button className="flex-1 py-4 rounded-2xl bg-[#0E5A75] text-white font-black uppercase tracking-widest shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all">Update Room Type</button>
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
        <p className="text-[10px] font-black text-[#0E5A75]/50 uppercase tracking-widest mb-1">{label}</p>
        <p className={cn("text-3xl font-black leading-none", color)}>{value}</p>
      </div>
      <div className={cn("p-3 rounded-2xl bg-white dark:bg-white/5 shadow-inner", color)}>
        <Icon size={20} />
      </div>
    </GlassCard>
  );
}

function PropertyCard({ property, active, onSelect }: { property: Property, active: boolean, onSelect: () => void }) {
  return (
    <div 
      onClick={onSelect}
      className={cn(
        "group cursor-pointer rounded-[40px] overflow-hidden transition-all duration-500",
        active ? "ring-2 ring-[#0E5A75] ring-offset-8 dark:ring-offset-[#0A0F1D]" : "hover:translate-y-[-8px]"
      )}
    >
      <div className="relative h-64 overflow-hidden">
        <Image 
          src={property.image} 
          alt={property.name} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-6 right-6">
          <Badge variant={property.status}>{property.status}</Badge>
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info" className="bg-white/20 text-white border-none">{property.type}</Badge>
            <div className="flex items-center gap-1 text-white text-xs font-black">
              <Star size={12} className="text-[#FCBC43] fill-[#FCBC43]" />
              {property.rating}
            </div>
          </div>
          <h3 className="text-xl font-black text-white leading-tight">{property.name}</h3>
          <p className="text-xs text-white/70 font-medium flex items-center gap-1 mt-1"><MapPin size={12} /> {property.location}</p>
        </div>
      </div>
      
      <div className="p-6 bg-white dark:bg-[#0A0F1D] border border-black/5 dark:border-white/5 border-t-0 rounded-b-[40px] space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
            <p className="text-[9px] font-black text-[#0E5A75]/50 uppercase tracking-widest">Inventory</p>
            <p className="text-sm font-black text-[#053344] dark:text-white">{property.rooms} Rooms</p>
          </div>
          <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02]">
            <p className="text-[9px] font-black text-[#0E5A75]/50 uppercase tracking-widest">Occupancy</p>
            <p className="text-sm font-black text-[#159665]">{property.occupancy}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/5 dark:border-white/5">
          <button className="flex-1 py-2.5 rounded-xl bg-[#0E5A75]/5 text-[#0E5A75] text-[10px] font-black uppercase tracking-widest hover:bg-[#0E5A75] hover:text-white transition-all">Manage</button>
          <button className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#0E5A75]/40"><Edit3 size={16} /></button>
          <button className="p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#0E5A75]/40"><Settings size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function RoomTypeCard({ type, onEdit }: { type: RoomType, onEdit: () => void }) {
  return (
    <GlassCard className="p-6 flex flex-col h-full border-none shadow-premium bg-white/40 dark:bg-white/5">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-[10px] font-black text-[#0E5A75]/50 uppercase tracking-widest mb-1">{type.id}</p>
          <h4 className="text-lg font-black text-[#053344] dark:text-white tracking-tight leading-tight">{type.name}</h4>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#0E5A75]/5 flex items-center justify-center text-[#0E5A75]">
          <Bed size={20} />
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
          <span className="text-xs font-bold text-[#0E5A75]/60 uppercase tracking-widest">Available Units</span>
          <span className="text-sm font-black text-[#053344] dark:text-white">{type.count} Rooms</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
          <span className="text-xs font-bold text-[#0E5A75]/60 uppercase tracking-widest">Base Rate</span>
          <span className="text-lg font-black text-[#159665]">₹{type.basePrice.toLocaleString()}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {type.amenities.map(a => (
            <span key={a} className="px-2 py-0.5 rounded-lg bg-[#0E5A75]/5 text-[#0E5A75] text-[9px] font-black uppercase tracking-tighter">{a}</span>
          ))}
        </div>
      </div>

      <button 
        onClick={onEdit}
        className="mt-8 w-full py-3 rounded-xl border border-[#0E5A75]/20 text-[#0E5A75] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0E5A75] hover:text-white transition-all"
      >
        View Details & Pricing
      </button>
    </GlassCard>
  );
}

function AmenityChip({ icon: Icon, label, active }: { icon: LucideIcon, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all border",
      active 
        ? "bg-[#0E5A75] text-white border-transparent shadow-lg shadow-[#0E5A75]/20" 
        : "bg-white/50 dark:bg-white/5 text-[#0E5A75]/60 border-black/5 dark:border-white/5"
    )}>
      <Icon size={14} />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}

function RatePlanItem({ plan, price, detail, active }: { plan: string, price: string, detail: string, active?: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl flex items-center justify-between border transition-all",
      active 
        ? "bg-[#159665]/5 border-[#159665]/30" 
        : "bg-black/[0.01] dark:bg-white/[0.01] border-black/5 dark:border-white/5"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs shadow-inner",
          active ? "bg-[#159665] text-white" : "bg-[#0E5A75]/10 text-[#0E5A75]"
        )}>
          {plan}
        </div>
        <div>
          <p className="text-sm font-black text-[#053344] dark:text-white leading-none mb-1">₹{price}</p>
          <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest">{detail}</p>
        </div>
      </div>
      {active && <CheckCircle2 size={18} className="text-[#159665]" />}
    </div>
  );
}

"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { 
  Home, 
  Bed, 
  MapPin, 
  Star, 
  Settings, 
  Edit3,
  X,
  Globe,
  ExternalLink,
  Loader2,
  Trash2,
  BedDouble
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPropertyUrl } from "@/lib/utils/domains";
import Link from "next/link";
import RoomForm from "@/components/RoomForm";

// --- Types ---

type PropertyStatus = "active" | "draft" | "maintenance" | "blocked";

interface RoomType {
  id: string;
  name: string;
  roomCount: number;
  price: number;
  tags: string[];
  isActive: boolean;
  images: string[];
  capacity: string;
  view: string;
}

interface Property {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  type: string;
  location: string;
  rooms: RoomType[];
  totalInventory: number;
  occupancy: string | number;
  rating: number;
  status: PropertyStatus;
  image: string;
}

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
  const { user } = useAuth();
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchProperty = async () => {
    if (!user?.propertyId) return;
    try {
      const [res, statsRes] = await Promise.all([
        fetch(`/api/properties/${user.propertyId}`),
        fetch(`/api/partner/dashboard?propertyId=${user.propertyId}`)
      ]);

      if (res.ok) {
        const json = await res.json();
        const p = json.data || json;
        
        let occupancy: string | number = "N/A";
        if (statsRes.ok) {
            const statsJson = await statsRes.json();
            occupancy = statsJson.data?.stats?.occupancy != null ? `${statsJson.data.stats.occupancy}%` : "N/A";
        }

        const rawRooms: Array<Record<string, unknown>> = p.rooms || [];
        const mappedRooms: RoomType[] = rawRooms.map((r) => ({
            id: typeof r.id === 'string' ? r.id : "unknown-id",
            name: typeof r.name === 'string' ? r.name : "Room",
            roomCount: typeof r.roomCount === 'number' ? r.roomCount : 0,
            price: typeof r.price === 'number' ? r.price : 0,
            tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
            isActive: typeof r.isActive === 'boolean' ? r.isActive : true,
            images: Array.isArray(r.images) ? (r.images as string[]) : [],
            capacity: typeof r.capacity === 'string' ? r.capacity : "2 Guests",
            view: typeof r.view === 'string' ? r.view : "Standard"
        }));

        const totalInventory = mappedRooms.reduce((sum, room) => sum + room.roomCount, 0);

        const mappedProperty: Property = {
          id: p.id,
          name: p.title || p.name || user.propertyName || "My Property",
          slug: p.slug || p.id,
          subdomain: p.subdomain,
          type: p.propertyType || p.type || "Resort",
          location: p.location || "Location",
          rooms: mappedRooms,
          totalInventory,
          occupancy,
          rating: p.aggregateRating || 5.0,
          status: p.status === "LIVE" ? "active" : p.status === "MAINTENANCE" ? "maintenance" : p.status === "BLOCKED" ? "blocked" : "draft",
          image: p.mediaAssets?.[0]?.url || p.images?.[0] || "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=800"
        };
        setActiveProperty(mappedProperty);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.propertyId) {
      setLoading(false);
      return;
    }
    fetchProperty();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 rounded-full border-4 border-[#0E5A75]/20 border-t-[#0E5A75] animate-spin" />
      </div>
    );
  }

  if (!user?.propertyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#0E5A75]/40 mb-4">
          <Home size={32} />
        </div>
        <h2 className="text-2xl font-black text-[#053344] dark:text-white">No Property Assigned</h2>
        <p className="text-sm font-bold text-[#0E5A75]/60 max-w-md">
          Your partner account is not currently assigned to any property. Please contact administration for setup.
        </p>
      </div>
    );
  }

  if (!activeProperty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F24633]/10 flex items-center justify-center text-[#F24633] mb-4">
          <X size={32} />
        </div>
        <h2 className="text-2xl font-black text-[#053344] dark:text-white">Property Not Found</h2>
        <p className="text-sm font-bold text-[#0E5A75]/60 max-w-md">
          We could not load your assigned property data. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Property Dashboard</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">{activeProperty.name}</h1>
          <div className="flex items-center gap-3 mt-4">
            <Badge variant={activeProperty.status}>{activeProperty.status}</Badge>
            <span className="text-xs font-bold text-[#0E5A75]/60 flex items-center gap-1">
              <MapPin size={12} /> {activeProperty.location}
            </span>
          </div>
        </div>

        {activeProperty.status === "active" && (activeProperty.subdomain || activeProperty.slug) ? (
          <Link href={getPropertyUrl(activeProperty.subdomain || activeProperty.slug)} target="_blank" className="flex items-center gap-2 px-8 py-4 rounded-[24px] bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all group">
            <Globe size={20} className="group-hover:text-[#78D145] transition-colors" />
            <span className="text-sm font-black uppercase tracking-widest">Public Website</span>
            <ExternalLink size={14} className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : (
          <div className="flex items-center gap-2 px-8 py-4 rounded-[24px] bg-gray-500/10 text-gray-500 border border-gray-500/20 cursor-not-allowed">
            <Globe size={20} />
            <span className="text-sm font-black uppercase tracking-widest">Website Offline</span>
          </div>
        )}
      </div>

      {/* 2. Main Detail Card */}
      <div className="group rounded-[40px] overflow-hidden transition-all duration-500 bg-white dark:bg-[#0A0F1D] border border-black/5 dark:border-white/5 shadow-luxury">
        <div className="relative h-64 md:h-80 overflow-hidden">
          <Image 
            src={activeProperty.image} 
            alt={activeProperty.name} 
            fill 
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="info" className="bg-white/20 text-white border-none">{activeProperty.type}</Badge>
                <div className="flex items-center gap-1 text-white text-xs font-black">
                  <Star size={12} className="text-[#FCBC43] fill-[#FCBC43]" />
                  {activeProperty.rating.toFixed(1)}
                </div>
              </div>
            </div>
            <button disabled className="opacity-50 cursor-not-allowed px-5 py-2.5 rounded-xl bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
              Update Cover
            </button>
          </div>
        </div>
        
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-3xl bg-[#0E5A75]/5 dark:bg-white/5 border border-[#0E5A75]/10">
              <p className="text-[9px] font-black text-[#0E5A75]/50 uppercase tracking-widest mb-1">Total Inventory</p>
              <p className="text-2xl font-black text-[#053344] dark:text-white leading-none">{activeProperty.totalInventory} Rooms</p>
            </div>
            <div className="p-4 rounded-3xl bg-[#159665]/5 dark:bg-white/5 border border-[#159665]/10">
              <p className="text-[9px] font-black text-[#159665]/70 uppercase tracking-widest mb-1">Current Occupancy</p>
              <p className="text-2xl font-black text-[#159665] leading-none">{activeProperty.occupancy}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button disabled className="opacity-50 cursor-not-allowed flex items-center gap-2 px-5 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[#053344] dark:text-white text-[10px] font-black uppercase tracking-widest">
              <Edit3 size={14} /> Edit Info
            </button>
            <button disabled className="opacity-50 cursor-not-allowed flex items-center gap-2 px-5 py-3 rounded-xl bg-black/5 dark:bg-white/5 text-[#053344] dark:text-white text-[10px] font-black uppercase tracking-widest">
              <Settings size={14} /> Configuration
            </button>
          </div>
        </div>
      </div>

      {/* 3. Room Management Section */}
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-[#0E5A75] rounded-full" />
            <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">
              Room Types
            </h2>
          </div>
          <Link href="/partner/rooms" className="px-5 py-2 rounded-xl glass-matte text-xs font-bold uppercase tracking-widest text-[#0E5A75] hover:bg-[#0E5A75] hover:text-white transition-all">
            Manage Room Types
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeProperty.rooms.length === 0 ? (
             <div className="col-span-full py-10 text-center text-[#0E5A75]/40 text-sm font-bold uppercase tracking-widest border-2 border-dashed border-[#0E5A75]/10 rounded-[32px]">
                No Room Types Found
             </div>
          ) : activeProperty.rooms.map((type) => (
            <div key={type.id} className="relative">
              <RoomTypeCard 
                type={type} 
                editingRoomId={editingRoomId}
                setEditingRoomId={setEditingRoomId}
                actionLoadingId={actionLoadingId}
                setActionLoadingId={setActionLoadingId}
                onRefresh={() => fetchProperty()}
                propertySlug={activeProperty.slug}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function RoomTypeCard({ 
  type, 
  editingRoomId, 
  setEditingRoomId, 
  actionLoadingId, 
  setActionLoadingId, 
  onRefresh, 
  propertySlug 
}: { 
  type: RoomType;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  actionLoadingId: string | null;
  setActionLoadingId: (id: string | null) => void;
  onRefresh: () => void;
  propertySlug: string;
}) {
  const isEditing = editingRoomId === type.id;
  const isActionLoading = actionLoadingId === type.id;

  const handleDeactivate = async (currentlyActive: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlyActive ? 'deactivate' : 'activate'} this room type?`)) return;
    setActionLoadingId(type.id);
    try {
      const res = await fetch("/api/property/room", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: type.id, isActive: !currentlyActive })
      });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error?.message || data.message || "Failed to update room.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${type.name}?`)) return;
    setActionLoadingId(type.id);
    try {
      const res = await fetch(`/api/property/room?id=${type.id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error?.message || data.message || "Failed to delete room.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isEditing) {
    return (
      <div className="col-span-full xl:col-span-2 glass-matte p-6 rounded-[32px] border-white/20 animate-in fade-in zoom-in-95 duration-300">
        <RoomForm 
          slug={propertySlug} 
          initialData={type} 
          onSuccess={() => { setEditingRoomId(null); onRefresh(); }} 
          onCancel={() => setEditingRoomId(null)}
        />
      </div>
    );
  }

  return (
    <GlassCard className={cn("p-6 flex flex-col h-full border-none shadow-premium bg-white/40 dark:bg-white/5 transition-all duration-300", !type.isActive && "opacity-60 grayscale")}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", type.isActive ? "bg-[#159665]/10 text-[#159665]" : "bg-red-500/10 text-red-500")}>
              {type.isActive ? "? Active" : "? Inactive"}
            </span>
            <p className="text-[10px] font-black text-[#0E5A75]/50 uppercase tracking-widest opacity-50 truncate max-w-[150px]">{type.id}</p>
          </div>
          <h4 className="text-lg font-black text-[#053344] dark:text-white tracking-tight leading-tight line-clamp-2">{type.name}</h4>
        </div>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#0E5A75]/5 flex items-center justify-center text-[#0E5A75]">
          <Bed size={20} />
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
          <span className="text-xs font-bold text-[#0E5A75]/60 uppercase tracking-widest">Available Units</span>
          <span className="text-sm font-black text-[#053344] dark:text-white flex items-center gap-1.5"><BedDouble size={14} className="opacity-50" /> {type.roomCount} Rooms</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
          <span className="text-xs font-bold text-[#0E5A75]/60 uppercase tracking-widest">Base Rate</span>
          <span className="text-lg font-black text-[#159665]">?{type.price.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            disabled={isActionLoading}
            onClick={() => handleDeactivate(type.isActive)}
            className={cn("py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50", type.isActive ? "bg-[#0E5A75]/5 text-[#0E5A75] hover:bg-[#0E5A75]/10" : "bg-[#159665]/10 text-[#159665] hover:bg-[#159665]/20")}
          >
            {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : type.isActive ? <Settings size={12} /> : <BedDouble size={12} />}
            {type.isActive ? "Deactivate" : "Activate"}
          </button>
          
          <button 
            disabled={isActionLoading}
            onClick={() => setEditingRoomId(type.id)}
            className="py-2.5 rounded-xl bg-[#0983B0]/10 text-[#0983B0] hover:bg-[#0983B0]/20 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Edit3 size={12} /> Edit
          </button>
        </div>
        
        <button 
          disabled={isActionLoading}
          onClick={handleDelete}
          className="w-full py-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          Delete Suite
        </button>
      </div>
    </GlassCard>
  );
}

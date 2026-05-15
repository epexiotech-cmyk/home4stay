"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { 
  Search, 
  Filter, 
  Calendar, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone,
  Phone,
  MessageSquare,
  Download,
  Lock,
  User,
  Home,
  CreditCard,
  TrendingUp,
  Star,
  FileText,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type BookingStatus = "pending" | "payment_pending" | "confirmed" | "checked_in" | "completed" | "cancelled";
type PaymentStatus = "paid" | "partial" | "pending" | "refunded";
type BookingSource = "Home4Stay" | "Direct" | "Walk-in" | "WhatsApp" | "Phone";

interface Booking {
  id: string;
  guestName: string;
  guestAvatar?: string;
  source: BookingSource;
  propertyName: string;
  roomName: string;
  roomFeatures: string[];
  mealPlan: "EP" | "CP" | "MAP" | "AP";
  checkIn: string;
  checkOut: string;
  guests: { adults: number; children: number };
  amount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
}


interface DbBooking {
  id: string;
  guest_name: string;
  source: string;
  property_name: string;
  room_name: string;
  meal_plan: "EP" | "CP" | "MAP" | "AP";
  start_date: string;
  end_date: string;
  amount: number;
  payment_status: string;
  status: string;
  created_at: string;
}

// --- Sub-components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-premium rounded-[32px] p-6 hover-lift border border-white/60 dark:border-[#0E5A75]/20 shadow-xl shadow-[#0E5A75]/5 dark:shadow-none", className)}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "danger" | "info", className?: string }) => {
  const variants = {
    default: "bg-[#0E5A75]/10 text-[#0E5A75]",
    success: "bg-[#159665]/10 text-[#159665]",
    warning: "bg-[#FCBC43]/10 text-[#FCBC43]",
    danger: "bg-[#F24633]/10 text-[#F24633]",
    info: "bg-[#0983B0]/10 text-[#0983B0]",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[variant], className)}>
      {children}
    </span>
  );
};

const StatusTab = ({ label, count, active, onClick }: { label: string, count?: number, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap",
      active 
        ? "bg-[#0E5A75] text-white shadow-lg shadow-[#0E5A75]/20" 
        : "text-[#0E5A75] dark:text-[#0983B0] hover:bg-[#0E5A75]/5"
    )}
  >
    <span className="text-sm font-bold">{label}</span>
    {count !== undefined && (
      <span className={cn(
        "px-2 py-0.5 rounded-lg text-[10px] font-black",
        active ? "bg-white/20 text-white" : "bg-[#0E5A75]/10 text-[#0E5A75]"
      )}>
        {count}
      </span>
    )}
  </button>
);

const SourceBadge = ({ source }: { source: BookingSource }) => {
  const config = {
    Home4Stay: { icon: Home, color: "bg-[#0E5A75] text-white" },
    Direct: { icon: User, color: "bg-[#0983B0] text-white" },
    "Walk-in": { icon: CheckCircle2, color: "bg-[#159665] text-white" },
    WhatsApp: { icon: MessageSquare, color: "bg-[#25D366] text-white" },
    Phone: { icon: Phone, color: "bg-gray-600 text-white" },
  };
  const { icon: Icon, color } = config[source];
  return (
    <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-lg", color)}>
      <Icon size={10} />
      <span className="text-[9px] font-bold uppercase tracking-tighter">{source}</span>
    </div>
  );
};

// --- Sections ---

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus>("pending");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        if (response.ok) {
          const data = await response.json();
          // Map DB schema to UI interface
          const mapped = data.map((b: DbBooking) => ({
            id: b.id.substring(0, 8).toUpperCase(),
            guestName: b.guest_name,
            source: b.source as BookingSource,
            propertyName: b.property_name,
            roomName: b.room_name,
            roomFeatures: [], // Could be fetched if needed
            mealPlan: b.meal_plan,
            checkIn: new Date(b.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            checkOut: new Date(b.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            guests: { adults: 2, children: 0 }, // Defaulting for now
            amount: b.amount,
            paymentStatus: b.payment_status.toLowerCase() as PaymentStatus,
            status: b.status as BookingStatus,
            createdAt: new Date(b.created_at).toLocaleDateString()
          }));
          setBookings(mapped);
        }
      } catch (error) {
        console.error("Fetch bookings failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Operational PMS</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Booking Management</h1>
          <p className="text-[#0E5A75] dark:text-[#0983B0] mt-3 font-medium text-lg">Manage reservations and guest check-ins efficiently.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <StatMini label="Pending" value="08" icon={AlertCircle} color="text-[#F24633]" />
          <StatMini label="Occupancy" value="84%" icon={TrendingUp} color="text-[#159665]" />
          <StatMini label="Today's C/I" value="12" icon={Calendar} color="text-[#0983B0]" />
        </div>
      </div>

      {/* 2. Search & Quick Actions */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 w-full gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E5A75]/40 group-focus-within:text-[#0E5A75] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search guest, ID, or phone..." 
              className="w-full pl-12 pr-4 py-4 rounded-[24px] bg-white/50 dark:bg-white/5 border border-white dark:border-[#0E5A75]/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 focus:border-[#0E5A75] transition-all text-[#053344] dark:text-white font-medium"
            />
          </div>
          <button className="p-4 rounded-[24px] glass-premium text-[#0E5A75] hover:bg-[#0E5A75] hover:text-white transition-all shadow-sm">
            <Filter size={20} />
          </button>
          <button className="hidden sm:flex items-center gap-2 px-6 py-4 rounded-[24px] glass-premium text-[#0E5A75] hover:bg-[#0E5A75] hover:text-white transition-all shadow-sm">
            <Calendar size={20} />
            <span className="text-sm font-bold">May 08 - May 15</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          <ActionButton label="Offline" icon={Plus} />
          <ActionButton label="Block" icon={Lock} />
          <ActionButton label="Check-In" icon={CheckCircle2} />
          <ActionButton label="Export" icon={Download} />
        </div>
      </div>

      {/* 3. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Bookings List */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
            <StatusTab label="Pending" count={8} active={activeTab === "pending"} onClick={() => setActiveTab("pending")} />
            <StatusTab label="Payment Pending" count={3} active={activeTab === "payment_pending"} onClick={() => setActiveTab("payment_pending")} />
            <StatusTab label="Confirmed" count={24} active={activeTab === "confirmed"} onClick={() => setActiveTab("confirmed")} />
            <StatusTab label="Checked In" count={12} active={activeTab === "checked_in"} onClick={() => setActiveTab("checked_in")} />
            <StatusTab label="Completed" active={activeTab === "completed"} onClick={() => setActiveTab("completed")} />
            <StatusTab label="Cancelled" active={activeTab === "cancelled"} onClick={() => setActiveTab("cancelled")} />
          </div>

          {/* Booking Cards */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 glass-premium rounded-[32px]">
                <Loader2 size={40} className="animate-spin text-[#0E5A75]" />
                <p className="text-sm font-bold text-[#0E5A75] uppercase tracking-widest">Synchronizing PMS...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 glass-premium rounded-[32px]">
                <p className="text-[#0E5A75]/60 font-bold">No reservations found in this category.</p>
              </div>
            ) : (
              bookings
                .filter(b => activeTab === "pending" ? (b.status === "pending" || b.status === "confirmed") : b.status === activeTab)
                .map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
            )}
          </div>

          <button className="w-full py-4 rounded-[24px] border-2 border-dashed border-[#0E5A75]/20 text-[#0E5A75]/40 font-bold hover:border-[#0E5A75]/40 hover:text-[#0E5A75]/60 transition-all">
            Load More Reservations
          </button>
        </div>

        {/* Right Column: Activity & Insights */}
        <div className="space-y-6">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-widest">Live Activity</h3>
              <div className="w-2 h-2 rounded-full bg-[#159665] animate-pulse" />
            </div>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[#0E5A75]/10">
              <ActivityItem 
                title="New Booking" 
                detail="Ananya Sharma (B-88241)" 
                time="2 mins ago" 
                icon={Plus} 
                color="bg-[#159665]" 
              />
              <ActivityItem 
                title="Payment Received" 
                detail="₹45,200 from Home4Stay" 
                time="15 mins ago" 
                icon={CreditCard} 
                color="bg-[#0983B0]" 
              />
              <ActivityItem 
                title="Check-in" 
                detail="Priya Das (B-88230)" 
                time="1 hour ago" 
                icon={CheckCircle2} 
                color="bg-[#0E5A75]" 
              />
              <ActivityItem 
                title="Review Posted" 
                detail="5 stars from Sahil K." 
                time="2 hours ago" 
                icon={Star} 
                color="bg-[#FCBC43]" 
              />
            </div>
          </GlassCard>

          <GlassCard className="p-5 bg-[#0E5A75]/10 dark:bg-[#0E5A75] text-[#0E5A75] dark:text-white border-none shadow-none">
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-80 dark:opacity-100">Occupancy Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-2xl font-black">12/15</p>
                  <p className="text-[10px] uppercase font-bold opacity-70 dark:opacity-60">Rooms Occupied</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">84%</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <TrendingUp size={12} className="text-[#159665]" />
                    <span className="text-[10px] font-bold text-[#159665] uppercase tracking-tighter">+5% vs last week</span>
                  </div>
                </div>
              </div>
              <div className="h-2 w-full bg-[#0E5A75]/20 dark:bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#0E5A75] dark:bg-white rounded-full w-[84%] shadow-lg shadow-[#0E5A75]/20 dark:shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
    </div>
  );
}

// --- Helper Components ---

function StatMini({ label, value, icon: Icon, color }: { label: string, value: string, icon: LucideIcon, color: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 rounded-2xl glass-premium shadow-sm border border-white/40">
      <div className={cn("p-2 rounded-xl bg-white shadow-inner", color)}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xl font-black text-[#053344] dark:text-white leading-none">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ label, icon: Icon }: { label: string, icon: LucideIcon }) {
  return (
    <button className="flex items-center gap-2 px-6 py-4 rounded-[24px] bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] hover:-translate-y-0.5 transition-all whitespace-nowrap">
      <Icon size={18} />
      <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <GlassCard className="p-0 overflow-hidden group">
      <div className="flex flex-col xl:flex-row">
        
        {/* 1. Guest & Source Info */}
        <div className="p-6 xl:w-72 xl:border-r border-[#0E5A75]/5 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/10">
              {booking.guestName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0983B0] uppercase tracking-[0.2em] mb-0.5">{booking.id}</p>
              <h3 className="text-lg font-black text-[#053344] dark:text-white leading-tight">{booking.guestName}</h3>
              <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest mt-1">{booking.createdAt}</p>
            </div>
          </div>
          <SourceBadge source={booking.source} />
        </div>

        {/* 2. Stay Details */}
        <div className="flex-1 p-6 flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#0E5A75]/5 text-[#0E5A75]"><Home size={16} /></div>
              <div>
                <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest leading-none mb-1">Property & Room</p>
                <p className="text-sm font-bold text-[#053344] dark:text-white">{booking.propertyName}</p>
                <p className="text-xs font-medium text-[#0983B0] mt-0.5">{booking.roomName} • {booking.mealPlan}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {booking.roomFeatures.map(f => (
                <span key={f} className="px-2 py-0.5 rounded-lg bg-[#0E5A75]/5 text-[#0E5A75] text-[9px] font-bold uppercase tracking-tighter">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 border-l border-[#0E5A75]/5 pl-8 hidden md:block">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#0E5A75]/5 text-[#0E5A75]"><Calendar size={16} /></div>
              <div>
                <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest leading-none mb-1">Dates & Guests</p>
                <p className="text-sm font-bold text-[#053344] dark:text-white">{booking.checkIn} - {booking.checkOut}</p>
                <p className="text-xs font-medium text-[#0983B0] mt-0.5">{booking.guests.adults} Adults, {booking.guests.children} Child</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Financials & Status */}
        <div className="p-6 xl:w-64 bg-[#0E5A75]/5 dark:bg-white/5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest leading-none mb-1">Booking Value</p>
            <p className="text-2xl font-black text-[#053344] dark:text-white">₹{booking.amount.toLocaleString()}</p>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest">Payment</span>
              <Badge variant={booking.paymentStatus === "paid" ? "success" : "warning"}>{booking.paymentStatus}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest">Status</span>
              <Badge variant={booking.status === "confirmed" ? "info" : booking.status === "pending" ? "warning" : "success"}>{booking.status.replace('_', ' ')}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Bar */}
      <div className="px-6 py-4 border-t border-[#0E5A75]/5 flex flex-wrap items-center justify-between gap-4 bg-white/30 dark:bg-transparent">
        <div className="flex items-center gap-2">
          <ActionButtonIcon icon={Smartphone} label="WhatsApp" color="hover:text-[#25D366] hover:bg-[#25D366]/5" />
          <ActionButtonIcon icon={Phone} label="Call" color="hover:text-[#0983B0] hover:bg-[#0983B0]/5" />
          <ActionButtonIcon icon={FileText} label="Invoice" color="hover:text-[#0E5A75] hover:bg-[#0E5A75]/5" />
        </div>
        
        <div className="flex items-center gap-2">
          {booking.status === "pending" ? (
            <>
              <button className="px-6 py-2.5 rounded-xl bg-[#F24633]/10 text-[#F24633] text-xs font-bold uppercase tracking-wider hover:bg-[#F24633] hover:text-white transition-all">Reject</button>
              <button className="px-6 py-2.5 rounded-xl bg-[#159665] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0E7A4E] transition-all shadow-lg shadow-[#159665]/20">Approve</button>
            </>
          ) : booking.status === "confirmed" ? (
            <button className="px-8 py-2.5 rounded-xl bg-[#0E5A75] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0A4459] transition-all shadow-lg shadow-[#0E5A75]/20">Start Check-In</button>
          ) : (
            <button className="px-6 py-2.5 rounded-xl border border-[#0E5A75]/20 text-[#0E5A75] text-xs font-bold uppercase tracking-wider hover:bg-[#0E5A75]/5 transition-all">View Details</button>
          )}
          <button className="p-2.5 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75]/40 hover:text-[#0E5A75] transition-all"><MoreVertical size={18} /></button>
        </div>
      </div>
    </GlassCard>
  );
}

function ActionButtonIcon({ icon: Icon, label, color }: { icon: LucideIcon, label: string, color: string }) {
  return (
    <button className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-[#0E5A75]/60 transition-all text-xs font-bold", color)}>
      <Icon size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ActivityItem({ title, detail, time, icon: Icon, color }: { title: string, detail: string, time: string, icon: LucideIcon, color: string }) {
  return (
    <div className="flex gap-4 relative">
      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 z-10 shadow-lg", color)}>
        <Icon size={12} />
      </div>
      <div>
        <p className="text-[13px] font-bold text-[#053344] dark:text-white leading-tight">{title}</p>
        <p className="text-[11px] text-[#0E5A75]/60 font-medium mb-1 leading-tight mt-0.5">{detail}</p>
        <p className="text-[9px] font-bold text-[#0983B0] uppercase tracking-tighter">{time}</p>
      </div>
    </div>
  );
}

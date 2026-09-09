"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { 
  Calendar, 
  Plus, 
  MoreVertical, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone,
  Phone,
  MessageSquare,
  Lock,
  User,
  Home,
  CreditCard,
  TrendingUp,
  FileText,
  LucideIcon,
  RefreshCcw,
  Zap,
  Volume2,
  VolumeX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { soundManager } from "@/lib/utils/soundManager";

// --- Types & Data ---

type BookingStatus = "pending" | "payment_pending" | "confirmed" | "checked_in" | "completed" | "cancelled" | "rejected" | "expired";
type PaymentStatus = "paid" | "partial" | "pending" | "refunded" | "under_owner_verification" | "payment_submitted" | "rejected" | "pending_payment" | "confirmed";
type BookingSource = "Home4Stay" | "Direct" | "Walk-in" | "WhatsApp" | "Phone";

interface Booking {
  guestPhone?: string;
  id: string; // display ID
  rawId: string; // actual database uuid
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
  paymentMode?: string | null;
  paymentReference?: string | null;
  utrNumber?: string | null;
}


const parsePrismaBooking = (b: Record<string, unknown>) => {
  const guestsArray = Array.isArray(b.guests) ? b.guests : [];
  const primaryGuest = guestsArray.find((g: Record<string, unknown>) => g.isPrimaryGuest) || guestsArray[0];
  const guestName = primaryGuest && primaryGuest.guest ? (primaryGuest.guest.firstName + ' ' + (primaryGuest.guest.lastName || '')).trim() : 'Unknown Guest';
  return {
    id: String(b.id || '').substring(0, 8).toUpperCase(),
    rawId: String(b.id || ''),
    guestName,
    source: (b.source || 'Direct') as BookingSource,
    propertyName: (b.property as {title?: string})?.title || 'Unknown Property',
    roomName: (b.room as {title?: string})?.title || 'Unknown Room',
    roomFeatures: [],
    mealPlan: (b.mealPlan || b.meal_plan) as "EP" | "CP" | "MAP" | "AP",
    checkIn: new Date(b.startDate as string || b.start_date as string || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    checkOut: new Date(b.endDate as string || b.end_date as string || new Date()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    guests: {
      adults: guestsArray.filter((g: Record<string, unknown>) => g.occupancyRole === 'Adult' || g.occupancy_role === 'Adult').length || 0,
      children: guestsArray.filter((g: Record<string, unknown>) => g.occupancyRole === 'Child' || g.occupancy_role === 'Child').length || 0
    },
    amount: b.amount || 0,
    paymentStatus: String(b.paymentStatus || b.payment_status || 'pending').toLowerCase() as PaymentStatus,
    status: (b.status || 'PENDING') as BookingStatus,
    createdAt: new Date(b.createdAt as string || b.created_at as string || new Date()).toLocaleDateString(),
    paymentMode: b.paymentMode || b.payment_mode,
    paymentReference: b.paymentReference || b.payment_reference,
    utrNumber: b.utrNumber || b.utr_number,
    guestPhone: primaryGuest && primaryGuest.guest ? primaryGuest.guest.phone : undefined
  };
};

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
  payment_mode?: string | null;
  payment_reference?: string | null;
  utr_number?: string | null;
  guests?: { occupancyRole?: string; occupancy_role?: string }[];
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

  // Real-time Visual Alerts & Sound States
  const [liveAlert, setLiveAlert] = useState<{ message: string; type: "info" | "success" | "warning" } | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [soundAllowed, setSoundAllowed] = useState(true);

  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const json = await response.json();
        const data = json.success && json.data ? json.data : json;
        // Map DB schema to UI interface
        const actualData = data.data?.data || data.data || data || [];
        const mapped = actualData.map((b: Record<string, unknown>) => parsePrismaBooking(b));
        setBookings(mapped);
      }
    } catch (error) {
      console.error("Fetch bookings failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      // Defer to next tick to avoid synchronous setState inside the effect body
      await Promise.resolve();
      if (active) {
        fetchBookings();
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [fetchBookings]);

  // Initialize Sound Alert Settings on mount
  useEffect(() => {
    let active = true;
    const initSound = async () => {
      await Promise.resolve();
      if (active) {
        setIsSoundMuted(soundManager.getMuteStatus());
        setSoundAllowed(soundManager.checkAutoplayPermission());
      }
    };
    initSound();
    return () => {
      active = false;
    };
  }, []);

  // Establish Server-Sent Events (SSE) Stream Listener
  useEffect(() => {
    let sse: EventSource | null = null;

    const connectSSE = () => {
      if (typeof window === "undefined") return;
      try {
        console.log("[RealtimeSSE] Subscribing Host dashboard to real-time events...");
        sse = new EventSource("/api/realtime/events");

        sse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("[RealtimeSSE] Event broadcasted on host:", data);

            // Trigger data list refresh to update queues and counts in real-time
            fetchBookings();

            if (data.type === "PAYMENT_SUBMITTED") {
              // Trigger premium synthesized dual-chime audio
              soundManager.playAlert();
              setSoundAllowed(soundManager.checkAutoplayPermission());

              setLiveAlert({
                message: `New Guest Payment Proof! UTR: ${data.utrNumber || 'Pending'} (BKG-${data.bookingId.substring(0, 8).toUpperCase()})`,
                type: "info"
              });
            } else if (data.type === "BOOKING_CONFIRMED") {
              setLiveAlert({
                message: `Stay verified successfully. Unique invoice generated.`,
                type: "success"
              });
            } else if (data.type === "PAYMENT_REJECTED") {
              setLiveAlert({
                message: `Payment proof declined. capacity restored.`,
                type: "warning"
              });
            } else if (data.type === "BOOKING_EXPIRED") {
              setLiveAlert({
                message: `Booking hold expired. holds released.`,
                type: "warning"
              });
            }
          } catch (e) {
            console.error("[RealtimeSSE] Failed to parse event message:", e);
          }
        };

        sse.onerror = (err) => {
          console.warn("[RealtimeSSE] SSE pipeline interrupted, attempting reconnection...", err);
          if (sse) sse.close();
          setTimeout(connectSSE, 10000); // Backoff retry
        };
      } catch (err) {
        console.error("[RealtimeSSE] Failed to construct SSE stream channel:", err);
      }
    };

    connectSSE();

    return () => {
      if (sse) sse.close();
    };
  }, [fetchBookings]);

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Real-time Dynamic Toast Notification */}
      {liveAlert && (
        <div className={cn(
          "fixed top-6 right-6 z-50 p-5 rounded-3xl shadow-2xl flex items-center justify-between gap-6 max-w-md border animate-in slide-in-from-top-10 duration-300 backdrop-blur-md",
          liveAlert.type === "success" ? "bg-emerald-500/10 dark:bg-emerald-950/35 border-emerald-500/20 text-emerald-900 dark:text-emerald-300" :
          liveAlert.type === "warning" ? "bg-amber-500/10 dark:bg-amber-950/35 border-amber-500/20 text-amber-900 dark:text-amber-300" :
          "bg-[#0E5A75]/10 dark:bg-cyan-950/35 border-[#0E5A75]/20 text-[#053344] dark:text-cyan-300"
        )}>
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className={cn(
              liveAlert.type === "success" ? "text-emerald-500" :
              liveAlert.type === "warning" ? "text-amber-500" :
              "text-[#0E5A75]"
            )} />
            <span className="text-xs font-bold leading-relaxed">{liveAlert.message}</span>
          </div>
          <button 
            onClick={() => setLiveAlert(null)} 
            className="px-3 py-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 1. Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Operational PMS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#053344] dark:text-white tracking-tight">Reservations Queue</h1>
        </div>
        
        {/* Verification Alert Indicator for Host Dashboard */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#FCBC43]/15 border border-[#FCBC43]/20">
            <AlertCircle size={16} className="text-[#FCBC43] animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#053344] dark:text-[#FCBC43]">
              {bookings.filter(b => b.paymentStatus === "under_owner_verification" || b.paymentStatus === "payment_submitted").length} Pending UPI Verifications
            </span>
          </div>

          {/* Sound Controls */}
          <button 
            onClick={() => {
              soundManager.init(); // Unlock context
              const nextMuted = !isSoundMuted;
              soundManager.setMute(nextMuted);
              setIsSoundMuted(nextMuted);
              setSoundAllowed(soundManager.checkAutoplayPermission());
            }}
            className={cn(
              "flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all text-xs font-bold uppercase tracking-wider backdrop-blur-sm",
              isSoundMuted 
                ? "bg-red-500/5 text-red-500 border-red-500/10 hover:bg-red-500/10" 
                : "bg-emerald-500/5 text-emerald-500 border-emerald-500/10 hover:bg-emerald-500/10"
            )}
          >
            {isSoundMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            {isSoundMuted ? "Muted" : "Active"}
          </button>

          {!soundAllowed && !isSoundMuted && (
            <button
              onClick={() => {
                soundManager.init();
                setSoundAllowed(soundManager.checkAutoplayPermission());
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold uppercase tracking-wider animate-pulse"
            >
              🔊 Unblock Sound
            </button>
          )}
          
          <button 
            onClick={fetchBookings}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#0E5A75]/5 text-[#0E5A75] dark:text-white hover:bg-[#0E5A75]/10 border border-black/5 dark:border-white/5 transition-all text-xs font-bold uppercase tracking-wider"
          >
            <RefreshCcw size={14} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#0E5A75]/10 overflow-x-auto pb-2 scrollbar-none">
        <StatusTab 
          label="Verification Needed" 
          count={bookings.filter(b => b.status === "pending" && (b.paymentStatus === "under_owner_verification" || b.paymentStatus === "payment_submitted")).length} 
          active={activeTab === "pending"} 
          onClick={() => setActiveTab("pending")} 
        />
        <StatusTab 
          label="Confirmed Stays" 
          count={bookings.filter(b => b.status === "confirmed").length} 
          active={activeTab === "confirmed"} 
          onClick={() => setActiveTab("confirmed")} 
        />
        <StatusTab 
          label="Payment Pending" 
          count={bookings.filter(b => b.status === "pending" && b.paymentStatus === "pending_payment").length} 
          active={activeTab === "payment_pending"} 
          onClick={() => setActiveTab("payment_pending")} 
        />
        <StatusTab 
          label="Checked-In" 
          count={bookings.filter(b => b.status === "checked_in").length} 
          active={activeTab === "checked_in"} 
          onClick={() => setActiveTab("checked_in")} 
        />
        <StatusTab 
          label="Completed" 
          count={bookings.filter(b => b.status === "completed").length} 
          active={activeTab === "completed"} 
          onClick={() => setActiveTab("completed")} 
        />
        <StatusTab 
          label="Cancelled" 
          count={bookings.filter(b => b.status === "cancelled" || b.status === "rejected").length} 
          active={activeTab === "cancelled"} 
          onClick={() => setActiveTab("cancelled")} 
        />
      </div>

      {/* 3. Main Dashboard Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Bookings List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={36} className="text-[#0E5A75] animate-spin" />
                <p className="text-xs font-black uppercase text-[#0E5A75]/50 tracking-widest">Loading bookings matrix...</p>
              </div>
            ) : bookings.filter(b => {
              if (activeTab === "pending") {
                // Focus on verification needed
                return b.status === "pending" && (b.paymentStatus === "under_owner_verification" || b.paymentStatus === "payment_submitted");
              }
              if (activeTab === "payment_pending") {
                return b.status === "pending" && b.paymentStatus === "pending_payment";
              }
              if (activeTab === "cancelled") {
                return b.status === "cancelled" || b.status === "rejected";
              }
              return b.status === activeTab;
            }).length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed border-[#0E5A75]/10 rounded-[32px] bg-white/50 dark:bg-white/5 space-y-3">
                <CheckCircle2 size={36} className="mx-auto text-[#159665]/60" />
                <h4 className="text-lg font-black text-[#053344] dark:text-white uppercase tracking-widest">No Reservations Found</h4>
                <p className="text-xs font-bold text-[#0E5A75]/50 uppercase tracking-widest">There are no stays registered in this status category.</p>
              </div>
            ) : (
              bookings
                .filter(b => {
                  if (activeTab === "pending") {
                    return b.status === "pending" && (b.paymentStatus === "under_owner_verification" || b.paymentStatus === "payment_submitted");
                  }
                  if (activeTab === "payment_pending") {
                    return b.status === "pending" && b.paymentStatus === "pending_payment";
                  }
                  if (activeTab === "cancelled") {
                    return b.status === "cancelled" || b.status === "rejected";
                  }
                  return b.status === activeTab;
                })
                .map((booking) => (
                  <BookingCard key={booking.id} booking={booking} onReload={fetchBookings} />
                ))
            )}
          </div>

          <button 
            onClick={fetchBookings}
            className="w-full py-4 rounded-[24px] border-2 border-dashed border-[#0E5A75]/20 text-[#0E5A75]/40 font-bold hover:border-[#0E5A75]/40 hover:text-[#0E5A75]/60 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw size={16} /> Reload Reservations Queue
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
                title="Smart UPI Booking" 
                detail="Sequential reconciliation decimal matches active" 
                time="Just now" 
                icon={Plus} 
                color="bg-[#159665]" 
              />
              <ActivityItem 
                title="UPI Verification Requested" 
                detail="12-digit UTR uploaded by Guest" 
                time="5 mins ago" 
                icon={CreditCard} 
                color="bg-[#FCBC43]" 
              />
              <ActivityItem 
                title="Check-in Completed" 
                detail="Priya Das (B-88230)" 
                time="1 hour ago" 
                icon={CheckCircle2} 
                color="bg-[#0E5A75]" 
              />
              <ActivityItem 
                title="Secure Lock Released" 
                detail="Temporary inventory lock auto-cleanup success" 
                time="2 hours ago" 
                icon={Lock} 
                color="bg-[#F24633]" 
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





function BookingCard({ booking, onReload }: { booking: Booking, onReload: () => void }) {
  const [isPendingAction, setIsPendingAction] = useState<"APPROVE" | "REJECT" | "CHECK_IN" | "CHECK_OUT" | null>(null);

  const handleApprove = async () => {
    if (isPendingAction) return;
    if (!confirm("Are you sure you want to approve this payment receipt? This will confirm the booking.")) return;

    setIsPendingAction("APPROVE");
    try {
      const res = await fetch(`/api/bookings/${booking.rawId}/approve-payment`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onReload();
      } else {
        alert(data.error || "Approval failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    } finally {
      setIsPendingAction(null);
    }
  };

  const handleReject = async () => {
    if (isPendingAction) return;
    if (!confirm("Are you sure you want to reject this payment? This will release the locked room hold.")) return;

    setIsPendingAction("REJECT");
    try {
      const res = await fetch(`/api/bookings/${booking.rawId}/reject-payment`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onReload();
      } else {
        alert(data.error || "Rejection failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    } finally {
      setIsPendingAction(null);
    }
  };

  const handlerCheckIn = async () => {
    if (isPendingAction) return;
    setIsPendingAction("CHECK_IN");
    try {
      const res = await fetch(`/api/bookings/${booking.rawId}/checkin`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        onReload();
      } else {
        alert(data.error || "Check-in failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    } finally {
      setIsPendingAction(null);
    }
  };

  const handlerCheckOut = async () => {
    if (isPendingAction) return;
    setIsPendingAction("CHECK_OUT");
    try {
      const res = await fetch(`/api/bookings/${booking.rawId}/checkout`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        onReload();
      } else {
        alert(data.error || "Check-out failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error occurred.");
    } finally {
      setIsPendingAction(null);
    }
  };

  return (
    <GlassCard className="p-0 overflow-hidden group">
      <div className="flex flex-col xl:flex-row">
        
        {/* 1. Guest & Source Info */}
        <div className="p-6 xl:w-72 xl:border-r border-[#0E5A75]/5 relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/10 shrink-0">
              {booking.guestName ? booking.guestName.split(' ').map(n => n[0]).join('') : "G"}
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#0983B0] uppercase tracking-[0.2em] mb-0.5">{booking.id}</p>
              <h3 className="text-lg font-black text-[#053344] dark:text-white leading-tight">{booking.guestName || "Walk-In Guest"}</h3>
              <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest mt-1">{booking.createdAt}</p>
            </div>
          </div>
          <SourceBadge source={booking.source} />
        </div>

        {/* 2. Stay Details */}
        <div className="flex-1 p-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-[#0E5A75]/5 text-[#0E5A75]"><Home size={16} /></div>
                <div>
                  <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest leading-none mb-1">Property & Room</p>
                  <p className="text-sm font-bold text-[#053344] dark:text-white">{booking.propertyName}</p>
                  <p className="text-xs font-medium text-[#0983B0] mt-0.5">{booking.roomName} • {booking.mealPlan}</p>
                </div>
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

          {/* Smart UPI Verification Info Segment */}
          {booking.paymentMode === "SMART_UPI" && (
            <div className="p-4 rounded-2xl bg-[#FCBC43]/5 border border-[#FCBC43]/20 space-y-3">
              <div className="flex items-center gap-2 text-[#FCBC43]">
                <Zap size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Smart UPI Reconciliation Details</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[8px] font-black uppercase text-[#0E5A75]/50 dark:text-white/50 tracking-widest block mb-1">Assigned Note / Reference</span>
                  <span className="text-xs font-black text-[#053344] dark:text-white tracking-widest font-mono uppercase bg-white dark:bg-[#053344] px-3 py-1 rounded-lg border border-black/5 dark:border-white/10 inline-block">{booking.paymentReference || "N/A"}</span>
                </div>
                <div>
                  {booking.utrNumber ? (
                    <div>
                      <span className="text-[8px] font-black uppercase text-[#159665] tracking-widest block mb-1">Guest Submitted UTR</span>
                      <span className="text-xs font-black text-[#159665] tracking-widest font-mono bg-[#159665]/10 px-3 py-1 rounded-lg border border-[#159665]/20 inline-block">{booking.utrNumber}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[#F24633] mt-4">
                      <AlertCircle size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Guest did not submit UTR number</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Financials & Status */}
        <div className="p-6 xl:w-64 bg-[#0E5A75]/5 dark:bg-white/5 flex flex-col justify-between border-t xl:border-t-0 xl:border-l border-[#0E5A75]/5">
          <div>
            <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest leading-none mb-1">Booking Value</p>
            <p className="text-2xl font-black text-[#053344] dark:text-white">₹{booking.amount.toLocaleString()}</p>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest">Payment</span>
              <Badge variant={
                booking.paymentStatus === "paid" || booking.paymentStatus === "confirmed" ? "success" : 
                booking.paymentStatus === "under_owner_verification" || booking.paymentStatus === "payment_submitted" ? "warning" : "danger"
              }>
                {booking.paymentStatus.replace(/_/g, " ")}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest">Status</span>
              <Badge variant={booking.status === "confirmed" ? "success" : booking.status === "pending" ? "warning" : "info"}>
                {booking.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Action Bar */}
      <div className="px-6 py-4 border-t border-[#0E5A75]/5 flex flex-wrap items-center justify-between gap-4 bg-white/30 dark:bg-transparent">
        <div className="flex items-center gap-2">
          {booking.guestPhone && <ActionButtonIcon onClick={() => window.open(`https://wa.me/${booking.guestPhone}`, '_blank')} icon={Smartphone} label="WhatsApp" color="hover:text-[#25D366] hover:bg-[#25D366]/5" />}
          {booking.guestPhone && <ActionButtonIcon onClick={() => window.open(`tel:${booking.guestPhone}`, '_self')} icon={Phone} label="Call" color="hover:text-[#0983B0] hover:bg-[#0983B0]/5" />}
          <ActionButtonIcon onClick={() => window.open(`/api/bookings/${booking.rawId}/invoice/download`, '_blank')} icon={FileText} label="Invoice" color="hover:text-[#0E5A75] hover:bg-[#0E5A75]/5" />
        </div>
        
        <div className="flex items-center gap-2">
          {booking.status === "pending" ? (
            <>
              <button 
                onClick={handleReject}
                disabled={isPendingAction !== null}
                className="px-6 py-2.5 rounded-xl bg-[#F24633]/10 text-[#F24633] text-xs font-bold uppercase tracking-wider hover:bg-[#F24633] hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isPendingAction === "REJECT" ? <Loader2 size={12} className="animate-spin" /> : "Reject"}
              </button>
              
              <button 
                onClick={handleApprove}
                disabled={isPendingAction !== null}
                className="px-6 py-2.5 rounded-xl bg-[#159665] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0E7A4E] transition-all shadow-lg shadow-[#159665]/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isPendingAction === "APPROVE" ? <Loader2 size={12} className="animate-spin" /> : "Approve Payment"}
              </button>
            </>
          ) : booking.status === "confirmed" ? (
            <button 
              onClick={handlerCheckIn}
              disabled={isPendingAction !== null}
              className="px-8 py-2.5 rounded-xl bg-[#0E5A75] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#0A4459] transition-all shadow-lg shadow-[#0E5A75]/20 flex items-center gap-2 disabled:opacity-50">
              {isPendingAction === "CHECK_IN" ? <Loader2 size={12} className="animate-spin" /> : "Start Check-In"}
            </button>
          ) : booking.status === "checked_in" ? (
            <button 
              onClick={handlerCheckOut}
              disabled={isPendingAction !== null}
              className="px-8 py-2.5 rounded-xl bg-[#F24633] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#C93322] transition-all shadow-lg shadow-[#F24633]/20 flex,items-center gap-2 disabled:opacity-50">
              {isPendingAction === "CHECK_OUT" ? <Loader2 size={12} className="animate-spin" /> : "Check-Out"}
            </button>
          ) : null}
          <button className="p-2.5 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75]/40 hover:text-[#0E5A75] transition-all"><MoreVertical size={18} /></button>
        </div>
      </div>
    </GlassCard>
  );
}

function ActionButtonIcon({ icon: Icon, label, color, onClick }: { icon: LucideIcon, label: string, color: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-2 px-3 py-2 rounded-xl text-[#0E5A75]/60 transition-all text-xs font-bold", color)}>
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

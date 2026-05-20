"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ChevronRight,
  BarChart3,
  LucideIcon,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-premium rounded-[32px] p-6 hover-lift border border-white/60 dark:border-[#0E5A75]/20 shadow-xl shadow-[#0E5A75]/5 dark:shadow-none", className)}>
    {children}
  </div>
);

const WidgetHeader = ({ title, icon: Icon, action }: { title: string, icon?: LucideIcon, action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2">
      {Icon && <div className="p-2 rounded-xl bg-[#0E5A75]/10 text-[#0E5A75] dark:text-[#0983B0] dark:bg-[#0983B0]/10"><Icon size={16} /></div>}
      <h3 className="text-sm font-bold text-[#053344] dark:text-[#FDF6F1] uppercase tracking-widest">{title}</h3>
    </div>
    {action}
  </div>
);

// --- Types & Interfaces ---

export interface TodayOp {
  status: string;
  task: string;
  time: string;
}

export interface DashboardStats {
  revenueMtd?: number;
  revenueTrend?: number;
  avgDaily?: number;
  targetPercent?: number;
  occupancy?: number;
  todayOps?: TodayOp[];
  approvals?: number;
}

// --- Sections ---

const HeroRevenue = ({ stats }: { stats: DashboardStats | null }) => (
  <GlassCard className="col-span-1 md:col-span-2 relative overflow-hidden group">
    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#0E5A75]/5 rounded-full blur-3xl group-hover:bg-[#0E5A75]/10 transition-all duration-700" />
    
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <p className="text-xs font-bold text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest mb-1">Estimated Revenue (MTD)</p>
        <h2 className="text-5xl font-black text-[#053344] dark:text-white tracking-tighter">₹{stats?.revenueMtd?.toLocaleString() || 0}</h2>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#159665]/10 text-[#159665] text-[11px] font-bold">
            <TrendingUp size={12} />
            <span>+{stats?.revenueTrend || 0}%</span>
          </div>
          <span className="text-[11px] font-bold text-[#0E5A75]/70 dark:text-[#0983B0]/70 tracking-tight">vs. last month</span>
        </div>
      </div>
      
      <div className="flex gap-4 w-full md:w-auto">
        <div className="flex-1 md:flex-none p-4 rounded-[24px] bg-white/50 dark:bg-white/5 border border-white dark:border-[#0E5A75]/10 shadow-inner">
          <p className="text-[10px] font-bold text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest mb-1">Avg. Daily</p>
          <p className="text-xl font-bold text-[#053344] dark:text-[#FDF6F1]">₹{stats?.avgDaily?.toLocaleString() || 0}</p>
        </div>
        <div className="flex-1 md:flex-none p-4 rounded-[24px] bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20">
          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Target</p>
          <p className="text-xl font-bold">{stats?.targetPercent || 0}%</p>
        </div>
      </div>
    </div>
    
    <div className="mt-8 h-24 flex items-end gap-1.5 opacity-40">
      {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85, 60, 100, 80, 90, 85].map((h, i) => (
        <div 
          key={i} 
          className="flex-1 bg-gradient-to-t from-[#0E5A75] to-[#0983B0] rounded-full transition-all duration-700 hover:opacity-100" 
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  </GlassCard>
);

const OccupancyRing = ({ stats }: { stats: DashboardStats | null }) => (
  <GlassCard className="flex flex-col items-center justify-center text-center">
    <WidgetHeader title="Occupancy" icon={BarChart3} />
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="80" cy="80" r="70"
          className="text-[#0E5A75]/5 dark:text-white/5"
          strokeWidth="12"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx="80" cy="80" r="70"
          className="text-[#0E5A75] dark:text-[#0983B0] transition-all duration-1000 ease-out"
          strokeWidth="12"
          strokeDasharray={440}
          strokeDashoffset={440 - (440 * (stats?.occupancy || 0)) / 100}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter">{stats?.occupancy || 0}%</span>
        <span className="text-[10px] font-bold text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest">Active</span>
      </div>
    </div>
    <div className="mt-6 flex justify-center gap-4 text-[11px] font-bold uppercase tracking-widest">
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#0E5A75] dark:bg-[#0983B0]" /> <span className="text-[#0E5A75] dark:text-[#FDF6F1]">Booked</span></div>
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#0E5A75]/10 dark:bg-white/10" /> <span className="text-[#0E5A75] dark:text-[#0983B0]">Vacant</span></div>
    </div>
  </GlassCard>
);

const getIcon = (status: string) => {
  if (status === "completed") return CheckCircle2;
  if (status === "pending") return Clock;
  return AlertCircle;
};

const TodayOperations = ({ stats }: { stats: DashboardStats | null }) => (
  <GlassCard className="col-span-1 md:col-span-1">
    <WidgetHeader title="Today's Ops" icon={Calendar} action={
      <button className="text-[10px] font-bold text-[#0E5A75] dark:text-[#0983B0] hover:underline uppercase tracking-widest">View Schedule</button>
    } />
    <div className="space-y-4">
      {stats?.todayOps?.map((op: TodayOp, i: number) => {
        const OpIcon = getIcon(op.status);
        return (
          <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-all border border-white/20 dark:border-white/5 group backdrop-blur-md">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
              op.status === "completed" ? "bg-[#159665]/10 text-[#159665]" : "bg-[#0E5A75]/10 text-[#0E5A75] dark:text-[#0983B0]"
            )}>
              <OpIcon size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-bold text-[#053344] dark:text-[#FDF6F1]">{op.task}</p>
              <p className="text-[10px] text-[#0E5A75] dark:text-[#0983B0] font-medium">{op.time}</p>
            </div>
            <ChevronRight size={14} className="text-[#0983B0]/30 group-hover:text-[#0E5A75] transition-colors" />
          </div>
        );
      })}
    </div>
  </GlassCard>
);

const PendingApprovals = ({ stats }: { stats: DashboardStats | null }) => (
  <GlassCard className="col-span-1 md:col-span-1 bg-gradient-to-br from-[#0E5A75]/5 to-transparent border-[#0E5A75]/10 dark:border-[#0983B0]/10">
    <WidgetHeader title="Approvals" icon={AlertCircle} />
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#0E5A75]/10 dark:bg-[#0983B0]/10 flex items-center justify-center mb-4 relative">
        <span className="text-2xl font-black text-[#053344] dark:text-[#0983B0]">{String(stats?.approvals || 0).padStart(2, '0')}</span>
        <div className="absolute inset-0 rounded-full border-2 border-[#0E5A75] dark:border-[#0983B0] border-t-transparent animate-spin duration-[3s]" />
      </div>
      <p className="text-[13px] font-bold text-[#053344] dark:text-[#FDF6F1] mb-1">Action Required</p>
      <p className="text-[11px] text-[#0E5A75] dark:text-[#0983B0] font-medium mb-6 px-4">You have {stats?.approvals || 0} new booking requests waiting for confirmation.</p>
      <button className="w-full py-3 rounded-2xl bg-[#0E5A75] text-white text-[12px] font-bold uppercase tracking-widest hover:bg-[#0A4459] transition-all shadow-lg shadow-[#0E5A75]/20">Review Now</button>
    </div>
  </GlassCard>
);

// --- Types ---
interface Booking {
  guest_name: string;
  room_name: string;
  amount: string | number;
}

const ActivityFeed = ({ bookings, isLoading }: { bookings: Booking[], isLoading: boolean }) => (
  <GlassCard className="col-span-1 md:col-span-1">
    <WidgetHeader title="Activity" icon={Clock} />
    <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-[#0E5A75]/10 dark:before:bg-white/10 min-h-[200px]">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-[#0E5A75]" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-xs font-bold text-[#0E5A75]/40 uppercase tracking-widest">No recent activity</p>
        </div>
      ) : (
        bookings.slice(0, 5).map((item, i) => (
          <div key={i} className="flex gap-4 relative text-left">
            <div className={cn("w-6 h-6 rounded-full border-4 border-white dark:border-[#0b1220] shadow-sm shrink-0 z-10", "bg-[#0E5A75]")} />
            <div>
              <p className="text-[13px] font-bold text-[#053344] dark:text-[#FDF6F1] leading-tight">New Booking</p>
              <p className="text-[11px] text-[#0E5A75] dark:text-[#0983B0] font-medium mb-1">{item.guest_name} - {item.room_name}</p>
              <span className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-[#0983B0]/60 uppercase tracking-tighter">Just now</span>
            </div>
          </div>
        ))
      )}
    </div>
  </GlassCard>
);

export default function PartnerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, statsRes] = await Promise.all([
          fetch('/api/bookings'),
          fetch('/api/partner/dashboard')
        ]);
        
        if (bookingsRes.ok) {
          setBookings(await bookingsRes.json());
        }
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Operational Overview</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Good Morning, Partner</h1>
          <p className="text-[#053344] dark:text-[#0983B0] mt-3 font-medium text-lg">Here&apos;s what&apos;s happening with your properties today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-widest leading-none mb-1">Current Time</span>
            <span className="text-xl font-black text-[#053344] dark:text-[#FDF6F1] leading-none">10:45 AM</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#0E5A75] shadow-xl flex items-center justify-center border border-[#0E5A75]/10 dark:border-white/10">
            <Clock className="text-[#0E5A75] dark:text-[#0983B0]" size={24} />
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-1000 delay-300">
        <HeroRevenue stats={stats} />
        <OccupancyRing stats={stats} />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
        <TodayOperations stats={stats} />
        <PendingApprovals stats={stats} />
        <ActivityFeed bookings={bookings} isLoading={isLoading} />
      </div>
    </div>
  );
}

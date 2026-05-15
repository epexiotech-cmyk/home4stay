"use client";

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Search, 
  CreditCard, 
  RefreshCcw, 
  ArrowUpRight, 
  Play, 
  Pause, 
  History, 
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

type Priority = "critical" | "important" | "informational" | "automated";
type AutomationStatus = "active" | "scheduled" | "paused" | "failed" | "awaiting_action";

interface NotificationItem {
  id: string;
  type: "booking" | "payment" | "review" | "staff" | "system";
  title: string;
  detail: string;
  time: string;
  priority: Priority;
  unread: boolean;
}

interface AutomationCard {
  id: string;
  title: string;
  description: string;
  status: AutomationStatus;
  lastRun: string;
  deliveryRate: string;
}

// --- Mock Data ---

const NOTIFICATIONS: NotificationItem[] = [
  { id: "N-1", type: "booking", title: "New Booking Request", detail: "Ananya Sharma • Royal Heritage Suite • 4 Nights", time: "2m ago", priority: "critical", unread: true },
  { id: "N-2", type: "payment", title: "Payment Received", detail: "₹45,200 for Booking B-1001 via UPI", time: "15m ago", priority: "important", unread: true },
  { id: "N-3", type: "review", title: "New Review Submitted", detail: "Rohan Malhotra rated your property 4/5", time: "2h ago", priority: "informational", unread: false },
  { id: "N-4", type: "system", title: "Failed Automation", detail: "Review Request failed for Booking B-0988", time: "4h ago", priority: "important", unread: false },
];

const AUTOMATIONS: AutomationCard[] = [
  { id: "A-1", title: "Review Request Automation", description: "Sent 2 hours after checkout completed.", status: "active", lastRun: "10m ago", deliveryRate: "98%" },
  { id: "A-2", title: "Payment Reminder Workflow", description: "Send 2 days before check-in if pending.", status: "active", lastRun: "2h ago", deliveryRate: "92%" },
  { id: "A-3", title: "Check-In Concierge PDF", description: "Send property map & rules 1 day before.", status: "paused", lastRun: "1d ago", deliveryRate: "100%" },
];

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] p-6 hover-lift border border-white/5 dark:border-white/5 shadow-premium", className)}>
    {children}
  </div>
);

const PriorityBadge = ({ priority }: { priority: Priority }) => {
  const configs: Record<Priority, string> = {
    critical: "bg-[#F24633]/10 text-[#F24633]",
    important: "bg-[#FCBC43]/10 text-[#FCBC43]",
    informational: "bg-[#0983B0]/10 text-[#0983B0]",
    automated: "bg-[#0E5A75]/10 text-[#0E5A75]",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap", configs[priority])}>
      {priority}
    </span>
  );
};

const AutomationStatusBadge = ({ status }: { status: AutomationStatus }) => {
  const configs: Record<AutomationStatus, string> = {
    active: "bg-[#159665]/10 text-[#159665]",
    scheduled: "bg-[#0983B0]/10 text-[#0983B0]",
    paused: "bg-[#FCBC43]/10 text-[#FCBC43]",
    failed: "bg-[#F24633]/10 text-[#F24633]",
    awaiting_action: "bg-gray-500/10 text-gray-500",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest", configs[status])}>
      {status.replace('_', ' ')}
    </span>
  );
};

// --- Main Page ---

export default function NotificationsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Operational Intelligence Hub</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Intelligence Center</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E5A75]/40" size={18} />
            <input 
              type="text" 
              placeholder="Search notifications, guests or logs..." 
              className="w-full pl-12 pr-4 py-4 rounded-[24px] glass-matte border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold"
            />
          </div>
          <button className="flex items-center gap-2 px-8 py-4 rounded-[24px] bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all">
            <Zap size={20} />
            <span className="text-sm font-black uppercase tracking-widest">New Automation</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Pending Approvals" value="04" icon={CheckCircle2} color="text-[#0E5A75]" unread />
        <StatWidget label="Guest Messages" value="12" icon={MessageSquare} color="text-[#159665]" unread />
        <StatWidget label="Critical Alerts" value="01" icon={AlertTriangle} color="text-[#F24633]" unread />
        <StatWidget label="Active Workflows" value="08" icon={RefreshCcw} color="text-[#0983B0]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Smart Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white flex items-center gap-2">
              <History size={18} className="text-[#0E5A75]" /> Operational Live Feed
            </h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/40 hover:text-[#0E5A75] transition-all">Mark All as Read</button>
          </div>
          
          <div className="space-y-4">
            {NOTIFICATIONS.map((notif) => (
              <NotificationCard key={notif.id} notification={notif} />
            ))}
            <button className="w-full py-5 rounded-[24px] border-2 border-dashed border-[#0E5A75]/10 text-[#0E5A75]/40 font-black uppercase tracking-[0.2em] hover:bg-[#0E5A75]/5 transition-all">
              View Historical Intelligence
            </button>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-8">
          
          {/* 4. Automation Center */}
          <GlassCard className="p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white mb-8 flex items-center gap-2">
              <Zap size={18} className="text-[#FCBC43]" /> Automation Workflows
            </h3>
            <div className="space-y-4">
              {AUTOMATIONS.map((auto) => (
                <div key={auto.id} className="p-5 rounded-[24px] bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20 transition-all group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-black text-[#053344] dark:text-white group-hover:text-[#0E5A75] transition-colors">{auto.title}</h4>
                    <AutomationStatusBadge status={auto.status} />
                  </div>
                  <p className="text-[10px] font-bold text-[#0E5A75]/40 leading-relaxed mb-4">{auto.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-black/5 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[8px] font-black text-[#0E5A75]/40 uppercase tracking-widest">Last Run</p>
                        <p className="text-[10px] font-bold text-[#053344] dark:text-white">{auto.lastRun}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black text-[#0E5A75]/40 uppercase tracking-widest">Delivery</p>
                        <p className="text-[10px] font-bold text-[#159665]">{auto.deliveryRate}</p>
                      </div>
                    </div>
                    <button className={cn(
                      "p-2.5 rounded-xl transition-all shadow-md",
                      auto.status === "active" ? "bg-[#FCBC43]/10 text-[#FCBC43] hover:bg-[#FCBC43]/20" : "bg-[#159665]/10 text-[#159665] hover:bg-[#159665]/20"
                    )}>
                      {auto.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-4 rounded-xl border border-dashed border-[#0E5A75]/20 text-[#0E5A75]/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0E5A75]/5 hover:text-[#0E5A75] transition-all">
              Workflow Directory
            </button>
          </GlassCard>

          {/* 5. Approval Queue Mini */}
          <GlassCard className="p-8 bg-gradient-to-br from-white/10 to-transparent">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white mb-6">Approval Queue</h3>
            <div className="space-y-4">
              <ApprovalItem label="Refund: Booking B-0995" detail="Vikram Sethi • ₹12,400" />
              <ApprovalItem label="Pricing: Grand Suite" detail="Weekend Override • ₹18,500" />
            </div>
            <button className="w-full mt-6 py-3 rounded-xl bg-white text-[#0E5A75] text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-white/90 transition-all">
              Go to Approval Center
            </button>
          </GlassCard>

          {/* 6. Unified Inbox Preview */}
          <GlassCard className="p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white mb-6">Unified Inbox</h3>
            <div className="space-y-4">
              <InboxItem guest="Ananya Sharma" message="Can I get airport pickup at 10 AM?" time="2m ago" unread />
              <InboxItem guest="Sahil Khan" message="Is early check-in available?" time="1h ago" />
            </div>
            <button className="w-full mt-6 py-4 rounded-xl bg-[#0E5A75] text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all flex items-center justify-center gap-2">
              <MessageSquare size={14} /> Open Guest Inbox
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatWidget({ label, value, icon: Icon, color, unread }: { label: string, value: string, icon: LucideIcon, color: string, unread?: boolean }) {
  return (
    <GlassCard className="p-5 flex items-center justify-between group relative overflow-hidden">
      {unread && <div className="absolute top-0 right-0 w-8 h-8 bg-[#F24633] translate-x-4 -translate-y-4 rotate-45 shadow-lg" />}
      <div>
        <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">{label}</p>
        <p className={cn("text-3xl font-black leading-none", color)}>{value}</p>
      </div>
      <div className={cn("p-3 rounded-2xl bg-white dark:bg-white/5 shadow-inner transition-transform group-hover:rotate-12", color)}>
        <Icon size={20} />
      </div>
    </GlassCard>
  );
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  return (
    <div className={cn(
      "p-6 rounded-[32px] border transition-all duration-300 group flex items-start gap-6 cursor-pointer",
      notification.unread 
        ? "bg-white dark:bg-white/5 border-[#0E5A75]/20 shadow-xl shadow-[#0E5A75]/5" 
        : "bg-black/[0.02] dark:bg-white/[0.02] border-transparent opacity-60 hover:opacity-100 hover:bg-white dark:hover:bg-white/5"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-[18px] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
        notification.priority === "critical" ? "bg-[#F24633] text-white" : 
        notification.priority === "important" ? "bg-[#FCBC43] text-white" : "bg-[#0E5A75] text-white"
      )}>
        {notification.type === "booking" ? <CheckCircle2 size={20} /> : 
         notification.type === "payment" ? <CreditCard size={20} /> :
         notification.type === "review" ? <MessageSquare size={20} /> : <AlertTriangle size={20} />}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <h4 className={cn("text-lg font-black tracking-tight leading-none", notification.unread ? "text-[#053344] dark:text-white" : "text-[#0E5A75]/60")}>
            {notification.title}
          </h4>
          <span className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest">{notification.time}</span>
        </div>
        <p className="text-sm font-bold text-[#0E5A75]/60 mb-4">{notification.detail}</p>
        <div className="flex items-center gap-3">
          <PriorityBadge priority={notification.priority} />
          {notification.unread && (
            <button className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75] hover:underline">Dismiss</button>
          )}
        </div>
      </div>

      <div className="self-center">
        <button className="p-3 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

function ApprovalItem({ label, detail }: { label: string, detail: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/10 group cursor-pointer hover:border-[#0E5A75]/30 transition-all">
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-xs font-black text-[#053344] dark:text-white group-hover:text-[#0E5A75] transition-colors">{label}</h4>
        <ArrowUpRight size={14} className="text-[#0E5A75]/40 group-hover:text-[#0E5A75] transition-colors" />
      </div>
      <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase">{detail}</p>
    </div>
  );
}

function InboxItem({ guest, message, time, unread }: { guest: string, message: string, time: string, unread?: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all cursor-pointer flex gap-3",
      unread 
        ? "bg-[#0E5A75]/5 border-[#0E5A75]/20" 
        : "bg-black/[0.02] dark:bg-white/[0.02] border-transparent hover:border-black/5 dark:hover:border-white/5"
    )}>
      <div className="w-10 h-10 rounded-xl bg-[#0E5A75] flex items-center justify-center text-white font-black text-sm shrink-0">
        {guest[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <h4 className="text-xs font-black text-[#053344] dark:text-white truncate pr-2">{guest}</h4>
          <span className="text-[9px] font-black text-[#0E5A75]/40 uppercase shrink-0">{time}</span>
        </div>
        <p className="text-[10px] font-bold text-[#0E5A75]/60 truncate italic">&quot;{message}&quot;</p>
      </div>
      {unread && <div className="w-2 h-2 rounded-full bg-[#F24633] self-center shrink-0 shadow-[0_0_10px_rgba(242,70,51,0.5)]" />}
    </div>
  );
}

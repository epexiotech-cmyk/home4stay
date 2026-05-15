"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  ShieldCheck, 
  Printer, 
  Zap, 
  Layers,
  Plus,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

type PaymentStatus = "paid" | "partial" | "pending" | "refunded" | "failed";
type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

interface Transaction {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  gst: number;
  method: string;
  status: PaymentStatus;
  date: string;
}

interface Invoice {
  id: string;
  bookingId: string;
  guestName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
}

// --- Mock Data ---

const TRANSACTIONS: Transaction[] = [
  { id: "TXN-7721", bookingId: "B-1001", guestName: "Ananya Sharma", amount: 45200, gst: 5424, method: "UPI", status: "paid", date: "Today, 10:24 AM" },
  { id: "TXN-7718", bookingId: "B-1002", guestName: "Rohan Malhotra", amount: 68000, gst: 8160, method: "Credit Card", status: "partial", date: "Yesterday" },
  { id: "TXN-7715", bookingId: "B-1004", guestName: "Sahil Khan", amount: 28500, gst: 3420, method: "Cash", status: "pending", date: "2 days ago" },
  { id: "TXN-7702", bookingId: "B-0995", guestName: "Vikram Sethi", amount: 12400, gst: 1488, method: "Net Banking", status: "refunded", date: "5 days ago" },
];

const INVOICES: Invoice[] = [
  { id: "INV-2026-001", bookingId: "B-1001", guestName: "Ananya Sharma", amount: 45200, status: "paid", dueDate: "May 08, 2026" },
  { id: "INV-2026-002", bookingId: "B-1002", guestName: "Rohan Malhotra", amount: 68000, status: "sent", dueDate: "May 12, 2026" },
  { id: "INV-2026-003", bookingId: "B-1004", guestName: "Sahil Khan", amount: 28500, status: "overdue", dueDate: "May 05, 2026" },
];

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] p-6 hover-lift border border-white/5 dark:border-white/5 shadow-premium", className)}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, string> = {
    paid: "bg-[#159665]/10 text-[#159665]",
    partial: "bg-[#FCBC43]/10 text-[#FCBC43]",
    pending: "bg-gray-500/10 text-gray-500",
    refunded: "bg-[#0983B0]/10 text-[#0983B0]",
    failed: "bg-[#F24633]/10 text-[#F24633]",
    sent: "bg-[#0983B0]/10 text-[#0983B0]",
    overdue: "bg-[#F24633]/10 text-[#F24633]",
    cancelled: "bg-gray-500/10 text-gray-500",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest", configs[status] || "bg-[#0E5A75]/10 text-[#0E5A75]")}>
      {status.replace('_', ' ')}
    </span>
  );
};

// --- Main Page ---

export default function FinancialsPage() {
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
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Financial Cockpit</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Revenue & Billing</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl glass-matte text-[#0E5A75] hover:bg-[#0E5A75] hover:text-white transition-all text-xs font-black uppercase tracking-widest">
            <Download size={18} /> Export Reports
          </button>
          <button className="flex items-center gap-2 px-8 py-4 rounded-xl bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all group">
            <Plus size={20} />
            <span className="text-sm font-black uppercase tracking-widest">Create Invoice</span>
          </button>
        </div>
      </div>

      {/* 2. AMC Business Model Banner */}
      <div className="p-6 rounded-[32px] bg-gradient-to-r from-[#0E5A75] via-[#0983B0] to-[#0E5A75] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity duration-700 pointer-events-none" />
        <div className="flex items-center gap-6 z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
            <Zap size={32} className="text-white fill-white/20" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight leading-tight">Fixed AMC Subscription Active</h2>
            <p className="text-sm font-bold text-white/70 uppercase tracking-widest mt-1">0% Commission Platform Benefit</p>
          </div>
        </div>
        <div className="px-6 py-3 rounded-2xl bg-white text-[#0E5A75] text-xs font-black uppercase tracking-[0.2em] shadow-lg z-10">
          Owner Exclusive Benefit
        </div>
      </div>

      {/* 3. Financial Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Total Revenue" value="₹8,42,500" icon={TrendingUp} color="text-[#159665]" trend="+12.5%" trendUp />
        <StatWidget label="Pending Payments" value="₹45,200" icon={Clock} color="text-[#FCBC43]" trend="-2.4%" />
        <StatWidget label="GST Collected" value="₹1,08,540" icon={ShieldCheck} color="text-[#0983B0]" />
        <StatWidget label="Avg Booking Value" value="₹18,450" icon={Layers} color="text-[#0E5A75]" trend="+5.2%" trendUp />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 4. Revenue Analytics Charts (Mock Visualization) */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white flex items-center gap-2">
                <BarChart3 size={18} className="text-[#0E5A75]" /> Revenue Trends
              </h3>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg bg-[#0E5A75] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Daily</button>
                <button className="px-4 py-2 rounded-lg glass-matte text-[#0E5A75] text-[10px] font-black uppercase tracking-widest hover:bg-[#0E5A75]/5">Weekly</button>
              </div>
            </div>
            {/* Mock Chart Area */}
            <div className="h-[250px] w-full flex items-end gap-4">
              {[60, 45, 80, 55, 90, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div 
                    className="w-full bg-[#0E5A75]/10 rounded-t-xl relative overflow-hidden transition-all duration-700 group-hover:bg-[#0E5A75]/20" 
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute inset-0 bg-[#0E5A75] opacity-60 rounded-t-xl" style={{ height: `${h-20}%`, marginTop: 'auto' }} />
                  </div>
                  <span className="text-[10px] font-black text-[#0E5A75]/40 uppercase">Day {i+1}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* 5. Payment Tracking System */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white">Recent Transactions</h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-[#0983B0] hover:underline">View All Ledger</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/5">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/50">Transaction ID</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/50">Guest</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/50">Amount</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/50">Method</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/50">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {TRANSACTIONS.map((txn) => (
                    <tr key={txn.id} className="hover:bg-[#0E5A75]/5 transition-colors group">
                      <td className="px-8 py-5">
                        <p className="text-xs font-black text-[#053344] dark:text-white">{txn.id}</p>
                        <p className="text-[10px] font-bold text-[#0E5A75]/40 uppercase mt-0.5">{txn.date}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-xs font-black text-[#053344] dark:text-white">{txn.guestName}</p>
                        <p className="text-[10px] font-bold text-[#0E5A75]/40 uppercase mt-0.5">{txn.bookingId}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-black text-[#159665]">₹{txn.amount.toLocaleString()}</p>
                        <p className="text-[9px] font-bold text-[#0E5A75]/40 uppercase mt-0.5">GST: ₹{txn.gst.toLocaleString()}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black text-[#0E5A75] px-2 py-1 bg-[#0E5A75]/5 rounded-lg border border-[#0E5A75]/10">{txn.method}</span>
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={txn.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-8">
          
          {/* 6. Invoice Center Quick View */}
          <GlassCard className="p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white mb-8 flex items-center gap-2">
              <FileText size={18} className="text-[#0983B0]" /> Invoice Center
            </h3>
            <div className="space-y-4">
              {INVOICES.map((inv) => (
                <div key={inv.id} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">{inv.id}</p>
                      <h4 className="text-xs font-black text-[#053344] dark:text-white group-hover:text-[#0E5A75] transition-colors">{inv.guestName}</h4>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/5">
                    <p className="text-sm font-black text-[#159665]">₹{inv.amount.toLocaleString()}</p>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-[#0E5A75]/10 text-[#0E5A75]"><Printer size={14} /></button>
                      <button className="p-2 rounded-lg hover:bg-[#0E5A75]/10 text-[#0E5A75]"><Download size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-4 rounded-xl border border-dashed border-[#0E5A75]/20 text-[#0E5A75]/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0E5A75]/5 hover:text-[#0E5A75] transition-all">
              Manage All Invoices
            </button>
          </GlassCard>

          {/* 7. GST Summary Mini */}
          <GlassCard className="p-8 bg-gradient-to-br from-white/10 to-transparent">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white mb-6">Tax Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60">GST Collected (Output)</span>
                <span className="text-sm font-black text-[#053344] dark:text-white">₹1,08,540</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60">GST Payable (Net)</span>
                <span className="text-sm font-black text-[#F24633]">₹18,240</span>
              </div>
              <div className="h-px bg-[#0E5A75]/10 my-2" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60">Taxable Revenue</span>
                <span className="text-sm font-black text-[#159665]">₹7,33,960</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 rounded-xl bg-white text-[#0E5A75] text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-white/90 transition-all">
              Download GST Report
            </button>
          </GlassCard>

          {/* 8. Automation & Scheduling */}
          <GlassCard className="p-6 border-dashed bg-transparent">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#0E5A75]/5 text-[#0E5A75]"><Clock size={16} /></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#053344] dark:text-white">Scheduled Reports</h4>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-[#0E5A75]/60 uppercase">Weekly Revenue Summary</span>
                <CheckCircle2 size={14} className="text-[#159665]" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/10">
                <span className="text-[10px] font-bold text-[#0E5A75]/60 uppercase">Monthly GST Ledger</span>
                <CheckCircle2 size={14} className="text-[#159665]" />
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---

function StatWidget({ label, value, icon: Icon, color, trend, trendUp }: { label: string, value: string, icon: LucideIcon, color: string, trend?: string, trendUp?: boolean }) {
  return (
    <GlassCard className="p-5 flex flex-col justify-between group">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl bg-white dark:bg-white/5 shadow-inner transition-transform group-hover:scale-110", color)}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black uppercase", trendUp ? "bg-[#159665]/10 text-[#159665]" : "bg-[#F24633]/10 text-[#F24633]")}>
            {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">{label}</p>
        <p className={cn("text-3xl font-black leading-none tracking-tight", color)}>{value}</p>
      </div>
    </GlassCard>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  ShieldAlert, 
  CheckCircle, 
  Search, 
  Filter, 
  Activity, 
  RefreshCw,
  Award,
  BookOpen,
  MessageSquare
} from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { cn } from "@/lib/utils";

// --- Glassmorphic UI Components ---
const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("glass-premium rounded-[32px] p-6 border border-white/60 dark:border-[#0E5A75]/20 shadow-xl shadow-[#0E5A75]/5 dark:shadow-none bg-white/40 dark:bg-[#0A0F1D]/40 backdrop-blur-md", className)}>
    {children}
  </div>
);

const WidgetHeader = ({ title, icon: Icon, action }: { title: string; icon?: React.ElementType; action?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
    <div className="flex items-center gap-2">
      {Icon && <div className="p-2 rounded-xl bg-[#0E5A75]/10 text-[#0E5A75] dark:text-[#0983B0] dark:bg-[#0983B0]/10"><Icon size={16} /></div>}
      <h3 className="text-sm font-black text-[#053344] dark:text-[#FDF6F1] uppercase tracking-widest">{title}</h3>
    </div>
    {action}
  </div>
);

// --- Interfaces ---
interface Referrer {
  id: string;
  name: string;
  email: string;
  phone: string;
  gstin: string;
}

interface ReferralEvent {
  id: string;
  status: string;
  creditsAwarded: number;
  awardedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  referrer: Referrer;
  referred: Referrer;
}

interface TopReferrer {
  id: string;
  referralCode: string;
  totalCredits: number;
  lifetimeCredits: number;
  pendingCredits: number;
  redeemedCredits: number;
  userName: string;
  userEmail: string;
}

export default function SuperAdminReferralsPage() {
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reviewingEventId, setReviewingEventId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [activeTab, setActiveTab] = useState<"audit" | "leaderboard">("audit");

  // Fetch admin telemetry datasets
  const fetchReferralLogs = useCallback(async (showQueueLoading = true) => {
    try {
      if (showQueueLoading) {
        setLoading(true);
      }
      const res = await fetch("/api/admin/referrals");
      if (!res.ok) throw new Error("Could not load administrative referral records");
      const data = await res.json();
      if (data.success) {
        setEvents(data.events || []);
        setTopReferrers(data.topReferrers || []);
      }
    } catch (err) {
      console.error("[ADMIN_REFERRALS_LOAD_ERROR] Failed loading referrals data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await fetchReferralLogs(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchReferralLogs]);

  // Handle Administrative Approval/Rejection Override
  const handleAdminOverride = async (eventId: string, action: "APPROVE" | "REJECT") => {
    try {
      setSubmittingAction(true);
      const res = await fetch("/api/admin/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          action,
          notes: adminNotes || `Reviewed & overridden manually by Super Admin.`
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resolve override action");

      // Reset action states
      setReviewingEventId(null);
      setAdminNotes("");
      
      // Reload logs
      fetchReferralLogs();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(`Error applying override: ${errMsg}`);
    } finally {
      setSubmittingAction(false);
    }
  };

  // Metric Computations
  const totalEventsCount = events.length;
  const pendingEventsCount = events.filter(e => e.status === "PENDING").length;
  const fraudEventsCount = events.filter(e => e.status === "FRAUD_FLAGGED").length;
  const rewardedEventsCount = events.filter(e => e.status === "REWARDED" || e.status === "QUALIFIED").length;

  // Filter Logic
  const getFilteredEvents = () => {
    return events.filter(e => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && e.status !== statusFilter) return false;
      
      // 2. Search query matching referrer or referred details
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const refName = e.referrer.name.toLowerCase();
        const refEmail = e.referrer.email.toLowerCase();
        const refGST = e.referrer.gstin.toLowerCase();
        const referredName = e.referred.name.toLowerCase();
        const referredEmail = e.referred.email.toLowerCase();
        
        return refName.includes(q) || refEmail.includes(q) || refGST.includes(q) || referredName.includes(q) || referredEmail.includes(q);
      }

      return true;
    });
  };

  const filteredEvents = getFilteredEvents();

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-px bg-[#0E5A75] dark:bg-[#0983B0] opacity-50" />
              <span className="text-[10px] font-black text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Growth & Compliance Controls</span>
            </div>
            <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Referral Audit & Anti-Abuse</h1>
            <p className="text-[#0E5A75]/70 dark:text-[#0983B0]/70 mt-3 font-semibold text-lg">
              Monitor active peer referrals, investigate system fraud-alerts, and execute manual credit overrides.
            </p>
          </div>

          <button
            onClick={() => fetchReferralLogs()}
            disabled={loading}
            className="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#0E5A75] to-[#0A4459] dark:from-[#0983B0] dark:to-[#053344] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-[#0E5A75]/20 hover:shadow-2xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            <span>Sync Audit Logs</span>
          </button>
        </div>

        {/* Dashboard Aggregate Stat Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="relative overflow-hidden group hover:border-[#0E5A75]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest">Total Conversions</span>
                <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">{totalEventsCount}</h3>
              </div>
              <div className="p-3 bg-[#0E5A75]/10 text-[#0E5A75] dark:text-[#0983B0] dark:bg-[#0983B0]/10 rounded-2xl">
                <Activity size={20} />
              </div>
            </div>
            <div className="h-1 w-full bg-[#0E5A75]/10 dark:bg-white/5 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-[#0E5A75] dark:bg-[#0983B0] w-[65%]" />
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden group hover:border-amber-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">Pending Payment</span>
                <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">{pendingEventsCount}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                <Users size={20} />
              </div>
            </div>
            <div className="h-1 w-full bg-amber-500/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-amber-500 w-[45%]" />
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest">Fraud Flags</span>
                <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">{fraudEventsCount}</h3>
              </div>
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl animate-pulse">
                <ShieldAlert size={20} />
              </div>
            </div>
            <div className="h-1 w-full bg-rose-500/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-rose-500 w-[35%]" />
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Qualified Referrals</span>
                <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">{rewardedEventsCount}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="h-1 w-full bg-emerald-500/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-emerald-500 w-[60%]" />
            </div>
          </GlassCard>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 bg-[#0E5A75]/5 dark:bg-white/5 rounded-2xl w-fit gap-2">
          <button
            onClick={() => setActiveTab("audit")}
            className={cn(
              "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "audit"
                ? "bg-[#0E5A75] text-white shadow-md"
                : "text-[#0E5A75] hover:bg-[#0E5A75]/5 dark:text-white/60 dark:hover:bg-white/5"
            )}
          >
            Administrative Referrals Audit ({events.length})
          </button>
          <button
            onClick={() => setActiveTab("leaderboard")}
            className={cn(
              "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "leaderboard"
                ? "bg-[#0E5A75] text-white shadow-md"
                : "text-[#0E5A75] hover:bg-[#0E5A75]/5 dark:text-white/60 dark:hover:bg-white/5"
            )}
          >
            Leaderboard & Top Referrers ({topReferrers.length})
          </button>
        </div>

        {activeTab === "audit" ? (
          <>
            {/* Search & Filter controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/20 dark:bg-white/5 p-4 rounded-3xl border border-[#0E5A75]/10">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-3.5 text-[#0E5A75]/40" size={16} />
                <input
                  type="text"
                  placeholder="Search by Referrer, Referred Name, Email, or GSTIN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 rounded-2xl text-xs font-bold border border-[#0E5A75]/10 dark:border-white/10 text-[#053344] dark:text-white outline-none focus:border-[#0E5A75] focus:ring-1 focus:ring-[#0E5A75]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[#0983B0]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-white/5 rounded-2xl border border-[#0E5A75]/10 text-xs font-bold text-[#0E5A75] dark:text-white outline-none"
                >
                  <option value="ALL">All Conversion Statuses</option>
                  <option value="FRAUD_FLAGGED">FRAUD_FLAGGED Alerts</option>
                  <option value="PENDING">PENDING Payments</option>
                  <option value="QUALIFIED">QUALIFIED Referrals</option>
                  <option value="REWARDED">REWARDED (Invoiced)</option>
                  <option value="REJECTED">REJECTED Audits</option>
                </select>
              </div>
            </div>

            {/* Audit Logs Table */}
            <GlassCard className="text-left overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-[#0E5A75]/40 gap-4">
                  <RefreshCw className="animate-spin" size={36} />
                  <span className="text-xs font-black uppercase tracking-widest">Loading Referral Log Telemetry...</span>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-20 text-[#0E5A75]/40 flex flex-col items-center justify-center gap-2">
                  <BookOpen size={36} className="text-[#0E5A75]/20" />
                  <p className="text-xs font-bold uppercase tracking-widest">No matching referral logs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-xs">
                    <thead>
                      <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                        <th className="py-4 px-4 text-left">Referrer Info</th>
                        <th className="py-4 px-4 text-left">Referred User (New Host)</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4 text-left">Anti-Abuse Meta</th>
                        <th className="py-4 px-4 text-left">Attributed At</th>
                        <th className="py-4 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5 font-bold text-[#053344] dark:text-[#FDF6F1]">
                      {filteredEvents.map((evt) => {
                        const isFraud = evt.status === "FRAUD_FLAGGED";
                        return (
                          <tr 
                            key={evt.id} 
                            className={cn(
                              "hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors",
                              isFraud && "bg-rose-500/5 hover:bg-rose-500/10 border-l-4 border-rose-500"
                            )}
                          >
                            {/* Referrer column */}
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-[13px] font-black text-[#053344] dark:text-white">{evt.referrer.name}</p>
                                <p className="text-[10px] text-[#0E5A75]/60 dark:text-white/40">{evt.referrer.email}</p>
                                <p className="text-[10px] text-emerald-500">GST: {evt.referrer.gstin}</p>
                              </div>
                            </td>
                            {/* Referred host column */}
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-[13px] font-black text-[#053344] dark:text-white">{evt.referred.name}</p>
                                <p className="text-[10px] text-[#0E5A75]/60 dark:text-white/40">{evt.referred.email}</p>
                                <p className="text-[10px] text-[#0E5A75]/70">GST: {evt.referred.gstin}</p>
                              </div>
                            </td>
                            {/* Status badge */}
                            <td className="py-4 px-4 text-center">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide",
                                evt.status === "QUALIFIED" || evt.status === "REWARDED" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                evt.status === "PENDING" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                evt.status === "FRAUD_FLAGGED" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 animate-pulse border border-rose-500/30" :
                                "bg-gray-500/10 text-gray-500"
                              )}>
                                {evt.status}
                              </span>
                            </td>
                            {/* Anti abuse indicators metadata */}
                            <td className="py-4 px-4 font-mono text-[10px] max-w-[200px] truncate text-[#0E5A75]/70 dark:text-white/60">
                              {evt.metadata ? (
                                <div className="space-y-0.5 leading-tight">
                                  {Object.entries(evt.metadata).map(([k, v]) => (
                                    <p key={k} className={cn(v === true && "text-rose-500 font-bold")}>
                                      {k}: {String(v)}
                                    </p>
                                  ))}
                                </div>
                              ) : "No flags."}
                            </td>
                            {/* Created at date */}
                            <td className="py-4 px-4 font-medium">
                              {new Date(evt.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                            </td>
                            {/* Admin actions column */}
                            <td className="py-4 px-4 text-center">
                              {reviewingEventId === evt.id ? (
                                <div className="flex flex-col gap-2 p-2 bg-white/95 dark:bg-black/95 rounded-2xl shadow-xl border border-[#0E5A75]/20 animate-in fade-in-50 slide-in-from-top-2">
                                  <div className="flex items-center gap-1">
                                    <MessageSquare size={12} className="text-[#0E5A75]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]">Review Notes</span>
                                  </div>
                                  <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Enter administrative review notes..."
                                    className="w-48 p-2 text-[10px] font-semibold bg-white dark:bg-white/5 border border-[#0E5A75]/15 rounded-lg text-[#053344] dark:text-white outline-none focus:border-[#0E5A75] h-12"
                                  />
                                  <div className="flex justify-between gap-2">
                                    <button
                                      disabled={submittingAction}
                                      onClick={() => handleAdminOverride(evt.id, "APPROVE")}
                                      className="flex-1 py-1 rounded bg-emerald-500 text-white text-[9px] font-black uppercase hover:opacity-90 active:scale-95 transition-all"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      disabled={submittingAction}
                                      onClick={() => handleAdminOverride(evt.id, "REJECT")}
                                      className="flex-1 py-1 rounded bg-rose-500 text-white text-[9px] font-black uppercase hover:opacity-90 active:scale-95 transition-all"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                  <button
                                    onClick={() => setReviewingEventId(null)}
                                    className="text-[9px] font-bold text-gray-500 hover:underline uppercase tracking-wide"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-2">
                                  {(isFraud || evt.status === "PENDING") ? (
                                    <button
                                      onClick={() => { setReviewingEventId(evt.id); setAdminNotes(""); }}
                                      className="px-3 py-1.5 rounded-xl bg-[#0E5A75] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#0A4459] transition-all"
                                    >
                                      Review Event
                                    </button>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 font-semibold italic">Reviewed</span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </GlassCard>
          </>
        ) : (
          /* Leaderboard Tab view */
          <GlassCard className="text-left overflow-hidden">
            <WidgetHeader title="Top Performers & Leaderboard" icon={Award} />
            <div className="overflow-x-auto mt-4">
              <table className="w-full min-w-[700px] text-xs">
                <thead>
                  <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                    <th className="py-4 px-4 text-center">Rank</th>
                    <th className="py-4 px-4 text-left">Partner Host</th>
                    <th className="py-4 px-4 text-center">Referral Code</th>
                    <th className="py-4 px-4 text-center">Active Credits</th>
                    <th className="py-4 px-4 text-center">Lifetime Earned</th>
                    <th className="py-4 px-4 text-center">Pending Credits</th>
                    <th className="py-4 px-4 text-center">Redeemed Credits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5 font-bold text-[#053344] dark:text-[#FDF6F1]">
                  {topReferrers.map((ref, index) => (
                    <tr key={ref.id} className="hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-center font-black">
                        <span className={cn(
                          "inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs",
                          index === 0 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                          index === 1 ? "bg-slate-400/20 text-slate-600" :
                          index === 2 ? "bg-amber-700/20 text-amber-800" : "bg-gray-100 dark:bg-white/5 text-gray-400"
                        )}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-black">
                        <div>
                          <p className="text-[13px]">{ref.userName}</p>
                          <p className="text-[10px] text-[#0E5A75]/60 dark:text-white/40">{ref.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono font-black text-[#0E5A75] dark:text-[#0983B0]">{ref.referralCode}</td>
                      <td className="py-4 px-4 text-center font-black text-emerald-500">{ref.totalCredits}</td>
                      <td className="py-4 px-4 text-center font-black text-slate-800 dark:text-white">{ref.lifetimeCredits}</td>
                      <td className="py-4 px-4 text-center text-amber-500 font-black">{ref.pendingCredits}</td>
                      <td className="py-4 px-4 text-center text-slate-500 font-black">{ref.redeemedCredits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </AdminLayout>
  );
}

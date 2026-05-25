"use client";

import React, { useState, useEffect } from "react";
import { 
  Gift, 
  Copy, 
  Check, 
  Users, 
  Award, 
  HelpCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Glassmorphic UI Containers ---
const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("glass-premium rounded-[32px] p-6 hover-lift border border-white/60 dark:border-[#0E5A75]/20 shadow-xl shadow-[#0E5A75]/5 dark:shadow-none bg-white/40 dark:bg-[#0A0F1D]/40 backdrop-blur-md", className)}>
    {children}
  </div>
);

const WidgetHeader = ({ title, icon: Icon, action }: { title: string; icon?: React.ElementType; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2">
      {Icon && <div className="p-2 rounded-xl bg-[#0E5A75]/10 text-[#0E5A75] dark:text-[#0983B0] dark:bg-[#0983B0]/10"><Icon size={16} /></div>}
      <h3 className="text-sm font-bold text-[#053344] dark:text-[#FDF6F1] uppercase tracking-widest">{title}</h3>
    </div>
    {action}
  </div>
);

// --- Interfaces ---
interface ReferralProfile {
  referralCode: string;
  totalCredits: number;
  lifetimeCredits: number;
  pendingCredits: number;
  redeemedCredits: number;
  createdAt: string;
}

interface ReferralEvent {
  id: string;
  referredUser: {
    name: string;
    email: string;
  };
  status: string;
  creditsAwarded: number;
  awardedAt: string | null;
  createdAt: string;
}

interface LedgerEntry {
  id: string;
  eventType: string;
  credits: number;
  balanceAfter: number;
  notes: string;
  createdAt: string;
}

interface Redemption {
  id: string;
  creditsUsed: number;
  rewardType: string;
  discountAmount: number;
  billingCycle: string;
  createdAt: string;
}

export default function PartnerReferralPage() {
  const [profile, setProfile] = useState<ReferralProfile | null>(null);
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"referrals" | "ledger" | "redemptions">("referrals");

  // Fetch Referral Data (used by Refresh button)
  const fetchReferralDetails = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/partner/referrals");
      if (!res.ok) throw new Error("Failed to fetch referral metrics");
      const data = await res.json();
      if (data.success) {
        setProfile(data.profile);
        setEvents(data.events || []);
        setLedger(data.ledger || []);
        setRedemptions(data.redemptions || []);
      }
    } catch (error) {
      console.error("[REFERRALS_FETCH_ERROR] Error fetching partner referrals:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadReferralData() {
      try {
        const res = await fetch("/api/partner/referrals");
        if (!res.ok) throw new Error("Failed to fetch referral metrics");
        const data = await res.json();
        if (data.success && isMounted) {
          setProfile(data.profile);
          setEvents(data.events || []);
          setLedger(data.ledger || []);
          setRedemptions(data.redemptions || []);
        }
      } catch (error) {
        console.error("[REFERRALS_FETCH_ERROR] Error fetching partner referrals:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadReferralData();

    return () => {
      isMounted = false;
    };
  }, []);

  const copyToClipboard = () => {
    if (!profile) return;
    const shareLink = `${window.location.origin}/register?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gamified Milestones Calculation
  const currentUnused = profile?.totalCredits || 0;
  const getMilestoneProgress = () => {
    if (currentUnused >= 10) return 100;
    return (currentUnused / 10) * 100;
  };

  const getNextRewardText = () => {
    if (currentUnused < 4) {
      return `${4 - currentUnused} more credit${4 - currentUnused > 1 ? "s" : ""} to unlock 50% off Half-Yearly!`;
    } else if (currentUnused < 6) {
      return `${6 - currentUnused} more credit${6 - currentUnused > 1 ? "s" : ""} to unlock 100% off Half-Yearly OR 50% off Yearly!`;
    } else if (currentUnused < 10) {
      return `${10 - currentUnused} more credit${10 - currentUnused > 1 ? "s" : ""} to unlock 100% off Yearly (Free Year)!`;
    }
    return "You have unlocked the highest reward tier! Free yearly subscriptions await.";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "QUALIFIED":
      case "REWARDED":
        return <CheckCircle size={14} className="text-emerald-500" />;
      case "PENDING":
        return <Clock size={14} className="text-amber-500 animate-pulse" />;
      case "FRAUD_FLAGGED":
        return <AlertTriangle size={14} className="text-rose-500" />;
      case "REJECTED":
        return <XCircle size={14} className="text-gray-400" />;
      default:
        return <HelpCircle size={14} className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "QUALIFIED":
      case "REWARDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wide">
            {getStatusIcon(status)} Active
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wide">
            {getStatusIcon(status)} Pending Payment
          </span>
        );
      case "FRAUD_FLAGGED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wide">
            {getStatusIcon(status)} Under Review
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-600 dark:text-gray-400 text-[10px] font-black uppercase tracking-wide">
            {getStatusIcon(status)} Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-500 text-[10px] font-black uppercase tracking-wide">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] dark:bg-[#0983B0] opacity-40" />
            <span className="text-[10px] font-black text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Growth & Incentives</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Referrals & Rewards</h1>
          <p className="text-[#0E5A75]/70 dark:text-[#0983B0]/70 mt-3 font-semibold text-lg">
            Invite fellow hosts, earn credits, and enjoy up to 100% off your Home4Stay subscription renewals!
          </p>
        </div>

        <button
          onClick={fetchReferralDetails}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white dark:bg-[#0E5A75]/10 border border-[#0E5A75]/10 text-xs font-black uppercase tracking-widest text-[#0E5A75] dark:text-[#0983B0] hover:bg-[#0E5A75]/5 dark:hover:bg-[#0983B0]/5 transition-all active:scale-95 shrink-0"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          <span>Refresh Details</span>
        </button>
      </div>

      {loading && !profile ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <RefreshCw size={36} className="animate-spin text-[#0E5A75]" />
          <p className="text-xs font-black uppercase tracking-widest text-[#0E5A75]/60">Loading Your Referral Stats...</p>
        </div>
      ) : (
        <>
          {/* Top Hero and Milestones Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Share & Code Card */}
            <GlassCard className="col-span-1 lg:col-span-1 relative overflow-hidden group flex flex-col justify-between min-h-[300px]">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-[#0E5A75]/5 rounded-full blur-3xl group-hover:bg-[#0E5A75]/15 transition-all duration-700" />
              
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-[#0E5A75]/10 text-[#0E5A75] dark:text-[#0983B0] dark:bg-[#0983B0]/10 rounded-2xl">
                    <Gift size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#053344] dark:text-[#FDF6F1] uppercase tracking-widest">Your Referral Code</h3>
                    <p className="text-xs text-[#0E5A75]/60 dark:text-white/40 font-bold mt-0.5">Share with partners to earn rewards</p>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-black/40 border border-[#0E5A75]/15 dark:border-[#0E5A75]/10 rounded-2xl p-4 text-center my-6 flex items-center justify-between">
                  <span className="font-mono text-xl font-black text-[#053344] dark:text-white tracking-wider">
                    {profile?.referralCode || "LOADING..."}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0E5A75] dark:bg-[#0983B0] text-white hover:opacity-90 transition-all font-bold text-xs"
                  >
                    {copied ? (
                      <>
                        <Check size={14} />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs text-[#0E5A75]/70 dark:text-white/60 bg-[#0E5A75]/5 rounded-xl p-3 border border-[#0E5A75]/10 leading-relaxed font-semibold">
                🔔 <strong>How it works:</strong> Share your invite link. When a host joins and starts their first subscription, they get onboarded and you transactionally receive +1 active credit!
              </div>
            </GlassCard>

            {/* Milestones Card */}
            <GlassCard className="col-span-1 lg:col-span-2 relative overflow-hidden group flex flex-col justify-between min-h-[300px]">
              <div>
                <WidgetHeader title="Reward Milestone Progress" icon={Award} action={
                  <span className="text-xs font-black text-[#0E5A75] dark:text-[#0983B0] bg-[#0E5A75]/10 dark:bg-[#0983B0]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    {profile?.totalCredits || 0} Active Credit{(profile?.totalCredits || 0) !== 1 ? "s" : ""}
                  </span>
                } />

                {/* Progress bar container */}
                <div className="space-y-4 my-4">
                  <div className="flex justify-between items-center text-xs font-bold text-[#0E5A75]/60 dark:text-white/50 px-1">
                    <span>Host Conversions</span>
                    <span>Goal: 10 Credits (Free Year)</span>
                  </div>

                  <div className="h-4 w-full bg-[#0E5A75]/10 dark:bg-white/5 rounded-full overflow-hidden relative shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-[#0E5A75] to-[#159665] dark:from-[#0983B0] dark:to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${getMilestoneProgress()}%` }}
                    />
                    
                    {/* Tick Milestones Overlay */}
                    <div className="absolute inset-0 flex justify-between px-[10%] pointer-events-none items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black border border-gray-400" title="Milestone 4" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black border border-gray-400" title="Milestone 6" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black border border-gray-400" title="Milestone 10" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 text-center text-[10px] font-black text-[#0E5A75]/60 dark:text-white/40 tracking-wider">
                    <div className="text-left pl-[10%]">
                      <p className="text-xs font-black text-[#053344] dark:text-[#FDF6F1]">4 Credits</p>
                      <p>50% Off Half-Yearly</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-[#053344] dark:text-[#FDF6F1]">6 Credits</p>
                      <p>100% Off Half-Yearly / 50% Off Yearly</p>
                    </div>
                    <div className="text-right pr-[10%]">
                      <p className="text-xs font-black text-[#053344] dark:text-[#FDF6F1]">10 Credits</p>
                      <p>100% Off Yearly (Free!)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 mt-4">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400 animate-bounce">
                  <TrendingUp size={16} />
                </div>
                <p className="text-xs font-bold text-[#053344] dark:text-white tracking-tight leading-snug">
                  <strong>Next Milestones Status:</strong> {getNextRewardText()}
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest mb-1">Lifetime Credits</p>
                  <h4 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">{profile?.lifetimeCredits || 0}</h4>
                </div>
                <div className="p-2 bg-[#0E5A75]/5 text-[#0E5A75] dark:text-[#0983B0] rounded-xl"><Award size={18} /></div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest mb-1">Active Balance</p>
                  <h4 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">{profile?.totalCredits || 0}</h4>
                </div>
                <div className="p-2 bg-emerald-500/5 text-emerald-500 rounded-xl"><Gift size={18} /></div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest mb-1">Pending Balance</p>
                  <h4 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">{profile?.pendingCredits || 0}</h4>
                </div>
                <div className="p-2 bg-amber-500/5 text-amber-500 rounded-xl"><Clock size={18} /></div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest mb-1">Redeemed Credits</p>
                  <h4 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">{profile?.redeemedCredits || 0}</h4>
                </div>
                <div className="p-2 bg-slate-500/5 text-slate-500 rounded-xl"><Users size={18} /></div>
              </div>
            </GlassCard>
          </div>

          {/* Tab Navigation for History Tables */}
          <div className="space-y-6">
            <div className="flex border-b border-[#0E5A75]/10 dark:border-white/10 p-1 w-fit gap-2 bg-[#0E5A75]/5 dark:bg-white/5 rounded-2xl">
              <button
                onClick={() => setActiveTab("referrals")}
                className={cn(
                  "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === "referrals"
                    ? "bg-[#0E5A75] text-white shadow-md"
                    : "text-[#0E5A75] hover:bg-[#0E5A75]/5 dark:text-white/60 dark:hover:bg-white/5"
                )}
              >
                Conversion Events ({events.length})
              </button>
              <button
                onClick={() => setActiveTab("ledger")}
                className={cn(
                  "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === "ledger"
                    ? "bg-[#0E5A75] text-white shadow-md"
                    : "text-[#0E5A75] hover:bg-[#0E5A75]/5 dark:text-white/60 dark:hover:bg-white/5"
                )}
              >
                Audit Credit Ledger ({ledger.length})
              </button>
              <button
                onClick={() => setActiveTab("redemptions")}
                className={cn(
                  "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === "redemptions"
                    ? "bg-[#0E5A75] text-white shadow-md"
                    : "text-[#0E5A75] hover:bg-[#0E5A75]/5 dark:text-white/60 dark:hover:bg-white/5"
                )}
              >
                Redemption History ({redemptions.length})
              </button>
            </div>

            {/* Render Active Table */}
            <GlassCard className="text-left">
              {activeTab === "referrals" && (
                <div className="overflow-x-auto">
                  {events.length === 0 ? (
                    <div className="text-center py-16 text-[#0E5A75]/40 flex flex-col items-center justify-center gap-2">
                      <Users size={32} className="text-[#0E5A75]/20" />
                      <p className="text-xs font-black uppercase tracking-widest">No referral registrations tracked yet</p>
                    </div>
                  ) : (
                    <table className="w-full min-w-[600px] text-xs">
                      <thead>
                        <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                          <th className="py-4 px-4 text-left">Invited Host</th>
                          <th className="py-4 px-4 text-left">Registration Date</th>
                          <th className="py-4 px-4 text-center">Status</th>
                          <th className="py-4 px-4 text-center">Credits Awarded</th>
                          <th className="py-4 px-4 text-left">Awarded Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5 font-bold text-[#053344] dark:text-[#FDF6F1]">
                        {events.map((evt) => (
                          <tr key={evt.id} className="hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 font-black">
                              <div>
                                <p className="text-[13px]">{evt.referredUser.name}</p>
                                <p className="text-[10px] text-[#0E5A75]/60 dark:text-white/40">{evt.referredUser.email}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">{new Date(evt.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                            <td className="py-4 px-4 text-center">{getStatusBadge(evt.status)}</td>
                            <td className="py-4 px-4 text-center font-black text-emerald-500">
                              {evt.creditsAwarded > 0 ? `+${evt.creditsAwarded}` : "—"}
                            </td>
                            <td className="py-4 px-4 text-[#0E5A75]/70 dark:text-white/60">
                              {evt.awardedAt ? new Date(evt.awardedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Pending"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === "ledger" && (
                <div className="overflow-x-auto">
                  {ledger.length === 0 ? (
                    <div className="text-center py-16 text-[#0E5A75]/40 flex flex-col items-center justify-center gap-2">
                      <Award size={32} className="text-[#0E5A75]/20" />
                      <p className="text-xs font-black uppercase tracking-widest">No ledger records generated yet</p>
                    </div>
                  ) : (
                    <table className="w-full min-w-[600px] text-xs">
                      <thead>
                        <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                          <th className="py-4 px-4 text-left">Event Type</th>
                          <th className="py-4 px-4 text-center">Credit Change</th>
                          <th className="py-4 px-4 text-center">New Balance</th>
                          <th className="py-4 px-4 text-left">Audit Notes</th>
                          <th className="py-4 px-4 text-left">Logged At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5 font-bold text-[#053344] dark:text-[#FDF6F1]">
                        {ledger.map((l) => (
                          <tr key={l.id} className="hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4">
                              <span className={cn(
                                "px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide",
                                l.credits > 0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              )}>
                                {l.eventType}
                              </span>
                            </td>
                            <td className={cn("py-4 px-4 text-center font-black", l.credits > 0 ? "text-emerald-500" : "text-rose-500")}>
                              {l.credits > 0 ? `+${l.credits}` : l.credits}
                            </td>
                            <td className="py-4 px-4 text-center font-black text-[#053344] dark:text-white">{l.balanceAfter}</td>
                            <td className="py-4 px-4 max-w-xs truncate text-[#0E5A75]/70 dark:text-white/60">{l.notes}</td>
                            <td className="py-4 px-4 text-[#0E5A75]/70 dark:text-white/60">
                              {new Date(l.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === "redemptions" && (
                <div className="overflow-x-auto">
                  {redemptions.length === 0 ? (
                    <div className="text-center py-16 text-[#0E5A75]/40 flex flex-col items-center justify-center gap-2">
                      <FileText size={32} className="text-[#0E5A75]/20" />
                      <p className="text-xs font-black uppercase tracking-widest">No credit discount redemptions applied yet</p>
                    </div>
                  ) : (
                    <table className="w-full min-w-[600px] text-xs">
                      <thead>
                        <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                          <th className="py-4 px-4 text-left">Reward Tier</th>
                          <th className="py-4 px-4 text-center">Credits Spent</th>
                          <th className="py-4 px-4 text-center">Applied Billing Cycle</th>
                          <th className="py-4 px-4 text-right">Resolved Discount</th>
                          <th className="py-4 px-4 text-left">Redeemed At</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5 font-bold text-[#053344] dark:text-[#FDF6F1]">
                        {redemptions.map((r) => (
                          <tr key={r.id} className="hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 font-black">
                              <div className="flex items-center gap-2">
                                <Award size={14} className="text-emerald-500" />
                                <span>{r.rewardType.replace(/_/g, " ")}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center font-black text-rose-500">-{r.creditsUsed}</td>
                            <td className="py-4 px-4 text-center uppercase tracking-wider">{r.billingCycle}</td>
                            <td className="py-4 px-4 text-right font-black text-emerald-500">₹{r.discountAmount.toLocaleString()}</td>
                            <td className="py-4 px-4 text-[#0E5A75]/70 dark:text-white/60">
                              {new Date(r.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Play,
  CheckCircle,
  XCircle,
  Bell,
  RefreshCw,
  Clock,
  Terminal,
  Search,
  Filter,
  AlertTriangle,
  Mail,
  MessageSquare,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Database
} from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { cn } from "@/lib/utils";

// --- Glassmorphic Container components ---
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
interface JobLog {
  id: string;
  jobType: string;
  status: string;
  recordsProcessed: number;
  errorMessage: string | null;
  logs: string[] | any;
  createdAt: string;
}

interface AuditLog {
  id: string;
  transactionId: string;
  action: string;
  oldStatus: string | null;
  newStatus: string | null;
  performedBy: string | null;
  metadata: any;
  createdAt: string;
  transaction: {
    property: {
      title: string;
      ownerId: string;
    };
  };
}

export default function SuperAdminAutomationPage() {
  const [activeTab, setActiveTab] = useState<"jobs" | "notifications" | "lifecycle">("jobs");
  const [loading, setLoading] = useState(true);
  const [triggeringScan, setTriggeringScan] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; trace: string[] } | null>(null);
  const [showConsole, setShowConsole] = useState(false);

  const [jobLogs, setJobLogs] = useState<JobLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Load automation state from backend
  const fetchAutomationLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/automation/logs");
      if (!res.ok) throw new Error("Could not load lifecycle logs");
      const data = await res.json();
      if (data.success) {
        setJobLogs(data.jobLogs || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomationLogs();
  }, []);

  // Trigger Lifecycle scan synchronously
  const triggerLifecycleScan = async () => {
    try {
      setTriggeringScan(true);
      setScanResult(null);
      setShowConsole(true);

      const secretKey = process.env.NEXT_PUBLIC_CRON_SECRET || "local_cron_secret";
      const res = await fetch(`/api/cron/subscription-lifecycle?secret=${secretKey}`);
      const data = await res.json();

      setScanResult({
        success: data.success,
        trace: data.trace || ["Daily scan execution completed without trace logs."]
      });

      // Reload lists
      fetchAutomationLogs();
    } catch (err: any) {
      setScanResult({
        success: false,
        trace: ["CRITICAL ERROR: Failed to dispatch background lifecycle execution request.", err.message]
      });
    } finally {
      setTriggeringScan(false);
    }
  };

  // Metric computations
  const totalRuns = jobLogs.length;
  const totalReminders = auditLogs.filter(log => log.action === "RENEWAL_REMINDER_SENT").length;
  const graceTransitions = auditLogs.filter(log => log.action === "GRACE_PERIOD_ENTERED").length;
  const suspendedOverdue = auditLogs.filter(log => log.action === "SUBSCRIPTION_EXPIRED_SUSPENDED").length;

  // Filter logs based on tabs, search and dropdown filters
  const getFilteredLogs = () => {
    if (activeTab === "jobs") {
      return jobLogs.filter(job => {
        if (statusFilter !== "ALL" && job.status !== statusFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return job.jobType.toLowerCase().includes(q) || (job.errorMessage && job.errorMessage.toLowerCase().includes(q));
        }
        return true;
      });
    } else if (activeTab === "notifications") {
      return auditLogs
        .filter(log => log.action === "RENEWAL_REMINDER_SENT")
        .filter(log => {
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const propertyName = log.transaction?.property?.title?.toLowerCase() || "";
            const reminderType = (log.metadata as any)?.reminderType?.toLowerCase() || "";
            return propertyName.includes(q) || reminderType.includes(q);
          }
          return true;
        });
    } else {
      // Lifecycle status shifts
      return auditLogs
        .filter(log => log.action !== "RENEWAL_REMINDER_SENT")
        .filter(log => {
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const propertyName = log.transaction?.property?.title?.toLowerCase() || "";
            const action = log.action.toLowerCase();
            return propertyName.includes(q) || action.includes(q);
          }
          return true;
        });
    }
  };

  const filteredItems = getFilteredLogs();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const displayedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper formats
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
        {/* Header Console */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-px bg-[#0E5A75] dark:bg-[#0983B0] opacity-50" />
              <span className="text-[10px] font-black text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Operational Controls</span>
            </div>
            <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Subscription Automation</h1>
            <p className="text-[#0E5A75]/70 dark:text-[#0983B0]/70 mt-3 font-semibold text-lg">
              Monitor dynamic billing engine lifecycles, cron execution traces, and manual automation overrides.
            </p>
          </div>

          <button
            onClick={triggerLifecycleScan}
            disabled={triggeringScan}
            className="flex items-center gap-2.5 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#0E5A75] to-[#0A4459] dark:from-[#0983B0] dark:to-[#053344] text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-[#0E5A75]/20 hover:shadow-2xl transition-all duration-300 transform active:scale-95 disabled:opacity-50 shrink-0"
          >
            {triggeringScan ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Running Scan...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Trigger Daily Scan Now</span>
              </>
            )}
          </button>
        </div>

        {/* Diagnostic Trace Overlay Console */}
        {showConsole && (
          <GlassCard className="border-[#0E5A75]/30 relative overflow-hidden bg-black/90 dark:bg-black/95 text-left animate-in slide-in-from-top-6 duration-500 shadow-2xl">
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => setShowConsole(false)} 
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all text-xs font-bold uppercase tracking-widest"
              >
                Close Console
              </button>
            </div>

            <WidgetHeader title="Lifecycle Automated Execution Console" icon={Terminal} />
            
            <div className="bg-[#050B14] rounded-2xl p-6 font-mono text-xs text-[#15C365] overflow-y-auto max-h-[350px] border border-white/5 space-y-2 mt-4 custom-scrollbar shadow-inner leading-relaxed">
              <div className="text-white/40 mb-3 border-b border-white/5 pb-2 flex items-center justify-between">
                <span>TERMINAL ACTIVE &bull; {new Date().toLocaleTimeString()}</span>
                {triggeringScan && <span className="animate-pulse text-[#FCBC43]">SCANNING LIFECYCLES...</span>}
              </div>

              {triggeringScan && (
                <div className="flex items-center gap-2 text-[#FCBC43] py-2">
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Connecting to subscription lifecycle daemon engine... Dispatching scan transactions...</span>
                </div>
              )}

              {scanResult && (
                <div className="space-y-1.5">
                  <div className={cn("font-bold text-sm mb-4 p-3 rounded-xl border flex items-center gap-2", 
                    scanResult.success ? "bg-[#159665]/10 border-[#159665]/30 text-[#15C365]" : "bg-[#F24633]/10 border-[#F24633]/30 text-[#F24633]"
                  )}>
                    {scanResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    <span>Execution Status: {scanResult.success ? "SUCCESS" : "FAILED"}</span>
                  </div>

                  {scanResult.trace.map((line, idx) => (
                    <div key={idx} className={cn(
                      line.includes("[ERROR]") || line.includes("failed") ? "text-[#F24633]" :
                      line.includes("[WARN]") ? "text-[#FCBC43]" :
                      line.includes("Successfully") || line.includes("completed") ? "text-[#15C365]" : "text-white/80"
                    )}>
                      &gt; {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Dashboard Aggregate Stat Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlassCard className="relative overflow-hidden group hover:border-[#0E5A75]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest">Automation Runs</span>
                <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">{totalRuns}</h3>
              </div>
              <div className="p-3 bg-[#0E5A75]/10 text-[#0E5A75] dark:text-[#0983B0] dark:bg-[#0983B0]/10 rounded-2xl">
                <Activity size={20} />
              </div>
            </div>
            <div className="h-1 w-full bg-[#0E5A75]/10 dark:bg-white/5 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-[#0E5A75] dark:bg-[#0983B0] w-[65%]" />
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden group hover:border-[#FCBC43]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#FCBC43]/60 uppercase tracking-widest">Dispatched Notices</span>
                <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">{totalReminders}</h3>
              </div>
              <div className="p-3 bg-[#FCBC43]/10 text-[#FCBC43] rounded-2xl">
                <Bell size={20} />
              </div>
            </div>
            <div className="h-1 w-full bg-[#FCBC43]/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-[#FCBC43] w-[45%]" />
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden group hover:border-[#159665]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#159665]/60 uppercase tracking-widest">Grace Period Transitions</span>
                <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">{graceTransitions}</h3>
              </div>
              <div className="p-3 bg-[#159665]/10 text-[#159665] rounded-2xl">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="h-1 w-full bg-[#159665]/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-[#159665] w-[35%]" />
            </div>
          </GlassCard>

          <GlassCard className="relative overflow-hidden group hover:border-[#F24633]/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#F24633]/60 uppercase tracking-widest">Listing Suspensions</span>
                <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">{suspendedOverdue}</h3>
              </div>
              <div className="p-3 bg-[#F24633]/10 text-[#F24633] rounded-2xl animate-pulse">
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="h-1 w-full bg-[#F24633]/10 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-[#F24633] w-[20%]" />
            </div>
          </GlassCard>
        </div>

        {/* Navigation Tab selection menu */}
        <div className="flex flex-wrap gap-2.5 p-1 bg-[#0E5A75]/5 dark:bg-white/5 rounded-2xl w-fit">
          <button
            onClick={() => { setActiveTab("jobs"); setCurrentPage(1); setStatusFilter("ALL"); }}
            className={cn(
              "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "jobs"
                ? "bg-[#0E5A75] text-white shadow-md"
                : "text-[#0E5A75] hover:bg-[#0E5A75]/5 dark:text-white/60 dark:hover:bg-white/5"
            )}
          >
            Automation Cron Jobs
          </button>
          <button
            onClick={() => { setActiveTab("notifications"); setCurrentPage(1); }}
            className={cn(
              "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "notifications"
                ? "bg-[#0E5A75] text-white shadow-md"
                : "text-[#0E5A75] hover:bg-[#0E5A75]/5 dark:text-white/60 dark:hover:bg-white/5"
            )}
          >
            Notification Logs
          </button>
          <button
            onClick={() => { setActiveTab("lifecycle"); setCurrentPage(1); }}
            className={cn(
              "px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === "lifecycle"
                ? "bg-[#0E5A75] text-white shadow-md"
                : "text-[#0E5A75] hover:bg-[#0E5A75]/5 dark:text-white/60 dark:hover:bg-white/5"
            )}
          >
            Subscription Lifecycle Transitions
          </button>
        </div>

        {/* Filter Toolbar Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/20 dark:bg-white/5 p-4 rounded-3xl border border-[#0E5A75]/10">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-3.5 text-[#0E5A75]/40" size={16} />
            <input
              type="text"
              placeholder={activeTab === "jobs" ? "Search job logs..." : activeTab === "notifications" ? "Search property or notification type..." : "Search properties or actions..."}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-white/5 rounded-2xl text-xs font-bold border border-[#0E5A75]/10 dark:border-white/10 text-[#053344] dark:text-white outline-none focus:border-[#0E5A75] focus:ring-1 focus:ring-[#0E5A75]"
            />
          </div>

          {activeTab === "jobs" && (
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#0983B0]" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-white dark:bg-white/5 rounded-2xl border border-[#0E5A75]/10 text-xs font-bold text-[#0E5A75] dark:text-white outline-none"
              >
                <option value="ALL">All Run Statuses</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            </div>
          )}
        </div>

        {/* Diagnostic Data Grid Lists */}
        <GlassCard className="text-left">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#0E5A75]/40 gap-4">
              <RefreshCw className="animate-spin" size={36} />
              <span className="text-xs font-black uppercase tracking-widest">Loading Telemetry Logs...</span>
            </div>
          ) : displayedItems.length === 0 ? (
            <div className="text-center py-20 text-[#0E5A75]/40 flex flex-col items-center justify-center gap-2">
              <Database size={36} className="text-[#0E5A75]/20" />
              <p className="text-xs font-bold uppercase tracking-widest">No automation logs recorded yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                {activeTab === "jobs" && (
                  <table className="w-full min-w-[700px] text-xs">
                    <thead>
                      <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                        <th className="py-4 px-4 text-left">Log ID</th>
                        <th className="py-4 px-4 text-left">Cron Scan Type</th>
                        <th className="py-4 px-4 text-center">Records Updated</th>
                        <th className="py-4 px-4 text-left">Execution Date</th>
                        <th className="py-4 px-4 text-center">Status</th>
                        <th className="py-4 px-4 text-left">Error / Trace Info</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5">
                      {displayedItems.map((job: any) => (
                        <tr key={job.id} className="hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors font-bold text-[#053344] dark:text-[#FDF6F1]">
                          <td className="py-4 px-4 font-black">{job.id.substring(0, 8)}</td>
                          <td className="py-4 px-4 font-black text-[#0E5A75] dark:text-[#0983B0]">{job.jobType}</td>
                          <td className="py-4 px-4 text-center font-black">{job.recordsProcessed}</td>
                          <td className="py-4 px-4">{formatDate(job.createdAt)}</td>
                          <td className="py-4 px-4 text-center">
                            {job.status === "SUCCESS" ? (
                              <span className="px-2.5 py-1 rounded-full bg-[#159665]/10 text-[#159665] text-[10px] font-black uppercase tracking-wide">Success</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-[#F24633]/10 text-[#F24633] text-[10px] font-black uppercase tracking-wide">Failed</span>
                            )}
                          </td>
                          <td className="py-4 px-4 max-w-xs truncate text-[#0E5A75]/70 dark:text-white/60">
                            {job.errorMessage || (job.logs && Array.isArray(job.logs) && job.logs[job.logs.length - 1]) || "Execution safe."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {activeTab === "notifications" && (
                  <table className="w-full min-w-[700px] text-xs">
                    <thead>
                      <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                        <th className="py-4 px-4 text-left">Property Title</th>
                        <th className="py-4 px-4 text-left">Notice Type</th>
                        <th className="py-4 px-4 text-left">Reminder State</th>
                        <th className="py-4 px-4 text-left">Dispatched Time</th>
                        <th className="py-4 px-4 text-center">Channels Utilized</th>
                        <th className="py-4 px-4 text-left">Audit Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5">
                      {displayedItems.map((log: any) => {
                        const meta = log.metadata || {};
                        return (
                          <tr key={log.id} className="hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors font-bold text-[#053344] dark:text-[#FDF6F1]">
                            <td className="py-4 px-4 font-black">{log.transaction?.property?.title || "Unknown Property"}</td>
                            <td className="py-4 px-4">
                              <span className="px-2.5 py-1 rounded-full bg-[#FCBC43]/10 text-[#FCBC43] text-[10px] font-black uppercase tracking-wide">
                                {meta.reminderType || "N/A"} Notice
                              </span>
                            </td>
                            <td className="py-4 px-4 uppercase text-[#0E5A75]/80 dark:text-white/70">Expires: {meta.expiresAt ? new Date(meta.expiresAt).toLocaleDateString("en-IN") : "N/A"}</td>
                            <td className="py-4 px-4">{formatDate(log.createdAt)}</td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-3">
                                <div className="p-1 rounded bg-[#0E5A75]/10 text-[#0E5A75] dark:text-[#0983B0]" title="Email notification sent"><Mail size={14} /></div>
                                <div className="p-1 rounded bg-[#159665]/10 text-[#159665]" title="WhatsApp notification sent"><MessageSquare size={14} /></div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-[#0E5A75]/70 dark:text-white/60 font-mono text-[10px]">{log.action}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {activeTab === "lifecycle" && (
                  <table className="w-full min-w-[700px] text-xs">
                    <thead>
                      <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                        <th className="py-4 px-4 text-left">Property Title</th>
                        <th className="py-4 px-4 text-left">Automated Action</th>
                        <th className="py-4 px-4 text-center">Old State</th>
                        <th className="py-4 px-4 text-center">New State</th>
                        <th className="py-4 px-4 text-left">Transition Date</th>
                        <th className="py-4 px-4 text-left">Executed By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5">
                      {displayedItems.map((log: any) => (
                        <tr key={log.id} className="hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors font-bold text-[#053344] dark:text-[#FDF6F1]">
                          <td className="py-4 px-4 font-black">{log.transaction?.property?.title || "Unknown Property"}</td>
                          <td className="py-4 px-4">
                            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide",
                              log.action === "GRACE_PERIOD_ENTERED" ? "bg-[#FCBC43]/15 text-[#FCBC43]" :
                              log.action === "SUBSCRIPTION_EXPIRED_SUSPENDED" ? "bg-[#F24633]/15 text-[#F24633] animate-pulse" :
                              "bg-[#159665]/10 text-[#159665]"
                            )}>
                              {log.action.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center uppercase text-[#0E5A75]/60 dark:text-white/40">{log.oldStatus || "N/A"}</td>
                          <td className="py-4 px-4 text-center uppercase font-black text-[#053344] dark:text-white">{log.newStatus || "N/A"}</td>
                          <td className="py-4 px-4">{formatDate(log.createdAt)}</td>
                          <td className="py-4 px-4 text-xs font-mono text-[#0E5A75]/70 dark:text-white/60">{log.performedBy || "system"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination control metrics */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#0E5A75]/10 dark:border-white/10">
                  <span className="text-[10px] font-bold text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest">
                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="p-2 rounded-xl border border-[#0E5A75]/10 hover:bg-[#0E5A75]/5 text-[#0E5A75] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-black px-2">{currentPage} / {totalPages}</span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="p-2 rounded-xl border border-[#0E5A75]/10 hover:bg-[#0E5A75]/5 text-[#0E5A75] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </div>
    </AdminLayout>
  );
}

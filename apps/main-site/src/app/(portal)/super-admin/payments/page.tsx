"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Shield,
  RefreshCw,
  AlertTriangle,
  User,
  Home,
  DollarSign,
  Activity,
  Clock,
  Plus,
  ListOrdered
} from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";

interface PendingPayment {
  id: string;
  propertyId: string;
  propertyName: string;
  ownerName: string;
  ownerEmail: string;
  amount: number;
  currency: string;
  utrNumber: string | null;
  paymentScreenshotUrl: string | null;
  createdAt: string;
  billingCycle: string;
  planId: string;
}

interface HistoricPayment {
  id: string;
  propertyId: string;
  propertyName: string;
  ownerName: string;
  ownerEmail: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  utrNumber: string | null;
  reviewedAt: string | null;
  createdAt: string;
  billingCycle: string;
  planId: string;
}

interface ExpiringSub {
  id: string;
  propertyId: string;
  propertyName: string;
  ownerName: string;
  ownerEmail: string;
  selectedPlanId: string;
  billingCycle: string;
  amount: number;
  expiresAt: string;
}

interface Subscription {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyStatus: string;
  ownerName: string;
  ownerEmail: string;
  selectedPlanId: string;
  status: string;
  billingCycle: string;
  amount: number;
  startsAt: string | null;
  expiresAt: string | null;
  activatedAt: string | null;
  suspendedAt: string | null;
  createdAt: string;
}

interface AuditLog {
  id: string;
  transactionId: string;
  action: string;
  oldStatus: string | null;
  newStatus: string | null;
  performedBy: string | null;
  metadata: {
    reason?: string;
    daysAdded?: number;
    oldPlanId?: string;
    newPlanId?: string;
    [key: string]: unknown;
  } | null;
  createdAt: string;
  propertyName: string;
  utrNumber: string | null;
}

interface FinanceMetrics {
  totalRevenue: number;
  pendingApprovalsAmount: number;
  activeSubscriptionsCount: number;
  rejectedPaymentCount: number;
  mrr: number;
  arr: number;
}

export default function SuperAdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"approvals" | "subscriptions" | "history" | "audit" | "analytics">("approvals");
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Core aggregated state
  const [finance, setFinance] = useState<FinanceMetrics>({
    totalRevenue: 0,
    pendingApprovalsAmount: 0,
    activeSubscriptionsCount: 0,
    rejectedPaymentCount: 0,
    mrr: 0,
    arr: 0
  });
  const [pendingQueue, setPendingQueue] = useState<PendingPayment[]>([]);
  const [historyLogs, setHistoryLogs] = useState<HistoricPayment[]>([]);
  const [expiringQueue, setExpiringQueue] = useState<ExpiringSub[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Selection states for detail drawers/modals
  const [selectedPending, setSelectedPending] = useState<PendingPayment | null>(null);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // Manual override states
  const [daysToExtend, setDaysToExtend] = useState("30");
  const [extendReason, setExtendReason] = useState("");
  const [newPlanId, setNewPlanId] = useState("VIP");
  const [newBillingCycle, setNewBillingCycle] = useState("YEARLY");
  const [newAmount, setNewAmount] = useState("4999");
  const [changePlanReason, setChangePlanReason] = useState("");

  // Search & Filters
  const [subFilter, setSubFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const showNotice = useCallback((type: "success" | "error", message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  }, []);

  const fetchDashboardData = useCallback(async (showQueueLoading = true) => {
    if (showQueueLoading) {
      setLoading(true);
    }
    try {
      // 1. Load primary metrics & pending queues
      const dashboardRes = await fetch("/api/admin/payments/dashboard");
      const dashboardData = await dashboardRes.json();
      if (dashboardData.success) {
        setFinance(dashboardData.finance);
        setPendingQueue(dashboardData.pendingQueue);
        setHistoryLogs(dashboardData.historyLogs);
        setExpiringQueue(dashboardData.expiringQueue);
      }

      // 2. Load complete subscriptions list
      const subsRes = await fetch(`/api/admin/payments/subscriptions?status=${subFilter}`);
      const subsData = await subsRes.json();
      if (subsData.success) {
        setSubscriptions(subsData.subscriptions);
      }

      // 3. Load administrative audit trails
      const auditRes = await fetch("/api/admin/payments/audit-logs");
      const auditData = await auditRes.json();
      if (auditData.success) {
        setAuditLogs(auditData.logs);
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Error pulling operations records from Postgres.");
    } finally {
      setLoading(false);
    }
  }, [subFilter, showNotice]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await fetchDashboardData(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchDashboardData]);

  // Payment approval logic
  const handleApprovePayment = async (id: string) => {
    setActioning(true);
    showNotice("success", "Confirming manual payment transfer...");
    try {
      const res = await fetch(`/api/admin/payments/${id}/approve`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Manual UPI payment verified. Property subscription has been activated.");
        setSelectedPending(null);
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Approval transaction failed.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Failed to compile approval.");
    } finally {
      setActioning(false);
    }
  };

  // Payment rejection logic
  const handleRejectPayment = async (id: string) => {
    if (!rejectReason.trim()) {
      showNotice("error", "Please provide a rejection reason details.");
      return;
    }
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/payments/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Transaction rejected and owner notified.");
        setSelectedPending(null);
        setRejectReason("");
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to commit rejection.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Rejection execution error.");
    } finally {
      setActioning(false);
    }
  };

  // Manual Subscription Extension
  const handleExtendSub = async () => {
    if (!selectedSub || !daysToExtend) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/payments/subscriptions/${selectedSub.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          daysToExtend: parseInt(daysToExtend, 10),
          reason: extendReason || "Manual administrative renewal extension."
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", `Subscription manually extended by ${daysToExtend} days successfully.`);
        setSelectedSub(null);
        setExtendReason("");
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Extension action failed.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Manual renewal offset error.");
    } finally {
      setActioning(false);
    }
  };

  // Manual Suspension
  const handleSuspendSub = async (sub: Subscription) => {
    if (!confirm("Are you absolutely sure you want to suspend this subscription? The associated property will immediately go offline!")) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/payments/subscriptions/${sub.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Administrative suspension trigger." })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "SaaS subscription suspended. Property is now restricted.");
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to suspend.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Suspension error.");
    } finally {
      setActioning(false);
    }
  };

  // Manual Reactivation
  const handleReactivateSub = async (sub: Subscription) => {
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/payments/subscriptions/${sub.id}/reactivate`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Subscription status restored. Property is LIVE.");
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to reactivate.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Reactivation error.");
    } finally {
      setActioning(false);
    }
  };

  // Manual Cancellation
  const handleCancelSub = async (sub: Subscription) => {
    if (!confirm("Confirm complete subscription plan cancellation? Property visibility will be set to SUSPENDED.")) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/payments/subscriptions/${sub.id}/cancel`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Subscription cancelled and property visibility terminated.");
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to cancel.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Cancellation error.");
    } finally {
      setActioning(false);
    }
  };

  // Manual Upgrade/Downgrade Change Plan
  const handleChangePlan = async () => {
    if (!selectedSub || !newPlanId || !newBillingCycle || !newAmount) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/payments/subscriptions/${selectedSub.id}/change-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedPlanId: newPlanId,
          billingCycle: newBillingCycle,
          amount: parseFloat(newAmount),
          reason: changePlanReason || "Administrative tier adjustment."
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Subscription plan tier upgraded/downgraded successfully.");
        setSelectedSub(null);
        setChangePlanReason("");
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Plan modification failed.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Plan shift error.");
    } finally {
      setActioning(false);
    }
  };

  // Explicit Property Visibility Toggle
  const handlePropertyToggle = async (propertyId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "LIVE" ? "SUSPENDED" : "LIVE";
    if (!confirm(`Are you sure you want to explicitly override this property status to ${nextStatus}?`)) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/admin/payments/properties/${propertyId}/toggle-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", `Property status manually set to ${nextStatus}.`);
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to toggle status.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Toggle status error.");
    } finally {
      setActioning(false);
    }
  };

  // Filtering subscription records helper
  const filteredSubs = subscriptions.filter(sub => {
    const matchSearch = 
      sub.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.selectedPlanId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <AdminLayout>
      {/* Banner notices */}
      {notice && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-semibold transition-all ${
          notice.type === "success" 
            ? "bg-green-50 border-green-200 text-green-700" 
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {notice.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {notice.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
              <DollarSign size={24} className="text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Finance Operations & Subscription Center</h1>
          </div>
          <p className="text-gray-500">Approve manual checkouts, adjust properties entitlements limits, and audit administrative platform extensions.</p>
        </div>

        <button 
          onClick={() => fetchDashboardData()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Sync Transactions
        </button>
      </div>

      {/* Analytics Summary Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Total Platform Collections", value: `₹${finance.totalRevenue.toLocaleString()}`, change: "Processed ledgers", icon: DollarSign, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
          { label: "Monthly Recurring Revenue (MRR)", value: `₹${Math.round(finance.mrr).toLocaleString()}`, change: "Active memberships", icon: Activity, color: "text-sky-600 bg-sky-50 border-sky-100" },
          { label: "Annualized Run Rate (ARR)", value: `₹${Math.round(finance.arr).toLocaleString()}`, change: "Amortized projection", icon: ListOrdered, color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Active Tenant Subscriptions", value: finance.activeSubscriptionsCount, change: "Properties online", icon: Home, color: "text-purple-600 bg-purple-50 border-purple-100" }
        ].map((metric, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{metric.label}</span>
              <span className="text-2xl font-black text-gray-900 block mb-1">{metric.value}</span>
              <span className="text-xs font-bold text-gray-400">{metric.change}</span>
            </div>
            <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${metric.color}`}>
              <metric.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 mb-10 border-b border-gray-100 pb-2 overflow-x-auto">
        {(
          [
            { id: "approvals", label: `Pending Approvals (${pendingQueue.length})`, icon: Clock },
            { id: "subscriptions", label: "Active Subscriptions", icon: Home },
            { id: "history", label: "Recent Collections", icon: CreditCard },
            { id: "analytics", label: "Financial Analytics", icon: Activity },
            { id: "audit", label: "System Audit Center", icon: Shield }
          ] as const
        ).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all outline-none shrink-0 ${
              activeTab === tab.id 
                ? "bg-emerald-500/10 text-emerald-700 shadow-sm" 
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Tab Contents */}
      {loading ? (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 flex justify-center items-center">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw size={36} className="text-emerald-500 animate-spin" />
            <p className="text-sm font-semibold text-gray-400">Piping transaction logs from SQL...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Approvals tab queue */}
          {activeTab === "approvals" && (
            <div className="space-y-6">
              {pendingQueue.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 text-center">
                  <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Payment Queue Completely Clear!</h3>
                  <p className="text-sm text-gray-400">All manual UPI checkouts have been verified by administrators.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {pendingQueue.map(pending => (
                    <div key={pending.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col lg:flex-row justify-between gap-6 hover:border-emerald-200 transition-all">
                      <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-extrabold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                            ₹{pending.amount.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-600 rounded-full uppercase tracking-wider">
                            {pending.planId} • {pending.billingCycle}
                          </span>
                          <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                            <Clock size={12} />
                            Received: {new Date(pending.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{pending.propertyName}</h3>
                          <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5">
                            <User size={14} className="text-gray-400" />
                            {pending.ownerName} ({pending.ownerEmail})
                          </p>
                        </div>

                        {pending.utrNumber && (
                          <div className="bg-gray-50 px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 inline-block border">
                            UTR Number: <span className="text-gray-900 font-mono tracking-widest">{pending.utrNumber}</span>
                          </div>
                        )}
                      </div>

                      {/* Right actions & image preview */}
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        {pending.paymentScreenshotUrl && (
                          <div 
                            onClick={() => setSelectedPending(pending)}
                            className="h-28 w-44 rounded-2xl bg-gray-50 border cursor-zoom-in overflow-hidden relative group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={`/api/admin/payments/proofs/${pending.paymentScreenshotUrl}`} 
                              alt="Proof preview" 
                              className="h-full w-full object-cover group-hover:scale-105 transition-all"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-all">
                              Zoom Proof
                            </div>
                          </div>
                        )}

                        <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto shrink-0">
                          <button 
                            onClick={() => handleApprovePayment(pending.id)}
                            disabled={actioning}
                            className="flex-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button 
                            onClick={() => setSelectedPending(pending)}
                            className="flex-1 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <XCircle size={14} />
                            Reject...
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Subscriptions management list tab */}
          {activeTab === "subscriptions" && (
            <div className="space-y-6">
              {/* Search & Actions bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-white px-4 py-2 border rounded-2xl w-full md:w-96">
                  <span className="text-gray-400">🔍</span>
                  <input 
                    type="text" 
                    placeholder="Search property or owner..." 
                    className="border-none outline-none bg-transparent w-full text-sm font-semibold"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto shrink-0">
                  {["ALL", "ACTIVE", "SUSPENDED", "EXPIRED", "INACTIVE"].map(status => (
                    <button
                      key={status}
                      onClick={() => setSubFilter(status)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        subFilter === status 
                          ? "bg-gray-900 text-white shadow-sm" 
                          : "bg-white text-gray-500 border hover:bg-gray-50"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscriptions table */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50/50">
                        <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Property Details</th>
                        <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Owner Account</th>
                        <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Active Plan / Rate</th>
                        <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Expiry Boundary</th>
                        <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Membership Status</th>
                        <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {filteredSubs.map(sub => (
                        <tr key={sub.id} className="hover:bg-gray-50/30 transition-all">
                          <td className="p-6">
                            <div className="font-bold text-gray-900">{sub.propertyName}</div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className={`h-2 w-2 rounded-full ${sub.propertyStatus === "LIVE" ? "bg-green-500" : "bg-red-400"}`}></span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Property: {sub.propertyStatus}</span>
                            </div>
                          </td>
                          <td className="p-6">
                            <div className="font-semibold text-gray-700">{sub.ownerName}</div>
                            <div className="text-xs text-gray-400 font-medium">{sub.ownerEmail}</div>
                          </td>
                          <td className="p-6">
                            <div className="font-extrabold text-gray-900">{sub.selectedPlanId}</div>
                            <div className="text-xs text-emerald-600 font-bold uppercase mt-0.5">₹{sub.amount.toLocaleString()} / {sub.billingCycle}</div>
                          </td>
                          <td className="p-6">
                            <div className="font-bold text-gray-600">
                              {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : "Never"}
                            </div>
                            {sub.expiresAt && new Date(sub.expiresAt) < new Date() && (
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full mt-1 inline-block">Overdue</span>
                            )}
                          </td>
                          <td className="p-6">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                              sub.status === "ACTIVE" 
                                ? "bg-green-50 border-green-200 text-green-700" 
                                : sub.status === "SUSPENDED"
                                ? "bg-amber-50 border-amber-200 text-amber-700 animate-pulse"
                                : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-6 text-right space-x-1 shrink-0">
                            <button 
                              onClick={() => setSelectedSub(sub)}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all"
                            >
                              Manage
                            </button>
                            {sub.status === "ACTIVE" ? (
                              <button 
                                onClick={() => handleSuspendSub(sub)}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-bold rounded-lg transition-all"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleReactivateSub(sub)}
                                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 text-xs font-bold rounded-lg transition-all"
                              >
                                Activate
                              </button>
                            )}
                            <button 
                              onClick={() => handleCancelSub(sub)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-all"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Recent collections log tab */}
          {activeTab === "history" && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Historic Collections Ledgers</h3>
                <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-500 rounded-full">{historyLogs.length} Records Compiled</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50/50">
                      <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                      <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Property</th>
                      <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Owner Account</th>
                      <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Amount / UTR</th>
                      <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Timestamp</th>
                      <th className="p-6 text-xs font-extrabold text-gray-400 uppercase tracking-wider">Confirmation Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/20 transition-all">
                        <td className="p-6 font-mono text-xs font-bold text-gray-400">{log.id.slice(0, 8)}...</td>
                        <td className="p-6 font-bold text-gray-800">{log.propertyName}</td>
                        <td className="p-6">
                          <div className="font-semibold text-gray-700">{log.ownerName}</div>
                          <div className="text-xs text-gray-400">{log.ownerEmail}</div>
                        </td>
                        <td className="p-6">
                          <div className="font-black text-emerald-600">₹{log.amount.toLocaleString()}</div>
                          {log.utrNumber && <div className="text-xs font-mono text-gray-400 mt-0.5">UTR: {log.utrNumber}</div>}
                        </td>
                        <td className="p-6 text-xs text-gray-500 font-bold">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-6">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                            log.paymentStatus === "APPROVED" || log.paymentStatus === "SUCCESS"
                              ? "bg-green-50 border-green-200 text-green-700"
                              : "bg-red-50 border-red-200 text-red-700"
                          }`}>
                            {log.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dynamic Financial Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Detailed metrics counters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Platform Cash Reserves</h4>
                  <div className="text-3xl font-black text-gray-900 mb-1">₹{(finance.totalRevenue + finance.pendingApprovalsAmount).toLocaleString()}</div>
                  <p className="text-xs text-gray-400">Total collections (including pending validations)</p>
                </div>
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pending Validation Queue</h4>
                  <div className="text-3xl font-black text-amber-500 mb-1">₹{finance.pendingApprovalsAmount.toLocaleString()}</div>
                  <p className="text-xs text-gray-400">Awaiting UTR verification and admin confirmation</p>
                </div>
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Rejection Ratio Rate</h4>
                  <div className="text-3xl font-black text-red-500 mb-1">{finance.rejectedPaymentCount}</div>
                  <p className="text-xs text-gray-400">Checks failing compliance / fake UTR entries</p>
                </div>
              </div>

              {/* Expiring subscriptions alert timeline list */}
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={20} />
                  Renewal Monitor: Subscriptions Expiring within 30 Days
                </h3>
                <p className="text-xs text-gray-500 mb-6">Proactively monitor upcoming plan terminations to prompt renewals.</p>

                {expiringQueue.length === 0 ? (
                  <p className="text-sm font-semibold text-gray-400 italic text-center p-6 border rounded-2xl">No subscriptions expiring in the next 30 days.</p>
                ) : (
                  <div className="space-y-4">
                    {expiringQueue.map(exp => (
                      <div key={exp.id} className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100/50 border rounded-2xl transition-all text-sm">
                        <div>
                          <span className="font-bold text-gray-800">{exp.propertyName}</span>
                          <span className="text-xs text-gray-400 font-bold ml-2">({exp.ownerName} • {exp.ownerEmail})</span>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-xs font-bold px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">{exp.selectedPlanId}</span>
                            <span className="text-xs font-bold text-red-500 ml-2">Expires: {new Date(exp.expiresAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System override auditing logs tab */}
          {activeTab === "audit" && (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="text-emerald-700" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Platform System Audits Ledger</h2>
                  <p className="text-xs text-gray-500">Append-only administrative operations, manual adjustments, and override tracking.</p>
                </div>
              </div>

              {auditLogs.length === 0 ? (
                <div className="text-center p-12 text-gray-400 italic text-sm">No administrative adjustments logged in this workspace cycle.</div>
              ) : (
                <div className="relative border-l border-gray-200 pl-6 ml-4 space-y-8">
                  {auditLogs.map(log => (
                    <div key={log.id} className="relative">
                      {/* Timeline marker */}
                      <span className="absolute -left-[2.1rem] top-1.5 flex h-4 w-4 rounded-full bg-emerald-100 border-2 border-emerald-600 justify-center items-center"></span>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full uppercase">
                            {log.action.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs font-bold text-gray-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-sm font-bold text-gray-800">
                          Property: <span className="text-gray-900">{log.propertyName}</span>
                        </div>

                        {log.metadata && (
                          <div className="bg-gray-50 p-4 rounded-2xl border text-xs font-semibold text-gray-600 space-y-1 max-w-2xl">
                            {log.metadata.reason && (
                              <p className="font-bold text-gray-800">Reason: {log.metadata.reason}</p>
                            )}
                            {log.metadata.daysAdded && (
                              <p>Extension Offset: +{log.metadata.daysAdded} Days</p>
                            )}
                            {log.metadata.oldPlanId && (
                              <p>Plan shift: {log.metadata.oldPlanId} $\rightarrow$ {log.metadata.newPlanId}</p>
                            )}
                            <p className="text-[10px] text-gray-400">Operator Session Attribution: {log.performedBy}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Review & Rejection Drawer/Modal */}
      {selectedPending && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            {/* Left side screenshot preview */}
            <div className="md:w-1/2 bg-gray-50 p-6 flex flex-col justify-center items-center border-r">
              <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">Manual Checkout UTR Screenshot Proof</h4>
              {selectedPending.paymentScreenshotUrl ? (
                <div className="max-h-[420px] w-full rounded-2xl border overflow-hidden bg-white shadow-sm flex justify-center items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`/api/admin/payments/proofs/${selectedPending.paymentScreenshotUrl}`} 
                    alt="Manual UPI verification" 
                    className="max-h-[380px] w-full object-contain"
                  />
                </div>
              ) : (
                <div className="text-sm text-gray-400 italic">No screenshot asset uploaded.</div>
              )}
            </div>

            {/* Right side review actions forms */}
            <div className="md:w-1/2 p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPending.propertyName}</h3>
                    <p className="text-sm font-bold text-gray-500">{selectedPending.ownerName} ({selectedPending.ownerEmail})</p>
                  </div>
                  <button 
                    onClick={() => setSelectedPending(null)}
                    className="text-gray-400 hover:text-gray-700 text-sm font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-all"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="font-bold text-gray-400">Checkout Price Amount</span>
                    <span className="font-extrabold text-emerald-600">₹{selectedPending.amount.toLocaleString()} ({selectedPending.currency})</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="font-bold text-gray-400">Target Plan Tier</span>
                    <span className="font-extrabold text-gray-800 uppercase">{selectedPending.planId} ({selectedPending.billingCycle})</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="font-bold text-gray-400">UTR / Ref Number</span>
                    <span className="font-mono font-bold text-gray-900 tracking-wider">{selectedPending.utrNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-gray-400">Transaction ID</span>
                    <span className="font-mono text-xs text-gray-400">{selectedPending.id}</span>
                  </div>
                </div>

                {/* Form Rejection input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">Admin Review Rejection Reason (Required only if rejecting)</label>
                  <textarea 
                    rows={3}
                    placeholder="Provide compliance check notes, e.g. UTR number is duplicate or screenshot does not match checkout total."
                    className="p-3 bg-gray-50 rounded-2xl border-none outline-none text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-red-500/10"
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t mt-6">
                <button 
                  onClick={() => handleApprovePayment(selectedPending.id)}
                  disabled={actioning}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  Verify & Approve Payment
                </button>
                <button 
                  onClick={() => handleRejectPayment(selectedPending.id)}
                  disabled={actioning || !rejectReason.trim()}
                  className="flex-1 py-3 bg-red-50 hover:bg-red-100 disabled:opacity-40 text-red-600 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle size={14} />
                  Reject Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Subscription Adjustments Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] border w-full max-w-2xl overflow-hidden shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Manual adjustments: {selectedSub.propertyName}</h3>
                <p className="text-xs font-bold text-gray-500">Active Membership Tier: {selectedSub.selectedPlanId} ({selectedSub.billingCycle})</p>
              </div>
              <button 
                onClick={() => setSelectedSub(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-all"
              >
                Cancel Override
              </button>
            </div>

            {/* Adjustment Modes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              {/* Form Option A: Manual Extension */}
              <div className="space-y-4 border-r pr-6 border-gray-100">
                <h4 className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full uppercase inline-block">Option A: Manual Extension</h4>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">Days to Extend</label>
                  <input 
                    type="number"
                    className="h-10 px-4 bg-gray-50 rounded-xl border text-sm font-semibold focus:bg-white"
                    value={daysToExtend}
                    onChange={e => setDaysToExtend(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">Extension Reason Note</label>
                  <textarea 
                    rows={2}
                    className="p-3 bg-gray-50 rounded-xl border text-xs font-semibold focus:bg-white"
                    placeholder="Compensation credit for platform downtime or offline checkouts."
                    value={extendReason}
                    onChange={e => setExtendReason(e.target.value)}
                  />
                </div>
                <button 
                  onClick={handleExtendSub}
                  disabled={actioning || !daysToExtend}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10"
                >
                  <Plus size={14} />
                  Apply Manual Extension
                </button>
              </div>

              {/* Form Option B: Plan/Tier Adjustments */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full uppercase inline-block">Option B: Plan Upgrade/Downgrade</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400">Plan Tier</label>
                    <select 
                      className="h-9 px-2 bg-gray-50 rounded-lg border text-xs font-semibold"
                      value={newPlanId}
                      onChange={e => setNewPlanId(e.target.value)}
                    >
                      <option value="BASIC">BASIC</option>
                      <option value="VIP">VIP</option>
                      <option value="PREMIUM">PREMIUM</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-gray-400">Billing Cycle</label>
                    <select 
                      className="h-9 px-2 bg-gray-50 rounded-lg border text-xs font-semibold"
                      value={newBillingCycle}
                      onChange={e => setNewBillingCycle(e.target.value)}
                    >
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="QUARTERLY">QUARTERLY</option>
                      <option value="YEARLY">YEARLY</option>
                      <option value="LIFETIME">LIFETIME</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400">Adjusted Bill Total (₹)</label>
                  <input 
                    type="number"
                    className="h-9 px-3 bg-gray-50 rounded-lg border text-xs font-semibold"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-400">Reason Note</label>
                  <textarea 
                    rows={2}
                    className="p-3 bg-gray-50 rounded-xl border text-[10px] font-semibold focus:bg-white"
                    placeholder="Adjustment for custom corporate partnership agreements."
                    value={changePlanReason}
                    onChange={e => setChangePlanReason(e.target.value)}
                  />
                </div>

                <button 
                  onClick={handleChangePlan}
                  disabled={actioning || !newPlanId || !newAmount}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  Adjust Plan Tier Mappings
                </button>
              </div>
            </div>

            {/* Direct property override toggler */}
            <div className="pt-6 border-t flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-gray-800">Administrative Override Controls</h4>
                <p className="text-xs text-gray-400">Directly override active property platform status settings.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePropertyToggle(selectedSub.propertyId, selectedSub.propertyStatus)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    selectedSub.propertyStatus === "LIVE" 
                      ? "bg-amber-50 text-amber-700 border hover:bg-amber-100" 
                      : "bg-green-50 text-green-700 border hover:bg-green-100"
                  }`}
                >
                  {selectedSub.propertyStatus === "LIVE" ? "Deactivate Property" : "Activate Property LIVE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

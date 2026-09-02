"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Coins,
  Scale,
  FileDown,
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  Info
} from "lucide-react";

interface Stats {
  totalCollections: number;
  totalSubtotal: number;
  totalGstAmount: number;
  totalCGST: number;
  totalSGST: number;
  totalIGST: number;
  matchedCount: number;
  mismatchCount: number;
  pendingCount: number;
  pendingReconCount: number;
}

interface Transaction {
  id: string;
  propertyId: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  utrNumber: string | null;
  gatewayTransactionId: string | null;
  gatewayOrderId: string | null;
  createdAt: string;
  property: {
    title: string;
    owner: {
      name: string | null;
      email: string;
    };
  };
  reconciliationLogs: Array<{
    id: string;
    reconciliationStatus: string;
    notes: string | null;
  }>;
}

interface Settlement {
  id: string;
  providerType: string;
  settlementReference: string;
  settlementDate: string;
  settlementAmount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface ReconLog {
  id: string;
  transactionId: string | null;
  invoiceId: string | null;
  settlementRecordId: string | null;
  reconciliationStatus: string;
  expectedAmount: number;
  receivedAmount: number;
  mismatchAmount: number;
  notes: string | null;
  reconciledAt: string | null;
  createdAt: string;
  transaction?: {
    utrNumber: string | null;
    gatewayTransactionId: string | null;
  };
  invoice?: {
    invoiceNumber: string;
  };
}

export default function FinanceDashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "reconcile" | "exports">("overview");
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Loaded DB data
  const [stats, setStats] = useState<Stats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [reconLogs, setReconLogs] = useState<ReconLog[]>([]);

  // Export form options
  const [exportStartDate, setExportStartDate] = useState(() =>
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [exportEndDate, setExportEndDate] = useState(() =>
    new Date().toISOString().split("T")[0]
  );

  // Settlement manual tracking modal/states
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementForm, setSettlementForm] = useState(() => ({
    providerType: "PHONEPE",
    settlementReference: "",
    settlementDate: new Date().toISOString().split("T")[0],
    settlementAmount: "",
    currency: "INR"
  }));

  // Reconciliation manual trigger modal/states
  const [showReconModal, setShowReconModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [reconForm, setReconForm] = useState({
    receivedAmount: "",
    settlementRecordId: ""
  });

  const showNotice = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/finance/dashboard");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setTransactions(data.recentTransactions);
        setSettlements(data.recentSettlements);
        setReconLogs(data.recentReconciliationLogs);
      } else {
        showNotice("error", data.error || "Failed to retrieve finance aggregates.");
      }
    } catch (err) {
      console.error("[FINANCE_DASHBOARD_ERROR]", err);
      showNotice("error", "Network anomaly when communicating with the Finance Dashboard.");
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        const res = await fetch("/api/admin/finance/dashboard");
        const data = await res.json();
        if (data.success && isMounted) {
          setStats(data.stats);
          setTransactions(data.recentTransactions);
          setSettlements(data.recentSettlements);
          setReconLogs(data.recentReconciliationLogs);
        }
      } catch (err) {
        console.error("[FINANCE_LOAD_ERROR]", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSettlementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActioning(true);
    try {
      const res = await fetch("/api/admin/finance/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "recordSettlement",
          ...settlementForm
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", `Gateway Settlement reference '${settlementForm.settlementReference}' recorded successfully.`);
        setShowSettlementModal(false);
        setSettlementForm({
          providerType: "PHONEPE",
          settlementReference: "",
          settlementDate: new Date().toISOString().split("T")[0],
          settlementAmount: "",
          currency: "INR"
        });
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to log payout settlement.");
      }
    } catch (err) {
      console.error("[SETTLEMENT_SUBMIT_ERROR]", err);
      showNotice("error", "Network issue writing settlement ledger.");
    } finally {
      setActioning(false);
    }
  };

  const handleReconSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTx) return;
    setActioning(true);
    try {
      const res = await fetch("/api/admin/finance/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reconcile",
          transactionId: selectedTx.id,
          receivedAmount: reconForm.receivedAmount || selectedTx.amount,
          settlementRecordId: reconForm.settlementRecordId || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", `Reconciliation recorded with status: ${data.result.status}`);
        setShowReconModal(false);
        setSelectedTx(null);
        setReconForm({ receivedAmount: "", settlementRecordId: "" });
        fetchDashboardData();
      } else {
        showNotice("error", data.error || "Failed to complete reconciliation.");
      }
    } catch (err) {
      console.error("[RECON_SUBMIT_ERROR]", err);
      showNotice("error", "Network interruption during matching service query.");
    } finally {
      setActioning(false);
    }
  };

  const downloadExport = (format: string) => {
    const url = `/api/admin/finance/export?format=${format}&startDate=${exportStartDate}&endDate=${exportEndDate}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Premium Glassmorphic Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-[#053344] tracking-tight flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-[#0f766e]" />
              Super Admin Finance Suite & Reconciliation Hub
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-3xl">
              Track double-entry bookkeeping ledgers, monitor dynamic GST aggregates, log payment provider payouts, reconcile discrepancies, and export Zoho & Tally auditor CSVs.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Reload Ledgers
            </button>
            <button
              onClick={() => setShowSettlementModal(true)}
              className="px-4 py-2 bg-[#053344] hover:bg-[#07475d] text-white text-sm font-medium rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Log Settlement Record
            </button>
          </div>
        </div>

        {/* Dynamic Alerts notification portal */}
        {notification && (
          <div
            className={`p-4 rounded-xl mb-8 flex items-start gap-3 border shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
              notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 mt-0.5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 mt-0.5 text-rose-600 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold">
                {notification.type === "success" ? "System Log Success" : "Validation Warning"}
              </p>
              <p className="text-xs mt-1 text-slate-600">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Global stats block */}
        {loading && !stats ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-24 flex flex-col items-center justify-center">
            <RefreshCw className="h-10 w-10 text-[#053344] animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Compiling Financial Ledger</h3>
            <p className="text-slate-500 text-sm mt-1">Aggregating invoices, taxes, and gateway payouts from PostgreSQL...</p>
          </div>
        ) : (
          stats && (
            <>
              {/* Premium Dashboard Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                
                {/* Card 1: Gross Collections */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-slate-200 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Gross Revenue Paid</span>
                    <div className="p-2 bg-teal-50 rounded-lg">
                      <Coins className="h-5 w-5 text-teal-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-900">₹{stats.totalCollections.toLocaleString("en-IN")}</h3>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Taxable Net: ₹{stats.totalSubtotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Card 2: GST Taxes */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-slate-200 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Tax Liability (GST)</span>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Scale className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-extrabold text-slate-900">₹{stats.totalGstAmount.toLocaleString("en-IN")}</h3>
                  <div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-slate-500 font-medium">
                    <span>CGST: ₹{stats.totalCGST}</span>
                    <span>•</span>
                    <span>SGST: ₹{stats.totalSGST}</span>
                    <span>•</span>
                    <span>IGST: ₹{stats.totalIGST}</span>
                  </div>
                </div>

                {/* Card 3: Discrepancy Alerts */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-slate-200 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Discrepancies flagged</span>
                    <div className="p-2 bg-rose-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-rose-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-extrabold text-rose-700">{stats.mismatchCount}</h3>
                  <p className="text-xs text-slate-500 mt-2">Active MISMATCH states requiring manual resolution</p>
                </div>

                {/* Card 4: Unreconciled Transactions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-slate-200 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 tracking-wider uppercase">Unreconciled payments</span>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <Activity className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-extrabold text-amber-700">{stats.pendingReconCount}</h3>
                  <p className="text-xs text-slate-500 mt-2">Approved transactions lacking settlement logs</p>
                </div>

              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 mb-8 space-x-8">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`pb-4 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition ${
                    activeTab === "overview"
                      ? "border-[#053344] text-[#053344]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Financial Overview
                </button>
                <button
                  onClick={() => setActiveTab("reconcile")}
                  className={`pb-4 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition ${
                    activeTab === "reconcile"
                      ? "border-[#053344] text-[#053344]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Manual Reconciliation Engine
                </button>
                <button
                  onClick={() => setActiveTab("exports")}
                  className={`pb-4 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition ${
                    activeTab === "exports"
                      ? "border-[#053344] text-[#053344]"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Auditor Export Hub
                </button>
              </div>

              {/* Tab 1: Overview Ledger Tables */}
              {activeTab === "overview" && (
                <div className="space-y-10">
                  
                  {/* Left-Right grid split */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Recent Settlements Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Recent Gateway Settlements</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Direct payout batches recorded from gateway providers</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-500">Live feed</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="pb-3">UTR/Reference</th>
                              <th className="pb-3">Provider</th>
                              <th className="pb-3">Payout Date</th>
                              <th className="pb-3 text-right">Amount</th>
                              <th className="pb-3 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {settlements.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400 italic">No settlements logged yet.</td>
                              </tr>
                            ) : (
                              settlements.map((set) => (
                                <tr key={set.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                  <td className="py-3 font-semibold text-slate-800 font-mono">{set.settlementReference}</td>
                                  <td className="py-3 text-slate-500">{set.providerType}</td>
                                  <td className="py-3 text-slate-500">{new Date(set.settlementDate).toLocaleDateString()}</td>
                                  <td className="py-3 text-right font-bold text-slate-900">₹{set.settlementAmount.toFixed(2)}</td>
                                  <td className="py-3 text-right">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      set.status === "MATCHED" ? "bg-emerald-50 text-emerald-700" :
                                      set.status === "MISMATCH" ? "bg-rose-50 text-rose-700" :
                                      "bg-amber-50 text-amber-700"
                                    }`}>
                                      {set.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Recent Reconciliation Logs */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Audit-Safe Reconciliation Logs</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Permanent logs tracking transactional compliance discrepancies</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-full text-slate-500">Immutable Ledger</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                              <th className="pb-3">Invoice</th>
                              <th className="pb-3">Expected</th>
                              <th className="pb-3 text-right">Settled</th>
                              <th className="pb-3 text-right">Difference</th>
                              <th className="pb-3 text-right">Audit Code</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reconLogs.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400 italic">No reconciliation checks saved.</td>
                              </tr>
                            ) : (
                              reconLogs.map((log) => (
                                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                  <td className="py-3 font-semibold text-slate-800 font-mono">
                                    {log.invoice?.invoiceNumber || "MANUAL ENTRY"}
                                  </td>
                                  <td className="py-3 text-slate-500">₹{log.expectedAmount.toFixed(2)}</td>
                                  <td className="py-3 text-right font-medium text-slate-700">₹{log.receivedAmount.toFixed(2)}</td>
                                  <td className="py-3 text-right text-slate-900 font-bold">
                                    {log.mismatchAmount > 0.01 ? (
                                      <span className="text-rose-600">₹{log.mismatchAmount.toFixed(2)}</span>
                                    ) : (
                                      <span className="text-emerald-600">₹0.00</span>
                                    )}
                                  </td>
                                  <td className="py-3 text-right">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      log.reconciliationStatus === "MATCHED" ? "bg-emerald-50 text-emerald-700" :
                                      "bg-rose-50 text-rose-700"
                                    }`}>
                                      {log.reconciliationStatus}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* Tab 2: Manual Reconciliation Matching Tool */}
              {activeTab === "reconcile" && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Reconcile Pending Payment Transactions</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Submit exact settlement figures to match payment events with ledger accounts</p>
                    </div>
                    <div className="text-xs font-semibold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200/50 flex items-center gap-1.5">
                      <Info className="h-4 w-4 text-amber-600" />
                      Reconcile checks logic will compute underpays and double UTR replay risks dynamically.
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3">Transaction details</th>
                          <th className="pb-3">Property (Partner)</th>
                          <th className="pb-3">Expected Amount</th>
                          <th className="pb-3">UTR Reference</th>
                          <th className="pb-3">Logged Date</th>
                          <th className="pb-3 text-right">Reconciliation Status</th>
                          <th className="pb-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400 italic">No payment transactions found in database.</td>
                          </tr>
                        ) : (
                          transactions.map((tx) => {
                            const latestLog = tx.reconciliationLogs?.[0];
                            return (
                              <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                                <td className="py-4">
                                  <div className="font-semibold text-slate-800 font-mono text-[11px]">{tx.id}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{tx.gatewayTransactionId || "No Gateway Trans ID"}</div>
                                </td>
                                <td className="py-4">
                                  <div className="font-medium text-slate-700">{tx.property.title}</div>
                                  <div className="text-[10px] text-slate-400">{tx.property.owner.name || tx.property.owner.email}</div>
                                </td>
                                <td className="py-4 font-bold text-slate-900">₹{tx.amount.toFixed(2)}</td>
                                <td className="py-4 font-mono text-slate-500 font-medium">{tx.utrNumber || "N/A"}</td>
                                <td className="py-4 text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                                <td className="py-4 text-right">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                    latestLog?.reconciliationStatus === "MATCHED" ? "bg-emerald-50 text-emerald-700" :
                                    latestLog?.reconciliationStatus === "MISMATCH" ? "bg-rose-50 text-rose-700" :
                                    "bg-slate-100 text-slate-500"
                                  }`}>
                                    {latestLog?.reconciliationStatus || "UNRECONCILED"}
                                  </span>
                                </td>
                                <td className="py-4 text-right">
                                  {latestLog?.reconciliationStatus === "MATCHED" ? (
                                    <button disabled className="px-2.5 py-1 text-[10px] border border-slate-200 rounded text-slate-400 cursor-not-allowed">
                                      Reconciled
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedTx(tx);
                                        setReconForm({ receivedAmount: String(tx.amount), settlementRecordId: "" });
                                        setShowReconModal(true);
                                      }}
                                      className="px-2.5 py-1 text-[10px] font-semibold bg-[#053344] hover:bg-[#07475d] text-white rounded transition cursor-pointer"
                                    >
                                      Run Match
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 3: Accountant / Auditor Exports Tab */}
              {activeTab === "exports" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Export Parameters Panel */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit lg:col-span-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Export Filters</h3>
                    <p className="text-xs text-slate-400 mb-6">Define transactional dates range bounding the spreadsheet records</p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                        <input
                          type="date"
                          value={exportStartDate}
                          onChange={(e) => setExportStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#053344]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                        <input
                          type="date"
                          value={exportEndDate}
                          onChange={(e) => setExportEndDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#053344]"
                        />
                      </div>

                      {/* Quick selects */}
                      <div className="pt-2 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            const end = new Date();
                            const start = new Date(end.getFullYear(), end.getMonth(), 1);
                            setExportStartDate(start.toISOString().split("T")[0]);
                            setExportEndDate(end.toISOString().split("T")[0]);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium text-slate-600 transition cursor-pointer"
                        >
                          This Month
                        </button>
                        <button
                          onClick={() => {
                            const end = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
                            const start = new Date(end.getFullYear(), end.getMonth(), 1);
                            setExportStartDate(start.toISOString().split("T")[0]);
                            setExportEndDate(end.toISOString().split("T")[0]);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium text-slate-600 transition cursor-pointer"
                        >
                          Last Month
                        </button>
                        <button
                          onClick={() => {
                            const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                            setExportStartDate(start.toISOString().split("T")[0]);
                            setExportEndDate(new Date().toISOString().split("T")[0]);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-medium text-slate-600 transition cursor-pointer"
                        >
                          Last 30 Days
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Auditor Portals Actions List */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Compliance Accounting CSV Aggregators</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Click to download standard double-entry spreadsheets compatible with financial platforms</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Zoho Books Portlet */}
                      <div className="border border-slate-100 rounded-xl p-4 hover:border-teal-200 transition bg-slate-50/20 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-[#0f766e] uppercase tracking-wide">Zoho books compiler</span>
                            <FileSpreadsheet className="h-5 w-5 text-teal-600" />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Export legal taxable billing journals mapping directly into Zoho customer invoice schema, complete with lodgings SAC (998311).
                          </p>
                        </div>
                        <button
                          onClick={() => downloadExport("zoho")}
                          className="mt-4 px-3 py-1.5 bg-teal-50 hover:bg-teal-100/80 text-teal-800 text-xs font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
                        >
                          <span>Export Zoho Books CSV</span>
                          <FileDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Tally ERP Voucher Portlet */}
                      <div className="border border-slate-100 rounded-xl p-4 hover:border-indigo-200 transition bg-slate-50/20 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Tally ERP mapping</span>
                            <Layers className="h-5 w-5 text-indigo-600" />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Compiles sequential voucher codes, ledger asset classes, and separate credit/debit CGST/SGST ledger column structures.
                          </p>
                        </div>
                        <button
                          onClick={() => downloadExport("tally")}
                          className="mt-4 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 text-xs font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
                        >
                          <span>Export Tally ERP CSV</span>
                          <FileDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* General Billing Invoices Portlet */}
                      <div className="border border-slate-100 rounded-xl p-4 hover:border-slate-300 transition bg-slate-50/20 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">General Invoices Registry</span>
                            <FileDown className="h-5 w-5 text-slate-600" />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Flat table exporting all platform billing invoices containing full metadata, state breakdown, rates, and parameters.
                          </p>
                        </div>
                        <button
                          onClick={() => downloadExport("general")}
                          className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
                        >
                          <span>Export Invoices Registry</span>
                          <FileDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Payments Bookkeeping Portlet */}
                      <div className="border border-slate-100 rounded-xl p-4 hover:border-slate-300 transition bg-slate-50/20 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Payments Ledger</span>
                            <Coins className="h-5 w-5 text-slate-600" />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Comprehensive dump of all payments, showing partner property, UTRs, and direct raw gateway transaction reference fields.
                          </p>
                        </div>
                        <button
                          onClick={() => downloadExport("payments")}
                          className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center justify-between transition cursor-pointer"
                        >
                          <span>Export Payments Ledger</span>
                          <FileDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              )}

            </>
          )
        )}

        {/* Modal 1: Settlement record logger */}
        {showSettlementModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              <div className="px-6 py-4 bg-[#053344] text-white flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Log Payout Settlement
                </h3>
                <button
                  onClick={() => setShowSettlementModal(false)}
                  className="text-slate-300 hover:text-white text-xl cursor-pointer focus:outline-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSettlementSubmit} className="p-6 space-y-4">
                
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment Gateway Provider</label>
                  <select
                    value={settlementForm.providerType}
                    onChange={(e) => setSettlementForm(prev => ({ ...prev, providerType: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#053344]"
                  >
                    <option value="PHONEPE">PhonePe PG</option>
                    <option value="YES_BANK">YES BANK PG</option>
                    <option value="MANUAL">Manual UPI Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payout Reference / UTR Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UTR123456789 or PAYOUT_REF_99"
                    value={settlementForm.settlementReference}
                    onChange={(e) => setSettlementForm(prev => ({ ...prev, settlementReference: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#053344] font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settlement Date</label>
                    <input
                      type="date"
                      required
                      value={settlementForm.settlementDate}
                      onChange={(e) => setSettlementForm(prev => ({ ...prev, settlementDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#053344]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settled Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 5000.00"
                      value={settlementForm.settlementAmount}
                      onChange={(e) => setSettlementForm(prev => ({ ...prev, settlementAmount: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#053344]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSettlementModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actioning}
                    className="px-4 py-2 bg-[#053344] hover:bg-[#07475d] text-white text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {actioning ? "Logging..." : "Commit Settlement"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Reconciler execution panel */}
        {showReconModal && selectedTx && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
              <div className="px-6 py-4 bg-[#053344] text-white flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Execute Reconciliation matching
                </h3>
                <button
                  onClick={() => {
                    setShowReconModal(false);
                    setSelectedTx(null);
                  }}
                  className="text-slate-300 hover:text-white text-xl cursor-pointer focus:outline-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleReconSubmit} className="p-6 space-y-4">
                
                <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Transaction</div>
                  <div className="text-xs font-semibold text-slate-700 font-mono">{selectedTx.id}</div>
                  <div className="grid grid-cols-2 gap-4 pt-1.5 text-xs">
                    <div>
                      <span className="text-slate-400 block">Expected Value:</span>
                      <span className="font-bold text-slate-900">₹{selectedTx.amount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Logged UTR:</span>
                      <span className="font-mono font-medium text-slate-700">{selectedTx.utrNumber || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Actual Settled Payout Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Enter raw settled value"
                    value={reconForm.receivedAmount}
                    onChange={(e) => setReconForm(prev => ({ ...prev, receivedAmount: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#053344]"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Leaving this value matching Expected will mark reconciliation state as exact MATCHED.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Associate Gateway Settlement (Optional)
                  </label>
                  <select
                    value={reconForm.settlementRecordId}
                    onChange={(e) => setReconForm(prev => ({ ...prev, settlementRecordId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#053344]"
                  >
                    <option value="">Do not link to a specific SettlementRecord</option>
                    {settlements.map(set => (
                      <option key={set.id} value={set.id}>
                        {set.settlementReference} (₹{set.settlementAmount.toFixed(2)} - {set.providerType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReconModal(false);
                      setSelectedTx(null);
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actioning}
                    className="px-4 py-2 bg-[#053344] hover:bg-[#07475d] text-white text-sm font-semibold rounded-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {actioning ? "Processing..." : "Verify & Log Match"}
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Receipt,
  PiggyBank,
  PhoneCall,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileText,
  Percent,
  Scale,
  ShieldAlert
} from "lucide-react";

// Indian states mappings for dropdown selections
const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" },
  { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh (Old)" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh (New)" },
  { code: "38", name: "Ladakh" }
];

export default function FinancialSettingsPage() {
  const [activeTab, setActiveTab] = useState<"platform" | "rules" | "compliance">("platform");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states matching FinancialSettings model + Phase 10A.5 expansions
  const [formData, setFormData] = useState({
    companyName: "",
    legalBusinessName: "",
    GSTIN: "",
    PAN: "",
    address: "",
    supportEmail: "",
    supportPhone: "",
    invoicePrefix: "",
    invoiceStartingNumber: 1,
    defaultGSTPercent: 18.0,
    SACCode: "",
    bankDetails: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      ifsc: "",
      branch: ""
    },
    // Phase 10A.5
    defaultStateCode: "24", // Defaults to Gujarat
    placeOfSupplyMode: "STATE_MATCH",
    enableGSTSplitting: true,
    enableIGST: true,
    invoiceTerms: "",
    refundTerms: "",
    SLAUptimeTarget: "99.9",
    SLAMaintenanceWindow: "Sunday 02:00 AM - 04:00 AM IST",
    liabilityCapMonths: "6",
    dataRetentionDays: "365"
  });

  const showNotice = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 6000);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/financial-settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setFormData({
          companyName: data.settings.companyName || "",
          legalBusinessName: data.settings.legalBusinessName || "",
          GSTIN: data.settings.GSTIN || "",
          PAN: data.settings.PAN || "",
          address: data.settings.address || "",
          supportEmail: data.settings.supportEmail || "",
          supportPhone: data.settings.supportPhone || "",
          invoicePrefix: data.settings.invoicePrefix || "",
          invoiceStartingNumber: data.settings.invoiceStartingNumber || 1,
          defaultGSTPercent: data.settings.defaultGSTPercent || 18.0,
          SACCode: data.settings.SACCode || "",
          bankDetails: {
            bankName: data.settings.bankDetails?.bankName || "",
            accountName: data.settings.bankDetails?.accountName || "",
            accountNumber: data.settings.bankDetails?.accountNumber || "",
            ifsc: data.settings.bankDetails?.ifsc || "",
            branch: data.settings.bankDetails?.branch || ""
          },
          // Phase 10A.5
          defaultStateCode: data.settings.defaultStateCode || "24",
          placeOfSupplyMode: data.settings.placeOfSupplyMode || "STATE_MATCH",
          enableGSTSplitting: data.settings.enableGSTSplitting !== undefined ? data.settings.enableGSTSplitting : true,
          enableIGST: data.settings.enableIGST !== undefined ? data.settings.enableIGST : true,
          invoiceTerms: data.settings.invoiceTerms || "",
          refundTerms: data.settings.refundTerms || "",
          SLAUptimeTarget: data.settings.SLAUptimeTarget !== null && data.settings.SLAUptimeTarget !== undefined ? String(data.settings.SLAUptimeTarget) : "",
          SLAMaintenanceWindow: data.settings.SLAMaintenanceWindow || "",
          liabilityCapMonths: data.settings.liabilityCapMonths !== null && data.settings.liabilityCapMonths !== undefined ? String(data.settings.liabilityCapMonths) : "",
          dataRetentionDays: data.settings.dataRetentionDays !== null && data.settings.dataRetentionDays !== undefined ? String(data.settings.dataRetentionDays) : ""
        });
      } else {
        showNotice("error", data.error || "Failed to load financial settings.");
      }
    } catch (err) {
      console.error("[FINANCE_SETTINGS_FETCH_ERROR]", err);
      showNotice("error", "Network error retrieving financial settings.");
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/financial-settings");
        const data = await res.json();
        if (data.success && data.settings && isMounted) {
          setFormData({
            companyName: data.settings.companyName || "",
            legalBusinessName: data.settings.legalBusinessName || "",
            GSTIN: data.settings.GSTIN || "",
            PAN: data.settings.PAN || "",
            address: data.settings.address || "",
            supportEmail: data.settings.supportEmail || "",
            supportPhone: data.settings.supportPhone || "",
            invoicePrefix: data.settings.invoicePrefix || "",
            invoiceStartingNumber: data.settings.invoiceStartingNumber || 1,
            defaultGSTPercent: data.settings.defaultGSTPercent || 18.0,
            SACCode: data.settings.SACCode || "",
            bankDetails: {
              bankName: data.settings.bankDetails?.bankName || "",
              accountName: data.settings.bankDetails?.accountName || "",
              accountNumber: data.settings.bankDetails?.accountNumber || "",
              ifsc: data.settings.bankDetails?.ifsc || "",
              branch: data.settings.bankDetails?.branch || ""
            },
            // Phase 10A.5
            defaultStateCode: data.settings.defaultStateCode || "24",
            placeOfSupplyMode: data.settings.placeOfSupplyMode || "STATE_MATCH",
            enableGSTSplitting: data.settings.enableGSTSplitting !== undefined ? data.settings.enableGSTSplitting : true,
            enableIGST: data.settings.enableIGST !== undefined ? data.settings.enableIGST : true,
            invoiceTerms: data.settings.invoiceTerms || "",
            refundTerms: data.settings.refundTerms || "",
            SLAUptimeTarget: data.settings.SLAUptimeTarget !== null && data.settings.SLAUptimeTarget !== undefined ? String(data.settings.SLAUptimeTarget) : "",
            SLAMaintenanceWindow: data.settings.SLAMaintenanceWindow || "",
            liabilityCapMonths: data.settings.liabilityCapMonths !== null && data.settings.liabilityCapMonths !== undefined ? String(data.settings.liabilityCapMonths) : "",
            dataRetentionDays: data.settings.dataRetentionDays !== null && data.settings.dataRetentionDays !== undefined ? String(data.settings.dataRetentionDays) : ""
          });
        }
      } catch (err) {
        console.error("[FINANCE_SETTINGS_LOAD_ERROR]", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value)
    }));
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/financial-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Financial settings saved and applied to future invoices successfully.");
        fetchSettings();
      } else {
        showNotice("error", data.error || "Validation error saving settings.");
      }
    } catch (err) {
      console.error("[FINANCE_SETTINGS_SAVE_ERROR]", err);
      showNotice("error", "Failed to update financial settings due to network issue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-10 lg:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <Receipt className="h-8 w-8 text-[#053344]" />
              GST Invoicing & Financial Panel
            </h1>
            <p className="text-slate-500 mt-2 text-sm max-w-2xl">
              Configure corporate profiles, tax parameters, bank details, and compliance-grade SLA criteria for dynamic partner subscription invoicing.
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Reload Settings
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {notification && (
          <div
            className={`p-4 rounded-xl mb-8 flex items-start gap-3 border animate-in fade-in slide-in-from-top-4 duration-300 ${
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
              <p className="text-sm font-medium">
                {notification.type === "success" ? "Operation Successful" : "Validation / Error Check Failure"}
              </p>
              <p className="text-xs mt-1 text-slate-600">{notification.message}</p>
            </div>
          </div>
        )}

        {/* Dynamic State Preloaders */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-24 flex flex-col items-center justify-center">
            <RefreshCw className="h-10 w-10 text-[#053344] animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-900">Loading Configuration Ledger</h3>
            <p className="text-slate-500 text-sm mt-1">Resolving secure administrative rules from PostgreSQL database...</p>
          </div>
        ) : (
          <form onSubmit={saveSettings} className="space-y-8">
            
            {/* Interactive Tab bar */}
            <div className="flex border-b border-slate-200 gap-1 bg-slate-100 p-1 rounded-xl max-w-lg">
              <button
                type="button"
                onClick={() => setActiveTab("platform")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "platform"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                <Building2 className="h-4 w-4" />
                Corporate Setup
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("rules")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "rules"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                <PiggyBank className="h-4 w-4" />
                Tax & Sequence
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("compliance")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "compliance"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                <FileText className="h-4 w-4" />
                Compliance & SLA
              </button>
            </div>

            {/* TAB 1: Platform Invoicing Setup */}
            {activeTab === "platform" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Form fields card */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Building2 className="h-5 w-5 text-[#053344]" />
                      Corporate Registration Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Display Platform Name</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="e.g. Home4Stay"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Legal Registered Entity Name</label>
                        <input
                          type="text"
                          name="legalBusinessName"
                          value={formData.legalBusinessName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="e.g. Home4Stay Technologies Pvt. Ltd."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Corporate GSTIN</label>
                        <input
                          type="text"
                          name="GSTIN"
                          value={formData.GSTIN}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm font-mono uppercase"
                          placeholder="e.g. 24ABCDE1234F1Z5"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Corporate PAN</label>
                        <input
                          type="text"
                          name="PAN"
                          value={formData.PAN}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm font-mono uppercase"
                          placeholder="e.g. ABCDE1234F"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Billing / Registered Office Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="Full official office postal address..."
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <PhoneCall className="h-5 w-5 text-[#053344]" />
                      Billing Support Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Finance Support Email</label>
                        <input
                          type="email"
                          name="supportEmail"
                          value={formData.supportEmail}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="finance@home4stay.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Finance Support Phone</label>
                        <input
                          type="text"
                          name="supportPhone"
                          value={formData.supportPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="+91 79 4912 3456"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side info cards */}
                <div className="space-y-6">
                  <div className="bg-[#053344]/5 border border-[#053344]/15 rounded-2xl p-6">
                    <h4 className="text-[#053344] font-bold text-md mb-2">Corporate Profile Note</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Please verify entity details carefully. These parameters are legal mandates shown explicitly on standard PDF invoices and tax breakdown ledgers required for partner business compliance checks.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h4 className="text-amber-800 font-bold text-md mb-2">Tax Validity Warning</h4>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      Changes here instantly influence all new tax statements compiled during payments checkouts. Past finalized invoices remain structurally locked to protect audit trails.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: Tax & Sequence Rules */}
            {activeTab === "rules" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Tax & prefix params */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Percent className="h-5 w-5 text-[#053344]" />
                      Taxation & sequence configuration
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Default GST Rate (%)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            name="defaultGSTPercent"
                            value={formData.defaultGSTPercent}
                            onChange={handleNumericChange}
                            className="w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                            placeholder="18"
                            required
                          />
                          <span className="absolute right-3 top-3 text-slate-400 font-bold text-sm">%</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Default SAC Code</label>
                        <input
                          type="text"
                          name="SACCode"
                          value={formData.SACCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm font-mono"
                          placeholder="e.g. 998311"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Registered State Code (Supplier State)</label>
                        <select
                          name="defaultStateCode"
                          value={formData.defaultStateCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s.code} value={s.code}>
                              {s.code} - {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Place of Supply Check Mode</label>
                        <select
                          name="placeOfSupplyMode"
                          value={formData.placeOfSupplyMode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                        >
                          <option value="STATE_MATCH">Strict State Match (Split CGST/SGST vs IGST)</option>
                          <option value="FORCE_IGST">Force Interstate IGST always</option>
                          <option value="FORCE_CGST_SGST">Force Intrastate CGST/SGST always</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 py-2">
                        <input
                          type="checkbox"
                          id="enableGSTSplitting"
                          name="enableGSTSplitting"
                          checked={formData.enableGSTSplitting}
                          onChange={handleCheckboxChange}
                          className="h-4.5 w-4.5 rounded border-slate-300 text-[#053344] focus:ring-[#053344] cursor-pointer"
                        />
                        <label htmlFor="enableGSTSplitting" className="text-xs font-semibold text-slate-700 cursor-pointer">
                          Enable CGST & SGST Splitting for Intrastate
                        </label>
                      </div>

                      <div className="flex items-center gap-2 py-2">
                        <input
                          type="checkbox"
                          id="enableIGST"
                          name="enableIGST"
                          checked={formData.enableIGST}
                          onChange={handleCheckboxChange}
                          className="h-4.5 w-4.5 rounded border-slate-300 text-[#053344] focus:ring-[#053344] cursor-pointer"
                        />
                        <label htmlFor="enableIGST" className="text-xs font-semibold text-slate-700 cursor-pointer">
                          Enable Interstate IGST Charging
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Invoice numbering prefix</label>
                        <input
                          type="text"
                          name="invoicePrefix"
                          value={formData.invoicePrefix}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm font-mono uppercase"
                          placeholder="e.g. H4S"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Starting sequence number</label>
                        <input
                          type="number"
                          name="invoiceStartingNumber"
                          value={formData.invoiceStartingNumber}
                          onChange={handleNumericChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm font-mono"
                          placeholder="1"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Account settings */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <PiggyBank className="h-5 w-5 text-[#053344]" />
                      Corporate Settlement Account
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Legal Beneficiary Name</label>
                        <input
                          type="text"
                          name="accountName"
                          value={formData.bankDetails.accountName}
                          onChange={handleBankChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="Account Holder Name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bank Corporate Name</label>
                        <input
                          type="text"
                          name="bankName"
                          value={formData.bankDetails.bankName}
                          onChange={handleBankChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="e.g. YES BANK"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Beneficiary Account Number</label>
                        <input
                          type="text"
                          name="accountNumber"
                          value={formData.bankDetails.accountNumber}
                          onChange={handleBankChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm font-mono"
                          placeholder="Account Number"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bank IFSC Code</label>
                        <input
                          type="text"
                          name="ifsc"
                          value={formData.bankDetails.ifsc}
                          onChange={handleBankChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm font-mono uppercase"
                          placeholder="e.g. YESB0000123"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settlement Branch Name</label>
                        <input
                          type="text"
                          name="branch"
                          value={formData.bankDetails.branch}
                          onChange={handleBankChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="Branch Area / Location"
                          required
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right side info cards */}
                <div className="space-y-6">
                  <div className="bg-[#053344]/5 border border-[#053344]/15 rounded-2xl p-6">
                    <h4 className="text-[#053344] font-bold text-md mb-2">Sequence Formatting</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Generated invoice strings resolve as:<br />
                      <strong className="font-mono text-[#053344]">{formData.invoicePrefix || "H4S"}-{new Date().getFullYear()}-{String(formData.invoiceStartingNumber || 1).padStart(6, "0")}</strong>
                    </p>
                  </div>
                  <div className="bg-[#053344]/5 border border-[#053344]/15 rounded-2xl p-6">
                    <h4 className="text-[#053344] font-bold text-md mb-2">GSTIN Jurisdiction Check</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Currently registered to State Code <strong>{formData.defaultStateCode}</strong> ({INDIAN_STATES.find(s => s.code === formData.defaultStateCode)?.name || "Gujarat"}). 
                      Interstate billing split will automatically apply to checkout entities from other states.
                    </p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h4 className="text-amber-800 font-bold text-md mb-2">Lock Isolation Warning</h4>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      Automatic billing uses exclusive locks on the invoices ledger block. Modifying starting sequences while invoices are actively issuing may lead to serial validation errors.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: Compliance & SLA */}
            {activeTab === "compliance" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* SLA Settings */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Scale className="h-5 w-5 text-[#053344]" />
                      Service Level Agreement (SLA) Configurations
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">SLA Uptime Target (%)</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            name="SLAUptimeTarget"
                            value={formData.SLAUptimeTarget}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                            placeholder="99.9"
                          />
                          <span className="absolute right-3 top-3 text-slate-400 font-bold text-sm">%</span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Standard Maintenance Window</label>
                        <input
                          type="text"
                          name="SLAMaintenanceWindow"
                          value={formData.SLAMaintenanceWindow}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="e.g. Sunday 02:00 AM - 04:00 AM IST"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Liability & Data retention limits */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <ShieldAlert className="h-5 w-5 text-[#053344]" />
                      Liability Limits & Data Retention Tiers
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Limitation of Liability Cap (Months)</label>
                        <input
                          type="number"
                          name="liabilityCapMonths"
                          value={formData.liabilityCapMonths}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="e.g. 6"
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Audit/Data Retention Duration (Days)</label>
                        <input
                          type="number"
                          name="dataRetentionDays"
                          value={formData.dataRetentionDays}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="e.g. 365"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms Texts */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <FileText className="h-5 w-5 text-[#053344]" />
                      Dynamic Legal Declarations (PDF Invoices)
                    </h3>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Standard Invoice Terms & Conditions</label>
                        <textarea
                          name="invoiceTerms"
                          value={formData.invoiceTerms}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="Invoice regulatory warnings, terms of use..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Subscription Cancellation & Refund Policy Rules</label>
                        <textarea
                          name="refundTerms"
                          value={formData.refundTerms}
                          onChange={handleInputChange}
                          rows={4}
                          className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#053344] text-sm"
                          placeholder="Standard refund timelines, cancellation windows..."
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Right side info cards */}
                <div className="space-y-6">
                  <div className="bg-[#053344]/5 border border-[#053344]/15 rounded-2xl p-6">
                    <h4 className="text-[#053344] font-bold text-md mb-2">SLA & Liability Note</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Configuring SLA uptime metrics and liability bounds provides structured legal protection for Home4Stay operations, enforcing automatic exclusions for scheduled maintenance windows.
                    </p>
                  </div>
                  <div className="bg-[#053344]/5 border border-[#053344]/15 rounded-2xl p-6">
                    <h4 className="text-[#053344] font-bold text-md mb-2">Data Retention Audit</h4>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Financial logs are locked in the database for <strong>{formData.dataRetentionDays || "365"} days</strong> to fulfill compliance auditing standards.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Actions Form submission footer */}
            <div className="flex justify-end pt-4 border-t border-slate-200 gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#053344] hover:bg-[#031d27] text-white font-semibold rounded-xl text-sm transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Configurations
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}

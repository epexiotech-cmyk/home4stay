"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  CreditCard, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Upload, 
  Shield, 
  QrCode, 
  Key, 
  ListOrdered, 
  RefreshCw, 
  AlertTriangle,
  FileText
} from "lucide-react";

interface PaymentProvider {
  id: string;
  providerType: string;
  displayName: string;
  isEnabled: boolean;
  isManual: boolean;
  isSandbox: boolean;
  isDefault: boolean;
  priority: number;
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  merchantId?: string;
  merchantName?: string;
  upiId?: string;
  qrImageUrl?: string;
  instructions?: string;
  supportNumber?: string;
  supportEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SuperAdminPaymentSettingsPage() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [activeTab, setActiveTab] = useState<"list" | "upi" | "gateways" | "audit">("list");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Selected manual UPI form parameters
  const [upiForm, setUpiForm] = useState({
    id: "",
    displayName: "Manual peer-to-peer UPI (Shivay Resort Account)",
    upiId: "payments@home4stay",
    merchantName: "Home4Stay SaaS Platform",
    instructions: "Please pay using any UPI app and share your UTR.",
    supportNumber: "+91 9876543210",
    supportEmail: "billing@home4stay.com",
    isEnabled: true,
    isDefault: true,
    priority: 10,
    qrImageUrl: ""
  });

  // Selected Stripe form parameters
  const [stripeForm, setStripeForm] = useState({
    id: "",
    displayName: "Stripe Automated Checkout",
    apiKey: "••••••••",
    secretKey: "••••••••",
    webhookSecret: "••••••••",
    merchantId: "acct_stripe_prod",
    isEnabled: false,
    isSandbox: true,
    priority: 5,
    isDefault: false
  });

  // Selected Razorpay form parameters
  const [razorpayForm, setRazorpayForm] = useState({
    id: "",
    displayName: "Razorpay Checkout",
    apiKey: "••••••••",
    secretKey: "••••••••",
    merchantId: "mid_rzp_prod",
    isEnabled: false,
    isSandbox: true,
    priority: 5,
    isDefault: false
  });

  const showNotice = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-settings/providers");
      const data = await res.json();
      if (data.success && data.providers) {
        setProviders(data.providers);

        // Bind fetched manual UPI settings
        const upi = data.providers.find((p: PaymentProvider) => p.providerType === "MANUAL_UPI");
        if (upi) {
          setUpiForm({
            id: upi.id,
            displayName: upi.displayName,
            upiId: upi.upiId || "",
            merchantName: upi.merchantName || "",
            instructions: upi.instructions || "",
            supportNumber: upi.supportNumber || "",
            supportEmail: upi.supportEmail || "",
            isEnabled: upi.isEnabled,
            isDefault: upi.isDefault,
            priority: upi.priority,
            qrImageUrl: upi.qrImageUrl || ""
          });
        }

        // Bind fetched Stripe settings
        const stripe = data.providers.find((p: PaymentProvider) => p.providerType === "STRIPE");
        if (stripe) {
          setStripeForm({
            id: stripe.id,
            displayName: stripe.displayName,
            apiKey: stripe.apiKey || "••••••••",
            secretKey: stripe.secretKey || "••••••••",
            webhookSecret: stripe.webhookSecret || "••••••••",
            merchantId: stripe.merchantId || "",
            isEnabled: stripe.isEnabled,
            isSandbox: stripe.isSandbox,
            priority: stripe.priority,
            isDefault: stripe.isDefault
          });
        }

        // Bind fetched Razorpay settings
        const rzp = data.providers.find((p: PaymentProvider) => p.providerType === "RAZORPAY");
        if (rzp) {
          setRazorpayForm({
            id: rzp.id,
            displayName: rzp.displayName,
            apiKey: rzp.apiKey || "••••••••",
            secretKey: rzp.secretKey || "••••••••",
            merchantId: rzp.merchantId || "",
            isEnabled: rzp.isEnabled,
            isSandbox: rzp.isSandbox,
            priority: rzp.priority,
            isDefault: rzp.isDefault
          });
        }
      }
    } catch (err) {
      console.error("[PAYMENT_SETTINGS_FETCH_ERROR]", err);
      showNotice("error", "Failed to retrieve configurations.");
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const res = await fetch("/api/admin/payment-settings/providers");
        const data = await res.json();
        if (data.success && data.providers && isMounted) {
          setProviders(data.providers);

          // Bind fetched manual UPI settings
          const upi = data.providers.find((p: PaymentProvider) => p.providerType === "MANUAL_UPI");
          if (upi) {
            setUpiForm({
              id: upi.id,
              displayName: upi.displayName,
              upiId: upi.upiId || "",
              merchantName: upi.merchantName || "",
              instructions: upi.instructions || "",
              supportNumber: upi.supportNumber || "",
              supportEmail: upi.supportEmail || "",
              isEnabled: upi.isEnabled,
              isDefault: upi.isDefault,
              priority: upi.priority,
              qrImageUrl: upi.qrImageUrl || ""
            });
          }

          // Bind fetched Stripe settings
          const stripe = data.providers.find((p: PaymentProvider) => p.providerType === "STRIPE");
          if (stripe) {
            setStripeForm({
              id: stripe.id,
              displayName: stripe.displayName,
              apiKey: stripe.apiKey || "••••••••",
              secretKey: stripe.secretKey || "••••••••",
              webhookSecret: stripe.webhookSecret || "••••••••",
              merchantId: stripe.merchantId || "",
              isEnabled: stripe.isEnabled,
              isSandbox: stripe.isSandbox,
              priority: stripe.priority,
              isDefault: stripe.isDefault
            });
          }

          // Bind fetched Razorpay settings
          const rzp = data.providers.find((p: PaymentProvider) => p.providerType === "RAZORPAY");
          if (rzp) {
            setRazorpayForm({
              id: rzp.id,
              displayName: rzp.displayName,
              apiKey: rzp.apiKey || "••••••••",
              secretKey: rzp.secretKey || "••••••••",
              merchantId: rzp.merchantId || "",
              isEnabled: rzp.isEnabled,
              isSandbox: rzp.isSandbox,
              priority: rzp.priority,
              isDefault: rzp.isDefault
            });
          }
        }
      } catch (err) {
        console.error("[PAYMENT_SETTINGS_LOAD_ERROR]", err);
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

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    showNotice("success", "Uploading payment QR asset...");

    try {
      const res = await fetch("/api/admin/payment-settings/providers/upload-qr", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.success && data.filename) {
        setUpiForm(prev => ({ ...prev, qrImageUrl: data.filename }));
        showNotice("success", "QR asset uploaded and preview populated.");
      } else {
        showNotice("error", data.error || "Failed to upload QR asset.");
      }
    } catch (err) {
      console.error("[QR_UPLOAD_ERROR]", err);
      showNotice("error", "Failed to upload QR asset.");
    }
  };

  const saveManualUPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isCreate = !upiForm.id;
      const url = isCreate 
        ? "/api/admin/payment-settings/providers" 
        : `/api/admin/payment-settings/providers/${upiForm.id}`;
      
      const method = isCreate ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerType: "MANUAL_UPI",
          isManual: true,
          ...upiForm
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotice("success", "Manual UPI configurations updated successfully.");
        fetchSettings();
      } else {
        showNotice("error", data.error || "Failed to update configurations.");
      }
    } catch (err) {
      console.error("[UPI_SAVE_ERROR]", err);
      showNotice("error", "Error saving configurations.");
    } finally {
      setSaving(false);
    }
  };

  const saveStripe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isCreate = !stripeForm.id;
      const url = isCreate 
        ? "/api/admin/payment-settings/providers" 
        : `/api/admin/payment-settings/providers/${stripeForm.id}`;
      
      const method = isCreate ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerType: "STRIPE",
          isManual: false,
          ...stripeForm
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotice("success", "Stripe automated configurations updated.");
        fetchSettings();
      } else {
        showNotice("error", data.error || "Failed to update Stripe.");
      }
    } catch (err) {
      console.error("[STRIPE_SAVE_ERROR]", err);
      showNotice("error", "Error saving configurations.");
    } finally {
      setSaving(false);
    }
  };

  const saveRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isCreate = !razorpayForm.id;
      const url = isCreate 
        ? "/api/admin/payment-settings/providers" 
        : `/api/admin/payment-settings/providers/${razorpayForm.id}`;
      
      const method = isCreate ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerType: "RAZORPAY",
          isManual: false,
          ...razorpayForm
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotice("success", "Razorpay automated configurations updated.");
        fetchSettings();
      } else {
        showNotice("error", data.error || "Failed to update Razorpay.");
      }
    } catch (err) {
      console.error("[RAZORPAY_SAVE_ERROR]", err);
      showNotice("error", "Error saving configurations.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Banner notifications */}
        {notification && (
          <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border text-sm font-semibold transition-all ${
            notification.type === "success" 
              ? "bg-green-50 border-green-200 text-green-700" 
              : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {notification.type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
                <Settings size={24} className="text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payment Settings Center</h1>
            </div>
            <p className="text-gray-500">Configure Manual UPI parameters, rotate gateway secret keys, and manage environment resolution priorities.</p>
          </div>
          
          <button 
            onClick={fetchSettings}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Sync Configurations
          </button>
        </div>

        {/* Tabs navigation */}
        <div className="flex items-center gap-2 mb-10 border-b border-gray-100 pb-2 overflow-x-auto">
          {[
            { id: "list", label: "Providers List", icon: CreditCard },
            { id: "upi", label: "Manual UPI Config", icon: QrCode },
            { id: "gateways", label: "Automated Gateways", icon: Key },
            { id: "audit", label: "Operational Logs", icon: FileText }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "list" | "upi" | "gateways" | "audit")}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all outline-none ${
                activeTab === tab.id 
                  ? "bg-amber-500/10 text-amber-700 shadow-sm" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main tabs content */}
        {loading ? (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 flex justify-center items-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={36} className="text-amber-500 animate-spin" />
              <p className="text-sm font-semibold text-gray-400">Loading configurations from database...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "list" && (
              <div className="grid grid-cols-1 gap-6">
                {/* Providers grid view */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ListOrdered size={20} className="text-amber-600" />
                    Priority Mappings & Default Allocations
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {providers.map(provider => (
                      <div 
                        key={provider.id} 
                        className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                          provider.isEnabled 
                            ? "bg-white border-amber-200 shadow-md" 
                            : "bg-gray-50/50 border-gray-100 opacity-60"
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
                              {provider.providerType}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`h-2.5 w-2.5 rounded-full ${provider.isEnabled ? "bg-green-500" : "bg-red-400"}`}></span>
                              <span className="text-xs font-bold text-gray-500">
                                {provider.isEnabled ? "Active" : "Disabled"}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{provider.displayName}</h3>
                          <div className="space-y-2 mb-6">
                            <p className="text-xs text-gray-400 flex justify-between">
                              <span>Failover Priority:</span>
                              <span className="font-bold text-gray-700">{provider.priority}</span>
                            </p>
                            <p className="text-xs text-gray-400 flex justify-between">
                              <span>Default Provider:</span>
                              <span className={`font-bold ${provider.isDefault ? "text-green-600" : "text-gray-400"}`}>
                                {provider.isDefault ? "Yes" : "No"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setActiveTab(provider.providerType === "MANUAL_UPI" ? "upi" : "gateways");
                            }}
                            className="flex-1 text-center py-2 border border-amber-200 hover:bg-amber-50 rounded-xl text-xs font-bold text-amber-700 transition-all"
                          >
                            Configure settings
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "upi" && (
              <form onSubmit={saveManualUPI} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 max-w-4xl mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Manual UPI Credentials & Asset Uploads</h2>
                  <p className="text-xs text-gray-500">Centrally configure standard bank transfers, custom checkout QR codes, and instruction guidelines.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">Display Name (Dashboard Checkouts)</label>
                    <input 
                      type="text" 
                      className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                      value={upiForm.displayName}
                      onChange={e => setUpiForm({...upiForm, displayName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">Merchant Name</label>
                    <input 
                      type="text" 
                      className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                      value={upiForm.merchantName}
                      onChange={e => setUpiForm({...upiForm, merchantName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">Merchant UPI ID</label>
                    <input 
                      type="text" 
                      className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                      value={upiForm.upiId}
                      onChange={e => setUpiForm({...upiForm, upiId: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">Failover Priority Rank (Highest resolves first)</label>
                    <input 
                      type="number" 
                      className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                      value={upiForm.priority}
                      onChange={e => setUpiForm({...upiForm, priority: parseInt(e.target.value || "0", 10)})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">Billing Support Number</label>
                    <input 
                      type="text" 
                      className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                      value={upiForm.supportNumber}
                      onChange={e => setUpiForm({...upiForm, supportNumber: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400">Billing Support Email</label>
                    <input 
                      type="email" 
                      className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                      value={upiForm.supportEmail}
                      onChange={e => setUpiForm({...upiForm, supportEmail: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400">Checkout Instructions (Guidelines for owners)</label>
                  <textarea 
                    rows={4}
                    className="p-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                    value={upiForm.instructions}
                    onChange={e => setUpiForm({...upiForm, instructions: e.target.value})}
                    required
                  />
                </div>

                {/* QR preview and upload */}
                <div className="border border-dashed border-gray-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                  <div className="h-32 w-32 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border">
                    {upiForm.qrImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={`/api/admin/payment-settings/providers/qr-assets/${upiForm.qrImageUrl}`} 
                        alt="QR preview" 
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <QrCode className="text-gray-300" size={48} />
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-sm font-bold text-gray-800 mb-1">Upload QR Code Asset</h4>
                    <p className="text-xs text-gray-400 mb-3">Accepts PNG, JPG, or WEBP formats only. Maximum size limit is 2MB.</p>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 rounded-xl text-xs font-bold text-white cursor-pointer transition-all shadow-sm">
                      <Upload size={14} />
                      Choose QR image
                      <input type="file" className="hidden" accept="image/*" onChange={handleQRUpload} />
                    </label>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                      checked={upiForm.isEnabled}
                      onChange={e => setUpiForm({...upiForm, isEnabled: e.target.checked})}
                    />
                    <span className="text-sm font-bold text-gray-700">Enable this provider</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                      checked={upiForm.isDefault}
                      onChange={e => setUpiForm({...upiForm, isDefault: e.target.checked})}
                    />
                    <span className="text-sm font-bold text-gray-700">Mark as Active Default Provider</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 rounded-2xl text-sm font-bold text-white transition-all shadow-md shadow-amber-500/10 flex items-center gap-2"
                  >
                    {saving && <RefreshCw size={16} className="animate-spin" />}
                    Save UPI Configurations
                  </button>
                </div>
              </form>
            )}

            {activeTab === "gateways" && (
              <div className="max-w-4xl mx-auto space-y-10">
                {/* Stripe Form */}
                <form onSubmit={saveStripe} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Stripe Global Gateway (Card Settings)</h2>
                    <p className="text-xs text-gray-500">Configure live or sandbox credentials safely encrypted at rest in database.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400">Stripe Public Key</label>
                      <input 
                        type="text" 
                        className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                        value={stripeForm.apiKey}
                        onChange={e => setStripeForm({...stripeForm, apiKey: e.target.value})}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400">Stripe Secret API Key</label>
                      <input 
                        type="password" 
                        className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                        value={stripeForm.secretKey}
                        onChange={e => setStripeForm({...stripeForm, secretKey: e.target.value})}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400">Webhook Secret Key</label>
                      <input 
                        type="password" 
                        className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                        value={stripeForm.webhookSecret}
                        onChange={e => setStripeForm({...stripeForm, webhookSecret: e.target.value})}
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400">Merchant account ID</label>
                      <input 
                        type="text" 
                        className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                        value={stripeForm.merchantId}
                        onChange={e => setStripeForm({...stripeForm, merchantId: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                        checked={stripeForm.isSandbox}
                        onChange={e => setStripeForm({...stripeForm, isSandbox: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-gray-700">Sandbox / Test Mode active</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                        checked={stripeForm.isEnabled}
                        onChange={e => setStripeForm({...stripeForm, isEnabled: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-gray-700">Enable Stripe Gateway</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 rounded-2xl text-sm font-bold text-white transition-all shadow-md flex items-center gap-2"
                    >
                      {saving && <RefreshCw size={16} className="animate-spin" />}
                      Save Stripe Credentials
                    </button>
                  </div>
                </form>

                {/* Razorpay Form */}
                <form onSubmit={saveRazorpay} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Razorpay Domestic Gateway (UPI & Netbanking)</h2>
                    <p className="text-xs text-gray-500">Configure Indian local checkouts securely encrypted at rest.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400">Razorpay Key ID</label>
                      <input 
                        type="text" 
                        className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                        value={razorpayForm.apiKey}
                        onChange={e => setRazorpayForm({...razorpayForm, apiKey: e.target.value})}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400">Razorpay Key Secret</label>
                      <input 
                        type="password" 
                        className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                        value={razorpayForm.secretKey}
                        onChange={e => setRazorpayForm({...razorpayForm, secretKey: e.target.value})}
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-gray-400">Merchant Account ID</label>
                      <input 
                        type="text" 
                        className="h-12 px-4 bg-gray-50 rounded-2xl border-none focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-medium"
                        value={razorpayForm.merchantId}
                        onChange={e => setRazorpayForm({...razorpayForm, merchantId: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-4 border-t border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                        checked={razorpayForm.isSandbox}
                        onChange={e => setRazorpayForm({...razorpayForm, isSandbox: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-gray-700">Sandbox / Test Mode active</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                        checked={razorpayForm.isEnabled}
                        onChange={e => setRazorpayForm({...razorpayForm, isEnabled: e.target.checked})}
                      />
                      <span className="text-sm font-bold text-gray-700">Enable Razorpay Gateway</span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button 
                      type="submit" 
                      disabled={saving}
                      className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 rounded-2xl text-sm font-bold text-white transition-all shadow-md flex items-center gap-2"
                    >
                      {saving && <RefreshCw size={16} className="animate-spin" />}
                      Save Razorpay Keys
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="text-amber-600" size={24} />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Billing Infrastructure Security Audit</h2>
                    <p className="text-xs text-gray-500">Displays all credentials edits, priority revisions, and environment rotation actions.</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-700 text-xs font-semibold mb-6">
                  <AlertTriangle size={18} className="shrink-0" />
                  <div>
                    <p className="font-bold mb-1">Strict Isolation Protocol</p>
                    <p className="font-medium text-amber-600/90">SaaS platform secrets and private API keys are strictly decrypted in system memory and are NEVER printed to administrative dashboard logs or returned in client-side responses.</p>
                  </div>
                </div>

                <div className="border rounded-2xl overflow-hidden">
                  <div className="p-6 bg-gray-50/50 border-b font-bold text-xs text-gray-400 uppercase tracking-wider">
                    Administrative Action Telemetry
                  </div>
                  <div className="p-8 text-center text-sm font-semibold text-gray-400 italic">
                    Administrative logs can be fetched from the secure command center audit. All payment actions are locked inside append-only Postgres ledgers.
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

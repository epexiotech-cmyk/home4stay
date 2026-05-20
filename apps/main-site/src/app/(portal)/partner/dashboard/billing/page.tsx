"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight, 
  Loader2, 
  UploadCloud, 
  X, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Info,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Custom Subcomponents ---

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("glass-premium rounded-[32px] p-6 hover-lift border border-white/60 dark:border-[#0E5A75]/20 shadow-xl shadow-[#0E5A75]/5 dark:shadow-none", className)}>
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

interface UsageMeterProps {
  label: string;
  current: number;
  limit: number;
}

const UsageMeter = ({ label, current, limit }: UsageMeterProps) => {
  const percentage = Math.min(100, Math.round((current / limit) * 100));
  const isNearLimit = percentage >= 80 && percentage < 100;
  const isFull = percentage >= 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold text-[#0E5A75] dark:text-[#0983B0]">
        <span className="capitalize">{label.replace("max", "").replace(/([A-Z])/g, " $1")}</span>
        <span>{current} / {limit} ({percentage}%)</span>
      </div>
      <div className="w-full h-2.5 bg-[#0E5A75]/5 dark:bg-white/5 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            isFull ? "bg-[#F24633]" : isNearLimit ? "bg-[#FCBC43]" : "bg-[#159665]"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// --- Page Interfaces ---

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  monthlyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
  maxProperties: number;
  maxRoomListings: number;
  maxImagesPerProperty: number;
  maxVideosPerProperty: number;
  maxBookingsPerMonth: number;
  supportPriority: string;
  customBadge: string | null;
  featureFlags: Record<string, boolean>;
  isFeatured: boolean;
}

interface Provider {
  id: string;
  providerType: string;
  displayName: string;
  instructions: string | null;
  upiId: string | null;
  merchantName: string | null;
  qrImageUrl: string | null;
  supportNumber: string | null;
  supportEmail: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  utrNumber: string | null;
  createdAt: string;
  paidAt: string | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceType: string;
  status: string;
  subtotal: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  invoicePdfUrl: string | null;
  issuedAt: string | null;
  createdAt: string;
}

interface Subscription {
  id: string;
  selectedPlanId: string;
  status: string;
  billingCycle: string;
  amount: number;
  startsAt: string | null;
  expiresAt: string | null;
  activatedAt: string | null;
}

interface UsageDetails {
  current: number;
  limit: number;
}

interface Usages {
  properties: UsageDetails;
  rooms: UsageDetails;
  images: UsageDetails;
  videos: UsageDetails;
  bookings: UsageDetails;
}

export default function BillingDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const propertyId = user?.propertyId;

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usages, setUsages] = useState<Usages | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Invoice Filters & Pagination
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
  const invoiceItemsPerPage = 5;

  // Checkout flows
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME">("YEARLY");
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [acceptedSubscriptionAgreement, setAcceptedSubscriptionAgreement] = useState(false);
  const [activeSubVersion, setActiveSubVersion] = useState("1.0.0");

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch Dashboard Data
  const fetchDashboardData = async () => {
    if (!propertyId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/partner/billing/dashboard?propertyId=${propertyId}`);
      if (!res.ok) {
        throw new Error("Failed to retrieve subscription information");
      }
      const data = await res.json();
      setSubscription(data.subscription);
      setUsages(data.usages);
      setPlans(data.plans);
      setActiveProvider(data.activeProvider);
      setTransactions(data.transactions);
      setInvoices(data.invoices || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetch("/api/legal/active")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.versions) {
          setActiveSubVersion(data.versions.SUBSCRIPTION_AGREEMENT || "1.0.0");
        }
      })
      .catch((err) => console.error("Error loading active subscription agreement version:", err));
  }, [propertyId]);

  // Handle Drag & Drop Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setScreenshot(file);
        setScreenshotPreview(URL.createObjectURL(file));
        setCheckoutError(null);
      } else {
        setCheckoutError("Only image files (.png, .jpg, .jpeg) are supported.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
      setCheckoutError(null);
    }
  };

  const clearScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  // Submit manual payment proof
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyId || !selectedPlan || !screenshot) return;

    if (!/^\d{12}$/.test(utrNumber)) {
      setCheckoutError("UTR number must be exactly 12 numerical digits.");
      return;
    }

    if (!acceptedSubscriptionAgreement) {
      setCheckoutError("You must accept the Subscription Agreement to proceed.");
      return;
    }

    try {
      setSubmitLoading(true);
      setCheckoutError(null);

      const formData = new FormData();
      formData.append("propertyId", propertyId);
      formData.append("selectedPlanId", selectedPlan.id);
      formData.append("billingCycle", billingCycle);
      formData.append("utrNumber", utrNumber);
      formData.append("screenshot", screenshot);
      formData.append("acceptedSubscriptionAgreementVersion", activeSubVersion);

      const res = await fetch("/api/payments/manual-upi/submit", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed");
      }

      // Success - Redirect to transaction visualizer page
      router.push(`/partner/dashboard/billing/transactions/${data.transactionId}`);
    } catch (err: any) {
      setCheckoutError(err.message || "Failed to submit transaction details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Calculate pricing dynamics
  const getCyclePrice = (plan: Plan, cycle: typeof billingCycle) => {
    switch (cycle) {
      case "MONTHLY": return plan.monthlyPrice;
      case "QUARTERLY": return plan.quarterlyPrice;
      case "YEARLY": return plan.yearlyPrice;
      case "LIFETIME": return plan.lifetimePrice;
      default: return plan.yearlyPrice;
    }
  };

  const getSavingsPercentage = (plan: Plan) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const yearlyTotal = plan.yearlyPrice;
    if (monthlyTotal <= 0) return 0;
    return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
  };

  // Days remaining calculation
  const getDaysRemaining = (expiresAtStr: string | null) => {
    if (!expiresAtStr) return 0;
    const expiry = new Date(expiresAtStr);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getGraceDaysRemaining = (expiresAtStr: string | null) => {
    if (!expiresAtStr) return 0;
    const expiry = new Date(expiresAtStr);
    const graceExpiry = new Date(expiry.getTime() + 7 * 24 * 60 * 60 * 1000);
    const today = new Date();
    const diffTime = graceExpiry.getTime() - today.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Generate dynamic UPI URI
  const getDynamicUpiUri = () => {
    if (!selectedPlan || !activeProvider) return "";
    const planPrice = getCyclePrice(selectedPlan, billingCycle);
    const upiId = activeProvider.upiId || "";
    const merchantName = activeProvider.merchantName || "Home4Stay Billing";
    const txNote = `H4S_${selectedPlan.slug.substring(0, 4)}_${billingCycle.substring(0, 3)}_${propertyId?.substring(0, 6)}`;
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${planPrice}&cu=INR&tn=${encodeURIComponent(txNote)}`;
  };

  const dynamicQrUrl = selectedPlan && activeProvider 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(getDynamicUpiUri())}`
    : "";

  // Filters & Pagination matching
  const filteredTransactions = transactions.filter(t => {
    if (statusFilter === "ALL") return true;
    return t.paymentStatus.toUpperCase() === statusFilter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const displayedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Invoices Filtering & Pagination
  const filteredInvoices = invoices.filter(inv => {
    if (!invoiceSearch) return true;
    return inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
  });

  const invoiceTotalPages = Math.ceil(filteredInvoices.length / invoiceItemsPerPage);
  const displayedInvoices = filteredInvoices.slice(
    (invoiceCurrentPage - 1) * invoiceItemsPerPage,
    invoiceCurrentPage * invoiceItemsPerPage
  );

  // Status Badge Builder
  const getStatusBadge = (status: string | undefined) => {
    const s = (status || "NO_SUBSCRIPTION").toUpperCase();
    switch (s) {
      case "ACTIVE":
        return <span className="px-3 py-1 rounded-full bg-[#159665]/10 text-[#159665] text-xs font-black uppercase tracking-wider">Active</span>;
      case "RENEWED":
        return <span className="px-3 py-1 rounded-full bg-[#159665]/10 text-[#159665] text-xs font-black uppercase tracking-wider">Renewed</span>;
      case "RENEWAL_DUE":
        return <span className="px-3 py-1 rounded-full bg-[#FCBC43]/10 text-[#FCBC43] text-xs font-black uppercase tracking-wider">Renewal Due</span>;
      case "IN_GRACE_PERIOD":
        return <span className="px-3 py-1 rounded-full bg-[#FCBC43]/15 text-[#FCBC43] text-xs font-black uppercase tracking-wider animate-pulse">Grace Period</span>;
      case "SUSPENDED_OVERDUE":
        return <span className="px-3 py-1 rounded-full bg-[#F24633]/15 text-[#F24633] text-xs font-black uppercase tracking-wider animate-pulse">Suspended Overdue</span>;
      case "PENDING_APPROVAL":
      case "PENDING_PAYMENT":
        return <span className="px-3 py-1 rounded-full bg-[#FCBC43]/10 text-[#FCBC43] text-xs font-black uppercase tracking-wider animate-pulse">Pending Approval</span>;
      case "EXPIRED":
        return <span className="px-3 py-1 rounded-full bg-[#F24633]/10 text-[#F24633] text-xs font-black uppercase tracking-wider">Expired</span>;
      case "SUSPENDED":
        return <span className="px-3 py-1 rounded-full bg-[#F24633]/15 text-[#F24633] text-xs font-black uppercase tracking-wider">Suspended</span>;
      default:
        return <span className="px-3 py-1 rounded-full bg-[#0E5A75]/10 text-[#0E5A75] text-xs font-black uppercase tracking-wider">No Subscription</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="h-10 bg-white/20 dark:bg-white/5 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-64 bg-white/20 dark:bg-white/5 rounded-[32px] col-span-2" />
          <div className="h-64 bg-white/20 dark:bg-white/5 rounded-[32px]" />
        </div>
        <div className="h-96 bg-white/20 dark:bg-white/5 rounded-[32px]" />
      </div>
    );
  }

  if (error) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={48} className="text-[#F24633] mb-4" />
        <h2 className="text-2xl font-black text-[#053344] dark:text-white">Failed to load Billing</h2>
        <p className="text-sm font-bold text-[#0E5A75]/60 mt-2 max-w-md">{error}</p>
        <button onClick={fetchDashboardData} className="mt-6 px-6 py-3 bg-[#0E5A75] hover:bg-[#0A4459] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all">Retry</button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Billing & Purchase</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Subscription Details</h1>
          <p className="text-[#053344] dark:text-[#0983B0] mt-3 font-medium text-lg">Manage your account plans, transaction histories, and active entitlements.</p>
        </div>
      </div>

      {/* Luxury Status Alert Banners */}
      {subscription && (
        <>
          {subscription.status === "RENEWAL_DUE" && (
            <div className="glass-premium p-6 rounded-[24px] border border-[#FCBC43]/30 bg-[#FCBC43]/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top-4 duration-500 text-left">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FCBC43]/10 text-[#FCBC43] rounded-2xl">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#053344] dark:text-white">Upcoming Subscription Renewal Due</h3>
                  <p className="text-sm font-medium text-[#0E5A75]/70 dark:text-white/70 mt-1">
                    Your subscription expires in <span className="font-black text-[#FCBC43]">{getDaysRemaining(subscription.expiresAt)} days</span> on {new Date(subscription.expiresAt!).toLocaleDateString()}. Renew now to avoid entering grace period and losing premium privileges.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById("pricing-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-3 rounded-xl bg-[#FCBC43] hover:bg-[#e0a02b] text-[#053344] text-xs font-black uppercase tracking-widest transition-all shadow-md shrink-0 active:scale-95"
              >
                Renew Subscription
              </button>
            </div>
          )}

          {subscription.status === "IN_GRACE_PERIOD" && (
            <div className="glass-premium p-6 rounded-[24px] border border-[#FCBC43]/50 bg-[#FCBC43]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top-4 duration-500 shadow-lg shadow-[#FCBC43]/5 text-left">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#FCBC43]/10 text-[#FCBC43] rounded-2xl animate-pulse">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#053344] dark:text-white flex items-center gap-2">
                    Listing In Grace Period
                    <span className="px-2 py-0.5 rounded-full bg-[#FCBC43]/20 text-[#FCBC43] text-[10px] font-black uppercase tracking-wider animate-pulse">Restricted Access</span>
                  </h3>
                  <p className="text-sm font-medium text-[#0E5A75]/70 dark:text-white/70 mt-1">
                    Your plan expired on {new Date(subscription.expiresAt!).toLocaleDateString()}. You have <span className="font-black text-[#FCBC43]">{getGraceDaysRemaining(subscription.expiresAt)} days remaining</span> in your grace period. 
                    <span className="block mt-1 font-bold text-[#FCBC43]">Restrictions applied: Gallery capped at 3 images, AI utilities disabled, and inquiry channels locked. Complete suspension in {getGraceDaysRemaining(subscription.expiresAt)} days.</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById("pricing-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-3 rounded-xl bg-[#FCBC43] hover:bg-[#e0a02b] text-[#053344] text-xs font-black uppercase tracking-widest transition-all shadow-md shrink-0 active:scale-95 animate-pulse"
              >
                Unlock Full Tier Now
              </button>
            </div>
          )}

          {subscription.status === "SUSPENDED_OVERDUE" && (
            <div className="glass-premium p-6 rounded-[24px] border border-[#F24633]/50 bg-[#F24633]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top-4 duration-500 shadow-lg shadow-[#F24633]/5 text-left">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#F24633]/10 text-[#F24633] rounded-2xl animate-bounce">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#053344] dark:text-white flex items-center gap-2">
                    Listing Suspended & Offline
                    <span className="px-2 py-0.5 rounded-full bg-[#F24633]/20 text-[#F24633] text-[10px] font-black uppercase tracking-wider animate-pulse">Action Required</span>
                  </h3>
                  <p className="text-sm font-medium text-[#0E5A75]/70 dark:text-white/70 mt-1">
                    Your subscription is overdue. Your public property listing is now completely hidden from the public directory. Your capability usages are restricted to zero. Pay via UPI immediately to reactivate and restore your listing.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  const el = document.getElementById("pricing-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-5 py-3 rounded-xl bg-[#F24633] hover:bg-[#c93222] text-white text-xs font-black uppercase tracking-widest transition-all shadow-md shrink-0 active:scale-95 animate-bounce"
              >
                Reactivate Listing
              </button>
            </div>
          )}

          {subscription.status === "RENEWED" && (
            <div className="glass-premium p-6 rounded-[24px] border border-[#159665]/30 bg-[#159665]/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in slide-in-from-top-4 duration-500 text-left">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-[#159665]/10 text-[#159665] rounded-2xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#053344] dark:text-white">Subscription Successfully Renewed!</h3>
                  <p className="text-sm font-medium text-[#0E5A75]/70 dark:text-white/70 mt-1">
                    Thank you! Your subscription for {subscription.selectedPlanId.toUpperCase()} has been successfully processed and renewed until {new Date(subscription.expiresAt!).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Main Stats Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Current Plan Overview Card */}
        <GlassCard className="col-span-1 md:col-span-2 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#0E5A75]/5 rounded-full blur-3xl group-hover:bg-[#0E5A75]/10 transition-all duration-700 pointer-events-none" />
          
          <WidgetHeader title="Active Plan Status" icon={CreditCard} />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-2">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">
                  {subscription ? `${subscription.selectedPlanId.toUpperCase()} Tier` : "No Active Subscription"}
                </h2>
                {getStatusBadge(subscription?.status)}
              </div>
              <p className="text-xs font-bold text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest mt-3">
                {subscription?.startsAt ? `Renew Date: ${new Date(subscription.expiresAt!).toLocaleDateString()}` : "Upgrade to publish property live"}
              </p>
            </div>

            {subscription && ["ACTIVE", "RENEWED", "RENEWAL_DUE"].includes(subscription.status) && (
              <div className="p-5 rounded-[24px] bg-[#159665]/10 border border-[#159665]/20 flex items-center gap-4 text-left shadow-inner">
                <div className="w-12 h-12 bg-[#159665] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  {getDaysRemaining(subscription.expiresAt)}
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#159665] uppercase tracking-widest leading-none">Days Left</p>
                  <p className="text-sm font-bold text-[#053344] dark:text-white mt-1 leading-none">{subscription.billingCycle} Cycle</p>
                </div>
              </div>
            )}

            {subscription && subscription.status === "IN_GRACE_PERIOD" && (
              <div className="p-5 rounded-[24px] bg-[#FCBC43]/10 border border-[#FCBC43]/20 flex items-center gap-4 text-left shadow-inner animate-pulse">
                <div className="w-12 h-12 bg-[#FCBC43] rounded-xl flex items-center justify-center text-[#053344] font-bold text-xl shadow-lg">
                  {getGraceDaysRemaining(subscription.expiresAt)}
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#FCBC43] uppercase tracking-widest leading-none">Grace Days</p>
                  <p className="text-sm font-bold text-[#053344] dark:text-white mt-1 leading-none">Capped Features</p>
                </div>
              </div>
            )}

            {subscription && subscription.status === "SUSPENDED_OVERDUE" && (
              <div className="p-5 rounded-[24px] bg-[#F24633]/10 border border-[#F24633]/20 flex items-center gap-4 text-left shadow-inner">
                <div className="w-12 h-12 bg-[#F24633] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg animate-bounce">
                  0
                </div>
                <div>
                  <p className="text-[10px] font-black text-[#F24633] uppercase tracking-widest leading-none">Listing Offline</p>
                  <p className="text-sm font-bold text-[#053344] dark:text-white mt-1 leading-none">Suspended Overdue</p>
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-[#0E5A75]/10 dark:bg-white/10 my-6" />

          {/* Feature List Guards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="flex items-center gap-2.5 text-sm text-[#0E5A75] dark:text-[#FDF6F1] font-bold">
              <ShieldCheck className={cn("w-5 h-5", subscription && ["ACTIVE", "RENEWED", "RENEWAL_DUE"].includes(subscription.status) ? "text-[#159665]" : "text-[#0E5A75]/40")} />
              <span>Priority Support ({(usages ? usages.properties.limit > 1 ? "HIGH" : "NORMAL" : "NORMAL")})</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[#0E5A75] dark:text-[#FDF6F1] font-bold">
              <ShieldCheck className={cn("w-5 h-5", subscription && ["ACTIVE", "RENEWED", "RENEWAL_DUE"].includes(subscription.status) ? "text-[#159665]" : "text-[#0E5A75]/40")} />
              <span>Property Custom Branding</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[#0E5A75] dark:text-[#FDF6F1] font-bold">
              <ShieldCheck className={cn("w-5 h-5", subscription && ["ACTIVE", "RENEWED", "RENEWAL_DUE"].includes(subscription.status) ? "text-[#159665]" : "text-[#0E5A75]/40")} />
              <span>Full Analytics Panel Access</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-[#0E5A75] dark:text-[#FDF6F1] font-bold">
              <ShieldCheck className={cn("w-5 h-5", subscription && ["ACTIVE", "RENEWED", "RENEWAL_DUE"].includes(subscription.status) ? "text-[#159665]" : "text-[#0E5A75]/40")} />
              <span>AI Page CMS Generations</span>
            </div>
          </div>
        </GlassCard>

        {/* Dynamic Limit Gauges */}
        <GlassCard className="col-span-1">
          <WidgetHeader title="System Usage Limits" icon={TrendingUp} />
          {usages ? (
            <div className="space-y-4 text-left">
              <UsageMeter label="properties" current={usages.properties.current} limit={usages.properties.limit} />
              <UsageMeter label="room listings" current={usages.rooms.current} limit={usages.rooms.limit} />
              <UsageMeter label="property media" current={usages.images.current} limit={usages.images.limit} />
              <UsageMeter label="video assets" current={usages.videos.current} limit={usages.videos.limit} />
              <UsageMeter label="monthly bookings" current={usages.bookings.current} limit={usages.bookings.limit} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-[#0E5A75]/40">
              <Info className="w-5 h-5 mr-2" />
              <span className="text-xs font-bold uppercase tracking-widest">No metrics resolved</span>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Available Plans Section */}
      <div id="pricing-section" className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tighter">Pricing Tiers</h2>
            <p className="text-sm font-bold text-[#0E5A75]/60 mt-1">Upgrade or renew your subscription tier securely using peer-to-peer UPI transfer</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const savings = getSavingsPercentage(plan);
            const isFeatured = plan.isFeatured;
            const isActivePlan = subscription?.selectedPlanId === plan.slug && ["ACTIVE", "RENEWED", "RENEWAL_DUE", "IN_GRACE_PERIOD"].includes(subscription?.status);

            return (
              <GlassCard 
                key={plan.id} 
                className={cn(
                  "flex flex-col text-left justify-between relative overflow-hidden transition-all duration-500",
                  isFeatured ? "border-[#0E5A75] ring-2 ring-[#0E5A75]/20 scale-[1.02] md:scale-105 z-10" : ""
                )}
              >
                {isFeatured && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#0E5A75] text-white text-[9px] font-black uppercase tracking-widest shadow-md">
                    Recommended
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest mb-1">{plan.shortDescription || "General Tier"}</p>
                  <h3 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">{plan.name}</h3>
                  <p className="text-xs text-[#0E5A75]/60 mt-2 font-medium leading-relaxed">{plan.description}</p>
                  
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter">₹{plan.yearlyPrice.toLocaleString()}</span>
                    <span className="text-xs font-bold text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest">/ Year</span>
                  </div>

                  {savings > 0 && (
                    <span className="inline-block mt-2 px-2.5 py-1 rounded-full bg-[#159665]/10 text-[#159665] text-[10px] font-black uppercase tracking-wider">
                      Save {savings}% on Yearly billing
                    </span>
                  )}

                  <div className="h-px bg-[#0E5A75]/10 dark:bg-white/10 my-6" />

                  {/* Plan Features */}
                  <ul className="space-y-3 text-xs font-bold text-[#0E5A75] dark:text-[#FDF6F1]">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E5A75]" />
                      <span>Up to {plan.maxProperties} properties</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E5A75]" />
                      <span>{plan.maxRoomListings} room listings</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E5A75]" />
                      <span>{plan.maxImagesPerProperty} media files / property</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E5A75]" />
                      <span>{plan.maxBookingsPerMonth} bookings / month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0E5A75]" />
                      <span>{plan.supportPriority} priority customer service</span>
                    </li>
                  </ul>
                </div>

                <button
                  disabled={isActivePlan}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setCheckoutError(null);
                    setUtrNumber("");
                    clearScreenshot();
                  }}
                  className={cn(
                    "w-full mt-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95",
                    isActivePlan
                      ? "bg-[#159665]/10 text-[#159665] border border-[#159665]/20 cursor-default"
                      : isFeatured
                        ? "bg-[#0E5A75] hover:bg-[#0A4459] text-white shadow-xl shadow-[#0E5A75]/20"
                        : "bg-white hover:bg-[#0E5A75]/5 text-[#0E5A75] border border-[#0E5A75]/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:border-white/10"
                  )}
                >
                  {isActivePlan ? "Current Active Plan" : "Purchase Plan"}
                </button>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Manual Checkout Flow Modal */}
      {selectedPlan && activeProvider && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#053344]/40 backdrop-blur-md animate-in fade-in duration-500"
            onClick={() => setSelectedPlan(null)}
          />
          <div className="relative w-full max-w-3xl bg-white dark:bg-[#0A0F1D] rounded-[40px] shadow-luxury overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10 flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Modal Left Side — Provider Details */}
            <div className="flex-1 p-8 bg-[#0E5A75]/5 dark:bg-white/5 flex flex-col justify-between overflow-y-auto">
              <div>
                <h3 className="text-[10px] font-black text-[#0983B0] uppercase tracking-widest">Manual Peer-To-Peer UPI</h3>
                <h2 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight mt-1">Manual Checkout</h2>
                <p className="text-xs text-[#0E5A75]/60 dark:text-[#0983B0]/60 mt-1 font-medium">Scan the QR code or send payment directly using details below.</p>
                
                <div className="h-px bg-[#0E5A75]/10 dark:bg-white/10 my-4" />

                {/* QR Code Container */}
                {activeProvider.upiId ? (
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-md border border-[#0E5A75]/10 max-w-[200px] mx-auto mb-4">
                    <img 
                      src={dynamicQrUrl} 
                      alt="Merchant payment QR code" 
                      className="w-36 h-36 object-contain"
                    />
                    <span className="text-[9px] font-black text-[#053344] uppercase tracking-widest mt-2">Scan & Pay Exact Amount</span>
                  </div>
                ) : activeProvider.qrImageUrl ? (
                  <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-md border border-[#0E5A75]/10 max-w-[200px] mx-auto mb-4">
                    <img 
                      src={activeProvider.qrImageUrl} 
                      alt="Merchant payment QR code" 
                      className="w-36 h-36 object-contain"
                    />
                    <span className="text-[9px] font-black text-[#053344] uppercase tracking-widest mt-2">Scan & Pay</span>
                  </div>
                ) : (
                  <div className="h-36 flex flex-col items-center justify-center rounded-3xl bg-[#0E5A75]/5 dark:bg-white/5 border border-dashed border-[#0E5A75]/20 mb-4 text-[#0E5A75]/40 text-xs font-bold uppercase tracking-widest">
                    <span>No QR Code Configured</span>
                  </div>
                )}

                <div className="space-y-2 text-left">
                  <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-[#0E5A75]/10">
                    <p className="text-[9px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest">UPI ID</p>
                    <p className="text-xs font-black text-[#053344] dark:text-white mt-0.5 select-all">{activeProvider.upiId}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-[#0E5A75]/10">
                    <p className="text-[9px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest">Merchant Name</p>
                    <p className="text-xs font-black text-[#053344] dark:text-white mt-0.5">{activeProvider.merchantName || "Home4Stay Billing"}</p>
                  </div>
                  <div className="p-3 bg-white dark:bg-white/5 rounded-xl border border-[#0E5A75]/10">
                    <p className="text-[9px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest">Payment Reference Note</p>
                    <p className="text-xs font-black text-[#053344] dark:text-white mt-0.5 select-all">
                      {`H4S_${selectedPlan.slug.substring(0, 4)}_${billingCycle.substring(0, 3)}_${propertyId?.substring(0, 6)}`.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Support Hotline coordinates */}
              <div className="mt-6 border-t border-[#0E5A75]/10 dark:border-white/10 pt-4 flex flex-col gap-2 text-left">
                <p className="text-[10px] font-black text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest">Helpline Support</p>
                {activeProvider.supportNumber && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#053344] dark:text-[#FDF6F1]">
                    <Phone size={14} className="text-[#0983B0]" />
                    <span>{activeProvider.supportNumber}</span>
                  </div>
                )}
                {activeProvider.supportEmail && (
                  <div className="flex items-center gap-2 text-xs font-bold text-[#053344] dark:text-[#FDF6F1]">
                    <Mail size={14} className="text-[#0983B0]" />
                    <span>{activeProvider.supportEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Right Side — Submission Form */}
            <div className="flex-1 p-8 flex flex-col justify-between overflow-y-auto">
              <button 
                onClick={() => setSelectedPlan(null)}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75] dark:hover:bg-white/5 transition-all self-end md:static md:self-auto"
              >
                <X size={20} className="md:hidden" />
              </button>

              <div className="flex flex-col gap-4 text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest">Confirm Details</h3>
                    <h3 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight mt-0.5">{selectedPlan.name} Plan</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedPlan(null)}
                    className="hidden md:block p-2 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75] dark:hover:bg-white/5 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Billing Cycle Picker */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#0E5A75]/5 dark:bg-white/5 rounded-2xl">
                  {["MONTHLY", "QUARTERLY", "YEARLY", "LIFETIME"].map((cycle) => (
                    <button
                      key={cycle}
                      type="button"
                      onClick={() => setBillingCycle(cycle as any)}
                      className={cn(
                        "py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        billingCycle === cycle
                          ? "bg-[#0E5A75] text-white shadow-md"
                          : "text-[#0E5A75] hover:bg-[#0E5A75]/5 dark:text-white/60 dark:hover:bg-white/5"
                      )}
                    >
                      {cycle.replace("LY", "")}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center px-4 py-3 bg-[#0E5A75]/5 dark:bg-white/5 rounded-2xl border border-[#0E5A75]/10">
                  <span className="text-xs font-bold text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest">Total Amount</span>
                  <span className="text-xl font-black text-[#053344] dark:text-white">₹{getCyclePrice(selectedPlan, billingCycle).toLocaleString()}</span>
                </div>

                {/* Instructions Box */}
                {activeProvider.instructions && (
                  <div className="p-4 bg-[#FCBC43]/5 rounded-2xl border border-[#FCBC43]/20 flex items-start gap-2.5">
                    <Info size={16} className="text-[#FCBC43] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-[#FCBC43] uppercase tracking-widest">Payment Instructions</p>
                      <p className="text-[11px] text-[#053344] dark:text-white/80 mt-1 font-medium leading-relaxed">{activeProvider.instructions}</p>
                    </div>
                  </div>
                )}

                {/* Proof upload Form Fields */}
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  
                  {/* UTR Input */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest">UTR Number (12 Numerical Digits)</label>
                    <input 
                      type="text" 
                      maxLength={12}
                      pattern="\d{12}"
                      required
                      placeholder="e.g. 123456789012"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ""))}
                      className="w-full px-4 py-3.5 rounded-2xl border border-[#0E5A75]/20 focus:border-[#0E5A75] focus:ring-1 focus:ring-[#0E5A75] dark:border-white/10 dark:bg-white/5 bg-transparent text-sm font-black text-[#053344] dark:text-white tracking-widest placeholder:tracking-normal placeholder:font-bold outline-none transition-all"
                    />
                  </div>

                  {/* Drag-and-drop Screenshot Uploader */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-black text-[#0E5A75] dark:text-[#0983B0] uppercase tracking-widest">Upload Payment Screenshot</label>
                    
                    {!screenshotPreview ? (
                      <div 
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="h-32 rounded-2xl border-2 border-dashed border-[#0E5A75]/20 hover:border-[#0E5A75] dark:border-white/10 dark:hover:border-[#0983B0] transition-colors flex flex-col items-center justify-center p-4 cursor-pointer relative bg-[#0E5A75]/5 dark:bg-white/5"
                      >
                        <input 
                          type="file" 
                          accept="image/*"
                          required
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <UploadCloud size={28} className="text-[#0983B0] mb-2" />
                        <span className="text-xs font-bold text-[#0E5A75] dark:text-[#FDF6F1]">Drag & drop or Click to browse</span>
                        <span className="text-[9px] text-[#0E5A75]/50 dark:text-white/40 mt-1 uppercase font-black">PNG, JPG, JPEG up to 5MB</span>
                      </div>
                    ) : (
                      <div className="relative rounded-2xl overflow-hidden border border-[#0E5A75]/10 h-32 bg-black/5 flex items-center justify-center p-2">
                        <img 
                          src={screenshotPreview} 
                          alt="Screenshot upload preview" 
                          className="h-full object-contain rounded-xl"
                        />
                        <button 
                          type="button"
                          onClick={clearScreenshot}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white transition-all shadow-md"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Legal Acceptance Checkbox */}
                  <div className="flex items-start gap-3 mt-4 ml-1 select-none text-left">
                    <input
                      type="checkbox"
                      id="acceptedSubscriptionAgreement"
                      checked={acceptedSubscriptionAgreement}
                      onChange={(e) => setAcceptedSubscriptionAgreement(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-[#0E5A75]/20 bg-white/20 text-[#0E5A75] focus:ring-[#0E5A75]/30 cursor-pointer"
                    />
                    <label htmlFor="acceptedSubscriptionAgreement" className="text-[10px] font-medium leading-relaxed text-[#29655C] dark:text-[#0983B0] cursor-pointer">
                      I review and agree to the{" "}
                      <Link href="/subscription-agreement" target="_blank" className="text-[#0E5A75] dark:text-white underline decoration-1 decoration-[#0E5A75]/30 underline-offset-2 hover:text-[#0983B0] transition-colors">
                        Subscription Agreement (v{activeSubVersion})
                      </Link>{" "}
                      for licensing and dashboard capabilities.
                    </label>
                  </div>

                  {checkoutError && (
                    <div className="p-3 bg-[#F24633]/5 rounded-xl border border-[#F24633]/20 text-xs font-bold text-[#F24633] text-left">
                      {checkoutError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitLoading || !screenshot || !utrNumber || !acceptedSubscriptionAgreement}
                    className="w-full py-4 rounded-2xl bg-[#0E5A75] hover:bg-[#0A4459] text-white text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-[#0E5A75]/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Submitting proof...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Payment Details</span>
                        <ArrowUpRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <GlassCard className="text-left">
        <WidgetHeader title="Billing Transaction History" icon={Calendar} action={
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#0983B0]" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#0E5A75]/5 dark:bg-white/5 border border-[#0E5A75]/10 text-xs font-bold text-[#0E5A75] dark:text-[#FDF6F1] outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        } />

        {displayedTransactions.length === 0 ? (
          <div className="text-center py-16 text-[#0E5A75]/40 flex flex-col items-center justify-center gap-2">
            <Clock size={36} className="text-[#0E5A75]/20" />
            <p className="text-xs font-bold uppercase tracking-widest">No transaction history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-xs text-left">
                <thead>
                  <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                    <th className="py-4 px-4">Transaction ID</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">UTR Reference</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5">
                  {displayedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors font-bold text-[#053344] dark:text-[#FDF6F1]">
                      <td className="py-4 px-4 font-black">{tx.id.substring(0, 8)}...</td>
                      <td className="py-4 px-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 px-4 font-black select-all tracking-wider">{tx.utrNumber || "N/A"}</td>
                      <td className="py-4 px-4 font-black">₹{tx.amount.toLocaleString()}</td>
                      <td className="py-4 px-4">{getStatusBadge(tx.paymentStatus)}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => router.push(`/partner/dashboard/billing/transactions/${tx.id}`)}
                          className="px-3.5 py-2 rounded-xl bg-[#0E5A75]/10 hover:bg-[#0E5A75] text-[#0E5A75] hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          View Steps
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#0E5A75]/10 dark:border-white/10">
                <span className="text-[10px] font-bold text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest">
                  Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} items
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

      {/* Tax Invoice Ledger Section */}
      <GlassCard className="text-left mt-8">
        <WidgetHeader title="SaaS Compliance Invoices" icon={FileText} action={
          <div className="flex items-center gap-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search Invoice #..."
              value={invoiceSearch}
              onChange={(e) => {
                setInvoiceSearch(e.target.value);
                setInvoiceCurrentPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-[#0E5A75]/5 dark:bg-white/5 border border-[#0E5A75]/10 text-xs font-bold text-[#053344] dark:text-[#FDF6F1] outline-none placeholder:text-[#0E5A75]/40 placeholder:font-bold"
            />
          </div>
        } />

        {displayedInvoices.length === 0 ? (
          <div className="text-center py-16 text-[#0E5A75]/40 flex flex-col items-center justify-center gap-2">
            <FileText size={36} className="text-[#0E5A75]/20" />
            <p className="text-xs font-bold uppercase tracking-widest">No invoice records found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-xs text-left">
                <thead>
                  <tr className="border-b border-[#0E5A75]/10 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] font-black uppercase tracking-widest">
                    <th className="py-4 px-4">Invoice Number</th>
                    <th className="py-4 px-4">Issue Date</th>
                    <th className="py-4 px-4">Subtotal</th>
                    <th className="py-4 px-4">GST Rate</th>
                    <th className="py-4 px-4">GST Amount</th>
                    <th className="py-4 px-4">Total Amount</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0E5A75]/5 dark:divide-white/5">
                  {displayedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-colors font-bold text-[#053344] dark:text-[#FDF6F1]">
                      <td className="py-4 px-4 font-black">{inv.invoiceNumber}</td>
                      <td className="py-4 px-4">{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString("en-IN") : new Date(inv.createdAt).toLocaleDateString("en-IN")}</td>
                      <td className="py-4 px-4">₹{inv.subtotal.toFixed(2)}</td>
                      <td className="py-4 px-4">{inv.gstPercent}%</td>
                      <td className="py-4 px-4">₹{inv.gstAmount.toFixed(2)}</td>
                      <td className="py-4 px-4 font-black text-[#0E5A75] dark:text-[#0983B0]">₹{inv.totalAmount.toFixed(2)}</td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#159665]/10 text-[#159665] text-[10px] font-black uppercase tracking-wider">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <a
                          href={`/api/payments/invoices/${inv.id}/download`}
                          download
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0E5A75] hover:bg-[#0A4459] text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          <Download size={12} />
                          <span>PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoices Pagination */}
            {invoiceTotalPages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#0E5A75]/10 dark:border-white/10">
                <span className="text-[10px] font-bold text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest">
                  Showing {(invoiceCurrentPage - 1) * invoiceItemsPerPage + 1} - {Math.min(invoiceCurrentPage * invoiceItemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={invoiceCurrentPage === 1}
                    onClick={() => setInvoiceCurrentPage(invoiceCurrentPage - 1)}
                    className="p-2 rounded-xl border border-[#0E5A75]/10 hover:bg-[#0E5A75]/5 text-[#0E5A75] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-black px-2">{invoiceCurrentPage} / {invoiceTotalPages}</span>
                  <button
                    disabled={invoiceCurrentPage === invoiceTotalPages}
                    onClick={() => setInvoiceCurrentPage(invoiceCurrentPage + 1)}
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
  );
}

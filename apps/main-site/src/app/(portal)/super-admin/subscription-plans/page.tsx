"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  DollarSign, 
  Layers, 
  Sliders, 
  Star, 
  RefreshCw,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Zap,
  Globe,
  Image as ImageIcon,
  Video,
  Bookmark,
  Calendar,
  MessageSquare
} from "lucide-react";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  monthlyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  lifetimePrice: number;
  maxProperties: number;
  maxImagesPerProperty: number;
  maxVideosPerProperty: number;
  maxRoomListings: number;
  maxBookingsPerMonth: number;
  featureFlags: Record<string, boolean>;
  customBadge?: string;
  supportPriority: string;
  createdAt: string;
}

export default function SuperAdminSubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    shortDescription: "",
    isActive: true,
    isFeatured: false,
    displayOrder: 0,
    monthlyPrice: 0,
    quarterlyPrice: 0,
    yearlyPrice: 0,
    lifetimePrice: 0,
    maxProperties: 1,
    maxImagesPerProperty: 10,
    maxVideosPerProperty: 1,
    maxRoomListings: 5,
    maxBookingsPerMonth: 100,
    customBadge: "",
    supportPriority: "NORMAL",
    featureFlags: {
      featuredListing: false,
      analyticsAccess: false,
      premiumSupport: false,
      whatsappInquiry: true,
      aiContentGeneration: false,
      priorityRanking: false
    }
  });

  const showNotice = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const fetchPlans = useCallback(async (showQueueLoading = true) => {
    if (showQueueLoading) {
      setLoading(true);
    }
    try {
      const res = await fetch("/api/admin/subscription-plans");
      const data = await res.json();
      if (data.success && data.plans) {
        setPlans(data.plans);
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Failed to retrieve subscription plans.");
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (isMounted) {
        await fetchPlans(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [fetchPlans]);

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingId(plan.id);
    // Parse dynamic JSON feature flags safely
    const rawFlags = plan.featureFlags || {};
    setFormData({
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      shortDescription: plan.shortDescription || "",
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      displayOrder: plan.displayOrder,
      monthlyPrice: plan.monthlyPrice,
      quarterlyPrice: plan.quarterlyPrice,
      yearlyPrice: plan.yearlyPrice,
      lifetimePrice: plan.lifetimePrice,
      maxProperties: plan.maxProperties,
      maxImagesPerProperty: plan.maxImagesPerProperty,
      maxVideosPerProperty: plan.maxVideosPerProperty,
      maxRoomListings: plan.maxRoomListings,
      maxBookingsPerMonth: plan.maxBookingsPerMonth,
      customBadge: plan.customBadge || "",
      supportPriority: plan.supportPriority,
      featureFlags: {
        featuredListing: !!rawFlags.featuredListing,
        analyticsAccess: !!rawFlags.analyticsAccess,
        premiumSupport: !!rawFlags.premiumSupport,
        whatsappInquiry: !!rawFlags.whatsappInquiry,
        aiContentGeneration: !!rawFlags.aiContentGeneration,
        priorityRanking: !!rawFlags.priorityRanking
      }
    });
    setShowModal(true);
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      isActive: true,
      isFeatured: false,
      displayOrder: 0,
      monthlyPrice: 999,
      quarterlyPrice: 2499,
      yearlyPrice: 8999,
      lifetimePrice: 19999,
      maxProperties: 1,
      maxImagesPerProperty: 15,
      maxVideosPerProperty: 2,
      maxRoomListings: 10,
      maxBookingsPerMonth: 250,
      customBadge: "",
      supportPriority: "NORMAL",
      featureFlags: {
        featuredListing: false,
        analyticsAccess: false,
        premiumSupport: false,
        whatsappInquiry: true,
        aiContentGeneration: false,
        priorityRanking: false
      }
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId 
        ? `/api/admin/subscription-plans/${editingId}` 
        : "/api/admin/subscription-plans";
      
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        showNotice("success", editingId ? "Plan settings updated." : "New subscription plan created and property owners alerted!");
        setShowModal(false);
        fetchPlans();
      } else {
        showNotice("error", data.error || "Failed to update configurations.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Error saving plan options.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to discontinue/delete this plan? Active subscribers will be alerted immediately regarding the plan change.")) return;
    try {
      const res = await fetch(`/api/admin/subscription-plans/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showNotice("success", "Subscription plan soft-deleted successfully.");
        fetchPlans();
      } else {
        showNotice("error", data.error || "Failed to delete.");
      }
    } catch (err) {
      console.error(err);
      showNotice("error", "Error processing soft deletion.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Alerts Banners */}
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
                <Layers size={24} className="text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Subscription Plans Center</h1>
            </div>
            <p className="text-gray-500">Configure customizable subscription tiers, room listing limits, WhatsApp permissions, and automated email promotional alerts.</p>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-sm font-bold text-white transition-all shadow-md shadow-amber-500/10"
            >
              <Plus size={16} />
              Create Plan Tiers
            </button>
            <button 
              onClick={() => fetchPlans()}
              className="flex items-center justify-center h-12 w-12 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Dynamic Lists Grid */}
        {loading ? (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-16 flex justify-center items-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={36} className="text-amber-500 animate-spin" />
              <p className="text-sm font-semibold text-gray-400">Loading subscription plans...</p>
            </div>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-20 text-center flex flex-col items-center gap-4">
            <Layers className="text-gray-300" size={64} />
            <h3 className="text-xl font-bold text-gray-800">No Subscription Plans Configured</h3>
            <p className="text-xs text-gray-400 max-w-md">Launch customized pricing levels matching monthly, quarterly, yearly, and lifetime limits to activate dashboard checkouts.</p>
            <button 
              onClick={handleCreateNew}
              className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl text-sm font-bold text-white transition-all"
            >
              Add Your First Plan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div 
                key={plan.id}
                className={`rounded-[2.5rem] p-8 border bg-white shadow-sm flex flex-col justify-between transition-all relative ${
                  plan.isFeatured ? "border-amber-400 ring-4 ring-amber-400/10 scale-[1.02]" : "border-gray-100"
                } ${!plan.isActive ? "opacity-60 bg-gray-50/50" : ""}`}
              >
                {/* Featured Badge */}
                {plan.isFeatured && (
                  <span className="absolute -top-3.5 left-8 px-4 py-1 bg-amber-500 text-white rounded-full text-xxs font-extrabold uppercase tracking-widest shadow-sm flex items-center gap-1">
                    <Star size={10} className="fill-current" />
                    Featured Tier
                  </span>
                )}

                {/* Custom Badge display */}
                {plan.customBadge && (
                  <span className="absolute top-8 right-8 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xxs font-bold uppercase">
                    {plan.customBadge}
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xxs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500 uppercase">
                      {plan.slug}
                    </span>
                    <span className={`h-2.5 w-2.5 rounded-full ${plan.isActive ? "bg-green-500" : "bg-red-400"}`} />
                  </div>

                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-xs text-gray-400 mb-6">{plan.description}</p>

                  {/* Pricing Matrix */}
                  <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">Monthly Billing:</span>
                      <span className="text-gray-800 font-extrabold">₹{plan.monthlyPrice}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400">Quarterly Billing:</span>
                      <span className="text-gray-800 font-extrabold">₹{plan.quarterlyPrice}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-400 text-amber-600 font-bold">Yearly Billing (Save 20%+):</span>
                      <span className="text-amber-700 font-extrabold">₹{plan.yearlyPrice}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold pt-2 border-t border-dashed border-gray-200">
                      <span className="text-gray-400">Lifetime Option:</span>
                      <span className="text-gray-900 font-black">₹{plan.lifetimePrice}</span>
                    </div>
                  </div>

                  {/* Limits Checklist */}
                  <div className="space-y-3 mb-8">
                    <h4 className="text-xxs font-bold uppercase tracking-wider text-gray-400">Allocated Limits</h4>
                    <div className="grid grid-cols-2 gap-2 text-xxs font-bold text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Globe size={12} className="text-amber-500" />
                        <span>Properties: {plan.maxProperties}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ImageIcon size={12} className="text-amber-500" />
                        <span>Max Images: {plan.maxImagesPerProperty}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Video size={12} className="text-amber-500" />
                        <span>Max Videos: {plan.maxVideosPerProperty}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Bookmark size={12} className="text-amber-500" />
                        <span>Max Rooms: {plan.maxRoomListings}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Calendar size={12} className="text-amber-500" />
                        <span>Max Bookings / Month: {plan.maxBookingsPerMonth}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => handleEdit(plan)}
                    className="flex-1 py-3 border border-amber-200 hover:bg-amber-50 rounded-2xl text-xs font-bold text-amber-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit size={14} />
                    Modify plan
                  </button>
                  <button 
                    onClick={() => handleDelete(plan.id)}
                    className="h-12 w-12 border border-red-100 hover:bg-red-50 text-red-500 rounded-2xl flex items-center justify-center transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Editor Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl w-full max-w-4xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? "Modify Subscription Tier" : "Configure New Plan Levels"}
                  </h2>
                  <p className="text-xxs text-gray-400">Configure customizable feature flags, currency strikes, and direct support lines.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-extrabold text-gray-400 uppercase">Tier Title</label>
                    <input 
                      type="text" 
                      className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-extrabold text-gray-400 uppercase">Slug Identification (URL-ready)</label>
                    <input 
                      type="text" 
                      className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                      value={formData.slug}
                      onChange={e => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-")})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-extrabold text-gray-400 uppercase">Support Priority Level</label>
                    <select 
                      className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                      value={formData.supportPriority}
                      onChange={e => setFormData({...formData, supportPriority: e.target.value})}
                    >
                      <option value="NORMAL">Standard Resolution</option>
                      <option value="HIGH">Premium High Line</option>
                      <option value="VIP_PRIORITY">24/7 Dedicated Concierge Support</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-extrabold text-gray-400 uppercase">General Description</label>
                    <input 
                      type="text" 
                      className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-extrabold text-gray-400 uppercase">Dashboard Highlight Subtitle</label>
                    <input 
                      type="text" 
                      className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                      value={formData.shortDescription}
                      onChange={e => setFormData({...formData, shortDescription: e.target.value})}
                    />
                  </div>
                </div>

                {/* Pricing section */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-amber-500" />
                    Subscription Rates Configuration (₹ INR)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-gray-400">Monthly Fee</label>
                      <input 
                        type="number" 
                        className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                        value={formData.monthlyPrice}
                        onChange={e => setFormData({...formData, monthlyPrice: parseFloat(e.target.value || "0")})}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-gray-400">Quarterly Fee</label>
                      <input 
                        type="number" 
                        className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                        value={formData.quarterlyPrice}
                        onChange={e => setFormData({...formData, quarterlyPrice: parseFloat(e.target.value || "0")})}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-gray-400">Yearly Fee</label>
                      <input 
                        type="number" 
                        className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                        value={formData.yearlyPrice}
                        onChange={e => setFormData({...formData, yearlyPrice: parseFloat(e.target.value || "0")})}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-gray-400">Lifetime Premium Fee</label>
                      <input 
                        type="number" 
                        className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                        value={formData.lifetimePrice}
                        onChange={e => setFormData({...formData, lifetimePrice: parseFloat(e.target.value || "0")})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Limits section */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                    <Sliders size={14} className="text-amber-500" />
                    Property limits allocation
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-gray-400">Max Properties</label>
                      <input 
                        type="number" 
                        className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                        value={formData.maxProperties}
                        onChange={e => setFormData({...formData, maxProperties: parseInt(e.target.value || "1", 10)})}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-gray-400">Images/Property</label>
                      <input 
                        type="number" 
                        className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                        value={formData.maxImagesPerProperty}
                        onChange={e => setFormData({...formData, maxImagesPerProperty: parseInt(e.target.value || "10", 10)})}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-gray-400">Videos/Property</label>
                      <input 
                        type="number" 
                        className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                        value={formData.maxVideosPerProperty}
                        onChange={e => setFormData({...formData, maxVideosPerProperty: parseInt(e.target.value || "1", 10)})}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-gray-400">Max Rooms</label>
                      <input 
                        type="number" 
                        className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                        value={formData.maxRoomListings}
                        onChange={e => setFormData({...formData, maxRoomListings: parseInt(e.target.value || "5", 10)})}
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xxs font-bold text-gray-400">Bookings / Month</label>
                      <input 
                        type="number" 
                        className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                        value={formData.maxBookingsPerMonth}
                        onChange={e => setFormData({...formData, maxBookingsPerMonth: parseInt(e.target.value || "100", 10)})}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Feature flags & settings */}
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-amber-500" />
                    Entitlement feature toggles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    {[
                      { key: "featuredListing", label: "Featured Listing priority", icon: Star },
                      { key: "analyticsAccess", label: "Analytics Dashboard insights", icon: Sliders },
                      { key: "premiumSupport", label: "Dedicated Billing support", icon: RefreshCw },
                      { key: "whatsappInquiry", label: "Direct WhatsApp inquiries access", icon: MessageSquare },
                      { key: "aiContentGeneration", label: "AI hospitality concierge curators", icon: Zap },
                      { key: "priorityRanking", label: "Priority platform indexing", icon: Layers }
                    ].map(feat => (
                      <label key={feat.key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100/50 transition-all">
                        <input 
                          type="checkbox" 
                          className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                          checked={formData.featureFlags[feat.key as keyof typeof formData.featureFlags]}
                          onChange={e => setFormData({
                            ...formData,
                            featureFlags: {
                              ...formData.featureFlags,
                              [feat.key]: e.target.checked
                            }
                          })}
                        />
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                          <feat.icon size={14} className="text-amber-500" />
                          <span>{feat.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Badges, Order and Active statuses */}
                <div className="border-t border-gray-100 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-bold text-gray-400">Custom Badge Name (e.g. Best Deal)</label>
                    <input 
                      type="text" 
                      className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                      value={formData.customBadge}
                      onChange={e => setFormData({...formData, customBadge: e.target.value})}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xxs font-bold text-gray-400">Display Order Rank</label>
                    <input 
                      type="number" 
                      className="h-11 px-4 bg-gray-50 rounded-xl border-none text-xs font-semibold outline-none"
                      value={formData.displayOrder}
                      onChange={e => setFormData({...formData, displayOrder: parseInt(e.target.value || "0", 10)})}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-4">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                        checked={formData.isFeatured}
                        onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                      />
                      <span className="text-xs font-bold text-gray-700">Featured Tier highlighting</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="h-5 w-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500/20"
                        checked={formData.isActive}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <span className="text-xs font-bold text-gray-700">Set active instantly</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={saving}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-200 rounded-xl text-xs font-bold text-white transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5"
                  >
                    {saving && <RefreshCw size={12} className="animate-spin" />}
                    Save Subscription Plan
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

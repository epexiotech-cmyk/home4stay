"use client";

import React, { useState, useEffect } from "react";
import { Utensils, Plus, Trash2, Edit, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PACKAGES = [
  { code: "BREAKFAST_ONLY", name: "Breakfast Only", description: "Breakfast included" },
  { code: "LUNCH_ONLY", name: "Lunch Only", description: "Lunch included" },
  { code: "DINNER_ONLY", name: "Dinner Only", description: "Dinner included" },
  { code: "BREAKFAST_DINNER", name: "Breakfast & Dinner", description: "Breakfast + Dinner included" },
  { code: "BREAKFAST_LUNCH_DINNER", name: "Breakfast, Lunch & Dinner", description: "All meals included" },
  { code: "MEAL_NOT_INCLUDED", name: "Meal Not Included", description: "No meals included" },
];

export default function PartnerMealPlansPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  
  // Modals
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customForm, setCustomForm] = useState({
    id: "",
    name: "",
    mealType: "VEG",
    price: "",
    description: "",
    breakfast: false,
    lunch: false,
    dinner: false,
    isActive: true,
  });

  // State for inline edit of predefined packages
  const [editingPredefined, setEditingPredefined] = useState<{ mealType: string, code: string, action: "ACTIVATE" | "EDIT" } | null>(null);
  const [editPrice, setEditPrice] = useState<string>("");
  const [savingPredefined, setSavingPredefined] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/property/meal-plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getPlan = (mealType: string, code: string) => {
    return plans.find((x) => x.mealType === mealType && x.packageCode === code);
  };

  const savePredefined = async (mealType: string, code: string, isActive: boolean, priceString: string) => {
    const pkgName = PACKAGES.find(pkg => pkg.code === code)?.name;
    
    if (isActive) {
      if (priceString === "" || priceString === undefined || priceString === null) {
        alert("Please enter a price for " + pkgName + ".");
        return;
      }
      const pNum = parseFloat(priceString);
      if (isNaN(pNum) || pNum < 0) {
        alert("Please enter a valid price for " + pkgName + ".");
        return;
      }
    }

    const price = isActive ? parseFloat(priceString) : undefined;
    
    setSavingPredefined(`${mealType}-${code}`);
    try {
      const res = await fetch("/api/property/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType,
          packageCode: code,
          isActive,
          price,
        })
      });
      if (!res.ok) {
        throw new Error("Failed to save");
      }
      await fetchPlans();
      setEditingPredefined(null);
    } catch (e) {
      console.error(e);
      alert("Failed to save package");
    } finally {
      setSavingPredefined(null);
    }
  };

  const handleCustomSave = async () => {
    if (!customForm.name || customForm.price === "") {
      alert("Name and Price are required.");
      return;
    }
    const priceNum = parseFloat(customForm.price);
    if (priceNum < 0) {
      alert("Price must be >= 0");
      return;
    }
    if (!customForm.breakfast && !customForm.lunch && !customForm.dinner) {
      alert("At least one meal must be selected.");
      return;
    }

    try {
      const inclusions = [];
      if (customForm.breakfast) inclusions.push("Breakfast");
      if (customForm.lunch) inclusions.push("Lunch");
      if (customForm.dinner) inclusions.push("Dinner");

      if (customForm.id) {
        // Edit
        await fetch(`/api/property/meal-plans/${customForm.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customForm.name,
            price: priceNum,
            description: customForm.description,
            inclusions,
            isActive: customForm.isActive,
          })
        });
      } else {
        // Create
        const res = await fetch("/api/property/meal-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: customForm.name,
            mealType: customForm.mealType,
            price: priceNum,
            description: customForm.description,
            inclusions,
            isActive: customForm.isActive,
          })
        });
        if (!res.ok) {
          const err = await res.json();
          alert(err.error || "Failed to create custom package.");
          return;
        }
      }
      setShowCustomModal(false);
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCustom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom package?")) return;
    try {
      const res = await fetch(`/api/property/meal-plans/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to delete package.");
      }
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  const renderPredefinedCard = (mealType: string, pkg: any) => {
    const plan = getPlan(mealType, pkg.code);
    const isActive = plan ? plan.isActive : false;
    const isEditing = editingPredefined?.mealType === mealType && editingPredefined?.code === pkg.code;
    const isSaving = savingPredefined === `${mealType}-${pkg.code}`;
    const priceDisplay = plan && plan.price !== null && plan.price !== undefined ? formatPrice(plan.price) : "";
    const rawPrice = plan && plan.price !== null && plan.price !== undefined ? plan.price.toString() : "";

    return (
      <div key={pkg.code} className="flex flex-col justify-between p-5 rounded-[16px] border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 relative">
        <div className="mb-4">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center text-[#0E5A75] dark:text-white mb-3">
            <Utensils size={16} />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            {pkg.name}
          </h3>
          <p className="text-xs text-gray-500">{pkg.description}</p>
        </div>

        {isEditing ? (
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-white/5">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {editingPredefined.action === "ACTIVATE" ? `Activate ${pkg.name}` : `Edit ${pkg.name}`}
            </h4>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Price per guest</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                <input
                  type="number"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-black/20 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0E5A75] outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setEditingPredefined(null)}
                disabled={isSaving}
                className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 dark:text-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => savePredefined(mealType, pkg.code, true, editPrice)}
                disabled={isSaving}
                className="flex-1 py-1.5 text-xs font-medium bg-[#0E5A75] hover:bg-[#0983B0] text-white rounded-lg transition"
              >
                {isSaving ? "Saving..." : editingPredefined.action === "ACTIVATE" ? "Activate" : "Save Rate"}
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                {isActive ? "Price" : "Previous Rate"}
              </p>
              <p className={cn("text-base font-semibold", isActive ? "text-[#0E5A75] dark:text-white" : "text-gray-400")}>
                {priceDisplay ? `${priceDisplay} / guest` : "Not set"}
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", isActive ? "bg-[#159665]" : "bg-gray-300 dark:bg-gray-600")} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {isActive ? (
                <>
                  <button 
                    onClick={() => {
                      setEditPrice(rawPrice);
                      setEditingPredefined({ mealType, code: pkg.code, action: "EDIT" });
                    }}
                    className="flex-1 py-1.5 text-xs font-medium text-[#0E5A75] bg-[#0E5A75]/10 hover:bg-[#0E5A75]/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 rounded-lg transition"
                  >
                    Edit Rate
                  </button>
                  <button 
                    onClick={() => savePredefined(mealType, pkg.code, false, rawPrice)}
                    disabled={isSaving}
                    className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition"
                  >
                    Deactivate
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setEditPrice(rawPrice);
                    setEditingPredefined({ mealType, code: pkg.code, action: "ACTIVATE" });
                  }}
                  className="w-full py-1.5 text-xs font-medium bg-gray-900 text-white dark:bg-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition"
                >
                  Activate
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0E5A75]"></div>
      </div>
    );
  }

  const customPlans = plans.filter(p => !p.packageCode);

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0F1115] pb-20 select-none">
      <div className="max-w-5xl mx-auto px-6 pt-10 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-1">
              Meal Plans
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure dining packages and pricing for your property.
            </p>
          </div>
          <button
            onClick={() => {
              setCustomForm({ id: "", name: "", mealType: "VEG", price: "", description: "", breakfast: false, lunch: false, dinner: false, isActive: true });
              setShowCustomModal(true);
            }}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 text-white text-sm font-medium rounded-lg transition flex items-center gap-2 w-max"
          >
            <Plus size={16} /> Custom Package
          </button>
        </div>

        {/* VEG Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Vegetarian</h2>
            <p className="text-xs text-gray-500">Standard dining packages</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PACKAGES.map((pkg) => renderPredefinedCard("VEG", pkg))}
          </div>
        </div>

        {/* NON-VEG Section */}
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Non-Vegetarian</h2>
            <p className="text-xs text-gray-500">Standard dining packages</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PACKAGES.map((pkg) => renderPredefinedCard("NON_VEG", pkg))}
          </div>
        </div>

        {/* Custom Packages Section */}
        <div className="space-y-4 pt-8 border-t border-gray-200 dark:border-white/10">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest">Custom Packages</h2>
          </div>

          {customPlans.length === 0 ? (
            <div className="p-6 rounded-[16px] border border-dashed border-gray-300 dark:border-white/20 bg-gray-50/50 dark:bg-white/5 flex flex-col items-center justify-center text-center">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">No custom packages yet</p>
              <button
                onClick={() => {
                  setCustomForm({ id: "", name: "", mealType: "VEG", price: "", description: "", breakfast: false, lunch: false, dinner: false, isActive: true });
                  setShowCustomModal(true);
                }}
                className="px-3 py-1.5 text-xs font-medium border border-gray-300 dark:border-white/20 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition"
              >
                + Add Custom Package
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {customPlans.map(p => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[12px] border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20">
                  <div className="mb-3 sm:mb-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{p.name}</h4>
                    <p className="text-xs text-gray-500 font-medium mb-1">{p.mealType === "VEG" ? "Vegetarian" : "Non-Vegetarian"}</p>
                    <p className="text-xs text-gray-400">{Array.isArray(p.inclusions) ? p.inclusions.join(" • ") : ""}</p>
                  </div>
                  
                  <div className="flex flex-col sm:items-end gap-2">
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatPrice(p.price)} / guest</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={cn("w-1.5 h-1.5 rounded-full", p.isActive ? "bg-[#159665]" : "bg-gray-300")} />
                        <span className="text-xs font-medium text-gray-600">{p.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCustomForm({
                            id: p.id,
                            name: p.name,
                            mealType: p.mealType,
                            price: p.price.toString(),
                            description: p.description || "",
                            breakfast: Array.isArray(p.inclusions) && p.inclusions.includes("Breakfast"),
                            lunch: Array.isArray(p.inclusions) && p.inclusions.includes("Lunch"),
                            dinner: Array.isArray(p.inclusions) && p.inclusions.includes("Dinner"),
                            isActive: p.isActive
                          });
                          setShowCustomModal(true);
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-medium text-gray-700 dark:text-gray-300 rounded-md transition"
                      >
                        Edit
                      </button>
                      <button onClick={() => deleteCustom(p.id)} className="px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-xs font-medium text-red-600 rounded-md transition">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-[16px] w-full max-w-md shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {customForm.id ? "Edit Custom Package" : "Create Custom Package"}
              </h3>
              <button onClick={() => setShowCustomModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Package Name *</label>
                <input 
                  type="text" 
                  value={customForm.name} 
                  onChange={(e) => setCustomForm({...customForm, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0E5A75] outline-none"
                  placeholder="e.g. Traditional Thali"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Meal Type *</label>
                <select
                  value={customForm.mealType}
                  onChange={(e) => setCustomForm({...customForm, mealType: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0E5A75] outline-none"
                >
                  <option value="VEG">Vegetarian</option>
                  <option value="NON_VEG">Non-Vegetarian</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Included Meals *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={customForm.breakfast} onChange={(e) => setCustomForm({...customForm, breakfast: e.target.checked})} className="w-3.5 h-3.5 rounded-sm border-gray-300 text-gray-900 focus:ring-gray-900" /> 
                    <span className="text-sm text-gray-700 dark:text-gray-300">Breakfast</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={customForm.lunch} onChange={(e) => setCustomForm({...customForm, lunch: e.target.checked})} className="w-3.5 h-3.5 rounded-sm border-gray-300 text-gray-900 focus:ring-gray-900" /> 
                    <span className="text-sm text-gray-700 dark:text-gray-300">Lunch</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={customForm.dinner} onChange={(e) => setCustomForm({...customForm, dinner: e.target.checked})} className="w-3.5 h-3.5 rounded-sm border-gray-300 text-gray-900 focus:ring-gray-900" /> 
                    <span className="text-sm text-gray-700 dark:text-gray-300">Dinner</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Price per guest *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input 
                    type="number" 
                    value={customForm.price} 
                    onChange={(e) => setCustomForm({...customForm, price: e.target.value})}
                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0E5A75] outline-none"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Description (Optional)</label>
                <input 
                  value={customForm.description} 
                  onChange={(e) => setCustomForm({...customForm, description: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black/20 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-[#0E5A75] outline-none"
                  placeholder="Describe what's included..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isActiveToggle"
                  checked={customForm.isActive} 
                  onChange={(e) => setCustomForm({...customForm, isActive: e.target.checked})} 
                  className="w-4 h-4 rounded-sm border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-medium text-gray-800 dark:text-gray-200 cursor-pointer select-none">
                  Available to guests
                </label>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 flex justify-end gap-2">
              <button 
                onClick={() => setShowCustomModal(false)} 
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleCustomSave} 
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-100 transition"
              >
                {customForm.id ? "Save Changes" : "Create Package"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

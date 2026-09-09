"use client";

import React, { useState, useEffect } from "react";
import { Utensils, Plus, Save, Trash2, Edit } from "lucide-react";
import { PREDEFINED_PACKAGES } from "@/lib/services/propertyMealPlanService"; // We will fetch it from a shared constant or just redefine the labels locally to avoid client/server issues. 

// Actually I'll just redefine predefined packages in the client file.
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
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  // Modals
  const [showCustomModal, setShowCustomModal] = useState<"VEG" | "NON_VEG" | null>(null);
  const [customForm, setCustomForm] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    breakfast: false,
    lunch: false,
    dinner: false,
    isActive: true,
  });

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

  const getPredefinedIsActive = (mealType: string, code: string) => {
    const p = plans.find((x) => x.mealType === mealType && x.packageCode === code);
    return p ? p.isActive : false;
  };

  const getPredefinedPrice = (mealType: string, code: string): string => {
    const plan = plans.find(
      (item) =>
        item.mealType === mealType &&
        item.packageCode === code
    );

    return plan && plan.price !== undefined && plan.price !== null ? String(plan.price) : "";
  };

  const setPredefinedPrice = (
    mealType: string,
    code: string,
    value: string
  ) => {
    setPlans((current) =>
      current.map((item) =>
        item.mealType === mealType && item.packageCode === code
          ? { ...item, price: value }
          : item
      )
    );
  };

  const togglePredefined = (mealType: string, code: string) => {
    setPlans((prev) => {
      const existing = prev.find((x) => x.mealType === mealType && x.packageCode === code);
      if (existing) {
        return prev.map((x) => (x.id === existing.id ? { ...x, isActive: !x.isActive } : x));
      } else {
        return [...prev, { id: `temp-${Date.now()}`, mealType, packageCode: code, isActive: true }];
      }
    });
  };

  const savePredefined = async (mealType: string) => {
    try {
      const relevant = plans.filter((x) => x.mealType === mealType && x.packageCode);
      
      for (const p of relevant) {
        if (p.isActive) {
          if (p.price === "" || p.price === undefined || p.price === null) {
            const pkgName = PACKAGES.find(pkg => pkg.code === p.packageCode)?.name;
            alert("Please enter a price for " + pkgName + ".");
            return;
          }
          const pNum = parseFloat(p.price);
          if (isNaN(pNum) || pNum < 0) {
            const pkgName = PACKAGES.find(pkg => pkg.code === p.packageCode)?.name;
            alert("Please enter a valid price for " + pkgName + ".");
            return;
          }
        }
      }

      setSaving(true);
      
      // We will send upsert requests for all currently known statuses in the state
      const promises = relevant.map((p) => 
        fetch("/api/property/meal-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mealType,
            packageCode: p.packageCode,
            isActive: p.isActive,
            price: p.isActive ? parseFloat(p.price) : undefined,
          })
        })
      );
      
      await Promise.all(promises);
      await fetchPlans();
      alert(`Saved ${mealType} packages successfully!`);
    } catch (e) {
      console.error(e);
      alert("Failed to save packages");
    } finally {
      setSaving(false);
    }
  };

  const handleCustomSave = async () => {
    if (!customForm.name || !customForm.price) {
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
            price: priceNum,
            description: customForm.description,
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
            mealType: showCustomModal,
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
      setShowCustomModal(null);
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCustom = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom package?")) return;
    try {
      await fetch(`/api/property/meal-plans/${id}`, { method: "DELETE" });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  const renderPredefinedSection = (mealType: "VEG" | "NON_VEG") => {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-[#0E5A75] dark:text-white border-b border-[#0E5A75]/10 pb-2">
          {mealType === "VEG" ? "VEG MEAL PLANS" : "NON-VEG MEAL PLANS"}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PACKAGES.map((pkg) => {
            const isActive = getPredefinedIsActive(mealType, pkg.code);
            return (
              <div key={pkg.code} className="flex flex-col gap-2 p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => togglePredefined(mealType, pkg.code)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-[#159665] focus:ring-[#159665]"
                  />
                  <div>
                    <div className="font-bold text-[#0E5A75] dark:text-white">{pkg.name}</div>
                    <div className="text-sm text-[#0E5A75]/70 dark:text-white/70">{pkg.description}</div>
                  </div>
                </label>
                {isActive && (
                  <div className="ml-8 mt-2 flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0E5A75] dark:text-white whitespace-nowrap">Price per guest:</span>
                    <div className="relative w-full max-w-[150px]">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">?</span>
                      <input
                        type="number"
                        min="0"
                        value={getPredefinedPrice(mealType, pkg.code)}
                        onChange={(e) => setPredefinedPrice(mealType, pkg.code, e.target.value)}
                        placeholder="0"
                        className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-gray-300 dark:border-white/20 bg-white dark:bg-black/20 text-black dark:text-white focus:ring-2 focus:ring-[#159665] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Packages specific to this meal type */}
        {plans.filter(p => p.mealType === mealType && !p.packageCode).length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-[#0E5A75] dark:text-white mb-4">Custom {mealType} Packages</h3>
            <div className="space-y-3">
              {plans.filter(p => p.mealType === mealType && !p.packageCode).map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5">
                  <div>
                    <div className="font-bold text-[#0E5A75] dark:text-white flex items-center gap-2">
                      {p.name} {!p.isActive && <span className="text-xs bg-red-500/10 text-red-500 px-2 rounded-full">Inactive</span>}
                    </div>
                    <div className="text-sm text-[#0E5A75]/70 dark:text-white/70">
                      ₹{p.price} • {Array.isArray(p.inclusions) ? p.inclusions.join(", ") : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCustomForm({
                          id: p.id,
                          name: p.name,
                          price: p.price.toString(),
                          description: p.description || "",
                          breakfast: Array.isArray(p.inclusions) && p.inclusions.includes("Breakfast"),
                          lunch: Array.isArray(p.inclusions) && p.inclusions.includes("Lunch"),
                          dinner: Array.isArray(p.inclusions) && p.inclusions.includes("Dinner"),
                          isActive: p.isActive
                        });
                        setShowCustomModal(mealType);
                      }}
                      className="p-2 text-[#0E5A75] hover:bg-[#0E5A75]/10 rounded-lg dark:text-white"
                    >
                      <Edit size={16} />
                    </button>
                    <button onClick={() => deleteCustom(p.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => {
              setCustomForm({ id: "", name: "", price: "", description: "", breakfast: false, lunch: false, dinner: false, isActive: true });
              setShowCustomModal(mealType);
            }}
            className="text-sm font-bold text-[#0E5A75] dark:text-white flex items-center gap-1 hover:underline"
          >
            <Plus size={16} /> ADD CUSTOM {mealType} PACKAGE
          </button>
          
          <button
            onClick={() => savePredefined(mealType)}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#0E5A75] text-white text-sm font-bold shadow-xl hover:bg-[#0983B0] transition-all flex items-center gap-2"
          >
            <Save size={16} /> SAVE {mealType} MEAL PLANS
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-10 text-center">Loading meal plans...</div>;
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 select-none pb-20 max-w-5xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-premium rounded-[32px] border-white/20 shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#159665] bg-[#159665]/10 px-2.5 py-0.5 rounded-full">
            Concierge Dining
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0E5A75] dark:text-white mt-1">
            Meal Plans
          </h1>
          <p className="text-xs text-[#0E5A75]/70 dark:text-white/70 mt-0.5 max-w-lg leading-relaxed">
            Configure dining packages available with your accommodation.
          </p>
        </div>
      </div>

      <div className="space-y-16">
        {renderPredefinedSection("VEG")}
        {renderPredefinedSection("NON_VEG")}
      </div>

      {/* Custom Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#0E5A75] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">{customForm.id ? "Edit" : "Add"} Custom {showCustomModal} Package</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Package Name</label>
                <input 
                  disabled={!!customForm.id} 
                  type="text" 
                  value={customForm.name} 
                  onChange={(e) => setCustomForm({...customForm, name: e.target.value})}
                  className="w-full rounded-lg border-gray-300 p-2 text-black disabled:opacity-50"
                  placeholder="e.g. Kids Veg Meal"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold mb-1">Included Meals</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={customForm.breakfast} onChange={(e) => setCustomForm({...customForm, breakfast: e.target.checked})} /> Breakfast</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={customForm.lunch} onChange={(e) => setCustomForm({...customForm, lunch: e.target.checked})} /> Lunch</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={customForm.dinner} onChange={(e) => setCustomForm({...customForm, dinner: e.target.checked})} /> Dinner</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Price</label>
                <input 
                  type="number" 
                  value={customForm.price} 
                  onChange={(e) => setCustomForm({...customForm, price: e.target.value})}
                  className="w-full rounded-lg border-gray-300 p-2 text-black"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  value={customForm.description} 
                  onChange={(e) => setCustomForm({...customForm, description: e.target.value})}
                  className="w-full rounded-lg border-gray-300 p-2 text-black"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={customForm.isActive} onChange={(e) => setCustomForm({...customForm, isActive: e.target.checked})} />
                <label className="text-sm font-bold">Active</label>
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowCustomModal(null)} className="px-4 py-2 rounded-lg font-bold">Cancel</button>
              <button onClick={handleCustomSave} className="px-4 py-2 rounded-lg font-bold bg-[#159665] text-white">Save Package</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



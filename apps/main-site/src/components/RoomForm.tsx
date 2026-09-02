"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, IndianRupee, Users, Waves, BedDouble } from "lucide-react";

interface RoomFormProps {
  slug: string;
}

export default function RoomForm({ slug }: RoomFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    capacity: "2 Guests",
    view: "Mountain View",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/property/room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, ...formData }),
      });

      const result = await res.json();

      if (res.ok) {
        setFormData({ name: "", price: "", capacity: "2 Guests", view: "Mountain View" });
        router.refresh();
      } else {
        alert(result.message || "Failed to add room.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-premium rounded-[32px] border-white/20 p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-[#0983B0]/10 text-[#0983B0]">
          <BedDouble size={20} />
        </div>
        <div>
          <h2 className="text-xl font-black text-[#0E5A75] dark:text-white tracking-tight">Add New Suite Node</h2>
          <p className="text-[10px] text-[#0E5A75]/60 dark:text-white/50 uppercase tracking-widest font-bold">Configure physical spatial inventory</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60 ml-1 flex items-center gap-1.5">
             Name of Suite
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Royal Heritage Suite"
            className="w-full bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-[#0E5A75] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 focus:border-[#0E5A75] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60 ml-1 flex items-center gap-1.5">
            <IndianRupee size={10} /> Base Inventory Price
          </label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 12500"
            className="w-full bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-[#0E5A75] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 focus:border-[#0E5A75] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60 ml-1 flex items-center gap-1.5">
            <Users size={10} /> Standard Occupancy
          </label>
          <select
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="w-full bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-[#0E5A75] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 focus:border-[#0E5A75] transition-all appearance-none"
          >
            <option className="bg-white dark:bg-slate-900">1 Guest</option>
            <option className="bg-white dark:bg-slate-900">2 Guests</option>
            <option className="bg-white dark:bg-slate-900">3 Guests</option>
            <option className="bg-white dark:bg-slate-900">4 Guests</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60 ml-1 flex items-center gap-1.5">
            <Waves size={10} /> Spatial View Profile
          </label>
          <input
            type="text"
            required
            value={formData.view}
            onChange={(e) => setFormData({ ...formData, view: e.target.value })}
            placeholder="e.g. Mountain Panorama"
            className="w-full bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm font-medium text-[#0E5A75] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 focus:border-[#0E5A75] transition-all"
          />
        </div>

        <div className="md:col-span-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E5A75] hover:bg-[#0983B0] text-white font-black uppercase tracking-[0.2em] text-xs py-4 rounded-2xl shadow-xl shadow-[#0E5A75]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? "Committing to Postgres..." : "Push to Persistent Inventory"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PropertyForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        alert(`Property "${formData.name}" created successfully!`);
        setFormData({ name: "", location: "", price: "" });
        router.refresh(); // Refresh to show new property in list
      } else {
        alert(result.message || "Failed to create property.");
      }
    } catch (error) {
      console.error("Form error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-bold text-zinc-900 mb-6">Add New Property</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-900">Property Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Mountain View Villa"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:bg-zinc-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-900">Location</label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g. Manali, HP"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:bg-zinc-50"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-900">Base Price (₹)</label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 4500"
            disabled={loading}
            className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:bg-zinc-50"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-3 font-bold text-white transition hover:bg-zinc-800 mt-4 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Property Website"}
        </button>
      </form>
    </div>
  );
}

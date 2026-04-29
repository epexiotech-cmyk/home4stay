"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        alert("Room added successfully!");
        setFormData({ name: "", price: "", capacity: "2 Guests", view: "Mountain View" });
        router.refresh();
      } else {
        alert(result.message || "Failed to add room.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <h2 className="text-xl font-bold text-zinc-900 mb-6">Add New Room</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-900">Room Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Deluxe Mountain Room"
            className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-900">Price per night (₹)</label>
          <input
            type="number"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 3500"
            className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-900">Capacity</label>
          <select
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none"
          >
            <option>1 Guest</option>
            <option>2 Guests</option>
            <option>3 Guests</option>
            <option>4 Guests</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-zinc-900">View</label>
          <input
            type="text"
            required
            value={formData.view}
            onChange={(e) => setFormData({ ...formData, view: e.target.value })}
            placeholder="e.g. Sea View"
            className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-3 font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Room"}
        </button>
      </form>
    </div>
  );
}

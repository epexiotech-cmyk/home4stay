"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ImageFormProps {
  slug: string;
}

export default function ImageForm({ slug }: ImageFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    setLoading(true);

    try {
      const res = await fetch("/api/property/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, imageUrl }),
      });

      if (res.ok) {
        alert("Image added successfully!");
        setImageUrl("");
        router.refresh();
      } else {
        const result = await res.json();
        alert(result.message || "Failed to add image.");
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
      <h2 className="text-xl font-bold text-zinc-900 mb-6">Add Property Image</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-zinc-900">Image URL</label>
          <input
            type="url"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="mt-2 h-11 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 py-3 font-bold text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Image"}
        </button>
      </form>
    </div>
  );
}

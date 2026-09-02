"use client";

import React from "react";
import { CmsGalleryImage } from "./types";
import { Plus, Trash2 } from "lucide-react";

interface GalleryEditorProps {
  images?: CmsGalleryImage[];
  data?: { images?: CmsGalleryImage[] } | CmsGalleryImage[];
  onChange: (updatedImages: CmsGalleryImage[]) => void;
}

export default function GalleryEditor(props: GalleryEditorProps) {
  const { onChange } = props;
  const dataAsObj = props.data as { images?: CmsGalleryImage[] } | undefined;
  const images = Array.isArray(props.images)
    ? props.images
    : Array.isArray(dataAsObj?.images)
    ? dataAsObj?.images
    : Array.isArray(props.data)
    ? props.data as CmsGalleryImage[]
    : [];

  const categories = ["Living Room", "Bedrooms", "Bathrooms", "Exterior", "Pool"] as const;

  const handleAddImage = () => {
    const newImage: CmsGalleryImage = {
      id: crypto.randomUUID(),
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      category: "Exterior",
      caption: "Stunning frontal view of the property setting.",
    };
    onChange([...images, newImage]);
  };

  const handleUpdateImage = (id: string, updatedFields: Partial<CmsGalleryImage>) => {
    onChange(images.map((img: CmsGalleryImage) => (img.id === id ? { ...img, ...updatedFields } : img)));
  };

  const handleDeleteImage = (id: string) => {
    onChange(images.filter((img: CmsGalleryImage) => img.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Overview Status bar */}
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-[#0E5A75]/60 dark:text-white/50">
          Curated Gallery Collections ({images.length})
        </p>
        <button
          type="button"
          onClick={handleAddImage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E5A75]/10 dark:bg-white/10 text-[#0E5A75] dark:text-white text-xs font-black uppercase tracking-wider hover:bg-[#0E5A75] hover:text-white transition-all"
        >
          <Plus size={14} /> Add Gallery Asset
        </button>
      </div>

      {/* Grid mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((img: CmsGalleryImage) => (
          <div
            key={img.id}
            className="p-4 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 flex gap-3 items-start relative group"
          >
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-black/5 flex-shrink-0 border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-2.5">
              <div>
                <select
                  value={img.category}
                  onChange={(e) => handleUpdateImage(img.id, { category: e.target.value as CmsGalleryImage["category"] })}
                  className="w-full px-2 py-1 rounded-md border border-black/10 bg-white/80 dark:bg-black/40 text-[11px] font-black uppercase tracking-wider text-[#0983B0] outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={img.url}
                onChange={(e) => handleUpdateImage(img.id, { url: e.target.value })}
                placeholder="Image Source URL..."
                className="w-full px-2 py-1 rounded-md border border-black/10 bg-white/80 dark:bg-black/40 text-[10px] text-[#053344] dark:text-white outline-none"
              />

              <input
                type="text"
                value={img.caption}
                onChange={(e) => handleUpdateImage(img.id, { caption: e.target.value })}
                placeholder="Caption text..."
                className="w-full px-2 py-1 rounded-md border border-black/10 bg-white/80 dark:bg-black/40 text-xs font-medium text-[#053344] dark:text-white outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleDeleteImage(img.id)}
              className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-md transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

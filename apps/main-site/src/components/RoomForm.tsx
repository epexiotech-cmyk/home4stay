"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, IndianRupee, Users, Waves, BedDouble, Image as ImageIcon, X, UploadCloud, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface RoomFormInitialData {
  id: string;
  name: string;
  price: number;
  roomCount: number;
  capacity?: string;
  view?: string;
  images?: string[];
}
interface RoomFormProps {
  slug: string;
  initialData?: RoomFormInitialData | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function RoomForm({ slug, initialData, onSuccess, onCancel }: RoomFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);
  const isEditing = !!initialData || !!createdRoomId;
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    price: initialData?.price?.toString() || "",
    roomCount: initialData?.roomCount?.toString() || "1",
    capacity: initialData?.capacity || "2 Guests",
    view: initialData?.view || "Mountain View"
  });
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);
  const effectiveRoomId = initialData?.id || createdRoomId;

  const remainingSlots = 12 - existingImages.length;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (selectedFiles.length + files.length > remainingSlots) {
        alert(`Maximum of ${remainingSlots} more images allowed.`);
        return;
      }
      setSelectedFiles((prev) => [...prev, ...files].slice(0, remainingSlots));
    }
  };

  
  const handleDeleteImage = async (imageUrl: string) => {
    if (!effectiveRoomId || !confirm("Are you sure you want to delete this photo?")) return;
    
    setDeletingImage(imageUrl);
    try {
      const getRes = await fetch(`/api/property/room/${effectiveRoomId}/images`);
      if (!getRes.ok) throw new Error("Failed to fetch image details");
      const { data: assets } = await getRes.json();
      
      const asset = assets?.find((a: {url: string; id: string}) => a.url === imageUrl);
      if (!asset) throw new Error("Image not found in database");
      
      const res = await fetch(`/api/property/room/${effectiveRoomId}/images/${asset.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete image");
      
      setExistingImages(prev => prev.filter(img => img !== imageUrl));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete image";
      alert(errorMessage);
    } finally {
      setDeletingImage(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create or Update Room
      const url = "/api/property/room";
      const method = isEditing ? "PATCH" : "POST";
      const payload: Record<string, unknown> = { name: formData.name, price: Number(formData.price), roomCount: Number(formData.roomCount), capacity: formData.capacity, view: formData.view };
      if (isEditing) payload.id = effectiveRoomId;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.message || (isEditing ? "Failed to update room." : "Failed to add room."));
        setLoading(false);
        return;
      }

      const activeRoomId = effectiveRoomId || result.data?.id;
      if (!activeRoomId) {
        alert("Room was created, but no room ID was returned by the server.");
        setLoading(false);
        return;
      }

      if (!createdRoomId && !initialData?.id) {
        setCreatedRoomId(activeRoomId);
      }

      // 2. Upload Images if any
      if (selectedFiles.length > 0 && activeRoomId) {
        const imageFormData = new FormData();
        selectedFiles.forEach(file => {
          imageFormData.append("images", file);
        });

        const imageRes = await fetch(`/api/property/room/${activeRoomId}/images`, {
          method: "POST",
          body: imageFormData,
        });

        const imageResult = await imageRes.json();
        if (!imageRes.ok) {
          alert((isEditing ? "Room updated, but image upload failed: " : "Room created, but image upload failed: ") + (imageResult.error?.message || imageResult.message || "Unknown error"));
          setLoading(false);
          return; // DO NOT reset form if upload fails
        }
      }

      setFormData({ name: "", price: "", roomCount: "1", capacity: "2 Guests", view: "Mountain View" });
      setSelectedFiles([]);
      setCreatedRoomId(null);
      if (onSuccess) onSuccess(); else router.refresh();
      
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
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
          <h2 className="text-xl font-black text-[#0E5A75] dark:text-white tracking-tight">{isEditing ? "Edit Suite Node" : "Add New Suite Node"}</h2>
          <p className="text-[10px] text-[#0E5A75]/60 dark:text-white/50 uppercase tracking-widest font-bold">{isEditing ? "Update physical spatial inventory" : "Configure physical spatial inventory"}</p>
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

        {/* ROOM PHOTOS SECTION */}
        <div className="md:col-span-2 space-y-3 pt-2">
          <div className="p-5 border border-dashed border-white/30 dark:border-white/10 rounded-3xl bg-white/30 dark:bg-black/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-sm font-black text-[#0E5A75] dark:text-white flex items-center gap-2 tracking-tight">
                  <ImageIcon size={16} className="text-[#0983B0]" /> ROOM PHOTOS
                </h3>
                <p className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-white/50 uppercase tracking-widest mt-1">
                  Upload room photos • {existingImages.length + selectedFiles.length} / 12 photos
                </p>
                <p className="text-[9px] font-semibold text-[#0E5A75]/50 dark:text-white/40 mt-0.5">
                  Maximum 12 photos · Max 50 KB each (will be auto-compressed)
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={existingImages.length + selectedFiles.length >= 12}
                className="px-4 py-2 bg-[#0E5A75]/10 hover:bg-[#0E5A75]/20 text-[#0E5A75] dark:bg-white/10 dark:hover:bg-white/20 dark:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <UploadCloud size={14} /> Add Photos
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {(existingImages.length > 0 || selectedFiles.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                {existingImages.map((img, idx) => (
                  <div key={`exist-${idx}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/20">
                    <img src={img} alt="Existing" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <button type="button" onClick={() => handleDeleteImage(img)} disabled={deletingImage === img} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg">
                        {deletingImage === img ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
                  </div>
                ))}
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={12} />
                      </button>
                      <span className="text-[8px] font-bold text-white uppercase tracking-wider">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2 pt-4">
          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="w-full mb-3 bg-white/10 hover:bg-white/20 text-[#0E5A75] dark:text-white font-black uppercase tracking-widest text-xs py-4 rounded-2xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E5A75] hover:bg-[#0983B0] text-white font-black uppercase tracking-[0.2em] text-xs py-4 rounded-2xl shadow-xl shadow-[#0E5A75]/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? "Saving..." : (isEditing ? "Save Changes" : "Push to Persistent Inventory")}
          </button>
        </div>
      </form>
    </div>
  );
}

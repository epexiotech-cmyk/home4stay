"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin, Search, Loader2 } from "lucide-react";
import { NearbyPlaceFormModal, NearbyPlaceFormInitialData } from "@/components/nearby-places/NearbyPlaceFormModal";
import { cn } from "@/lib/utils";

interface NearbyPlace {
  id: string;
  name: string;
  category: string | null;
  distance: string | null;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function NearbyPlacesPage() {
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<NearbyPlace | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPlaces = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/property/nearby-places");
      if (res.ok) {
        const { data } = await res.json();
        setPlaces(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleSavePlace = async (formData: NearbyPlaceFormInitialData & { file?: File }) => {
    setIsSaving(true);
    try {
      const { file, ...placeData } = formData;
      const isEdit = !!editingPlace;
      const url = isEdit ? `/api/property/nearby-places/${editingPlace.id}` : "/api/property/nearby-places";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(placeData),
      });

      if (!res.ok) {
        const data = await res.json();
        const errorMsg = data.error?.message || data.message || "Failed to save place";
        throw new Error(errorMsg);
      }

      const { data: savedPlace } = await res.json();

      // Handle Image Upload if a file was selected
      if (file) {
        const imageFormData = new FormData();
        imageFormData.append("images", file);

        const imgRes = await fetch(`/api/property/nearby-places/${savedPlace.id}/image`, {
          method: "POST",
          body: imageFormData,
        });
        
        if (!imgRes.ok) {
          const errData = await imgRes.json().catch(() => ({}));
          const imgErrMsg = errData.error?.message || errData.message || "Failed to upload image.";
          alert("Saved place, but failed to upload image: " + imgErrMsg);
        }
      }

      await fetchPlaces();
      setIsModalOpen(false);
      setEditingPlace(null);
    } catch (err: unknown) {
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this nearby place?")) return;
    try {
      const res = await fetch(`/api/property/nearby-places/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchPlaces();
      } else {
        alert("Failed to delete nearby place.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/property/nearby-places/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      if (res.ok) {
        setPlaces(prev => prev.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPlaces = places.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#053344] p-8 rounded-[32px] shadow-sm border border-black/5 dark:border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#0E5A75]/10 dark:from-[#78D145]/10 to-transparent rounded-bl-full pointer-events-none" />
        <div className="relative z-10 space-y-2 max-w-2xl">
          <h1 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight flex items-center gap-3">
            <MapPin size={32} className="text-[#0983B0] dark:text-[#78D145]" />
            Nearby Places
          </h1>
          <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60 leading-relaxed">
            Show guests the places worth discovering around your property. Guide them to attractions, landmarks, and local experiences.
          </p>
        </div>
        <button
          onClick={() => { setEditingPlace(null); setIsModalOpen(true); }}
          className="relative z-10 shrink-0 bg-[#0E5A75] dark:bg-[#78D145] text-white dark:text-[#053344] px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-[#0E5A75]/20 dark:shadow-[#78D145]/20 flex items-center gap-3"
        >
          <Plus size={18} />
          <span>Add Place</span>
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 p-2 rounded-2xl border border-black/5 dark:border-white/5">
        <div className="flex-1 flex items-center gap-3 px-4 py-2 bg-white dark:bg-[#053344] rounded-xl shadow-sm">
          <Search size={18} className="text-[#0E5A75]/40 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search nearby places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm font-medium text-[#053344] dark:text-white placeholder:text-[#0E5A75]/40 dark:placeholder:text-white/40"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#0E5A75]/40 dark:text-white/40">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p className="text-xs font-bold uppercase tracking-widest">Loading Places...</p>
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-24 bg-white/30 dark:bg-white/5 rounded-[32px] border border-dashed border-[#0E5A75]/20 dark:border-white/10 flex flex-col items-center">
          <div className="w-20 h-20 bg-[#0E5A75]/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
            <MapPin size={32} className="text-[#0E5A75]/40 dark:text-[#78D145]/60" />
          </div>
          <h3 className="text-xl font-black text-[#053344] dark:text-white mb-2">No Places Added Yet</h3>
          <p className="text-[#0E5A75]/60 dark:text-white/60 text-sm max-w-sm mb-8">
            Help your guests explore the area. Add attractions, restaurants, and landmarks nearby.
          </p>
          <button
            onClick={() => { setEditingPlace(null); setIsModalOpen(true); }}
            className="bg-[#0E5A75] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity"
          >
            Add Your First Place
          </button>
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-24 text-[#0E5A75]/60 dark:text-white/60">
          <p>No places match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map(place => (
            <div key={place.id} className={cn(
              "group bg-white dark:bg-[#053344] rounded-[24px] overflow-hidden shadow-sm border transition-all duration-300 hover:shadow-xl flex flex-col h-full",
              place.isActive ? "border-black/5 dark:border-white/5" : "border-dashed border-black/20 dark:border-white/20 opacity-70"
            )}>
              <div className="aspect-[16/9] w-full bg-black/5 dark:bg-white/5 relative overflow-hidden">
                {place.imageUrl ? (
                  <img src={place.imageUrl} alt={place.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin size={32} className="text-black/10 dark:text-white/10" />
                  </div>
                )}
                {!place.isActive && (
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-white/80">
                    Inactive
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  {place.category && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0983B0] dark:text-[#78D145]">
                      {place.category}
                    </span>
                  )}
                  {place.category && place.distance && <span className="text-black/20 dark:text-white/20">•</span>}
                  {place.distance && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60">
                      {place.distance}
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-black text-[#053344] dark:text-white leading-tight mb-2 line-clamp-1">
                  {place.name}
                </h3>
                
                {place.description && (
                  <p className="text-xs text-[#0E5A75]/70 dark:text-white/60 line-clamp-2 leading-relaxed mb-6">
                    {place.description}
                  </p>
                )}

                <div className="mt-auto pt-4 flex items-center justify-between border-t border-black/5 dark:border-white/5">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingPlace(place); setIsModalOpen(true); }}
                      className="p-2 text-[#0E5A75] dark:text-white bg-[#0E5A75]/5 dark:bg-white/5 rounded-xl hover:bg-[#0E5A75]/10 dark:hover:bg-white/10 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(place.id, place.isActive)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors",
                        place.isActive 
                          ? "text-[#0E5A75] dark:text-white bg-[#0E5A75]/5 dark:bg-white/5 hover:bg-[#0E5A75]/10" 
                          : "bg-[#78D145] text-[#053344] hover:opacity-90 shadow-lg shadow-[#78D145]/20"
                      )}
                    >
                      {place.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                  <button
                    onClick={() => handleDelete(place.id)}
                    className="p-2 text-red-500 bg-red-500/5 rounded-xl hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <NearbyPlaceFormModal
          initialData={editingPlace}
          onClose={() => { setIsModalOpen(false); setEditingPlace(null); }}
          onSave={handleSavePlace}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { X, Minus, Plus, Star, Check } from "lucide-react";

export interface FilterState {
  priceRange: [number, number];
  propertyType: string[];
  guests: number;
  amenities: string[];
  rating: number | null;
}

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export default function FilterPanel({ isOpen, onClose, onApply, initialFilters }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen, initialFilters]);

  const togglePropertyType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      propertyType: prev.propertyType.includes(type)
        ? prev.propertyType.filter(t => t !== type)
        : [...prev.propertyType, type]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const cleared: FilterState = {
      priceRange: [1000, 10000],
      propertyType: [],
      guests: 1,
      amenities: [],
      rating: null
    };
    setFilters(cleared);
  };

  const filterCount = 
    (filters.propertyType.length > 0 ? 1 : 0) + 
    (filters.guests > 1 ? 1 : 0) + 
    (filters.amenities.length > 0 ? 1 : 0) + 
    (filters.rating !== null ? 1 : 0);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 z-[999] bg-black/85 backdrop-blur-md transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Centered Wide Modal (Horizontal Design) */}
      <div 
        className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-[95vw] max-w-[850px] max-h-[90vh] bg-[var(--card-solid)] rounded-[2.5rem] border border-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_100px_rgba(0,0,0,0.8)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[var(--text)] tracking-tight">Filters</h2>
            {filterCount > 0 && (
              <span className="bg-theme-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-theme-primary/20">
                {filterCount} Applied
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Grid Content */}
        <div className="overflow-y-auto px-8 py-10 custom-scrollbar max-h-[calc(90vh-160px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Left Column */}
            <div className="space-y-12">
              {/* Price Range */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-[var(--text)] uppercase tracking-[0.2em] opacity-50">Price Range</h3>
                <div className="space-y-6">
                  <input 
                    type="range" 
                    min="1000" 
                    max="10000" 
                    step="500"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [1000, parseInt(e.target.value)] }))}
                    className="w-full h-2 bg-[var(--border)] rounded-lg appearance-none cursor-pointer accent-theme-primary"
                  />
                  <div className="flex items-center justify-between bg-[var(--bg-secondary)] p-5 rounded-3xl border border-[var(--border)] shadow-inner">
                     <div className="text-center flex-1">
                        <p className="text-[10px] font-black text-[var(--text-subtle)] uppercase mb-1">Minimum</p>
                        <p className="text-lg font-black text-[var(--text)]">₹1,000</p>
                     </div>
                     <div className="h-6 w-px bg-[var(--border)] mx-4" />
                     <div className="text-center flex-1">
                        <p className="text-[10px] font-black text-[var(--text-subtle)] uppercase mb-1">Maximum</p>
                        <p className="text-lg font-black text-[var(--text)]">₹{filters.priceRange[1].toLocaleString()}</p>
                     </div>
                  </div>
                </div>
              </div>

              {/* Property Type */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-[var(--text)] uppercase tracking-[0.2em] opacity-50">Property Type</h3>
                <div className="flex flex-wrap gap-3">
                  {["Homestay", "Villa", "Budget Stay", "Resort"].map((type) => (
                    <button
                      key={type}
                      onClick={() => togglePropertyType(type)}
                      className={`px-6 py-3 rounded-2xl border text-sm font-bold transition-all duration-300 ${
                        filters.propertyType.includes(type)
                          ? "bg-theme-primary text-white border-theme-primary shadow-xl shadow-theme-primary/20 scale-105"
                          : "border-[var(--border)] text-[var(--text-muted)] hover:border-theme-primary hover:text-[var(--text)] bg-[var(--bg-secondary)]/30"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-12">
              {/* Guests */}
              <div className="space-y-6">
                <h3 className="text-xs font-black text-[var(--text)] uppercase tracking-[0.2em] opacity-50">Who&apos;s coming?</h3>
                <div className="flex items-center justify-between bg-[var(--bg-secondary)] p-5 rounded-3xl border border-[var(--border)] shadow-inner">
                  <div className="space-y-0.5">
                    <span className="text-sm font-black text-[var(--text)] block">Guests</span>
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">Including children</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, guests: Math.max(1, prev.guests - 1) }))}
                      className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--card)] transition-colors text-[var(--text)] shadow-sm active:scale-90"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-lg font-black w-6 text-center text-[var(--text)]">{filters.guests}</span>
                    <button 
                      onClick={() => setFilters(prev => ({ ...prev, guests: Math.min(16, prev.guests + 1) }))}
                      className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-[var(--card)] transition-colors text-[var(--text)] shadow-sm active:scale-90"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Amenities & Rating Grid */}
              <div className="grid grid-cols-1 gap-12">
                {/* Amenities */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-[var(--text)] uppercase tracking-[0.2em] opacity-50">Amenities</h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    {["WiFi", "Pool", "Parking", "AC"].map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => toggleAmenity(amenity)}
                        className="flex items-center gap-4 group text-left"
                      >
                        <div className={`w-6 h-6 rounded-lg border transition-all flex items-center justify-center ${
                          filters.amenities.includes(amenity)
                            ? "bg-theme-primary border-theme-primary text-white shadow-lg shadow-theme-primary/20"
                            : "border-[var(--border)] bg-[var(--bg-secondary)]/50 group-hover:border-theme-primary"
                        }`}>
                          {filters.amenities.includes(amenity) && <Check size={14} strokeWidth={4} />}
                        </div>
                        <span className={`text-sm font-bold transition-colors ${
                          filters.amenities.includes(amenity) ? "text-[var(--text)]" : "text-[var(--text-muted)] group-hover:text-[var(--text)]"
                        }`}>
                          {amenity}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-[var(--text)] uppercase tracking-[0.2em] opacity-50">Minimum Rating</h3>
                  <div className="flex gap-4">
                    {[4, 3].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setFilters(prev => ({ ...prev, rating: prev.rating === rating ? null : rating }))}
                        className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all duration-300 ${
                          filters.rating === rating
                            ? "bg-theme-primary/5 border-theme-primary shadow-sm"
                            : "border-[var(--border)] bg-[var(--bg-secondary)]/30 hover:bg-[var(--bg-secondary)]"
                        }`}
                      >
                        <Star 
                          size={16} 
                          className={filters.rating === rating ? "text-theme-primary fill-theme-primary" : "text-[var(--border)]"} 
                        />
                        <span className={`text-sm font-black ${filters.rating === rating ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                          {rating}+ Stars
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 border-t border-[var(--border)] bg-[var(--card-solid)] flex items-center justify-between gap-6">
          <button 
            onClick={handleClear}
            className="px-8 py-4 text-sm font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text)] hover:bg-[var(--bg-secondary)] rounded-2xl transition-all"
          >
            Clear All
          </button>
          <button 
            onClick={handleApply}
            className="flex-1 py-4 bg-theme-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-theme-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Show {filterCount > 0 ? "Results" : "All Properties"}
          </button>
        </div>
      </div>
    </>
  );
}

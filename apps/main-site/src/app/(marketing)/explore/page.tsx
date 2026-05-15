"use client";

import { useState, useMemo } from "react";
import { getAllProperties } from "@/properties-data";

import FilterPanel, { FilterState } from "@/components/FilterPanel";
import PropertyCard from "@/components/PropertyCard";
import { SlidersHorizontal } from "lucide-react";

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    priceRange: [1000, 10000],
    propertyType: [],
    guests: 1,
    amenities: [],
    rating: null
  });

  const properties = useMemo(() => getAllProperties(), []);

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      // 1. Tab-based Category Filter
      if (activeCategory !== "All" && p.type !== activeCategory) return false;

      // 2. Price Filter
      if (p.price > appliedFilters.priceRange[1]) return false;

      // 3. Property Type Filter (Multi-select)
      if (appliedFilters.propertyType.length > 0 && !appliedFilters.propertyType.includes(p.type)) return false;

      // 4. Rating Filter
      if (appliedFilters.rating && p.rating < appliedFilters.rating) return false;

      return true;
    });
  }, [properties, activeCategory, appliedFilters]);

  const activeFilterCount = 
    (appliedFilters.propertyType.length > 0 ? 1 : 0) + 
    (appliedFilters.guests > 1 ? 1 : 0) + 
    (appliedFilters.amenities.length > 0 ? 1 : 0) + 
    (appliedFilters.rating !== null ? 1 : 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-60 pb-20">
      <FilterPanel 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={setAppliedFilters}
        initialFilters={appliedFilters}
      />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-[var(--text)] tracking-tighter sm:text-7xl mb-6">
            Find your next <span className="text-primary italic">adventure</span>
          </h1>
          <p className="text-[var(--text-muted)] font-medium text-xl max-w-xl leading-relaxed">
            Browse through our curated collection of premium homestays, villas, and budget stays.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-16">
          {["All", "Homestay", "Villa", "Budget Stay"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`group flex items-center px-6 py-3 rounded-full border transition-all duration-500 shadow-sm ${
                activeCategory === category 
                  ? "bg-[var(--card)] border-theme-primary shadow-lg scale-105" 
                  : "border-[var(--border)] bg-[var(--bg-secondary)]/40 backdrop-blur-md text-[var(--text-muted)] hover:bg-[var(--card)] hover:shadow-lg hover:border-theme-primary"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 mr-2.5 ${
                activeCategory === category ? "bg-primary" : "bg-primary/40 group-hover:bg-primary"
              }`} />
              <span className={`text-sm font-bold ${activeCategory === category ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                {category}
              </span>
            </button>
          ))}
          
          <div className="ml-auto">
             <button 
                onClick={() => setIsFilterOpen(true)}
                className={`group flex items-center gap-2.5 px-6 py-3 rounded-full border transition-all duration-500 shadow-sm ${
                  activeFilterCount > 0
                    ? "bg-theme-primary text-white border-theme-primary shadow-lg scale-105"
                    : "border-[var(--border)] bg-[var(--bg-secondary)]/40 backdrop-blur-md text-[var(--text-muted)] hover:bg-[var(--card)] hover:shadow-lg hover:border-theme-primary"
                }`}
             >
                <SlidersHorizontal size={16} className={`transition-transform duration-500 group-hover:rotate-180 ${activeFilterCount > 0 ? "text-white" : "text-primary"}`} />
                <span className="text-sm font-bold">
                  Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
                </span>
             </button>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[600px]">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <PropertyCard key={property.slug} property={property} />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-8 text-5xl shadow-inner border border-[var(--border)]">🔍</div>
              <h3 className="text-2xl font-black text-[var(--text)] mb-3 tracking-tight">No matches found</h3>
              <p className="text-[var(--text-muted)] font-medium max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any properties matching your current filters. Try broadening your search or resetting filters.
              </p>
              <button 
                onClick={() => {
                  setAppliedFilters({ priceRange: [1000, 10000], propertyType: [], guests: 1, amenities: [], rating: null });
                  setActiveCategory("All");
                }}
                className="mt-10 px-10 py-4 bg-primary/10 text-primary font-black rounded-2xl hover:bg-primary/20 transition-all active:scale-95 shadow-sm"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

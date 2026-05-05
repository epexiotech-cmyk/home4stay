"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import OptimizedImage from "@/components/OptimizedImage";
import { getAllProperties } from "@/properties-data";
import { getPropertyUrl } from "@/lib/utils/domains";
import { SlidersHorizontal } from "lucide-react";
import FilterPanel, { FilterState } from "@/components/FilterPanel";

// Replaced hardcoded PROPERTIES with dynamic data from getAllProperties()

export default function HomePage() {
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
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <FilterPanel 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApply={setAppliedFilters}
        initialFilters={appliedFilters}
      />
      {/* SECTION 1: Hero */}
      <section className="bg-[var(--bg)] pt-60 pb-32 px-6 text-center overflow-hidden relative">
        {/* Abstract Background Blur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

        {/* Categories as floating bullet points */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 animate-in fade-in slide-in-from-top-10 duration-1000 delay-200 fill-mode-both">
          {["All", "Homestay", "Villa", "Budget Stay"].map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`group flex items-center px-5 py-2.5 rounded-full border transition-all duration-500 shadow-sm ${
                activeCategory === category 
                  ? "bg-[var(--bg)] border-theme-primary shadow-lg scale-105" 
                  : "border-[var(--border)] bg-[var(--bg)]/40 backdrop-blur-md text-[var(--text-muted)] hover:bg-[var(--bg)] hover:shadow-lg hover:border-theme-primary"
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

          <button
            onClick={() => setIsFilterOpen(true)}
            className={`group flex items-center px-6 py-2.5 rounded-full border transition-all duration-500 shadow-sm ml-2 ${
              activeFilterCount > 0
                ? "bg-theme-primary text-white border-theme-primary shadow-lg scale-105"
                : "border-[var(--border)] bg-[var(--bg)]/40 backdrop-blur-md text-[var(--text-muted)] hover:bg-[var(--bg)] hover:shadow-lg hover:border-theme-primary"
            }`}
          >
            <SlidersHorizontal size={14} className={`mr-2.5 transition-transform duration-500 group-hover:rotate-180 ${activeFilterCount > 0 ? "text-white" : "text-primary"}`} />
            <span className="text-sm font-bold">
              Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}
            </span>
          </button>
        </div>

        <div className="mx-auto max-w-[800px] animate-in fade-in slide-in-from-bottom-10 duration-1000 ease-out">
          <h1 className="text-5xl font-black tracking-tighter text-[var(--text)] sm:text-7xl leading-[1.1]">
            Find <span className="text-primary italic">your</span> perfect <span className="text-primary italic">stay.</span>
          </h1>
          <p className="mt-8 text-xl text-[var(--text-muted)] font-medium max-w-[600px] mx-auto leading-relaxed">
            Discover handpicked homestays, luxury villas, and authentic experiences tailored for your next journey.
          </p>
        </div>
      </section>

      {/* SECTION 2: Featured Properties */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-[var(--text)] tracking-tight">
              {activeFilterCount > 0 || activeCategory !== "All" ? "Matched Results" : "Featured Properties"}
            </h2>
            <p className="text-[var(--text-muted)] mt-1 font-medium">
              {filteredProperties.length} properties found matching your criteria
            </p>
          </div>
          <Link href="/explore" className="hidden sm:flex items-center gap-2 text-sm font-bold text-primary hover:underline underline-offset-4 transition-all">
            View all properties
            <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-h-[400px]">
          {filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <a key={property.slug} href={getPropertyUrl(property.slug)} className="group cursor-pointer animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-[var(--bg-secondary)] shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                <OptimizedImage 
                  src={property.image} 
                  alt={property.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 hover:text-red-500 transition-colors"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                <div className="absolute bottom-4 left-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  {property.type}
                </div>
              </div>
                <div className="mt-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[var(--text)] text-lg group-hover:text-theme-primary transition-colors">{property.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-black text-[var(--text)]">★</span>
                    <span className="text-sm font-bold text-[var(--text-muted)]">{property.rating}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-[var(--text-muted)] mb-3">{property.location}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-[var(--text)]">₹{property.price.toLocaleString("en-IN")}</span>
                  <span className="text-sm font-bold text-[var(--text-muted)]">/ night</span>
                </div>
              </div>
            </a>
          ))
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mb-8 text-5xl shadow-inner border border-[var(--border)]">🔍</div>
              <h3 className="text-2xl font-black text-[var(--text)] mb-3">No matches found</h3>
              <p className="text-[var(--text-muted)] font-medium max-w-sm mx-auto leading-relaxed">
                We couldn&apos;t find any properties matching your current filters. Try broadening your search.
              </p>
              <button 
                onClick={() => {
                  setAppliedFilters({ priceRange: [1000, 10000], propertyType: [], guests: 1, amenities: [], rating: null });
                  setActiveCategory("All");
                }}
                className="mt-10 px-8 py-3 bg-primary/10 text-primary font-black rounded-2xl hover:bg-primary/20 transition-all active:scale-95"
              >
                Reset all filters
              </button>
            </div>
        )}
        </div>

        <Link href="/explore" className="mt-16 block text-center w-full sm:hidden py-4 rounded-2xl border-2 border-gray-100 text-sm font-black text-gray-900 hover:bg-gray-50 transition-all">
          View all properties
        </Link>
      </section>

      {/* SECTION 3: CTA */}
      <section className="mx-auto w-[95vw] mb-20">
        <div className="relative overflow-hidden rounded-[3rem] bg-gray-900 px-8 py-20 text-center text-white shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1449156001533-cb3941e246ee?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center opacity-30" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-4xl font-black text-white sm:text-5xl tracking-tight">Own a property?</h2>
            <p className="mt-6 text-lg text-gray-300 font-medium leading-relaxed">
              Earn extra income by listing your home on Home4Stay. Reach thousands of travelers looking for authentic experiences.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-black rounded-full hover:bg-primary-dark hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                List Your Property
              </button>
              <button className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-md text-white font-black rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


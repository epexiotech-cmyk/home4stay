import React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Mountain, Landmark, Utensils, Coffee, Train, Plane, Map } from "lucide-react";

interface NearbyPlace {
  id: string;
  name: string;
  category: string | null;
  distance: string | null;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

interface NearbyPlacesProps {
  places?: NearbyPlace[];
}

const getCategoryIcon = (category: string | null) => {
  if (!category) return MapPin;
  const c = category.toLowerCase();
  if (c.includes("nature") || c.includes("hill")) return Mountain;
  if (c.includes("landmark")) return Landmark;
  if (c.includes("food") || c.includes("restaurant")) return Utensils;
  if (c.includes("cafe")) return Coffee;
  if (c.includes("transport") || c.includes("station")) return Train;
  if (c.includes("airport")) return Plane;
  return MapPin;
};

export function NearbyPlaces({ places }: NearbyPlacesProps) {
  // Only process active places
  const activePlaces = places?.filter(p => p.isActive) || [];

  if (activePlaces.length === 0) return null;

  const heroPlace = activePlaces[0];
  const secondaryPlaces = activePlaces.slice(1);

  return (
    <section className="py-20 md:py-32 relative overflow-hidden border-b border-[var(--border)]">
      <div className="container mx-auto px-4 md:px-8 max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* LEFT SIDE: Text + List */}
          <div className="flex flex-col pt-4 lg:pt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-px bg-[var(--text-subtle)]" />
              <h4 className="text-[11px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.2em]">
                NEARBY PLACES
              </h4>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--text)] tracking-tight leading-[1.15] mb-6">
              Explore the <br className="hidden md:block" /><span className="italic text-[var(--text-muted)]">surroundings.</span>
            </h2>
            
            <p className="text-base md:text-lg text-[var(--text-muted)] font-light leading-relaxed mb-12 max-w-md">
              Discover nearby attractions, landmarks and local experiences.
            </p>

            {/* SECONDARY PLACES LIST */}
            {secondaryPlaces.length > 0 && (
              <div className="flex flex-col gap-8">
                {secondaryPlaces.map((place) => {
                  const Icon = getCategoryIcon(place.category);
                  return (
                    <div 
                      key={place.id}
                      className="group flex gap-5 items-start"
                    >
                      <div className="w-12 h-12 rounded-full bg-[var(--text)]/5 flex items-center justify-center text-[var(--text-subtle)] group-hover:text-theme-primary group-hover:bg-[var(--text)]/10 transition-colors duration-300 shrink-0 mt-1">
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                      <div className="flex flex-col gap-1.5 w-full">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-xl md:text-2xl font-serif text-[var(--text)] group-hover:text-theme-primary transition-colors">
                            {place.name}
                          </h4>
                          {place.distance && (
                            <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-wider shrink-0 mt-2 bg-white/50 px-2 py-1 rounded-sm border border-[var(--border)]">
                              {place.distance}
                            </span>
                          )}
                        </div>
                        {place.category && (
                          <span className="text-[10px] font-bold text-[var(--text-subtle)] uppercase tracking-[0.15em]">
                            {place.category}
                          </span>
                        )}
                        {place.description && (
                          <p className="text-sm md:text-base text-[var(--text-muted)] font-light mt-1">
                            {place.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Featured Card */}
          <div className="flex flex-col w-full relative">
            <div className="relative group w-full flex flex-col rounded-2xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-[var(--border)]/30 transition-all duration-700 h-[600px] md:h-[700px] lg:h-[800px]">
              
              {/* Image container */}
              {heroPlace.imageUrl ? (
                <>
                  <div className="absolute inset-0 w-full h-full bg-[var(--text)]/5">
                    <img 
                      src={heroPlace.imageUrl} 
                      alt={heroPlace.name} 
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />
                </>
              ) : (
                <div className="absolute inset-0 w-full h-full bg-[var(--text)]/5 flex items-center justify-center border border-[var(--border)]/50">
                  <Map size={48} className="text-[var(--text-subtle)] opacity-20" />
                </div>
              )}

              {/* Text Content Block */}
              <div className={cn(
                "absolute bottom-0 left-0 w-full flex flex-col p-8 md:p-12 z-10",
                heroPlace.imageUrl ? "text-white" : "text-[var(--text)] bg-white/80 backdrop-blur-md border-t border-[var(--border)]/30"
              )}>
                <div className="flex items-center gap-4 mb-4">
                  {heroPlace.category && (
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full backdrop-blur-md",
                      heroPlace.imageUrl ? "bg-white/20 text-white" : "bg-[var(--text)]/10 text-[var(--text-subtle)]"
                    )}>
                      {heroPlace.category}
                    </span>
                  )}
                  {heroPlace.distance && (
                    <span className={cn(
                      "text-[11px] font-medium tracking-wider",
                      heroPlace.imageUrl ? "text-white/80" : "text-[var(--text-muted)]"
                    )}>
                      {heroPlace.distance}
                    </span>
                  )}
                </div>
                
                <h3 className={cn(
                  "text-4xl md:text-5xl font-serif mb-4 leading-tight",
                  heroPlace.imageUrl ? "text-white" : "text-[var(--text)]"
                )}>
                  {heroPlace.name}
                </h3>
                
                {heroPlace.description && (
                  <p className={cn(
                    "text-base md:text-lg font-light leading-relaxed max-w-lg line-clamp-3",
                    heroPlace.imageUrl ? "text-white/90" : "text-[var(--text-muted)]"
                  )}>
                    {heroPlace.description}
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

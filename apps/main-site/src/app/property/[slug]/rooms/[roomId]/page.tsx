import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users, Maximize2, Waves } from "lucide-react";
import { resolvePropertyContext } from "@/lib/tenant/contextResolver";
import { getValidImageUrl, DEFAULT_FALLBACK_IMAGE } from "@/lib/utils";
import MealPlans from "@/components/property/MealPlans";
import CustomizeStaySection from "@/components/property/CustomizeStaySection";
import RoomBookingSummary from "@/components/property/RoomBookingSummary";
import { Room } from "@/properties-data/types";

export default async function RoomDetailsPage({ params }: { params: Promise<{ slug: string; roomId: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const roomId = resolvedParams.roomId;
  const property = await resolvePropertyContext(slug);
  
  if (!property) {
    return notFound();
  }

  const room: any = property.rooms?.find((r: any) => r.id === roomId);

  if (!room || room.propertyId !== property.id || room.isActive === false) {
    return notFound();
  }

  const roomImages = Array.isArray(room.images) && room.images.length > 0 
    ? room.images 
    : [DEFAULT_FALLBACK_IMAGE];

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-32">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link href={`/property/${slug}`} className="inline-flex items-center gap-2 text-[var(--text-subtle)] hover:text-[var(--text)] transition-colors">
            <ArrowLeft size={16} />
            <span className="text-[11px] font-medium uppercase tracking-widest">Back to {property.name}</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          
          <div className="lg:col-span-2 space-y-16">
            
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {(room.tags || []).map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[10px] font-medium uppercase tracking-widest text-[var(--text)]">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-[var(--text)] tracking-tight mb-4">{room.name}</h1>
            </div>

            <div className="space-y-4">
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden bg-[var(--bg-secondary)]">
                <Image 
                  src={getValidImageUrl(roomImages[0]) || DEFAULT_FALLBACK_IMAGE}
                  alt={`${room.name} Primary Image`}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {roomImages.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {roomImages.slice(1, 5).map((imgUrl: string, idx: number) => (
                    <div key={idx} className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[var(--bg-secondary)] cursor-pointer hover:opacity-90 transition-opacity">
                      <Image 
                        src={getValidImageUrl(imgUrl) || DEFAULT_FALLBACK_IMAGE}
                        alt={`${room.name} Image ${idx + 2}`}
                        fill
                        className="object-cover"
                      />
                      {idx === 3 && roomImages.length > 5 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-medium tracking-widest">+{roomImages.length - 5} MORE</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <section className="space-y-8">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[var(--text)] border-y border-[var(--border)] py-6">
                {room.sizeSqFt && (
                  <div className="flex items-center gap-2">
                    <Maximize2 size={18} className="text-[var(--text-subtle)]" />
                    <span className="text-[13px] font-medium tracking-widest uppercase">{room.sizeSqFt} sq ft</span>
                  </div>
                )}
                {room.capacity && (
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-[var(--text-subtle)]" />
                    <span className="text-[13px] font-medium tracking-widest uppercase">{room.capacity}</span>
                  </div>
                )}
                {room.view && (
                  <div className="flex items-center gap-2">
                    <Waves size={18} className="text-[var(--text-subtle)]" />
                    <span className="text-[13px] font-medium tracking-widest uppercase">{room.view}</span>
                  </div>
                )}
              </div>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-[15px] font-light text-[var(--text-muted)] leading-relaxed">
                  {(room as any).description || "Experience unparalleled comfort in our signature accommodation. Designed with a perfect blend of local heritage and modern luxury, this space offers a serene retreat for discerning travelers."}
                </p>
              </div>

              {(room as any).amenities && (room as any).amenities.length > 0 && (
                <div>
                  <h3 className="text-xl font-serif mb-6 text-[var(--text)]">Room Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(room as any).amenities.map((amenity: string) => (
                      <div key={amenity} className="flex items-center gap-3 text-[var(--text-muted)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-theme-primary/60 shrink-0" />
                        <span className="text-[13px] font-medium tracking-wide">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {property.mealPlans && property.mealPlans.length > 0 && (
              <MealPlans plans={property.mealPlans} />
            )}

            <CustomizeStaySection propertyId={property.id as string} />
            
          </div>

          <div className="lg:col-span-1 relative">
            <RoomBookingSummary room={room} propertyId={property.id as string} />
          </div>

        </div>
      </div>
    </div>
  );
}
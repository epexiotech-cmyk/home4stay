import { NearbyPlaces } from "@/components/property/NearbyPlaces";
import crypto from "crypto";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getPropertyUrl, getSubdomain } from "@/lib/utils/domains";
import Gallery from "@/components/property/Gallery";
import BrandedHero from "@/components/property/BrandedHero";
import ContactSection from "@/components/property/ContactSection";
import ReviewsSection from "@/components/property/ReviewsSection";
import HostSection from "@/components/property/HostSection";
import RoomSelection from "@/components/property/RoomSelection";
import MealPlans from "@/components/property/MealPlans";
import CustomizeStaySection from "@/components/property/CustomizeStaySection";
import PolicyAndFAQSection from "@/components/property/PolicyAndFAQSection";
import FloatingBookingBar from "@/components/booking/FloatingBookingBar";
import { Star, Sparkles } from "lucide-react";
import NarrativeCardStack from "@/components/property/NarrativeCardStack";
import { ICON_MAP } from "@/lib/experiences-config";
import { resolvePropertyContext, getPropertyBranding } from "@/lib/tenant/contextResolver";
import { normalizeImages } from "@/lib/utils";
import { Metadata } from "next";
import { prisma } from "@/lib/database/prisma";
import { SubscriptionStatus } from "@prisma/client";

// types moved to contextResolver
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const property = await resolvePropertyContext(slug);

  if (!property) {
    return { title: "Property Not Found" };
  }


  // Redirect direct accesses of the generic route to the canonical subdomain
  const headersList = await headers();
  const host = headersList.get("host");
  
  // If no subdomain is present in the host, it's a direct generic access
  if (host && !getSubdomain(host)) {
    redirect(getPropertyUrl(property.slug || slug));
  }

  const branding = getPropertyBranding(property);
  const seo = branding.seo;

  // Prevent search engine indexing for non-LIVE properties (preview mode)
  const isLive = property.status === "LIVE";

  return {
    title: seo.title || `${property.name} | Home4Stay`,
    description: seo.description || property.tagline || property.description,
    keywords: seo.keywords || [],
    robots: isLive ? "index, follow" : "noindex, nofollow",
    openGraph: {
      title: seo.title || property.name,
      description: seo.description || property.tagline || property.description,
      images: [seo.ogImage || branding.heroBackground],
    },
  };
}

export default async function PropertyPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ slug: string }>,
  searchParams?: Promise<{ draft?: string }>
}) {
  const { slug } = await params;
  const sParams = await searchParams;
  const draftToken = sParams?.draft;
  
  // The slug is either passed directly or rewritten by middleware from the subdomain.
  const property = await resolvePropertyContext(slug, draftToken);

  if (!property || !property.name) {
    notFound();
  }

  // 1. PUBLIC VISIBILITY ENGINE + SECURE PREVIEW GATEWAY
  const isLive = property.status === "LIVE";
  if (!isLive && !draftToken) {
    notFound();
  }

  const branding = getPropertyBranding(property);

  // Fetch the latest subscription to evaluate grace states
  const subscription = await prisma.propertySubscription.findFirst({
    where: { propertyId: property.id },
    orderBy: { createdAt: "desc" }
  });

  const isGrace = subscription?.status === SubscriptionStatus.IN_GRACE_PERIOD;

  // Enforce image gallery limitations in grace period
  const normalizedImages = normalizeImages(property.images);
  const displayImages = isGrace
    ? (normalizedImages.length > 0 ? normalizedImages : [branding.heroBackground]).slice(0, 3)
    : (normalizedImages.length > 0 ? normalizedImages : [branding.heroBackground]);

  
  const rawGallery = Array.isArray(property.gallery) ? property.gallery : [];
  // Ensure we only pass valid objects with 'url'
  const validGallery = rawGallery.filter(item => item && typeof item === 'object' && typeof item.url === 'string' && item.url.trim() !== '');

  const displayGallery = isGrace
    ? validGallery.slice(0, 3)
    : validGallery;

  // Block premium inquiry channel if in grace period
  const activeWhatsapp = isGrace ? undefined : (branding.contact?.whatsapp || property.contact?.whatsapp);

  // Inject primary theme color into a safe style tag or inline it directly on wrappers
  const themeStyles = {
    "--brand-primary": branding.themeColor,
    "--brand-secondary": branding.theme.secondary,
    "--brand-accent": branding.theme.accent,
  } as React.CSSProperties;

  // --- BRANDED SUBDOMAIN VIEW (Cinematic Luxury) ---
  return (
    <>
      <div className="flex flex-col bg-[#FDF6F1] dark:bg-[#053344] relative" style={themeStyles}>
        
        {/* Grace Period Notification Banner */}
        {isGrace && (
          <div className="w-full bg-gradient-to-r from-amber-600/90 to-orange-600/90 backdrop-blur-md text-white py-3 px-6 text-center text-xs font-black uppercase tracking-[0.2em] shadow-lg border-b border-orange-500/30 flex items-center justify-center gap-2 z-50 animate-pulse">
            <Sparkles size={16} className="animate-spin duration-1000" />
            <span>Notice: Listing in Grace Period. Some media galleries and direct inquiry channels are restricted.</span>
          </div>
        )}

        {/* 1. Cinematic Hero */}
        <BrandedHero 
          name={branding.heroTitle || ""}
          image={branding.heroBackground}
          location={property.location || undefined}
          rating={property.rating || undefined}
          tagline={branding.heroTagline}
          phone={branding.contact?.phone || property.contact?.phone}
          whatsapp={activeWhatsapp || property.contact?.whatsapp}
        />

        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-10 lg:px-20">
          
          {/* 2. Narrative Section */}
          <section className="py-20 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center border-b border-[var(--border)]">
             <div className="space-y-8 animate-in fade-in duration-1000">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-px bg-[var(--text-subtle)]" />
                  <span className="text-[11px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.2em]">
                    {branding.narrativeLabel}
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--text)] tracking-tight leading-[1.15]">
                  {branding.narrativeHeading} <span className="italic text-[var(--text-muted)]">{branding.narrativeHighlight}</span>
                </h2>
                {property.description && (
                  <p className="text-lg md:text-xl text-[var(--text-muted)] font-light leading-relaxed">
                    {property.description}
                  </p>
                )}
             </div>
             {displayImages.length > 0 && (
             <div className="relative w-full">
                <NarrativeCardStack images={displayImages} />
             </div>
             )}
          </section>

          {/* 3. Gallery Section */}
          {validGallery.length > 0 && (
          <section id="gallery" className="py-20 md:py-32 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-12">
               <div className="max-w-2xl">
                 <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-[var(--text-subtle)]" />
                  <span className="text-[11px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.2em]">Visual Journey</span>
                </div>
                 <h2 className="text-4xl md:text-5xl font-serif text-[var(--text)] tracking-tight">An Editorial <span className="italic text-[var(--text-muted)]">Perspective.</span></h2>
               </div>
            </div>
            <Gallery images={displayImages} gallery={displayGallery} name={property.name} />
          </section>
          )}

          {/* 4. Amenities & Hospitality */}
          <section id="amenities" className="py-20 md:py-32 grid grid-cols-1 lg:grid-cols-3 gap-16 border-b border-[var(--border)]">
             <div className="lg:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-px bg-[var(--text-subtle)]" />
                  <span className="text-[11px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.2em]">Essentials</span>
                </div>
                <h3 className="text-4xl font-serif text-[var(--text)] tracking-tight mb-6">Curated <br/>Comforts</h3>
                <p className="text-base text-[var(--text-muted)] font-light leading-relaxed mb-10 max-w-sm">
                  We believe in invisible but impeccable service. Every amenity is selected to elevate your stay.
                </p>
             </div>
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {((property.amenities && property.amenities.length > 0) ? property.amenities : []).map((item: { icon: string; label: string; detail?: string }, idx: number) => {
                  const Icon = (ICON_MAP as Record<string, React.ComponentType<{ size?: number, strokeWidth?: number }>>)[item.icon] || Sparkles;
                  return (
                    <div key={`amenity-item-${idx}`} className="flex gap-5 group items-start">
                      <div className="w-12 h-12 flex items-center justify-center text-[var(--text)] group-hover:text-theme-primary transition-colors duration-300">
                        <Icon size={28} strokeWidth={1} />
                      </div>
                      <div className="pt-1">
                        <h4 className="text-base font-medium text-[var(--text)] mb-1">{item.label}</h4>
                        <p className="text-sm font-light text-[var(--text-subtle)]">{item.detail || "Luxury Standard"}</p>
                      </div>
                    </div>
                  );
                })}
             </div>
          </section>

          {/* 5. Immersive Room Selection */}
          <RoomSelection rooms={property.rooms} />

          {/* 6. Gastronomy / Meal Plans */}
          {property.mealPlans && property.mealPlans.length > 0 && (
            <MealPlans plans={property.mealPlans} />
          )}

          

          {/* 6.5. Nearby Places */}
          {property.nearbyPlaces && property.nearbyPlaces.length > 0 && (
            <NearbyPlaces places={property.nearbyPlaces} />
          )}

          {/* 7. Customize Stay (Concierge Upsell) */}
          <CustomizeStaySection propertyId={property.id} />

          {/* 7.5. Policies & FAQ */}
          <PolicyAndFAQSection faqs={property.faqs} policies={property.policies} />

          {/* 8. Reviews & Trust */}
          <section id="reviews" className="py-20 md:py-32 border-b border-[var(--border)]">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="flex justify-center mb-6">
                <div className="flex gap-1 text-[#FCBC43]">
                  {[...Array(5)].map((_, i) => <Star key={`sentiment-star-${i}`} size={20} fill="currentColor" strokeWidth={1} />)}
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-[var(--text)] tracking-tight mb-4">Guest Sentiments</h2>
              <p className="text-base text-[var(--text-muted)] font-light">Verified experiences from our global community.</p>
            </div>
            <ReviewsSection propertyId={property.id || ""} />
          </section>

          {/* 9. Host / Concierge Section */}
          {property.owner && (
            <section className="py-20 md:py-32 border-b border-[var(--border)]">
              <HostSection owner={property.owner} whatsapp={activeWhatsapp} />
            </section>
          )}

        </div>

        {/* 10. Contact / Footer-like Section */}
        <ContactSection 
           name={property.name}
           phone={branding.contact?.phone}
           whatsapp={activeWhatsapp}
        />
        
        {/* 11. Persistent Floating Booking Engine */}
        <FloatingBookingBar />
      </div>
    </>
  );
}

import { getProperty } from "@/properties-data";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Gallery from "@/components/property/Gallery";
import BrandedHero from "@/components/property/BrandedHero";
import ContactSection from "@/components/property/ContactSection";
import ReviewsSection from "@/components/property/ReviewsSection";
import HostSection from "@/components/property/HostSection";
import RoomSelection from "@/components/property/RoomSelection";
import MealPlans from "@/components/property/MealPlans";
import CustomizeStaySection from "@/components/property/CustomizeStaySection";
import FloatingBookingBar from "@/components/booking/FloatingBookingBar";
import { BookingProvider } from "@/context/BookingContext";
import { Star, Wifi, Car, Tv, Wind, Coffee, Utensils } from "lucide-react";
import { getSubdomain } from "@/lib/utils/domains";
import NarrativeCardStack from "@/components/property/NarrativeCardStack";
import { prisma } from "@/lib/database/prisma";
import { Property as BaselineProperty } from "@/properties-data/types";

interface Section {
  type: string;
  enabled: boolean;
  data?: {
    title?: string;
    subtitle?: string;
    backgroundImage?: string;
    mainHeading?: string;
    highlightText?: string;
    smallLabel?: string;
    [key: string]: unknown;
  };
}

interface ExtendedProperty extends Partial<BaselineProperty> {
  pageContent?: {
    sections?: Section[];
  };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Extract primary legacy data models as strong baseline mapping fallbacks
  const baselineProperty = getProperty(slug);
  
  // Extract persistent PostgreSQL record mapping real-time live site builder configurations
  let persistentDbRecord: Record<string, unknown> | null = null;
  try {
    persistentDbRecord = await prisma.property.findUnique({
      where: { slug },
    });
    // If exact slug miss, check by simulated ID pattern mapping
    if (!persistentDbRecord && slug === "shivay-resort") {
      persistentDbRecord = await prisma.property.findUnique({
        where: { id: "shivay-resort-101" },
      });
    }
  } catch (err) {
    console.error("Live DB lookup adapter query mapping fault:", err);
  }

  const property = { ...(baselineProperty || {}), ...(persistentDbRecord || {}) } as ExtendedProperty;

  if (!property || !property.name) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  
  // Domain detection for switching views
  getSubdomain(host);

  // Gracefully merge persistent CMS section block state layers onto interactive interfaces
  const sectionsArray: Section[] = property.pageContent?.sections || [];
  
  const heroBlock = sectionsArray.find((s: Section) => s.type === "hero" && s.enabled);
  const narrativeBlock = sectionsArray.find((s: Section) => s.type === "narrative" && s.enabled);

  // Fallback defaults mapped safely if decoupled records remain absent
  const heroTitleOverride = heroBlock?.data?.title || property.name;
  const heroTaglineOverride = heroBlock?.data?.subtitle || property.tagline;
  const heroBgOverride = heroBlock?.data?.backgroundImage || (property.images && property.images[0]) || "";

  const narrativeHeadingOverride = narrativeBlock?.data?.mainHeading || "A sanctuary of";
  const narrativeHighlightOverride = narrativeBlock?.data?.highlightText || "timeless luxury.";

  // --- BRANDED SUBDOMAIN VIEW (Cinematic Luxury) ---
  return (
    <BookingProvider>
      <div className="flex flex-col bg-[#FDF6F1] dark:bg-[#053344] relative">
        
        {/* 1. Cinematic Hero */}
        <BrandedHero 
          name={heroTitleOverride}
          image={heroBgOverride}
          location={property.location || "Mountain Highlands"}
          rating={property.rating || 4.9}
          tagline={heroTaglineOverride}
          phone={property.contact?.phone}
          whatsapp={property.contact?.whatsapp}
        />

        <div className="max-w-[1440px] mx-auto w-full px-6 md:px-10 lg:px-20">
          
          {/* 2. Narrative Section */}
          <section className="py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center border-b border-black/5 dark:border-white/5">
             <div className="space-y-10 animate-in fade-in duration-1000">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-px bg-[#0E5A75]" />
                  <span className="text-[10px] font-black text-[#0E5A75] uppercase tracking-[0.3em]">
                    {narrativeBlock?.data?.smallLabel || "The Narrative"}
                  </span>
                </div>
                <h2 className="text-6xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">
                  {narrativeHeadingOverride} <span className="text-[#0983B0]">{narrativeHighlightOverride}</span>
                </h2>
                <p className="text-xl text-[#0E5A75]/60 font-medium leading-relaxed italic">
                  &quot;{property.description || 'Curated settings tailored to blend exceptional environments with unparalleled hospitality excellence.'}&quot;
                </p>
                <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-[#0E5A75]">12+</p>
                    <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-[0.2em]">Luxury Experiences</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-[#0E5A75]">100%</p>
                    <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-[0.2em]">Privacy Guaranteed</p>
                  </div>
                </div>
             </div>
             <div className="relative w-full">
                <NarrativeCardStack images={property.images || [heroBgOverride]} />
             </div>
          </section>

          {/* 3. Gallery Section */}
          <section id="gallery" className="py-32 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-16">
               <div>
                 <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-px bg-[#159665]" />
                  <span className="text-[10px] font-black text-[#159665] uppercase tracking-[0.3em]">Cinematic Gallery</span>
                </div>
                 <h2 className="text-5xl font-black text-[#053344] dark:text-white tracking-tighter">Every Corner, <span className="text-[#159665]">a Masterpiece.</span></h2>
               </div>
            </div>
            <Gallery images={property.images || [heroBgOverride]} gallery={property.gallery || []} name={property.name} />
          </section>

          {/* 4. Amenities & Hospitality */}
          <section className="py-32 grid grid-cols-1 lg:grid-cols-3 gap-20 border-b border-black/5 dark:border-white/5">
             <div className="lg:col-span-1">
                <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight mb-8">Hospitality <br/>Essentials</h3>
                <p className="text-lg text-[#0E5A75]/60 font-medium mb-10">We believe in invisible but impeccable service. Every amenity is curated for your comfort.</p>
                <button className="px-10 py-4 rounded-2xl border-2 border-[#0E5A75]/20 text-[#0E5A75] text-[10px] font-black uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all">
                  View All 48 Amenities
                </button>
             </div>
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12">
                {[
                  { icon: <Wifi size={24} />, label: "High Speed Fiber Wi-Fi", detail: "Seamless connectivity for work or leisure." },
                  { icon: <Car size={24} />, label: "Private Secured Parking", detail: "Complimentary valet and secure parking." },
                  { icon: <Tv size={24} />, label: "Premium Entertainment", detail: "Netflix, Apple TV, and High-fidelity audio." },
                  { icon: <Wind size={24} />, label: "Climate Control", detail: "Individual temperature controls in each room." },
                  { icon: <Coffee size={24} />, label: "Gourmet Kitchen", detail: "Fully equipped with organic spices \u0026 teas." },
                  { icon: <Utensils size={24} />, label: "Private Dining", detail: "Personal chef available on request." },
                ].map((item, idx) => (
                  <div key={`amenity-item-${idx}`} className="flex gap-6 group">
                    <div className="w-16 h-16 bg-[#0E5A75]/5 rounded-2xl flex items-center justify-center text-[#0E5A75] group-hover:bg-[#0E5A75] group-hover:text-white transition-all duration-500 shadow-lg border border-black/5 dark:border-white/5">
                       {item.icon}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-[#053344] dark:text-white mb-1 group-hover:text-[#0E5A75] transition-colors">{item.label}</h4>
                      <p className="text-xs font-bold text-[#0E5A75]/40 uppercase tracking-widest">{item.detail}</p>
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {/* 5. Immersive Room Selection */}
          <RoomSelection />

          {/* 6. Gastronomy / Meal Plans */}
          <MealPlans />

          {/* 7. Customize Stay (Concierge Upsell) */}
          <CustomizeStaySection />

          {/* 8. Reviews & Trust */}
          <section id="reviews" className="py-32 border-b border-black/5 dark:border-white/5">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <div className="flex justify-center mb-6">
                <div className="flex gap-1 text-[#FCBC43]">
                  {[...Array(5)].map((_, i) => <Star key={`sentiment-star-${i}`} size={24} fill="currentColor" />)}
                </div>
              </div>
              <h2 className="text-5xl font-black text-[#053344] dark:text-white tracking-tighter mb-4">Guest Sentiments</h2>
              <p className="text-lg text-[#0E5A75]/60 font-medium italic">Verified experiences from our luxury global community.</p>
            </div>
            <ReviewsSection />
          </section>

          {/* 9. Host / Concierge Section */}
          {property.owner && (
            <section className="py-32 border-b border-black/5 dark:border-white/5">
              <HostSection owner={property.owner} whatsapp={property.contact?.whatsapp} />
            </section>
          )}

        </div>

        {/* 10. Contact / Footer-like Section */}
        <ContactSection 
           name={property.name}
           phone={property.contact?.phone}
           whatsapp={property.contact?.whatsapp}
        />
        
        {/* 11. Persistent Floating Booking Engine */}
        <FloatingBookingBar />
      </div>
    </BookingProvider>
  );
}

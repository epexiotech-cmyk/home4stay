import { getProperty } from "@/properties-data";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Gallery from "@/components/property/Gallery";
import BookingCard from "@/components/property/BookingCard";
import MobileBookingBar from "@/components/property/MobileBookingBar";
import BrandedHero from "@/components/property/BrandedHero";
import ContactSection from "@/components/property/ContactSection";
import SleepingArrangements from "@/components/property/SleepingArrangements";
import ReviewsSection from "@/components/property/ReviewsSection";
import HostSection from "@/components/property/HostSection";
import { Star, MapPin, Share, Heart, Home, ShieldCheck, Award, ChevronRight, Wifi, Car, Tv, Wind, Coffee, Utensils, Info } from "lucide-react";
import { getSubdomain } from "@/lib/utils/domains";
import Image from "next/image";
import OptimizedImage from "@/components/OptimizedImage";

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const property = getProperty(slug);

  if (!property) {
    notFound();
  }

  const headersList = await headers();
  const host = headersList.get("host") || "";
  
  // Domain detection for switching views
  const subdomainFromHost = getSubdomain(host);
  const isSubdomain = !!subdomainFromHost;

  // --- BRANDED SUBDOMAIN VIEW ---
  if (isSubdomain) {
    return (
      <div className="flex flex-col bg-[var(--bg)]">
        <BrandedHero 
          name={property.name}
          image={property.images[0]}
          location={property.location}
          rating={property.rating}
          tagline={property.tagline}
          phone={property.contact?.phone}
          whatsapp={property.contact?.whatsapp}
        />

        <div className="max-w-[1280px] mx-auto w-full px-6 md:px-10 lg:px-20">
          {/* Gallery Section */}
          <section id="gallery" className="py-24 border-b border-[var(--border)]">
            <div className="flex items-center justify-between mb-12">
               <div>
                 <h2 className="text-4xl font-black text-theme-primary tracking-tight mb-2">The Property</h2>
                 <p className="text-[var(--text-muted)] font-medium">Immerse yourself in the details of {property.name}</p>
               </div>
            </div>
            <Gallery images={property.images} gallery={property.gallery} name={property.name} />
          </section>

          {/* Details & Booking Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 py-24 border-b border-[var(--border)]">
             <div className="lg:col-span-2 space-y-16">
                <div>
                   <h2 className="text-3xl font-black text-theme-primary mb-8">Experience {property.type} Living</h2>
                   <p className="text-xl text-[var(--text-muted)]">
                      {property.description}. Located in the serene environment of {property.location}, our {property.type} provides a perfect blend of modern luxury and traditional hospitality. Every corner is designed to offer comfort and style.
                   </p>
                </div>

                <div id="amenities">
                   <h3 className="text-2xl font-black text-theme-primary mb-8">World-Class Amenities</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8">
                      {[
                        { icon: <Wifi size={24} />, label: "High Speed Fiber Wi-Fi" },
                        { icon: <Car size={24} />, label: "Private Secured Parking" },
                        { icon: <Tv size={24} />, label: "Premium Entertainment System" },
                        { icon: <Wind size={24} />, label: "Climate Control (AC/Heat)" },
                        { icon: <Coffee size={24} />, label: "Fully Equipped Kitchen" },
                        { icon: <Utensils size={24} />, label: "Private Outdoor Dining" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-5 text-[var(--text)] group cursor-pointer">
                          <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center text-[var(--text)] group-hover:bg-theme-primary group-hover:text-[var(--primary-foreground)] transition-all duration-300 shadow-sm border border-[var(--border)]">
                             {item.icon}
                          </div>
                          <span className="font-bold text-lg group-hover:text-theme-primary transition-colors">{item.label}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <SleepingArrangements arrangements={property.sleepingArrangements || []} />
                {property.owner && <HostSection owner={property.owner} whatsapp={property.contact?.whatsapp} />}
                <ReviewsSection />
             </div>

             <div className="lg:col-span-1">
                <BookingCard 
                  price={property.price} 
                  rating={property.rating} 
                  slug={slug} 
                />
             </div>
          </div>
        </div>

        <ContactSection 
           name={property.name}
           phone={property.contact?.phone}
           whatsapp={property.contact?.whatsapp}
        />
        
        <MobileBookingBar 
          price={property.price} 
          rating={property.rating} 
        />
      </div>
    );
  }

  // --- MARKETPLACE VIEW (Legacy / Main Domain) ---
  return (
    <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-20 py-8 mb-20">
      {/* HEADER SECTION */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-theme-primary mb-4 tracking-tight">{property.name}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <div className="flex items-center gap-1">
              <Star size={14} fill="currentColor" className="text-gray-900" />
              <span>{property.rating}</span>
            </div>
            <span className="text-gray-300">·</span>
            <span className="underline cursor-pointer hover:text-gray-900 transition-colors">12 reviews</span>
            <span className="text-gray-300 hidden md:inline">·</span>
            <div className="flex items-center gap-1 underline cursor-pointer hover:text-gray-900 transition-colors">
              <MapPin size={14} />
              <span>{property.location}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-bold underline hover:bg-gray-100 px-3 py-2 rounded-lg transition-all active:scale-95">
              <Share size={16} />
              <span>Share</span>
            </button>
            <button className="flex items-center gap-2 text-sm font-bold underline hover:bg-gray-100 px-3 py-2 rounded-lg transition-all active:scale-95">
              <Heart size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* GALLERY SECTION */}
      <Gallery images={property.images} gallery={property.gallery} name={property.name} />

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mt-12">
        {/* LEFT COLUMN: INFO & DETAILS */}
        <div className="lg:col-span-7">
          {/* Property Stats */}
          <div className="pb-8 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-theme-primary mb-1">
                  Entire {property.type} hosted by Rahul
                </h2>
                <div className="text-gray-600 font-medium">
                  16 guests · 5 bedrooms · 8 beds · 5.5 bathrooms
                </div>
              </div>
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 shadow-sm">
                <OptimizedImage 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
                  alt="Host" 
                  fill 
                  className="object-cover"
                  sizes="56px"
                />
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="py-8 border-b border-gray-200 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-1 bg-gray-50 rounded-lg">
                <Home size={28} className="text-gray-900" />
              </div>
              <div>
                <h3 className="font-bold text-theme-primary">Entire home</h3>
                <p className="text-gray-500 text-sm font-medium">You’ll have the villa to yourself.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-1 bg-gray-50 rounded-lg">
                <ShieldCheck size={28} className="text-gray-900" />
              </div>
              <div>
                <h3 className="font-bold text-theme-primary">Enhanced Security</h3>
                <p className="text-gray-500 text-sm font-medium">Equipped with modern security systems for your peace of mind.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-500/10 rounded-xl">
                <Award size={24} className="text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-theme-primary">Rahul is a Superhost</h3>
                <p className="text-[var(--text-muted)] text-sm font-medium">Superhosts are experienced, highly rated hosts committed to providing great stays.</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="py-8 border-b border-gray-200">
             <div className="bg-theme-primary/5 border border-theme-primary/10 rounded-2xl p-6 mb-8 flex items-start gap-4">
                <Info size={24} className="text-theme-primary mt-0.5" />
                <p className="text-sm font-bold text-gray-900 leading-snug">
                  Special Offer: Book for 7 days or more to get a 10% discount on the base price!
                </p>
             </div>
             <p className="text-gray-700 leading-relaxed mb-6 font-medium text-lg">
               {property.description}. Experience luxury and comfort in this stunning {property.type} located in the heart of {property.location}. This property offers breathtaking views and world-class amenities to ensure an unforgettable stay for you and your family.
             </p>
             <button className="flex items-center gap-1 font-bold underline text-gray-900 group decoration-2 underline-offset-4">
               Show more
               <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
             </button>
          </div>

          <SleepingArrangements arrangements={property.sleepingArrangements || []} />
          {property.owner && <HostSection owner={property.owner} whatsapp={property.contact?.whatsapp} />}
          <ReviewsSection />

          {/* Amenities */}
          <div className="py-10 border-b border-gray-200">
             <h2 className="text-2xl font-bold text-theme-primary mb-8">What this place offers</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6">
               {[
                 { icon: <Wifi size={24} />, label: "Fast wifi" },
                 { icon: <Car size={24} />, label: "Free parking on premises" },
                 { icon: <Tv size={24} />, label: "HDTV with Netflix" },
                 { icon: <Wind size={24} />, label: "Air conditioning" },
                 { icon: <Coffee size={24} />, label: "Kitchen" },
                 { icon: <Utensils size={24} />, label: "Private patio or balcony" },
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-4 text-gray-700 group cursor-pointer">
                   <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900 group-hover:bg-theme-primary group-hover:text-white transition-all shadow-sm border border-gray-100">
                     {item.icon}
                   </div>
                   <span className="font-medium text-lg group-hover:text-theme-primary transition-colors">{item.label}</span>
                 </div>
               ))}
             </div>
             <button className="mt-10 border-2 border-gray-900 rounded-xl px-8 py-3.5 font-bold text-gray-900 hover:bg-gray-50 transition-all active:scale-95">
               Show all 48 amenities
             </button>
          </div>

          {/* Map Placeholder */}
          <div className="py-12">
            <h2 className="text-2xl font-bold text-theme-primary mb-8">Where you&apos;ll be</h2>
            <div className="relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-gray-100 shadow-inner group">
               <OptimizedImage 
                 src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1200" 
                 alt="Map view" 
                 fill 
                 className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                 sizes="(max-width: 1200px) 100vw, 1200px"
               />
               <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                 <div className="bg-white px-6 py-3 rounded-full shadow-2xl font-bold text-gray-900 flex items-center gap-2 border border-gray-200">
                   <MapPin size={18} className="text-primary" />
                   View area guide
                 </div>
               </div>
            </div>
            <p className="mt-6 text-gray-900 font-bold text-lg">{property.location}</p>
            <p className="text-gray-600 mt-2 font-medium">Exactly location provided after booking.</p>
          </div>
        </div>

        {/* RIGHT COLUMN: BOOKING CARD */}
        <div className="lg:col-span-5">
          <BookingCard 
            price={property.price} 
            rating={property.rating} 
            slug={slug} 
          />
        </div>
      </div>

      {/* MOBILE BOOKING BAR */}
      <MobileBookingBar 
        price={property.price} 
        rating={property.rating} 
      />
    </div>
  );
}

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Grid, X, ChevronLeft, ChevronRight, Maximize2, Share2, Heart } from "lucide-react";
import { GalleryImage } from "@/properties-data/types";
import OptimizedImage from "@/components/OptimizedImage";

interface GalleryProps {
  images: string[];
  gallery?: GalleryImage[];
  name: string;
}

export default function Gallery({ images, gallery, name }: GalleryProps) {
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);

  // Fallback if gallery is not provided
  const processedGallery: GalleryImage[] = useMemo(() => {
    if (gallery && gallery.length > 0) return gallery;
    return images.map((url, idx) => ({
      url,
      category: idx === 0 ? "Exterior" : idx % 2 === 0 ? "Living Room" : "Bedrooms",
      description: `${name} - Image ${idx + 1}`
    }));
  }, [gallery, images, name]);

  // Images for carousel (excluding the first 3 used in the preview grid)
  const carouselImages = processedGallery.slice(3, 8); 

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const interval = setInterval(() => {
      setCarouselIdx((prev) => (prev + 1) % carouselImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const categories = ["All", ...Array.from(new Set(processedGallery.map(img => img.category)))];

  const filteredGallery = activeTab === "All" 
    ? processedGallery 
    : processedGallery.filter(img => img.category === activeTab);

  // Featured photos (first 5-6)
  const featuredPhotos = processedGallery.slice(0, 6);

  const openFullscreen = (idx: number) => {
    setFullscreenIdx(idx);
  };

  const closeFullscreen = () => {
    setFullscreenIdx(null);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (fullscreenIdx !== null) {
      setFullscreenIdx((fullscreenIdx + 1) % processedGallery.length);
    }
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (fullscreenIdx !== null) {
      setFullscreenIdx((fullscreenIdx - 1 + processedGallery.length) % processedGallery.length);
    }
  };

  // Prevent scroll when gallery is open
  useEffect(() => {
    if (showFullGallery) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [showFullGallery]);

  return (
    <div className="relative group">
      {/* PREMIUM SPLIT LAYOUT PREVIEW */}
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 h-auto md:h-[600px] lg:h-[700px] w-full animate-in fade-in duration-1000">
         {/* Left: Large Immersive Image (60%) */}
         <div 
            className="w-full md:w-[60%] h-[350px] md:h-full relative rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] group/main cursor-zoom-in"
            onClick={() => setShowFullGallery(true)}
         >
            <OptimizedImage
               src={processedGallery[0].url}
               alt={`${name} main`}
               fill
               className="object-cover transition-transform duration-1000 group-hover/main:scale-105"
               priority
               sizes="(max-width: 768px) 100vw, 60vw"
            />
            {/* Overlay Gradient & Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/main:opacity-80 transition-opacity duration-500" />
            <div className="absolute bottom-8 left-8 text-white z-10 translate-y-4 group-hover/main:translate-y-0 transition-transform duration-500">
               <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-3 inline-block border border-white/30">
                 {processedGallery[0].category}
               </span>
               <h3 className="text-3xl md:text-4xl font-black text-theme-primary tracking-tight">{name}</h3>
            </div>
         </div>

         {/* Right: Vertical Stack (40%) */}
         <div className="w-full md:w-[40%] flex flex-col gap-4 md:gap-6 h-[450px] md:h-full">
            {/* Image 2 (Taller) */}
            <div 
               className="flex-[3] relative rounded-3xl overflow-hidden shadow-lg group/stack cursor-zoom-in"
               onClick={() => setShowFullGallery(true)}
            >
               <OptimizedImage
                  src={processedGallery[1].url}
                  alt={`${name} preview 2`}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover/stack:scale-110"
                  sizes="(max-width: 768px) 100vw, 40vw"
               />
               <div className="absolute inset-0 bg-black/0 group-hover/stack:bg-black/20 transition-colors duration-500" />
               <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-0 group-hover/stack:opacity-100 transition-opacity duration-500 border border-white/30 shadow-xl">
                 {processedGallery[1].category}
               </div>
            </div>

            {/* Image 3 (Shorter) & Explore Button */}
            <div className="flex-[2] flex gap-4 md:gap-6">
               <div 
                 className="flex-1 relative rounded-3xl overflow-hidden shadow-lg group/stack cursor-zoom-in hidden sm:block"
                 onClick={() => setShowFullGallery(true)}
               >
                 <OptimizedImage
                    src={processedGallery[2].url}
                    alt={`${name} preview 3`}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover/stack:scale-110"
                    sizes="(max-width: 768px) 100vw, 20vw"
                 />
                 <div className="absolute inset-0 bg-black/0 group-hover/stack:bg-black/20 transition-colors duration-500" />
                 <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] opacity-0 group-hover/stack:opacity-100 transition-opacity duration-500 border border-white/30">
                   {processedGallery[2].category}
                 </div>
               </div>

               {/* Inline CTA Button block with Carousel */}
               <div 
                 className="flex-1 relative rounded-3xl overflow-hidden cursor-pointer group/cta hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] transition-all duration-500 bg-gray-900 hover:bg-theme-primary"
                 onClick={() => setShowFullGallery(true)}
               >
                 {/* Auto-playing Background Carousel */}
                 {carouselImages.map((img, idx) => (
                   <OptimizedImage
                      key={`carousel-img-${idx}`}
                      src={img.url}
                      alt={`Carousel preview ${idx}`}
                      fill
                      className={`object-cover transition-all duration-1000 ease-in-out ${
                         idx === carouselIdx ? "opacity-60 scale-105" : "opacity-0 scale-100"
                      }`}
                      sizes="(max-width: 768px) 100vw, 20vw"
                   />
                 ))}
                 
                 {/* Subtle Gradient Overlay for Text Readability */}
                 <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />
                 
                 {/* Content */}
                 <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between items-start z-10">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white mb-4 group-hover/cta:scale-110 group-hover/cta:rotate-12 transition-transform duration-500 shadow-xl">
                       <Grid size={24} />
                    </div>
                    <div>
                       <p className="text-white font-black text-xl md:text-2xl leading-none mb-3 drop-shadow-md">Explore<br/>Gallery</p>
                       <p className="text-white/80 text-xs md:text-sm font-bold flex items-center gap-1 uppercase tracking-widest drop-shadow-md">
                          {processedGallery.length} Photos 
                          <ChevronRight size={16} className="group-hover/cta:translate-x-2 transition-transform" />
                       </p>
                    </div>
                 </div>
               </div>
            </div>
         </div>
      </div>

      {/* FULL IMMERSIVE GALLERY MODAL */}
      {showFullGallery && (
        <div className="fixed inset-0 z-[1000] bg-[var(--bg)] animate-in slide-in-from-bottom-10 duration-500 flex flex-col h-screen w-screen overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 bg-[var(--bg)] z-50 px-6 md:px-12 py-4 flex items-center justify-between border-b border-[var(--border)]">
            <button 
              onClick={() => setShowFullGallery(false)}
              className="flex items-center gap-2 p-3 hover:bg-[var(--text)]/5 rounded-2xl transition-all group font-black text-sm text-[var(--text)]"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center gap-4">
               <button className="p-3 hover:bg-[var(--text)]/5 rounded-2xl transition-all text-[var(--text)]">
                  <Share2 size={20} />
               </button>
               <button className="p-3 hover:bg-[var(--text)]/5 rounded-2xl transition-all text-[var(--text)]">
                  <Heart size={20} />
               </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
             {/* Category Tabs */}
             <div className="sticky top-0 bg-[var(--bg)] z-40 px-6 md:px-12 py-6 border-b border-[var(--border)] flex items-center gap-2 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveTab(cat)}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-black transition-all ${
                      activeTab === cat 
                        ? "bg-[var(--text)] text-[var(--bg)] shadow-lg scale-105" 
                        : "bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--text)]/5"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
             </div>

             <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
                {/* Featured Photos Section */}
                {activeTab === "All" && (
                   <section className="mb-24">
                      <h2 className="text-3xl font-black text-theme-primary mb-2 tracking-tight">Featured Photos</h2>
                      <p className="text-[var(--text-muted)] font-medium mb-10">Handpicked highlights of {name}</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 md:gap-6 h-auto md:h-[600px]">
                         <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden cursor-zoom-in group/feat shadow-lg min-h-[300px]" onClick={() => openFullscreen(0)}>
                            <OptimizedImage src={featuredPhotos[0].url} alt="Featured" fill className="object-cover group-hover/feat:scale-105 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 50vw" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/feat:opacity-100 transition-opacity duration-500" />
                            <div className="absolute bottom-8 left-8 text-white opacity-0 group-hover/feat:opacity-100 translate-y-4 group-hover/feat:translate-y-0 transition-all duration-500">
                               <p className="text-sm font-black uppercase tracking-widest mb-2 text-white/70">Featured Highlight</p>
                               <p className="text-xl font-bold">{featuredPhotos[0].description}</p>
                            </div>
                         </div>
                         {featuredPhotos.slice(1, 5).map((img, idx) => (
                             <div key={idx} className="relative rounded-3xl overflow-hidden cursor-zoom-in group/feat shadow-md min-h-[150px] md:min-h-0" onClick={() => openFullscreen(idx + 1)}>
                                <OptimizedImage src={img.url} alt="Featured" fill className="object-cover group-hover/feat:scale-110 transition-transform duration-1000" sizes="(max-width: 768px) 100vw, 25vw" />
                               <div className="absolute inset-0 bg-black/0 group-hover/feat:bg-black/20 transition-colors duration-500" />
                            </div>
                         ))}
                      </div>
                   </section>
                )}

                {/* Main Gallery Editorial Grid */}
                <section>
                   {activeTab === "All" ? (
                      // When viewing all, group by category and start each with a large image
                      categories.filter(c => c !== "All").map((cat) => {
                        const categoryImages = processedGallery.filter(img => img.category === cat);
                        return (
                          <div key={cat} className="mb-24">
                            <div className="flex items-baseline gap-4 mb-10 border-b border-[var(--border)] pb-6">
                              <h2 className="text-3xl font-black text-[var(--text)] tracking-tight">{cat}</h2>
                              <span className="text-[var(--text-muted)] font-bold">{categoryImages.length} photos</span>
                            </div>
                            <EditorialGrid images={categoryImages} name={name} openFullscreen={(idx) => {
                               const originalIdx = processedGallery.findIndex(g => g.url === categoryImages[idx].url);
                               openFullscreen(originalIdx);
                            }} />
                          </div>
                        );
                      })
                   ) : (
                      // When viewing a single category
                      <div className="mb-24">
                        <div className="flex items-baseline gap-4 mb-10 border-b border-[var(--border)] pb-6">
                          <h2 className="text-3xl font-black text-[var(--text)] tracking-tight">{activeTab}</h2>
                          <span className="text-[var(--text-muted)] font-bold">{filteredGallery.length} photos</span>
                        </div>
                        <EditorialGrid images={filteredGallery} name={name} openFullscreen={(idx) => {
                           const originalIdx = processedGallery.findIndex(g => g.url === filteredGallery[idx].url);
                           openFullscreen(originalIdx);
                        }} />
                      </div>
                   )}
                </section>
             </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {fullscreenIdx !== null && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300">
           {/* Top Bar */}
           <div className="px-8 py-6 flex items-center justify-between text-white z-10">
              <span className="font-black tracking-widest text-sm opacity-60">
                 {fullscreenIdx + 1} / {processedGallery.length}
              </span>
              <button 
                onClick={closeFullscreen}
                className="p-3 hover:bg-white/10 rounded-full transition-all active:scale-90"
              >
                <X size={24} />
              </button>
           </div>

           {/* Main Image Area */}
           <div className="flex-1 relative flex items-center justify-center p-4 md:p-12 overflow-hidden" onClick={closeFullscreen}>
              <div 
                className="relative max-w-full max-h-full aspect-[3/2] w-full max-w-6xl animate-in zoom-in-95 duration-500"
                onClick={(e) => e.stopPropagation()}
              >
                 <OptimizedImage
                    src={processedGallery[fullscreenIdx].url}
                    alt="Fullscreen"
                    fill
                    className="object-contain"
                    priority
                    sizes="100vw"
                 />
              </div>

              {/* Navigation Arrows */}
              <button 
                onClick={prevImage}
                className="absolute left-4 md:left-8 w-14 h-14 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 md:right-8 w-14 h-14 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
              >
                <ChevronRight size={32} />
              </button>
           </div>

           {/* Bottom Bar / Description */}
           <div className="px-8 py-12 text-center text-white/80 animate-in slide-in-from-bottom-4 duration-500">
              <p className="max-w-2xl mx-auto font-medium text-lg italic">
                 {processedGallery[fullscreenIdx].description}
              </p>
           </div>
        </div>
      )}
    </div>
  );
}

function EditorialGrid({ images, name, openFullscreen }: { images: GalleryImage[], name: string, openFullscreen: (idx: number) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
      {images.map((img, idx) => {
        // Pattern logic for editorial layout
        const cycleIdx = idx % 7;
        let spanClass = "col-span-1 row-span-1";
        
        if (cycleIdx === 0) {
          spanClass = "md:col-span-2 md:row-span-2";
        } else if (cycleIdx === 3) {
          spanClass = "md:col-span-3 md:row-span-1";
        }
        
        return (
          <div 
            key={`edit-${img.category}-${idx}`} 
            onClick={() => openFullscreen(idx)}
            className={`relative rounded-[2rem] overflow-hidden cursor-zoom-in group/edit shadow-[0_10px_40px_-15px_var(--shadow)] hover:shadow-[0_20px_60px_-10px_var(--shadow)] transition-all duration-700 bg-[var(--bg-secondary)] ${spanClass}`}
          >
             <OptimizedImage 
               src={img.url} 
               alt={name} 
               fill 
               className="object-cover transition-transform duration-1000 group-hover/edit:scale-110" 
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
             />
             
             {/* Dynamic Overlay Label */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/edit:opacity-100 transition-opacity duration-500" />
             
             <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white opacity-0 group-hover/edit:opacity-100 translate-y-4 group-hover/edit:translate-y-0 transition-all duration-700">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">{img.category}</p>
                <p className="font-bold text-sm tracking-tight line-clamp-1">{img.description}</p>
             </div>

             <div className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white opacity-0 group-hover/edit:opacity-100 transition-opacity duration-500">
                <Maximize2 size={18} />
             </div>
          </div>
        );
      })}
    </div>
  );
}

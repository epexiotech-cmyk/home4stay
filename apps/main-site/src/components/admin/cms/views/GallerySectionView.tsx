import React from "react";

interface GalleryImage {
  id?: string;
  url: string;
  caption?: string;
  category?: string;
}

interface GallerySectionViewProps {
  images?: GalleryImage[];
}

export default function GallerySectionView({ images: propImages }: GallerySectionViewProps) {
  const images: GalleryImage[] = Array.isArray(propImages) ? propImages : [];

  if (images.length === 0) {
    return (
      <div className="p-6 bg-black space-y-3 flex-shrink-0 select-none">
        <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Gallery Preview Map</p>
        <div className="p-4 rounded bg-white/5 text-center text-[10px] text-white/40">
          No images configured.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-black space-y-3 flex-shrink-0 select-none">
      <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Gallery Preview Map</p>
      <div className="grid grid-cols-3 gap-1.5">
        {images.slice(0, 6).map((img: GalleryImage, i: number) => (
          <div key={img.id || i} className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.caption || "Gallery item"} className="w-full h-full object-cover" />
            <div className="absolute bottom-0 inset-x-0 p-1 bg-black/80 text-[7px] text-white/80 truncate">
              {img.category || "General"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Sparkles, Mountain, Utensils, Music, Coffee, Compass, Heart, CheckCircle2 } from "lucide-react";

export const EXPERIENCE_ICONS = {
  sparkles: Sparkles,
  utensils: Utensils,
  music: Music,
  mountain: Mountain,
  heart: Heart,
  compass: Compass,
  coffee: Coffee,
} as const;

export type ExperienceIcon = keyof typeof EXPERIENCE_ICONS;

export const PREDEFINED_TEMPLATES = [
  {
    title: "Royal Arrival Ritual",
    description: "Traditional welcome ceremony with flower garlands, tikka, and cooling welcome drinks.",
    category: "Heritage",
    price: 0,
    icon: "sparkles",
    duration: "30 Mins",
    coverImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
  },
  {
    title: "Shaam-E-Dawat",
    description: "An intimate candlelit dining experience featuring authentic local delicacies.",
    category: "Dining",
    price: 4500,
    icon: "utensils",
    duration: "2 Hours",
    coverImage: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=800",
  },
  {
    title: "Mehfil Under The Stars",
    description: "A private evening of Gazals and Sufi music in the garden with a royal dinner.",
    category: "Entertainment",
    price: 8500,
    icon: "music",
    duration: "3 Hours",
    coverImage: "https://images.unsplash.com/photo-1514525253361-bee8d41dfb7a?q=80&w=800",
  },
  {
    title: "Pahaadi Trails Trek",
    description: "Guided morning trek through pine forests with a local mountaineer.",
    category: "Adventure",
    price: 1500,
    icon: "mountain",
    duration: "4 Hours",
    coverImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800",
  },
  {
    title: "Ayur Wellness Ritual",
    description: "Rejuvenating Ayurvedic massage and herbal steam bath.",
    category: "Wellness",
    price: 3500,
    icon: "heart",
    duration: "90 Mins",
    coverImage: "https://images.unsplash.com/photo-1544161515-4ae6b9d804ad?q=80&w=800",
  },
  {
    title: "Heritage Food Walk",
    description: "Explore the hidden culinary gems of the city with our resident historian.",
    category: "Culinary",
    price: 2500,
    icon: "compass",
    duration: "3 Hours",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
  },
  {
    title: "Sunrise Tea Experience",
    description: "Premium tea tasting session on the peak view deck at sunrise.",
    category: "Wellness",
    price: 500,
    icon: "coffee",
    duration: "1 Hour",
    coverImage: "https://images.unsplash.com/photo-1544787210-2211d247156a?q=80&w=800",
  },
  {
    title: "Private Chef Experience",
    description: "A customized menu prepared live by our executive chef in your villa.",
    category: "Dining",
    price: 6500,
    icon: "utensils",
    duration: "3 Hours",
    coverImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800",
  },
  {
    title: "Folk Music Evening",
    description: "Traditional local folk music performance by local artists.",
    category: "Culture",
    price: 2000,
    icon: "music",
    duration: "2 Hours",
    coverImage: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=800",
  },
  {
    title: "Utsav Celebration",
    description: "Celebrate special moments with decorations, cake, and local festivities.",
    category: "Celebration",
    price: 5000,
    icon: "sparkles",
    duration: "Variable",
    coverImage: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=800",
  }
];

export type PredefinedTemplate = typeof PREDEFINED_TEMPLATES[0];

interface ExperienceLibraryProps {
  existingSlugs?: string[];
  onAddMultiple: (templates: Array<PredefinedTemplate & { customPrice?: number }>) => void;
  onClose: () => void;
}

export function ExperienceLibrary({ existingSlugs = [], onAddMultiple, onClose }: ExperienceLibraryProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [customPrices, setCustomPrices] = useState<Record<number, number>>({});

  const toggleSelection = (idx: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
      // Clean up custom price if unselected
      const newPrices = { ...customPrices };
      delete newPrices[idx];
      setCustomPrices(newPrices);
    } else {
      next.add(idx);
      // Set default template price when selected
      if (PREDEFINED_TEMPLATES[idx].price > 0) {
        setCustomPrices(prev => ({ ...prev, [idx]: PREDEFINED_TEMPLATES[idx].price }));
      }
    }
    setSelectedIndices(next);
  };

  const handlePriceChange = (idx: number, value: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(value, 10);
    setCustomPrices(prev => ({ ...prev, [idx]: isNaN(num) ? 0 : num }));
  };

  const handleAddSelected = () => {
    const selectedTemplates = PREDEFINED_TEMPLATES.map((template, idx) => {
      if (selectedIndices.has(idx)) {
        return {
          ...template,
          customPrice: customPrices[idx] !== undefined ? customPrices[idx] : template.price
        };
      }
      return null;
    }).filter(Boolean) as Array<PredefinedTemplate & { customPrice?: number }>;

    if (selectedTemplates.length > 0) {
      onAddMultiple(selectedTemplates);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-[#FDF6F1] dark:bg-[#053344] rounded-[48px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">Experience Library</h2>
            <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60">Choose from our curated collection of luxury templates.</p>
          </div>
          <button onClick={onClose} className="p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-[#053344] dark:text-white font-black uppercase text-[10px] tracking-widest transition-all">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREDEFINED_TEMPLATES.map((template, idx) => {
            const tempSlug = template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
            const isAlreadyAdded = existingSlugs.includes(tempSlug);
            const isSelected = selectedIndices.has(idx);

            const containerClasses = [
              "group relative bg-white dark:bg-[#0E5A75]/20 rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col",
              isAlreadyAdded ? "opacity-50 grayscale border-black/5 dark:border-white/5 pointer-events-none" : "",
              isSelected && !isAlreadyAdded ? "border-[#D4AF37] shadow-[0_20px_50px_-12px_rgba(212,175,55,0.2)] ring-1 ring-[#D4AF37]/20" : "",
              !isSelected && !isAlreadyAdded ? "border-black/5 dark:border-white/5 hover:border-[#D4AF37]/30 shadow-sm hover:shadow-xl cursor-pointer" : ""
            ].filter(Boolean).join(" ");

            return (
            <div 
              key={idx} 
              className={containerClasses}
              onClick={() => {
                if (!isAlreadyAdded && !isSelected) toggleSelection(idx);
              }}
            >
              {isSelected && (
                <div className="absolute top-4 left-4 z-10 w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in">
                  <CheckCircle2 size={18} />
                </div>
              )}
              <div className="h-40 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={template.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={template.title} />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 dark:bg-[#053344]/90 text-[#053344] dark:text-[#FCBC43] text-[9px] font-black uppercase tracking-widest shadow-lg">
                  {template.category}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                    {(() => {
                      const Icon = EXPERIENCE_ICONS[template.icon as ExperienceIcon] || Sparkles;
                      return <Icon size={20} />;
                    })()}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/40 uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-xs font-bold text-[#053344] dark:text-white">{template.duration}</p>
                  </div>
                </div>
                <h3 className="text-lg font-black text-[#053344] dark:text-white mb-2">{template.title}</h3>
                <p className="text-xs font-medium text-[#0E5A75]/60 dark:text-white/60 leading-relaxed mb-6 flex-1 line-clamp-2">{template.description}</p>
                
                {isSelected ? (
                  <div className="mt-auto pt-4 border-t border-[#D4AF37]/20 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-end">
                      <div className="w-full">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60 mb-1 block">Property Price (INR)</label>
                        {template.price === 0 ? (
                          <div className="px-4 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-sm font-black text-[#159665]">Complimentary</div>
                        ) : (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-[#053344]/40 dark:text-white/40">₹</span>
                            <input 
                              type="number" 
                              min="0"
                              value={customPrices[idx] !== undefined ? customPrices[idx] : template.price}
                              onChange={(e) => handlePriceChange(idx, e.target.value, e)}
                              className="w-full pl-8 pr-4 py-2 bg-white dark:bg-[#053344] border border-[#D4AF37]/40 rounded-xl text-sm font-black text-[#053344] dark:text-white focus:ring-2 ring-[#D4AF37]/40 outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={(e) => toggleSelection(idx, e)} className="text-[10px] font-black uppercase text-red-500 hover:text-red-600 text-center py-1">Remove</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                    <span className="text-sm font-black text-[#159665]">
                      {template.price === 0 ? "Complimentary" : "₹" + template.price}
                    </span>
                    <div className="px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                      {isAlreadyAdded ? (
                        <span className="text-[#0E5A75]/40 dark:text-white/40">Already Added</span>
                      ) : (
                        <span className="text-[#0E5A75] dark:text-[#FCBC43]">Select Template</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )})}
        </div>

        {/* Sticky Footer */}
        <div className="p-6 border-t border-black/5 dark:border-white/5 bg-[#FDF6F1] dark:bg-[#053344] flex justify-between items-center">
          <span className="text-sm font-bold text-[#053344] dark:text-white">
            {selectedIndices.size} selected
          </span>
          <button
            onClick={handleAddSelected}
            disabled={selectedIndices.size === 0}
            className={`px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-xl transition-all ${
              selectedIndices.size > 0 
                ? "bg-[#D4AF37] text-white hover:bg-[#c29e30] hover:scale-105" 
                : "bg-black/10 text-black/40 cursor-not-allowed"
            }`}
          >
            Add Selected Experiences
          </button>
        </div>
      </div>
    </div>
  );
}

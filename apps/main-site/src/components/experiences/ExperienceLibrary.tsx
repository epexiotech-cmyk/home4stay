import React from "react";
import { Sparkles, Mountain, Utensils, Music, Coffee, Compass, Heart } from "lucide-react";

export const PREDEFINED_TEMPLATES = [
  {
    title: "Royal Arrival Ritual",
    description: "Traditional welcome ceremony with flower garlands, tikka, and cooling welcome drinks.",
    category: "Heritage",
    price: 0,
    icon: Sparkles,
    duration: "30 Mins",
    coverImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800",
  },
  {
    title: "Shaam-E-Dawat",
    description: "An intimate candlelit dining experience featuring authentic local delicacies.",
    category: "Dining",
    price: 4500,
    icon: Utensils,
    duration: "2 Hours",
    coverImage: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=800",
  },
  {
    title: "Mehfil Under The Stars",
    description: "A private evening of Gazals and Sufi music in the garden with a royal dinner.",
    category: "Entertainment",
    price: 8500,
    icon: Music,
    duration: "3 Hours",
    coverImage: "https://images.unsplash.com/photo-1514525253361-bee8d41dfb7a?q=80&w=800",
  },
  {
    title: "Pahaadi Trails Trek",
    description: "Guided morning trek through pine forests with a local mountaineer.",
    category: "Adventure",
    price: 1500,
    icon: Mountain,
    duration: "4 Hours",
    coverImage: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800",
  },
  {
    title: "Ayur Wellness Ritual",
    description: "Rejuvenating Ayurvedic massage and herbal steam bath.",
    category: "Wellness",
    price: 3500,
    icon: Heart,
    duration: "90 Mins",
    coverImage: "https://images.unsplash.com/photo-1544161515-4ae6b9d804ad?q=80&w=800",
  },
  {
    title: "Heritage Food Walk",
    description: "Explore the hidden culinary gems of the city with our resident historian.",
    category: "Culinary",
    price: 2500,
    icon: Compass,
    duration: "3 Hours",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800",
  },
  {
    title: "Sunrise Tea Experience",
    description: "Premium tea tasting session on the peak view deck at sunrise.",
    category: "Wellness",
    price: 500,
    icon: Coffee,
    duration: "1 Hour",
    coverImage: "https://images.unsplash.com/photo-1544787210-2211d247156a?q=80&w=800",
  },
  {
    title: "Private Chef Experience",
    description: "A customized menu prepared live by our executive chef in your villa.",
    category: "Dining",
    price: 6500,
    icon: Utensils,
    duration: "3 Hours",
    coverImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=800",
  },
  {
    title: "Folk Music Evening",
    description: "Traditional local folk music performance by local artists.",
    category: "Culture",
    price: 2000,
    icon: Music,
    duration: "2 Hours",
    coverImage: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?q=80&w=800",
  },
  {
    title: "Utsav Celebration",
    description: "Celebrate special moments with decorations, cake, and local festivities.",
    category: "Celebration",
    price: 5000,
    icon: Sparkles,
    duration: "Variable",
    coverImage: "https://images.unsplash.com/photo-1530103043960-ef38714abb15?q=80&w=800",
  }
];

interface ExperienceLibraryProps {
  onAdd: (template: typeof PREDEFINED_TEMPLATES[0]) => void;
  onClose: () => void;
}

export function ExperienceLibrary({ onAdd, onClose }: ExperienceLibraryProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-[#FDF6F1] dark:bg-[#0A0F1D] rounded-[48px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight">Experience Library</h2>
            <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60">Choose from our curated collection of luxury templates.</p>
          </div>
          <button onClick={onClose} className="p-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-[#053344] dark:text-white font-black uppercase text-[10px] tracking-widest transition-all">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREDEFINED_TEMPLATES.map((template, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white dark:bg-[#0E5A75]/20 rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20 dark:hover:border-[#FCBC43]/20 transition-all duration-500 shadow-sm hover:shadow-xl flex flex-col"
            >
              <div className="h-40 relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={template.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={template.title} />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 dark:bg-[#053344]/90 text-[#053344] dark:text-[#FCBC43] text-[9px] font-black uppercase tracking-widest shadow-lg">
                  {template.category}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0E5A75]/5 dark:bg-[#FCBC43]/10 flex items-center justify-center text-[#0E5A75] dark:text-[#FCBC43]">
                    <template.icon size={20} />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/40 uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-xs font-bold text-[#053344] dark:text-white">{template.duration}</p>
                  </div>
                </div>
                <h3 className="text-lg font-black text-[#053344] dark:text-white mb-2">{template.title}</h3>
                <p className="text-xs font-medium text-[#0E5A75]/60 dark:text-white/60 leading-relaxed mb-6 flex-1 line-clamp-2">{template.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                  <span className="text-sm font-black text-[#159665]">
                    {template.price === 0 ? "Complimentary" : `₹${template.price.toLocaleString()}`}
                  </span>
                  <button 
                    onClick={() => onAdd(template)}
                    className="px-6 py-2 rounded-xl bg-[#0E5A75] dark:bg-[#FCBC43] text-white dark:text-[#053344] text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    Add to Property
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

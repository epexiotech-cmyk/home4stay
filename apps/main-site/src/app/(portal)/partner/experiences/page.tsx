"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
  Sparkles, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit3, 
  ChevronRight,
  Zap,
  Info,
  Clock
} from "lucide-react";
import { ExperienceLibrary, PREDEFINED_TEMPLATES } from "@/components/experiences/ExperienceLibrary";
import { toast } from "sonner";

interface Experience {
  id: string;
  propertyId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  isComplimentary: boolean;
  isFeatured: boolean;
  coverImage: string;
  duration?: string;
  isActive: boolean;
}

export default function PartnerExperiencesPage() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const propertyId = user?.propertyId;

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/property/experiences?propertyId=${propertyId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExperiences(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load experiences");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (propertyId) {
      const timer = setTimeout(() => fetchExperiences(), 0);
      return () => clearTimeout(timer);
    }
  }, [propertyId, fetchExperiences]);

  const handleAddFromLibrary = async (template: typeof PREDEFINED_TEMPLATES[0]) => {
    try {
      const slug = template.title.toLowerCase().replace(/ /g, "-");
      const res = await fetch("/api/property/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...template,
          propertyId,
          slug,
          isActive: true,
          isFeatured: false,
          isComplimentary: template.price === 0,
          sortOrder: experiences.length + 1
        })
      });

      if (!res.ok) throw new Error("Failed to add experience");
      
      toast.success(`${template.title} added to your property!`);
      setShowLibrary(false);
      fetchExperiences();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add experience");
    }
  };

  const filteredExperiences = experiences.filter(exp => 
    exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDF6F1] dark:bg-[#053344] p-8 md:p-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-px bg-[#0E5A75] dark:bg-[#FCBC43]" />
            <span className="text-[10px] md:text-xs font-black text-[#0E5A75] dark:text-[#FCBC43] uppercase tracking-[0.3em]">Hospitality Operations</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#053344] dark:text-white tracking-tighter leading-none italic">
            Hospitality <span className="text-[#0983B0]">Experiences</span>
          </h1>
          <p className="text-sm md:text-lg text-[#0E5A75]/60 dark:text-white/60 font-medium max-w-xl italic">
            Curate unique moments that define your property&apos;s character and delight your guests.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowLibrary(true)}
            className="group flex items-center gap-4 bg-white dark:bg-[#0E5A75]/20 px-8 py-5 rounded-[24px] border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20 dark:hover:border-[#FCBC43]/20 shadow-premium transition-all duration-500"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0E5A75]/5 dark:bg-[#FCBC43]/10 flex items-center justify-center text-[#0E5A75] dark:text-[#FCBC43] group-hover:bg-[#0E5A75] group-hover:text-white transition-all">
              <Sparkles size={20} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/40 uppercase tracking-widest mb-0.5">Explore</p>
              <p className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-tighter">Add from Library</p>
            </div>
          </button>

          <button className="h-20 w-20 rounded-[24px] bg-[#0E5A75] dark:bg-[#FCBC43] text-white dark:text-[#053344] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#0E5A75]/20 dark:shadow-[#FCBC43]/20">
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0E5A75]/40 dark:text-white/40 group-focus-within:text-[#0E5A75] dark:group-focus-within:text-[#FCBC43] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search experiences by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#0E5A75]/10 border border-black/5 dark:border-white/10 rounded-[24px] py-6 pl-16 pr-8 text-sm font-bold text-[#053344] dark:text-white placeholder:text-[#0E5A75]/30 outline-none focus:ring-2 ring-[#0E5A75]/10 dark:ring-[#FCBC43]/10 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[#159665]/10 px-6 py-4 rounded-full border border-[#159665]/20">
            <Zap size={16} className="text-[#159665]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#159665] whitespace-nowrap">
              {experiences.length} Active Experiences
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 flex justify-end gap-4">
          {["All", "Dining", "Adventure", "Wellness"].map((cat) => (
            <button 
              key={cat}
              className="px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/40 dark:text-white/40 border border-black/5 dark:border-white/5 hover:border-[#0E5A75] hover:text-[#0E5A75] transition-all"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 rounded-[40px] bg-white/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredExperiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-1000">
          {filteredExperiences.map((exp) => (
            <ExperienceCard key={exp.id} exp={exp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 rounded-[40px] border-2 border-dashed border-[#0E5A75]/10 dark:border-white/10">
          <div className="w-20 h-20 rounded-full bg-[#0E5A75]/5 dark:bg-[#FCBC43]/5 flex items-center justify-center mx-auto mb-6 text-[#0E5A75] dark:text-[#FCBC43]">
            <Info size={32} />
          </div>
          <h3 className="text-xl font-black text-[#053344] dark:text-white mb-2">No experiences found</h3>
          <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60 mb-8 max-w-xs mx-auto italic">
            Start curating your property&apos;s personality by adding experiences from the library or creating your own.
          </p>
          <button 
            onClick={() => setShowLibrary(true)}
            className="px-10 py-4 rounded-2xl bg-[#0E5A75] text-white text-[10px] font-black uppercase tracking-widest shadow-xl"
          >
            Add First Experience
          </button>
        </div>
      )}

      {showLibrary && (
        <ExperienceLibrary 
          onAdd={handleAddFromLibrary}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </div>
  );
}

function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <div className="group relative bg-white dark:bg-[#0E5A75]/20 rounded-[40px] overflow-hidden border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20 dark:hover:border-[#FCBC43]/20 transition-all duration-700 shadow-premium hover:shadow-2xl flex flex-col">
      <div className="h-56 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={exp.coverImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={exp.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em]">
          {exp.category}
        </div>
        <div className="absolute bottom-6 left-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FCBC43] flex items-center justify-center text-[#053344] shadow-lg">
             <Clock size={16} />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-widest">{exp.duration || "N/A"}</span>
        </div>
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight leading-none group-hover:text-[#0983B0] transition-colors">
            {exp.title}
          </h3>
          <button className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-[#0E5A75]/40 transition-all">
            <MoreVertical size={20} />
          </button>
        </div>

        <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60 leading-relaxed mb-8 flex-1 line-clamp-3 italic">
          &quot;{exp.description}&quot;
        </p>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/40 uppercase tracking-widest">Rate</p>
            <p className="text-lg font-black text-[#159665]">
              {exp.isComplimentary ? "Free" : `₹${exp.price.toLocaleString()}`}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#0E5A75] dark:text-white hover:bg-[#0E5A75] hover:text-white transition-all shadow-sm">
              <Edit3 size={18} />
            </button>
            <button className="w-12 h-12 rounded-2xl bg-[#0E5A75] dark:bg-[#FCBC43] text-white dark:text-[#053344] flex items-center justify-center hover:scale-105 transition-all shadow-md">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

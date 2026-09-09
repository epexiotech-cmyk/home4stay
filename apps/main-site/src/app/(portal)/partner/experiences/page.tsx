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
  Clock,
  Trash2,
  Power
} from "lucide-react";
import { ExperienceLibrary, PREDEFINED_TEMPLATES } from "@/components/experiences/ExperienceLibrary";
import { ExperienceFormModal } from "@/components/experiences/ExperienceFormModal";
import { toast } from "sonner";

function extractErrorMessage(errJson: unknown): string {
  if (!errJson) return "Unknown error";
  if (typeof errJson === "string") return errJson;
  if (typeof errJson === "object" && errJson !== null) {
    const obj = errJson as Record<string, unknown>;
    if (typeof obj.message === "string" && obj.message.trim().length > 0) return obj.message;
    if (obj.error) {
      if (typeof obj.error === "string" && obj.error.trim().length > 0) return obj.error;
      if (typeof obj.error === "object" && obj.error !== null) {
        const errObj = obj.error as Record<string, unknown>;
        if (typeof errObj.message === "string" && errObj.message.trim().length > 0) return errObj.message;
        try {
          return JSON.stringify(errObj);
        } catch {
          return "Unknown error object";
        }
      }
    }
  }
  return "An unexpected error occurred";
}

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
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const propertyId = user?.propertyId;

  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/property/experiences?propertyId=` + propertyId);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "Failed to fetch experiences");
      }
      if (!Array.isArray(json.data)) {
        throw new Error("Invalid response format");
      }
      setExperiences(json.data);
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load experiences";
      toast.error(errorMessage);
      setExperiences([]);
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

  const handleAddFromLibrary = useCallback(async (templates: typeof PREDEFINED_TEMPLATES) => {
    try {
      setIsSaving(true);
      
      const promises = templates.map(template => 
        fetch("/api/property/experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            title: template.title,
            slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            description: template.description,
            category: template.category,
            price: template.price,
            isComplimentary: template.price === 0,
            duration: template.duration,
            isActive: true,
            isLibrary: true,
            icon: typeof template.icon === "string" ? template.icon : undefined,
            coverImage: template.coverImage
          })
        }).then(async res => {
          if (!res.ok) {
            if (res.status === 409) {
              throw new Error("This experience is already added to your property.");
            }
            const errJson = await res.json().catch(() => ({}));
            throw new Error(extractErrorMessage(errJson));
          }
          return res;
        })
      );

      await Promise.all(promises);
      
      toast.success(templates.length + " experiences added to your property");
      setShowLibrary(false);
      fetchExperiences();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add some experiences from library";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [propertyId, fetchExperiences]);

  const handleCreateCustom = useCallback(async (data: Record<string, unknown>) => {
    try {
      setIsSaving(true);
      const res = await fetch("/api/property/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          ...data
        })
      });
      
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(extractErrorMessage(json));
      }
      
      toast.success("Custom experience created");
      setShowCustomForm(false);
      fetchExperiences();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create experience";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [propertyId, fetchExperiences]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/property/experiences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus })
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to update");
      toast.success(`Experience ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchExperiences();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update experience");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;
    try {
      const res = await fetch(`/api/property/experiences?id=${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete");
      toast.success("Experience deleted");
      fetchExperiences();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete experience");
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
            Curate unique moments that define your property's character and delight your guests.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowCustomForm(true)}
            className="group flex items-center gap-4 bg-white dark:bg-[#0E5A75]/20 px-8 py-5 rounded-[24px] border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20 dark:hover:border-[#FCBC43]/20 shadow-premium transition-all duration-500"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0E5A75]/5 dark:bg-[#FCBC43]/10 flex items-center justify-center text-[#0E5A75] dark:text-[#FCBC43] group-hover:bg-[#0E5A75] group-hover:text-white transition-all">
              <Plus size={20} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/40 uppercase tracking-widest mb-0.5">Custom</p>
              <p className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-tighter">Experience</p>
            </div>
          </button>

          <button 
            onClick={() => setShowLibrary(true)}
            className="h-20 w-20 rounded-[24px] bg-[#0E5A75] dark:bg-[#FCBC43] text-white dark:text-[#053344] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#0E5A75]/20 dark:shadow-[#FCBC43]/20"
          >
            <Sparkles size={32} strokeWidth={3} />
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
              {experiences.filter(e => e.isActive).length} Active Experiences
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
            <ExperienceCard 
              key={exp.id} 
              exp={exp} 
              onToggleActive={() => handleToggleActive(exp.id, exp.isActive)}
              onDelete={() => handleDelete(exp.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 rounded-[40px] border-2 border-dashed border-[#0E5A75]/10 dark:border-white/10">
          <div className="w-20 h-20 rounded-full bg-[#0E5A75]/5 dark:bg-[#FCBC43]/5 flex items-center justify-center mx-auto mb-6 text-[#0E5A75] dark:text-[#FCBC43]">
            <Info size={32} />
          </div>
          <h3 className="text-xl font-black text-[#053344] dark:text-white mb-2">No experiences found</h3>
          <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60 mb-8 max-w-xs mx-auto italic">
            Start curating your property's personality by adding experiences from the library or creating your own.
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
          existingSlugs={experiences.map(e => e.slug)}
          onAddMultiple={handleAddFromLibrary}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {showCustomForm && (
        <ExperienceFormModal 
          onSave={handleCreateCustom}
          onClose={() => setShowCustomForm(false)}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}

function ExperienceCard({ 
  exp, 
  onToggleActive, 
  onDelete 
}: { 
  exp: Experience;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`group relative bg-white dark:bg-[#0E5A75]/20 rounded-[40px] overflow-hidden border ${exp.isActive ? 'border-black/5 dark:border-white/5' : 'border-red-500/30 opacity-70'} hover:border-[#0E5A75]/20 dark:hover:border-[#FCBC43]/20 transition-all duration-700 shadow-premium hover:shadow-2xl flex flex-col`}>
      <div className="h-56 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={exp.coverImage || 'https://images.unsplash.com/photo-1544161515-4ae6b9d804ad?w=800'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={exp.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em]">
          {exp.category}
        </div>
        {!exp.isActive && (
          <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-red-500/80 backdrop-blur-md border border-red-500/20 text-white text-[9px] font-black uppercase tracking-[0.2em]">
            Inactive
          </div>
        )}
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
        </div>

        <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60 leading-relaxed mb-8 flex-1 line-clamp-3 italic">
          "{exp.description}"
        </p>

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-black/5 dark:border-white/5">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/40 uppercase tracking-widest">Rate</p>
            <p className="text-lg font-black text-[#159665]">
              {exp.isComplimentary ? "Free" : "Rs." + exp.price}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button onClick={onToggleActive} title={exp.isActive ? "Deactivate" : "Activate"} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm ${exp.isActive ? 'bg-black/5 dark:bg-white/5 text-[#0E5A75] dark:text-white hover:bg-orange-500 hover:text-white' : 'bg-green-500/20 text-green-600 hover:bg-green-500 hover:text-white'}`}>
              <Power size={18} />
            </button>
            <button onClick={onDelete} title="Delete" className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-105 transition-all shadow-md">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

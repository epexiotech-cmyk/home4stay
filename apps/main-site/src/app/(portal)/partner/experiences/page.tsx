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
  Power,
  CheckCircle2
} from "lucide-react";
import { ExperienceLibrary, PredefinedTemplate } from "@/components/experiences/ExperienceLibrary";
import { ExperienceFormModal } from "@/components/experiences/ExperienceFormModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  maxGuests?: number;
}

const HeritageDivider = () => (
  <div className="flex items-center justify-center gap-4 my-8 opacity-20">
    <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
    <div className="w-2 h-2 rotate-45 border border-[#D4AF37]" />
    <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
  </div>
);

const IndianPattern = () => (
  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
    style={{ 
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30-15 30-15-30z' fill='%23D4AF37' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      backgroundSize: '30px 30px'
    }} 
  />
);

export default function PartnerExperiencesPage() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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

  const handleAddFromLibrary = useCallback(async (templates: Array<PredefinedTemplate & { customPrice?: number }>) => {
    try {
      setIsSaving(true);
      
      const promises = templates.map(template => {
        const finalPrice = template.customPrice !== undefined ? template.customPrice : template.price;
        return fetch("/api/property/experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            title: template.title,
            slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            description: template.description,
            category: template.category,
            price: finalPrice,
            isComplimentary: finalPrice === 0,
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
        });
      });

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

  const handleSaveForm = useCallback(async (data: Record<string, unknown>) => {
    try {
      setIsSaving(true);
      const isEdit = !!editingExp;
      const url = "/api/property/experiences";
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit ? { id: editingExp.id, ...data } : { propertyId, ...data };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(extractErrorMessage(json));
      }
      
      toast.success(isEdit ? "Experience updated" : "Custom experience created");
      setShowCustomForm(false);
      setEditingExp(null);
      fetchExperiences();
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save experience";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [propertyId, fetchExperiences, editingExp]);

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

  const filteredExperiences = experiences.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase()) || exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === "All" || (activeFilter === "Active" ? exp.isActive : exp.category === activeFilter);
    return matchesSearch && matchesFilter;
  });

  const categories = ["All", "Active", "Dining", "Adventure", "Wellness"];

  return (
    <div className="min-h-screen bg-[#FDF6F1] dark:bg-[#053344] p-8 md:p-12 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-px bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-[10px] md:text-xs font-black text-[#D4AF37] uppercase tracking-[0.4em]">Hospitality Operations</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#053344] dark:text-white tracking-tighter leading-tight">
            Curate <span className="italic font-serif text-[#D4AF37]">Experiences</span>
          </h1>
          <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60 max-w-xl italic">
            Design unique moments that define your property's character and delight your guests.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { setEditingExp(null); setShowCustomForm(true); }}
            className="group flex items-center gap-4 bg-white dark:bg-[#053344]/40 px-6 py-4 rounded-[24px] border border-black/5 dark:border-white/5 hover:border-[#D4AF37]/30 shadow-premium transition-all duration-500 hover:shadow-xl"
          >
            <div className="w-10 h-10 rounded-[16px] bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-all">
              <Plus size={20} />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/40 uppercase tracking-widest mb-0.5">Custom</p>
              <p className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-tighter font-serif">Experience</p>
            </div>
          </button>

          <button 
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-3 bg-[#D4AF37] text-white px-6 py-4 rounded-[24px] shadow-lg hover:shadow-xl hover:bg-[#c29e30] transition-all duration-500"
          >
            <Sparkles size={24} />
            <span className="text-sm font-black uppercase tracking-widest hidden md:block">Library</span>
          </button>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0E5A75]/40 dark:text-white/40 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search experiences by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#053344]/40 border border-black/5 dark:border-white/10 rounded-[24px] py-6 pl-16 pr-8 text-sm font-bold text-[#053344] dark:text-white placeholder:text-[#0E5A75]/30 outline-none focus:ring-2 ring-[#D4AF37]/20 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 bg-[#159665]/10 px-6 py-4 rounded-full border border-[#159665]/20 shrink-0">
            <Zap size={16} className="text-[#159665]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#159665] whitespace-nowrap">
              {experiences.filter(e => e.isActive).length} Active Experiences
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-wrap justify-end gap-3 items-center">
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                activeFilter === cat 
                  ? "bg-[#D4AF37] text-white border-transparent"
                  : "text-[#0E5A75]/40 dark:text-white/40 border border-black/5 dark:border-white/5 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-80 rounded-[48px] bg-white/50 dark:bg-[#053344]/20 animate-pulse border border-black/5" />
          ))}
        </div>
      ) : filteredExperiences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredExperiences.map((exp) => (
            <ExperienceCard 
              key={exp.id} 
              exp={exp} 
              onEdit={() => { setEditingExp(exp); setShowCustomForm(true); }}
              onToggleActive={() => handleToggleActive(exp.id, exp.isActive)}
              onDelete={() => handleDelete(exp.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white/40 dark:bg-[#053344]/20 rounded-[48px] border border-black/5 dark:border-white/5">
          <div className="w-24 h-24 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-6 text-[#D4AF37]">
            <Sparkles size={32} />
          </div>
          <h3 className="text-2xl font-black text-[#053344] dark:text-white mb-2 font-serif italic">No experiences found</h3>
          <p className="text-sm font-medium text-[#0E5A75]/60 dark:text-white/60 mb-8 max-w-sm mx-auto">
            Start curating your property's personality by adding signature experiences from the library or creating your own.
          </p>
          <button 
            onClick={() => setShowLibrary(true)}
            className="px-8 py-4 rounded-full bg-[#D4AF37] text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-[#c29e30] transition-all"
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
          initialData={editingExp}
          onSave={handleSaveForm}
          onClose={() => { setShowCustomForm(false); setEditingExp(null); }}
          isLoading={isSaving}
        />
      )}
    </div>
  );
}

function ExperienceCard({ 
  exp, 
  onEdit,
  onToggleActive, 
  onDelete 
}: { 
  exp: Experience;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className={cn(
      "relative group p-8 rounded-[48px] glass-premium border transition-all duration-700 flex flex-col justify-between overflow-hidden hover-lift-premium",
      exp.isActive 
        ? "bg-white/80 dark:bg-[#053344]/40 border-black/5 dark:border-white/5 hover:border-[#D4AF37]/30" 
        : "bg-white/40 dark:bg-[#053344]/20 border-black/5 opacity-80 hover:opacity-100"
    )}>
      <IndianPattern />

      {/* Top badges */}
      <div className="absolute top-6 right-6 flex gap-2 z-10">
        {!exp.isActive && (
          <div className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 text-[#053344] dark:text-white text-[8px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
            Inactive
          </div>
        )}
      </div>

      <div className="relative z-10 flex-1">
        {/* Compact Cover Image/Icon Area */}
        <div className="flex items-start gap-4 mb-8">
          <div className={cn(
            "w-20 h-20 rounded-[24px] overflow-hidden shrink-0 border relative",
            exp.isActive ? "border-[#D4AF37]/20" : "border-black/5 grayscale"
          )}>
            <img src={exp.coverImage} alt={exp.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div className="pt-2">
            <p className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
              <span className="w-3 h-[1px] bg-[#D4AF37]/30" />
              {exp.category}
            </p>
            <h3 className={cn(
              "text-xl font-black mb-1 font-serif leading-tight transition-colors duration-500",
              exp.isActive ? "text-[#053344] dark:text-white group-hover:text-[#D4AF37]" : "text-[#0E5A75]/60"
            )}>
              {exp.title}
            </h3>
          </div>
        </div>
        
        <p className="text-xs font-medium text-[#0E5A75]/70 dark:text-white/60 mb-6 leading-relaxed italic line-clamp-2">
          &quot;{exp.description}&quot;
        </p>

        {/* Small details */}
        <div className="flex items-center gap-4 mb-6">
          {exp.duration && (
            <div className="flex items-center gap-1.5">
              <Clock size={12} className="text-[#0E5A75]/40" />
              <span className="text-[10px] font-black text-[#0E5A75]/60 uppercase tracking-widest">{exp.duration}</span>
            </div>
          )}
          {exp.maxGuests && (
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-[#0E5A75]/40" />
              <span className="text-[10px] font-black text-[#0E5A75]/60 uppercase tracking-widest">Max {exp.maxGuests}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="pt-6 border-t border-black/5 dark:border-white/10 flex items-center justify-between relative z-10">
        <div>
          <p className="text-[9px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-0.5">Rate</p>
          <p className={cn(
            "text-lg font-black transition-colors duration-500",
            exp.isActive ? "text-[#159665]" : "text-[#053344]/50 dark:text-white/50"
          )}>
            {exp.isComplimentary ? "Complimentary" : formatPrice(exp.price)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={onEdit} 
            title="Edit"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#0E5A75]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={onToggleActive} 
            title={exp.isActive ? "Deactivate" : "Activate"}
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
              exp.isActive 
                ? "text-[#0E5A75]/60 hover:bg-black/5 hover:text-[#053344]" 
                : "text-green-600 hover:bg-green-500/10"
            )}
          >
            <Power size={16} />
          </button>
          <button 
            onClick={onDelete} 
            title="Delete"
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-[#0E5A75]/40 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

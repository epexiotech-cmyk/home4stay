import React, { useState } from "react";
import { X } from "lucide-react";

export interface ExperienceFormInitialData {
  id?: string;
  title?: string;
  category?: string;
  description?: string;
  price?: number;
  isComplimentary?: boolean;
  duration?: string;
  maxGuests?: number;
  requiresScheduling?: boolean;
  isActive?: boolean;
  coverImage?: string;
}

interface ExperienceFormModalProps {
  initialData?: ExperienceFormInitialData | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export function ExperienceFormModal({ initialData, onSave, onClose, isLoading }: ExperienceFormModalProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "Dining",
    description: initialData?.description || "",
    price: initialData?.price !== undefined ? initialData.price : 0,
    isComplimentary: initialData?.isComplimentary || false,
    duration: initialData?.duration || "",
    maxGuests: initialData?.maxGuests != null ? String(initialData.maxGuests) : "",
    requiresScheduling: initialData?.requiresScheduling || false,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    coverImage: initialData?.coverImage || "",
  });

  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked, ...(name === 'isComplimentary' && checked ? { price: 0 } : {}) }));
    } else if (name === "price") {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title || !formData.description) {
      setError("Title and description are required.");
      return;
    }

    if (!formData.isComplimentary && formData.price < 0) {
      setError("Price cannot be negative.");
      return;
    }

    // Prepare payload
    const payload = {
      title: formData.title,
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      category: formData.category,
      description: formData.description,
      price: formData.isComplimentary ? 0 : formData.price,
      isComplimentary: formData.isComplimentary,
      duration: formData.duration || undefined,
      maxGuests: formData.maxGuests && formData.maxGuests.trim() !== "" ? parseInt(formData.maxGuests) : undefined,
      requiresScheduling: formData.requiresScheduling,
      isActive: formData.isActive,
      coverImage: formData.coverImage || undefined,
    };

    try {
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save custom experience");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#FDF6F1] dark:bg-[#053344] rounded-[48px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#053344]">
          <div>
            <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">
              {initialData ? "Edit Experience" : "Create Custom Experience"}
            </h2>
            <p className="text-xs font-medium text-[#0E5A75]/60 dark:text-white/60">
              {initialData ? "Update your property's experience details." : "Design a unique offering for your property."}
            </p>
          </div>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-[#053344] dark:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-bold border border-red-100 dark:border-red-900/30">
              {error}
            </div>
          )}

          <form id="custom-exp-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60">Title *</label>
                <input 
                  type="text" 
                  name="title"
                  value={formData.title} 
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#053344]/40 border border-[#D4AF37]/20 rounded-2xl px-4 py-3 text-sm font-bold text-[#053344] dark:text-white outline-none focus:ring-2 ring-[#D4AF37]/40 transition-all"
                  placeholder="e.g. Secret Garden Dinner"
                  required
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60">Category</label>
                <select 
                  name="category"
                  value={formData.category} 
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#053344]/40 border border-[#D4AF37]/20 rounded-2xl px-4 py-3 text-sm font-bold text-[#053344] dark:text-white outline-none focus:ring-2 ring-[#D4AF37]/40 transition-all"
                >
                  <option>Dining</option>
                  <option>Adventure</option>
                  <option>Wellness</option>
                  <option>Heritage</option>
                  <option>Entertainment</option>
                  <option>Culture</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60">Description *</label>
              <textarea 
                name="description"
                value={formData.description} 
                onChange={handleChange}
                rows={3}
                className="w-full bg-white dark:bg-[#053344]/40 border border-[#D4AF37]/20 rounded-2xl px-4 py-3 text-sm font-bold text-[#053344] dark:text-white outline-none focus:ring-2 ring-[#D4AF37]/40 transition-all resize-none"
                placeholder="Describe the experience..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60">Price (INR)</label>
                <input 
                  type="number" 
                  name="price"
                  value={formData.price} 
                  onChange={handleChange}
                  disabled={formData.isComplimentary}
                  min="0"
                  className="w-full bg-white dark:bg-[#053344]/40 border border-[#D4AF37]/20 rounded-2xl px-4 py-3 text-sm font-bold text-[#053344] dark:text-white outline-none focus:ring-2 ring-[#D4AF37]/40 transition-all disabled:opacity-50 disabled:bg-black/5 dark:disabled:bg-white/5"
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60">Duration</label>
                <input 
                  type="text" 
                  name="duration"
                  value={formData.duration} 
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#053344]/40 border border-[#D4AF37]/20 rounded-2xl px-4 py-3 text-sm font-bold text-[#053344] dark:text-white outline-none focus:ring-2 ring-[#D4AF37]/40 transition-all"
                  placeholder="e.g. 2 Hours"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60">Max Guests</label>
                <input 
                  type="number" 
                  name="maxGuests"
                  value={formData.maxGuests} 
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-white dark:bg-[#053344]/40 border border-[#D4AF37]/20 rounded-2xl px-4 py-3 text-sm font-bold text-[#053344] dark:text-white outline-none focus:ring-2 ring-[#D4AF37]/40 transition-all"
                  placeholder="Leave empty if no limit"
                />
              </div>

              <div className="col-span-2 md:col-span-1 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/60">Cover Image URL</label>
                <input 
                  type="url" 
                  name="coverImage"
                  value={formData.coverImage} 
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#053344]/40 border border-[#D4AF37]/20 rounded-2xl px-4 py-3 text-sm font-bold text-[#053344] dark:text-white outline-none focus:ring-2 ring-[#D4AF37]/40 transition-all"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 dark:border-white/5 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isComplimentary" checked={formData.isComplimentary} onChange={handleChange} className="w-5 h-5 rounded border-black/20 text-[#D4AF37] focus:ring-[#D4AF37]" />
                <span className="text-sm font-bold text-[#053344] dark:text-white group-hover:text-[#D4AF37] transition-colors">Is Complimentary (Free)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="requiresScheduling" checked={formData.requiresScheduling} onChange={handleChange} className="w-5 h-5 rounded border-black/20 text-[#D4AF37] focus:ring-[#D4AF37]" />
                <span className="text-sm font-bold text-[#053344] dark:text-white group-hover:text-[#D4AF37] transition-colors">Requires Scheduling / Advance Notice</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-5 h-5 rounded border-black/20 text-[#D4AF37] focus:ring-[#D4AF37]" />
                <span className="text-sm font-bold text-[#053344] dark:text-white group-hover:text-[#D4AF37] transition-colors">Active (Visible to public)</span>
              </label>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#053344] flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest text-[#053344] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button 
            type="submit" 
            form="custom-exp-form"
            disabled={isLoading}
            className="px-8 py-3 rounded-full bg-[#D4AF37] text-white text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
          >
            {isLoading ? "Saving..." : (initialData ? "Save Changes" : "Create Experience")}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from "react";
import { X, UploadCloud, Loader2, ImageIcon } from "lucide-react";

export interface NearbyPlaceFormInitialData {
  id?: string;
  name?: string;
  category?: string | null;
  distance?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

interface NearbyPlaceFormModalProps {
  initialData?: NearbyPlaceFormInitialData | null;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

const CATEGORIES = [
  "Attraction", "Landmark", "Restaurant", "Shopping", 
  "Nature", "Temple", "Transport", "Activity", "Other"
];

export function NearbyPlaceFormModal({ initialData, onSave, onClose, isLoading }: NearbyPlaceFormModalProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "Attraction",
    distance: initialData?.distance || "",
    description: initialData?.description || "",
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    sortOrder: initialData?.sortOrder || 0,
    imageUrl: initialData?.imageUrl || null,
  });

  const [error, setError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "sortOrder") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Only JPEG, PNG, or WebP images are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name) {
      setError("Place Name is required.");
      return;
    }

    try {
      // Pass the selected file up to the parent page to handle upload
      await onSave({ ...formData, file: selectedFile });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save nearby place");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#FDF6F1] dark:bg-[#053344] rounded-[48px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#053344]">
          <div>
            <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight">
              {initialData ? "Edit Nearby Place" : "Add Nearby Place"}
            </h2>
            <p className="text-xs font-medium text-[#0E5A75]/60 dark:text-white/60">
              Help guests discover what's worth seeing around your property.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-[#053344] dark:text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium">
              {error}
            </div>
          )}

          <form id="nearby-place-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#0E5A75] dark:text-white">Place Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#0E5A75]/20 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#053344] dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 dark:focus:ring-white/20 transition-all"
                  placeholder="e.g. Echo Point"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#0E5A75] dark:text-white">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#0E5A75]/20 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#053344] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 dark:focus:ring-white/20 transition-all appearance-none"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#0E5A75] dark:text-white">Distance</label>
                <input
                  type="text"
                  name="distance"
                  value={formData.distance}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#0E5A75]/20 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#053344] dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 dark:focus:ring-white/20 transition-all"
                  placeholder="e.g. 2.5 km"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#0E5A75] dark:text-white">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white dark:bg-[#0E5A75]/20 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#053344] dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 dark:focus:ring-white/20 transition-all resize-none"
                  placeholder="A short guest-facing description about why this place is worth discovering..."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#0E5A75] dark:text-white flex justify-between items-center">
                  <span>Image</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#0983B0] hover:underline normal-case tracking-normal"
                  >
                    Change Image
                  </button>
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/jpeg, image/png, image/webp"
                  className="hidden"
                />
                
                <div 
                  className={`w-full aspect-[21/9] rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${
                    previewUrl ? 'border-transparent' : 'border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                  onClick={() => !previewUrl && fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-[#0E5A75]/60 dark:text-white/60">
                      <ImageIcon className="mx-auto mb-2 opacity-50" size={32} />
                      <p className="text-sm font-medium">Click to upload image</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-[#0E5A75] dark:text-white">Display Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-[#0E5A75]/20 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-[#053344] dark:text-white placeholder-black/30 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 dark:focus:ring-white/20 transition-all"
                />
              </div>

              <div className="space-y-2 flex items-center pt-8">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-black/10 dark:bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0E5A75] dark:peer-checked:bg-[#78D145]"></div>
                  <span className="ml-3 text-sm font-medium text-[#053344] dark:text-white uppercase tracking-widest">
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </label>
              </div>

            </div>
          </form>
        </div>

        <div className="p-8 border-t border-black/5 dark:border-white/5 bg-white dark:bg-[#053344] flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-[#053344] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="nearby-place-form"
            disabled={isLoading}
            className="px-8 py-3 rounded-2xl bg-[#0E5A75] dark:bg-[#78D145] text-white dark:text-[#053344] text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-[#0E5A75]/20 dark:shadow-[#78D145]/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
            {isLoading ? "Saving..." : "Save Place"}
          </button>
        </div>
      </div>
    </div>
  );
}

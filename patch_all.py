from pathlib import Path
import re

# 1. Fix ExperienceFormModal.tsx
p_modal = Path('/home/apurv_patel/home4stay/apps/main-site/src/components/experiences/ExperienceFormModal.tsx')
if p_modal.exists():
    s_modal = p_modal.read_text()
    
    s_modal = s_modal.replace('onSave: (data: any) => Promise<void>;', 'onSave: (data: Record<string, unknown>) => Promise<void>;')
    s_modal = s_modal.replace('} catch (err: any) {', '} catch (err) {')
    s_modal = s_modal.replace('setError(err.message || "Failed to save custom experience");', 'setError(err instanceof Error ? err.message : "Failed to save custom experience");')
    p_modal.write_text(s_modal)

# 2. Fix page.tsx
p_page = Path('/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner/experiences/page.tsx')
if p_page.exists():
    s_page = p_page.read_text()
    
    # Check if it was already patched recently
    if 'ExperienceFormModal' not in s_page:
        s_page = s_page.replace('import { ExperienceLibrary, PREDEFINED_TEMPLATES } from "@/components/experiences/ExperienceLibrary";\\nimport { toast } from "sonner";', 'import { ExperienceLibrary, PREDEFINED_TEMPLATES } from "@/components/experiences/ExperienceLibrary";\\nimport { ExperienceFormModal } from "@/components/experiences/ExperienceFormModal";\\nimport { toast } from "sonner";')
        
        s_page = s_page.replace('  const [loading, setLoading] = useState(true);\\n  const [showLibrary, setShowLibrary] = useState(false);\\n  const [searchTerm, setSearchTerm] = useState("");', '  const [loading, setLoading] = useState(true);\\n  const [showLibrary, setShowLibrary] = useState(false);\\n  const [showCustomForm, setShowCustomForm] = useState(false);\\n  const [isSaving, setIsSaving] = useState(false);\\n  const [searchTerm, setSearchTerm] = useState("");')

        # The fetchExperiences
        old_fetch = '''  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(/api/property/experiences?propertyId=);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExperiences(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load experiences");
    } finally {
      setLoading(false);
    }
  }, [propertyId]);'''

        new_fetch = '''  const fetchExperiences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(/api/property/experiences?propertyId=);
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
  }, [propertyId]);'''

        if old_fetch in s_page:
            s_page = s_page.replace(old_fetch, new_fetch)
        
        # The Add handler
        old_handler = '''  const handleAddFromLibrary = useCallback(async (template: typeof PREDEFINED_TEMPLATES[0]) => {
    try {
      const res = await fetch("/api/property/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          ...template,
          slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        })
      });
      
      if (!res.ok) throw new Error("Failed to add experience");
      
      toast.success(${template.title} added to your property);
      setShowLibrary(false);
      fetchExperiences();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add experience from library");
    }
  }, [propertyId, fetchExperiences]);'''

        new_handler = '''  const handleAddFromLibrary = useCallback(async (templates: typeof PREDEFINED_TEMPLATES) => {
    try {
      setIsSaving(true);
      
      const promises = templates.map(template => 
        fetch("/api/property/experiences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId,
            ...template,
            slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          })
        }).then(async res => {
          if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            if (res.status !== 409) {
              throw new Error(errJson.error || errJson.message || "Failed to add");
            }
          }
          return res;
        })
      );

      await Promise.all(promises);
      
      toast.success(${templates.length} experiences added to your property);
      setShowLibrary(false);
      fetchExperiences();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add some experiences from library");
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
      
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "Failed to create experience");
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
  }, [propertyId, fetchExperiences]);'''
        
        if old_handler in s_page:
            s_page = s_page.replace(old_handler, new_handler)
            
        old_btn1 = '''          <button 
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
          </button>'''

        new_btn1 = '''          <button 
            onClick={() => setShowLibrary(true)}
            className="group flex items-center gap-4 bg-white dark:bg-[#0E5A75]/20 px-8 py-5 rounded-[24px] border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20 dark:hover:border-[#FCBC43]/20 shadow-premium transition-all duration-500"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#0E5A75]/5 dark:bg-[#FCBC43]/10 flex items-center justify-center text-[#0E5A75] dark:text-[#FCBC43] group-hover:bg-[#0E5A75] group-hover:text-white transition-all">
              <Sparkles size={20} />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-[#0E5A75]/40 dark:text-white/40 uppercase tracking-widest mb-0.5">Explore</p>
              <p className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-tighter">Library</p>
            </div>
          </button>

          <button 
            onClick={() => setShowCustomForm(true)}
            className="h-20 w-20 rounded-[24px] bg-[#0E5A75] dark:bg-[#FCBC43] text-white dark:text-[#053344] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#0E5A75]/20 dark:shadow-[#FCBC43]/20"
          >
            <Plus size={32} strokeWidth={3} />
          </button>'''

        if old_btn1 in s_page:
            s_page = s_page.replace(old_btn1, new_btn1)

        old_render = '''      {showLibrary && (
        <ExperienceLibrary 
          onAdd={handleAddFromLibrary}
          onClose={() => setShowLibrary(false)}
        />
      )}'''
        
        new_render = '''      {showLibrary && (
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
      )}'''
        if old_render in s_page:
            s_page = s_page.replace(old_render, new_render)
            
    p_page.write_text(s_page)

# 3. Fix ExperienceLibrary.tsx
p_lib = Path('/home/apurv_patel/home4stay/apps/main-site/src/components/experiences/ExperienceLibrary.tsx')
if p_lib.exists():
    s_lib = p_lib.read_text()
    
    if 'existingSlugs?: string[]' not in s_lib:
        s_lib = s_lib.replace('import { Sparkles, Mountain, Utensils, Music, Coffee, Compass, Heart } from "lucide-react";', 'import React, { useState } from "react";\\nimport { Sparkles, Mountain, Utensils, Music, Coffee, Compass, Heart, CheckCircle2 } from "lucide-react";')
        
        s_lib = s_lib.replace('import React from "react";\\nimport React, { useState } from "react";', 'import React, { useState } from "react";')
        
        old_props = '''interface ExperienceLibraryProps {
  onAdd: (template: typeof PREDEFINED_TEMPLATES[0]) => void;
  onClose: () => void;
}

export function ExperienceLibrary({ onAdd, onClose }: ExperienceLibraryProps) {'''
        
        new_props = '''interface ExperienceLibraryProps {
  existingSlugs?: string[];
  onAddMultiple: (templates: typeof PREDEFINED_TEMPLATES) => void;
  onClose: () => void;
}

export function ExperienceLibrary({ existingSlugs = [], onAddMultiple, onClose }: ExperienceLibraryProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleSelection = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) {
      next.delete(idx);
    } else {
      next.add(idx);
    }
    setSelectedIndices(next);
  };

  const handleAddSelected = () => {
    const selectedTemplates = PREDEFINED_TEMPLATES.filter((_, idx) => selectedIndices.has(idx));
    if (selectedTemplates.length > 0) {
      onAddMultiple(selectedTemplates);
    }
  };'''
        if old_props in s_lib:
            s_lib = s_lib.replace(old_props, new_props)

        old_map = '''          {PREDEFINED_TEMPLATES.map((template, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white dark:bg-[#0E5A75]/20 rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20 dark:hover:border-[#FCBC43]/20 transition-all duration-500 shadow-sm hover:shadow-xl flex flex-col"
            >'''
        new_map = '''          {PREDEFINED_TEMPLATES.map((template, idx) => {
            const tempSlug = template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-",).replace(/(^-|-$)/g, "");
            const isAlreadyAdded = existingSlugs.includes(tempSlug);
            const isSelected = selectedIndices.has(idx);

            return (
            <div 
              key={idx} 
              className={group relative bg-white dark:bg-[#0E5A75]/20 rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col }
              onClick={() => {
                if (!isAlreadyAdded) toggleSelection(idx);
              }}
            >
              {isSelected && (
                <div className="absolute top-4 left-4 z-10 w-8 h-8 bg-[#159665] rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in">
                  <CheckCircle2 size={18} />
                </div>
              )}'''
        if old_map in s_lib:
            s_lib = s_lib.replace(old_map, new_map)

        old_btn = '''                  <button 
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
}'''
        new_btn = '''                  <div className="px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                    {isAlreadyAdded ? (
                      <span className="text-[#0E5A75]/40 dark:text-white/40">Already Added</span>
                    ) : isSelected ? (
                      <span className="text-[#159665]">Selected</span>
                    ) : (
                      <span className="text-[#0E5A75] dark:text-[#FCBC43]">Select Template</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>

        <div className="p-6 border-t border-black/5 dark:border-white/5 bg-[#FDF6F1] dark:bg-[#0A0F1D] flex justify-between items-center">
          <span className="text-sm font-bold text-[#053344] dark:text-white">
            {selectedIndices.size} selected
          </span>
          <button
            onClick={handleAddSelected}
            disabled={selectedIndices.size === 0}
            className={px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-xl transition-all }
          >
            Add Selected Experiences
          </button>
        </div>
      </div>
    </div>
  );
}'''
        if old_btn in s_lib:
            s_lib = s_lib.replace(old_btn, new_btn)

    p_lib.write_text(s_lib)

print("done")

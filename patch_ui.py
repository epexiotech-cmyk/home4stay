from pathlib import Path
import re

# Fix ExperienceLibrary.tsx
p = Path('/home/apurv_patel/home4stay/apps/main-site/src/components/experiences/ExperienceLibrary.tsx')
s = p.read_text()

s = s.replace('import { Sparkles, Mountain, Utensils, Music, Coffee, Compass, Heart } from "lucide-react";', 'import { Sparkles, Mountain, Utensils, Music, Coffee, Compass, Heart, CheckCircle2 } from "lucide-react";\\nimport { useState } from "react";')

s = s.replace('''interface ExperienceLibraryProps {
  onAdd: (template: typeof PREDEFINED_TEMPLATES[0]) => void;
  onClose: () => void;
}

export function ExperienceLibrary({ onAdd, onClose }: ExperienceLibraryProps) {''', '''interface ExperienceLibraryProps {
  existingSlugs?: string[];
  onAddMultiple: (templates: typeof PREDEFINED_TEMPLATES) => void;
  onClose: () => void;
}

export function ExperienceLibrary({ existingSlugs = [], onAddMultiple, onClose }: ExperienceLibraryProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleSelection = (idx: number) => {
    const next = new Set(selectedIndices);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIndices(next);
  };

  const handleAddSelected = () => {
    const selectedTemplates = PREDEFINED_TEMPLATES.filter((_, idx) => selectedIndices.has(idx));
    if (selectedTemplates.length > 0) onAddMultiple(selectedTemplates);
  };''')

s = s.replace('''          {PREDEFINED_TEMPLATES.map((template, idx) => (
            <div 
              key={idx} 
              className="group relative bg-white dark:bg-[#0E5A75]/20 rounded-3xl overflow-hidden border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/20 dark:hover:border-[#FCBC43]/20 transition-all duration-500 shadow-sm hover:shadow-xl flex flex-col"
            >''', '''          {PREDEFINED_TEMPLATES.map((template, idx) => {
            const tempSlug = template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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
              )}''')

s = s.replace('''                  <button 
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
}''', '''                  <div className="px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
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

        {/* Sticky Footer */}
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
}''')

p.write_text(s)

# Fix page.tsx correctly
p2 = Path('/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner/experiences/page.tsx')
s2 = p2.read_text()

# We might need to clear out the previous partial replacement if it messed up.
# Let's just rewrite the specific handlers.
import re

s2 = s2.replace('import { ExperienceLibrary, PREDEFINED_TEMPLATES } from "@/components/experiences/ExperienceLibrary";', 'import { ExperienceLibrary, PREDEFINED_TEMPLATES } from "@/components/experiences/ExperienceLibrary";\\nimport { ExperienceFormModal } from "@/components/experiences/ExperienceFormModal";')

# State
s2 = s2.replace('''  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");''', '''  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");''')


# The original handleAddFromLibrary
handler_pattern = re.compile(r'  const handleAddFromLibrary = useCallback\(async \(template: typeof PREDEFINED_TEMPLATES\[0\]\) => \{.*?\n  \}, \[propertyId, fetchExperiences\]\);', re.DOTALL)

new_handlers = '''  const handleAddFromLibrary = useCallback(async (templates: typeof PREDEFINED_TEMPLATES) => {
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

  const handleCreateCustom = useCallback(async (data: any) => {
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
    } finally {
      setIsSaving(false);
    }
  }, [propertyId, fetchExperiences]);'''

if 'const handleAddFromLibrary = useCallback(async (templates: typeof PREDEFINED_TEMPLATES) => {' not in s2:
    if handler_pattern.search(s2):
        s2 = handler_pattern.sub(new_handlers, s2)
    else:
        # If it was already partially replaced but missing handleCreateCustom, let's fix it
        pass

# Add from Library button replacement
s2 = s2.replace('''          <button 
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0E5A75] text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-[#0E5A75]/20"
          >
            <Sparkles size={16} />
            <span>Add from Library</span>
          </button>''', '''          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCustomForm(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-[#0A0F1D] border border-black/10 dark:border-white/10 text-[#053344] dark:text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              <Plus size={16} />
              <span>Custom Experience</span>
            </button>
            <button 
              onClick={() => setShowLibrary(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#0E5A75] dark:bg-[#FCBC43] text-white dark:text-[#053344] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
            >
              <Sparkles size={16} />
              <span>Add from Library</span>
            </button>
          </div>''')

# Modals
s2 = s2.replace('''      {showLibrary && (
        <ExperienceLibrary 
          onAdd={handleAddFromLibrary}
          onClose={() => setShowLibrary(false)}
        />
      )}''', '''      {showLibrary && (
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
      )}''')

p2.write_text(s2)
print("done")

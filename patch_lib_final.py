from pathlib import Path

p_lib = Path('/home/apurv_patel/home4stay/apps/main-site/src/components/experiences/ExperienceLibrary.tsx')
if p_lib.exists():
    s_lib = p_lib.read_text(encoding='utf-8')
    
    old_imports = 'import React from "react";\nimport { Sparkles, Mountain, Utensils, Music, Coffee, Compass, Heart } from "lucide-react";'
    new_imports = 'import React, { useState } from "react";\nimport { Sparkles, Mountain, Utensils, Music, Coffee, Compass, Heart, CheckCircle2 } from "lucide-react";'
    if old_imports in s_lib:
        s_lib = s_lib.replace(old_imports, new_imports)
        
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
            const tempSlug = template.title.lower().replace(r'/[^a-z0-9]+/g', "-").replace(r'/(^-|-$)/g', "");
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
    # oops, tempSlug generator inside map uses JS regex. In python string literal I need to format it properly.
    new_map = new_map.replace("lower().replace(r'/[^a-z0-9]+/g', \"-\").replace(r'/(^-|-$)/g', \"\")", "toLowerCase().replace(/[^a-z0-9]+/g, \"-\").replace(/(^-|-$)/g, \"\")")

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

    p_lib.write_text(s_lib, encoding='utf-8')
    print("Patched ExperienceLibrary")
else:
    print("File not found")

import os
import re

path = '/home/apurv_patel/home4stay/apps/main-site/src/components/experiences/ExperienceLibrary.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace the icons in PREDEFINED_TEMPLATES with string identifiers
content = content.replace("icon: Sparkles,", 'icon: "sparkles",')
content = content.replace("icon: Utensils,", 'icon: "utensils",')
content = content.replace("icon: Music,", 'icon: "music",')
content = content.replace("icon: Mountain,", 'icon: "mountain",')
content = content.replace("icon: Heart,", 'icon: "heart",')
content = content.replace("icon: Compass,", 'icon: "compass",')
content = content.replace("icon: Coffee,", 'icon: "coffee",')

# 2. Add EXPERIENCE_ICONS map before export const PREDEFINED_TEMPLATES
icon_map_code = """
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
"""
content = content.replace('export const PREDEFINED_TEMPLATES', icon_map_code + '\nexport const PREDEFINED_TEMPLATES')

# 3. Update the rendering of template.icon
# We need to replace: <template.icon size={20} />
# with: 
# const Icon = EXPERIENCE_ICONS[template.icon as ExperienceIcon] || Sparkles;
# <Icon size={20} />

old_icon_render = """                  <div className="w-10 h-10 rounded-xl bg-[#0E5A75]/5 dark:bg-[#FCBC43]/10 flex items-center justify-center text-[#0E5A75] dark:text-[#FCBC43]">
                    <template.icon size={20} />
                  </div>"""

new_icon_render = """                  <div className="w-10 h-10 rounded-xl bg-[#0E5A75]/5 dark:bg-[#FCBC43]/10 flex items-center justify-center text-[#0E5A75] dark:text-[#FCBC43]">
                    {(() => {
                      const Icon = EXPERIENCE_ICONS[template.icon as ExperienceIcon] || Sparkles;
                      return <Icon size={20} />;
                    })()}
                  </div>"""

content = content.replace(old_icon_render, new_icon_render)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("ExperienceLibrary.tsx patched successfully")

from pathlib import Path
import re

p_lib = Path('/home/apurv_patel/home4stay/apps/main-site/src/components/experiences/ExperienceLibrary.tsx')
s_lib = p_lib.read_text(encoding='utf-8')

# Let's replace line 143 specifically
lines = s_lib.split('\n')
for i, line in enumerate(lines):
    if 'className={group relative' in line:
        lines[i] = '              className={group relative bg-white dark:bg-[#0E5A75]/20 rounded-3xl overflow-hidden border transition-all duration-500 flex flex-col }'

s_lib = '\n'.join(lines)
p_lib.write_text(s_lib, encoding='utf-8')
print("Patched completely.")

import re

# 1. page.tsx
page_path = '/home/apurv_patel/home4stay/apps/main-site/src/app/property/[slug]/page.tsx'
with open(page_path, 'r') as f:
    content = f.read()
target_amenity_btn = """View All 48 Amenities"""
replace_amenity_btn = """View All Amenities"""
content = content.replace(target_amenity_btn, replace_amenity_btn)
with open(page_path, 'w') as f:
    f.write(content)

# 2. MealPlans.tsx
meal_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/MealPlans.tsx'
with open(meal_path, 'r') as f:
    content = f.read()
# Removing MEAL_PLANS array
content = re.sub(r'const MEAL_PLANS: MealPlan\[\] = \[.*?\];\n\n', '', content, flags=re.DOTALL)
with open(meal_path, 'w') as f:
    f.write(content)

# 3. RoomSelection.tsx
room_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/RoomSelection.tsx'
with open(room_path, 'r') as f:
    content = f.read()
# Removing ROOMS array
content = re.sub(r'const ROOMS: RoomType\[\] = \[.*?\];\n\n', '', content, flags=re.DOTALL)
# Fixing description fallback
target_desc = """room.description || "Experience the pinnacle of mountain luxury in our signature accommodation.", """
replace_desc = """room.description || "Experience our signature accommodation.","""
content = content.replace(target_desc, replace_desc)
with open(room_path, 'w') as f:
    f.write(content)

# 4. NarrativeCardStack.tsx
narrative_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/NarrativeCardStack.tsx'
with open(narrative_path, 'r') as f:
    content = f.read()
target_hints = """  const storyHints = [
    { title: "Architecture", desc: "Designed to merge seamlessly with the mountain horizon." },
    { title: "Interiors", desc: "Curated with raw local materials and ambient warming tones." },
    { title: "Surroundings", desc: "Private access trails wrapped in pristine golden light." },
    { title: "Atmosphere", desc: "Immersive silence tailored for undisturbed rejuvenation." },
  ];"""
replace_hints = """  const storyHints = [
    { title: "Design", desc: "Thoughtfully curated spaces for your comfort." },
    { title: "Ambiance", desc: "A welcoming atmosphere to relax and unwind." },
    { title: "Experience", desc: "Tailored to provide a memorable stay." },
    { title: "Comfort", desc: "Modern amenities blended with elegant touches." },
  ];"""
content = content.replace(target_hints, replace_hints)
with open(narrative_path, 'w') as f:
    f.write(content)

print("Step 8 Patch applied successfully.")

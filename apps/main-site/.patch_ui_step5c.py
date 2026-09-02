import re

# 1. page.tsx
page_path = '/home/apurv_patel/home4stay/apps/main-site/src/app/property/[slug]/page.tsx'
with open(page_path, 'r') as f:
    content = f.read()

page_target_hero = """        <BrandedHero 
          name={branding.heroTitle || ""}
          image={branding.heroBackground}
          location={property.location || "Mountain Highlands"}
          rating={property.rating || 4.9}
          tagline={branding.heroTagline}
          phone={branding.contact?.phone}
          whatsapp={activeWhatsapp}
        />"""
page_replace_hero = """        <BrandedHero 
          name={branding.heroTitle || ""}
          image={branding.heroBackground}
          location={property.location || undefined}
          rating={property.rating || undefined}
          tagline={branding.heroTagline}
          phone={branding.contact?.phone || property.contact?.phone}
          whatsapp={activeWhatsapp || property.contact?.whatsapp}
        />"""

if "location={property.location || undefined}" not in content:
    content = content.replace(page_target_hero, page_replace_hero)

page_target_meals = """          {/* 6. Gastronomy / Meal Plans */}
          <MealPlans />"""
page_replace_meals = """          {/* 6. Gastronomy / Meal Plans */}
          {property.mealPlans && property.mealPlans.length > 0 && (
            <MealPlans plans={property.mealPlans} />
          )}"""

if "plans={property.mealPlans}" not in content:
    content = content.replace(page_target_meals, page_replace_meals)

with open(page_path, 'w') as f:
    f.write(content)

# 2. MealPlans.tsx
meal_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/MealPlans.tsx'
with open(meal_path, 'r') as f:
    content = f.read()

meal_target_default = "export default function MealPlans() {"
meal_replace_default = "export default function MealPlans({ plans }: { plans?: MealPlan[] }) {"

meal_target_map = "MEAL_PLANS.map((plan)"
meal_replace_map = "(plans || []).map((plan)"

meal_target_find = "MEAL_PLANS.find(p => p.id === id)"
meal_replace_find = "(plans || []).find(p => p.id === id)"

if "plans?: MealPlan[]" not in content:
    content = content.replace(meal_target_default, meal_replace_default)
    content = content.replace(meal_target_map, meal_replace_map)
    content = content.replace(meal_target_find, meal_replace_find)
    with open(meal_path, 'w') as f:
        f.write(content)

# 3. RoomSelection.tsx
room_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/RoomSelection.tsx'
with open(room_path, 'r') as f:
    content = f.read()

room_target_size = """    size: room.size || "450 sq ft",
    occupancy: room.capacity || room.occupancy || "2 Adults",
    bedType: room.bedType || "King Sized",
    view: room.view || "Mountain View",
    tags: room.tags || ["Premium", "Featured"],
    amenities: room.amenities || ["Wi-Fi", "Room Service", "Coffee Maker", "Mountain View"]"""
room_replace_size = """    size: room.size || undefined,
    occupancy: room.capacity || room.occupancy || "2 Guests",
    bedType: room.bedType || undefined,
    view: room.view || undefined,
    tags: room.tags || [],
    amenities: room.amenities || []"""

if "size: room.size || undefined" not in content:
    content = content.replace(room_target_size, room_replace_size)
    with open(room_path, 'w') as f:
        f.write(content)

# 4. BrandedHero.tsx
hero_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/BrandedHero.tsx'
with open(hero_path, 'r') as f:
    content = f.read()

hero_props = """interface BrandedHeroProps {
  name: string;
  image: string;
  location: string;
  rating: number;
  tagline?: string;
  phone?: string;
  whatsapp?: string;
}"""
hero_props_rep = """interface BrandedHeroProps {
  name: string;
  image: string;
  location?: string;
  rating?: number;
  tagline?: string;
  phone?: string;
  whatsapp?: string;
}"""

hero_ui = """          <div className="flex flex-col md:flex-row md:items-center gap-8 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-1 text-[#FCBC43]">
                {[...Array(5)].map((_, i) => <Star key={`hero-star-${i}`} size={20} fill={i < Math.floor(rating) ? "currentColor" : "none"} />)}
              </div>
              <span className="text-xl font-black text-white">{rating} <span className="text-white/40 text-sm font-bold uppercase tracking-widest ml-2">Verified Rating</span></span>
            </div>
            
            {tagline && ("""
hero_ui_rep = """          <div className="flex flex-col md:flex-row md:items-center gap-8 pt-4">
            {rating && (
              <div className="flex items-center gap-4">
                <div className="flex gap-1 text-[#FCBC43]">
                  {[...Array(5)].map((_, i) => <Star key={`hero-star-${i}`} size={20} fill={i < Math.floor(rating) ? "currentColor" : "none"} />)}
                </div>
                <span className="text-xl font-black text-white">{rating} <span className="text-white/40 text-sm font-bold uppercase tracking-widest ml-2">Verified Rating</span></span>
              </div>
            )}
            
            {tagline && ("""

if "location?: string" not in content:
    content = content.replace(hero_props, hero_props_rep)
    content = content.replace(hero_ui, hero_ui_rep)
    with open(hero_path, 'w') as f:
        f.write(content)

print("Step 5C UI patched")

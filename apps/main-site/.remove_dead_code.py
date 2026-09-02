import re

# 1. MealPlans.tsx
meal_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/MealPlans.tsx'
with open(meal_path, 'r') as f:
    content = f.read()

# Remove MEAL_PLANS array entirely
target_meal_plans = """const MEAL_PLANS: MealPlan[] = [
  {
    id: "MP-001",
    name: "European Plan",
    label: "EP",
    description: "Accommodation only. Perfect for guests who prefer to explore local dining options.",
    price: 0,
    isPopular: false,
    inclusions: ["Room Accommodation", "Welcome Drink", "Complimentary Wi-Fi", "Access to Resort Amenities"]
  },
  {
    id: "MP-002",
    name: "Continental Plan",
    label: "CP",
    description: "Start your day right with our signature breakfast experience overlooking the valley.",
    price: 1200,
    isPopular: true,
    inclusions: ["Room Accommodation", "Premium Buffet Breakfast", "Welcome Drink", "Complimentary Wi-Fi"]
  },
  {
    id: "MP-003",
    name: "Modified American Plan",
    label: "MAP",
    description: "Half-board dining featuring our renowned breakfast and choice of lunch or dinner.",
    price: 2800,
    isPopular: false,
    inclusions: ["Room Accommodation", "Premium Buffet Breakfast", "Choice of Lunch OR Dinner", "Evening Hi-Tea"]
  }
];"""

content = content.replace(target_meal_plans, "")

with open(meal_path, 'w') as f:
    f.write(content)


# 2. RoomSelection.tsx
room_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/RoomSelection.tsx'
with open(room_path, 'r') as f:
    content = f.read()

target_rooms = """const ROOMS: RoomType[] = [
  {
    id: "RT-001",
    name: "Royal Heritage Suite",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?auto=format&fit=crop&q=80&w=1200",
    description: "Our signature suite offering unmatched luxury with panoramic views of the heritage architecture.",
    price: 12500,
    size: "850 sq ft",
    occupancy: "2 Adults + 1 Child",
    bedType: "King Sized",
    view: "Palace & Lake View",
    tags: ["Private Balcony", "Golden Hour View", "Floor 2"],
    amenities: ["Mini Bar", "Walk-in Closet", "Rain Shower", "Espresso Machine"]
  },
  {
    id: "RT-002",
    name: "Premium Garden Room",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200",
    description: "A serene escape nestled within our lush tropical gardens, perfect for a peaceful retreat.",
    price: 8200,
    size: "550 sq ft",
    occupancy: "2 Adults",
    bedType: "Queen Sized",
    view: "Tropical Garden",
    tags: ["Ground Floor", "Private Deck"],
    amenities: ["Outdoor Shower", "Hammock", "Organic Toiletries"]
  }
];"""

content = content.replace(target_rooms, "")

target_source = """  // If rooms is empty array, it means DB explicitly has 0 rooms. If undefined, fallback to mock.
  const sourceRooms = rooms !== undefined ? rooms : ROOMS;"""
replace_source = """  const sourceRooms = rooms || [];"""

content = content.replace(target_source, replace_source)

with open(room_path, 'w') as f:
    f.write(content)

print("Dead code removed")

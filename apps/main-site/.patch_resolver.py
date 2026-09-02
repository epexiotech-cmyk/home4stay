import os
import re

file_path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts'

with open(file_path, 'r') as f:
    content = f.read()

adapter_code = """
export function mapPrismaPropertyToExtended(db: any): Partial<ExtendedProperty> {
  if (!db) return {};
  
  const extended: Partial<ExtendedProperty> = {
    id: db.id,
    name: db.title,
    status: db.status,
    description: db.shortDescription || undefined,
  };
  
  // Media Assets Mapping
  if (db.mediaAssets && Array.isArray(db.mediaAssets)) {
    // Hero / General images
    const heroAssets = db.mediaAssets.filter((m: any) => m.assetType === "HERO" || m.assetType === "LUXURY");
    if (heroAssets.length > 0) {
      extended.images = heroAssets.map((m: any) => m.url);
    } else if (db.mediaAssets.length > 0) {
      extended.images = [db.mediaAssets[0].url];
    }
    
    // Gallery Mapping
    const galleryAssets = db.mediaAssets.filter((m: any) => m.assetType === "GALLERY");
    if (galleryAssets.length > 0) {
      extended.gallery = galleryAssets.map((m: any) => ({
        url: m.url,
        category: m.tags ? m.tags.split(',')[0] : "Gallery",
        description: m.fileName
      }));
    } else if (db.mediaAssets.length > 0) {
      extended.gallery = db.mediaAssets.map((m: any) => ({
        url: m.url,
        category: m.assetType || "Gallery",
        description: m.fileName
      }));
    }
  }
  
  // Rooms Mapping
  if (db.rooms && Array.isArray(db.rooms) && db.rooms.length > 0) {
    extended.rooms = db.rooms.map((r: any) => {
      let imageUrl = "";
      if (Array.isArray(r.images) && r.images.length > 0) imageUrl = r.images[0];
      else if (typeof r.images === 'string') imageUrl = r.images;
      
      return {
        id: r.id,
        name: r.name,
        price: r.price || 0,
        capacity: r.capacity || "2 Guests",
        view: r.view || "Standard View",
        image: imageUrl,
        description: r.roomType || "",
        tags: [],
        amenities: []
      };
    });
  }
  
  // Amenities Mapping
  if (db.amenities && Array.isArray(db.amenities) && db.amenities.length > 0) {
    extended.amenities = db.amenities.map((a: any) => ({
      icon: "Sparkles", // Fallback, could map categories to icons
      label: a.name
    }));
  }
  
  // CMS Page Content Mapping
  if (db.pageContent && Array.isArray(db.pageContent.sections)) {
    extended.pageContent = {
      sections: db.pageContent.sections
    };
  }
  
  // Owner Mapping
  if (db.owner) {
    extended.owner = {
      name: db.owner.name || "Owner",
      avatar: "", 
      rating: 5.0,
      reviewsCount: 0,
      isSuperhost: true,
      bio: "Verified Host",
      message: "Welcome to our property."
    };
  }

  // Policies Mapping
  if (db.policies) {
    extended.policies = {
      checkIn: db.policies.checkInTime,
      checkOut: db.policies.checkOutTime,
      cancellation: db.policies.cancellationPolicy,
      petPolicy: db.policies.petsAllowed ? "Pets are welcome." : "No pets allowed."
    };
  }

  return extended;
}
"""

if "mapPrismaPropertyToExtended" not in content:
    content = content.replace('export async function resolvePropertyContext', adapter_code + '\nexport async function resolvePropertyContext')

# Fix the import for tenantUtils to get PROPERTY_INCLUDES
content = content.replace(
    'import { getPropertyBySlug } from "@/lib/tenant/tenantUtils";', 
    'import { getPropertyBySlug, PROPERTY_INCLUDES } from "@/lib/tenant/tenantUtils";'
)

# Fix the fallback query in resolvePropertyContext
content = re.sub(
    r'where:\s*{\s*id:\s*identifier\s*}', 
    r'where: { id: identifier }, include: PROPERTY_INCLUDES', 
    content
)

# Fix the merge logic
merge_target = """  const merged = {
    ...(baselineProperty || {}),
    ...(persistentDbRecord || {}),
    name:
      (persistentDbRecord?.name as string | undefined) ||
      (persistentDbRecord?.title as string | undefined) ||
      (baselineProperty as ExtendedProperty | null)?.name ||
      "",
  } as ExtendedProperty;"""

merge_replacement = """  const adaptedDbRecord = persistentDbRecord ? mapPrismaPropertyToExtended(persistentDbRecord) : {};
  
  const merged = {
    ...(baselineProperty || {}),
    ...adaptedDbRecord,
    name: adaptedDbRecord.name || (baselineProperty as ExtendedProperty | null)?.name || "",
  } as ExtendedProperty;"""

if merge_target in content:
    content = content.replace(merge_target, merge_replacement)
else:
    print("Warning: Merge target not found exactly as expected.")

with open(file_path, 'w') as f:
    f.write(content)

print("contextResolver.ts patched")

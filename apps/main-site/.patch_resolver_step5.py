import re

path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts'

with open(path, 'r') as f:
    content = f.read()

# 1. Base property fields
prop_target = """  const extended: Partial<ExtendedProperty> = {
    id: db.id,
    name: db.title,
    status: db.status,
    description: db.shortDescription || undefined,
  };"""
prop_replace = """  const extended: Partial<ExtendedProperty> = {
    id: db.id,
    name: db.title,
    status: db.status,
    description: db.shortDescription || undefined,
  };
  
  if (db.location) (extended as any).location = db.location;
  if (db.contactPhone || db.contactWhatsapp) {
    (extended as any).contact = { phone: db.contactPhone, whatsapp: db.contactWhatsapp };
  }
  if (db.aggregateRating !== null && db.aggregateRating !== undefined) {
    (extended as any).rating = db.aggregateRating;
  }
  if (db.mealPlans && Array.isArray(db.mealPlans)) {
    (extended as any).mealPlans = db.mealPlans;
  }"""
if "db.contactPhone" not in content:
    content = content.replace(prop_target, prop_replace)

# 2. Rooms mapping
rooms_target = """        image: imageUrl,
        description: r.roomType || "",
        tags: [],
        amenities: []
      };"""
rooms_replace = """        image: imageUrl,
        description: r.roomType || "",
        size: r.sizeSqFt ? `${r.sizeSqFt} sq ft` : undefined,
        bedType: r.bedType || undefined,
        tags: Array.isArray(r.tags) && r.tags.length > 0 ? r.tags : undefined,
        amenities: []
      };"""
if "r.sizeSqFt" not in content:
    content = content.replace(rooms_target, rooms_replace)

# 3. Owner mapping
owner_target = """  if (db.owner) {
    extended.owner = {
      name: db.owner.name || "Owner",
      avatar: "", 
      rating: 5.0,
      reviewsCount: 0,
      isSuperhost: true,
      bio: "Verified Host",
      message: "Welcome to our property."
    };
  }"""
owner_replace = """  if (db.owner) {
    const hp = db.owner.hostProfile;
    extended.owner = {
      name: db.owner.name || "Owner",
      avatar: "", 
      rating: hp?.rating ?? undefined,
      reviewsCount: hp?.reviewsCount ?? undefined,
      isSuperhost: hp?.isSuperhost ?? undefined,
      bio: hp?.bio ?? undefined,
      message: "Welcome to our property."
    };
  }"""
if "const hp = db.owner.hostProfile;" not in content:
    content = content.replace(owner_target, owner_replace)

# 4. Policies Mapping
pol_target = """  if (db.policies) {
    extended.policies = {
      checkIn: db.policies.checkInTime,
      checkOut: db.policies.checkOutTime,
      cancellation: db.policies.cancellationPolicy,
      petPolicy: db.policies.petsAllowed ? "Pets are welcome." : "No pets allowed."
    };
  }"""
pol_replace = """  if (db.policies) {
    extended.policies = {
      checkIn: db.policies.checkInTime,
      checkOut: db.policies.checkOutTime,
      cancellation: db.policies.cancellationPolicy,
      petPolicy: db.policies.petsAllowed ? "Pets are welcome." : "No pets allowed.",
      houseRules: db.policies.houseRules || undefined
    } as any;
  }"""
if "houseRules: db.policies.houseRules" not in content:
    content = content.replace(pol_target, pol_replace)

# 5. FAQs and SEO JSON
cms_target = """  // CMS Page Content Mapping
  if (db.pageContent && Array.isArray(db.pageContent.sections)) {
    extended.pageContent = {
      sections: db.pageContent.sections
    };
  }"""
cms_replace = """  // CMS Page Content Mapping
  if (db.pageContent && Array.isArray(db.pageContent.sections)) {
    extended.pageContent = {
      sections: db.pageContent.sections
    };
    
    // Extract FAQs
    const faqSection = db.pageContent.sections.find((s: any) => s.type === 'faq');
    if (faqSection && faqSection.data && Array.isArray(faqSection.data.items)) {
      extended.faqs = faqSection.data.items;
    }
    
    // Extract SEO
    const seoSection = db.pageContent.sections.find((s: any) => s.type === 'seo');
    if (seoSection && seoSection.data) {
      extended.seo = {
        title: seoSection.data.title,
        description: seoSection.data.description,
        keywords: seoSection.data.keywords,
        ogImage: seoSection.data.ogImage
      };
    }
  }"""
if "Extract FAQs" not in content:
    content = content.replace(cms_target, cms_replace)

with open(path, 'w') as f:
    f.write(content)

print("contextResolver patched")

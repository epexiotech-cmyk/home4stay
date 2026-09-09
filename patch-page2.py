import os

path = '/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner/experiences/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the payload inside handleAddFromLibrary
old_payload = """          body: JSON.stringify({
            propertyId,
            ...template,
            slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
          })"""

new_payload = """          body: JSON.stringify({
            propertyId,
            title: template.title,
            slug: template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            description: template.description,
            category: template.category,
            price: template.price,
            isComplimentary: template.price === 0,
            duration: template.duration,
            isActive: true,
            isLibrary: true,
            icon: typeof template.icon === "string" ? template.icon : undefined,
            coverImage: template.coverImage
          })"""

content = content.replace(old_payload, new_payload)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("page.tsx payload patched successfully")

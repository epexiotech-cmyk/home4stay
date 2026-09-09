import os

path = '/home/apurv_patel/home4stay/apps/main-site/src/app/(portal)/partner/property-page-cms/page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

old_get = """        const res = await fetch(`/api/property/cms?propertyId=${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          setCmsData(data);
        }"""

new_get = """        const res = await fetch(`/api/property/cms?propertyId=${propertyId}`);
        if (res.ok) {
          const payload = await res.json();
          if (payload.success) {
            setCmsData(payload.data);
          } else {
            console.error("Failed to fetch CMS data:", payload.message);
          }
        }"""

old_post = """      const res = await fetch("/api/property/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          ...cmsData
        })
      });"""

new_post = """      const res = await fetch("/api/property/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          ...cmsData
        })
      });"""

content = content.replace(old_get, new_get)
# The post was already safe because cmsData is now the flat object!
# Wait, if we use ...cmsData and it's the flat object, it works perfectly!
# So we only needed to change the GET part.

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("page.tsx patched successfully.")

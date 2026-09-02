import re

# 1. contextResolver.ts
resolver_path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts'
with open(resolver_path, 'r') as f:
    content = f.read()

# Fix owner mapping
target_owner = """  // Owner Mapping
  if (db.owner) {
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
replace_owner = """  // Owner Mapping
  if (db.owner && db.owner.hostProfile) {
    const hp = db.owner.hostProfile;
    extended.owner = {
      name: db.owner.name || "Owner",
      avatar: "", 
      rating: hp?.rating ?? undefined,
      reviewsCount: hp?.reviewsCount ?? undefined,
      isSuperhost: hp?.isSuperhost ?? undefined,
      bio: hp?.bio ?? undefined,
      message: undefined
    };
  } else {
    extended.owner = undefined;
  }"""
content = content.replace(target_owner, replace_owner)

# Fix branding stats
target_branding = """    narrativeLabel: narrativeBlock?.data?.smallLabel || "","""
replace_branding = """    narrativeLabel: narrativeBlock?.data?.smallLabel || "",
    narrativeStats: narrativeBlock?.data?.stats || [],"""
content = content.replace(target_branding, replace_branding)

with open(resolver_path, 'w') as f:
    f.write(content)

# 2. HostSection.tsx
host_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/HostSection.tsx'
with open(host_path, 'r') as f:
    content = f.read()

target_message = """                 <h4 className="text-lg font-bold text-theme-primary mb-4 pl-4">A message from your host</h4>
                 <p className="text-[var(--text)] leading-relaxed pl-4 font-medium">
                    {owner.message}
                 </p>"""
replace_message = """                 {owner.message && (
                   <>
                     <h4 className="text-lg font-bold text-theme-primary mb-4 pl-4">A message from your host</h4>
                     <p className="text-[var(--text)] leading-relaxed pl-4 font-medium">
                        {owner.message}
                     </p>
                   </>
                 )}"""
content = content.replace(target_message, replace_message)

with open(host_path, 'w') as f:
    f.write(content)

# 3. page.tsx
page_path = '/home/apurv_patel/home4stay/apps/main-site/src/app/property/[slug]/page.tsx'
with open(page_path, 'r') as f:
    content = f.read()

target_stats = """                </div>
             </div>
             <div className="relative w-full">
                <NarrativeCardStack images={displayImages} />"""
replace_stats = """                  {branding.narrativeStats && branding.narrativeStats.length > 0 && (
                    <div className="grid grid-cols-2 gap-8 pt-6">
                      {branding.narrativeStats.map((stat: { label: string, value: string }, idx: number) => (
                        <div key={idx} className="space-y-2">
                          <p className="text-4xl font-black text-[var(--brand-primary,#0E5A75)]">{stat.value}</p>
                          <p className="text-[10px] font-black text-[var(--brand-primary,#0E5A75)]/40 uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
             </div>
             <div className="relative w-full">
                <NarrativeCardStack images={displayImages} />"""
content = content.replace(target_stats, replace_stats)

with open(page_path, 'w') as f:
    f.write(content)

print("Step 7 Patch applied successfully.")

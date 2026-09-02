import os

# 1. Patch BrandedHero.tsx
hero_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/BrandedHero.tsx'
with open(hero_path, 'r') as f:
    hero_content = f.read()

hero_target = """            <p className="text-lg md:text-xl font-medium text-white/70 max-w-xl leading-relaxed italic">
              {`"${tagline || 'Experience a new dimension of luxury hospitality where every moment is crafted to perfection.'}"`}
            </p>"""
hero_replace = """            {tagline && (
              <p className="text-lg md:text-xl font-medium text-white/70 max-w-xl leading-relaxed italic">
                "{tagline}"
              </p>
            )}"""
hero_content = hero_content.replace(hero_target, hero_replace)
with open(hero_path, 'w') as f:
    f.write(hero_content)

print("Patched BrandedHero.tsx")


# 2. Patch page.tsx
page_path = '/home/apurv_patel/home4stay/apps/main-site/src/app/property/[slug]/page.tsx'
with open(page_path, 'r') as f:
    page_content = f.read()

page_target = """                <p className="text-xl text-[#0E5A75]/60 font-medium leading-relaxed italic">
                  &quot;{property.description || 'Curated settings tailored to blend exceptional environments with unparalleled hospitality excellence.'}&quot;
                </p>"""
page_replace = """                {property.description && (
                  <p className="text-xl text-[#0E5A75]/60 font-medium leading-relaxed italic">
                    &quot;{property.description}&quot;
                  </p>
                )}"""
page_content = page_content.replace(page_target, page_replace)
with open(page_path, 'w') as f:
    f.write(page_content)

print("Patched page.tsx")


# 3. Patch contextResolver.ts
resolver_path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts'
with open(resolver_path, 'r') as f:
    res_content = f.read()

res_target = """    heroTagline: heroBlock?.data?.subtitle || property.tagline,
    heroBackground: heroBlock?.data?.backgroundImage || (property.images && property.images[0]) || "",
    narrativeHeading: narrativeBlock?.data?.mainHeading || "A sanctuary of",
    narrativeHighlight: narrativeBlock?.data?.highlightText || "timeless luxury.",
    narrativeLabel: narrativeBlock?.data?.smallLabel || "The Narrative","""

res_replace = """    heroTagline: heroBlock?.data?.subtitle || property.tagline || property.description || "",
    heroBackground: heroBlock?.data?.backgroundImage || (property.images && property.images[0]) || "",
    narrativeHeading: narrativeBlock?.data?.mainHeading || "",
    narrativeHighlight: narrativeBlock?.data?.highlightText || "",
    narrativeLabel: narrativeBlock?.data?.smallLabel || "","""

res_content = res_content.replace(res_target, res_replace)
with open(resolver_path, 'w') as f:
    f.write(res_content)

print("Patched contextResolver.ts")


# 4. Patch PolicyAndFAQSection.tsx
policy_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/PolicyAndFAQSection.tsx'
with open(policy_path, 'r') as f:
    pol_content = f.read()

pol_target = """          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PolicyCard 
              icon={Clock} 
              title="Check-in / Out" 
              content={`Check-in: ${policies?.checkIn || "12:00 PM"} \\n Check-out: ${policies?.checkOut || "10:00 AM"}`} 
            />
            <PolicyCard 
              icon={ShieldAlert} 
              title="Cancellation" 
              content={policies?.cancellation || "Standard cancellation rules apply."} 
            />
            <PolicyCard 
              icon={Info} 
              title="House Rules" 
              content="Respect quiet hours. No loud music after 10 PM. Please maintain local sensitivity." 
            />
            <PolicyCard 
              icon={HelpCircle} 
              title="Pet Policy" 
              content={policies?.petPolicy || "Please check with the host regarding pet friendliness."} 
            />
          </div>"""

pol_replace = """          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies?.checkIn || policies?.checkOut ? (
              <PolicyCard 
                icon={Clock} 
                title="Check-in / Out" 
                content={`Check-in: ${policies?.checkIn || "N/A"} \\n Check-out: ${policies?.checkOut || "N/A"}`} 
              />
            ) : null}
            {policies?.cancellation && (
              <PolicyCard 
                icon={ShieldAlert} 
                title="Cancellation" 
                content={policies?.cancellation} 
              />
            )}
            <PolicyCard 
              icon={Info} 
              title="House Rules" 
              content="Respect quiet hours. No loud music after 10 PM. Please maintain local sensitivity." 
            />
            {policies?.petPolicy && (
              <PolicyCard 
                icon={HelpCircle} 
                title="Pet Policy" 
                content={policies?.petPolicy} 
              />
            )}
          </div>"""

pol_content = pol_content.replace(pol_target, pol_replace)
with open(policy_path, 'w') as f:
    f.write(pol_content)

print("Patched PolicyAndFAQSection.tsx")

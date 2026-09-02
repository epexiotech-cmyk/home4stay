import re

# 1. types.ts
types_path = '/home/apurv_patel/home4stay/apps/main-site/src/properties-data/types.ts'
with open(types_path, 'r') as f:
    content = f.read()
target_types = """  responseTime?: string;
  languages?: string[];"""
replace_types = """  responseTime?: string;
  languages?: string[];
  isVerified?: boolean;"""
content = content.replace(target_types, replace_types)
with open(types_path, 'w') as f:
    f.write(content)

# 2. contextResolver.ts
resolver_path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts'
with open(resolver_path, 'r') as f:
    content = f.read()
target_owner = """    extended.owner = {
      name: db.owner.name || "Owner",
      avatar: "", 
      rating: hp?.rating ?? undefined,
      reviewsCount: hp?.reviewsCount ?? undefined,
      isSuperhost: hp?.isSuperhost ?? undefined,
      bio: hp?.bio ?? undefined,
      message: undefined
    };"""
replace_owner = """    const isUserVerified = db.owner.verifiedBadge || db.owner.kycStatus === "VERIFIED";
    extended.owner = {
      name: db.owner.name || "Owner",
      avatar: "", 
      rating: hp?.rating ?? undefined,
      reviewsCount: hp?.reviewsCount ?? undefined,
      isSuperhost: hp?.isSuperhost ?? undefined,
      bio: hp?.bio ?? undefined,
      message: undefined,
      isVerified: isUserVerified
    };"""
content = content.replace(target_owner, replace_owner)
with open(resolver_path, 'w') as f:
    f.write(content)

# 3. HostSection.tsx
host_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/HostSection.tsx'
with open(host_path, 'r') as f:
    content = f.read()
target_verified = """                 <div className="flex items-center gap-2 text-theme-primary font-black text-sm uppercase tracking-widest">
                    <ShieldCheck size={18} />
                    Verified Identity
                 </div>"""
replace_verified = """                 {owner.isVerified && (
                   <div className="flex items-center gap-2 text-theme-primary font-black text-sm uppercase tracking-widest">
                      <ShieldCheck size={18} />
                      Verified Identity
                   </div>
                 )}"""
content = content.replace(target_verified, replace_verified)
with open(host_path, 'w') as f:
    f.write(content)

# 4. BrandedHero.tsx
hero_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/BrandedHero.tsx'
with open(hero_path, 'r') as f:
    content = f.read()
# Removing the weather badge
target_weather = """          <div className="glass-matte px-4 py-2 rounded-full border-white/20 flex items-center gap-2">
            <Sun size={14} className="text-[#FCBC43]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">24°C • Golden Hour</span>
          </div>"""
content = content.replace(target_weather, "")
with open(hero_path, 'w') as f:
    f.write(content)

print("Step 9 Patch applied successfully.")

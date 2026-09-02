import re

# 1. PolicyAndFAQSection.tsx
policy_path = '/home/apurv_patel/home4stay/apps/main-site/src/components/property/PolicyAndFAQSection.tsx'
with open(policy_path, 'r') as f:
    content = f.read()

target1 = """  policies?: {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
    petPolicy?: string;
  };"""
replace1 = """  policies?: {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
    petPolicy?: string;
    houseRules?: string;
  };"""

content = content.replace(target1, replace1)

target2 = """            <PolicyCard 
              icon={Info} 
              title="House Rules" 
              content="Respect quiet hours. No loud music after 10 PM. Please maintain local sensitivity." 
            />"""
replace2 = """            {policies?.houseRules && (
              <PolicyCard 
                icon={Info} 
                title="House Rules" 
                content={policies?.houseRules} 
              />
            )}"""

content = content.replace(target2, replace2)

with open(policy_path, 'w') as f:
    f.write(content)


# 2. page.tsx
page_path = '/home/apurv_patel/home4stay/apps/main-site/src/app/property/[slug]/page.tsx'
with open(page_path, 'r') as f:
    content = f.read()

target3 = """                <div className="grid grid-cols-2 gap-8 pt-6">
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-[#0E5A75]">12+</p>
                    <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-[0.2em]">Luxury Experiences</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-[#0E5A75]">100%</p>
                    <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-[0.2em]">Privacy Guaranteed</p>
                  </div>
                </div>"""

content = content.replace(target3, "")

target4 = """                {((property.amenities && property.amenities.length > 0) ? property.amenities : (property.amenities ? [] : [
                  { icon: "Wifi", label: "High Speed Fiber Wi-Fi" },
                  { icon: "Car", label: "Private Secured Parking" },
                  { icon: "Tv", label: "Premium Entertainment" },
                  { icon: "Wind", label: "Climate Control" },
                  { icon: "Coffee", label: "Gourmet Kitchen" },
                  { icon: "Utensils", label: "Private Dining" },
                ])).map((item: { icon: string; label: string; detail?: string }, idx: number) => {"""

replace4 = """                {((property.amenities && property.amenities.length > 0) ? property.amenities : []).map((item: { icon: string; label: string; detail?: string }, idx: number) => {"""

content = content.replace(target4, replace4)

with open(page_path, 'w') as f:
    f.write(content)

print("Patch applied successfully.")

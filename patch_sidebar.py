from pathlib import Path

p = Path('/home/apurv_patel/home4stay/apps/main-site/src/components/layouts/PartnerLayout.tsx')
if p.exists():
    content = p.read_text(encoding='utf-8')
    
    # We will just replace these exact lines with an empty string
    target1 = '      { title: "Pricing", href: "/partner/pricing", icon: Tag },\n'
    target2 = '      { title: "Availability", href: "/partner/availability", icon: Clock },\n'
    
    if target1 in content:
        content = content.replace(target1, '')
    if target2 in content:
        content = content.replace(target2, '')
        
    p.write_text(content, encoding='utf-8')
    print("Successfully removed Pricing and Availability from sidebar")
else:
    print("File not found")

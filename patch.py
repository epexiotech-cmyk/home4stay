from pathlib import Path

p = Path('/home/apurv_patel/home4stay/apps/main-site/src/components/property/CustomizeStaySection.tsx')
s = p.read_text()

s = s.replace('fetch(/api/property/experiences?propertyId= + propertyId)', 'fetch(/api/properties/public/ + propertyId + /experiences)')
s = s.replace('fetch(/api/property/experiences?propertyId=$' + '{propertyId})', 'fetch(/api/properties/public/$' + '{propertyId}/experiences)')

s = s.replace('const data = await res.json();', 'const json = await res.json();\n          const data = json.success ? json.data : json;')

p.write_text(s)
print('Section patched.')

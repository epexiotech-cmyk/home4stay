from pathlib import Path

p = Path('/home/apurv_patel/home4stay/apps/main-site/src/components/property/CustomizeStaySection.tsx')
s = p.read_text()

s = s.replace('/api/property/experiences?propertyId=$', '/api/properties/public/$')
s = s.replace('/api/properties/public/$' + '{propertyId}', '/api/properties/public/$' + '{propertyId}/experiences')

p.write_text(s)
print('Patched URL')

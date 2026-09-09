import os

content = """import { NextResponse } from 'next/server';
import { propertyCmsService } from '@/lib/services/propertyCmsService';

export async function GET() {
  const propertyId = '275d806a-f76f-4f2b-8cda-b7a25af83d23'; // Royal Homes test property
  try {
    const data = await propertyCmsService.getCmsData(propertyId);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e.message });
  }
}"""

path = '/home/apurv_patel/home4stay/apps/main-site/src/app/api/diagnostic/route.ts'
os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Diagnostic route created.")

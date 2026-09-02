import re

path = '/home/apurv_patel/home4stay/apps/main-site/src/lib/tenant/contextResolver.ts'

with open(path, 'r') as f:
    content = f.read()

target = """export interface ExtendedProperty extends Partial<BaselineProperty> {
  id?: string;
  status?: string;
  pageContent?: {
    sections?: Section[];
  };
  amenities?: Array<{ icon: string, label: string }>;
  faqs?: Array<{ question: string, answer: string }>;
  policies?: {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
    petPolicy?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  offers?: Record<string, unknown>[];
}"""

replace = """export interface ExtendedProperty extends Partial<BaselineProperty> {
  id?: string;
  status?: string;
  location?: string;
  rating?: number;
  contact?: {
    phone?: string;
    whatsapp?: string;
  };
  mealPlans?: any[];
  pageContent?: {
    sections?: Section[];
  };
  amenities?: Array<{ icon: string, label: string }>;
  faqs?: Array<{ question: string, answer: string }>;
  policies?: {
    checkIn?: string;
    checkOut?: string;
    cancellation?: string;
    petPolicy?: string;
    houseRules?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  offers?: Record<string, unknown>[];
}"""

if "mealPlans?: any[];" not in content:
    content = content.replace(target, replace)

with open(path, 'w') as f:
    f.write(content)

print("contextResolver types patched")

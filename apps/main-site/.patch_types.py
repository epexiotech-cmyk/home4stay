import re

types_path = '/home/apurv_patel/home4stay/apps/main-site/src/properties-data/types.ts'
with open(types_path, 'r') as f:
    content = f.read()

target = """export interface Owner {
  name: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  isSuperhost: boolean;
  bio: string;
  message: string;
  responseTime?: string;
  languages?: string[];
}"""

replace = """export interface Owner {
  name: string;
  avatar?: string;
  rating?: number;
  reviewsCount?: number;
  isSuperhost?: boolean;
  bio?: string;
  message?: string;
  responseTime?: string;
  languages?: string[];
}"""

content = content.replace(target, replace)

with open(types_path, 'w') as f:
    f.write(content)

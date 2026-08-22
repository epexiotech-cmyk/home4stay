import re

file_path = '/home/apurv_patel/home4stay/apps/main-site/src/context/OnboardingContext.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Chunk 1
old_drafts = '''const INITIAL_DRAFTS: OnboardingDrafts = {
  propertyIdentity: { title: " \,

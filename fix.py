import base64
import os

file_path = 'apps/main-site/src/context/OnboardingContext.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    data = f.read()

target = """            // Reconstruct normalized draft shape from DB keys
            const normalized: Record<string, unknown> = {};
            Object.keys(STEP_TO_DRAFT_MAP).forEach(sId => {
              const draftKey = STEP_TO_DRAFT_MAP[sId];
              const rawData = drafts[sId];
              if (rawData) {
                const schema = stepSchemas[sId];
                if (schema) {
                  const check = schema.safeParse(rawData);
                  if (check.success) {
                    normalized[draftKey] = check.data;
                  } else {
                    console.warn(`[CORRUPT_RECOVERY] Step ${sId} schema mismatch. Falling back to default.`);
                    normalized[draftKey] = INITIAL_DRAFTS[draftKey as keyof OnboardingDrafts];
                  }
                } else {
                  normalized[draftKey] = rawData;
                }
              } else {
                normalized[draftKey] = INITIAL_DRAFTS[draftKey as keyof OnboardingDrafts];
              }
            });"""

replacement = """            // Reconstruct normalized draft shape from DB keys
            const normalized: Record<string, unknown> = {};
            Object.keys(STEP_TO_DRAFT_MAP).forEach(sId => {
              const draftKey = STEP_TO_DRAFT_MAP[sId];
              const rawData = drafts[sId];
              const initialValue = INITIAL_DRAFTS[draftKey as keyof OnboardingDrafts];

              if (rawData !== undefined && rawData !== null) {
                if (typeof rawData === 'object' && !Array.isArray(rawData)) {
                  // Merge partial object drafts with initial defaults
                  normalized[draftKey] = {
                    ...(initialValue as Record<string, unknown> || {}),
                    ...rawData
                  };
                } else {
                  // Use raw arrays/primitives directly
                  normalized[draftKey] = rawData;
                }
              } else {
                normalized[draftKey] = initialValue;
              }
            });"""

if target in data:
    new_data = data.replace(target, replacement)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_data)
    print('Successfully updated OnboardingContext.tsx')
else:
    print('Target content not found in OnboardingContext.tsx')
    exit(1)
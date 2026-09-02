const fs = require('fs');
const file = 'apps/main-site/src/context/OnboardingContext.tsx';
let data = fs.readFileSync(file, 'utf8');

const target =             // Reconstruct normalized draft shape from DB keys
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
                    console.warn(\[CORRUPT_RECOVERY] Step \ schema mismatch. Falling back to default.\);
                    normalized[draftKey] = INITIAL_DRAFTS[draftKey as keyof OnboardingDrafts];
                  }
                } else {
                  normalized[draftKey] = rawData;
                }
              } else {
                normalized[draftKey] = INITIAL_DRAFTS[draftKey as keyof OnboardingDrafts];
              }
            });;

const replacement =             // Reconstruct normalized draft shape from DB keys
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
            });;

if (data.includes(target)) {
    data = data.replace(target, replacement);
    fs.writeFileSync(file, data);
    console.log('Successfully updated OnboardingContext.tsx');
} else {
    console.error('Target content not found in OnboardingContext.tsx');
}

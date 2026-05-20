/**
 * Indian GST state codes mapping based on official government records.
 * Used to translate between 2-digit numeric codes, abbreviations (GJ, KA, etc.), and full names.
 */
export interface StateInfo {
  code: string;       // 2-digit numeric string (e.g., "24")
  name: string;       // Full name (e.g., "Gujarat")
  alias: string[];    // Abbreviations or aliases (e.g., ["GJ", "GUJARAT"])
}

export const INDIAN_STATES_MAPPING: StateInfo[] = [
  { code: "01", name: "Jammu & Kashmir", alias: ["JK", "JAMMU AND KASHMIR"] },
  { code: "02", name: "Himachal Pradesh", alias: ["HP", "HIMACHAL PRADESH"] },
  { code: "03", name: "Punjab", alias: ["PB", "PUNJAB"] },
  { code: "04", name: "Chandigarh", alias: ["CH", "CHANDIGARH"] },
  { code: "05", name: "Uttarakhand", alias: ["UK", "UA", "UTTARAKHAND", "UTTARANCHAL"] },
  { code: "06", name: "Haryana", alias: ["HR", "HARYANA"] },
  { code: "07", name: "Delhi", alias: ["DL", "DELHI"] },
  { code: "08", name: "Rajasthan", alias: ["RJ", "RAJASTHAN"] },
  { code: "09", name: "Uttar Pradesh", alias: ["UP", "UTTAR PRADESH"] },
  { code: "10", name: "Bihar", alias: ["BR", "BIHAR"] },
  { code: "11", name: "Sikkim", alias: ["SK", "SIKKIM"] },
  { code: "12", name: "Arunachal Pradesh", alias: ["AR", "ARUNACHAL PRADESH"] },
  { code: "13", name: "Nagaland", alias: ["NL", "NAGALAND"] },
  { code: "14", name: "Manipur", alias: ["MN", "MANIPUR"] },
  { code: "15", name: "Mizoram", alias: ["MZ", "MIZORAM"] },
  { code: "16", name: "Tripura", alias: ["TR", "TRIPURA"] },
  { code: "17", name: "Meghalaya", alias: ["ML", "MEGHALAYA"] },
  { code: "18", name: "Assam", alias: ["AS", "ASSAM"] },
  { code: "19", name: "West Bengal", alias: ["WB", "WEST BENGAL"] },
  { code: "20", name: "Jharkhand", alias: ["JH", "JHARKHAND"] },
  { code: "21", name: "Odisha", alias: ["OR", "OD", "ODISHA", "ORISSA"] },
  { code: "22", name: "Chhattisgarh", alias: ["CG", "CHHATTISGARH"] },
  { code: "23", name: "Madhya Pradesh", alias: ["MP", "MADHYA PRADESH"] },
  { code: "24", name: "Gujarat", alias: ["GJ", "GUJARAT"] },
  { code: "25", name: "Daman & Diu", alias: ["DD", "DAMAN AND DIU"] },
  { code: "26", name: "Dadra & Nagar Haveli", alias: ["DN", "DADRA AND NAGAR HAVELI"] },
  { code: "27", name: "Maharashtra", alias: ["MH", "MAHARASHTRA"] },
  { code: "28", name: "Andhra Pradesh (Old)", alias: ["AP", "ANDHRA PRADESH"] },
  { code: "29", name: "Karnataka", alias: ["KA", "KARNATAKA"] },
  { code: "30", name: "Goa", alias: ["GA", "GOA"] },
  { code: "31", name: "Lakshadweep", alias: ["LD", "LAKSHADWEEP"] },
  { code: "32", name: "Kerala", alias: ["KL", "KERALA"] },
  { code: "33", name: "Tamil Nadu", alias: ["TN", "TAMIL NADU"] },
  { code: "34", name: "Puducherry", alias: ["PY", "PUDUCHERRY", "PONDICHERRY"] },
  { code: "35", name: "Andaman & Nicobar Islands", alias: ["AN", "ANDAMAN AND NICOBAR"] },
  { code: "36", name: "Telangana", alias: ["TS", "TG", "TELANGANA"] },
  { code: "37", name: "Andhra Pradesh (New)", alias: ["AD", "ANDHRA PRADESH NEW"] },
  { code: "38", name: "Ladakh", alias: ["LA", "LADAKH"] }
];

/**
 * Normalizes a state name, abbreviation, or numeric string to its standard 2-digit code.
 */
export function resolveStateCode(stateInput: string): string | null {
  if (!stateInput) return null;
  const cleanInput = stateInput.trim().toUpperCase();

  // If it's already a numeric string, pad and find
  if (/^\d{1,2}$/.test(cleanInput)) {
    const formatted = cleanInput.padStart(2, "0");
    const found = INDIAN_STATES_MAPPING.find(s => s.code === formatted);
    return found ? found.code : null;
  }

  // Find by full name or aliases
  const found = INDIAN_STATES_MAPPING.find(
    s => s.name.toUpperCase() === cleanInput || s.alias.includes(cleanInput)
  );
  return found ? found.code : null;
}

/**
 * Resolves full state name from any code, alias, or state input.
 */
export function resolveStateName(stateInput: string): string | null {
  const code = resolveStateCode(stateInput);
  if (!code) return null;
  const found = INDIAN_STATES_MAPPING.find(s => s.code === code);
  return found ? found.name : null;
}

/**
 * Validates the structure and integrity of an Indian GSTIN (Goods and Services Tax Identification Number).
 * GSTIN structure: 2 digits state code + 10 chars PAN + 1 digit entity number + 1 char default 'Z' + 1 char checksum
 */
export function validateGSTIN(gstin: string, stateInput?: string): { valid: boolean; error?: string } {
  if (!gstin) {
    return { valid: false, error: "GSTIN cannot be empty" };
  }

  const cleanGstin = gstin.trim().toUpperCase();

  if (cleanGstin.length !== 15) {
    return { valid: false, error: "GSTIN must be exactly 15 characters" };
  }

  // Standard Indian government GSTIN validation regex pattern
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleanGstin)) {
    return { valid: false, error: "Invalid GSTIN format (typical format: 24ABCDE1234F1Z5)" };
  }

  // Check state code prefix matching
  const stateCodePrefix = cleanGstin.substring(0, 2);
  const matchedState = INDIAN_STATES_MAPPING.find(s => s.code === stateCodePrefix);
  if (!matchedState) {
    return { valid: false, error: `Invalid state code prefix '${stateCodePrefix}' in GSTIN` };
  }

  // If a state input is provided, enforce that the GSTIN prefix matches the state
  if (stateInput) {
    const expectedCode = resolveStateCode(stateInput);
    if (!expectedCode) {
      return { valid: false, error: `Unsupported Indian state or code: '${stateInput}'` };
    }
    if (stateCodePrefix !== expectedCode) {
      const expectedName = resolveStateName(stateInput) || stateInput;
      return {
        valid: false,
        error: `GSTIN state code prefix '${stateCodePrefix}' does not match the billing state '${expectedName}' (expected prefix '${expectedCode}')`
      };
    }
  }

  return { valid: true };
}

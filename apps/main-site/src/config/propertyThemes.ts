export interface PropertyTheme {
  primary: string;
  foreground?: string; // Optional override for text on primary
}

export const propertyThemes: Record<string, PropertyTheme> = {
  shivay: {
    primary: "#0E5A75",
  },
  royalvilla: {
    primary: "#c9a227",
    foreground: "#111111",
  },
  beachstay: {
    primary: "#14b8a6",
  },
  mountainview: {
    primary: "#159665",
  },
  sunsetcrest: {
    primary: "#f24633",
  },
};

export type PropertySubdomain = keyof typeof propertyThemes;

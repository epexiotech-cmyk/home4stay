import propertyData from "./property.json";
import { PropertyMap } from "./types";

const data = propertyData as PropertyMap;

export function getProperty(slug: string) {
  if (!slug) return null;
  return data[slug] ?? null;
}

export function getPropertyOrThrow(slug: string) {
  const property = data[slug];
  if (!property) {
    throw new Error(`Property "${slug}" not found`);
  }
  return property;
}

export function getAllProperties() {
  return Object.entries(data).map(([slug, property]) => ({
    ...property,
    slug,
  }));
}

export * from "./types";

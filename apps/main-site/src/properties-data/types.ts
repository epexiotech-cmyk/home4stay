export interface Room {
  id?: string;
  name: string;
  price: number;
  capacity: string;
  view: string;
  image?: string;
  description?: string;
  size?: string;
  bedType?: string;
  tags?: string[];
  amenities?: string[];
  occupancy?: string; // Legacy/Mapping field
}

export interface SleepingArrangement {
  name: string;
  beds: string;
  image: string;
}

export interface Owner {
  name: string;
  avatar?: string;
  rating?: number;
  reviewsCount?: number;
  isSuperhost?: boolean;
  bio?: string;
  message?: string;
  responseTime?: string;
  languages?: string[];
  isVerified?: boolean;
}

export interface PropertyTheme {
  primary: string;
  secondary: string;
  accent: string;
  background?: string;
}

export interface GalleryImage {
  url: string;
  category: "Living Room" | "Bedrooms" | "Bathrooms" | "Exterior" | "Pool";
  description?: string;
}

export interface Property {
  name: string;
  location: string;
  price: number;
  rating: number;
  guests: string;
  description: string;
  tagline: string;
  rooms: Room[];
  sleepingArrangements?: SleepingArrangement[];
  owner?: Owner;
  createdAt: string;
  images: string[];
  gallery?: GalleryImage[];
  theme?: PropertyTheme;
  slug: string;
  type: string;
  image: string;
  themeColor?: string; // Legacy field, keeping for compatibility
  contact?: {
    phone: string;
    whatsapp: string;
  };
}

export type PropertyMap = Record<string, Property>;

import React from 'react';
import { 
  Car, 
  UtensilsCrossed, 
  Music, 
  Flower2, 
  Mountain, 
  Wind, 
  Map, 
  ChefHat, 
  Coffee, 
  Mic2,
  Heart,
  Gem,
  Tent,
  Smile,
  Baby,
  Users,
  Sparkles,
  Utensils,
  Compass,
  Footprints,
  Camera
} from "lucide-react";

export interface Experience {
  id: string;
  propertyId: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  price: number;
  isComplimentary: boolean;
  isFeatured: boolean;
  icon: string;
  coverImage?: string | null;
  duration?: string | null;
  maxGuests?: number | null;
  requiresScheduling: boolean;
  availabilityType: string;
  customAvailability?: Record<string, unknown> | unknown;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExperienceTemplate {
  title: string;
  slug: string;
  category: string;
  description: string;
  price: number;
  tag: string;
  icon: string;
  isFeatured: boolean;
}

export const EXPERIENCE_TEMPLATES = [
  {
    title: "Royal Arrival",
    slug: "royal-arrival",
    category: "Transportation",
    description: "Private airport & railway transfers with warmth, comfort, and effortless hospitality.",
    price: 1500,
    tag: "SEAMLESS",
    icon: "Car",
    isFeatured: true
  },
  {
    title: "Shaam-E-Dawat",
    slug: "shaam-e-dawat",
    category: "Romantic",
    description: "An intimate dining experience inspired by royal Indian evenings.",
    price: 4500,
    tag: "ROMANTIC",
    icon: "UtensilsCrossed",
    isFeatured: true
  },
  {
    title: "Mehfil Under The Stars",
    slug: "mehfil-under-the-stars",
    category: "Social",
    description: "Live music, warm conversations, bonfire moments, and mountain serenity.",
    price: 2000,
    tag: "SOCIAL",
    icon: "Music",
    isFeatured: false
  },
  {
    title: "Utsav Celebration",
    slug: "utsav-celebration",
    category: "Celebration",
    description: "Elegant floral décor and curated setups for unforgettable moments.",
    price: 3000,
    tag: "CELEBRATION",
    icon: "Flower2",
    isFeatured: false
  },
  {
    title: "Pahaadi Trails",
    slug: "pahaadi-trails",
    category: "Adventure",
    description: "Explore hidden mountain paths with local guides and authentic stories.",
    price: 1200,
    tag: "ADVENTURE",
    icon: "Mountain",
    isFeatured: false
  },
  {
    title: "Ayur Wellness Ritual",
    slug: "ayur-wellness-ritual",
    category: "Wellness",
    description: "Private yoga, sound healing, mindfulness, and rejuvenating therapies.",
    price: 3500,
    tag: "WELLNESS",
    icon: "Wind",
    isFeatured: true
  },
  {
    title: "Heritage Food Walk",
    slug: "heritage-food-walk",
    category: "Local Culture",
    description: "Discover authentic regional flavours through curated local food experiences.",
    price: 1800,
    tag: "CULTURAL",
    icon: "Map",
    isFeatured: false
  },
  {
    title: "Private Chef Experience",
    slug: "private-chef",
    category: "Dining",
    description: "Enjoy handcrafted meals prepared exclusively for your stay.",
    price: 5500,
    tag: "PREMIUM",
    icon: "ChefHat",
    isFeatured: true
  },
  {
    title: "Sunrise Tea Experience",
    slug: "sunrise-tea",
    category: "Wellness",
    description: "Traditional chai and peaceful sunrise moments in nature.",
    price: 800,
    tag: "WELLNESS",
    icon: "Coffee",
    isFeatured: false
  },
  {
    title: "Folk Music Evening",
    slug: "folk-music",
    category: "Cultural",
    description: "Immerse yourself in local music, storytelling, and cultural performances.",
    price: 2500,
    tag: "CULTURAL",
    icon: "Mic2",
    isFeatured: false
  }
];

export const EXPERIENCE_CATEGORIES = [
  "Romantic",
  "Wellness",
  "Adventure",
  "Dining",
  "Celebration",
  "Transportation",
  "Local Culture",
  "Family",
  "Premium",
  "Seasonal",
  "Kids",
  "Social"
];

export const ICON_MAP: Record<string, React.ElementType> = {
  Car,
  UtensilsCrossed,
  Music,
  Flower2,
  Mountain,
  Wind,
  Map,
  ChefHat,
  Coffee,
  Mic2,
  Heart,
  Gem,
  Tent,
  Smile,
  Baby,
  Users,
  Sparkles,
  Utensils,
  Compass,
  Footprints,
  Camera
};

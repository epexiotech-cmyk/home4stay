import { z } from 'zod';
import {
  createPropertySchema,
  updatePropertySchema,
  createFullPropertySchema,
} from '../validators/property.validators';

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;
export type UpdatePropertyDto = z.infer<typeof updatePropertySchema>;
export type CreateFullPropertyDto = z.infer<typeof createFullPropertySchema>;

export interface PropertyResponseDto {
  id: string;
  title: string;
  slug: string;
  propertyType: string | null;
  shortDescription: string | null;
  status: string;
  onboardingStatus: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  
  // Relations
  amenities?: any[];
  policies?: any | null;
  pricing?: any | null;
  rooms?: any[];
}

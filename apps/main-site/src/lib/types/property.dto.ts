export interface PropertyAmenityDto {
  category: string;
  name: string;
  isAvailable?: boolean;
}

export interface PropertyPolicyDto {
  checkInTime: string;
  checkOutTime: string;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  cancellationPolicy: string;
}

export interface PropertyPricingDto {
  basePrice: number;
  currency?: string;
  taxRate?: number;
}

export interface CreatePropertyDto {
  title: string;
  propertyType?: string;
  shortDescription?: string;
  status?: 'DRAFT' | 'SETUP_IN_PROGRESS' | 'READY_TO_LAUNCH' | 'LIVE' | 'SUSPENDED';
  ownerId: string;
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  onboardingStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'LIVE';
  publishedAt?: string | null;
}

export interface CreateFullPropertyDto extends CreatePropertyDto {
  amenities?: PropertyAmenityDto[];
  policies?: PropertyPolicyDto;
  pricing?: PropertyPricingDto;
}

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

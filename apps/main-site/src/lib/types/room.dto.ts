export interface CreateRoomDto {
  propertyId: string;
  name: string;
  price: number;
  capacity: string;
  view: string;
  roomType?: string;
  roomCount?: number;
  isActive?: boolean;
  images?: string[];
  amenities?: string[];
}

export interface UpdateRoomDto extends Partial<Omit<CreateRoomDto, 'propertyId'>> {}

export interface UpdateRoomInventoryDto {
  availableCount: number;
}

export interface StructuredCapacityDto {
  maxGuests: number;
  maxAdults?: number;
  maxChildren?: number;
}

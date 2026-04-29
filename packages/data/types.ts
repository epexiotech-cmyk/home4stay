export interface Room {
  name: string;
  price: number;
  capacity: string;
  view: string;
}

export interface Property {
  name: string;
  location: string;
  price: number;
  rating: number;
  guests: string;
  description: string;
  rooms: Room[];
  createdAt: string;
}

export type PropertyMap = Record<string, Property>;

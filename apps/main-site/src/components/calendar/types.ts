
export type CalendarView = "day" | "week" | "month";

export type RoomStatus = "clean" | "dirty" | "housekeeping" | "maintenance";
export type BookingStatus = "draft" | "pending_kyc" | "confirmed" | "checked_in" | "maintenance" | "blocked" | "checkout_today";
export type KYCStatus = "PENDING" | "VERIFIED" | "FAILED";
export type MealPlan = "EP" | "CP" | "MAP" | "AP";
export type PaymentStatus = "paid" | "partial" | "pending" | "refunded";

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface Guest {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  gender?: string;
  dob?: Date;
  nationality: string;
  address: Address;
  identityType?: string;
  identityNumberMasked?: string;
  kycStatus: KYCStatus;
  aadhaarVerified: boolean;
  aadhaarReferenceId?: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  status: RoomStatus;
}

export interface RoomGroup {
  name: string;
  rooms: Room[];
}

export interface Reservation {
  id: string;
  guestName: string;
  roomId: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  kycStatus: KYCStatus;
  source: string;
  mealPlan: MealPlan;
  paymentStatus: PaymentStatus;
  occupancy: { adults: number; children: number };
  amount: number;
  primaryGuest?: Guest;
}

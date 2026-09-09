export interface GuestDto {
  fullName: string;
  mobile: string;
  email?: string | null;
  kycVerified?: boolean;
}

export interface ConciergeServiceDto {
  serviceType: string;
  amount: number;
  configData?: Record<string, any>;
}

export interface CreateBookingDto {
  propertyId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  mealPlanId?: string;
  amount: number;
  guestData: GuestDto;
  conciergeServices?: ConciergeServiceDto[];
  paymentMode?: 'SMART_UPI' | 'CREDIT_CARD' | 'CASH' | 'BANK_TRANSFER' | null;
  couponCode?: string;
}

export interface UpdateBookingDto {
  status?: 'DRAFT' | 'pending' | 'PENDING_KYC' | 'confirmed' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'COMPLETED' | 'cancelled' | 'CANCELLED' | 'expired' | 'EXPIRED' | 'rejected';
  paymentStatus?: 'pending' | 'PENDING' | 'pending_payment' | 'PENDING_PAYMENT' | 'paid' | 'PAID' | 'rejected' | 'REJECTED' | 'REFUNDED';
  amount?: number;
}

export interface BookingSearchDto {
  propertyId?: string;
  limit: number;
  offset: number;
}

export interface BookingAvailabilityDto {
  propertyId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  requestedCount: number;
}

export interface BookingCancellationDto {
  bookingId: string;
  reason?: string;
}

export interface BookingPaymentPreparationDto {
  bookingId: string;
  paymentMode: 'SMART_UPI';
}

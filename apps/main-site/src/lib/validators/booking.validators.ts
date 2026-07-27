import { z } from 'zod';
import { 
  GuestDto, 
  ConciergeServiceDto, 
  CreateBookingDto, 
  UpdateBookingDto, 
  BookingSearchDto, 
  BookingAvailabilityDto, 
  BookingCancellationDto, 
  BookingPaymentPreparationDto 
} from '../types/booking.dto';

export const guestSchema = z.object({
  fullName: z.string().min(2).max(100),
  mobile: z.string().min(10).max(15),
  email: z.string().email().optional().nullable(),
  kycVerified: z.boolean().default(false).optional(),
}) satisfies z.ZodType<GuestDto>;

export const conciergeServiceSchema = z.object({
  serviceType: z.string().min(1),
  amount: z.number().min(0),
  configData: z.record(z.string(), z.any()).optional().default({}),
}) satisfies z.ZodType<ConciergeServiceDto>;

export const createBookingSchema = z.object({
  propertyId: z.string().uuid(),
  roomId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  mealPlanId: z.string().min(1).default('EP'),
  amount: z.number().positive(),
  guestData: guestSchema,
  conciergeServices: z.array(conciergeServiceSchema).optional(),
  paymentMode: z.enum(['SMART_UPI', 'CREDIT_CARD', 'CASH', 'BANK_TRANSFER']).optional().nullable(),
}).refine(data => new Date(data.startDate) < new Date(data.endDate), {
  message: "Check-in date must be before check-out date",
  path: ["endDate"],
}) satisfies z.ZodType<CreateBookingDto>;

export const updateBookingSchema = z.object({
  status: z.enum(['DRAFT', 'pending', 'PENDING_KYC', 'confirmed', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED', 'cancelled', 'CANCELLED', 'expired', 'EXPIRED', 'rejected']).optional(),
  paymentStatus: z.enum(['pending', 'PENDING', 'pending_payment', 'PENDING_PAYMENT', 'paid', 'PAID', 'rejected', 'REJECTED', 'REFUNDED']).optional(),
  amount: z.number().positive().optional(),
}) satisfies z.ZodType<UpdateBookingDto>;

export const bookingSearchSchema = z.object({
  propertyId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
}) satisfies z.ZodType<BookingSearchDto>;

export const bookingAvailabilitySchema = z.object({
  propertyId: z.string().uuid(),
  roomId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  requestedCount: z.coerce.number().int().positive().default(1),
}).refine(data => new Date(data.startDate) < new Date(data.endDate), {
  message: "Check-in date must be before check-out date",
  path: ["endDate"],
}) satisfies z.ZodType<BookingAvailabilityDto>;

export const bookingCancellationSchema = z.object({
  bookingId: z.string().uuid(),
  reason: z.string().min(5).optional(),
}) satisfies z.ZodType<BookingCancellationDto>;

export const bookingPaymentPreparationSchema = z.object({
  bookingId: z.string().uuid(),
  paymentMode: z.enum(['SMART_UPI']),
}) satisfies z.ZodType<BookingPaymentPreparationDto>;

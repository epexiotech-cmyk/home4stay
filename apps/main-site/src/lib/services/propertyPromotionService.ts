import { propertyOfferRepository } from '../repositories/propertyOfferRepository';

export class PropertyPromotionService {
  async getOffers(propertyId: string, isActive?: boolean) {
    return await propertyOfferRepository.findManyByPropertyId(propertyId, isActive);
  }
  
  async getOfferById(id: string) {
    return await propertyOfferRepository.findById(id);
  }

  async validateCoupon(couponCode: string, propertyId: string, bookingAmount: number) {
    const offer = await propertyOfferRepository.findActiveByCouponCode(couponCode, propertyId);
    if (!offer) {
      return { valid: false, message: "Invalid coupon code for this property." };
    }

    const now = new Date();
    if (now < new Date(offer.startDate) || now > new Date(offer.endDate)) {
      return { valid: false, message: "This coupon has expired or is not yet active." };
    }

    if (bookingAmount < offer.minimumBookingAmount) {
      return { valid: false, message: `Minimum booking amount of ₹${offer.minimumBookingAmount} required for this coupon.` };
    }

    return {
      valid: true,
      offerId: offer.id,
      title: offer.title,
      discountType: offer.discountType,
      discountValue: offer.discountValue,
      message: "Coupon applied successfully!"
    };
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createOffer(data: any) {
    return await propertyOfferRepository.create(data);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateOffer(id: string, data: any) {
    return await propertyOfferRepository.update(id, data);
  }
  
  async deleteOffer(id: string) {
    return await propertyOfferRepository.delete(id);
  }
}

export const propertyPromotionService = new PropertyPromotionService();

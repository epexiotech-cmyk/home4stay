import { propertyReviewRepository } from '../repositories/propertyReviewRepository';

export class PropertyReviewService {
  async getReviewsAndStats(propertyId: string, isPublished?: boolean, isFeatured?: boolean) {
    const reviews = await propertyReviewRepository.findManyByFilters(propertyId, isPublished, isFeatured);
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews : 0;
    return {
      reviews,
      stats: {
        totalReviews,
        averageRating: Number(averageRating.toFixed(1)),
        responseRate: Number(((reviews.filter(r => r.responseMessage).length / totalReviews) * 100).toFixed(0)) || 0
      }
    };
  }
  
  async replyToReview(reviewId: string, responseMessage: string) {
    return await propertyReviewRepository.update(reviewId, {
      responseMessage,
      responseAt: new Date().toISOString()
    });
  }
  
  async toggleReviewStatus(reviewId: string, isPublished?: boolean, isFeatured?: boolean) {
    return await propertyReviewRepository.update(reviewId, { isPublished, isFeatured });
  }
}

export const propertyReviewService = new PropertyReviewService();

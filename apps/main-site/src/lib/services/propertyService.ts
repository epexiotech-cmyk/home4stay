import { propertyRepository } from '../repositories/propertyRepository';
import { CreateFullPropertyDto, UpdatePropertyDto } from '../types/property.dto';

export class PropertyService {
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
  }

  async createProperty(data: CreateFullPropertyDto) {
    const slug = this.generateSlug(data.title);
    
    // Any pre-creation business rules
    if (data.pricing && data.pricing.basePrice <= 0) {
      throw new Error('Base price must be greater than zero');
    }

    const newProperty = await propertyRepository.create({
      ...data,
      slug,
    });

    return newProperty;
  }

  async getPropertyById(id: string) {
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new Error('Property not found');
    }
    return property;
  }

  async updateProperty(id: string, data: UpdatePropertyDto) {
    // Basic validations
    if (data.title && data.title.trim() === '') {
      throw new Error('Title cannot be empty');
    }

    return await propertyRepository.update(id, data);
  }

  async deleteProperty(id: string) {
    // In a real scenario we'd check for active bookings before deletion
    const property = await propertyRepository.findById(id);
    if (!property) {
      throw new Error('Property not found');
    }

    if (property.status === 'LIVE') {
      // Soft-delete or suspend instead, or enforce business rule
      throw new Error('Cannot delete a live property. Suspend it first.');
    }

    await propertyRepository.delete(id);
    return { success: true };
  }
}

export const propertyService = new PropertyService();

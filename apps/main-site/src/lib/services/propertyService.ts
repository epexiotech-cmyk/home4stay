import { propertyRepository } from '../repositories/propertyRepository';
import { CreateFullPropertyDto, UpdatePropertyDto } from '../types/property.dto';
import { AppError } from "@/lib/errors/handler";

export class PropertyService {
  public generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);
  }

  // --- PROPERTY CORE ---
  async createBasicProperty(name: string, location: string, price: number) {
    const slug = this.generateSlug(name);
    // Any basic property creation logic would go here
    return { slug, name, location, price };
  }

  async createProperty(data: CreateFullPropertyDto) {
    const slug = this.generateSlug(data.title);
    if (data.pricing && data.pricing.basePrice <= 0) {
      throw new Error('Base price must be greater than zero');
    }
    return await propertyRepository.create({ ...data, slug });
  }

  async getPropertyById(id: string) {
    const property = await propertyRepository.findById(id);
    if (!property) throw new Error('Property not found');
    return property;
  }

  async updateProperty(id: string, data: UpdatePropertyDto) {
    if (data.title && data.title.trim() === '') {
      throw new Error('Title cannot be empty');
    }
    return await propertyRepository.update(id, data);
  }

  async deleteProperty(id: string) {
    const property = await propertyRepository.findById(id);
    if (!property) throw new Error('Property not found');
    if (property.status === 'LIVE') throw new Error('Cannot delete a live property. Suspend it first.');
    await propertyRepository.delete(id);
    return { success: true };
  }



}

export const propertyService = new PropertyService();

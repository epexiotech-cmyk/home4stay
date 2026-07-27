import { propertyExperienceRepository } from '../repositories/propertyExperienceRepository';

export class PropertyExperienceService {
  async getExperiences(propertyId: string) {
    return await propertyExperienceRepository.findManyByPropertyId(propertyId);
  }
  
  async getExperienceById(id: string) {
    return await propertyExperienceRepository.findById(id);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createExperience(data: any) {
    return await propertyExperienceRepository.create(data);
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateExperience(id: string, data: any) {
    return await propertyExperienceRepository.update(id, data);
  }
  
  async deleteExperience(id: string) {
    return await propertyExperienceRepository.delete(id);
  }
}

export const propertyExperienceService = new PropertyExperienceService();

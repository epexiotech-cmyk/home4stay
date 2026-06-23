import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';
import 'package:home4stay/features/onboarding/domain/models/property_draft_model.dart';
import 'package:home4stay/features/onboarding/data/api/validators/property_api_validator.dart';
import 'package:home4stay/features/onboarding/data/api/mappers/property_draft_to_api_mapper.dart';
import 'package:home4stay/features/onboarding/data/api/services/property_api_service.dart';
import 'package:home4stay/features/onboarding/data/api/dtos/create_property_response.dart';

class OnboardingWizardMapper {
  static PropertyDraft mapToDraft(OnboardingWizardController wizard) {
    return PropertyDraft(
      identity: wizard.identityData,
      theme: wizard.themeData,
      rooms: wizard.roomData,
      amenities: wizard.amenityData,
      experiences: wizard.experienceData,
      media: wizard.mediaData,
      policies: wizard.policyData,
      pricing: wizard.pricingData,
      metadata: PropertyDraftMetadata(
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        draftVersion: '1.0.0',
      ),
    );
  }
}

class PropertyCreationService {
  final PropertyApiService _apiService = PropertyApiService();

  Future<PropertyDraft> createDraft(OnboardingWizardController wizard) async {
    // 1. Map to Domain Draft
    PropertyDraft draft = OnboardingWizardMapper.mapToDraft(wizard);

    // 2. Validate for API constraints
    PropertyApiValidator.validateForLaunch(draft);

    // 3. Map to API Request DTO
    final requestDto = PropertyDraftToApiMapper.map(draft);

    // 4. Execute Mock API Call
    CreatePropertyResponse response = await _apiService.createProperty(requestDto);
    
    print("Mock API Success: ${response.propertyId} at ${response.createdAt}");

    return draft;
  }
}

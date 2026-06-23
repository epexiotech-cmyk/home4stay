import 'package:home4stay/features/onboarding/domain/models/property_draft_model.dart';
import 'package:home4stay/features/onboarding/data/api/dtos/create_property_request.dart';

class PropertyDraftToApiMapper {
  static CreatePropertyRequest map(PropertyDraft draft) {
    // Re-using the robust toJson from Draft but returning the structured DTO
    final rawJson = draft.toJson();

    return CreatePropertyRequest(
      identity: rawJson['identity'] as Map<String, dynamic>,
      theme: rawJson['theme'] as Map<String, dynamic>,
      rooms: rawJson['rooms'] as Map<String, dynamic>,
      amenities: rawJson['amenities'] as Map<String, dynamic>,
      experiences: rawJson['experiences'] as Map<String, dynamic>,
      media: rawJson['media'] as Map<String, dynamic>,
      policies: rawJson['policies'] as Map<String, dynamic>,
      pricing: rawJson['pricing'] as Map<String, dynamic>,
    );
  }
}

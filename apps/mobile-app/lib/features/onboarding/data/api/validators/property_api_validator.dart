import 'package:home4stay/features/onboarding/domain/models/property_draft_model.dart';
import 'package:home4stay/features/onboarding/data/api/exceptions/property_api_exceptions.dart';

class PropertyApiValidator {
  static void validateForLaunch(PropertyDraft draft) {
    if (draft.identity.propertyName.trim().isEmpty) {
      throw ValidationException("Property Name is required for launch.");
    }

    if (draft.theme.selectedThemeId == null || draft.theme.selectedThemeId!.isEmpty) {
      throw ValidationException("Theme must be selected.");
    }

    if (draft.rooms.categories.isEmpty) {
      throw ValidationException("At least one room category is required.");
    }

    if (draft.amenities.selectedIds.isEmpty && draft.amenities.customAmenities.isEmpty) {
      throw ValidationException("At least one amenity must be selected or created.");
    }

    if (draft.experiences.selectedIds.isEmpty && draft.experiences.customExperiences.isEmpty) {
      throw ValidationException("At least one signature experience is required.");
    }

    bool hasMedia = draft.media.categoryMediaMap.values.any((list) => list.isNotEmpty);
    if (!hasMedia) {
      throw ValidationException("At least one media item must be uploaded.");
    }

    if (draft.policies.checkIn == null || draft.policies.checkOut == null || draft.policies.cancellation == null) {
      throw ValidationException("All core policies (Check-in, Check-out, Cancellation) must be completed.");
    }

    double baseRate = double.tryParse(draft.pricing.baseRate) ?? 0;
    int minStay = int.tryParse(draft.pricing.minimumStay) ?? 0;

    if (baseRate <= 0) {
      throw ValidationException("A valid Base Nightly Rate is required.");
    }

    if (minStay < 1) {
      throw ValidationException("Minimum stay must be at least 1 night.");
    }
  }
}

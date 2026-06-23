import 'package:home4stay/features/onboarding/models/onboarding_models.dart';

class PropertyDraftMetadata {
  final DateTime createdAt;
  final DateTime updatedAt;
  final String draftVersion;

  PropertyDraftMetadata({
    required this.createdAt,
    required this.updatedAt,
    required this.draftVersion,
  });

  Map<String, dynamic> toJson() => {
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'draftVersion': draftVersion,
      };
}

class PropertyDraft {
  final PropertyIdentityData identity;
  final ThemeData theme;
  final RoomData rooms;
  final AmenityData amenities;
  final ExperienceData experiences;
  final MediaData media;
  final PolicyData policies;
  final PricingData pricing;
  final PropertyDraftMetadata metadata;

  PropertyDraft({
    required this.identity,
    required this.theme,
    required this.rooms,
    required this.amenities,
    required this.experiences,
    required this.media,
    required this.policies,
    required this.pricing,
    required this.metadata,
  });

  Map<String, dynamic> toJson() {
    return {
      'identity': {
        'propertyName': identity.propertyName,
        'geographicCoordinates': identity.geographicCoordinates,
        'hospitalityTagline': identity.hospitalityTagline,
        'aspirationalNarrative': identity.aspirationalNarrative,
        'selectedVibe': identity.selectedVibe,
      },
      'theme': {
        'selectedThemeId': theme.selectedThemeId,
      },
      'rooms': {
        'totalCategories': rooms.categories.length,
        'categories': rooms.categories.map((c) => {
              'id': c.id,
              'name': c.name,
              'baseRate': c.baseRate,
            }).toList(),
      },
      'amenities': {
        'selectedIds': amenities.selectedIds,
        'customAmenitiesCount': amenities.customAmenities.length,
      },
      'experiences': {
        'selectedIds': experiences.selectedIds,
        'customExperiencesCount': experiences.customExperiences.length,
      },
      'media': {
        'totalMedia': media.categoryMediaMap.values.fold(0, (sum, list) => sum + list.length),
        'categories': media.categoryMediaMap.keys.toList(),
      },
      'policies': {
        'checkIn': policies.checkIn,
        'checkOut': policies.checkOut,
        'cancellation': policies.cancellation,
        'childrenAllowed': policies.childrenAllowed,
        'childAgeLimit': policies.childAgeLimit,
        'petsAllowed': policies.petsAllowed,
        'smokingAllowed': policies.smokingAllowed,
      },
      'pricing': {
        'baseRate': pricing.baseRate,
        'weekendMultiplier': pricing.weekendMultiplier,
        'peakMultiplier': pricing.peakMultiplier,
        'minimumStay': pricing.minimumStay,
        'instantBooking': pricing.instantBooking,
        'sameDayBooking': pricing.sameDayBooking,
        'longStayDiscount': pricing.longStayDiscount,
      },
      'metadata': metadata.toJson(),
    };
  }
}

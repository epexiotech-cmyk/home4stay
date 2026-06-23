import 'package:home4stay/pages/rooms_inventory/models/room_category.dart';
import 'package:home4stay/pages/amenities/models/amenity_model.dart';
import 'package:home4stay/pages/experiences/models/experience_model.dart';
import 'package:home4stay/pages/media_gallery/models/media_item_model.dart';

class PropertyIdentityData {
  String propertyName;
  String geographicCoordinates;
  String hospitalityTagline;
  String aspirationalNarrative;
  String? selectedVibe;

  PropertyIdentityData({
    this.propertyName = '',
    this.geographicCoordinates = '',
    this.hospitalityTagline = '',
    this.aspirationalNarrative = '',
    this.selectedVibe,
  });
}

class ThemeData {
  String? selectedThemeId;

  ThemeData({this.selectedThemeId});
}

class RoomData {
  List<RoomCategory> categories;

  RoomData({this.categories = const []});
}

class AmenityData {
  List<String> selectedIds;
  List<Amenity> customAmenities;

  AmenityData({
    this.selectedIds = const [],
    this.customAmenities = const [],
  });
}

class ExperienceData {
  List<String> selectedIds;
  List<Experience> customExperiences;

  ExperienceData({
    this.selectedIds = const [],
    this.customExperiences = const [],
  });
}

class MediaData {
  Map<String, List<MediaItem>> categoryMediaMap;

  MediaData({this.categoryMediaMap = const {}});
}

class PolicyData {
  String? checkIn;
  String? checkOut;
  String? cancellation;
  bool childrenAllowed;
  String childAgeLimit;
  bool petsAllowed;
  bool smokingAllowed;

  PolicyData({
    this.checkIn,
    this.checkOut,
    this.cancellation,
    this.childrenAllowed = false,
    this.childAgeLimit = '',
    this.petsAllowed = false,
    this.smokingAllowed = false,
  });
}

class PricingData {
  String baseRate;
  String weekendMultiplier;
  String peakMultiplier;
  String minimumStay;
  bool instantBooking;
  bool sameDayBooking;
  bool longStayDiscount;

  PricingData({
    this.baseRate = '',
    this.weekendMultiplier = '',
    this.peakMultiplier = '',
    this.minimumStay = '',
    this.instantBooking = false,
    this.sameDayBooking = false,
    this.longStayDiscount = false,
  });
}

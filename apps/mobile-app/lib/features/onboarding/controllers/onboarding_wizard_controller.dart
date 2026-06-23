import 'dart:convert';
import 'package:get/get.dart';
import 'package:home4stay/features/onboarding/models/onboarding_models.dart';
import 'package:home4stay/features/onboarding/domain/services/draft_auto_save_service.dart';
import 'package:home4stay/features/onboarding/domain/services/property_creation_service.dart';
import 'package:home4stay/features/onboarding/domain/models/property_draft_model.dart';
import 'package:home4stay/pages/rooms_inventory/models/room_category.dart';

class OnboardingWizardController extends GetxController {
  PropertyIdentityData identityData = PropertyIdentityData();
  ThemeData themeData = ThemeData();
  RoomData roomData = RoomData();
  AmenityData amenityData = AmenityData();
  ExperienceData experienceData = ExperienceData();
  MediaData mediaData = MediaData();
  PolicyData policyData = PolicyData();
  PricingData pricingData = PricingData();

  final DraftAutoSaveService _autoSaveService = DraftAutoSaveService();

  void triggerAutoSave() {
    try {
      PropertyDraft draft = OnboardingWizardMapper.mapToDraft(this);
      _autoSaveService.triggerSave(draft);
    } catch (e) {
      print("Auto save trigger failed: $e");
    }
  }

  Future<void> saveDraft() async {
    try {
      PropertyDraft draft = OnboardingWizardMapper.mapToDraft(this);
      await _autoSaveService.saveImmediately(draft);
    } catch (e) {
      print("Manual save failed: $e");
    }
  }

  void restoreDraft(String jsonPayload) {
    try {
      final map = jsonDecode(jsonPayload);
      
      if (map['identity'] != null) {
        identityData.propertyName = map['identity']['propertyName'] ?? '';
        identityData.geographicCoordinates = map['identity']['geographicCoordinates'] ?? '';
        identityData.hospitalityTagline = map['identity']['hospitalityTagline'] ?? '';
        identityData.aspirationalNarrative = map['identity']['aspirationalNarrative'] ?? '';
        identityData.selectedVibe = map['identity']['selectedVibe'];
      }

      if (map['theme'] != null) {
        themeData.selectedThemeId = map['theme']['selectedThemeId'];
      }

      if (map['rooms'] != null && map['rooms']['categories'] != null) {
        List cats = map['rooms']['categories'];
        roomData.categories = cats.map((c) => RoomCategory(
          id: c['id'] ?? '',
          name: c['name'] ?? '',
          baseRate: (c['baseRate'] as num?)?.toDouble() ?? 0.0,
          createdAt: DateTime.now(),
        )).toList();
      }

      if (map['amenities'] != null && map['amenities']['selectedIds'] != null) {
        amenityData.selectedIds = List<String>.from(map['amenities']['selectedIds']);
      }

      if (map['experiences'] != null && map['experiences']['selectedIds'] != null) {
        experienceData.selectedIds = List<String>.from(map['experiences']['selectedIds']);
      }

      // Media parsing skipped for brevity as full hydration of media items would require storing more details
      // But we just re-init as empty or leave what is there since they mock upload

      if (map['policies'] != null) {
        policyData.checkIn = map['policies']['checkIn'];
        policyData.checkOut = map['policies']['checkOut'];
        policyData.cancellation = map['policies']['cancellation'];
        policyData.childrenAllowed = map['policies']['childrenAllowed'] ?? false;
        policyData.childAgeLimit = map['policies']['childAgeLimit'] ?? '';
        policyData.petsAllowed = map['policies']['petsAllowed'] ?? false;
        policyData.smokingAllowed = map['policies']['smokingAllowed'] ?? false;
      }

      if (map['pricing'] != null) {
        pricingData.baseRate = map['pricing']['baseRate'] ?? '';
        pricingData.weekendMultiplier = map['pricing']['weekendMultiplier'] ?? '';
        pricingData.peakMultiplier = map['pricing']['peakMultiplier'] ?? '';
        pricingData.minimumStay = map['pricing']['minimumStay'] ?? '';
        pricingData.instantBooking = map['pricing']['instantBooking'] ?? false;
        pricingData.sameDayBooking = map['pricing']['sameDayBooking'] ?? false;
        pricingData.longStayDiscount = map['pricing']['longStayDiscount'] ?? false;
      }
      
      update();
    } catch (e) {
      print("Restore failed: $e");
    }
  }

  void clearDraft() {
    identityData = PropertyIdentityData();
    themeData = ThemeData();
    roomData = RoomData();
    amenityData = AmenityData();
    experienceData = ExperienceData();
    mediaData = MediaData();
    policyData = PolicyData();
    pricingData = PricingData();
    update();
  }
}

import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/amenities/models/amenity_model.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';
import 'package:flutter/material.dart';

class AmenitiesController extends GetxController {
  final customAmenityController = TextEditingController();

  final List<Amenity> presetAmenities = [
    Amenity(id: 'pool', name: 'Swimming Pool', description: 'Luxury outdoor and indoor pools', icon: Icons.pool),
    Amenity(id: 'spa', name: 'Spa & Wellness', description: 'Relaxation and rejuvenation services', icon: Icons.spa),
    Amenity(id: 'restaurant', name: 'Restaurant', description: 'Multi-cuisine dining experiences', icon: Icons.restaurant),
    Amenity(id: 'gym', name: 'Gym & Fitness', description: 'State-of-the-art workout equipment', icon: Icons.fitness_center),
    Amenity(id: 'wifi', name: 'Free WiFi', description: 'High-speed internet access', icon: Icons.wifi),
    Amenity(id: 'parking', name: 'Private Parking', description: 'Secure on-site vehicle parking', icon: Icons.local_parking),
    Amenity(id: 'transfer', name: 'Airport Transfer', description: 'Premium pickup and drop-off', icon: Icons.airport_shuttle),
    Amenity(id: 'pet', name: 'Pet Friendly', description: 'Welcoming spaces for furry friends', icon: Icons.pets),
    Amenity(id: 'conference', name: 'Conference Hall', description: 'Corporate meetings and events', icon: Icons.business),
    Amenity(id: 'room_service', name: 'Room Service', description: '24/7 in-room dining', icon: Icons.room_service),
    Amenity(id: 'kids', name: 'Kids Play Area', description: 'Safe and fun spaces for children', icon: Icons.child_care),
    Amenity(id: 'laundry', name: 'Laundry Service', description: 'Same-day washing and ironing', icon: Icons.local_laundry_service),
  ];

  final RxList<String> selectedAmenityIds = <String>[].obs;
  final RxList<Amenity> customAmenities = <Amenity>[].obs;

  @override
  void onInit() {
    super.onInit();
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>().amenityData;
      selectedAmenityIds.value = global.selectedIds;
      customAmenities.value = global.customAmenities;
    }
  }

  void _flush() {
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>();
      global.amenityData.selectedIds = selectedAmenityIds.toList();
      global.amenityData.customAmenities = customAmenities.toList();
      global.triggerAutoSave();
    }
  }

  bool get isReady => selectedAmenityIds.isNotEmpty;

  int get totalSelected => selectedAmenityIds.length;
  int get selectedPresetCount => selectedAmenityIds.where((id) => presetAmenities.any((p) => p.id == id)).length;
  int get selectedCustomCount => selectedAmenityIds.where((id) => customAmenities.any((c) => c.id == id)).length;

  List<Amenity> get allSelectedAmenities {
    List<Amenity> result = [];
    for (String id in selectedAmenityIds) {
      try {
        result.add(presetAmenities.firstWhere((p) => p.id == id));
      } catch (e) {
        try {
          result.add(customAmenities.firstWhere((c) => c.id == id));
        } catch (e) {}
      }
    }
    return result;
  }

  void toggleAmenity(String id) {
    if (selectedAmenityIds.contains(id)) {
      selectedAmenityIds.remove(id);
    } else {
      selectedAmenityIds.add(id);
    }
    _flush();
    update();
  }

  void addCustomAmenity() {
    String name = customAmenityController.text.trim();

    if (name.isEmpty) {
      Get.snackbar(
        "Validation Error",
        "Amenity name cannot be empty.",
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1F2937),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    bool existsInPreset = presetAmenities.any((a) => a.name.toLowerCase() == name.toLowerCase());
    bool existsInCustom = customAmenities.any((a) => a.name.toLowerCase() == name.toLowerCase());

    if (existsInPreset || existsInCustom) {
      Get.snackbar(
        "Duplicate Amenity",
        "Amenity already exists.",
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.shade800,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    String id = 'custom_${DateTime.now().millisecondsSinceEpoch}';
    Amenity custom = Amenity(
      id: id,
      name: name,
      isCustom: true,
      icon: Icons.star_border,
    );

    customAmenities.add(custom);
    selectedAmenityIds.add(id);
    customAmenityController.clear();
    _flush();
    update();
  }

  void removeCustomAmenity(String id) {
    customAmenities.removeWhere((a) => a.id == id);
    selectedAmenityIds.remove(id);
    _flush();
    update();
  }

  @override
  void onClose() {
    customAmenityController.dispose();
    super.onClose();
  }
}

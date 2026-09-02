import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/experiences/models/experience_model.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';

class ExperiencesController extends GetxController {
  final customExperienceController = TextEditingController();

  final List<Experience> presetExperiences = [
    Experience(id: 'adventure', name: 'Adventure Activities', description: 'Thrilling outdoor excursions', icon: Icons.explore),
    Experience(id: 'wellness', name: 'Wellness Retreats', description: 'Holistic health and healing', icon: Icons.self_improvement),
    Experience(id: 'cultural', name: 'Cultural Tours', description: 'Local heritage and traditions', icon: Icons.museum),
    Experience(id: 'dining', name: 'Fine Dining Experiences', description: 'Gourmet culinary journeys', icon: Icons.restaurant_menu),
    Experience(id: 'nature', name: 'Nature Walks', description: 'Guided trails and hikes', icon: Icons.park),
    Experience(id: 'photography', name: 'Photography Tours', description: 'Scenic photo expeditions', icon: Icons.camera_alt),
    Experience(id: 'yoga', name: 'Yoga Sessions', description: 'Guided meditation and yoga', icon: Icons.accessibility_new),
    Experience(id: 'cooking', name: 'Cooking Classes', description: 'Learn local cuisines', icon: Icons.soup_kitchen),
    Experience(id: 'wine', name: 'Wine Tasting', description: 'Vineyard tours and tasting', icon: Icons.wine_bar),
    Experience(id: 'entertainment', name: 'Live Entertainment', description: 'Music and performances', icon: Icons.mic),
    Experience(id: 'water', name: 'Water Sports', description: 'Kayaking, surfing, and more', icon: Icons.surfing),
    Experience(id: 'heritage', name: 'Local Heritage Tours', description: 'Historical site visits', icon: Icons.history_edu),
  ];

  final RxList<String> selectedExperienceIds = <String>[].obs;
  final RxList<Experience> customExperiences = <Experience>[].obs;

  @override
  void onInit() {
    super.onInit();
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>().experienceData;
      selectedExperienceIds.value = global.selectedIds;
      customExperiences.value = global.customExperiences;
    }
  }

  void _flush() {
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>();
      global.experienceData.selectedIds = selectedExperienceIds.toList();
      global.experienceData.customExperiences = customExperiences.toList();
      global.triggerAutoSave();
    }
  }

  bool get isReady => selectedExperienceIds.isNotEmpty;

  int get totalSelected => selectedExperienceIds.length;
  int get selectedCustomCount => selectedExperienceIds.where((id) => customExperiences.any((c) => c.id == id)).length;

  List<Experience> get allSelectedExperiences {
    List<Experience> result = [];
    for (String id in selectedExperienceIds) {
      try {
        result.add(presetExperiences.firstWhere((p) => p.id == id));
      } catch (e) {
        try {
          result.add(customExperiences.firstWhere((c) => c.id == id));
        } catch (e) {
          // Ignore if not found in custom
        }
      }
    }
    return result;
  }

  void toggleExperience(String id) {
    if (selectedExperienceIds.contains(id)) {
      selectedExperienceIds.remove(id);
    } else {
      selectedExperienceIds.add(id);
    }
    _flush();
    update();
  }

  void addCustomExperience() {
    String name = customExperienceController.text.trim();

    if (name.isEmpty) {
      Get.snackbar(
        "Validation Error",
        "Experience name cannot be empty.",
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1F2937),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    bool existsInPreset = presetExperiences.any((e) => e.name.toLowerCase() == name.toLowerCase());
    bool existsInCustom = customExperiences.any((e) => e.name.toLowerCase() == name.toLowerCase());

    if (existsInPreset || existsInCustom) {
      Get.snackbar(
        "Duplicate Experience",
        "Experience already exists.",
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.shade800,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    String id = 'custom_${DateTime.now().millisecondsSinceEpoch}';
    Experience custom = Experience(
      id: id,
      name: name,
      isCustom: true,
      icon: Icons.star_border,
    );

    customExperiences.add(custom);
    selectedExperienceIds.add(id);
    customExperienceController.clear();
    _flush();
    update();
  }

  void removeCustomExperience(String id) {
    customExperiences.removeWhere((e) => e.id == id);
    selectedExperienceIds.remove(id);
    _flush();
    update();
  }

  @override
  void onClose() {
    customExperienceController.dispose();
    super.onClose();
  }
}

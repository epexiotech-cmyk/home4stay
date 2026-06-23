import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';

class PropertyIdentityController extends GetxController {
  final propertyNameController = TextEditingController();
  final geographicCoordinatesController = TextEditingController();
  final hospitalityTaglineController = TextEditingController();
  final aspirationalNarrativeController = TextEditingController();
  final keywordController = TextEditingController();

  final isGeneratingNarrative = false.obs;
  
  String? selectedVibe;

  final List<String> vibeOptions = [
    "Alpine Mountain Cabin",
    "Luxury Beach Resort",
    "Heritage Palace",
    "Jungle Escape",
    "Desert Retreat",
    "Wellness Sanctuary",
    "Lakeside Escape",
    "Boutique City Hotel",
  ];

  @override
  void onInit() {
    super.onInit();
    
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>().identityData;
      propertyNameController.text = global.propertyName;
      geographicCoordinatesController.text = global.geographicCoordinates;
      hospitalityTaglineController.text = global.hospitalityTagline;
      aspirationalNarrativeController.text = global.aspirationalNarrative;
      selectedVibe = global.selectedVibe;
    }

    propertyNameController.addListener(_flush);
    geographicCoordinatesController.addListener(_flush);
    hospitalityTaglineController.addListener(_flush);
    aspirationalNarrativeController.addListener(_flush);
  }

  void _flush() {
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>();
      global.identityData.propertyName = propertyNameController.text;
      global.identityData.geographicCoordinates = geographicCoordinatesController.text;
      global.identityData.hospitalityTagline = hospitalityTaglineController.text;
      global.identityData.aspirationalNarrative = aspirationalNarrativeController.text;
      global.identityData.selectedVibe = selectedVibe;
      global.triggerAutoSave();
    }
    update();
  }

  bool get isIdentityReady {
    return propertyNameController.text.trim().isNotEmpty &&
           geographicCoordinatesController.text.trim().isNotEmpty &&
           aspirationalNarrativeController.text.trim().isNotEmpty;
  }

  @override
  void onClose() {
    propertyNameController.dispose();
    geographicCoordinatesController.dispose();
    hospitalityTaglineController.dispose();
    aspirationalNarrativeController.dispose();
    keywordController.dispose();
    super.onClose();
  }

  void setSelectedVibe(String? value) {
    selectedVibe = value;
    _flush();
  }

  void generateMockNarrative() async {
    isGeneratingNarrative.value = true;
    update();

    await Future.delayed(const Duration(seconds: 2));

    hospitalityTaglineController.text = "Where luxury hospitality meets unforgettable experiences.";
    aspirationalNarrativeController.text = "Nestled in a breathtaking destination, our hospitality experience blends luxury, comfort, and authentic local charm. Guests enjoy thoughtfully curated spaces, premium amenities, and memorable experiences designed to create lasting impressions.";

    isGeneratingNarrative.value = false;
    _flush();
  }
}

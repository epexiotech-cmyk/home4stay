import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';

class PropertyThemeController extends GetxController {
  String? selectedTheme;

  @override
  void onInit() {
    super.onInit();
    if (Get.isRegistered<OnboardingWizardController>()) {
      selectedTheme = Get.find<OnboardingWizardController>().themeData.selectedThemeId;
    }
  }

  void selectTheme(String theme) {
    selectedTheme = theme;
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>();
      global.themeData.selectedThemeId = theme;
      global.triggerAutoSave();
    }
    update();
  }

  bool get isThemeReady => selectedTheme != null;
}

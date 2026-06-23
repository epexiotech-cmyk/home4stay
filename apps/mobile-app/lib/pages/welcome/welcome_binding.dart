import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/welcome_controller.dart';

import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';

class WelcomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.put(OnboardingWizardController(), permanent: true);
    Get.lazyPut<WelcomeController>(() => WelcomeController());
  }
}

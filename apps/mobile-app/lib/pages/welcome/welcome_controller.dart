import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/features/onboarding/domain/services/draft_storage_service.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';

class WelcomeController extends GetxController {
  @override
  void onInit() {
    super.onInit();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkForDraft();
    });
  }

  void _checkForDraft() async {
    final draftJson = await DraftStorageService().getDraft();
    if (draftJson != null && draftJson.isNotEmpty) {
      Get.defaultDialog(
        title: "Draft Found",
        middleText: "Continue previous setup?",
        barrierDismissible: false,
        confirm: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF0D5C7D),
            foregroundColor: Colors.white,
          ),
          onPressed: () {
            if (Get.isRegistered<OnboardingWizardController>()) {
              Get.find<OnboardingWizardController>().restoreDraft(draftJson);
            }
            Get.back();
          },
          child: const Text("Resume"),
        ),
        cancel: OutlinedButton(
          style: OutlinedButton.styleFrom(
            foregroundColor: const Color(0xFFEF4444),
            side: const BorderSide(color: Color(0xFFEF4444)),
          ),
          onPressed: () async {
            await DraftStorageService().clearDraft();
            if (Get.isRegistered<OnboardingWizardController>()) {
              Get.find<OnboardingWizardController>().clearDraft();
            }
            Get.back();
          },
          child: const Text("Discard"),
        ),
      );
    }
  }
}

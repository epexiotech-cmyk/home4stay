import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';

class PoliciesController extends GetxController {
  final childAgeLimitController = TextEditingController();

  String? selectedCheckIn;
  String? selectedCheckOut;
  String? selectedCancellation;

  bool childrenAllowed = false;
  bool petsAllowed = false;
  bool smokingAllowed = false;

  final List<String> checkInOptions = ['12 PM', '1 PM', '2 PM', '3 PM', '4 PM'];
  final List<String> checkOutOptions = ['10 AM', '11 AM', '12 PM'];
  final List<String> cancellationOptions = ['Flexible', 'Moderate', 'Strict'];

  @override
  void onInit() {
    super.onInit();
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>().policyData;
      selectedCheckIn = global.checkIn;
      selectedCheckOut = global.checkOut;
      selectedCancellation = global.cancellation;
      childrenAllowed = global.childrenAllowed;
      childAgeLimitController.text = global.childAgeLimit;
      petsAllowed = global.petsAllowed;
      smokingAllowed = global.smokingAllowed;
    }
    
    childAgeLimitController.addListener(_flush);
  }

  void _flush() {
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>();
      global.policyData.checkIn = selectedCheckIn;
      global.policyData.checkOut = selectedCheckOut;
      global.policyData.cancellation = selectedCancellation;
      global.policyData.childrenAllowed = childrenAllowed;
      global.policyData.childAgeLimit = childAgeLimitController.text;
      global.policyData.petsAllowed = petsAllowed;
      global.policyData.smokingAllowed = smokingAllowed;
      global.triggerAutoSave();
    }
  }

  void setCheckIn(String? value) {
    selectedCheckIn = value;
    _flush();
    update();
  }

  void setCheckOut(String? value) {
    selectedCheckOut = value;
    _flush();
    update();
  }

  void setCancellation(String value) {
    selectedCancellation = value;
    _flush();
    update();
  }

  void toggleChildrenAllowed(bool value) {
    childrenAllowed = value;
    if (!value) {
      childAgeLimitController.clear();
    }
    _flush();
    update();
  }

  void togglePetsAllowed(bool value) {
    petsAllowed = value;
    _flush();
    update();
  }

  void toggleSmokingAllowed(bool value) {
    smokingAllowed = value;
    _flush();
    update();
  }

  double get completionScore {
    int score = 0;
    if (selectedCheckIn != null) score++;
    if (selectedCheckOut != null) score++;
    if (selectedCancellation != null) score++;
    return score / 3.0;
  }

  bool get isReady => selectedCheckIn != null && selectedCheckOut != null && selectedCancellation != null;

  @override
  void onClose() {
    childAgeLimitController.dispose();
    super.onClose();
  }
}

import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';

class PricingEngineController extends GetxController {
  final baseRateController = TextEditingController();
  final weekendMultiplierController = TextEditingController();
  final peakMultiplierController = TextEditingController();
  final minimumStayController = TextEditingController();

  bool instantBooking = false;
  bool sameDayBooking = false;
  bool longStayDiscount = false;

  @override
  void onInit() {
    super.onInit();
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>().pricingData;
      baseRateController.text = global.baseRate;
      weekendMultiplierController.text = global.weekendMultiplier;
      peakMultiplierController.text = global.peakMultiplier;
      minimumStayController.text = global.minimumStay;
      instantBooking = global.instantBooking;
      sameDayBooking = global.sameDayBooking;
      longStayDiscount = global.longStayDiscount;
    }

    baseRateController.addListener(_flush);
    weekendMultiplierController.addListener(_flush);
    peakMultiplierController.addListener(_flush);
    minimumStayController.addListener(_flush);
  }

  void _flush() {
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>();
      global.pricingData.baseRate = baseRateController.text;
      global.pricingData.weekendMultiplier = weekendMultiplierController.text;
      global.pricingData.peakMultiplier = peakMultiplierController.text;
      global.pricingData.minimumStay = minimumStayController.text;
      global.pricingData.instantBooking = instantBooking;
      global.pricingData.sameDayBooking = sameDayBooking;
      global.pricingData.longStayDiscount = longStayDiscount;
      global.triggerAutoSave();
    }
    update();
  }

  void toggleInstantBooking(bool value) {
    instantBooking = value;
    _flush();
    update();
  }

  void toggleSameDayBooking(bool value) {
    sameDayBooking = value;
    _flush();
    update();
  }

  void toggleLongStayDiscount(bool value) {
    longStayDiscount = value;
    _flush();
    update();
  }

  double get parsedBaseRate {
    return double.tryParse(baseRateController.text.trim()) ?? 0.0;
  }

  double get parsedWeekendMultiplier {
    return double.tryParse(weekendMultiplierController.text.trim()) ?? 0.0;
  }

  double get parsedPeakMultiplier {
    return double.tryParse(peakMultiplierController.text.trim()) ?? 0.0;
  }

  int get parsedMinStay {
    return int.tryParse(minimumStayController.text.trim()) ?? 0;
  }

  double get weekendRate {
    return parsedBaseRate + (parsedBaseRate * parsedWeekendMultiplier / 100);
  }

  double get peakSeasonRate {
    return parsedBaseRate + (parsedBaseRate * parsedPeakMultiplier / 100);
  }

  bool get isReady {
    return parsedBaseRate > 0 && parsedMinStay >= 1;
  }

  @override
  void onClose() {
    baseRateController.dispose();
    weekendMultiplierController.dispose();
    peakMultiplierController.dispose();
    minimumStayController.dispose();
    super.onClose();
  }
}

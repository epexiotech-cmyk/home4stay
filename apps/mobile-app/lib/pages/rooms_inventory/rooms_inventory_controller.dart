import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/rooms_inventory/models/room_category.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';

class RoomsInventoryController extends GetxController {
  final roomNameController = TextEditingController();
  final baseRateController = TextEditingController();

  final RxList<RoomCategory> roomCategories = <RoomCategory>[].obs;

  @override
  void onInit() {
    super.onInit();
    if (Get.isRegistered<OnboardingWizardController>()) {
      roomCategories.value = Get.find<OnboardingWizardController>().roomData.categories;
    }
  }

  void _flush() {
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>();
      global.roomData.categories = roomCategories.toList();
      global.triggerAutoSave();
    }
  }

  int get totalCategories => roomCategories.length;

  double get averageRate {
    if (roomCategories.isEmpty) return 0;
    double sum = roomCategories.fold(0, (sum, item) => sum + item.baseRate);
    return sum / roomCategories.length;
  }

  String get highestRateCategory {
    if (roomCategories.isEmpty) return "N/A";
    var highest = roomCategories.reduce((curr, next) => curr.baseRate > next.baseRate ? curr : next);
    return "${highest.name} (₹${highest.baseRate.toStringAsFixed(0)})";
  }

  bool get isReady => roomCategories.isNotEmpty;

  void addRoom() {
    String name = roomNameController.text.trim();
    String rateText = baseRateController.text.trim();

    if (name.isEmpty) {
      Get.snackbar(
        "Validation Error", 
        "Room Name is required.", 
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1F2937),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    if (rateText.isEmpty) {
      Get.snackbar(
        "Validation Error", 
        "Base Rate is required.", 
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1F2937),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    double? rate = double.tryParse(rateText);
    if (rate == null || rate <= 0) {
      Get.snackbar(
        "Validation Error", 
        "Base Rate must be a valid numeric value greater than 0.", 
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF1F2937),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    bool exists = roomCategories.any((cat) => cat.name.toLowerCase() == name.toLowerCase());
    if (exists) {
      Get.snackbar(
        "Duplicate Category", 
        "Room category already exists.", 
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.red.shade800,
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
      return;
    }

    RoomCategory newCategory = RoomCategory(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: name,
      baseRate: rate,
      createdAt: DateTime.now(),
    );

    roomCategories.add(newCategory);
    roomNameController.clear();
    baseRateController.clear();
    _flush();
    update();
  }

  void removeRoom(String id) {
    roomCategories.removeWhere((cat) => cat.id == id);
    _flush();
    update();
  }

  @override
  void onClose() {
    roomNameController.dispose();
    baseRateController.dispose();
    super.onClose();
  }
}

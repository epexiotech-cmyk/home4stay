import 'dart:convert';
import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';
import 'package:home4stay/features/onboarding/domain/services/property_creation_service.dart';

import 'package:home4stay/features/onboarding/domain/models/property_draft_model.dart';
import 'package:home4stay/features/launch_workflow/domain/services/property_launch_orchestrator.dart';
import 'package:home4stay/features/launch_workflow/domain/models/property_launch_workflow.dart';

class LaunchReadinessController extends GetxController {
  late OnboardingWizardController global;

  @override
  void onInit() {
    super.onInit();
    global = Get.find<OnboardingWizardController>();
  }

  // --- IDENTITY ---
  bool get isIdentityReady {
    final d = global.identityData;
    return d.propertyName.trim().isNotEmpty &&
           d.geographicCoordinates.trim().isNotEmpty &&
           d.aspirationalNarrative.trim().isNotEmpty;
  }

  int get identityScore => isIdentityReady ? 10 : 0;

  // --- THEME ---
  bool get isThemeReady => global.themeData.selectedThemeId != null;
  int get themeScore => isThemeReady ? 10 : 0;

  // --- ROOMS ---
  bool get isRoomsReady => global.roomData.categories.isNotEmpty;
  int get roomsScore => isRoomsReady ? 15 : 0;

  // --- AMENITIES ---
  bool get isAmenitiesReady => global.amenityData.selectedIds.isNotEmpty;
  int get amenitiesScore => isAmenitiesReady ? 10 : 0;

  // --- EXPERIENCES ---
  bool get isExperiencesReady => global.experienceData.selectedIds.isNotEmpty;
  int get experiencesScore => isExperiencesReady ? 10 : 0;

  // --- MEDIA ---
  int get mediaCategoriesConfigured {
    return global.mediaData.categoryMediaMap.values.where((list) => list.isNotEmpty).length;
  }
  bool get isMediaReady => global.mediaData.categoryMediaMap.values.any((list) => list.isNotEmpty);
  int get mediaScore {
    int count = mediaCategoriesConfigured;
    if (count == 0) return 0;
    if (count == 1) return 4;
    if (count == 2) return 8;
    if (count == 3) return 12;
    if (count == 4) return 16;
    return 20; // 5 or more
  }

  // --- POLICIES ---
  bool get isPoliciesReady {
    final d = global.policyData;
    return d.checkIn != null && d.checkOut != null && d.cancellation != null;
  }
  int get policiesScore => isPoliciesReady ? 10 : 0;

  // --- PRICING ---
  bool get isPricingReady {
    final d = global.pricingData;
    double rate = double.tryParse(d.baseRate.trim()) ?? 0;
    int stay = int.tryParse(d.minimumStay.trim()) ?? 0;
    return rate > 0 && stay >= 1;
  }
  int get pricingScore => isPricingReady ? 15 : 0;

  // --- TOTAL SCORE ---
  int get totalScore {
    return identityScore +
           themeScore +
           roomsScore +
           amenitiesScore +
           experiencesScore +
           mediaScore +
           policiesScore +
           pricingScore;
  }

  // --- MISSING REQUIREMENTS ---
  List<String> get missingRequirements {
    List<String> missing = [];
    if (!isIdentityReady) missing.add("Property Identity is incomplete.");
    if (!isThemeReady) missing.add("Property Theme is not selected.");
    if (!isRoomsReady) missing.add("No room categories configured.");
    if (!isAmenitiesReady) missing.add("No amenities selected.");
    if (!isExperiencesReady) missing.add("No signature experiences selected.");
    if (!isMediaReady) missing.add("No media uploaded.");
    if (!isPoliciesReady) missing.add("Policies and Terms are incomplete.");
    if (!isPricingReady) missing.add("Pricing strategy not fully configured.");
    return missing;
  }

  bool get canLaunch => totalScore >= 90;

  // --- STATUS ---
  String get readinessStatus {
    if (totalScore >= 90) return "READY TO LAUNCH";
    if (totalScore >= 70) return "NEARLY READY";
    if (totalScore >= 40) return "NEEDS ATTENTION";
    return "INCOMPLETE";
  }

  Color get statusColor {
    if (totalScore >= 90) return const Color(0xFF16A34A); // Success
    if (totalScore >= 70) return const Color(0xFF0D5C7D); // Primary
    if (totalScore >= 40) return const Color(0xFFF59E0B); // Warning
    return const Color(0xFFEF4444); // Error
  }


  void launchProperty() async {
    final orchestrator = PropertyLaunchOrchestrator();
    
    _showProgressDialog(orchestrator.stateStream);

    final result = await orchestrator.launchProperty(global);
    
    orchestrator.dispose();

    if (result.success) {
      Get.back(); // Close dialog
      Get.offAllNamed('/launch-success', arguments: result);
    } else {
      Get.back(); // Close dialog
      Get.defaultDialog(
        title: "Launch Failed",
        middleText: result.message ?? "Unknown error",
        textConfirm: "OK",
        confirmTextColor: Colors.white,
        buttonColor: const Color(0xFFEF4444),
        onConfirm: () => Get.back(),
      );
    }
  }

  void _showProgressDialog(Stream<LaunchState> stream) {
    Get.dialog(
      Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator(color: Color(0xFF0D5C7D)),
              const SizedBox(height: 24),
              StreamBuilder<LaunchState>(
                stream: stream,
                initialData: LaunchState.idle,
                builder: (context, snapshot) {
                  String text = "Preparing...";
                  switch(snapshot.data) {
                    case LaunchState.validating: text = "Validating..."; break;
                    case LaunchState.creatingProperty: text = "Creating Property..."; break;
                    case LaunchState.uploadingMedia: text = "Uploading Media..."; break;
                    case LaunchState.publishing: text = "Publishing..."; break;
                    case LaunchState.completed: text = "Success!"; break;
                    default: break;
                  }
                  return Text(
                    text,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  );
                },
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }

  String getDraftJsonPreview() {
    try {
      PropertyDraft draft = OnboardingWizardMapper.mapToDraft(global);
      return const JsonEncoder.withIndent('  ').convert(draft.toJson());
    } catch (e) {
      return "{}";
    }
  }
}

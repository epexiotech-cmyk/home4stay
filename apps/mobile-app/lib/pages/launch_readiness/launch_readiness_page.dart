import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/widget/wizard_sidebar.dart';
import 'package:home4stay/pages/launch_readiness/launch_readiness_controller.dart';

class LaunchReadinessPage extends StatelessWidget {
  const LaunchReadinessPage({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return GetBuilder<LaunchReadinessController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: const Color(0xFFF7F2EE),
          body: SafeArea(
            child: Row(
              children: [
                if (!isMobile) const WizardSidebar(currentStep: 10),
                Expanded(
                  child: Column(
                    children: [
                      if (isMobile)
                        Container(
                          padding: EdgeInsets.all(wp(4)),
                          color: AppColors.WHITE,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Step 10 of 10",
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontSize: dp(context, 12),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: hp(1)),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: 1.0,
                                  minHeight: 6,
                                  backgroundColor: Colors.grey.shade200,
                                  valueColor: const AlwaysStoppedAnimation<Color>(
                                    Color(0xFF0D5C7D),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      // Scrollable content
                      Expanded(
                        child: SingleChildScrollView(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? wp(5) : wp(8),
                            vertical: hp(6),
                          ),
                          child: Center(
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 900),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: wp(3),
                                      vertical: hp(0.5),
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0x1A0D5C7D),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      "STEP 10 : LAUNCH READINESS",
                                      style: TextStyle(
                                        color: const Color(0xFF0D5C7D),
                                        fontSize: dp(context, 12),
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 1.0,
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: hp(3)),
                                  Text(
                                    "Property Launch Command Center",
                                    style: TextStyle(
                                      fontSize: dp(context, 32),
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                      height: 1.2,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Text(
                                    "Review your property configuration and prepare for launch.",
                                    style: TextStyle(
                                      fontSize: dp(context, 16),
                                      color: const Color(0xCC1F2937),
                                      height: 1.6,
                                    ),
                                  ),
                                  SizedBox(height: hp(5)),

                                  // Top Metrics (Score & Launch Action)
                                  _buildTopMetrics(context, controller),
                                  SizedBox(height: hp(5)),

                                  // Main Grid
                                  LayoutBuilder(
                                    builder: (context, constraints) {
                                      bool isDesktop = constraints.maxWidth > 700;
                                      return isDesktop
                                          ? Row(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                Expanded(flex: 2, child: _buildConfigurationSummary(context, controller)),
                                                const SizedBox(width: 24),
                                                Expanded(flex: 1, child: _buildSidebarPanels(context, controller)),
                                              ],
                                            )
                                          : Column(
                                              crossAxisAlignment: CrossAxisAlignment.start,
                                              children: [
                                                _buildConfigurationSummary(context, controller),
                                                const SizedBox(height: 24),
                                                _buildSidebarPanels(context, controller),
                                              ],
                                            );
                                    },
                                  ),
                                  SizedBox(height: hp(5)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Footer
                      _buildFooter(context),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTopMetrics(BuildContext context, LaunchReadinessController controller) {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "READINESS SCORE",
                style: TextStyle(
                  color: Color(0xFF1F2937),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    "${controller.totalScore}",
                    style: TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: controller.statusColor,
                    ),
                  ),
                  const Text(
                    " / 100",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: controller.statusColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  controller.readinessStatus,
                  style: TextStyle(
                    color: controller.statusColor,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              ElevatedButton(
                onPressed: controller.canLaunch ? () => controller.launchProperty() : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: controller.canLaunch ? const Color(0xFF16A34A) : Colors.grey.shade300,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: const Text(
                  "LAUNCH PROPERTY",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
              const SizedBox(height: 16),
              OutlinedButton(
                onPressed: () => _showSummaryModal(context, controller),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF0D5C7D),
                  side: const BorderSide(color: Color(0xFF0D5C7D)),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text(
                  "VIEW PROPERTY SUMMARY",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
              ),
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: () async {
                  await controller.global.saveDraft();
                  Get.snackbar(
                    "Draft Saved",
                    "Your progress has been saved manually.",
                    snackPosition: SnackPosition.BOTTOM,
                    backgroundColor: const Color(0xFF16A34A),
                    colorText: Colors.white,
                    margin: const EdgeInsets.all(16),
                  );
                },
                icon: const Icon(Icons.save, size: 16),
                label: const Text(
                  "SAVE DRAFT",
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                ),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.grey.shade700,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildConfigurationSummary(BuildContext context, LaunchReadinessController controller) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "CONFIGURATION SUMMARY",
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 16),
        LayoutBuilder(
          builder: (context, constraints) {
            int crossAxisCount = constraints.maxWidth > 400 ? 2 : 1;
            double itemWidth = (constraints.maxWidth - 24) / crossAxisCount;
            return Wrap(
              spacing: 24,
              runSpacing: 24,
              children: [
                SizedBox(
                  width: itemWidth,
                  child: _buildSummaryCard(
                    "Property Identity",
                    Icons.home,
                    [
                      "Name: ${controller.global.identityData.propertyName.isEmpty ? 'Not Set' : controller.global.identityData.propertyName}",
                      "Location: ${controller.global.identityData.geographicCoordinates.isEmpty ? 'Not Set' : controller.global.identityData.geographicCoordinates}",
                    ],
                  ),
                ),
                SizedBox(
                  width: itemWidth,
                  child: _buildSummaryCard(
                    "Theme",
                    Icons.color_lens,
                    ["Selected: ${controller.global.themeData.selectedThemeId ?? 'None'}"],
                  ),
                ),
                SizedBox(
                  width: itemWidth,
                  child: _buildSummaryCard(
                    "Rooms",
                    Icons.king_bed,
                    ["Total Categories: ${controller.global.roomData.categories.length}"],
                  ),
                ),
                SizedBox(
                  width: itemWidth,
                  child: _buildSummaryCard(
                    "Amenities",
                    Icons.pool,
                    ["Selected Count: ${controller.global.amenityData.selectedIds.length}"],
                  ),
                ),
                SizedBox(
                  width: itemWidth,
                  child: _buildSummaryCard(
                    "Experiences",
                    Icons.explore,
                    ["Selected Count: ${controller.global.experienceData.selectedIds.length}"],
                  ),
                ),
                SizedBox(
                  width: itemWidth,
                  child: _buildSummaryCard(
                    "Media",
                    Icons.photo_library,
                    ["Total Media: ${controller.global.mediaData.categoryMediaMap.values.fold(0, (sum, list) => sum + list.length)}"],
                  ),
                ),
                SizedBox(
                  width: itemWidth,
                  child: _buildSummaryCard(
                    "Policies",
                    Icons.rule,
                    ["Cancellation: ${controller.global.policyData.cancellation ?? 'Not Set'}"],
                  ),
                ),
                SizedBox(
                  width: itemWidth,
                  child: _buildSummaryCard(
                    "Pricing",
                    Icons.attach_money,
                    ["Base Rate: ₹${controller.global.pricingData.baseRate.isEmpty ? '0' : controller.global.pricingData.baseRate}"],
                  ),
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildSummaryCard(String title, IconData icon, List<String> details) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: const Color(0xFF0D5C7D), size: 20),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ...details.map((d) => Padding(
                padding: const EdgeInsets.only(bottom: 4),
                child: Text(
                  d,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              )),
        ],
      ),
    );
  }

  Widget _buildSidebarPanels(BuildContext context, LaunchReadinessController controller) {
    return Column(
      children: [
        _buildMissingRequirementsPanel(controller),
        const SizedBox(height: 24),
        _buildReadinessChecklist(controller),
      ],
    );
  }

  Widget _buildMissingRequirementsPanel(LaunchReadinessController controller) {
    List<String> missing = controller.missingRequirements;
    bool hasMissing = missing.isNotEmpty;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: hasMissing ? const Color(0xFFFEF2F2) : const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: hasMissing ? const Color(0xFFFCA5A5) : const Color(0xFF86EFAC), width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                hasMissing ? Icons.warning_amber_rounded : Icons.check_circle,
                color: hasMissing ? const Color(0xFFEF4444) : const Color(0xFF16A34A),
              ),
              const SizedBox(width: 8),
              Text(
                hasMissing ? "MISSING REQUIREMENTS" : "ALL SYSTEMS GO",
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                  letterSpacing: 1.0,
                  color: hasMissing ? const Color(0xFF991B1B) : const Color(0xFF166534),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (hasMissing)
            ...missing.map((req) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text("• ", style: TextStyle(color: Color(0xFFEF4444))),
                      Expanded(
                        child: Text(
                          req,
                          style: const TextStyle(fontSize: 14, color: Color(0xFF991B1B)),
                        ),
                      ),
                    ],
                  ),
                ))
          else
            const Text(
              "All launch requirements satisfied.",
              style: TextStyle(fontSize: 14, color: Color(0xFF166534)),
            ),
        ],
      ),
    );
  }

  Widget _buildReadinessChecklist(LaunchReadinessController controller) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "READINESS CHECKLIST",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 12,
              letterSpacing: 1.0,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 16),
          _buildChecklistItem("Property Identity", controller.isIdentityReady),
          _buildChecklistItem("Theme", controller.isThemeReady),
          _buildChecklistItem("Rooms", controller.isRoomsReady),
          _buildChecklistItem("Amenities", controller.isAmenitiesReady),
          _buildChecklistItem("Experiences", controller.isExperiencesReady),
          _buildChecklistItem("Media", controller.isMediaReady),
          _buildChecklistItem("Policies", controller.isPoliciesReady),
          _buildChecklistItem("Pricing", controller.isPricingReady),
        ],
      ),
    );
  }

  Widget _buildChecklistItem(String title, bool isReady) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(
            isReady ? Icons.check_circle : Icons.radio_button_unchecked,
            color: isReady ? const Color(0xFF16A34A) : Colors.grey.shade400,
            size: 20,
          ),
          const SizedBox(width: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: isReady ? FontWeight.w600 : FontWeight.normal,
              color: isReady ? const Color(0xFF1F2937) : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: wp(8), vertical: hp(2)),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          TextButton.icon(
            onPressed: () => Get.back(),
            icon: const Icon(Icons.arrow_back, color: Color(0xFF1F2937)),
            label: const Text(
              "BACK",
              style: TextStyle(color: Color(0xFF1F2937), fontWeight: FontWeight.bold),
            ),
          ),
          const Text(
            "Launch Complete",
            style: TextStyle(
              color: Color(0xFF0D5C7D),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
            ),
          ),
        ],
      ),
    );
  }

  void _showSummaryModal(BuildContext context, LaunchReadinessController controller) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Preview Payload (JSON)"),
          content: Container(
            width: double.maxFinite,
            height: 400,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1F2937),
              borderRadius: BorderRadius.circular(12),
            ),
            child: SingleChildScrollView(
              child: SelectableText(
                controller.getDraftJsonPreview(),
                style: const TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 12,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("CLOSE"),
            ),
          ],
        );
      },
    );
  }
}

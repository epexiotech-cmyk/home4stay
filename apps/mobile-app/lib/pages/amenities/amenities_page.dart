import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/widget/wizard_sidebar.dart';
import 'package:home4stay/pages/welcome/widget/wizard_footer.dart';
import 'package:home4stay/pages/amenities/amenities_controller.dart';
import 'package:home4stay/pages/amenities/models/amenity_model.dart';

class AmenitiesPage extends StatelessWidget {
  const AmenitiesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return GetBuilder<AmenitiesController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: const Color(0xFFF7F2EE),
          body: SafeArea(
            child: Row(
              children: [
                if (!isMobile) const WizardSidebar(currentStep: 5),
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
                                "Step 5 of 10",
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
                                  value: 0.5,
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
                              constraints: const BoxConstraints(maxWidth: 800),
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
                                      "STEP 5 : LUXURY GUEST AMENITIES",
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
                                    "Amenity Experience Engine",
                                    style: TextStyle(
                                      fontSize: dp(context, 32),
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                      height: 1.2,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Text(
                                    "Select the amenities and facilities available at your property.\nThese amenities directly influence guest trust, booking conversion, and search visibility.",
                                    style: TextStyle(
                                      fontSize: dp(context, 16),
                                      color: const Color(0xCC1F2937),
                                      height: 1.6,
                                    ),
                                  ),
                                  SizedBox(height: hp(5)),

                                  // Custom Amenities section
                                  _buildCustomAmenityCreator(context, controller, isMobile),
                                  SizedBox(height: hp(5)),

                                  // Preset Amenities Grid
                                  Text(
                                    "PRESET AMENITIES",
                                    style: TextStyle(
                                      color: const Color(0xFF0D5C7D),
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.0,
                                      fontSize: 12,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Obx(() => _buildAmenityGrid(context, controller)),
                                  SizedBox(height: hp(5)),

                                  // Summary Panel
                                  Obx(() => _buildSummaryPanel(context, controller)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Footer
                      Obx(() => WizardFooter(
                        progress: 0.5, // 50% progress
                        isBackEnabled: true,
                        isNextEnabled: controller.isReady,
                        nextLabel: "CONTINUE SETUP",
                        onBack: () => Get.back(),
                        onNext: () {
                          Get.toNamed('/experiences');
                        },
                        leftWidget: Row(
                          children: [
                            const Icon(
                              Icons.info_outline,
                              color: Color(0xFF1F2937),
                              size: 20,
                            ),
                            SizedBox(width: wp(2)),
                            Expanded(
                              child: Text(
                                "Amenities improve booking conversion and guest confidence.",
                                style: TextStyle(
                                  color: const Color(0xFF1F2937).withValues(alpha: 0.7),
                                  fontSize: dp(context, 12),
                                  fontWeight: FontWeight.w500,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      )),
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

  Widget _buildCustomAmenityCreator(BuildContext context, AmenitiesController controller, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? wp(6) : 32.0),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Custom Amenities",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "Add unique facilities like 'Helipad', 'Private Yacht', or 'Wine Cellar'.",
            style: TextStyle(
              fontSize: 14,
              color: const Color(0xFF1F2937).withValues(alpha: 0.7),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: controller.customAmenityController,
                  decoration: InputDecoration(
                    hintText: "Enter custom amenity",
                    hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                    filled: true,
                    fillColor: const Color(0xFFF9FAFB),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.grey.shade300),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Color(0xFF0D5C7D), width: 2),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              ElevatedButton(
                onPressed: () => controller.addCustomAmenity(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D5C7D),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  "ADD",
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          Obx(() {
            if (controller.customAmenities.isEmpty) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(top: 24.0),
              child: Wrap(
                spacing: 12,
                runSpacing: 12,
                children: controller.customAmenities.map((amenity) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D5C7D).withValues(alpha: 0.05),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF0D5C7D).withValues(alpha: 0.2)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          amenity.name,
                          style: const TextStyle(
                            color: Color(0xFF0D5C7D),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () {
                            _showDeleteDialog(context, controller, amenity);
                          },
                          child: Icon(Icons.close, size: 16, color: Colors.red.shade400),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            );
          }),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, AmenitiesController controller, Amenity amenity) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text("Remove Custom Amenity", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1F2937))),
          content: Text("Are you sure you want to remove '${amenity.name}'?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text("Cancel", style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () {
                controller.removeCustomAmenity(amenity.id);
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade600,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text("Delete", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildAmenityGrid(BuildContext context, AmenitiesController controller) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = constraints.maxWidth > 800 ? 3 : (constraints.maxWidth > 600 ? 2 : 1);
        double totalSpacing = (crossAxisCount - 1) * 16.0;
        double itemWidth = (constraints.maxWidth - totalSpacing) / crossAxisCount;

        return Wrap(
          spacing: 16,
          runSpacing: 16,
          children: controller.presetAmenities.map((amenity) {
            return SizedBox(
              width: itemWidth,
              child: _buildAmenityCard(controller, amenity),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildAmenityCard(AmenitiesController controller, Amenity amenity) {
    bool isSelected = controller.selectedAmenityIds.contains(amenity.id);

    return GestureDetector(
      onTap: () => controller.toggleAmenity(amenity.id),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0D5C7D).withValues(alpha: 0.02) : AppColors.WHITE,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF0D5C7D) : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF0D5C7D).withValues(alpha: 0.1),
                    blurRadius: 15,
                    offset: const Offset(0, 4),
                  )
                ]
              : [],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF0D5C7D).withValues(alpha: 0.1) : Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    amenity.icon,
                    color: isSelected ? const Color(0xFF0D5C7D) : Colors.grey.shade400,
                    size: 24,
                  ),
                ),
                if (isSelected)
                  const Icon(
                    Icons.check_circle,
                    color: Color(0xFF0D5C7D),
                    size: 24,
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              amenity.name,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isSelected ? const Color(0xFF0D5C7D) : const Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              amenity.description,
              style: TextStyle(
                fontSize: 12,
                color: const Color(0xFF1F2937).withValues(alpha: 0.6),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryPanel(BuildContext context, AmenitiesController controller) {
    if (controller.selectedAmenityIds.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: const Color(0xFF0D5C7D).withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF0D5C7D).withValues(alpha: 0.1)),
        ),
        child: Column(
          children: [
            const Icon(Icons.stars, size: 48, color: Color(0xFF0D5C7D)),
            const SizedBox(height: 16),
            const Text(
              "No amenities selected yet.",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
            ),
            const SizedBox(height: 8),
            Text(
              "Choose amenities to enhance your guest experience.",
              style: TextStyle(fontSize: 14, color: const Color(0xFF1F2937).withValues(alpha: 0.7)),
            ),
          ],
        ),
      );
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF0D5C7D).withValues(alpha: 0.2), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Wrap(
            spacing: 32,
            runSpacing: 24,
            children: [
              _buildSummaryStat("Selected Amenities", controller.totalSelected.toString()),
              _buildSummaryStat("Preset", controller.selectedPresetCount.toString()),
              _buildSummaryStat("Custom", controller.selectedCustomCount.toString()),
            ],
          ),
          const SizedBox(height: 32),
          const Text(
            "LIVE AMENITY TAGS",
            style: TextStyle(
              color: Color(0xFF0D5C7D),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: controller.allSelectedAmenities.map((amenity) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF16A34A).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (amenity.icon != null) ...[
                      Icon(amenity.icon, size: 14, color: const Color(0xFF16A34A)),
                      const SizedBox(width: 6),
                    ],
                    Text(
                      amenity.name,
                      style: const TextStyle(
                        color: Color(0xFF16A34A),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: const Color(0xFF1F2937).withValues(alpha: 0.6),
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            color: Color(0xFF0D5C7D),
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

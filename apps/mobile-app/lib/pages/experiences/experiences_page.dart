import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/widget/wizard_sidebar.dart';
import 'package:home4stay/pages/welcome/widget/wizard_footer.dart';
import 'package:home4stay/pages/experiences/experiences_controller.dart';
import 'package:home4stay/pages/experiences/models/experience_model.dart';

class ExperiencesPage extends StatelessWidget {
  const ExperiencesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return GetBuilder<ExperiencesController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: const Color(0xFFF7F2EE),
          body: SafeArea(
            child: Row(
              children: [
                if (!isMobile) const WizardSidebar(currentStep: 6),
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
                                "Step 6 of 10",
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
                                  value: 0.6,
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
                                      "STEP 6 : SIGNATURE EXPERIENCES",
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
                                    "Experience Architecture Engine",
                                    style: TextStyle(
                                      fontSize: dp(context, 32),
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                      height: 1.2,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Text(
                                    "Create memorable guest experiences that differentiate your property and increase booking value.",
                                    style: TextStyle(
                                      fontSize: dp(context, 16),
                                      color: const Color(0xCC1F2937),
                                      height: 1.6,
                                    ),
                                  ),
                                  SizedBox(height: hp(5)),

                                  // Custom Experience section
                                  _buildCustomExperienceCreator(context, controller, isMobile),
                                  SizedBox(height: hp(5)),

                                  // Preset Experiences Grid
                                  const Text(
                                    "PRESET EXPERIENCES",
                                    style: TextStyle(
                                      color: Color(0xFF0D5C7D),
                                      fontWeight: FontWeight.bold,
                                      letterSpacing: 1.0,
                                      fontSize: 12,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Obx(() => _buildExperienceGrid(context, controller)),
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
                        progress: 0.6, // 60% progress
                        isBackEnabled: true,
                        isNextEnabled: controller.isReady,
                        nextLabel: "CONTINUE SETUP",
                        onBack: () => Get.back(),
                        onNext: () {
                          Get.toNamed('/media-gallery');
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
                                "Experiences increase guest engagement and booking value.",
                                style: TextStyle(
                                  color: const Color(0xFF1F2937).withOpacity(0.7),
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

  Widget _buildCustomExperienceCreator(BuildContext context, ExperiencesController controller, bool isMobile) {
    return Container(
      padding: EdgeInsets.all(isMobile ? wp(6) : 32.0),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Add Custom Experience",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            "e.g. 'Private Helicopter Tour', 'Desert Safari', 'Luxury Cruise Dinner'",
            style: TextStyle(
              fontSize: 14,
              color: const Color(0xFF1F2937).withOpacity(0.7),
            ),
          ),
          const SizedBox(height: 24),
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: controller.customExperienceController,
                  decoration: InputDecoration(
                    hintText: "Enter custom experience",
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
                onPressed: () => controller.addCustomExperience(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0D5C7D),
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  "ADD EXPERIENCE",
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          Obx(() {
            if (controller.customExperiences.isEmpty) return const SizedBox.shrink();
            return Padding(
              padding: const EdgeInsets.only(top: 24.0),
              child: Wrap(
                spacing: 12,
                runSpacing: 12,
                children: controller.customExperiences.map((exp) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: const Color(0xFF0D5C7D).withOpacity(0.05),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF0D5C7D).withOpacity(0.2)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          exp.name,
                          style: const TextStyle(
                            color: Color(0xFF0D5C7D),
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () {
                            _showDeleteDialog(context, controller, exp);
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

  void _showDeleteDialog(BuildContext context, ExperiencesController controller, Experience exp) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text("Remove Experience", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1F2937))),
          content: Text("Are you sure you want to remove '${exp.name}'?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text("Cancel", style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () {
                controller.removeCustomExperience(exp.id);
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

  Widget _buildExperienceGrid(BuildContext context, ExperiencesController controller) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = constraints.maxWidth > 800 ? 3 : (constraints.maxWidth > 600 ? 2 : 1);
        double totalSpacing = (crossAxisCount - 1) * 16.0;
        double itemWidth = (constraints.maxWidth - totalSpacing) / crossAxisCount;

        return Wrap(
          spacing: 16,
          runSpacing: 16,
          children: controller.presetExperiences.map((exp) {
            return SizedBox(
              width: itemWidth,
              child: _buildExperienceCard(controller, exp),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildExperienceCard(ExperiencesController controller, Experience exp) {
    bool isSelected = controller.selectedExperienceIds.contains(exp.id);

    return GestureDetector(
      onTap: () => controller.toggleExperience(exp.id),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0D5C7D).withOpacity(0.02) : AppColors.WHITE,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF0D5C7D) : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF0D5C7D).withOpacity(0.1),
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
                    color: isSelected ? const Color(0xFF0D5C7D).withOpacity(0.1) : Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    exp.icon,
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
              exp.name,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isSelected ? const Color(0xFF0D5C7D) : const Color(0xFF1F2937),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              exp.description,
              style: TextStyle(
                fontSize: 12,
                color: const Color(0xFF1F2937).withOpacity(0.6),
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryPanel(BuildContext context, ExperiencesController controller) {
    if (controller.selectedExperienceIds.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(40),
        decoration: BoxDecoration(
          color: const Color(0xFF0D5C7D).withOpacity(0.05),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF0D5C7D).withOpacity(0.1)),
        ),
        child: Column(
          children: [
            const Icon(Icons.stars, size: 48, color: Color(0xFF0D5C7D)),
            const SizedBox(height: 16),
            const Text(
              "No experiences configured yet.",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF1F2937)),
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
        border: Border.all(color: const Color(0xFF0D5C7D).withOpacity(0.2), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "EXPERIENCE PACKAGES",
            style: TextStyle(
              color: Color(0xFF0D5C7D),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 32,
            runSpacing: 24,
            children: [
              _buildSummaryStat("Selected Experiences", controller.totalSelected.toString()),
              _buildSummaryStat("Custom Experiences", controller.selectedCustomCount.toString()),
            ],
          ),
          const SizedBox(height: 32),
          const Text(
            "LIVE EXPERIENCE CHIPS",
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
            children: controller.allSelectedExperiences.map((exp) {
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF16A34A).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (exp.icon != null) ...[
                      Icon(exp.icon, size: 14, color: const Color(0xFF16A34A)),
                      const SizedBox(width: 6),
                    ],
                    Text(
                      exp.name,
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
          const SizedBox(height: 40),
          _buildGuestJourneyPreview(context, controller),
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
            color: const Color(0xFF1F2937).withOpacity(0.6),
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

  Widget _buildGuestJourneyPreview(BuildContext context, ExperiencesController controller) {
    List<Experience> selected = controller.allSelectedExperiences;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: const Color(0xFFF7F2EE),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300, width: 1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Text(
            "Sample Guest Journey",
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 24),
          Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              _buildJourneyNode("Arrival", isEndpoint: true),
              ...selected.expand((exp) => [
                    _buildJourneyArrow(),
                    _buildJourneyNode(exp.name),
                  ]),
              _buildJourneyArrow(),
              _buildJourneyNode("Departure", isEndpoint: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildJourneyNode(String text, {bool isEndpoint = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: isEndpoint ? const Color(0xFF1F2937) : AppColors.WHITE,
        borderRadius: BorderRadius.circular(20),
        border: isEndpoint ? null : Border.all(color: const Color(0xFF0D5C7D), width: 1.5),
        boxShadow: isEndpoint
            ? []
            : [
                BoxShadow(
                  color: const Color(0xFF0D5C7D).withOpacity(0.1),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                )
              ],
      ),
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: isEndpoint ? Colors.white : const Color(0xFF0D5C7D),
          fontWeight: FontWeight.bold,
          fontSize: 14,
        ),
      ),
    );
  }

  Widget _buildJourneyArrow() {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 8),
      child: Icon(Icons.arrow_downward, color: Colors.grey, size: 20),
    );
  }
}

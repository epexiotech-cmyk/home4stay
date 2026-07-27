import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/widget/wizard_sidebar.dart';
import 'package:home4stay/pages/welcome/widget/wizard_footer.dart';
import 'package:home4stay/pages/policies/policies_controller.dart';

class PoliciesPage extends StatelessWidget {
  const PoliciesPage({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return GetBuilder<PoliciesController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: const Color(0xFFF7F2EE),
          body: SafeArea(
            child: Row(
              children: [
                if (!isMobile) const WizardSidebar(currentStep: 8),
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
                                "Step 8 of 10",
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
                                  value: 0.8,
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
                                      "STEP 8 : POLICIES & TERMS",
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
                                    "Guest Policy Architecture",
                                    style: TextStyle(
                                      fontSize: dp(context, 32),
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                      height: 1.2,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Text(
                                    "Define the operational rules that govern guest stays and booking behavior.",
                                    style: TextStyle(
                                      fontSize: dp(context, 16),
                                      color: const Color(0xCC1F2937),
                                      height: 1.6,
                                    ),
                                  ),
                                  SizedBox(height: hp(5)),

                                  // Live Summary & Progress
                                  _buildLiveSummary(context, controller),
                                  SizedBox(height: hp(5)),

                                  // Policy Layout Builder
                                  _buildPolicyGrid(context, controller),
                                  SizedBox(height: hp(5)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Footer
                      WizardFooter(
                        progress: 0.8, // 80% progress
                        isBackEnabled: true,
                        isNextEnabled: controller.isReady,
                        nextLabel: "CONTINUE SETUP",
                        onBack: () => Get.back(),
                        onNext: () {
                          Get.toNamed('/pricing-engine');
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
                                "Clear policies reduce guest disputes and increase trust.",
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
                      ),
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

  Widget _buildLiveSummary(BuildContext context, PoliciesController controller) {
    double score = controller.completionScore;
    int percentage = (score * 100).toInt();

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
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "POLICY COMPLETENESS SCORE",
                style: TextStyle(
                  color: Color(0xFF0D5C7D),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  fontSize: 12,
                ),
              ),
              Text(
                "$percentage%",
                style: const TextStyle(
                  color: Color(0xFF0D5C7D),
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: score,
              minHeight: 12,
              backgroundColor: Colors.grey.shade200,
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF16A34A)),
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            "LIVE POLICY SUMMARY",
            style: TextStyle(
              color: Color(0xFF0D5C7D),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 24,
            runSpacing: 16,
            children: [
              _buildSummaryItem("Check-in", controller.selectedCheckIn ?? "Not Set", controller.selectedCheckIn != null),
              _buildSummaryItem("Check-out", controller.selectedCheckOut ?? "Not Set", controller.selectedCheckOut != null),
              _buildSummaryItem("Cancellation", controller.selectedCancellation ?? "Not Set", controller.selectedCancellation != null),
              _buildSummaryItem("Children Allowed", controller.childrenAllowed ? "Yes" : "No", true),
              _buildSummaryItem("Pets Allowed", controller.petsAllowed ? "Yes" : "No", true),
              _buildSummaryItem("Smoking Allowed", controller.smokingAllowed ? "Yes" : "No", true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, bool isSet) {
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
          style: TextStyle(
            fontSize: 16,
            color: isSet ? const Color(0xFF0D5C7D) : Colors.grey.shade400,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildPolicyGrid(BuildContext context, PoliciesController controller) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = constraints.maxWidth > 700 ? 2 : 1;
        double totalSpacing = (crossAxisCount - 1) * 24.0;
        double itemWidth = (constraints.maxWidth - totalSpacing) / crossAxisCount;

        return Wrap(
          spacing: 24,
          runSpacing: 24,
          children: [
            SizedBox(width: itemWidth, child: _buildCheckInCard(controller)),
            SizedBox(width: itemWidth, child: _buildCheckOutCard(controller)),
            SizedBox(width: itemWidth, child: _buildCancellationCard(controller)),
            SizedBox(width: itemWidth, child: _buildChildPolicyCard(controller)),
            SizedBox(width: itemWidth, child: _buildToggleCard(
              title: "Pet Policy",
              description: "Are pets allowed on the property?",
              value: controller.petsAllowed,
              onChanged: (v) => controller.togglePetsAllowed(v),
              icon: Icons.pets,
            )),
            SizedBox(width: itemWidth, child: _buildToggleCard(
              title: "Smoking Policy",
              description: "Is smoking allowed in rooms or balconies?",
              value: controller.smokingAllowed,
              onChanged: (v) => controller.toggleSmokingAllowed(v),
              icon: Icons.smoking_rooms,
            )),
          ],
        );
      },
    );
  }

  Widget _buildCheckInCard(PoliciesController controller) {
    return _buildCardBase(
      title: "Check-in Policy *",
      description: "Standard check-in time.",
      icon: Icons.login,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            isExpanded: true,
            hint: Text("Select Time", style: TextStyle(color: Colors.grey.shade500)),
            value: controller.selectedCheckIn,
            items: controller.checkInOptions.map((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(value),
              );
            }).toList(),
            onChanged: (val) => controller.setCheckIn(val),
          ),
        ),
      ),
    );
  }

  Widget _buildCheckOutCard(PoliciesController controller) {
    return _buildCardBase(
      title: "Check-out Policy *",
      description: "Standard check-out time.",
      icon: Icons.logout,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: BoxDecoration(
          color: const Color(0xFFF9FAFB),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            isExpanded: true,
            hint: Text("Select Time", style: TextStyle(color: Colors.grey.shade500)),
            value: controller.selectedCheckOut,
            items: controller.checkOutOptions.map((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(value),
              );
            }).toList(),
            onChanged: (val) => controller.setCheckOut(val),
          ),
        ),
      ),
    );
  }

  Widget _buildCancellationCard(PoliciesController controller) {
    return _buildCardBase(
      title: "Cancellation Policy *",
      description: "Select the strictness of cancellations.",
      icon: Icons.event_busy,
      child: Column(
        children: controller.cancellationOptions.map((opt) {
          return RadioListTile<String>(
            title: Text(opt, style: const TextStyle(fontWeight: FontWeight.w600)),
            value: opt,
            // ignore: deprecated_member_use
            groupValue: controller.selectedCancellation,
            // ignore: deprecated_member_use
            onChanged: (val) => controller.setCancellation(val!),
            contentPadding: EdgeInsets.zero,
            activeColor: const Color(0xFF0D5C7D),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildChildPolicyCard(PoliciesController controller) {
    return _buildCardBase(
      title: "Child Policy",
      description: "Are children allowed?",
      icon: Icons.child_care,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Children Allowed", style: TextStyle(fontWeight: FontWeight.w600)),
              Switch(
                value: controller.childrenAllowed,
                onChanged: (val) => controller.toggleChildrenAllowed(val),
                activeThumbColor: const Color(0xFF0D5C7D),
              ),
            ],
          ),
          if (controller.childrenAllowed) ...[
            const SizedBox(height: 16),
            TextFormField(
              controller: controller.childAgeLimitController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: "Age Limit (Optional)",
                hintText: "e.g. 12",
                filled: true,
                fillColor: const Color(0xFFF9FAFB),
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
          ],
        ],
      ),
    );
  }

  Widget _buildToggleCard({
    required String title,
    required String description,
    required bool value,
    required Function(bool) onChanged,
    required IconData icon,
  }) {
    return _buildCardBase(
      title: title,
      description: description,
      icon: icon,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text("Allowed", style: TextStyle(fontWeight: FontWeight.w600)),
          Switch(
            value: value,
            onChanged: onChanged,
            activeThumbColor: const Color(0xFF0D5C7D),
          ),
        ],
      ),
    );
  }

  Widget _buildCardBase({
    required String title,
    required String description,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF0D5C7D).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: const Color(0xFF0D5C7D), size: 24),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      description,
                      style: TextStyle(
                        fontSize: 12,
                        color: const Color(0xFF1F2937).withValues(alpha: 0.6),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          child,
        ],
      ),
    );
  }
}

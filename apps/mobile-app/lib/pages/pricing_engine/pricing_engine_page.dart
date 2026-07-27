import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/widget/wizard_sidebar.dart';
import 'package:home4stay/pages/welcome/widget/wizard_footer.dart';
import 'package:home4stay/pages/pricing_engine/pricing_engine_controller.dart';

class PricingEnginePage extends StatelessWidget {
  const PricingEnginePage({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return GetBuilder<PricingEngineController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: const Color(0xFFF7F2EE),
          body: SafeArea(
            child: Row(
              children: [
                if (!isMobile) const WizardSidebar(currentStep: 9),
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
                                "Step 9 of 10",
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
                                  value: 0.9,
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
                                      "STEP 9 : PRICING ENGINE",
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
                                    "Revenue Optimization Engine",
                                    style: TextStyle(
                                      fontSize: dp(context, 32),
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                      height: 1.2,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Text(
                                    "Define your base pricing strategy and booking rules.",
                                    style: TextStyle(
                                      fontSize: dp(context, 16),
                                      color: const Color(0xCC1F2937),
                                      height: 1.6,
                                    ),
                                  ),
                                  SizedBox(height: hp(5)),

                                  // Live Price Preview & Summary
                                  _buildLivePreviewAndSummary(context, controller),
                                  SizedBox(height: hp(5)),

                                  // Grid for Base Pricing and Booking Rules
                                  _buildPricingGrid(context, controller),
                                  SizedBox(height: hp(5)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Footer
                      WizardFooter(
                        progress: 0.9, // 90% progress
                        isBackEnabled: true,
                        isNextEnabled: controller.isReady,
                        nextLabel: "CONTINUE SETUP",
                        onBack: () => Get.back(),
                        onNext: () {
                          Get.toNamed('/launch-readiness');
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
                                "Pricing strategy directly impacts booking performance.",
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

  Widget _buildLivePreviewAndSummary(BuildContext context, PricingEngineController controller) {
    return Container(
      width: double.infinity,
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
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(32),
            decoration: const BoxDecoration(
              color: Color(0xFF0D5C7D),
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "LIVE PRICE PREVIEW",
                  style: TextStyle(
                    color: Colors.white70,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.0,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 24),
                Wrap(
                  spacing: 40,
                  runSpacing: 24,
                  children: [
                    _buildPreviewStat("Base Rate", "₹${controller.parsedBaseRate.toStringAsFixed(0)}", isHighlight: true),
                    _buildPreviewStat("Weekend Rate", "₹${controller.weekendRate.toStringAsFixed(0)}"),
                    _buildPreviewStat("Peak Season Rate", "₹${controller.peakSeasonRate.toStringAsFixed(0)}"),
                  ],
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "BOOKING SUMMARY",
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
                    _buildSummaryItem("Minimum Stay", "${controller.parsedMinStay} Nights", controller.parsedMinStay >= 1),
                    _buildSummaryItem("Instant Booking", controller.instantBooking ? "Enabled" : "Disabled", controller.instantBooking),
                    _buildSummaryItem("Same Day Booking", controller.sameDayBooking ? "Allowed" : "Not Allowed", controller.sameDayBooking),
                    _buildSummaryItem("Long Stay Discounts", controller.longStayDiscount ? "Enabled" : "Disabled", controller.longStayDiscount),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPreviewStat(String label, String value, {bool isHighlight = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.white70,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: isHighlight ? 32 : 24,
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryItem(String label, String value, bool isHighlight) {
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
            color: isHighlight ? const Color(0xFF0D5C7D) : const Color(0xFF1F2937),
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildPricingGrid(BuildContext context, PricingEngineController controller) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = constraints.maxWidth > 700 ? 2 : 1;
        double totalSpacing = (crossAxisCount - 1) * 24.0;
        double itemWidth = (constraints.maxWidth - totalSpacing) / crossAxisCount;

        return Wrap(
          spacing: 24,
          runSpacing: 24,
          children: [
            SizedBox(
              width: itemWidth,
              child: _buildInputCard(
                title: "Base Nightly Rate (₹) *",
                description: "Standard rate per night.",
                icon: Icons.currency_rupee,
                controller: controller.baseRateController,
                hint: "5000",
              ),
            ),
            SizedBox(
              width: itemWidth,
              child: _buildInputCard(
                title: "Weekend Multiplier (%)",
                description: "Percentage increase for weekends.",
                icon: Icons.percent,
                controller: controller.weekendMultiplierController,
                hint: "20",
              ),
            ),
            SizedBox(
              width: itemWidth,
              child: _buildInputCard(
                title: "Peak Season Multiplier (%)",
                description: "Percentage increase during high demand.",
                icon: Icons.trending_up,
                controller: controller.peakMultiplierController,
                hint: "50",
              ),
            ),
            SizedBox(
              width: itemWidth,
              child: _buildInputCard(
                title: "Minimum Stay (Nights) *",
                description: "Minimum nights per booking.",
                icon: Icons.nights_stay,
                controller: controller.minimumStayController,
                hint: "2",
              ),
            ),
            SizedBox(
              width: itemWidth,
              child: _buildToggleCard(
                title: "Instant Booking",
                description: "Allow guests to book without manual approval.",
                value: controller.instantBooking,
                onChanged: (v) => controller.toggleInstantBooking(v),
                icon: Icons.flash_on,
              ),
            ),
            SizedBox(
              width: itemWidth,
              child: _buildToggleCard(
                title: "Same Day Booking",
                description: "Allow guests to book for check-in today.",
                value: controller.sameDayBooking,
                onChanged: (v) => controller.toggleSameDayBooking(v),
                icon: Icons.today,
              ),
            ),
            SizedBox(
              width: itemWidth,
              child: _buildToggleCard(
                title: "Long Stay Discounts",
                description: "Provide automatic discounts for 7+ nights.",
                value: controller.longStayDiscount,
                onChanged: (v) => controller.toggleLongStayDiscount(v),
                icon: Icons.discount,
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildInputCard({
    required String title,
    required String description,
    required IconData icon,
    required TextEditingController controller,
    required String hint,
  }) {
    return _buildCardBase(
      title: title,
      description: description,
      icon: icon,
      child: TextFormField(
        controller: controller,
        keyboardType: TextInputType.number,
        decoration: InputDecoration(
          hintText: hint,
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
          const Text("Enabled", style: TextStyle(fontWeight: FontWeight.w600)),
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

import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/widget/wizard_sidebar.dart';
import 'package:home4stay/pages/welcome/widget/wizard_footer.dart';
import 'package:home4stay/pages/property_identity/property_identity_controller.dart';

class PropertyIdentityPage extends StatelessWidget {
  const PropertyIdentityPage({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return GetBuilder<PropertyIdentityController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: const Color(0xFFF7F2EE),
          body: SafeArea(
            child: Row(
              children: [
                if (!isMobile) const WizardSidebar(currentStep: 2),
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
                                "Step 2 of 10",
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
                                  value: 0.2,
                                  minHeight: 6,
                                  backgroundColor: Colors.grey.shade200,
                                  valueColor:
                                      const AlwaysStoppedAnimation<Color>(
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
                                      color: const Color(
                                        0x1A0D5C7D,
                                      ), // 10% opacity of 0D5C7D
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      "STEP 2 : PROPERTY IDENTITY BLUEPRINT",
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
                                    "Name & Location Blueprint",
                                    style: TextStyle(
                                      fontSize: dp(context, 32),
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                      height: 1.2,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Text(
                                    "Give your hospitality website a premium name and coordinates.\nThis identity forms the primary metadata for search indexing (SEO).",
                                    style: TextStyle(
                                      fontSize: dp(context, 16),
                                      color: const Color(
                                        0xCC1F2937,
                                      ), // 80% opacity of 1F2937
                                      height: 1.6,
                                    ),
                                  ),
                                  SizedBox(height: hp(5)),

                                  // Form Card
                                  Container(
                                    padding: EdgeInsets.all(
                                      isMobile ? wp(6) : 32.0,
                                    ),
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
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        _buildLabel("Property Name *"),
                                        _buildTextField(
                                          hint:
                                              "e.g. Grand Shivay Resort & Spa",
                                          controller:
                                              controller.propertyNameController,
                                        ),
                                        SizedBox(height: hp(3)),

                                        _buildLabel("Geographic Coordinates *"),
                                        _buildTextField(
                                          hint:
                                              "e.g. Udaipur, Rajasthan, India",
                                          controller: controller
                                              .geographicCoordinatesController,
                                        ),
                                        SizedBox(height: hp(3)),

                                        _buildLabel("Hospitality Tagline"),
                                        _buildTextField(
                                          hint:
                                              "e.g. Where mountain serenity meets luxury",
                                          controller: controller
                                              .hospitalityTaglineController,
                                        ),
                                        SizedBox(height: hp(3)),

                                        _buildLabel("Aspirational Narrative *"),
                                        _buildTextField(
                                          hint:
                                              "Describe your boutique hotel, villa, or retreat...",
                                          maxLines: 5,
                                          controller: controller
                                              .aspirationalNarrativeController,
                                        ),
                                        SizedBox(height: hp(5)),

                                        _buildAIConsultantSection(
                                          context,
                                          controller,
                                          isMobile,
                                        ),
                                        SizedBox(height: hp(5)),

                                        _buildLivePreviewSection(
                                          context,
                                          controller,
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Footer
                      WizardFooter(
                        progress: 0.2, // 20% progress for step 2
                        isBackEnabled: true,
                        isNextEnabled: controller.isIdentityReady,
                        nextLabel: "CONTINUE SETUP",
                        onBack: () {
                          Get.back();
                        },
                        onNext: () {
                          Get.toNamed('/property-theme');
                        },
                        leftWidget: Row(
                          children: [
                            const Icon(
                              Icons.check_circle,
                              color: Color(0xFF16A34A),
                              size: 20,
                            ),
                            SizedBox(width: wp(2)),
                            Text(
                              "Live binding active",
                              style: TextStyle(
                                color: const Color(0xFF1F2937).withOpacity(0.7),
                                fontSize: dp(context, 12),
                                fontWeight: FontWeight.w500,
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

  Widget _buildLabel(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.0),
      child: Text(
        text,
        style: const TextStyle(
          color: Color(0xFF1F2937),
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required String hint,
    int maxLines = 1,
    TextEditingController? controller,
  }) {
    return TextFormField(
      controller: controller,
      maxLines: maxLines,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
        filled: true,
        fillColor: const Color(0xFFF9FAFB),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
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
    );
  }

  Widget _buildAIConsultantSection(
    BuildContext context,
    PropertyIdentityController controller,
    bool isMobile,
  ) {
    return CustomPaint(
      painter: DashedBorderPainter(
        color: Colors.grey.shade300,
        strokeWidth: 2,
        gap: 6,
        radius: 20,
      ),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.WHITE,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "AI LUXURY BRANDING CONSULTANT",
              style: TextStyle(
                color: const Color(0xFF16A34A),
                fontWeight: FontWeight.bold,
                letterSpacing: 1.0,
                fontSize: 12,
              ),
            ),
            SizedBox(height: hp(1)),
            Text(
              "Not sure what to write?\nOur hospitality assistant will compose an emotionally engaging luxury description and brand tagline instantly.",
              style: TextStyle(
                color: const Color(0xFF1F2937).withOpacity(0.7),
                fontSize: 14,
                height: 1.5,
              ),
            ),
            SizedBox(height: hp(3)),

            _buildLabel("Atmospheric Vibe Preset"),
            DropdownButtonFormField<String>(
              value: controller.selectedVibe,
              hint: Text(
                "Select Vibe",
                style: TextStyle(color: Colors.grey.shade400, fontSize: 14),
              ),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFFF9FAFB),
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 16,
                ),
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
                  borderSide: const BorderSide(
                    color: Color(0xFF0D5C7D),
                    width: 2,
                  ),
                ),
              ),
              items: controller.vibeOptions.map((String vibe) {
                return DropdownMenuItem<String>(
                  value: vibe,
                  child: Text(vibe, style: const TextStyle(fontSize: 14)),
                );
              }).toList(),
              onChanged: controller.setSelectedVibe,
            ),
            SizedBox(height: hp(3)),

            _buildLabel("Signature Keywords (Optional)"),
            _buildTextField(
              hint: "e.g. Infinity Pool, Private Chef, Mountain View",
              controller: controller.keywordController,
            ),
            SizedBox(height: hp(3)),

            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: controller.isGeneratingNarrative.value
                    ? null
                    : () => controller.generateMockNarrative(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF16A34A),
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: controller.isGeneratingNarrative.value
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          ),
                          const SizedBox(width: 12),
                          const Text(
                            "GENERATING...",
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      )
                    : const Text(
                        "COMPOSE NARRATIVE",
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class DashedBorderPainter extends CustomPainter {
  final Color color;
  final double strokeWidth;
  final double gap;
  final double radius;

  DashedBorderPainter({
    required this.color,
    required this.strokeWidth,
    required this.gap,
    required this.radius,
  });

  @override
  void paint(Canvas canvas, Size size) {
    var paint = Paint()
      ..color = color
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    var path = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(0, 0, size.width, size.height),
          Radius.circular(radius),
        ),
      );

    var dashWidth = gap;
    var dashSpace = gap;
    double distance = 0.0;

    // Simple manual dashed path logic since PathMetrics isn't exposed properly without dart:ui sometimes.
    // Wait, PathMetrics is in dart:ui, which is imported globally in flutter.
    for (var pathMetric in path.computeMetrics()) {
      while (distance < pathMetric.length) {
        var extractPath = pathMetric.extractPath(
          distance,
          distance + dashWidth,
        );
        canvas.drawPath(extractPath, paint);
        distance += dashWidth + dashSpace;
      }
      distance = 0.0; // Reset for next metric if any
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}

Widget _buildLivePreviewSection(
  BuildContext context,
  PropertyIdentityController controller,
) {
  String propertyName = controller.propertyNameController.text.trim();
  String tagline = controller.hospitalityTaglineController.text.trim();
  String location = controller.geographicCoordinatesController.text.trim();

  if (propertyName.isEmpty) propertyName = "Your Property Name";
  if (tagline.isEmpty) tagline = "Your Hospitality Tagline";
  if (location.isEmpty) location = "Your Location";

  bool isReady = controller.isIdentityReady;

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(
        "LIVE PROPERTY PREVIEW",
        style: TextStyle(
          color: const Color(0xFF0D5C7D),
          fontWeight: FontWeight.bold,
          letterSpacing: 1.0,
          fontSize: 12,
        ),
      ),
      SizedBox(height: hp(1)),
      Text(
        "See how your hospitality identity will appear to future guests.",
        style: TextStyle(
          color: const Color(0xFF1F2937).withOpacity(0.7),
          fontSize: 14,
        ),
      ),
      SizedBox(height: hp(3)),
      Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.WHITE,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 15,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Stack(
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  propertyName,
                  style: TextStyle(
                    fontSize: dp(context, 24),
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF1F2937),
                  ),
                ),
                SizedBox(height: hp(1)),
                Text(
                  tagline,
                  style: TextStyle(
                    fontSize: dp(context, 16),
                    fontStyle: FontStyle.italic,
                    color: const Color(0xFF0D5C7D),
                  ),
                ),
                SizedBox(height: hp(2)),
                Row(
                  children: [
                    Icon(
                      Icons.location_on,
                      color: Colors.grey.shade500,
                      size: 16,
                    ),
                    SizedBox(width: 4),
                    Text(
                      location,
                      style: TextStyle(
                        fontSize: dp(context, 14),
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            Positioned(
              top: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: isReady
                      ? const Color(0xFF16A34A).withOpacity(0.1)
                      : Colors.amber.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  isReady ? "READY" : "DRAFT",
                  style: TextStyle(
                    color: isReady
                        ? const Color(0xFF16A34A)
                        : Colors.amber.shade800,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    ],
  );
}

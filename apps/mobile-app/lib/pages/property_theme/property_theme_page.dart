import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/widget/wizard_sidebar.dart';
import 'package:home4stay/pages/welcome/widget/wizard_footer.dart';
import 'package:home4stay/pages/property_theme/property_theme_controller.dart';

class PropertyThemePage extends StatelessWidget {
  const PropertyThemePage({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return GetBuilder<PropertyThemeController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: const Color(0xFFF7F2EE),
          body: SafeArea(
            child: Row(
              children: [
                if (!isMobile) const WizardSidebar(currentStep: 3),
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
                                "Step 3 of 10",
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
                                  value: 0.3,
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
                                      "STEP 3 : STYLING THEME ATMOSPHERE",
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
                                    "Atmosphere Engine Presets",
                                    style: TextStyle(
                                      fontSize: dp(context, 32),
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                      height: 1.2,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Text(
                                    "Instantly set the visual tone for your guest portal website.\nChoose a premium layout template that best fits your hospitality experience.",
                                    style: TextStyle(
                                      fontSize: dp(context, 16),
                                      color: const Color(0xCC1F2937),
                                      height: 1.6,
                                    ),
                                  ),
                                  SizedBox(height: hp(5)),

                                  // AI ATMOSPHERE ADVISOR
                                  _buildAIAdvisorCard(context),
                                  SizedBox(height: hp(5)),

                                  // THEME GRID
                                  _buildThemeGrid(context, controller, isMobile),
                                  
                                  SizedBox(height: hp(4)),
                                  if (controller.selectedTheme != null)
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF0D5C7D).withValues(alpha: 0.05),
                                        borderRadius: BorderRadius.circular(12),
                                        border: Border.all(color: const Color(0xFF0D5C7D).withValues(alpha: 0.2)),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Icon(Icons.palette, color: Color(0xFF0D5C7D), size: 18),
                                          const SizedBox(width: 8),
                                          Text(
                                            "Selected Theme: ",
                                            style: TextStyle(
                                              color: const Color(0xFF1F2937).withValues(alpha: 0.7),
                                              fontSize: 14,
                                            ),
                                          ),
                                          Text(
                                            _getThemeName(controller.selectedTheme!),
                                            style: const TextStyle(
                                              color: Color(0xFF0D5C7D),
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                            ),
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
                        progress: 0.3, // 30% progress
                        isBackEnabled: true,
                        isNextEnabled: controller.isThemeReady,
                        nextLabel: "CONTINUE SETUP",
                        onBack: () => Get.back(),
                        onNext: () {
                          Get.toNamed('/rooms-inventory');
                        },
                        leftWidget: Row(
                          children: [
                            const Icon(
                              Icons.info_outline,
                              color: Color(0xFF1F2937),
                              size: 20,
                            ),
                            SizedBox(width: wp(2)),
                            Text(
                              "Themes adjust portal visual appearance.",
                              style: TextStyle(
                                color: const Color(0xFF1F2937).withValues(alpha: 0.7),
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

  Widget _buildThemeGrid(BuildContext context, PropertyThemeController controller, bool isMobile) {
    Widget coastalSands = _buildThemeCard(
      context: context,
      controller: controller,
      themeKey: 'coastal_sands',
      title: "Coastal Sands",
      description: "Designed for beachside villas, coastal cabins, and island resorts.",
      accentText: "Blue accents",
      accentColor: Colors.blue.shade600,
    );
    
    Widget heritageLuxury = _buildThemeCard(
      context: context,
      controller: controller,
      themeKey: 'heritage_luxury',
      title: "Heritage Luxury",
      description: "Designed for royal palaces, heritage havelis, and colonial manors.",
      accentText: "Gold + Red accents",
      accentColor: Colors.amber.shade700,
    );

    Widget alpineSnow = _buildThemeCard(
      context: context,
      controller: controller,
      themeKey: 'alpine_snow',
      title: "Alpine Snow",
      description: "Designed for mountain slopes, snow chalets, and organic pine lodges.",
      accentText: "Light Blue accents",
      accentColor: Colors.lightBlue.shade300,
    );

    Widget jungleEscape = _buildThemeCard(
      context: context,
      controller: controller,
      themeKey: 'jungle_escape',
      title: "Jungle Escape",
      description: "Designed for jungle hideaways, treehouse resorts, and eco-farmstays.",
      accentText: "Green accents",
      accentColor: Colors.green.shade600,
    );

    if (isMobile) {
      return Column(
        children: [
          coastalSands,
          const SizedBox(height: 24),
          heritageLuxury,
          const SizedBox(height: 24),
          alpineSnow,
          const SizedBox(height: 24),
          jungleEscape,
        ],
      );
    } else {
      return Column(
        children: [
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: coastalSands),
                const SizedBox(width: 24),
                Expanded(child: heritageLuxury),
              ],
            ),
          ),
          const SizedBox(height: 24),
          IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Expanded(child: alpineSnow),
                const SizedBox(width: 24),
                Expanded(child: jungleEscape),
              ],
            ),
          ),
        ],
      );
    }
  }

  String _getThemeName(String key) {
    switch (key) {
      case 'coastal_sands': return 'Coastal Sands';
      case 'heritage_luxury': return 'Heritage Luxury';
      case 'alpine_snow': return 'Alpine Snow';
      case 'jungle_escape': return 'Jungle Escape';
      default: return key;
    }
  }

  Widget _buildAIAdvisorCard(BuildContext context) {
    bool isMobile = MediaQuery.of(context).size.width < 600;
    
    Widget content = Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                "AI ATMOSPHERE SELECTOR ADVISOR",
                style: TextStyle(
                  color: Color(0xFF0D5C7D),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Let AI analyze your property identity to recommend the perfect theme.",
                style: TextStyle(
                  color: const Color(0xFF1F2937).withValues(alpha: 0.7),
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ),
        if (!isMobile) ...[
          const SizedBox(width: 16),
          _buildAIButton(),
        ],
      ],
    );

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade300, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: isMobile 
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                content,
                const SizedBox(height: 16),
                _buildAIButton(),
              ],
            ) 
          : content,
    );
  }
  
  Widget _buildAIButton() {
    return ElevatedButton.icon(
      onPressed: () {
        Get.snackbar(
          "Coming Soon",
          "AI Advisor coming in next phase",
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF1F2937),
          colorText: Colors.white,
          margin: const EdgeInsets.all(16),
        );
      },
      icon: const Icon(Icons.auto_awesome, color: Colors.white, size: 16),
      label: const Text(
        "ASK AI ADVISOR",
        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF0D5C7D),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  Widget _buildThemeCard({
    required BuildContext context,
    required PropertyThemeController controller,
    required String themeKey,
    required String title,
    required String description,
    required String accentText,
    required Color accentColor,
  }) {
    bool isSelected = controller.selectedTheme == themeKey;

    return GestureDetector(
      onTap: () => controller.selectTheme(themeKey),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: AppColors.WHITE,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? const Color(0xFF0D5C7D) : Colors.grey.shade200,
            width: isSelected ? 3 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF0D5C7D).withValues(alpha: 0.15),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  )
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.02),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: TextStyle(
                      fontSize: dp(context, 20),
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1F2937),
                    ),
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
            SizedBox(height: hp(1.5)),
            Text(
              description,
              style: TextStyle(
                fontSize: dp(context, 14),
                color: const Color(0xFF1F2937).withValues(alpha: 0.7),
                height: 1.4,
              ),
            ),
            SizedBox(height: hp(1.5)),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: accentColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: accentColor,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    accentText,
                    style: TextStyle(
                      color: accentColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

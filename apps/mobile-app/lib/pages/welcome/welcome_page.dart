import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/welcome_controller.dart';
import 'package:home4stay/pages/welcome/widget/wizard_sidebar.dart';
import 'package:home4stay/pages/welcome/widget/wizard_footer.dart';
import 'package:home4stay/pages/welcome/widget/feature_card.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Determine if it's mobile or tablet/desktop
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return GetBuilder<WelcomeController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: const Color(0xFFF7F2EE),
          body: SafeArea(
            child: Row(
              children: [
                if (!isMobile) const WizardSidebar(currentStep: 1),
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
                                "Step 1 of 10",
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
                                  value: 0.1,
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
                                        0xFF0D5C7D,
                                      ).withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      "STEP 1 : EMOTIONAL WELCOME ENTRANCE",
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
                                    "Let's launch your hospitality brand.",
                                    style: TextStyle(
                                      fontSize: dp(context, 32),
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                      height: 1.2,
                                    ),
                                  ),
                                  SizedBox(height: hp(1)),
                                  Text(
                                    "Your guests are waiting.",
                                    style: TextStyle(
                                      fontSize: dp(context, 20),
                                      color: const Color(0xFF0D5C7D),
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  SizedBox(height: hp(3)),
                                  Text(
                                    "Establish an ultra-premium direct-booking website in under 5 minutes.\nNo technical code.\nNo development delays.\n0% commissions.",
                                    style: TextStyle(
                                      fontSize: dp(context, 16),
                                      color: const Color(
                                        0xFF1F2937,
                                      ).withValues(alpha: 0.8),
                                      height: 1.6,
                                    ),
                                  ),
                                  SizedBox(height: hp(5)),
                                  // Benefit Cards
                                  LayoutBuilder(
                                    builder: (context, constraints) {
                                      if (isMobile ||
                                          constraints.maxWidth < 600) {
                                        return const Column(
                                          children: [
                                            FeatureCard(
                                              title: "5 MIN SETUP",
                                              description:
                                                  "Answer simple prompts about your villas and launch instantly.",
                                            ),
                                            FeatureCard(
                                              title: "FULL SOVEREIGNTY",
                                              description:
                                                  "Keep 100% of your earnings.",
                                            ),
                                            FeatureCard(
                                              title: "GLOBAL PRESENCE",
                                              description:
                                                  "Optimized for global bookings.",
                                            ),
                                          ],
                                        );
                                      } else {
                                        return Row(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            const Expanded(
                                              child: FeatureCard(
                                                title: "5 MIN SETUP",
                                                description:
                                                    "Answer simple prompts about your villas and launch instantly.",
                                              ),
                                            ),
                                            SizedBox(width: wp(3)),
                                            const Expanded(
                                              child: FeatureCard(
                                                title: "FULL SOVEREIGNTY",
                                                description:
                                                    "Keep 100% of your earnings.",
                                              ),
                                            ),
                                            SizedBox(width: wp(3)),
                                            const Expanded(
                                              child: FeatureCard(
                                                title: "GLOBAL PRESENCE",
                                                description:
                                                    "Optimized for global bookings.",
                                              ),
                                            ),
                                          ],
                                        );
                                      }
                                    },
                                  ),

                                  SizedBox(height: hp(6)),

                                  // Bottom Quote Section
                                  Container(
                                    padding: EdgeInsets.all(wp(5)),
                                    decoration: BoxDecoration(
                                      border: const Border(
                                        left: BorderSide(
                                          color: Color(0xFF16A34A),
                                          width: 4,
                                        ),
                                      ),
                                      color: const Color(
                                        0xFF16A34A,
                                      ).withValues(alpha: 0.05),
                                    ),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          "\"Build your luxury booking experience in minutes.\"",
                                          style: TextStyle(
                                            fontStyle: FontStyle.italic,
                                            fontSize: dp(context, 16),
                                            color: const Color(0xFF1F2937),
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        SizedBox(height: hp(1)),
                                        Text(
                                          "Home4Stay puts hospitality business owners in the driver's seat of their own financial freedom.",
                                          style: TextStyle(
                                            fontSize: dp(context, 14),
                                            color: const Color(
                                              0xFF1F2937,
                                            ).withValues(alpha: 0.8),
                                            height: 1.5,
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
                        progress: 0.1, // 10% progress for step 1
                        isBackEnabled: false,
                        nextLabel: "BEGIN ARCHITECTURE SETUP",
                        onBack: () {},
                        onNext: () {
                          Get.toNamed('/property-identity');
                        },
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
}

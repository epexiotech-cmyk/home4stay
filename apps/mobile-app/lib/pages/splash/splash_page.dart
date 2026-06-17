import 'package:home4stay/core/common_imports.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<SplashController>(
      init: SplashController(),
      builder: (controller) {
        return Scaffold(
          backgroundColor: AppColors.WHITE,
          body: Center(
            child: FadeTransition(
              opacity: controller.fadeAnimation,
              child: SlideTransition(
                position: controller.slideAnimation,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      'assets/images/splash_logo.png',
                      scale: dp(context, 2.3),
                      color: AppColors.PRIMARY_COLOR,
                    ),

                    SizedBox(height: hp(2)),

                    CustomText(text: "Patient Management System"),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

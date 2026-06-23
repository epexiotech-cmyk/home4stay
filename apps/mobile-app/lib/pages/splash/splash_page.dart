import 'package:home4stay/core/common_imports.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<SplashController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: AppColors.WHITE,
          body: Center(
            child: FadeTransition(
              opacity: controller.fadeAnimation,
              child: SlideTransition(
                position: controller.slideAnimation,
                child: Image.asset(
                  'assets/image/Home4StayLogo.png',
                  scale: dp(context, 2.3),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

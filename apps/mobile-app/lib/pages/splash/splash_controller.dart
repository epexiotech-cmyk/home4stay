import 'package:home4stay/core/common_imports.dart';

class SplashController extends GetxController
    with GetSingleTickerProviderStateMixin {
  late AnimationController animationController;
  late Animation<double> fadeAnimation;
  late Animation<Offset> slideAnimation;

  @override
  void onInit() {
    super.onInit();

    animationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    );

    fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 10.0,
    ).animate(animationController);

    slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero).animate(
          CurvedAnimation(
            parent: animationController,
            curve: Curves.bounceInOut,
          ),
        );

    animationController.forward();
  }

  @override
  void onReady() {
    super.onReady();

    Timer(const Duration(seconds: 5), () {
      // Get.offAllNamed(routeLoginpage);
    });
  }

  @override
  void onClose() {
    animationController.dispose();
    super.onClose();
  }
}

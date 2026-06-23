import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/launch_readiness/launch_readiness_controller.dart';

class LaunchReadinessBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<LaunchReadinessController>(() => LaunchReadinessController());
  }
}

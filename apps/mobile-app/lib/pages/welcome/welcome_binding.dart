import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/welcome_controller.dart';

class WelcomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<WelcomeController>(() => WelcomeController());
  }
}

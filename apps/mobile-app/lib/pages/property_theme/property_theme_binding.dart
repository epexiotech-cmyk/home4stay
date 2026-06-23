import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/property_theme/property_theme_controller.dart';

class PropertyThemeBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PropertyThemeController>(() => PropertyThemeController());
  }
}

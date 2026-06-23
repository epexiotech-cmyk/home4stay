import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/property_identity/property_identity_controller.dart';

class PropertyIdentityBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PropertyIdentityController>(() => PropertyIdentityController());
  }
}

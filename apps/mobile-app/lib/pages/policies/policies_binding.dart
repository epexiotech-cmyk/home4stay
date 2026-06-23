import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/policies/policies_controller.dart';

class PoliciesBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PoliciesController>(() => PoliciesController());
  }
}

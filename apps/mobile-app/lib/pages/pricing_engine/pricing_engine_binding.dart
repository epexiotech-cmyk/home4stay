import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/pricing_engine/pricing_engine_controller.dart';

class PricingEngineBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<PricingEngineController>(() => PricingEngineController());
  }
}

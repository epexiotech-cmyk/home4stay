import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/amenities/amenities_controller.dart';

class AmenitiesBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AmenitiesController>(() => AmenitiesController());
  }
}

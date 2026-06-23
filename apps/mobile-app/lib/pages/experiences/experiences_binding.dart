import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/experiences/experiences_controller.dart';

class ExperiencesBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ExperiencesController>(() => ExperiencesController());
  }
}

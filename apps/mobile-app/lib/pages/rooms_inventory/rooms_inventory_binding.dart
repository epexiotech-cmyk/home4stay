import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/rooms_inventory/rooms_inventory_controller.dart';

class RoomsInventoryBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<RoomsInventoryController>(() => RoomsInventoryController());
  }
}

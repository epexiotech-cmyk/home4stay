import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/media_gallery/media_gallery_controller.dart';

class MediaGalleryBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MediaGalleryController>(() => MediaGalleryController());
  }
}

import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/media_gallery/models/media_item_model.dart';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';

class MediaCategoryDef {
  final String id;
  final String name;
  final String description;

  MediaCategoryDef({required this.id, required this.name, required this.description});
}

class MediaGalleryController extends GetxController {
  final List<MediaCategoryDef> categories = [
    MediaCategoryDef(id: 'exterior', name: 'Property Exterior', description: 'Showcase the outside facade, entrance, and surroundings.'),
    MediaCategoryDef(id: 'interior', name: 'Property Interior', description: 'Capture the lobby, lounge, and communal indoor areas.'),
    MediaCategoryDef(id: 'rooms', name: 'Rooms & Suites', description: 'Highlight beds, bathrooms, and room amenities.'),
    MediaCategoryDef(id: 'amenities', name: 'Amenities', description: 'Photos of pools, gyms, spas, and parking.'),
    MediaCategoryDef(id: 'dining', name: 'Dining', description: 'Restaurants, cafes, bars, and food presentation.'),
    MediaCategoryDef(id: 'experiences', name: 'Experiences', description: 'Activities, tours, and guest engagement moments.'),
  ];

  final RxMap<String, List<MediaItem>> categoryMediaMap = <String, List<MediaItem>>{}.obs;

  @override
  void onInit() {
    super.onInit();
    
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>().mediaData;
      if (global.categoryMediaMap.isNotEmpty) {
        categoryMediaMap.value = global.categoryMediaMap;
      } else {
        for (var cat in categories) {
          categoryMediaMap[cat.id] = [];
        }
      }
    } else {
      for (var cat in categories) {
        categoryMediaMap[cat.id] = [];
      }
    }
  }

  void _flush() {
    if (Get.isRegistered<OnboardingWizardController>()) {
      final global = Get.find<OnboardingWizardController>();
      global.mediaData.categoryMediaMap = Map.from(categoryMediaMap);
      global.triggerAutoSave();
    }
  }

  int get totalCategoriesConfigured {
    return categoryMediaMap.values.where((list) => list.isNotEmpty).length;
  }

  int get totalMedia {
    return categoryMediaMap.values.fold(0, (sum, list) => sum + list.length);
  }

  double get completionScore {
    int count = totalCategoriesConfigured;
    if (count == 0) return 0.0;
    if (count == 1) return 0.20;
    if (count == 2) return 0.40;
    if (count == 3) return 0.60;
    if (count == 4) return 0.80;
    return 1.0; // 5 or more
  }

  bool get isReady => totalMedia > 0;

  void addMockMedia(String categoryId) {
    String id = DateTime.now().millisecondsSinceEpoch.toString();
    String filename = 'image_$id.jpg';
    
    MediaItem newItem = MediaItem(id: id, filename: filename, category: categoryId);
    
    List<MediaItem> currentList = List.from(categoryMediaMap[categoryId]!);
    currentList.add(newItem);
    categoryMediaMap[categoryId] = currentList;
    _flush();
  }

  void removeMedia(String categoryId, String mediaId) {
    List<MediaItem> currentList = List.from(categoryMediaMap[categoryId]!);
    currentList.removeWhere((m) => m.id == mediaId);
    categoryMediaMap[categoryId] = currentList;
    _flush();
  }
}

import 'dart:async';
import 'package:home4stay/features/onboarding/domain/models/property_draft_model.dart';
import 'package:home4stay/features/onboarding/domain/services/draft_storage_service.dart';
import 'dart:convert';

class DraftAutoSaveService {
  final DraftStorageService _storageService = DraftStorageService();
  Timer? _debounceTimer;

  void triggerSave(PropertyDraft draft) {
    if (_debounceTimer?.isActive ?? false) {
      _debounceTimer!.cancel();
    }
    
    _debounceTimer = Timer(const Duration(seconds: 2), () async {
      try {
        final jsonString = jsonEncode(draft.toJson());
        await _storageService.saveDraft(jsonString);
        print("Auto-save completed.");
      } catch (e) {
        print("Auto-save failed: $e");
      }
    });
  }

  Future<void> saveImmediately(PropertyDraft draft) async {
    _debounceTimer?.cancel();
    try {
      final jsonString = jsonEncode(draft.toJson());
      await _storageService.saveDraft(jsonString);
    } catch (e) {
      print("Manual save failed: $e");
    }
  }
}

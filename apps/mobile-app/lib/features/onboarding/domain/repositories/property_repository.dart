import 'package:home4stay/features/onboarding/domain/models/property_draft_model.dart';

abstract class PropertyRepository {
  Future<void> saveDraft(PropertyDraft draft);
}

class PropertyRepositoryImpl implements PropertyRepository {
  @override
  Future<void> saveDraft(PropertyDraft draft) async {
    // Stub for future database integration
    await Future.delayed(const Duration(milliseconds: 500));
  }
}

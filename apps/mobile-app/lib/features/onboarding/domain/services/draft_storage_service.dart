import 'package:shared_preferences/shared_preferences.dart';

class DraftStorageService {
  static const String _storageKey = 'home4stay_property_draft';

  Future<void> saveDraft(String jsonPayload) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, jsonPayload);
  }

  Future<String?> getDraft() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(_storageKey);
  }

  Future<void> clearDraft() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_storageKey);
  }
}

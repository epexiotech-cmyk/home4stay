import 'dart:async';
import 'package:home4stay/features/onboarding/controllers/onboarding_wizard_controller.dart';
import 'package:home4stay/features/onboarding/domain/services/property_creation_service.dart';
import 'package:home4stay/features/media_upload/domain/services/media_upload_service.dart';
import 'package:home4stay/features/media_upload/domain/models/media_upload_item.dart';
import 'package:home4stay/features/onboarding/data/api/exceptions/property_api_exceptions.dart';
import 'package:home4stay/features/media_upload/domain/exceptions/media_upload_exceptions.dart';
import 'package:home4stay/features/launch_workflow/domain/models/property_launch_workflow.dart';
import 'package:home4stay/features/launch_workflow/domain/models/property_launch_result.dart';
import 'package:home4stay/features/onboarding/domain/services/draft_storage_service.dart';

class PropertyLaunchOrchestrator {
  final PropertyCreationService _creationService = PropertyCreationService();
  final MediaUploadService _mediaService = MediaUploadService();
  
  final _stateController = StreamController<LaunchState>.broadcast();
  Stream<LaunchState> get stateStream => _stateController.stream;

  Future<PropertyLaunchResult> launchProperty(OnboardingWizardController wizard) async {
    final startTime = DateTime.now();
    int uploadedFiles = 0;
    int failedFiles = 0;
    String? propertyId;

    try {
      // STEP 1: Validate Draft
      _updateState(LaunchState.validating);
      await Future.delayed(const Duration(milliseconds: 500)); // UI pacing
      
      // The creation service runs validation internally, but let's decouple if needed.
      // We will let creationService map and validate.

      // STEP 2: Create Property
      _updateState(LaunchState.creatingProperty);
      final draft = await _creationService.createDraft(wizard);
      propertyId = 'prop_${DateTime.now().millisecondsSinceEpoch}'; // Mock property ID since service returns draft

      // STEP 3: Create Media Upload Batch
      _updateState(LaunchState.uploadingMedia);
      
      // Mock generation of items from the draft map
      List<MediaUploadItem> items = [];
      draft.media.categoryMediaMap.forEach((category, mediaList) {
        for (var media in mediaList) {
          items.add(MediaUploadItem(
            id: media.id,
            localPath: media.filename, // Using filename as mock path
            fileName: media.filename,
            fileSize: 1024 * 1024, // Mock 1MB
            mimeType: 'image/jpeg',
          ));
        }
      });

      if (items.isNotEmpty) {
        final batch = _mediaService.prepareUploads(propertyId, items);
        
        // STEP 4: Upload Media
        await _mediaService.uploadBatch(batch);
        
        // Await completion (Mocking synchronous wait for the background queue)
        await Future.delayed(const Duration(seconds: 3));
        uploadedFiles = batch.completedFiles;
        failedFiles = batch.failedFiles;
      }

      // STEP 5: Publish Property
      _updateState(LaunchState.publishing);
      await Future.delayed(const Duration(seconds: 1)); // Mock backend publish

      // STEP 6: Clear Draft
      wizard.clearDraft();
      await DraftStorageService().clearDraft();

      _updateState(LaunchState.completed);
      
      // STEP 7: Return Launch Result
      return PropertyLaunchResult(
        success: true,
        propertyId: propertyId,
        launchDuration: DateTime.now().difference(startTime),
        uploadedFiles: uploadedFiles,
        failedFiles: failedFiles,
      );

    } on ValidationException catch (e) {
      _updateState(LaunchState.failed);
      return PropertyLaunchResult(success: false, launchDuration: DateTime.now().difference(startTime), message: e.toString());
    } on MediaUploadException catch (e) {
      _updateState(LaunchState.failed);
      return PropertyLaunchResult(success: false, launchDuration: DateTime.now().difference(startTime), message: e.toString());
    } on NetworkException catch (e) {
      _updateState(LaunchState.failed);
      return PropertyLaunchResult(success: false, launchDuration: DateTime.now().difference(startTime), message: e.toString());
    } on ServerException catch (e) {
      _updateState(LaunchState.failed);
      return PropertyLaunchResult(success: false, launchDuration: DateTime.now().difference(startTime), message: e.toString());
    } catch (e) {
      _updateState(LaunchState.failed);
      return PropertyLaunchResult(success: false, launchDuration: DateTime.now().difference(startTime), message: "Unexpected Error: $e");
    }
  }

  void _updateState(LaunchState state) {
    _stateController.add(state);
  }

  void dispose() {
    _stateController.close();
  }
}

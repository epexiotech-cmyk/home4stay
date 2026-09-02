import 'dart:developer' as developer;
import 'package:home4stay/features/media_upload/domain/models/media_upload_batch.dart';
import 'package:home4stay/features/media_upload/domain/models/media_upload_item.dart';
import 'package:home4stay/features/media_upload/domain/queue/media_upload_queue.dart';
import 'package:home4stay/features/media_upload/domain/validators/media_upload_validator.dart';

abstract class MediaUploadServiceContract {
  MediaUploadBatch prepareUploads(String propertyDraftId, List<MediaUploadItem> items);
  Future<void> uploadBatch(MediaUploadBatch batch);
  void retryFailedUploads(MediaUploadBatch batch);
}

class MediaUploadService implements MediaUploadServiceContract {
  final MediaUploadQueue _queue = MediaUploadQueue();

  @override
  MediaUploadBatch prepareUploads(String propertyDraftId, List<MediaUploadItem> items) {
    // 1. Construct the batch
    return MediaUploadBatch(
      batchId: 'batch_${DateTime.now().millisecondsSinceEpoch}',
      propertyDraftId: propertyDraftId,
      items: items,
    );
  }

  @override
  Future<void> uploadBatch(MediaUploadBatch batch) async {
    // 2. Validate and Enqueue all items
    for (var item in batch.items) {
      try {
        MediaUploadValidator.validate(item);
        _queue.enqueue(item);
      } catch (e) {
        item.status = UploadStatus.failed;
        developer.log("Validation Failed for ${item.fileName}: $e");
      }
    }

    // 3. Process Queue
    _processQueue();
  }

  void _processQueue() async {
    while (_queue.canProcessNext) {
      final item = _queue.dequeue();
      if (item != null) {
        _mockUploadProcess(item);
      }
    }
  }

  Future<void> _mockUploadProcess(MediaUploadItem item) async {
    item.status = UploadStatus.uploading;
    item.progress = 0.0;
    
    // Simulate chunked upload progress
    for (int i = 1; i <= 10; i++) {
      await Future.delayed(const Duration(milliseconds: 300)); // Simulate latency
      
      // MOCK FAILURE: Simulate random failure for robustness testing (10% chance)
      // if (DateTime.now().millisecond % 10 == 0) {
      //   item.status = UploadStatus.failed;
      //   _queue.completeUpload(item);
      //   _processQueue();
      //   return;
      // }
      
      item.progress = i / 10.0;
    }

    item.status = UploadStatus.completed;
    _queue.completeUpload(item);
    
    // Trigger next in queue
    _processQueue();
  }

  @override
  void retryFailedUploads(MediaUploadBatch batch) {
    for (var item in batch.items) {
      if (item.status == UploadStatus.failed) {
        _queue.retry(item);
      }
    }
    _processQueue();
  }
}

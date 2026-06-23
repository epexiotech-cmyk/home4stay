import 'dart:async';
import 'dart:collection';
import 'package:home4stay/features/media_upload/domain/models/media_upload_item.dart';

class MediaUploadQueue {
  final Queue<MediaUploadItem> _queue = Queue<MediaUploadItem>();
  final List<MediaUploadItem> _activeUploads = [];
  final int maxConcurrentUploads = 3;

  // Stream for tracking queue state changes
  final _queueController = StreamController<List<MediaUploadItem>>.broadcast();
  Stream<List<MediaUploadItem>> get queueStream => _queueController.stream;

  void enqueue(MediaUploadItem item) {
    if (!_queue.contains(item) && !_activeUploads.contains(item)) {
      _queue.add(item);
      _notify();
    }
  }

  MediaUploadItem? dequeue() {
    if (_queue.isNotEmpty) {
      final item = _queue.removeFirst();
      _activeUploads.add(item);
      _notify();
      return item;
    }
    return null;
  }

  void completeUpload(MediaUploadItem item) {
    _activeUploads.remove(item);
    _notify();
  }

  void retry(MediaUploadItem item) {
    if (item.status == UploadStatus.failed) {
      item.status = UploadStatus.pending;
      item.progress = 0.0;
      enqueue(item);
    }
  }

  void cancel(MediaUploadItem item) {
    _queue.remove(item);
    _activeUploads.remove(item);
    // Real implementation would cancel the HTTP token here
    _notify();
  }

  bool get canProcessNext => _activeUploads.length < maxConcurrentUploads && _queue.isNotEmpty;

  void _notify() {
    _queueController.add([..._activeUploads, ..._queue]);
  }

  void dispose() {
    _queueController.close();
  }
}

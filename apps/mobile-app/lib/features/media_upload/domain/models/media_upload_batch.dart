import 'package:home4stay/features/media_upload/domain/models/media_upload_item.dart';

class MediaUploadBatch {
  final String batchId;
  final String propertyDraftId;
  final List<MediaUploadItem> items;

  MediaUploadBatch({
    required this.batchId,
    required this.propertyDraftId,
    required this.items,
  });

  int get totalFiles => items.length;
  
  int get completedFiles => items.where((item) => item.status == UploadStatus.completed).length;
  
  int get failedFiles => items.where((item) => item.status == UploadStatus.failed).length;

  bool get isFullyCompleted => totalFiles > 0 && completedFiles == totalFiles;
}

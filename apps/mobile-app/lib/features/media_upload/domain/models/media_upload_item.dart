enum UploadStatus {
  pending,
  uploading,
  completed,
  failed,
}

class MediaUploadItem {
  final String id;
  final String localPath;
  final String fileName;
  final int fileSize;
  final String mimeType;
  
  UploadStatus status;
  double progress;
  final DateTime createdAt;

  MediaUploadItem({
    required this.id,
    required this.localPath,
    required this.fileName,
    required this.fileSize,
    required this.mimeType,
    this.status = UploadStatus.pending,
    this.progress = 0.0,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  void updateProgress(double value) {
    progress = value;
  }

  void updateStatus(UploadStatus newStatus) {
    status = newStatus;
  }
}

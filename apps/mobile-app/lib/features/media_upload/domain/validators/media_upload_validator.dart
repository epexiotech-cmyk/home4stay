import 'dart:io';
import 'package:home4stay/features/media_upload/domain/exceptions/media_upload_exceptions.dart';
import 'package:home4stay/features/media_upload/domain/models/media_upload_item.dart';

class MediaUploadValidator {
  static const int maxFileSizeInBytes = 10 * 1024 * 1024; // 10 MB
  static const List<String> allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];

  static void validate(MediaUploadItem item) {
    // 1. Validate file exists (offline logic, if file doesn't exist, File() checks it)
    final file = File(item.localPath);
    if (!file.existsSync()) {
      throw FileValidationException("File does not exist at path: ${item.localPath}");
    }

    // 2. Validate size limit
    if (item.fileSize > maxFileSizeInBytes) {
      throw FileValidationException("File size exceeds 10MB limit: ${item.fileName}");
    }

    // 3. Validate allowed mime types
    if (!allowedMimeTypes.contains(item.mimeType)) {
      throw FileValidationException("Unsupported file type: ${item.mimeType}. Allowed: JPEG, PNG, WEBP, MP4.");
    }
  }
}

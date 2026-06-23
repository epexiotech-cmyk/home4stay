abstract class MediaUploadException implements Exception {
  final String message;
  MediaUploadException(this.message);

  @override
  String toString() => message;
}

class FileValidationException extends MediaUploadException {
  FileValidationException(String message) : super("File Validation Error: $message");
}

class UploadFailedException extends MediaUploadException {
  UploadFailedException(String message) : super("Upload Failed Error: $message");
}

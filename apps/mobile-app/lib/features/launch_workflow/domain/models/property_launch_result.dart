class PropertyLaunchResult {
  final bool success;
  final String? propertyId;
  final Duration launchDuration;
  final int uploadedFiles;
  final int failedFiles;
  final String? message;

  PropertyLaunchResult({
    required this.success,
    this.propertyId,
    required this.launchDuration,
    this.uploadedFiles = 0,
    this.failedFiles = 0,
    this.message,
  });
}

abstract class PropertyApiException implements Exception {
  final String message;
  PropertyApiException(this.message);

  @override
  String toString() => message;
}

class ValidationException extends PropertyApiException {
  ValidationException(String message) : super("Validation Error: $message");
}

class NetworkException extends PropertyApiException {
  NetworkException(String message) : super("Network Error: $message");
}

class ServerException extends PropertyApiException {
  ServerException(String message) : super("Server Error: $message");
}

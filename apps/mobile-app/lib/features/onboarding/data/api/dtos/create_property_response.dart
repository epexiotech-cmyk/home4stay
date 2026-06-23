class CreatePropertyResponse {
  final String propertyId;
  final String status;
  final DateTime createdAt;

  CreatePropertyResponse({
    required this.propertyId,
    required this.status,
    required this.createdAt,
  });

  factory CreatePropertyResponse.fromJson(Map<String, dynamic> json) {
    return CreatePropertyResponse(
      propertyId: json['propertyId'] as String,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }
}

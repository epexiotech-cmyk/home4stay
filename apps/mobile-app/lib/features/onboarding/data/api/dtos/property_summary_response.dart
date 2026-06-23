class PropertySummaryResponse {
  final String propertyId;
  final String propertyName;
  final String status;
  final String location;
  final String previewImageUrl;
  final double baseRate;

  PropertySummaryResponse({
    required this.propertyId,
    required this.propertyName,
    required this.status,
    required this.location,
    required this.previewImageUrl,
    required this.baseRate,
  });

  factory PropertySummaryResponse.fromJson(Map<String, dynamic> json) {
    return PropertySummaryResponse(
      propertyId: json['propertyId'] as String,
      propertyName: json['propertyName'] as String,
      status: json['status'] as String,
      location: json['location'] as String,
      previewImageUrl: json['previewImageUrl'] as String,
      baseRate: (json['baseRate'] as num).toDouble(),
    );
  }
}

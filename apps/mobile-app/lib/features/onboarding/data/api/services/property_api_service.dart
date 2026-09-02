import 'package:home4stay/features/onboarding/data/api/dtos/create_property_request.dart';
import 'package:home4stay/features/onboarding/data/api/dtos/create_property_response.dart';
import 'package:home4stay/features/onboarding/data/api/dtos/property_summary_response.dart';

class PropertyApiService {
  Future<CreatePropertyResponse> createProperty(CreatePropertyRequest request) async {
    // Mock implementation for API call latency
    await Future.delayed(const Duration(seconds: 2));

    // MOCK: Simulate occasional server error (optional, commented out)
    // if (DateTime.now().second % 10 == 0) throw ServerException("Internal server error 500");

    return CreatePropertyResponse(
      propertyId: 'mock_prop_${DateTime.now().millisecondsSinceEpoch}',
      status: 'PUBLISHED',
      createdAt: DateTime.now(),
    );
  }

  Future<PropertySummaryResponse> getProperty(String propertyId) async {
    await Future.delayed(const Duration(seconds: 1));

    return PropertySummaryResponse(
      propertyId: propertyId,
      propertyName: "Mock Property",
      status: "PUBLISHED",
      location: "Mock Location",
      previewImageUrl: "https://example.com/mock.jpg",
      baseRate: 5000.0,
    );
  }
}

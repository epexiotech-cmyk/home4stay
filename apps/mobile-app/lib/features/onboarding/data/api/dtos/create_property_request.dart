class CreatePropertyRequest {
  final Map<String, dynamic> identity;
  final Map<String, dynamic> theme;
  final Map<String, dynamic> rooms;
  final Map<String, dynamic> amenities;
  final Map<String, dynamic> experiences;
  final Map<String, dynamic> media;
  final Map<String, dynamic> policies;
  final Map<String, dynamic> pricing;

  CreatePropertyRequest({
    required this.identity,
    required this.theme,
    required this.rooms,
    required this.amenities,
    required this.experiences,
    required this.media,
    required this.policies,
    required this.pricing,
  });

  Map<String, dynamic> toJson() => {
        'identity': identity,
        'theme': theme,
        'rooms': rooms,
        'amenities': amenities,
        'experiences': experiences,
        'media': media,
        'policies': policies,
        'pricing': pricing,
      };
}

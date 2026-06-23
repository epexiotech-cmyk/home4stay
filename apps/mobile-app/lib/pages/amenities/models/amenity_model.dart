import 'package:flutter/material.dart';

class Amenity {
  final String id;
  final String name;
  final String description;
  final IconData? icon;
  final bool isCustom;

  Amenity({
    required this.id,
    required this.name,
    this.description = '',
    this.icon,
    this.isCustom = false,
  });
}

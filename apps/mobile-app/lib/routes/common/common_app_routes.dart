//COMMON APP ROUTE HERE

import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/welcome_binding.dart';
import 'package:home4stay/pages/welcome/welcome_page.dart';
import 'package:home4stay/pages/property_identity/property_identity_page.dart';
import 'package:home4stay/pages/property_identity/property_identity_binding.dart';
import 'package:home4stay/pages/property_theme/property_theme_page.dart';
import 'package:home4stay/pages/property_theme/property_theme_binding.dart';
import 'package:home4stay/pages/rooms_inventory/rooms_inventory_page.dart';
import 'package:home4stay/pages/rooms_inventory/rooms_inventory_binding.dart';
import 'package:home4stay/pages/amenities/amenities_page.dart';
import 'package:home4stay/pages/amenities/amenities_binding.dart';
import 'package:home4stay/pages/experiences/experiences_page.dart';
import 'package:home4stay/pages/experiences/experiences_binding.dart';
import 'package:home4stay/pages/media_gallery/media_gallery_page.dart';
import 'package:home4stay/pages/media_gallery/media_gallery_binding.dart';
import 'package:home4stay/pages/policies/policies_page.dart';
import 'package:home4stay/pages/policies/policies_binding.dart';
import 'package:home4stay/pages/pricing_engine/pricing_engine_page.dart';
import 'package:home4stay/pages/pricing_engine/pricing_engine_binding.dart';
import 'package:home4stay/pages/launch_readiness/launch_readiness_page.dart';
import 'package:home4stay/pages/launch_readiness/launch_readiness_binding.dart';
import 'package:home4stay/pages/property_launch_success/property_launch_success_page.dart';

class CommonRoutes {
  static final routes = [
    GetPage(
      name: routeRootpage,
      page: () => SplashScreen(),
      binding: SplashBinding(),
    ),
    // GetPage(
    //   name: routeLoginpage,
    //   page: () => const LoginScreen(),
    //   binding: LoginBinding(),
    // ),
    GetPage(
      name: routeregisterpage,
      page: () => const RegisterScreen(),
      binding: RegisterBinding(),
    ),
    GetPage(
      name: routewelocmepage,
      page: () => const WelcomeScreen(),
      binding: WelcomeBinding(),
    ),
    GetPage(
      name: routePropertyIdentity,
      page: () => const PropertyIdentityPage(),
      binding: PropertyIdentityBinding(),
    ),
    GetPage(
      name: routePropertyTheme,
      page: () => const PropertyThemePage(),
      binding: PropertyThemeBinding(),
    ),
    GetPage(
      name: routeRoomsInventory,
      page: () => const RoomsInventoryPage(),
      binding: RoomsInventoryBinding(),
    ),
    GetPage(
      name: routeAmenities,
      page: () => const AmenitiesPage(),
      binding: AmenitiesBinding(),
    ),
    GetPage(
      name: routeExperiences,
      page: () => const ExperiencesPage(),
      binding: ExperiencesBinding(),
    ),
    GetPage(
      name: routeMediaGallery,
      page: () => const MediaGalleryPage(),
      binding: MediaGalleryBinding(),
    ),
    GetPage(
      name: routePolicies,
      page: () => const PoliciesPage(),
      binding: PoliciesBinding(),
    ),
    GetPage(
      name: routePricingEngine,
      page: () => const PricingEnginePage(),
      binding: PricingEngineBinding(),
    ),
    GetPage(
      name: routeLaunchReadiness,
      page: () => const LaunchReadinessPage(),
      binding: LaunchReadinessBinding(),
    ),
    GetPage(
      name: routePropertyLaunchSuccess,
      page: () => const PropertyLaunchSuccessPage(),
    ),
    // GetPage(
    //   name: routedashboard,
    //   page: () => const DashboardPage(),
    //   binding: DashboardBinding(),
    // ),
    // GetPage(
    //   name: routeforgetpage,
    //   page: () => const ForgetScreen(),
    //   binding: ForgetBinding(),
    // ),
    // GetPage(
    //   name: routepatientpage,
    //   page: () => const PatientPage(),
    //   binding: PatientBinding(),
    // ),
    // GetPage(
    //   name: routebillingpage,
    //   page: () => const BillingPage(),
    //   binding: BillingBinding(),
    // ),
    // GetPage(
    //   name: routeinventorypage,
    //   page: () => const InventoryPage(),
    //   binding: InventoryBinding(),
    // ),
    // GetPage(
    //   name: routediseasepage,
    //   page: () => const DiseasePage(),
    //   binding: DiseaseBinding(),
    // ),
    // GetPage(
    //   name: routeprofilepage,
    //   page: () => const ProfilePage(),
    //   binding: ProfileBinding(),
    // ),
  ];
}

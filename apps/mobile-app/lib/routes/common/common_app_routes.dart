//COMMON APP ROUTE HERE

import 'package:home4stay/core/common_imports.dart';

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

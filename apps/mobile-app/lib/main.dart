import 'package:home4stay/core/common_imports.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  setupLocator();
  runApp(const Home4StayPartnerApp());
}

class Home4StayPartnerApp extends StatelessWidget {
  const Home4StayPartnerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Home4StayPartnerApp',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),
        useMaterial3: true,
      ),
      initialRoute: routeRootpage,
      unknownRoute: GetPage(
        name: '/notfound',
        page: () => const Scaffold(body: Center(child: Text('Route Not Found'))),
      ),
      getPages: AppRoutes.routes,
    );
  }
}

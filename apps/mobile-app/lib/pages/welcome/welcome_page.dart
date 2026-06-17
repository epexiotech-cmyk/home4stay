import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/welcome_controller.dart';
import 'package:home4stay/widgets/custom_appbar.dart';

class WelcomeScreen extends StatelessWidget {
  const WelcomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<WelcomeController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: AppColors.WHITE,
          appBar: CustomAppBarAction(title: "HOSPITALITY SETUP SUITE"),

          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: wp(5),
                  vertical: hp(2),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,

                  children: [],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

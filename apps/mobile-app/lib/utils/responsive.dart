import 'package:home4stay/core/common_imports.dart';

double wp(double percentage) {
  double result = (Get.width * percentage) / 100;

  return result;
}

double hp(double percentage) {
  double result = (Get.height * percentage) / 100;
  return result;
}

double dp(BuildContext context, double size) {
  // ignore: deprecated_member_use
  return size * MediaQuery.textScaleFactorOf(context);
}

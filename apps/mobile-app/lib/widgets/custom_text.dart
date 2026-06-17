import 'package:home4stay/core/common_imports.dart';

class CustomText extends StatelessWidget {
  final String? text;
  final double? fontSize;
  final Color? color;
  final FontStyle? fontStyle;

  const CustomText({
    super.key,
    this.text,
    this.fontSize,
    this.color,
    this.fontStyle,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      text ?? "",
      style: TextStyle(
        fontSize: fontSize ?? dp(context, 20),
        color: color ?? AppColors.PRIMARY_COLOR,
        fontStyle: fontStyle ?? FontStyle.italic,
      ),
    );
  }
}

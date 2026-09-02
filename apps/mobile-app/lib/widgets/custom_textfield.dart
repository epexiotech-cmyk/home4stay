import 'package:form_field_validator/form_field_validator.dart';
import 'package:home4stay/core/common_imports.dart';

class CustomTextField extends StatelessWidget {
  final String? labeltext;
  final Function(String)? onchange;
  final TextEditingController? controller;
  final String? hint;
  final Color? backgroundColor;
  final bool? readOnly;
  final Color? bordercolor;
  final String? errorText;
  final InputBorder? errorBorder;
  final MultiValidator? validator;
  final void Function()? onEditingComplete;
  final TextInputType? keyboardType;
  final FocusNode? focusNode;
  final AutovalidateMode? autovalidateMode;
  final void Function(String)? onFieldSubmitted;
  final TextAlign? textAlign;
  final TextCapitalization? textCapitalization;
  final List<TextInputFormatter>? inputFormatters;
  final TextInputAction? textInputAction;
  final bool? obscureText;
  final InputBorder? focusedBorder;
  final InputBorder? border;
  final InputBorder? focusedErrorBorder;
  final InputBorder? enabledBorder;
  final Color? inputtextcolor;
  final Widget? suffixIcon;
  final Widget? prefixicon;
  final TextStyle? hintStyle;
  final int? minLines;
  final int? maxLines;

  const CustomTextField({
    super.key,
    this.controller,
    this.labeltext,
    this.onchange,
    this.hint,
    this.backgroundColor,
    this.readOnly,
    this.bordercolor,
    this.errorBorder,
    this.errorText,
    this.validator,
    this.onEditingComplete,
    this.keyboardType,
    this.focusNode,
    this.autovalidateMode,
    this.onFieldSubmitted,
    this.textAlign,
    this.textCapitalization,
    this.inputFormatters,
    this.textInputAction,
    this.obscureText,
    this.focusedBorder,
    this.border,
    this.focusedErrorBorder,
    this.enabledBorder,
    this.inputtextcolor,
    this.suffixIcon,
    this.hintStyle,
    this.prefixicon,
    this.minLines,
    this.maxLines, // <-- NEW
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      minLines: minLines,
      maxLines: obscureText == true ? 1 : maxLines ?? 1,
      textAlignVertical: TextAlignVertical.center,
      textInputAction: textInputAction,
      cursorColor: AppColors.PRIMARY_COLOR,
      cursorHeight: hp(2),
      keyboardType: keyboardType ?? TextInputType.text,
      obscureText: obscureText ?? false,
      textCapitalization: textCapitalization ?? TextCapitalization.none,
      inputFormatters:
          inputFormatters ?? [FilteringTextInputFormatter.deny(RegExp(r'^\s'))],
      textAlign: textAlign ?? TextAlign.start,
      autovalidateMode: autovalidateMode ?? AutovalidateMode.disabled,
      onFieldSubmitted: onFieldSubmitted,
      onEditingComplete: onEditingComplete,
      focusNode: focusNode,
      onChanged: onchange,
      validator: (validator ?? MultiValidator([])).call,
      readOnly: readOnly ?? false,
      controller: controller,
      decoration: InputDecoration(
        prefixIcon: prefixicon,
        suffixIcon: suffixIcon,
        labelText: labeltext,
        labelStyle: TextStyle(color: AppColors.PRIMARY_COLOR),
        hintText: hint ?? "",
        hintStyle:
            hintStyle ??
            TextStyle(color: AppColors.LIGHT_GREY, fontSize: dp(context, 12)),
        filled: true,
        fillColor: backgroundColor ?? AppColors.WHITE, // <-- Default color
        enabledBorder:
            enabledBorder ??
            OutlineInputBorder(
              borderRadius: BorderRadius.circular(dp(context, 10)),
              borderSide: BorderSide(
                color: AppColors.LIGHT_GREY,
                style: BorderStyle.solid,
              ),
            ),
        border:
            border ??
            OutlineInputBorder(
              borderRadius: BorderRadius.circular(dp(context, 10)),
              borderSide: BorderSide(
                color: bordercolor ?? AppColors.LIGHT_GREY,
                style: BorderStyle.solid,
                width: wp(2),
              ),
            ),
        focusedBorder:
            focusedBorder ??
            OutlineInputBorder(
              borderSide: BorderSide(color: AppColors.PRIMARY_COLOR),
              borderRadius: BorderRadius.circular(dp(context, 10)),
            ),
        focusedErrorBorder:
            focusedErrorBorder ??
            OutlineInputBorder(
              borderRadius: BorderRadius.circular(dp(context, 10)),
              borderSide: BorderSide(color: Colors.red, width: 2),
            ),

        errorBorder:
            errorBorder ??
            OutlineInputBorder(
              borderSide: BorderSide(color: Colors.red),
              borderRadius: BorderRadius.circular(dp(context, 10)),
            ),
        errorText: errorText,
        errorStyle: TextStyle(color: Colors.red),
      ),
      style: TextStyle(color: inputtextcolor ?? AppColors.DARK),
    );
  }
}

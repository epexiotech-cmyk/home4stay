import 'package:form_field_validator/form_field_validator.dart';

class FormValidations {
  String? requiredField(String? value, {String? errorText}) {
    if (value!.isEmpty) {
      return "This field is Required.";
    }
    return null;
  }

  PatternValidator mobileValidateField() {
    return PatternValidator(
      r'^[6-9]\d{9}$',
      errorText: "Invalid Mobile Number.",
    );
  }

  PatternValidator passwordValidateField() {
    return PatternValidator(
      r'^(?=.*[a-zÇçĞğİıÖöŞşÜü])(?=.*[A-ZÇçĞğİıÖöŞşÜü])(?=.*\d).{8,}',
      errorText:
          "Minimum Length must be 8 digit"
          "Password must contain at least one uppercase character"
          "Password must contain at least one lowercase character"
          "Password must contain at least one digit"
          "Password must contain at least one special character",
    );
  }

  // PatternValidator digitsWithoutLeadingZeroValidateField() {
  //   return PatternValidator(
  //     r'^[1-9]\d*$',
  //     errorText: Keys.pleaseEnterValidInput.tr,
  //   );
  // }

  MultiValidator validation({
    required String type,
    required MultiValidator multiValidator,
    required bool isRequired,
    String? errorText,
  }) {
    if (isRequired) {
      multiValidator.validators.add(
        RequiredValidator(errorText: errorText ?? "This field is Required."),
      );
    }

    switch (type) {
      case "mobileno":
        multiValidator.validators.add(mobileValidateField());
        break;
      case "email":
        multiValidator.validators.add(
          EmailValidator(errorText: "Invalid Email Format."),
        );
        break;
      // case "digitsWithoutLeadingZero":
      //   multiValidator.validators.add(digitsWithoutLeadingZeroValidateField());
      //   break;
      case "password":
        multiValidator.validators.addAll([
          PatternValidator(
            r'[A-Z]',
            errorText: "Password must contain at least one uppercase character",
          ),
          PatternValidator(
            r'[a-z]',
            errorText: "Password must contain at least one lowercase character",
          ),
          PatternValidator(
            r'^(?=.*?[0-9]).{6,}$',
            errorText: "Password must contain at least one digit",
          ),
          // PatternValidator(
          //   r'^(?=.*?[!@#\$&*~()\[\]{}<>]).{6,}$',
          //   errorText: Keys.oneSpecialCharacter.tr,
          // ),
          // LengthRangeValidator(
          //   min: 8,
          //   max: 20,
          //   errorText: Keys.min8Characters.tr,
          // ),
        ]);
        break;
    }
    return multiValidator;
  }
}

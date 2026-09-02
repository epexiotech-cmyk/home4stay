import 'package:flutter/gestures.dart';
import 'package:form_field_validator/form_field_validator.dart';
import 'package:home4stay/core/common_imports.dart';

class RegisterScreen extends StatelessWidget {
  const RegisterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GetBuilder<RegisterController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: AppColors.WHITE,
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: EdgeInsets.symmetric(
                  horizontal: wp(5),
                  vertical: hp(2),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,

                  children: [
                    Image.asset('assets/image/Home4StayLogo.png'),

                    SizedBox(height: hp(4)),
                    CustomText(
                      text: "CREATE PARTNER ACCOUNT",
                      fontSize: dp(context, 24),
                      color: AppColors.PRIMARY_COLOR,
                      fontStyle: FontStyle.normal,
                    ),
                    SizedBox(height: hp(1)),
                    CustomText(
                      text: "ESTABLISH YOUR LUXURY DIRECT-BOOKING ECOSYSTEM",
                      fontSize: dp(context, 14),
                      color: AppColors.DARK.shade50,
                      fontStyle: FontStyle.normal,
                    ),
                    SizedBox(height: hp(2)),
                    // Name Field
                    CustomTextField(
                      keyboardType: TextInputType.name,
                      textInputAction: TextInputAction.next,
                      controller: controller.nameController,
                      hint: "Full Name",
                      labeltext: 'Full Name',
                      validator: formValidation.validation(
                        type: 'name',
                        multiValidator: MultiValidator([]),
                        isRequired: true,
                        errorText: "Name is required.",
                      ),
                      prefixicon: Icon(
                        Icons.person_2_outlined,
                        color: AppColors.PRIMARY_COLOR,
                      ),
                    ),

                    SizedBox(height: hp(2)),

                    Row(
                      children: [
                        Expanded(
                          child: CustomTextField(
                            keyboardType: TextInputType.emailAddress,
                            textInputAction: TextInputAction.next,
                            controller: controller.emailController,
                            hint: "Email Id",
                            labeltext: 'Email Id',
                            validator: formValidation.validation(
                              type: 'email',
                              multiValidator: MultiValidator([]),
                              isRequired: true,
                              errorText: "Email is required.",
                            ),
                            prefixicon: Icon(
                              Icons.email_outlined,
                              color: AppColors.PRIMARY_COLOR,
                            ),
                          ),
                        ),
                        SizedBox(width: wp(4)),
                        Expanded(
                          child: CustomTextField(
                            keyboardType: TextInputType.number,
                            textInputAction: TextInputAction.next,
                            controller: controller.emailController,
                            hint: "Mobile No",
                            labeltext: 'Mobile No',
                            validator: formValidation.validation(
                              type: 'mobile',
                              multiValidator: MultiValidator([]),
                              isRequired: true,
                              errorText: "Mobile No is required.",
                            ),
                            prefixicon: Icon(
                              Icons.phone_outlined,
                              color: AppColors.PRIMARY_COLOR,
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: hp(2)),
                    CustomTextField(
                      keyboardType: TextInputType.number,
                      textInputAction: TextInputAction.next,
                      controller: controller.emailController,
                      hint: "Primery Property / Vill Name",
                      labeltext: 'Primery Property / Vill Name',
                      validator: formValidation.validation(
                        type: 'name',
                        multiValidator: MultiValidator([]),
                        isRequired: true,
                        errorText: "Vill is required.",
                      ),
                      prefixicon: Icon(
                        Icons.home_filled,
                        color: AppColors.PRIMARY_COLOR,
                      ),
                    ),
                    SizedBox(height: hp(2)),
                    Row(
                      children: [
                        Expanded(
                          child: CustomTextField(
                            obscureText: !controller.isPasswordVisible.value,
                            controller: controller.passwordController,
                            textInputAction: TextInputAction.done,
                            hint: 'Password',
                            labeltext: 'Password',
                            validator: formValidation.validation(
                              type: 'password',
                              multiValidator: MultiValidator([]),
                              isRequired: true,
                              errorText: "Password is required.",
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                controller.isPasswordVisible.value
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                color: AppColors.PRIMARY_COLOR,
                              ),
                              onPressed: controller.togglePasswordVisibility,
                            ),
                            prefixicon: Icon(
                              Icons.lock_outline,
                              color: AppColors.PRIMARY_COLOR,
                            ),
                          ),
                        ),
                        SizedBox(width: wp(4)),
                        Expanded(
                          child: CustomTextField(
                            obscureText: !controller.isPasswordVisible.value,
                            controller: controller.confirmPasswordController,
                            textInputAction: TextInputAction.done,
                            hint: 'Confirm Password',
                            labeltext: 'Confirm Password',
                            validator: formValidation.validation(
                              type: 'password',
                              multiValidator: MultiValidator([]),
                              isRequired: true,
                              errorText: "Confirm Password is required.",
                            ),
                            suffixIcon: IconButton(
                              icon: Icon(
                                controller.isPasswordVisible.value
                                    ? Icons.visibility_outlined
                                    : Icons.visibility_off_outlined,
                                color: AppColors.PRIMARY_COLOR,
                              ),
                              onPressed: controller.togglePasswordVisibility,
                            ),
                            prefixicon: Icon(
                              Icons.lock_outline,
                              color: AppColors.PRIMARY_COLOR,
                            ),
                          ),
                        ),
                      ],
                    ),

                    SizedBox(height: hp(2)),

                    Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        SizedBox(
                          width: wp(8),
                          height: hp(3),
                          child: Checkbox(
                            value: controller.value,
                            activeColor: AppColors.PRIMARY_COLOR,
                            onChanged: (bool? newValue) {
                              controller.value = newValue;
                              controller.update();
                            },
                          ),
                        ),
                        SizedBox(width: wp(3)),
                        Expanded(
                          child: RichText(
                            text: TextSpan(
                              style: TextStyle(
                                fontSize: dp(context, 13),
                                color: Colors.grey.shade600,
                                height: 1.4,
                              ),
                              children: [
                                TextSpan(text: "I read and agree to the "),
                                TextSpan(
                                  text: "Terms & Conditions (v1.0.0)",
                                  style: TextStyle(
                                    color: AppColors.PRIMARY_COLOR,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  recognizer: TapGestureRecognizer()
                                    ..onTap = () {
                                      // Handle Terms tap
                                    },
                                ),
                                TextSpan(text: "\nand "),
                                TextSpan(
                                  text: "Privacy Policy (v1.0.0)",
                                  style: TextStyle(
                                    color: AppColors.PRIMARY_COLOR,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  recognizer: TapGestureRecognizer()
                                    ..onTap = () {
                                      // Handle Privacy tap
                                    },
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: wp(3)),
                    // Register Button
                    Customcontainer(
                      text: "ESTALIBSH WORKSPACE",
                      context: context,
                      onTap: () {
                        Get.offAllNamed(routewelocmepage);
                      },
                      // onTap: controller.login,
                    ),
                    SizedBox(height: hp(3)),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CustomText(
                          text: "Already have an Partner Account? ",
                          color: AppColors.DARK.shade500,
                          fontSize: dp(context, 15),
                        ),
                        InkWell(
                          onTap: () => controller.goToLogin(),
                          child: CustomText(
                            text: "SIGN IN",
                            color: AppColors.PRIMARY_COLOR,
                            fontSize: dp(context, 15),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

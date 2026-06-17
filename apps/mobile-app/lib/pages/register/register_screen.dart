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
                    Image.asset(
                      'assets/images/splash_logo.png',
                      scale: dp(context, 2.3),
                      color: AppColors.PRIMARY_COLOR,
                    ),

                    SizedBox(height: hp(2)),
                    CustomText(text: "PMS Create Account"),

                    SizedBox(height: hp(4)),

                    // Name Field
                    CustomTextField(
                      keyboardType: TextInputType.name,
                      textInputAction: TextInputAction.next,
                      controller: controller.nameController,
                      hint: "Doctor Name",
                      labeltext: 'Doctor Name',
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
                    // Email Field
                    CustomTextField(
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
                    SizedBox(height: hp(2)),
                    // Email Field
                    CustomTextField(
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

                    SizedBox(height: hp(2)),
                    // Password Field
                    CustomTextField(
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
                    SizedBox(height: hp(2)),

                    // Confirm Password Field
                    CustomTextField(
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

                    SizedBox(height: hp(4)),

                    // Register Button
                    Customcontainer(
                      text: "REGISTER",
                      context: context,
                      onTap: controller.login,
                    ),
                    SizedBox(height: hp(3)),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CustomText(
                          text: "Already have an account? ",
                          color: AppColors.LIGHT_GREY,
                          fontSize: dp(context, 12),
                        ),
                        InkWell(
                          onTap: () => controller.goToLogin(),
                          child: CustomText(
                            text: "Back to Login",
                            color: AppColors.PRIMARY_COLOR,
                            fontSize: dp(context, 12),
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

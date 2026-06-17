import 'package:home4stay/core/common_imports.dart';

GetIt getIt = GetIt.instance;

void setupLocator() {
  getIt.registerLazySingleton<FormValidations>(() => FormValidations());
}

FormValidations get formValidation => getIt.get<FormValidations>();

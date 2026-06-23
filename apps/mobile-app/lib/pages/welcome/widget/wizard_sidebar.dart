import 'package:home4stay/core/common_imports.dart';

class WizardSidebar extends StatelessWidget {
  final int currentStep;

  const WizardSidebar({super.key, required this.currentStep});

  static const List<String> steps = [
    "Welcome",
    "Property Identity",
    "Property Theme",
    "Rooms & Inventory",
    "Amenities",
    "Experiences",
    "Media Gallery",
    "Policies & Terms",
    "Pricing Engine",
    "Launch Readiness",
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      width: wp(25),
      constraints: const BoxConstraints(minWidth: 250, maxWidth: 300),
      color: const Color(0xFF1F2937),
      padding: EdgeInsets.symmetric(horizontal: wp(2), vertical: hp(4)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.only(left: wp(2), bottom: hp(4)),
            child: Text(
              "HOME4STAY",
              style: TextStyle(
                color: AppColors.WHITE,
                fontSize: dp(context, 20),
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: steps.length,
              itemBuilder: (context, index) {
                final stepNumber = index + 1;
                final isActive = currentStep == stepNumber;
                final isCompleted = currentStep > stepNumber;
                
                return Container(
                  margin: EdgeInsets.only(bottom: hp(1.5)),
                  padding: EdgeInsets.symmetric(vertical: hp(1.5), horizontal: wp(2)),
                  decoration: BoxDecoration(
                    color: isActive ? const Color(0x4D0D5C7D) : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                    border: isActive ? Border.all(color: const Color(0xFF0D5C7D), width: 1) : null,
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 24,
                        height: 24,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isCompleted ? const Color(0xFF0D5C7D) : 
                                isActive ? AppColors.WHITE : Colors.transparent,
                          border: Border.all(
                            color: isActive || isCompleted ? const Color(0xFF0D5C7D) : Colors.grey.shade600,
                          ),
                          shape: BoxShape.circle,
                        ),
                        child: isCompleted 
                            ? Icon(Icons.check, size: 14, color: AppColors.WHITE)
                            : Text(
                                stepNumber.toString(),
                                style: TextStyle(
                                  color: isActive ? const Color(0xFF0D5C7D) : Colors.grey.shade400,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                      SizedBox(width: wp(3)),
                      Expanded(
                        child: Text(
                          steps[index],
                          style: TextStyle(
                            color: isActive || isCompleted ? AppColors.WHITE : Colors.grey.shade400,
                            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                            fontSize: dp(context, 14),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

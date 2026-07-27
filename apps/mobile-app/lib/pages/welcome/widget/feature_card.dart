import 'package:home4stay/core/common_imports.dart';

class FeatureCard extends StatelessWidget {
  final String title;
  final String description;

  const FeatureCard({
    super.key, 
    required this.title, 
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: hp(3), horizontal: wp(5)),
      margin: EdgeInsets.only(bottom: hp(2)),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              color: const Color(0xFF0D5C7D),
              fontSize: dp(context, 16),
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: hp(1)),
          Text(
            description,
            style: TextStyle(
              color: const Color(0xFF1F2937),
              fontSize: dp(context, 14),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}

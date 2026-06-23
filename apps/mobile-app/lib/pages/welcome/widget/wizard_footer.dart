import 'package:home4stay/core/common_imports.dart';

class WizardFooter extends StatelessWidget {
  final VoidCallback onNext;
  final VoidCallback onBack;
  final bool isBackEnabled;
  final bool isNextEnabled;
  final double progress;
  final String nextLabel;
  final Widget? leftWidget;

  const WizardFooter({
    super.key,
    required this.onNext,
    required this.onBack,
    this.isBackEnabled = true,
    this.isNextEnabled = true,
    required this.progress,
    this.nextLabel = "NEXT",
    this.leftWidget,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: wp(5), vertical: hp(2)),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        border: Border(top: BorderSide(color: Colors.grey.shade200)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progress,
                      minHeight: 8,
                      backgroundColor: Colors.grey.shade200,
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        Color(0xFF0D5C7D),
                      ),
                    ),
                  ),
                ),
                SizedBox(width: wp(4)),
                Text(
                  "${(progress * 100).toInt()}%",
                  style: TextStyle(
                    color: const Color(0xFF1F2937),
                    fontWeight: FontWeight.bold,
                    fontSize: dp(context, 14),
                  ),
                ),
              ],
            ),
            SizedBox(height: hp(2)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                leftWidget ?? TextButton(
                  onPressed: isBackEnabled ? onBack : null,
                  child: Text(
                    "BACK",
                    style: TextStyle(
                      color: isBackEnabled
                          ? const Color(0xFF1F2937)
                          : Colors.grey,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Opacity(
                  opacity: isNextEnabled ? 1.0 : 0.5,
                  child: ElevatedButton(
                    onPressed: isNextEnabled ? onNext : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0D5C7D),
                      padding: EdgeInsets.symmetric(
                        horizontal: wp(6),
                        vertical: hp(2),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    child: Text(
                      nextLabel,
                      style: TextStyle(
                        color: AppColors.WHITE,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

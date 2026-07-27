import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/features/launch_workflow/domain/models/property_launch_result.dart';

class PropertyLaunchSuccessPage extends StatelessWidget {
  const PropertyLaunchSuccessPage({super.key});

  @override
  Widget build(BuildContext context) {
    // Retrieve result from arguments
    final PropertyLaunchResult? result = Get.arguments as PropertyLaunchResult?;

    return Scaffold(
      backgroundColor: const Color(0xFFF0FDF4), // Light green success background
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: EdgeInsets.all(wp(8)),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 500),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: const BoxDecoration(
                      color: Color(0xFF16A34A),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check_circle, color: Colors.white, size: 64),
                  ),
                  SizedBox(height: hp(4)),
                  Text(
                    "Property Launched\nSuccessfully!",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: dp(context, 32),
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF166534),
                      height: 1.2,
                    ),
                  ),
                  SizedBox(height: hp(2)),
                  Text(
                    "Your property is now live and ready to receive bookings.",
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: dp(context, 16),
                      color: const Color(0xFF15803D),
                    ),
                  ),
                  SizedBox(height: hp(5)),
                  
                  // Stats Card
                  if (result != null)
                    Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.05),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          )
                        ],
                      ),
                      child: Column(
                        children: [
                          _buildStatRow("Property ID", result.propertyId ?? "Unknown"),
                          const Divider(height: 24),
                          _buildStatRow("Launch Time", "${result.launchDuration.inSeconds} seconds"),
                          const Divider(height: 24),
                          _buildStatRow("Media Uploaded", "${result.uploadedFiles} files"),
                        ],
                      ),
                    ),

                  SizedBox(height: hp(6)),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF16A34A),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        // Routing back to dashboard root
                        Get.offAllNamed('/welcome'); // Back to beginning since we have no real dashboard yet
                      },
                      child: const Text(
                        "RETURN TO DASHBOARD",
                        style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.0),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.grey.shade600,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            color: Color(0xFF1F2937),
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}

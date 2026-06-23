import 'package:home4stay/core/common_imports.dart';
import 'package:home4stay/pages/welcome/widget/wizard_sidebar.dart';
import 'package:home4stay/pages/welcome/widget/wizard_footer.dart';
import 'package:home4stay/pages/media_gallery/media_gallery_controller.dart';
import 'package:home4stay/pages/media_gallery/models/media_item_model.dart';

class MediaGalleryPage extends StatelessWidget {
  const MediaGalleryPage({super.key});

  @override
  Widget build(BuildContext context) {
    final bool isMobile = MediaQuery.of(context).size.width < 800;

    return GetBuilder<MediaGalleryController>(
      builder: (controller) {
        return Scaffold(
          backgroundColor: const Color(0xFFF7F2EE),
          body: SafeArea(
            child: Row(
              children: [
                if (!isMobile) const WizardSidebar(currentStep: 7),
                Expanded(
                  child: Column(
                    children: [
                      if (isMobile)
                        Container(
                          padding: EdgeInsets.all(wp(4)),
                          color: AppColors.WHITE,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Step 7 of 10",
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontSize: dp(context, 12),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              SizedBox(height: hp(1)),
                              ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: 0.7,
                                  minHeight: 6,
                                  backgroundColor: Colors.grey.shade200,
                                  valueColor: const AlwaysStoppedAnimation<Color>(
                                    Color(0xFF0D5C7D),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      // Scrollable content
                      Expanded(
                        child: SingleChildScrollView(
                          padding: EdgeInsets.symmetric(
                            horizontal: isMobile ? wp(5) : wp(8),
                            vertical: hp(6),
                          ),
                          child: Center(
                            child: ConstrainedBox(
                              constraints: const BoxConstraints(maxWidth: 900), // Slightly wider for 2 columns
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: EdgeInsets.symmetric(
                                      horizontal: wp(3),
                                      vertical: hp(0.5),
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0x1A0D5C7D),
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      "STEP 7 : MEDIA GALLERY",
                                      style: TextStyle(
                                        color: const Color(0xFF0D5C7D),
                                        fontSize: dp(context, 12),
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 1.0,
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: hp(3)),
                                  Text(
                                    "Visual Storytelling Engine",
                                    style: TextStyle(
                                      fontSize: dp(context, 32),
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF1F2937),
                                      height: 1.2,
                                    ),
                                  ),
                                  SizedBox(height: hp(2)),
                                  Text(
                                    "Upload the images and videos that will showcase your property to potential guests.",
                                    style: TextStyle(
                                      fontSize: dp(context, 16),
                                      color: const Color(0xCC1F2937),
                                      height: 1.6,
                                    ),
                                  ),
                                  SizedBox(height: hp(5)),

                                  // Visual Completeness & Summary
                                  Obx(() => _buildSummaryPanel(context, controller)),
                                  SizedBox(height: hp(5)),

                                  // Categories Grid
                                  _buildCategoriesGrid(context, controller),
                                  SizedBox(height: hp(5)),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      // Footer
                      Obx(() => WizardFooter(
                        progress: 0.7, // 70% progress
                        isBackEnabled: true,
                        isNextEnabled: controller.isReady,
                        nextLabel: "CONTINUE SETUP",
                        onBack: () => Get.back(),
                        onNext: () {
                          Get.toNamed('/policies');
                        },
                        leftWidget: Row(
                          children: [
                            const Icon(
                              Icons.info_outline,
                              color: Color(0xFF1F2937),
                              size: 20,
                            ),
                            SizedBox(width: wp(2)),
                            Expanded(
                              child: Text(
                                "Properties with media receive significantly more bookings.",
                                style: TextStyle(
                                  color: const Color(0xFF1F2937).withOpacity(0.7),
                                  fontSize: dp(context, 12),
                                  fontWeight: FontWeight.w500,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildSummaryPanel(BuildContext context, MediaGalleryController controller) {
    double score = controller.completionScore;
    int percentage = (score * 100).toInt();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF0D5C7D).withOpacity(0.2), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "VISUAL COMPLETENESS SCORE",
                style: TextStyle(
                  color: Color(0xFF0D5C7D),
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  fontSize: 12,
                ),
              ),
              Text(
                "$percentage%",
                style: const TextStyle(
                  color: Color(0xFF0D5C7D),
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: score,
              minHeight: 12,
              backgroundColor: Colors.grey.shade200,
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF16A34A)),
            ),
          ),
          const SizedBox(height: 32),
          Wrap(
            spacing: 32,
            runSpacing: 24,
            children: [
              _buildSummaryStat("Total Categories Configured", controller.totalCategoriesConfigured.toString()),
              _buildSummaryStat("Total Media Items", controller.totalMedia.toString()),
            ],
          ),
          if (controller.totalMedia == 0) ...[
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.warning_amber_rounded, color: Colors.amber.shade700),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      "No media uploaded yet. Upload visuals to improve guest confidence.",
                      style: TextStyle(
                        color: Colors.amber.shade900,
                        fontWeight: FontWeight.w500,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSummaryStat(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: const Color(0xFF1F2937).withOpacity(0.6),
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 24,
            color: Color(0xFF0D5C7D),
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildCategoriesGrid(BuildContext context, MediaGalleryController controller) {
    return LayoutBuilder(
      builder: (context, constraints) {
        int crossAxisCount = constraints.maxWidth > 700 ? 2 : 1;
        double totalSpacing = (crossAxisCount - 1) * 24.0;
        double itemWidth = (constraints.maxWidth - totalSpacing) / crossAxisCount;

        return Wrap(
          spacing: 24,
          runSpacing: 24,
          children: controller.categories.map((cat) {
            return SizedBox(
              width: itemWidth,
              child: _buildCategoryCard(context, controller, cat),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _buildCategoryCard(BuildContext context, MediaGalleryController controller, MediaCategoryDef cat) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.grey.shade200, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0D5C7D).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.cloud_upload_outlined, color: Color(0xFF0D5C7D), size: 24),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Text(
                        cat.name,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  cat.description,
                  style: TextStyle(
                    fontSize: 14,
                    color: const Color(0xFF1F2937).withOpacity(0.6),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => controller.addMockMedia(cat.id),
                    icon: const Icon(Icons.add_photo_alternate, size: 18),
                    label: const Text(
                      "UPLOAD MEDIA",
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF0D5C7D),
                      side: const BorderSide(color: Color(0xFF0D5C7D)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Obx(() {
            List<MediaItem> items = controller.categoryMediaMap[cat.id] ?? [];
            if (items.isEmpty) return const SizedBox.shrink();

            return Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24.0),
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAFB),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(20)),
                border: Border(top: BorderSide(color: Colors.grey.shade200)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "UPLOADED (${items.length})",
                    style: TextStyle(
                      color: const Color(0xFF1F2937).withOpacity(0.5),
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: items.map((item) => _buildMediaPreview(context, controller, cat.id, item)).toList(),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildMediaPreview(BuildContext context, MediaGalleryController controller, String categoryId, MediaItem item) {
    return Container(
      width: 120,
      decoration: BoxDecoration(
        color: AppColors.WHITE,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 80,
            width: double.infinity,
            decoration: const BoxDecoration(
              color: Color(0xFFE5E7EB),
              borderRadius: BorderRadius.vertical(top: Radius.circular(12)),
            ),
            child: const Icon(Icons.image, color: Colors.white, size: 32),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    item.filename,
                    style: TextStyle(
                      fontSize: 10,
                      color: const Color(0xFF1F2937).withOpacity(0.8),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                GestureDetector(
                  onTap: () => _showDeleteDialog(context, controller, categoryId, item),
                  child: Icon(Icons.delete_outline, size: 16, color: Colors.red.shade400),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showDeleteDialog(BuildContext context, MediaGalleryController controller, String categoryId, MediaItem item) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: const Text("Remove Media", style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF1F2937))),
          content: Text("Are you sure you want to delete '${item.filename}'?"),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text("Cancel", style: TextStyle(color: Colors.grey.shade600, fontWeight: FontWeight.bold)),
            ),
            ElevatedButton(
              onPressed: () {
                controller.removeMedia(categoryId, item.id);
                Navigator.of(context).pop();
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade600,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text("Delete", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            ),
          ],
        );
      },
    );
  }
}

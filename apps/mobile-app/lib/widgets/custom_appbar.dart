import 'package:home4stay/core/common_imports.dart';

class CustomAppBarAction extends StatelessWidget
    implements PreferredSizeWidget {
  final IconData? iconleft;
  final IconData? iconright;
  final String title;
  final Function()? lefticononTap;
  final bool? istexttitle = false;
  final Function()? righticononTap;

  const CustomAppBarAction({
    super.key,
    this.iconleft,
    required this.title,
    this.iconright,
    this.lefticononTap,
    this.righticononTap,
  });

  @override
  Size get preferredSize => Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return Container(
      height: hp(20),
      padding: EdgeInsets.only(top: hp(4), right: wp(3.5), left: wp(3.5)),
      decoration: BoxDecoration(
        color: AppColors.PRIMARY_COLOR,
        boxShadow: [BoxShadow(color: AppColors.WHITE, offset: Offset(-1, 1))],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          if (iconleft != null)
            InkWell(
              onTap: lefticononTap,
              child: Icon(
                iconleft,
                color: AppColors.WHITE,
                size: dp(context, 30),
              ),
            ),
          Text(
            title,
            style: TextStyle(
              color: AppColors.WHITE,
              fontSize: dp(context, 25),
              fontStyle: FontStyle.italic,
              fontWeight: FontWeight.w500,
            ),
          ),
          if (iconright != null)
            InkWell(
              onTap: righticononTap,
              child: Icon(
                iconright,
                color: AppColors.WHITE,
                size: dp(context, 30),
              ),
            )
          else
            SizedBox(width: wp(5)),
        ],
      ),
    );
  }
}

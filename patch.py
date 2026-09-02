import os

db_path = 'apps/main-site/src/app/(portal)/admin/database/page.tsx'
with open(db_path, 'r') as f:
    db_content = f.read()

if 'useAuth' not in db_content:
    db_content = db_content.replace(
        'import { useRouter } from "next/navigation";',
        'import { useRouter } from "next/navigation";\nimport { useAuth } from "@/context/AuthContext";'
    )
    db_content = db_content.replace(
        'const router = useRouter();',
        'const router = useRouter();\n  const { user, loading } = useAuth();'
    )
    orig_effect = '''useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);'''
    new_effect = '''useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "super_admin") {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, router]);'''
    db_content = db_content.replace(orig_effect, new_effect)
    with open(db_path, 'w') as f:
        f.write(db_content)
    print('Patched page.tsx')


admin_path = 'apps/main-site/src/components/layouts/AdminLayout.tsx'
with open(admin_path, 'r') as f:
    admin_content = f.read()

if 'useAuth' not in admin_content:
    admin_content = admin_content.replace(
        'import Logo from "../ui/Logo";',
        'import Logo from "../ui/Logo";\nimport { useAuth } from "@/context/AuthContext";'
    )
    admin_content = admin_content.replace(
        '}) {\n  return (',
        '}) {\n  const { user, loading } = useAuth();\n  const isSuperAdmin = user?.role === "super_admin";\n\n  return ('
    )
    orig_link = '''<Link href="/admin/database" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all flex items-center gap-2">
              <span className="text-lg">???</span> Database
            </Link>'''
    new_link = '''{isSuperAdmin && (
            <Link href="/admin/database" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all flex items-center gap-2">
              <span className="text-lg">???</span> Database
            </Link>
          )}'''
    admin_content = admin_content.replace(orig_link, new_link)

    orig_profile = '''<div className="text-sm font-bold">Admin User</div>
              <div className="text-[10px] text-secondary font-bold uppercase">Super Admin</div>'''
    new_profile = '''<div className="text-sm font-bold">{loading ? "Loading..." : user?.name || "Admin User"}</div>
              <div className="text-[10px] text-secondary font-bold uppercase">{loading ? "..." : (user?.role?.replace("_", " ") || "Admin")}</div>'''
    admin_content = admin_content.replace(orig_profile, new_profile)

    with open(admin_path, 'w') as f:
        f.write(admin_content)
    print('Patched AdminLayout.tsx')

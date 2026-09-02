import os

db_path = 'apps/main-site/src/app/(portal)/admin/database/page.tsx'
with open(db_path, 'r') as f:
    db_content = f.read()


db_content = db_content.replace(
    'import { useRouter } from "next/navigation";\nimport { useAuth } from "@/context/AuthContext";',
    'import { useRouter } from "next/navigation";'
)
db_content = db_content.replace(
    'const router = useRouter();\n  const { user, loading } = useAuth();',
    'const router = useRouter();'
)
old_eff = '''useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "super_admin") {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, router]);'''
new_eff = '''useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);'''
db_content = db_content.replace(old_eff, new_eff)

with open(db_path, 'w') as f:
    f.write(db_content)


admin_path = 'apps/main-site/src/components/layouts/AdminLayout.tsx'
with open(admin_path, 'r') as f:
    admin_content = f.read()


admin_content = admin_content.replace(
    'import Logo from "../ui/Logo";\nimport { useAuth } from "@/context/AuthContext";',
    'import Logo from "../ui/Logo";'
)
admin_content = admin_content.replace(
    '}) {\n  const { user, loading } = useAuth();\n  const isSuperAdmin = user?.role === "super_admin";\n\n  return (',
    '}) {\n  return ('
p=admin_content
old_link = '''{isSuperAdmin && (
            <Link href="/admin/database" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all flex items-center gap-2">
              <span className="text-lg">ðŸ”BE</span> Database
            </Link>
          )}'''
new_link = '''          <Link href="/admin/database" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all flex items-center gap-2">
              <span className="text-lg">ðŸ”BE</span> Database
            </Link>'''
admin_content = admin_content.replace(old_link, new_link)


old_profile = '''<div className="text-sm font-bold">{loading ? "Loading..." : user?.name || "Admin User"}</div>
              <div className="text-[10px] text-secondary font-bold uppercase">{loading ? "..." : (user?.role?.replace("_", " ") || "Admin")}</div>'''
new_profile = '''<div className="text-sm font-bold">Admin User</div>
              <div className="text-[10px] text-secondary font-bold uppercase">Super Admin</div>'''
admin_content = admin_content.replace(old_profile, new_profile)


with open(admin_path, 'w') as f:
    f.write(admin_content)

print('Reverted.')

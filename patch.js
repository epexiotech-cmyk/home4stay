const fs = require('fs');

// Patch DatabaseExplorerPage
const dbPath = '\\\\wsl.localhost\\Ubuntu\\home\\apurv_patel\\home4stay\\apps\\main-site\\src\\app\\(portal)\\admin\\database\\page.tsx';
let dbPage = fs.readFileSync(dbPath, 'utf8');

if (!dbPage.includes('useAuth')) {
    dbPage = dbPage.replace(
        'import { useRouter } from \"next/navigation\";',
        'import { useRouter } from \"next/navigation\";\nimport { useAuth } from \"@/context/AuthContext\";'
    );
    dbPage = dbPage.replace(
        'const router = useRouter();',
        'const router = useRouter();\n  const { user, loading } = useAuth();'
    );
    dbPage = dbPage.replace(
        'useEffect(() => {\n    // eslint-disable-next-line react-hooks/set-state-in-effect\n    fetchModels();\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);',
        'useEffect(() => {\n    if (loading) return;\n    if (!user || user.role !== \"super_admin\") {\n      router.push(\"/login\");\n      return;\n    }\n    // eslint-disable-next-line react-hooks/set-state-in-effect\n    fetchModels();\n    // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, [loading, user, router]);'
    );
    fs.writeFileSync(dbPath, dbPage);
    console.log('Patched page.tsx');
}

// Patch AdminLayout
const adminPath = '\\\\wsl.localhost\\Ubuntu\\home\\apurv_patel\\home4stay\\apps\\main-site\\src\\components\\layouts\\AdminLayout.tsx';
let adminLayout = fs.readFileSync(adminPath, 'utf8');

if (!adminLayout.includes('useAuth')) {
    adminLayout = adminLayout.replace(
        'import Logo from \"../ui/Logo\";',
        'import Logo from \"../ui/Logo\";\nimport { useAuth } from \"@/context/AuthContext\";'
    );
    adminLayout = adminLayout.replace(
        '}) {\n  return (',
        '}) {\n  const { user, loading } = useAuth();\n  const isSuperAdmin = user?.role === \"super_admin\";\n\n  return ('
    );
    
    const origLink = '<Link href=\"/admin/database\" className=\"block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all flex items-center gap-2\">\n              <span className=\"text-lg\">???</span> Database\n            </Link>';
    const newLink = '{isSuperAdmin && (\n            <Link href=\"/admin/database\" className=\"block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all flex items-center gap-2\">\n              <span className=\"text-lg\">???</span> Database\n            </Link>\n          )}';
    adminLayout = adminLayout.replace(origLink, newLink);

    const origProfile = '<div className=\"text-sm font-bold\">Admin User</div>\n              <div className=\"text-[10px] text-secondary font-bold uppercase\">Super Admin</div>';
    const newProfile = '<div className=\"text-sm font-bold\">{loading ? \"Loading...\" : user?.name || \"Admin User\"}</div>\n              <div className=\"text-[10px] text-secondary font-bold uppercase\">{loading ? \"...\" : (user?.role?.replace(\"_\", \" \") || \"Admin\")}</div>';
    adminLayout = adminLayout.replace(origProfile, newProfile);
    
    fs.writeFileSync(adminPath, adminLayout);
    console.log('Patched AdminLayout.tsx');
}

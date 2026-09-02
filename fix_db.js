const fs = require("fs");
const dbPath = "apps/main-site/src/app/(portal)/admin/database/page.tsx";
let c = fs.readFileSync(dbPath, "utf8");

c = c.replace(
  'import { useRouter } from "next/navigation";\nimport { useAuth } from "@/context/AuthContext";',
  'import { useRouter } from "next/navigation";'
);

c = c.replace(
  'const router = useRouter();\n  const { user, loading } = useAuth();',
  'const router = useRouter();'
);

const oldEff = `  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "super_admin") {
      router.push("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, router]);`;

const newEff = `  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);`;

c = c.replace(oldEff, newEff);
fs.writeFileSync(dbPath, c);

const adminPath = "apps/main-site/src/components/layouts/AdminLayout.tsx";
let a = fs.readFileSync(adminPath, "utf8");

a = a.replace(
  'import Logo from "../ui/Logo";\nimport { useAuth } from "@/context/AuthContext";',
  'import Logo from "../ui/Logo";'
);

a = a.replace(
  '}) {\n  const { user, loading } = useAuth();\n  const isSuperAdmin = user?.role === "super_admin";\n\n  return (',
  '}) {\n  return ('
);

const oldLink = `{isSuperAdmin && (
            <Link href="/admin/database" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all flex items-center gap-2">
              <span className="text-lg">🗄️</span> Database
            </Link>
          )}`;

const newLink = `          <Link href="/admin/database" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all flex items-center gap-2">
              <span className="text-lg">🗄️</span> Database
            </Link>`;

a = a.replace(oldLink, newLink);

const oldProf = `<div className="text-sm font-bold">{loading ? "Loading..." : user?.name || "Admin User"}</div>
              <div className="text-[10px] text-secondary font-bold uppercase">{loading ? "..." : (user?.role?.replace("_", " ") || "Admin")}</div>`;

const newProf = `<div className="text-sm font-bold">Admin User</div>
              <div className="text-[10px] text-secondary font-bold uppercase">Super Admin</div>`;

a = a.replace(oldProf, newProf);
fs.writeFileSync(adminPath, a);
console.log("Reverted!");

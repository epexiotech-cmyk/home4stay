"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear cookie
    document.cookie = "admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest"
    >
      Sign Out
    </button>
  );
}

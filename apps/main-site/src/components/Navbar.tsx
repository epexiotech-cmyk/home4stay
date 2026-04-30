"use client";

import Logo from "./ui/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface shadow-sm transition-all duration-300">
      <nav className="mx-auto flex h-16 max-w-full items-center justify-between px-6">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity duration-300">
          <Logo variant="full" size="md" link={false} className="hidden sm:flex" />
          <Logo variant="icon" size="md" link={false} className="flex sm:hidden" />
        </Link>
        <div className="flex items-center gap-8">
          <Link
            href="/explore"
            className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
              pathname === "/explore"
                ? "text-primary border-b-2 border-accent"
                : "text-secondary"
            }`}
          >
            Explore
          </Link>
          <Link
            href="/partner"
            className={`text-sm font-medium transition-all duration-200 hover:text-primary ${
              pathname === "/partner"
                ? "text-primary border-b-2 border-accent"
                : "text-secondary"
            }`}
          >
            List Property
          </Link>

          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-border"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-primary">Hi, {user.name.split(" ")[0]}</span>
              <button 
                onClick={logout}
                className="btn btn-outline px-4 py-1.5 text-xs rounded-full border-danger text-danger hover:bg-danger hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth/login">
              <button className="btn btn-secondary px-5 py-2 text-sm rounded-full">
                Login
              </button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

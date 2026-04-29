"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900">
          Home4Stay
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/explore"
            className={`text-sm font-medium transition-colors duration-200 ${
              pathname === "/explore"
                ? "text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Explore
          </Link>
          <Link
            href="/partner"
            className={`text-sm font-medium transition-colors duration-200 ${
              pathname === "/partner"
                ? "text-zinc-900"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            List Property
          </Link>
        </div>
      </nav>
    </header>
  );
}

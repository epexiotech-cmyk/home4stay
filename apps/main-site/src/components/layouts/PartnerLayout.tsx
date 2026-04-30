import React from "react";
import Link from "next/link";
import Logo from "../ui/Logo";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar Placeholder */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-surface hidden md:flex flex-col">
        <div className="p-6 border-b border-border">
          <Logo variant="full" size="sm" />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <div className="text-xs font-bold text-secondary uppercase tracking-widest px-2 mb-4">
            Partner Portal
          </div>
          <Link href="/partner/dashboard" className="block px-4 py-2 rounded-lg hover:bg-background text-primary font-medium transition-colors">
            Dashboard
          </Link>
          <Link href="/partner/login" className="block px-4 py-2 rounded-lg hover:bg-background text-secondary transition-colors">
            Login Page
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
              P
            </div>
            <div className="text-sm font-medium text-primary">Partner User</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Topbar Placeholder */}
        <header className="h-16 border-b border-border bg-surface sticky top-0 z-30 flex items-center justify-between px-8">
          <div className="text-sm font-medium text-secondary">
            Welcome back, Partner
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-lg hover:bg-background transition-colors text-secondary">
              🔔
            </button>
            <button className="btn btn-outline px-4 py-1.5 text-sm rounded-lg">
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

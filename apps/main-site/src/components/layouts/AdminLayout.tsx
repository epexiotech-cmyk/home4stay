import React from "react";
import Link from "next/link";
import Logo from "../ui/Logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background text-primary">
      {/* Admin Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-surface hidden md:flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <Logo variant="icon" size="sm" />
          <span className="font-bold text-lg tracking-tight">Admin<span className="text-accent">Panel</span></span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs font-bold text-secondary uppercase tracking-widest px-2 py-4">
            Management
          </div>
          <Link href="/admin/dashboard" className="block px-4 py-2.5 rounded-xl hover:bg-background text-primary font-semibold transition-all">
            Dashboard
          </Link>
          <Link href="/admin/leads" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all">
            Leads
          </Link>
          <Link href="/admin/properties" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all">
            Properties
          </Link>
          <Link href="/super-admin/referrals" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all">
            Referrals
          </Link>
          <div className="text-xs font-bold text-secondary uppercase tracking-widest px-2 py-4 mt-4">
            System
          </div>
          <Link href="/login" className="block px-4 py-2.5 rounded-xl hover:bg-background text-secondary transition-all">
            Admin Login
          </Link>
        </nav>
        <div className="p-4 border-t border-border bg-surface-alt">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold shadow-lg">
              A
            </div>
            <div>
              <div className="text-sm font-bold">Admin User</div>
              <div className="text-[10px] text-secondary font-bold uppercase">Super Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Admin Topbar */}
        <header className="h-16 border-b border-border bg-surface sticky top-0 z-30 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse"></div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">System Online</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
              <button className="text-secondary hover:text-primary transition-colors">
                🔔
              </button>
            </div>
            <button className="btn btn-primary px-5 py-2 text-sm rounded-xl font-bold">
              Sign Out
            </button>
          </div>
        </header>

        {/* Admin Content */}
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}

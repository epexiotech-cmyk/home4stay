"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  Users, 
  Star, 
  Home, 
  Bed, 
  Utensils, 
  Tag, 
  Clock, 
  Sparkles,
  DollarSign, 
  FileText, 
  BarChart3, 
  ShieldCheck, 
  Settings, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  MessageSquare,
  Plus,
  Menu,
  X,
  ChevronDown,
  LogOut,
  User,
  Shield,
  CreditCard as BillingIcon,
  Layers,
  LucideIcon,
  Gift
} from "lucide-react";
import Logo from "../ui/Logo";
import { cn } from "@/lib/utils";
import ThemeSwitcher from "../ThemeSwitcher";
import { useAuth } from "@/context/AuthContext";
import { LegalWall } from "../portal/LegalWall";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const sidebarSections: NavSection[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", href: "/partner/dashboard", icon: LayoutDashboard },
      { title: "Calendar", href: "/partner/calendar", icon: Calendar },
      { title: "Bookings", href: "/partner/bookings", icon: ClipboardList },
      { title: "Guests", href: "/partner/guests", icon: Users },
      { title: "Reviews", href: "/partner/reviews", icon: Star },
    ]
  },
  {
    label: "Property Management",
    items: [
      { title: "My Property", href: "/partner/properties", icon: Home },
      { title: "Rooms", href: "/partner/rooms", icon: Bed },
      { title: "Meal Plans", href: "/partner/meal-plans", icon: Utensils },
      { title: "Hospitality Experiences", href: "/partner/experiences", icon: Sparkles },
    ]
  },
  {
    label: "Financials",
    items: [
      { title: "Revenue", href: "/partner/revenue", icon: DollarSign },
      { title: "Invoices", href: "/partner/invoices", icon: FileText },
      { title: "Reports", href: "/partner/reports", icon: BarChart3 },
      { title: "Referrals & Rewards", href: "/partner/dashboard/referrals", icon: Gift },
    ]
  },
  {
    label: "System",
    items: [
      { title: "Staff Access", href: "/partner/staff", icon: ShieldCheck },
      { title: "Property Page CMS", href: "/partner/property-page-cms", icon: Layers },
      { title: "Settings", href: "/partner/settings", icon: Settings },
      { title: "Subscription", href: "/partner/subscription", icon: CreditCard },
    ]
  }
];

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change using the render-phase state update pattern
  // This avoids cascading renders and satisfies the linter
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  const { user, loading, logout: authLogout } = useAuth();

  useEffect(() => {
    if (!loading && user && ["owner", "manager", "partner"].includes(user.role)) {
      const status = (user as any).onboardingStatus;
      const isOnboardingComplete = status === "COMPLETED" || status === "LIVE";
      console.log("[PartnerLayout] user.onboardingStatus:", status, "pathname:", pathname, "bounce:", !isOnboardingComplete);
      if (!isOnboardingComplete && !pathname.startsWith("/partner/onboarding")) {
        router.push("/partner/onboarding");
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return null;
  }

  if (user && ["owner", "manager", "partner"].includes(user.role)) {
    const status = (user as any).onboardingStatus;
    const isOnboardingComplete = status === "COMPLETED" || status === "LIVE";
      console.log("[PartnerLayout] user.onboardingStatus:", status, "pathname:", pathname, "bounce:", !isOnboardingComplete);
    if (!isOnboardingComplete && !pathname.startsWith("/partner/onboarding")) {
      return null;
    }
  }

  const handleLogout = () => {
    authLogout();
  };

  // Profile initial
  const displayName = user?.propertyName || user?.name || "Guest";
  const userInitials = user?.propertyName 
    ? user.propertyName.charAt(0).toUpperCase() 
    : user?.name 
      ? user.name.split(" ").map(n => n[0]).join("").toUpperCase() 
      : "??";

  return (
    <div className="flex min-h-screen luxury-gradient text-[#0E5A75] dark:text-[#FDF6F1] font-sans selection:bg-[#0983B0]/10 selection:text-[#0983B0] transition-colors duration-500">
      <LegalWall />
      {/* Sidebar - Desktop */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 hidden md:flex flex-col transition-all duration-500 ease-in-out",
          isSidebarCollapsed ? "w-[100px]" : "w-[300px]"
        )}
      >
        <div className="flex flex-col h-[calc(100vh-32px)] m-4 sidebar-premium rounded-[32px] shadow-2xl overflow-hidden relative">
          {/* Sidebar Header */}
          <div className="p-8 flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                <Logo variant="full" size="sm" className="" />
              </div>
            )}
            {isSidebarCollapsed && (
              <div className="mx-auto animate-in fade-in zoom-in duration-700">
                <Logo variant="icon" size="sm" className="" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
            {sidebarSections.map((section, idx) => (
              <div key={section.label} className={cn("mb-8", idx === 0 ? "mt-2" : "mt-10")}>
                {!isSidebarCollapsed && (
                  <h3 className="px-4 text-[10px] font-bold text-[#0E5A75] dark:text-[#78D145] uppercase tracking-[0.2em] mb-4">
                    {section.label}
                  </h3>
                )}
                <div className="space-y-1.5">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative",
                          isActive 
                            ? "bg-[#0E5A75] text-white shadow-lg shadow-[#0E5A75]/20" 
                            : "hover:bg-[#0E5A75]/5 text-[#0E5A75] dark:text-[#0983B0] hover:text-[#0E5A75] dark:hover:text-white"
                        )}
                      >
                        <Icon size={20} className={cn("transition-transform duration-300 group-hover:scale-110", isSidebarCollapsed && "mx-auto")} />
                        {!isSidebarCollapsed && (
                          <span className="text-[13px] font-bold tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">
                            {item.title}
                          </span>
                        )}
                        {isActive && (
                          <div className="absolute left-0 w-1 h-6 bg-white dark:bg-[#78D145] rounded-r-full animate-in slide-in-from-left duration-500" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer - Profile Card */}
          <div className="p-6 mt-auto border-t border-[#0E5A75]/10 dark:border-white/5 bg-[#0E5A75]/5 dark:bg-white/5 backdrop-blur-md">
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-2xl transition-all duration-300",
              isSidebarCollapsed ? "justify-center" : "bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 border border-[#0E5A75]/10 dark:border-white/5 cursor-pointer"
            )}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-bold shadow-lg ring-2 ring-[#0E5A75]/10">
                {userInitials}
              </div>
              {!isSidebarCollapsed && (
                <div className="flex-1 min-w-0 animate-in fade-in duration-500">
                  <p className="text-[13px] font-black truncate text-[#0E5A75] dark:text-white">{displayName}</p>
                  <p className="text-[10px] text-[#0E5A75] dark:text-[#0983B0] truncate uppercase tracking-widest font-bold">{user?.role === 'owner' ? 'Property Owner' : 'Partner Manager'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Collapse Toggle */}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-24 w-8 h-8 bg-white dark:bg-[#0E5A75] border border-[#0E5A75]/20 dark:border-white/10 rounded-full flex items-center justify-center shadow-xl hover:bg-[#0E5A75] hover:text-white transition-all duration-300 z-[60] scale-90"
          >
            {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-700 ease-in-out min-w-0",
        isSidebarCollapsed ? "md:ml-[100px]" : "md:ml-[300px]"
      )}>
        {/* Top Navbar - Floating Glass */}
        <header className={cn(
          "h-24 sticky top-0 z-40 flex items-center justify-center px-4 md:px-8 transition-all duration-500",
          isScrolled ? "pt-4" : "pt-0"
        )}>
          <div className={cn(
            "w-full h-16 flex items-center justify-between px-6 rounded-3xl transition-all duration-500",
            pathname.startsWith("/partner/onboarding") ? "w-full" : "max-w-7xl",
            isScrolled 
              ? "glass-premium shadow-2xl border border-white/40 dark:border-white/10" 
              : "bg-transparent"
          )}>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2.5 rounded-2xl glass-premium shadow-sm"
              >
                <Menu size={20} />
              </button>
              
              {/* Page Identity */}
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-[#0E5A75] dark:text-white tracking-tight capitalize">
                  {pathname.split("/").pop()?.replace("-", " ")}
                </h1>
                <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-[#0E5A75] dark:text-[#78D145] uppercase tracking-widest">
                  <span>Portal</span>
                  <div className="w-1 h-1 rounded-full bg-[#0E5A75]/30" />
                  <span>{pathname.split("/").pop()?.replace("-", " ")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-6">
              {/* Property Switcher */}
              <div className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-[#0E5A75]/10 dark:border-white/10 shadow-sm hover:border-[#0E5A75] transition-all duration-300 cursor-pointer group">
                <div className="w-8 h-8 rounded-xl bg-[#0E5A75]/10 flex items-center justify-center group-hover:bg-[#0E5A75] group-hover:text-white transition-colors duration-300">
                  <Home size={16} className="text-[#0E5A75] group-hover:text-white transition-colors" />
                </div>
                <div className="flex flex-col">
                  <p className="text-[12px] font-bold truncate max-w-[150px] text-[#0E5A75] dark:text-white">{user?.role === 'owner' ? 'Your Property' : 'Property Portal'}</p>
                  <p className="text-[9px] font-bold text-[#29655C] dark:text-[#0983B0] uppercase tracking-tighter">{user?.role === 'owner' ? 'Managed Property' : 'Admin View'}</p>
                </div>
                <ChevronDown size={14} className="text-[#0983B0] group-hover:text-[#0E5A75] transition-colors" />
              </div>

              {/* Action Hub */}
              <div className="flex items-center gap-1">
                <button className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all duration-300 relative text-[#0E5A75] dark:text-[#0983B0] shadow-sm border border-transparent hover:border-[#0E5A75]/10 hover:shadow-md">
                  <Search size={20} />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all duration-300 relative text-[#0E5A75] dark:text-[#0983B0] shadow-sm border border-transparent hover:border-[#0E5A75]/10 hover:shadow-md">
                  <MessageSquare size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#F24633] border-2 border-white dark:border-[#0E5A75]" />
                </button>
                <button className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-white/10 transition-all duration-300 relative text-[#0E5A75] dark:text-[#0983B0] shadow-sm border border-transparent hover:border-[#0E5A75]/10 hover:shadow-md">
                  <Bell size={20} />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#0E5A75] border-2 border-white dark:border-[#0E5A75]" />
                </button>
              </div>

              {/* User Identity Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <div 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-2xl border-2 border-white dark:border-[#0E5A75] shadow-lg cursor-pointer overflow-hidden hover:scale-105 transition-all duration-300 ring-2 ring-[#0E5A75]/5 hover:ring-[#0E5A75]/20 active:scale-95"
                >
                  <div className="w-full h-full bg-white dark:bg-[#0E5A75] flex items-center justify-center text-[#0E5A75] dark:text-white">
                    <User size={20} />
                  </div>
                </div>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 w-72 glass-premium rounded-[32px] shadow-2xl border border-white/60 dark:border-white/10 p-4 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 origin-top-right z-50">
                    <div className="flex items-center gap-4 p-3 mb-2 rounded-2xl bg-[#0E5A75]/5 dark:bg-white/5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {userInitials}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#0E5A75] dark:text-white leading-tight">{displayName}</p>
                        <p className="text-[10px] font-bold text-[#29655C] dark:text-[#0983B0] uppercase tracking-widest leading-tight mt-1">{user?.email}</p>
                      </div>
                    </div>
                    <div className="h-px bg-[#0E5A75]/5 dark:bg-white/5 my-3 mx-2" />
                    <ThemeSwitcher />
                    <div className="h-px bg-[#0E5A75]/5 dark:bg-white/5 my-3 mx-2" />
                    <div className="space-y-1">
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#0E5A75] dark:text-[#FDF6F1] hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-all group text-left">
                        <Settings size={18} className="text-[#0983B0] group-hover:text-[#0E5A75] transition-colors" />
                        <span>Account Settings</span>
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#0E5A75] dark:text-[#FDF6F1] hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-all group text-left">
                        <Shield size={18} className="text-[#0983B0] group-hover:text-[#0E5A75] transition-colors" />
                        <span>Security & Access</span>
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          router.push("/partner/dashboard/billing");
                        }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#0E5A75] dark:text-[#FDF6F1] hover:bg-[#0E5A75]/5 dark:hover:bg-white/5 transition-all group text-left"
                      >
                        <BillingIcon size={18} className="text-[#0983B0] group-hover:text-[#0E5A75] transition-colors" />
                        <span>Billing & Plan</span>
                      </button>
                    </div>
                    <div className="h-px bg-[#0E5A75]/5 dark:bg-white/5 my-3 mx-2" />
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[13px] font-black text-[#F24633] hover:bg-[#F24633]/5 dark:hover:bg-[#F24633]/10 transition-all group">
                      <LogOut size={18} className="transition-transform group-hover:translate-x-1" />
                      <span className="uppercase tracking-widest">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden pt-4">
          <div className={cn(
            "mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out text-[#0E5A75] dark:text-white",
            pathname.startsWith("/partner/onboarding") ? "w-full" : "max-w-7xl"
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-[#0E5A75]/40 backdrop-blur-sm z-[100] md:hidden transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 w-[280px] z-[110] md:hidden transition-transform duration-500 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full bg-white dark:bg-[#0b1220] shadow-2xl relative">
          <div className="p-8 flex items-center justify-between border-b border-[#0E5A75]/5">
            <Logo variant="full" size="sm" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75]"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarSections.map((section) => (
              <div key={section.label} className="mb-6">
                <h3 className="px-4 text-[10px] font-bold text-[#0E5A75] dark:text-[#78D145] uppercase tracking-widest mb-3 opacity-60">
                  {section.label}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                          isActive 
                            ? "bg-[#0E5A75] text-white" 
                            : "text-[#0E5A75] dark:text-[#0983B0] hover:bg-[#0E5A75]/5"
                        )}
                      >
                        <Icon size={20} />
                        <span className="text-sm font-bold">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Floating Concierge Action Hub */}
      {!pathname.startsWith("/partner/onboarding") && (
        <button 
          onClick={() => setIsConciergeOpen(true)}
          className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-[80] group gpu-accelerated"
        >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0E5A75]/40 to-[#0983B0]/20 blur-2xl rounded-full group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
        <div className="relative flex items-center gap-3 bg-[#0E5A75] hover:bg-[#0A4459] text-white px-8 py-4.5 rounded-[24px] shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-95 border border-white/10">
          <Plus size={20} className="transition-transform duration-500 group-hover:rotate-90" />
          <span className="font-black text-xs uppercase tracking-[0.2em]">Concierge Action</span>
        </div>
      </button>
      )}

      {/* Concierge Action Hub Modal */}
      {isConciergeOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#053344]/40 backdrop-blur-md animate-in fade-in duration-500"
            onClick={() => setIsConciergeOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1D] rounded-[48px] shadow-luxury overflow-hidden animate-in zoom-in-95 duration-500 border border-white/10">
            <div className="p-10 flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-black text-[#053344] dark:text-white leading-none">Concierge Hub</h2>
                  <p className="text-sm font-bold text-[#0E5A75]/60 mt-2 tracking-wide">Quick hospitality management actions</p>
                </div>
                <button 
                  onClick={() => setIsConciergeOpen(false)}
                  className="p-4 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ConciergeTile 
                  icon={Plus} 
                  title="New Booking" 
                  desc="Create a direct reservation" 
                  color="bg-[#159665]" 
                  onClick={() => {
                    setIsConciergeOpen(false);
                    if (pathname === '/partner/calendar') {
                      window.dispatchEvent(new CustomEvent("open-quick-booking"));
                    } else {
                      router.push('/partner/calendar');
                      // Delay slightly to allow page load before opening modal
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent("open-quick-booking"));
                      }, 500);
                    }
                  }}
                />
                <ConciergeTile 
                  icon={ClipboardList} 
                  title="Check-ins" 
                  desc="Manage today's arrivals" 
                  color="bg-[#0983B0]" 
                  onClick={() => {
                    setIsConciergeOpen(false);
                    router.push('/partner/calendar');
                  }}
                />
                <ConciergeTile 
                  icon={Star} 
                  title="Reviews" 
                  desc="Respond to guest feedback" 
                  color="bg-[#FCBC43]" 
                  onClick={() => {
                    setIsConciergeOpen(false);
                    router.push('/partner/reviews');
                  }}
                />
                <ConciergeTile 
                  icon={Settings} 
                  title="Property Settings" 
                  desc="Update configurations" 
                  color="bg-[#0E5A75]" 
                  onClick={() => {
                    setIsConciergeOpen(false);
                    router.push('/partner/settings');
                  }}
                />
              </div>
            </div>
            <div className="px-10 py-6 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5 flex justify-between items-center">
              <span className="text-[10px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">Master Concierge v1.0</span>
              <button className="text-[10px] font-black text-[#0E5A75] uppercase tracking-widest hover:underline">Support Center</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ConciergeTileProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  onClick: () => void;
}

function ConciergeTile({ icon: Icon, title, desc, color, onClick }: ConciergeTileProps) {
  return (
    <button 
      onClick={onClick}
      className="group p-6 rounded-[32px] bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-[#0E5A75]/30 shadow-sm hover:shadow-xl transition-all duration-500 text-left relative overflow-hidden"
    >
      <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-150 transition-all duration-700", color)} />
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform duration-500", color)}>
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-black text-[#053344] dark:text-white leading-tight">{title}</h3>
      <p className="text-xs font-bold text-[#0E5A75]/60 mt-1">{desc}</p>
    </button>
  );
}

"use client";

import Logo from "./ui/Logo";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import OptimizedImage from "./OptimizedImage";
import { Globe, Menu, UserCircle } from "lucide-react";
import SearchBar from "./SearchBar";
import ThemeSwitcher from "./ThemeSwitcher";
import { getMainDomainUrl } from "@/lib/utils/domains";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let ticking = false;
    const SCROLL_THRESHOLD_DOWN = 80;
    const SCROLL_THRESHOLD_UP = 40;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > SCROLL_THRESHOLD_DOWN && !isScrolled) {
        setIsScrolled(true);
      } else if (scrollY < SCROLL_THRESHOLD_UP && isScrolled) {
        setIsScrolled(false);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isScrolled]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-[95vw] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isScrolled ? "top-4 scale-[0.98]" : "top-6 scale-100"
        }`}
    >
      <div className={`relative px-6 md:px-10 rounded-[2.5rem] border border-white/20 bg-[var(--card)] backdrop-blur-xl transition-all duration-500 ${isScrolled ? "shadow-[0_20px_50px_rgba(0,0,0,0.12)] bg-[var(--card)] py-2" : "shadow-[0_8px_32px_rgba(0,0,0,0.1)] py-4"
        }`}>
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex-1">
            <Link href="/" className="inline-block transition-transform hover:opacity-90">
              <Logo variant="full" size="md" link={false} className="hidden lg:flex" />
              <Logo variant="icon" size="md" link={false} className="flex lg:hidden" />
            </Link>
          </div>

          {/* Center: Navigation Tabs (Only shown when not scrolled or on mobile) */}
          <div className={`hidden md:flex items-center gap-8 transition-all duration-300 ${isScrolled ? "opacity-0 pointer-events-none scale-90" : "opacity-100"
            }`}>
            <button className="flex items-center gap-3 text-sm font-bold text-[var(--text)] hover:text-[var(--text-muted)] transition-colors py-2 relative group">
              <span className="text-3xl -translate-y-1 transition-transform duration-300 jiggle-on-hover">🏡</span>
              <span>Homes</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--text)] rounded-full scale-x-100 origin-left transition-transform" />
            </button>
            <button className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors py-2 group relative">
              <span className="text-3xl opacity-80 group-hover:opacity-100 transition-all duration-300 -translate-y-1 jiggle-on-hover">🏔️</span>
              <div className="relative">
                <span className="absolute -top-5 left-0 bg-[#4A69BD] text-[7px] text-white px-1 py-0.5 rounded-sm shadow-sm font-bold leading-none">NEW</span>
                <span>Experiences</span>
              </div>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-full scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>
            <button className="flex items-center gap-3 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors py-2 group relative">
              <span className="text-3xl opacity-80 group-hover:opacity-100 transition-all duration-300 -translate-y-1 jiggle-on-hover">🛎️</span>
              <div className="relative">
                <span className="absolute -top-5 left-0 bg-[#4A69BD] text-[7px] text-white px-1 py-0.5 rounded-sm shadow-sm font-bold leading-none">NEW</span>
                <span>Services</span>
              </div>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-full scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
            <Link
              href="/partner"
              className="hidden lg:block text-sm font-bold text-[var(--text)] hover:bg-[var(--text)]/5 px-4 py-3 rounded-full transition-all"
            >
              Become a host
            </Link>

            <button className="p-3 text-[var(--text)] hover:bg-[var(--text)]/5 rounded-full transition-all hidden sm:block">
              <Globe size={18} strokeWidth={2.5} />
            </button>

            {/* Profile Menu Button */}
            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pl-3 border border-[var(--border)] rounded-full hover:shadow-md transition-all duration-300 bg-[var(--bg)]"
              >
                <Menu size={18} className="text-[var(--text-subtle)]" />
                <div className="h-8 w-8 rounded-full bg-[var(--text-subtle)]/20 text-[var(--text)] flex items-center justify-center overflow-hidden border border-[var(--border)]">
                  {loading ? (
                    <div className="w-full h-full animate-pulse bg-gray-300" />
                  ) : user ? (
                    user.image_url && !imageError ? (
                      <OptimizedImage
                        src={user.image_url}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        sizes="32px"
                      />
                    ) : (
                      <span className="text-[10px] font-bold">{getInitials(user.name)}</span>
                    )
                  ) : (
                    <UserCircle size={24} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Profile Dropdown */}
              <div
                ref={dropdownRef}
                className={`absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-white/20 bg-[var(--bg)] backdrop-blur-xl shadow-2xl transition-all duration-300 py-2 z-[100] overflow-hidden ${isProfileOpen
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                  }`}
              >
                {user ? (
                  <>
                    <div className="px-4 py-3">
                      <p className="text-sm font-bold text-[var(--text)]">{user.name}</p>
                      <p className="text-xs text-[var(--text-subtle)] truncate">{user.email}</p>
                    </div>
                    <hr className="border-[var(--border)]" />
                    <ThemeSwitcher />
                    <hr className="border-[var(--border)]" />
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-black/5">Profile</Link>
                      <Link href="/profile/edit" className="block px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-black/5">Settings</Link>
                    </div>
                    <hr className="border-[var(--border)]" />
                    <button
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="py-2">
                    <a href={getMainDomainUrl("/auth/login")} className="block px-4 py-2.5 text-sm font-bold text-[var(--text)] hover:bg-black/5">Login</a>
                    <a href={getMainDomainUrl("/auth/register")} className="block px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-black/5">Sign Up</a>
                    <hr className="border-white/10 my-2" />
                    <ThemeSwitcher />
                    <hr className="border-white/10 my-2" />
                    <Link href="/partner" className="block px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-black/5">Host your home</Link>
                    <Link href="/explore" className="block px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-black/5">Help Center</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Integration */}
        <div className={`transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] origin-top ${isScrolled
          ? "opacity-100 -translate-y-[3.5rem] scale-[0.82] h-0 overflow-visible"
          : "opacity-100 translate-y-2 scale-100 mt-4 h-auto"
          }`}>
          <SearchBar isScrolled={isScrolled} />
        </div>
      </div>
    </header>
  );
}

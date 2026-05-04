"use client";

import Logo from "./ui/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Globe, Menu, UserCircle, Search } from "lucide-react";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Airbnb transition happens around 20-50px
      setIsScrolled(window.scrollY > 40);
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

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isHome = pathname === "/";

  return (
    <header
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-[95vw] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${isScrolled ? "top-4 scale-[0.98]" : "top-6 scale-100"
        }`}
    >
      <div className={`relative px-6 md:px-10 py-4 rounded-[2.5rem] border border-white/20 bg-white/80 backdrop-blur-xl transition-all duration-500 overflow-hidden ${isScrolled ? "shadow-[0_20px_50px_rgba(0,0,0,0.12)] bg-white/90" : "shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
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
            <button className="flex items-center gap-3 text-sm font-bold text-gray-800 hover:text-gray-500 transition-colors py-2 relative group">
              <span className="text-3xl -translate-y-1 transition-transform duration-300 jiggle-on-hover">🏡</span>
              <span>Homes</span>
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 rounded-full scale-x-100 origin-left transition-transform" />
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
              className="hidden lg:block text-sm font-bold text-gray-800 hover:bg-gray-100 px-4 py-3 rounded-full transition-all"
            >
              Become a host
            </Link>

            <button className="p-3 text-gray-800 hover:bg-gray-100 rounded-full transition-all hidden sm:block">
              <Globe size={18} strokeWidth={2.5} />
            </button>

            {/* Profile Menu Button */}
            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pl-3 border border-gray-200 rounded-full hover:shadow-md transition-all duration-300 bg-white"
              >
                <Menu size={18} className="text-gray-600" />
                <div className="h-8 w-8 rounded-full bg-gray-500 text-white flex items-center justify-center overflow-hidden border border-gray-200">
                  {loading ? (
                    <div className="w-full h-full animate-pulse bg-gray-300" />
                  ) : user ? (
                    user.image_url && !imageError ? (
                      <Image
                        src={user.image_url}
                        alt={user.name}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
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
                className={`absolute right-0 mt-3 w-60 origin-top-right rounded-2xl border border-gray-100 bg-white shadow-2xl transition-all duration-300 py-2 z-[60] ${isProfileOpen
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                  }`}
              >
                {user ? (
                  <>
                    <div className="px-4 py-3">
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <hr className="border-gray-50" />
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Profile</Link>
                      <Link href="/profile/edit" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Settings</Link>
                    </div>
                    <hr className="border-gray-50" />
                    <button
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-gray-50"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="py-2">
                    <Link href="/auth/login" className="block px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-gray-50">Login</Link>
                    <Link href="/auth/register" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Sign Up</Link>
                    <hr className="border-gray-50 my-2" />
                    <Link href="/partner" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Host your home</Link>
                    <Link href="/explore" className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Help Center</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Integration (Only shown when scrolled or is home) */}
        <div className={`transition-all duration-500 origin-top overflow-hidden ${isScrolled
          ? "max-h-0 opacity-0 -translate-y-12"
          : "max-h-[100px] opacity-100 translate-y-0"
          }`}>
          <SearchBar isScrolled={isScrolled} />
        </div>

        {/* Minimized Search Bar (Only shown when scrolled) */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 transition-all duration-500 ${isScrolled ? "opacity-100 scale-100 -translate-y-1/2" : "opacity-0 scale-90 translate-y-4 pointer-events-none"
          }`}>
          <div className="flex items-center gap-4 bg-white border border-gray-200 shadow-md hover:shadow-lg rounded-full px-6 py-2.5 cursor-pointer min-w-[320px]">
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap border-r border-gray-200 pr-4">Anywhere</span>
            <span className="text-sm font-bold text-gray-900 whitespace-nowrap border-r border-gray-200 pr-4">Any week</span>
            <span className="text-sm font-medium text-gray-400 whitespace-nowrap">Add guests</span>
            <div className="bg-primary p-2 rounded-full text-white ml-auto">
              <Search size={12} strokeWidth={4} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

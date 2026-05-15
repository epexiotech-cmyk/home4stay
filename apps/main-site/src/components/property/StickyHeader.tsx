"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Globe, Menu, UserCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import OptimizedImage from "@/components/OptimizedImage";
import { getMainDomainUrl } from "@/lib/utils/domains";

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface StickyHeaderProps {
  name: string;
}

export default function StickyHeader({ name }: StickyHeaderProps) {
  const { user, logout, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileOpen &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  return (
    <header 
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-[95vw] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
        isScrolled ? "top-4 scale-[0.98]" : "top-6 scale-100"
      }`}
    >
      <div className={`relative px-6 md:px-10 py-4 rounded-[2.5rem] border transition-all duration-500 ${
        isScrolled 
          ? "bg-[var(--card)] backdrop-blur-xl border-[var(--border)] shadow-[0_20px_50px_var(--shadow)]" 
          : "bg-white/10 backdrop-blur-md border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl shadow-lg transition-all duration-500 ${
              isScrolled ? "bg-theme-primary text-white scale-90" : "bg-white text-gray-900"
            }`}>
              {name[0]}
            </div>
            <Link href="/" className={`text-2xl font-black tracking-tighter hidden sm:block transition-colors duration-500 ${
              isScrolled ? "text-theme-primary" : "text-white"
            }`}>
              {name}
            </Link>
          </div>

          {/* Branded Navigation */}
          <nav className="hidden lg:flex items-center gap-10">
            {[
              { label: "Home", href: "/" },
              { label: "Rooms", href: "#rooms" },
              { label: "Amenities", href: "#amenities" },
              { label: "Gallery", href: "#gallery" },
              { label: "Contact", href: "#contact" }
            ].map((link, idx) => (
              <Link 
                key={idx} 
                href={link.href} 
                className={`text-sm font-bold transition-all duration-500 hover:text-theme-primary ${
                  isScrolled ? "text-[var(--text-muted)]" : "text-white/80"
                } ${link.label === "Home" && isScrolled ? "text-theme-primary" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button className={`p-2 rounded-full transition-colors duration-500 hidden sm:block ${
              isScrolled ? "hover:bg-theme-primary/5 text-theme-primary" : "hover:bg-white/10 text-white"
            }`}>
              <Globe size={18} />
            </button>
            
            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 p-1.5 pl-3 border rounded-full transition-all duration-500 cursor-pointer ${
                  isScrolled 
                    ? "border-[var(--border)] bg-[var(--bg)] hover:shadow-md" 
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <Menu size={18} className={isScrolled ? "text-theme-primary" : "text-white"} />
                <div className={`h-8 w-8 rounded-full flex items-center justify-center overflow-hidden border transition-all duration-500 ${
                  isScrolled ? "bg-[var(--text-subtle)]/20 border-[var(--border)]" : "bg-white/20 border-white/30"
                }`}>
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
                      <span className={`text-[10px] font-bold ${isScrolled ? "text-[var(--text)]" : "text-white"}`}>
                        {getInitials(user.name)}
                      </span>
                    )
                  ) : (
                    <UserCircle size={24} className={isScrolled ? "text-[var(--text-subtle)]" : "text-white/50"} />
                  )}
                </div>
              </button>

              {/* Profile Dropdown */}
              <div
                ref={dropdownRef}
                className={`absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-[var(--border)] bg-[var(--bg)] backdrop-blur-xl shadow-2xl transition-all duration-300 py-2 z-[60] overflow-hidden ${
                  isProfileOpen
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
                      <Link href="/profile" className="block px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--text)]/5">Profile</Link>
                      <Link href="/profile/edit" className="block px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--text)]/5">Settings</Link>
                    </div>
                    <hr className="border-[var(--border)]" />
                    <button
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="py-2">
                    <a href={getMainDomainUrl("/auth/login")} className="block px-4 py-2.5 text-sm font-bold text-[var(--text)] hover:bg-[var(--text)]/5">Login</a>
                    <a href={getMainDomainUrl("/auth/register")} className="block px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:bg-[var(--text)]/5">Sign Up</a>
                    <hr className="border-[var(--border)] my-2" />
                    <ThemeSwitcher />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

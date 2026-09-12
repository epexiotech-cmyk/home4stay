"use client";

import { DEFAULT_FALLBACK_IMAGE, getValidImageUrl } from "@/lib/utils";
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
      setIsScrolled(window.scrollY > 20);
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
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-[var(--theme-bg)]/90 backdrop-blur-xl border-b border-[var(--border)] shadow-sm py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 lg:px-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className={`text-2xl font-semibold tracking-tight transition-colors duration-500 ${
              isScrolled ? "text-[var(--text)]" : "text-white"
            }`}>
              {name}
            </Link>
          </div>

          {/* Branded Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
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
                className={`text-[13px] font-medium tracking-wide uppercase transition-all duration-300 hover:opacity-100 ${
                  isScrolled ? "text-[var(--text)] opacity-70 hover:text-theme-primary" : "text-white opacity-80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <button className={`transition-colors duration-500 hidden sm:block hover:opacity-100 ${
              isScrolled ? "text-[var(--text)] opacity-70" : "text-white opacity-80"
            }`}>
              <Globe size={18} strokeWidth={1.5} />
            </button>
            
            <div className="relative">
              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 p-1.5 pl-3 border rounded-full transition-all duration-300 cursor-pointer ${
                  isScrolled 
                    ? "border-[var(--border)] bg-[var(--card)] hover:shadow-md" 
                    : "border-white/20 bg-white/10 hover:bg-white/20"
                }`}
              >
                <Menu size={16} strokeWidth={1.5} className={isScrolled ? "text-[var(--text)]" : "text-white"} />
                <div className={`h-7 w-7 rounded-full flex items-center justify-center overflow-hidden transition-all duration-300 ${
                  isScrolled ? "bg-[var(--bg-secondary)]" : "bg-white/20"
                }`}>
                  {loading ? (
                    <div className="w-full h-full animate-pulse bg-gray-300" />
                  ) : user ? (
                    user.image_url && !imageError ? (
                      <OptimizedImage
                        src={getValidImageUrl(user.image_url) || DEFAULT_FALLBACK_IMAGE}
                        alt={user.name}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        sizes="28px"
                      />
                    ) : (
                      <span className={`text-[9px] font-bold ${isScrolled ? "text-[var(--text)]" : "text-white"}`}>
                        {getInitials(user.name)}
                      </span>
                    )
                  ) : (
                    <UserCircle size={20} strokeWidth={1.5} className={isScrolled ? "text-[var(--text-subtle)]" : "text-white/50"} />
                  )}
                </div>
              </button>

              {/* Profile Dropdown */}
              <div
                ref={dropdownRef}
                className={`absolute right-0 mt-3 w-64 origin-top-right rounded-2xl border border-[var(--border)] bg-[var(--bg)] backdrop-blur-xl shadow-xl transition-all duration-300 py-2 z-[60] overflow-hidden ${
                  isProfileOpen
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                }`}
              >
                {user ? (
                  <>
                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold text-[var(--text)]">{user.name}</p>
                      <p className="text-xs text-[var(--text-subtle)] truncate">{user.email}</p>
                    </div>
                    <hr className="border-[var(--border)]" />
                    <ThemeSwitcher />
                    <hr className="border-[var(--border)]" />
                    <div className="py-1">
                      <Link href="/profile" className="block px-4 py-2.5 text-[13px] font-medium text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors">Profile</Link>
                      <Link href="/profile/edit" className="block px-4 py-2.5 text-[13px] font-medium text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors">Settings</Link>
                    </div>
                    <hr className="border-[var(--border)]" />
                    <button
                      onClick={() => { logout(); setIsProfileOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="py-2">
                    <a href={getMainDomainUrl("/login")} className="block px-4 py-2.5 text-[13px] font-semibold text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors">Login</a>
                    <a href={getMainDomainUrl("/register?intent=customer")} className="block px-4 py-2.5 text-[13px] font-medium text-[var(--text)] hover:bg-[var(--bg-secondary)] transition-colors">Sign Up</a>
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

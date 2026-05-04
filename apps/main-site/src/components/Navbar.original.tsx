"use client";

import Logo from "./ui/Logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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

  const [prevUrl, setPrevUrl] = useState(user?.image_url);
  if (user?.image_url !== prevUrl) {
    setPrevUrl(user?.image_url);
    setImageError(false);
  }

  const navLinks = [
    { name: "Explore", href: "/explore" },
    { name: "List Property", href: "/partner" },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header 
      className={`fixed left-1/2 -translate-x-1/2 z-50 w-[90vw] transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
        isScrolled ? "top-8 scale-[0.98]" : "top-4 scale-100"
      }`}
    >
      <nav 
        className={`relative flex items-center justify-between px-6 md:px-8 py-3 rounded-2xl border border-white/20 bg-white/70 backdrop-blur-md transition-all duration-500 ${
          isScrolled ? "shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white/80" : "shadow-[0_8px_32px_rgba(0,0,0,0.1)] bg-white/70"
        }`}
      >
        {/* Left: Logo */}
        <Link href="/" className="flex items-center hover:scale-105 transition-transform duration-300">
          <Logo variant="full" size="md" link={false} className="hidden sm:flex" />
          <Logo variant="icon" size="md" link={false} className="flex sm:hidden" />
        </Link>

        {/* Center/Right: Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-all duration-300 hover:text-primary relative group ${
                pathname === link.href ? "text-primary" : "text-slate-600"
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </Link>
          ))}

          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200"></div>
          ) : user ? (
            <div className="relative">
              <button 
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/50 overflow-hidden"
              >
                {user.image_url && !imageError ? (
                  <Image 
                    src={user.image_url} 
                    alt={user.name} 
                    width={40} 
                    height={40} 
                    className="w-full h-full object-cover" 
                    onError={() => setImageError(true)}
                  />
                ) : (
                  getInitials(user.name)
                )}
              </button>

              {/* Profile Dropdown */}
              <div 
                ref={dropdownRef}
                className={`absolute right-0 mt-4 w-64 origin-top-right rounded-2xl border border-white/20 bg-white/80 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-300 ${
                  isProfileOpen 
                    ? "opacity-100 translate-y-0 scale-100" 
                    : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                }`}
              >
                <div className="p-4">
                  <div className="flex flex-col mb-3">
                    <p className="text-sm font-bold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email || 'User Account'}</p>
                  </div>
                  <hr className="border-slate-100 mb-3" />
                  <div className="flex flex-col gap-1">
                    <Link 
                      href="/profile" 
                      className="px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-100/50 hover:text-primary transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      View Profile
                    </Link>
                    <Link 
                      href="/profile/edit" 
                      className="px-3 py-2 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-100/50 hover:text-primary transition-colors"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Edit Profile
                    </Link>
                  </div>
                  <hr className="border-slate-100 my-3" />
                  <button 
                    onClick={() => { logout(); setIsProfileOpen(false); }}
                    className="w-full px-3 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-red-600 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/auth/login">
              <button className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-full hover:bg-primary-dark hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300">
                Login
              </button>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:text-primary transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>

        {/* Mobile Menu Overlay */}
        <div 
          className={`absolute top-full left-0 right-0 mt-2 p-4 md:hidden transition-all duration-300 origin-top ${
            isMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  pathname === link.href ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-slate-100" />
            {loading ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100"></div>
            ) : user ? (
              <div className="flex flex-col gap-3 px-4 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary text-white font-bold overflow-hidden">
                    {user.image_url && !imageError ? (
                      <Image 
                        src={user.image_url} 
                        alt={user.name} 
                        width={40} 
                        height={40} 
                        className="w-full h-full object-cover" 
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{user.name}</span>
                    <span className="text-xs text-slate-500">{user.email || 'User Account'}</span>
                  </div>
                </div>
                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-slate-600 px-2 py-1">View Profile</Link>
                <Link href="/profile/edit" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-slate-600 px-2 py-1">Edit Profile</Link>
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="w-full py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark">
                  Login
                </button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

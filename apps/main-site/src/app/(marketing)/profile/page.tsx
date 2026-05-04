"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Mail, Shield, Phone, MapPin, Calendar, Edit3 } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  const [prevUrl, setPrevUrl] = React.useState(user?.image_url);
  if (user?.image_url !== prevUrl) {
    setPrevUrl(user?.image_url);
    setImageError(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const formattedDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : "Recently joined";

  return (
    <div className="min-h-screen bg-transparent pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary tracking-tight">Profile</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage your personal information and security</p>
          </div>
          <Link
            href="/profile/edit"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-bold hover:bg-primary-dark hover:scale-105 hover:shadow-xl shadow-primary/20 transition-all duration-300 active:scale-95"
          >
            <Edit3 size={18} />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden mb-8 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:-translate-y-1">
          <div className="p-10 flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-white ring-4 ring-white/50 shadow-xl flex items-center justify-center text-4xl font-bold text-primary/30 overflow-hidden transition-transform duration-500 group-hover:scale-105">
                {user.image_url && !imageError ? (
                  <Image 
                    src={user.image_url} 
                    alt={user.name} 
                    width={112} 
                    height={112} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={() => setImageError(true)}
                  />
                ) : (
                  initials
                )}
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-primary-dark tracking-tight">{user.name}</h2>
                <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest shadow-sm">
                  {user.role}
                </span>
              </div>
              <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 text-lg">
                <Mail size={18} className="text-primary/40" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="px-10 pb-2">
            <hr className="border-primary/10" />
          </div>

          {/* Details Grid */}
          <div className="p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
              <ProfileItem 
                icon={<User size={20} />} 
                label="Full Name" 
                value={user.name} 
              />
              <ProfileItem 
                icon={<Mail size={20} />} 
                label="Email Address" 
                value={user.email} 
              />
              <ProfileItem 
                icon={<Phone size={20} />} 
                label="Phone Number" 
                value={user.phone || "Not provided"} 
              />
              <ProfileItem 
                icon={<MapPin size={20} />} 
                label="City / Location" 
                value={user.city || "Not provided"} 
              />
              <ProfileItem 
                icon={<Calendar size={20} />} 
                label="Joined Date" 
                value={formattedDate} 
              />
              <ProfileItem 
                icon={<Shield size={20} />} 
                label="Account Role" 
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
              />
            </div>
          </div>
        </div>

        {/* Secondary Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] transition-all duration-300 group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/40 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <Shield size={24} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-primary-dark mb-2">Password & Security</h3>
            <p className="text-gray-500 font-medium mb-6 text-sm leading-relaxed">Ensure your account stays protected by updating your security credentials.</p>
            <Link 
              href="/profile/change-password"
              className="text-primary text-sm font-bold flex items-center gap-2 group-hover:translate-x-1 transition-all"
            >
              Change password <span className="text-xl">→</span>
            </Link>
          </div>

          <div className="p-8 bg-white/70 backdrop-blur-md border border-white/20 rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,0,0,0.12)] transition-all duration-300 group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/40 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <MapPin size={24} />
              </div>
            </div>
            <h3 className="text-xl font-bold text-primary-dark mb-2">Need Assistance?</h3>
            <p className="text-gray-500 font-medium mb-6 text-sm leading-relaxed">Our dedicated support team is here to help you with any issues or queries.</p>
            <button className="text-primary text-sm font-bold flex items-center gap-2 group-hover:translate-x-1 transition-all">
              Contact Support <span className="text-xl">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex gap-5 group/item">
      <div className="mt-1 text-primary/30 group-hover/item:text-primary transition-colors duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1.5">{label}</p>
        <p className="text-primary-dark font-bold text-lg tracking-tight">{value}</p>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Camera, User, MapPin, Mail } from "lucide-react";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { isValidPhoneNumber } from "react-phone-number-input";

export default function EditProfilePage() {
  const { user, loading, fetchUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    image_url: "",
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [imageError, setImageError] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isValidUrl = (url: string) => {
    if (!url) return false;
    // Support local paths
    if (url.startsWith('/')) return true;
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) return false;
      // Remote URLs should have a dot in hostname (e.g. domain.com) 
      // or be localhost to be considered "ready" for Image component
      if (parsed.hostname !== 'localhost' && !parsed.hostname.includes('.')) return false;
      return true;
    } catch {
      return false;
    }
  };

  const [prevUser, setPrevUser] = useState(user);
  if (user && user !== prevUser) {
    setPrevUser(user);
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      city: user.city || "",
      image_url: user.image_url || "",
    });
  }

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/auth/profile/image", {
        method: "POST",
        body: formDataUpload,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setFormData({ ...formData, image_url: data.url });
      setImageError(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      await fetchUser();
      setSuccess(true);
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.push("/profile");
      }, 1500);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setSaving(false);
    }
  };

  const isPhoneValid = formData.phone ? isValidPhoneNumber(formData.phone) : true; // Allow empty if not required, but here we check format if present
  const canSave = formData.name && isPhoneValid && !saving && !uploading;



  return (
    <div className="min-h-screen bg-transparent pt-28 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-8 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Back to Profile</span>
        </Link>

        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-semibold tracking-tight text-primary">Edit Profile</h1>
          <p className="text-gray-500 mt-1">Refine your personal information and presence</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 p-8 md:p-10 transition-all duration-500 hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <div 
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-24 h-24 rounded-full bg-white ring-4 ring-white/60 shadow-lg flex items-center justify-center text-3xl font-bold text-primary/30 overflow-hidden transition-transform duration-500 group-hover:scale-105">
                  {uploading ? (
                    <Loader2 className="animate-spin text-primary" size={32} />
                  ) : formData.image_url && isValidUrl(formData.image_url) && !imageError ? (
                    <Image 
                      src={formData.image_url} 
                      alt="Profile" 
                      width={96} 
                      height={96} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    user.name[0].toUpperCase()
                  )}
                </div>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-full transition-opacity duration-300">
                  <Camera size={24} className="text-white" />
                </div>
                <button 
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all duration-300"
                >
                  {uploading ? <Loader2 className="animate-spin" size={16} /> : <Camera size={16} />}
                </button>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {uploading ? "Uploading..." : "Click to change photo"}
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <InputField 
                label="Full Name" 
                icon={<User size={18} />}
                type="text"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500 ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full h-12 bg-gray-100/60 border border-gray-200 rounded-xl px-4 pl-12 text-gray-500 cursor-not-allowed italic font-medium"
                  />
                </div>
              </div>

              <PhoneInput 
                label="Phone Number" 
                value={formData.phone}
                onChange={(val: string) => setFormData({ ...formData, phone: val })}
              />

              <InputField 
                label="City / Location" 
                icon={<MapPin size={18} />}
                type="text"
                value={formData.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York, USA"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50/50 border border-red-100 text-red-600 rounded-xl text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50/50 border border-green-100 text-green-700 rounded-xl text-sm font-bold animate-fade-in">
                Profile updated successfully! Redirecting...
              </div>
            )}

            <div className="flex flex-col gap-4 pt-4">
              <button
                type="submit"
                disabled={!canSave}
                className="w-full h-13 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
              </button>
              <Link
                href="/profile"
                className="w-full py-3 text-center text-gray-500 font-bold hover:text-primary transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
}

function InputField({ label, icon, ...props }: InputFieldProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-500 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
          {icon}
        </div>
        <input
          {...props}
          className="w-full h-12 bg-white/60 border border-gray-200 rounded-xl pl-12 pr-4 focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-gray-300 font-medium text-primary-dark"
        />
      </div>
    </div>
  );
}

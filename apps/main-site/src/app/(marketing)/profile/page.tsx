"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import OptimizedImage from "@/components/OptimizedImage";
import { User, Mail, Shield, Phone, MapPin, Calendar, Edit3, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { AadhaarOTPVerification } from "@/components/kyc/AadhaarOTPVerification";
import { ConciergePortal } from "@/components/portal/ConciergePortal";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);
  const [showKYCModal, setShowKYCModal] = React.useState(false);
  const [showConcierge, setShowConcierge] = React.useState(false);
  const [manualKycStatus, setManualKycStatus] = React.useState<"none" | "verified" | "pending">("none");
  const kycStatus = user?.kycStatus === "VERIFIED" ? "verified" : manualKycStatus;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
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
    <div className="min-h-screen bg-transparent pt-72 pb-20 px-6 relative overflow-hidden">
      {/* Atmospheric Background Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#159665]/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h1 className="text-5xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Profile</h1>
            <p className="text-sm font-bold text-[#0E5A75]/60 dark:text-[#0983B0]/60 mt-3 uppercase tracking-widest italic">Personal Concierge & Security</p>
          </div>
          <Link
            href="/profile/edit"
            className="flex items-center gap-3 bg-[#0E5A75] dark:bg-[#0983B0] text-white px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest hover:scale-105 hover:shadow-2xl transition-all active:scale-95 shadow-xl shadow-[#0E5A75]/20"
          >
            <Edit3 size={18} />
            <span>Edit Profile</span>
          </Link>
        </div>

        {/* Main Profile Card */}
        <div className="glass-premium dark:bg-white/[0.03] border-white/20 dark:border-white/10 rounded-[48px] shadow-luxury overflow-hidden mb-10 transition-all duration-700 hover:shadow-2xl hover:-translate-y-1">
          <div className="p-12 flex flex-col md:flex-row items-center gap-10">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-[#0E5A75]/20 ring-8 ring-white/50 dark:ring-white/5 shadow-2xl flex items-center justify-center text-4xl font-black text-[#0E5A75] dark:text-white/30 overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:rotate-3">
                {user.image_url && !imageError ? (
                  <OptimizedImage 
                    src={user.image_url} 
                    alt={user.name} 
                    width={112} 
                    height={112} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={() => setImageError(true)}
                    sizes="112px"
                  />
                ) : (
                  initials
                )}
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h2 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter">{user.name}</h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black bg-[#0E5A75]/10 text-[#0E5A75] dark:bg-white/10 dark:text-[#0983B0] border border-[#0E5A75]/20 dark:border-white/10 uppercase tracking-[0.2em] shadow-sm">
                    {user.role}
                  </span>
                  <VerifiedBadge status={kycStatus} size="sm" />
                </div>
              </div>
              <p className="text-sm font-bold text-[#0E5A75]/60 dark:text-white/40 flex items-center justify-center md:justify-start gap-3 uppercase tracking-widest italic">
                <Mail size={16} className="text-[#0983B0]" />
                {user.email}
              </p>
            </div>
          </div>

          <div className="px-12">
            <hr className="border-[#0E5A75]/5 dark:border-white/5" />
          </div>

          {/* Details Grid */}
          <div className="p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-12">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-10 glass-matte dark:bg-white/[0.02] border-white/20 dark:border-white/5 rounded-[40px] shadow-premium hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-[#0E5A75]/5 dark:bg-white/5 flex items-center justify-center text-[#0E5A75] dark:text-[#0983B0] group-hover:scale-110 group-hover:bg-[#0E5A75] group-hover:text-white transition-all duration-500">
                <Shield size={28} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-[#053344] dark:text-white mb-3 relative z-10">Password & Security</h3>
            <p className="text-xs font-bold text-[#0E5A75]/60 dark:text-white/40 mb-8 leading-relaxed uppercase tracking-widest italic relative z-10">Durable protection for your luxury assets and personal data.</p>
            <Link 
              href="/profile/change-password"
              className="text-[#0E5A75] dark:text-[#FCBC43] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 group-hover:translate-x-2 transition-all relative z-10"
            >
              Change Credentials <ArrowRight size={16} />
            </Link>
          </div>

          <div className="p-10 glass-matte dark:bg-white/[0.02] border-white/20 dark:border-white/5 rounded-[40px] shadow-premium hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500",
                kycStatus === "verified" ? "bg-[#159665] text-white" : "bg-[#0E5A75]/5 dark:bg-white/5 text-[#0E5A75] dark:text-[#0983B0] group-hover:scale-110 group-hover:bg-[#0E5A75] group-hover:text-white"
              )}>
                <ShieldCheck size={28} />
              </div>
              {kycStatus === "verified" && <VerifiedBadge status="verified" size="sm" />}
            </div>
            <h3 className="text-2xl font-black text-[#053344] dark:text-white mb-3 relative z-10">Identity Verification</h3>
            <p className="text-xs font-bold text-[#0E5A75]/60 dark:text-white/40 mb-8 leading-relaxed uppercase tracking-widest italic relative z-10">
              {kycStatus === "verified" 
                ? "Identity verified. Priority check-in and trusted status active globally."
                : "Earn your Verified Guest badge for faster future bookings and VIP status."}
            </p>
            {kycStatus !== "verified" ? (
              <button 
                onClick={() => setShowKYCModal(true)}
                className="text-[#0E5A75] dark:text-[#FCBC43] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 group-hover:translate-x-2 transition-all relative z-10"
              >
                Verify Now <ArrowRight size={16} />
              </button>
            ) : (
              <div className="flex items-center gap-2 text-[#159665] text-[10px] font-black uppercase tracking-widest relative z-10">
                <CheckCircle2 size={16} /> Verified via Aadhaar
              </div>
            )}
          </div>

          <div className="p-10 glass-matte dark:bg-white/[0.02] border-white/20 dark:border-white/5 rounded-[40px] shadow-premium hover:-translate-y-2 hover:shadow-2xl transition-all duration-500 group cursor-pointer md:col-span-2 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-[#0E5A75]/5 dark:bg-white/5 flex items-center justify-center text-[#0E5A75] dark:text-[#0983B0] group-hover:scale-110 group-hover:bg-[#0E5A75] group-hover:text-white transition-all duration-500">
                <MapPin size={28} />
              </div>
            </div>
            <h3 className="text-2xl font-black text-[#053344] dark:text-white mb-3 relative z-10">Concierge Assistance</h3>
            <p className="text-xs font-bold text-[#0E5A75]/60 dark:text-white/40 mb-8 leading-relaxed uppercase tracking-widest italic relative z-10">Our dedicated support team is available 24/7 for your bespoke travel needs.</p>
            <button 
              onClick={() => setShowConcierge(true)}
              className="text-[#0E5A75] dark:text-[#FCBC43] text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 group-hover:translate-x-2 transition-all relative z-10"
            >
              Contact Concierge <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Concierge Portal */}
        <ConciergePortal 
          isOpen={showConcierge}
          onClose={() => setShowConcierge(false)}
          isVerified={kycStatus === "verified"}
        />

        {/* KYC Verification Modal */}
        <AnimatePresence>
          {showKYCModal && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-[#053344]/80 backdrop-blur-xl"
                onClick={() => setShowKYCModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="relative w-full max-w-lg bg-[#FDF6F1] dark:bg-[#0A0F1D] shadow-luxury rounded-[48px] border border-white/10 dark:border-white/5 overflow-hidden"
              >
                <div className="p-8 border-b border-[#0E5A75]/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#0983B0]/10 flex items-center justify-center text-[#0983B0]">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#053344] dark:text-white tracking-tight">Identity Verification</h3>
                      <p className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-white/60 uppercase tracking-widest italic">Airbnb-style Trust Secure</p>
                    </div>
                  </div>
                  <button onClick={() => setShowKYCModal(false)} className="p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 text-[#0E5A75] dark:text-white"><ArrowRight className="rotate-45" size={24} /></button>
                </div>
                <div className="p-10">
                  <AadhaarOTPVerification 
                    onVerified={() => {
                      setManualKycStatus("verified");
                      setTimeout(() => setShowKYCModal(false), 2000);
                    }}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex gap-6 group/item">
      <div className="mt-1.5 text-[#0983B0] group-hover/item:scale-110 transition-all duration-500">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-[#0E5A75]/40 dark:text-white/30 uppercase tracking-[0.3em] mb-2">{label}</p>
        <p className="text-[#053344] dark:text-white font-black text-xl tracking-tighter leading-none">{value}</p>
      </div>
    </div>
  );
}

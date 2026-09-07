"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Calendar, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCcw,
  Eye,
  ShieldCheck,
  CreditCard,
  Mail,
  Smartphone,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type KycStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

interface GuestKycListItem {
  bookingId: string;
  propertyId: string;
  propertyName: string;
  guestId: string;
  guestName: string;
  guestEmail: string | null;
  guestPhone: string;
  startDate: string;
  endDate: string;
  bookingStatus: string;
  kycStatus: KycStatus;
  documentType: string | null;
  kycUpdatedAt: string | null;
}

interface KycDetail {
  verificationStatus: KycStatus;
  documentType: string;
  updatedAt: string;
  documentFrontUrl: string | null;
  documentBackUrl: string | null;
  selfieImageUrl: string | null;
}

// --- Components ---
const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] p-6 hover-lift border border-white/5 dark:border-white/5 shadow-premium", className)}>
    {children}
  </div>
);

const StatusBadge = ({ status }: { status: KycStatus }) => {
  const config = {
    VERIFIED: "bg-[#159665]/10 text-[#159665]",
    UNDER_REVIEW: "bg-[#FCBC43]/10 text-[#FCBC43]",
    PENDING: "bg-[#0E5A75]/10 text-[#0E5A75]",
    REJECTED: "bg-[#F24633]/10 text-[#F24633]",
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap", config[status] || config.PENDING)}>
      {status.replace("_", " ")}
    </span>
  );
};

export default function GuestsPage() {
  const [guests, setGuests] = useState<GuestKycListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [selectedGuest, setSelectedGuest] = useState<GuestKycListItem | null>(null);
  const [kycDetail, setKycDetail] = useState<KycDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/partner/kyc-list");
      if (res.ok) {
        const data = await res.json();
        setGuests(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const openGuestDetail = async (guest: GuestKycListItem) => {
    setSelectedGuest(guest);
    setKycDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/bookings/${guest.bookingId}/kyc/review`);
      if (res.ok) {
        const data = await res.json();
        setKycDetail(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedGuest) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedGuest.bookingId}/kyc/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "APPROVE" })
      });
      if (res.ok) {
        await fetchGuests();
        // Refresh local detail state
        if (kycDetail) {
          setKycDetail({ ...kycDetail, verificationStatus: "VERIFIED" });
        }
        // Update local list state
        setGuests(guests.map(g => g.bookingId === selectedGuest.bookingId ? { ...g, kycStatus: "VERIFIED" } : g));
      } else {
        const err = await res.json();
        alert(err.message || "Failed to approve KYC.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedGuest || !rejectReason.trim()) return;
    if (rejectReason.length > 500) {
      alert("Reason must be 500 characters or fewer.");
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${selectedGuest.bookingId}/kyc/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REJECT", reason: rejectReason })
      });
      if (res.ok) {
        await fetchGuests();
        if (kycDetail) {
          setKycDetail({ ...kycDetail, verificationStatus: "REJECTED" });
        }
        setGuests(guests.map(g => g.bookingId === selectedGuest.bookingId ? { ...g, kycStatus: "REJECTED" } : g));
        setShowRejectModal(false);
        setRejectReason("");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to reject KYC.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error occurred.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredGuests = guests.filter(g => 
    g.guestName.toLowerCase().includes(search.toLowerCase()) || 
    g.bookingId.toLowerCase().includes(search.toLowerCase()) ||
    g.guestPhone.includes(search)
  );

  const underReviewCount = guests.filter(g => g.kycStatus === "UNDER_REVIEW").length;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Operational Desk</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Guest KYC Review</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E5A75]/40" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-[24px] glass-matte border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Total Guests</p>
            <p className="text-3xl font-black leading-none text-[#0E5A75]">{guests.length}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-white/5 shadow-inner text-[#0E5A75]"><Users size={20} /></div>
        </GlassCard>
        <GlassCard className="p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-[#FCBC43]/60 uppercase tracking-widest mb-1">Pending Review</p>
            <p className="text-3xl font-black leading-none text-[#FCBC43]">{underReviewCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-white dark:bg-white/5 shadow-inner text-[#FCBC43]"><AlertTriangle size={20} /></div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10"><RefreshCcw className="animate-spin text-[#0E5A75]" size={32} /></div>
        ) : filteredGuests.length === 0 ? (
          <GlassCard className="text-center py-16 text-[#053344]/50 dark:text-white/50">
            <ShieldCheck size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-black uppercase tracking-widest text-sm">No KYC Records Found</p>
          </GlassCard>
        ) : (
          filteredGuests.map((guest) => (
            <div 
              key={guest.bookingId} 
              onClick={() => openGuestDetail(guest)}
              className="group flex flex-col lg:flex-row items-center gap-6 p-6 rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/10 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:translate-y-[-2px]"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-14 h-14 rounded-[18px] bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/10">
                  {guest.guestName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-[#053344] dark:text-white leading-none">{guest.guestName}</h3>
                    <StatusBadge status={guest.kycStatus} />
                  </div>
                  <p className="text-xs font-bold text-[#0E5A75]/40 uppercase tracking-widest">{guest.guestPhone} • {guest.bookingId.split('-')[0]}</p>
                </div>
              </div>

              <div className="flex items-center gap-12 shrink-0">
                <div className="hidden xl:block">
                  <p className="text-[9px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Property</p>
                  <p className="text-xs font-bold text-[#053344] dark:text-white">{guest.propertyName}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Dates</p>
                  <p className="text-sm font-black text-[#053344] dark:text-white">{new Date(guest.startDate).toLocaleDateString()} - {new Date(guest.endDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 border-l border-black/5 dark:border-white/5 pl-6 text-[#0E5A75]">
                <span className="text-[10px] font-black uppercase tracking-widest mr-2">Review</span>
                <ChevronRight size={20} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Drawer */}
      {selectedGuest && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-[#053344]/40 backdrop-blur-sm" onClick={() => setSelectedGuest(null)} />
          <aside className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1D] shadow-luxury h-full animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-2xl shadow-xl">
                  {selectedGuest.guestName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight leading-none mb-2">{selectedGuest.guestName}</h2>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={kycDetail ? kycDetail.verificationStatus : selectedGuest.kycStatus} />
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedGuest(null)} className="p-3 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-[#0E5A75]/40"><Mail size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Email Address</span></div>
                  <p className="text-sm font-black text-[#053344] dark:text-white truncate">{selectedGuest.guestEmail || "N/A"}</p>
                </div>
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-2 text-[#0E5A75]/40"><Smartphone size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Phone Number</span></div>
                  <p className="text-sm font-black text-[#053344] dark:text-white truncate">{selectedGuest.guestPhone}</p>
                </div>
              </div>

              {detailLoading ? (
                <div className="flex justify-center py-20"><RefreshCcw className="animate-spin text-[#0E5A75]" size={32} /></div>
              ) : kycDetail ? (
                <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Documents ({kycDetail.documentType})</h3>
                  
                  {kycDetail.documentFrontUrl ? (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#053344]/60 dark:text-white/60">Front Image</p>
                      <img src={kycDetail.documentFrontUrl} alt="Document Front" className="w-full rounded-2xl border border-black/10 dark:border-white/10" />
                    </div>
                  ) : <p className="text-sm italic text-gray-500">No front image uploaded.</p>}
                  
                  {kycDetail.documentBackUrl && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#053344]/60 dark:text-white/60">Back Image</p>
                      <img src={kycDetail.documentBackUrl} alt="Document Back" className="w-full rounded-2xl border border-black/10 dark:border-white/10" />
                    </div>
                  )}

                  {kycDetail.selfieImageUrl && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-[#053344]/60 dark:text-white/60">Selfie</p>
                      <img src={kycDetail.selfieImageUrl} alt="Selfie" className="w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/10 mx-auto block" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">Failed to load KYC details or not found.</div>
              )}
            </div>

            {kycDetail?.verificationStatus === "UNDER_REVIEW" && !showRejectModal && (
              <div className="p-8 border-t border-black/5 dark:border-white/5 flex gap-3">
                <button onClick={() => setShowRejectModal(true)} disabled={actionLoading} className="flex-1 py-4 rounded-2xl border border-red-500/20 text-red-500 font-black uppercase tracking-widest hover:bg-red-500/5 transition-all">Reject</button>
                <button onClick={handleApprove} disabled={actionLoading} className="flex-1 py-4 rounded-2xl bg-[#159665] text-white font-black uppercase tracking-widest shadow-xl shadow-[#159665]/20 hover:opacity-90 transition-all flex justify-center items-center">
                  {actionLoading ? <RefreshCcw size={20} className="animate-spin" /> : "Approve KYC"}
                </button>
              </div>
            )}

            {showRejectModal && (
              <div className="p-8 border-t border-black/5 dark:border-white/5 space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-red-500">Reject KYC</h4>
                <textarea 
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (sent to guest)..."
                  maxLength={500}
                  className="w-full p-4 rounded-xl border border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-red-500 resize-none h-24"
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 rounded-2xl border border-black/10 text-black/60 dark:text-white/60 font-black uppercase tracking-widest">Cancel</button>
                  <button onClick={handleReject} disabled={actionLoading || !rejectReason.trim()} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest shadow-xl shadow-red-500/20 flex justify-center items-center">
                    {actionLoading ? <RefreshCcw size={20} className="animate-spin" /> : "Confirm Reject"}
                  </button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { 
  Download, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  User, 
  FileText, 
  CreditCard, 
  ArrowLeft,
  ShieldCheck,
  Clock
} from "lucide-react";
import { prisma } from "@/lib/database/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function DocumentCenterPage({ params }: PageProps) {
  const { bookingId } = await params;

  // 1. Session & Auth Verification Boundary
  const cookieStore = await cookies();
  const token = cookieStore.get("access-token")?.value || cookieStore.get("token")?.value;
  if (!token) {
    redirect("/auth/login?redirect=" + encodeURIComponent(`/booking/documents/${bookingId}`));
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.userId) {
    redirect("/auth/login?redirect=" + encodeURIComponent(`/booking/documents/${bookingId}`));
  }

  // 2. Fetch User and Booking
  const [user, booking] = await Promise.all([
    prisma.user.findUnique({ where: { id: payload.userId as string } }),
    prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        room: true,
        invoices: true,
        guests: {
          include: { guest: true }
        }
      }
    })
  ]);

  if (!user || !booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-500/10">
          <h2 className="text-xl font-black text-[#053344] mb-3">Booking Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">We could not locate this stay reservation reference in our systems.</p>
          <Link href="/explore" className="inline-block bg-[#053344] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#09475d] transition-all">
            Return to Explore
          </Link>
        </div>
      </div>
    );
  }

  // 3. Ownership Access Validation Check
  let hasAccess = false;
  if (["admin", "super_admin"].includes(user.role)) {
    hasAccess = true;
  } else if (["owner", "manager", "partner"].includes(user.role)) {
    const accesses = await prisma.propertyUserAccess.findFirst({
      where: { userId: user.id, propertyId: booking.propertyId }
    });
    if (accesses) hasAccess = true;
  } else {
    // Guest check
    hasAccess = booking.guests.some(
      g => g.guest.email?.toLowerCase() === user.email.toLowerCase()
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-500/10">
          <h2 className="text-xl font-black text-red-500 mb-3">Access Restrained</h2>
          <p className="text-slate-500 text-sm mb-6">This document folder is cryptographically locked and restricted to stay registered guests only.</p>
          <Link href="/explore" className="inline-block bg-[#053344] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#09475d] transition-all">
            Browse Explorer
          </Link>
        </div>
      </div>
    );
  }

  const primaryGuest = booking.guests[0]?.guest;
  const nights = Math.max(1, Math.round((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)));
  const baseRate = booking.amount / 1.12; // 12% GST allocation standard
  const gstAmount = booking.amount - baseRate;
  
  const displayId = booking.id.substring(0, 8).toUpperCase();
  const invoice = booking.invoices[0];

  return (
    <div className="min-h-screen bg-[#F7F9FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/explore" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#053344] transition-all">
            <ArrowLeft size={14} /> Back to Explorer
          </Link>
        </div>

        {/* Brand Banner */}
        <div className="bg-gradient-to-r from-[#053344] to-[#0A475D] rounded-3xl p-8 md:p-12 text-white mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
            <ShieldCheck size={260} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-[#FCBC43]/20 text-[#FCBC43] px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#FCBC43]/20">
                Hospitality Ledger Secured
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Guest Document Portal</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Retrieve and print certified copies of your room registration sheets, hospitality tax invoices, and verification certificates.
            </p>
          </div>
        </div>

        {/* Double-Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stay Info Cards */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Stay Destination Details */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-lg font-black text-[#053344] mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-[#FCBC43]" /> Reservation Details
              </h2>
              
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Destination Property</span>
                  <span className="text-xl font-bold text-slate-800">{booking.property.title}</span>
                  <p className="text-slate-400 text-xs mt-1">Premium Luxury Living Destination</p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Check-in</span>
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <Calendar size={14} className="text-[#053344]" />
                      {new Date(booking.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Check-out</span>
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <Calendar size={14} className="text-[#053344]" />
                      {new Date(booking.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Room Allocation</span>
                    <span className="text-slate-800 font-bold text-sm">{booking.room.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Total Nights</span>
                    <span className="text-slate-800 font-bold text-sm">{nights} Nights</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Itemized Billing Breakdown */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h2 className="text-lg font-black text-[#053344] mb-6 flex items-center gap-2">
                <CreditCard size={18} className="text-[#FCBC43]" /> Settlement Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Suite Lodging ({nights} nights)</span>
                  <span className="font-bold text-slate-800">₹{baseRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Luxury Taxes (GST @ 12%)</span>
                  <span className="font-bold text-slate-800">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="h-px bg-slate-100 my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-black text-[#053344] text-base">Grand Total Paid</span>
                  <span className="font-black text-xl text-[#053344]">₹{booking.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                {booking.utrNumber && (
                  <div className="mt-6 bg-[#053344]/5 border border-[#053344]/10 rounded-2xl p-4 flex items-center justify-between text-xs">
                    <span className="text-[#053344] font-black uppercase tracking-wider">Settlement Ref (UTR)</span>
                    <span className="font-bold text-slate-700 font-mono">{booking.utrNumber}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Download Actions panel */}
          <div className="space-y-8">
            
            {/* Secure Documents Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 text-center">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/15">
                <CheckCircle size={24} />
              </div>
              <h3 className="font-black text-[#053344] text-base mb-1">Booking Confirmed</h3>
              <p className="text-slate-400 text-xs mb-6">Reference ID: BKG-{displayId}</p>

              <div className="space-y-4">
                
                {/* 1. Download Invoice Button */}
                {invoice ? (
                  <a
                    href={`/api/bookings/${booking.id}/invoice/download`}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#053344] hover:bg-[#09475d] text-white py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
                  >
                    <Download size={14} /> Download Tax Invoice
                  </a>
                ) : (
                  <div className="w-full inline-flex items-center justify-center gap-2 bg-slate-50 text-slate-400 py-3.5 px-4 rounded-2xl text-xs font-bold uppercase tracking-wider border border-slate-200/50">
                    <Clock size={14} /> Invoice Compiling...
                  </div>
                )}

                {/* 2. Download Stay Certificate (Mock for now or printable HTML view) */}
                <button
                  onClick={() => typeof window !== "undefined" && window.print()}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-wider border border-slate-200 transition-all"
                >
                  <FileText size={14} /> Print Document
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 text-[10px] text-slate-400 flex items-center justify-center gap-1.5 leading-relaxed">
                <ShieldCheck size={12} className="text-emerald-500" /> End-to-end Ledger Validated
              </div>
            </div>

            {/* Guest Summary Card */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <h4 className="font-black text-[#053344] text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <User size={14} className="text-[#FCBC43]" /> Registered Guest
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="font-bold text-slate-800 text-sm mb-1">{primaryGuest?.fullName || user.name}</div>
                <div>{primaryGuest?.email || user.email}</div>
                <div>{primaryGuest?.mobile || "Phone context locked"}</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

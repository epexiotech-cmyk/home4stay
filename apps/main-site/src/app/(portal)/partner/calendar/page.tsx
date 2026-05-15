"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ChevronRight, 
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Bed,
  Layers,
  LucideIcon,
  User,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isWithinInterval, isSameDay, areIntervalsOverlapping, addDays, isBefore } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import { useCalendarDates } from "@/components/calendar/useCalendarDates";
import { CalendarToolbar } from "@/components/calendar/CalendarToolbar";
import { DayView } from "@/components/calendar/DayView";
import { WeekView } from "@/components/calendar/WeekView";
import { MonthView } from "@/components/calendar/MonthView";
import { CustomDatePicker } from "@/components/calendar/CustomDatePicker";
import { CustomDropdown } from "@/components/calendar/CustomDropdown";
import { AadhaarOTPVerification } from "@/components/kyc/AadhaarOTPVerification";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { ROOM_GROUPS, RESERVATIONS } from "@/components/calendar/mock-data";
import { Reservation, Guest, Address, MealPlan } from "@/components/calendar/types";

// --- UI Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] p-6 hover-lift border border-white/5 dark:border-white/5 shadow-premium", className)}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "danger" | "info", className?: string }) => {
  const variants: Record<string, string> = {
    default: "bg-[#0E5A75]/10 text-[#0E5A75] dark:bg-white/10 dark:text-[#0983B0]",
    success: "bg-[#159665]/10 text-[#159665]",
    warning: "bg-[#FCBC43]/10 text-[#FCBC43]",
    danger: "bg-[#F24633]/10 text-[#F24633]",
    info: "bg-[#0983B0]/10 text-[#0983B0]",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em]", variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
};

// --- Main Page ---

export default function CalendarPage() {
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);
  const [isQuickBookingOpen, setIsQuickBookingOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>(RESERVATIONS);
  
  const [guestName, setGuestName] = useState("");
  const [guestMobile, setGuestMobile] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState(ROOM_GROUPS[0].rooms[0].id);
  const [mealPlan, setMealPlan] = useState("Room Only (EP)");

  const [isKYCVerified, setIsKYCVerified] = useState(false);
  const [kycData, setKycData] = useState<{ fullName?: string; aadhaarMasked?: string } | null>(null);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [address, setAddress] = useState<Address>({
    line1: "",
    city: "",
    state: "",
    pincode: "",
    country: "India"
  });

  // Helper to calculate available rooms based on dates and reservations
  const getAvailableRooms = (inDate: Date | null, outDate: Date | null, resList: Reservation[]) => {
    const allRooms = ROOM_GROUPS.flatMap(g => g.rooms);
    if (!inDate || !outDate) return allRooms;
    const selectedInterval = { start: inDate, end: outDate };
    const unavailableRoomIds = resList
      .filter(r => areIntervalsOverlapping(selectedInterval, { start: r.startDate, end: r.endDate }))
      .map(r => r.roomId);
    return allRooms.filter(room => !unavailableRoomIds.includes(room.id));
  };

  // Optimized date selection handlers to avoid cascading renders in effects
  const handleCheckInChange = (date: Date | null) => {
    setCheckIn(date);
    let currentCheckOut = checkOut;
    if (date && checkOut && isBefore(checkOut, addDays(date, 1))) {
      currentCheckOut = addDays(date, 1);
      setCheckOut(currentCheckOut);
    }
    
    // Synchronously update room selection if current one becomes unavailable
    const nextAvailable = getAvailableRooms(date, currentCheckOut, reservations);
    if (nextAvailable.length > 0 && !nextAvailable.find(r => r.id === selectedRoomId)) {
      setSelectedRoomId(nextAvailable[0].id);
    }
  };

  const handleCheckOutChange = (date: Date | null) => {
    setCheckOut(date);
    const nextAvailable = getAvailableRooms(checkIn, date, reservations);
    if (nextAvailable.length > 0 && !nextAvailable.find(r => r.id === selectedRoomId)) {
      setSelectedRoomId(nextAvailable[0].id);
    }
  };

  useEffect(() => {
    const handleOpen = () => setIsQuickBookingOpen(true);
    window.addEventListener("open-quick-booking", handleOpen);
    return () => window.removeEventListener("open-quick-booking", handleOpen);
  }, []);

  const { 
    view, 
    setView, 
    selectedDate, 
    setSelectedDate,
    dates, 
    next, 
    prev, 
    today,
    minDate,
    maxDate
  } = useCalendarDates(reservations, new Date(), "week");

  const handleConfirmBooking = () => {
    if (!guestName || !checkIn || !checkOut || !isKYCVerified || !address.line1 || !address.city || !address.pincode) return;

    const newGuest: Guest = {
      id: `G-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: guestName,
      mobile: guestMobile,
      address: address,
      nationality: "Indian",
      kycStatus: "VERIFIED",
      aadhaarVerified: true,
      aadhaarReferenceId: kycData?.aadhaarMasked
    };

    const newBooking: Reservation = {
      id: `RES-${Math.floor(1000 + Math.random() * 9000)}`,
      roomId: selectedRoomId,
      guestName,
      startDate: checkIn,
      endDate: checkOut,
      status: "confirmed",
      kycStatus: "VERIFIED",
      source: "Direct",
      amount: 15000,
      paymentStatus: "pending",
      occupancy: { adults: 2, children: 0 },
      mealPlan: mealPlan as MealPlan,
      primaryGuest: newGuest
    };

    setReservations(prev => [...prev, newBooking]);
    
    setGuestName("");
    setGuestMobile("");
    setCheckIn(null);
    setCheckOut(null);
    setIsKYCVerified(false);
    setKycData(null);
    setAddress({ line1: "", city: "", state: "", pincode: "", country: "India" });
    setIsQuickBookingOpen(false);
  };

  const availableRoomsList = useMemo(() => getAvailableRooms(checkIn, checkOut, reservations), [checkIn, checkOut, reservations]);

  const totalRoomsCount = ROOM_GROUPS.reduce((acc, g) => acc + g.rooms.length, 0);
  const now = new Date();
  
  const occupiedCount = reservations.filter(r => 
    isWithinInterval(now, { start: r.startDate, end: r.endDate })
  ).length;

  const arrivalsCount = reservations.filter(r => 
    isSameDay(r.startDate, now)
  ).length;

  const departuresCount = reservations.filter(r => 
    isSameDay(r.endDate, now)
  ).length;

  const maintenanceCount = 2;
  const availableRoomsCount = Math.max(0, totalRoomsCount - occupiedCount - maintenanceCount);

  const renderView = () => {
    switch (view) {
      case "day":
        return <DayView selectedDate={selectedDate} roomGroups={ROOM_GROUPS} reservations={reservations} onBookingClick={setSelectedBooking} />;
      case "week":
        return <WeekView dates={dates} roomGroups={ROOM_GROUPS} reservations={reservations} onBookingClick={setSelectedBooking} />;
      case "month":
        return <MonthView dates={dates} roomGroups={ROOM_GROUPS} reservations={reservations} onBookingClick={setSelectedBooking} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-6">
      <CalendarToolbar 
        view={view}
        setView={setView}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onPrev={prev}
        onNext={next}
        onToday={today}
        minDate={minDate}
        maxDate={maxDate}
        onQuickBooking={() => setIsQuickBookingOpen(true)}
      />

      <div className="flex-1 flex flex-col min-h-0 bg-white/40 dark:bg-black/20 rounded-[32px] border border-white/10 dark:border-white/5 shadow-premium overflow-hidden backdrop-blur-md">
        {renderView()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 shrink-0">
        <InsightCard label="Available Rooms" value={String(availableRoomsCount).padStart(2, '0')} color="text-[#159665]" />
        <InsightCard label="Check-ins Today" value={String(arrivalsCount).padStart(2, '0')} color="text-[#0983B0]" />
        <InsightCard label="Checkout Pending" value={String(departuresCount).padStart(2, '0')} color="text-[#FCBC43]" />
        <InsightCard label="Maintenance" value={String(maintenanceCount).padStart(2, '0')} color="text-[#F24633]" />
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-[#053344]/40 backdrop-blur-sm" onClick={() => setSelectedBooking(null)} />
          <aside className="relative w-full max-w-lg bg-white dark:bg-[#0A0F1D] shadow-luxury h-full flex flex-col border-l border-white/10">
            <div className="p-8 flex items-center justify-between border-b border-black/5">
              <div>
                <p className="text-[10px] font-bold text-[#0983B0] uppercase tracking-[0.3em] mb-1">{selectedBooking.id}</p>
                <h2 className="text-2xl font-black text-[#053344] dark:text-white">Reservation Details</h2>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="p-3 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75]"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div className="flex items-center gap-6 p-6 rounded-[32px] bg-[#0E5A75]/5 border border-[#0E5A75]/10">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-3xl">{selectedBooking.guestName.split(' ').map(n => n[0]).join('')}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-[#053344] dark:text-white">{selectedBooking.guestName}</h3>
                    <VerifiedBadge status={selectedBooking.kycStatus === "VERIFIED" ? "verified" : "none"} size="sm" />
                  </div>
                  <p className="text-sm font-medium text-[#0E5A75]/60 mt-1">Verified Premium Member</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailBox label="Room" value={selectedBooking.roomId} icon={Bed} />
                <DetailBox label="Meal Plan" value={selectedBooking.mealPlan} icon={Layers} />
                <DetailBox label="Check-In" value={format(selectedBooking.startDate, "MMM dd, yyyy")} icon={CalendarIcon} />
                <DetailBox label="Check-Out" value={format(selectedBooking.endDate, "MMM dd, yyyy")} icon={CalendarIcon} />
                <DetailBox label="Occupancy" value={`${selectedBooking.occupancy.adults} Adults, ${selectedBooking.occupancy.children} Child`} icon={User} />
              </div>
            </div>
          </aside>
        </div>
      )}
      {isQuickBookingOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#053344]/40 backdrop-blur-sm"
            onClick={() => setIsQuickBookingOpen(false)}
          />
          <aside className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1D] shadow-luxury rounded-[48px] flex flex-col border border-white/10 dark:border-white/5 overflow-hidden">
            <div className="p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div>
                <h2 className="text-2xl font-black text-[#053344] dark:text-white">Quick Booking</h2>
                <p className="text-sm font-bold text-[#0E5A75]/60 mt-1 uppercase tracking-widest">Create New Reservation</p>
              </div>
              <button 
                onClick={() => setIsQuickBookingOpen(false)}
                className="p-3 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Primary Guest Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]">Primary Guest Details</label>
                  {isKYCVerified && <Badge variant="success">Identity Verified</Badge>}
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Full Name" 
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold text-[#053344] dark:text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={guestMobile}
                      onChange={(e) => setGuestMobile(e.target.value)}
                      placeholder="Mobile Number" 
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold text-[#053344] dark:text-white" 
                    />
                  </div>
                </div>

                {!isKYCVerified ? (
                  <button 
                    onClick={() => setShowKYCModal(true)}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-[#0983B0]/30 text-[#0983B0] font-black uppercase tracking-widest hover:bg-[#0983B0]/5 hover:border-[#0983B0] transition-all flex items-center justify-center gap-3"
                  >
                    <ShieldCheck size={20} /> Verify Aadhaar via OTP
                  </button>
                ) : (
                  <div className="p-5 rounded-[24px] bg-[#159665]/5 border border-[#159665]/20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#159665] flex items-center justify-center text-white">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#053344] dark:text-white">{kycData?.fullName}</p>
                        <p className="text-[10px] font-bold text-[#159665] uppercase tracking-widest">{kycData?.aadhaarMasked}</p>
                      </div>
                    </div>
                    <button onClick={() => setIsKYCVerified(false)} className="text-[10px] font-black text-[#F24633] uppercase hover:underline">Reset</button>
                  </div>
                )}
              </div>

              {/* Mandatory Address Section */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]">Mandatory Address Details</label>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    value={address.line1}
                    onChange={(e) => setAddress({...address, line1: e.target.value})}
                    placeholder="Address Line 1" 
                    className="w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold text-[#053344] dark:text-white" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                      placeholder="City" 
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold text-[#053344] dark:text-white" 
                    />
                    <input 
                      type="text" 
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                      placeholder="State" 
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold text-[#053344] dark:text-white" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      value={address.pincode}
                      onChange={(e) => setAddress({...address, pincode: e.target.value})}
                      placeholder="Pincode" 
                      className="w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold text-[#053344] dark:text-white" 
                    />
                    <CustomDropdown 
                      label="Country" 
                      value={address.country} 
                      onChange={(val) => setAddress({...address, country: val})} 
                      options={[{ id: "India", name: "India" }, { id: "Foreign", name: "Foreign (Passport Required)" }]}
                    />
                  </div>
                </div>
              </div>

              {/* Booking Specifics */}
              <div className="grid grid-cols-2 gap-6 pt-4">
                <CustomDatePicker 
                  label="Check-In" 
                  value={checkIn?.toISOString()} 
                  onChange={handleCheckInChange} 
                  placeholder="Select check-in..."
                />
                <CustomDatePicker 
                  label="Check-Out" 
                  value={checkOut?.toISOString()} 
                  onChange={handleCheckOutChange} 
                  placeholder="Select check-out..."
                  minDate={checkIn ? addDays(checkIn, 1) : addDays(new Date(), 1)}
                />
              </div>

              <div className="grid grid-cols-2 gap-6 pb-4">
                <CustomDropdown 
                  label="Room Selection" 
                  value={selectedRoomId} 
                  onChange={setSelectedRoomId} 
                  options={availableRoomsList.map(r => ({ id: r.id, name: r.name, desc: r.type }))}
                  placeholder="Select a room..."
                />
                <CustomDropdown 
                  label="Meal Plan" 
                  value={mealPlan} 
                  onChange={setMealPlan} 
                  options={[
                    { id: "Room Only (EP)", name: "Room Only (EP)" },
                    { id: "Breakfast Included (CP)", name: "Breakfast Included (CP)" },
                    { id: "Breakfast & Dinner (MAP)", name: "Breakfast & Dinner (MAP)" },
                    { id: "All Meals (AP)", name: "All Meals (AP)" }
                  ]}
                />
              </div>
            </div>

            <div className="p-8 border-t border-[#0E5A75]/5 flex gap-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-b-[48px]">
              <button 
                onClick={() => setIsQuickBookingOpen(false)}
                className="flex-1 py-4 rounded-2xl border border-[#0E5A75]/20 text-[#0E5A75] font-black uppercase tracking-widest hover:bg-[#0E5A75]/5 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={handleConfirmBooking}
                disabled={!guestName || !checkIn || !checkOut || !isKYCVerified || !address.line1}
                className={cn(
                  "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl",
                  (!guestName || !checkIn || !checkOut || !isKYCVerified || !address.line1)
                    ? "bg-[#0E5A75]/20 text-[#0E5A75]/40 cursor-not-allowed shadow-none"
                    : "bg-[#159665] text-white shadow-[#159665]/20 hover:bg-[#159665]/90"
                )}
              >
                {isKYCVerified ? "Confirm Booking" : "KYC Required"}
              </button>
            </div>
          </aside>

          {/* UIDAI Verification Sub-Modal */}
          <AnimatePresence>
            {showKYCModal && (
              <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#053344]/60 backdrop-blur-md"
                  onClick={() => setShowKYCModal(false)}
                />
                <motion.aside 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-lg bg-white dark:bg-[#0A0F1D] shadow-luxury rounded-[40px] border border-white/10 dark:border-white/5 overflow-hidden"
                >
                  <div className="p-6 border-b border-[#0E5A75]/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-[#0983B0]/10 text-[#0983B0]">
                        <ShieldCheck size={20} />
                      </div>
                      <h3 className="text-lg font-black text-[#053344] dark:text-white">UIDAI Identity Portal</h3>
                    </div>
                    <button onClick={() => setShowKYCModal(false)} className="p-2 rounded-lg hover:bg-black/5 text-[#0E5A75]"><X size={20} /></button>
                  </div>
                  <div className="p-8">
                    <AadhaarOTPVerification 
                      onVerified={(data) => {
                        setKycData(data);
                        setIsKYCVerified(true);
                        setGuestName(data.fullName);
                        setAddress(data.address);
                        setTimeout(() => setShowKYCModal(false), 2000);
                      }}
                    />
                  </div>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// --- Helper Components ---

function InsightCard({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <button 
      onClick={() => alert(`Showing details for: ${label}`)}
      className="w-full text-left"
    >
      <GlassCard className="p-4 flex items-center justify-between group hover:border-[#0E5A75]/40 transition-all active:scale-[0.98]">
        <div>
          <p className="text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest mb-1">{label}</p>
          <p className={cn("text-2xl font-black", color)}>{value}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={16} className="text-[#0E5A75]" />
        </div>
      </GlassCard>
    </button>
  );
}

function DetailBox({ label, value, icon: Icon, status }: { label: string, value: string, icon: LucideIcon, status?: string }) {
  return (
    <div className="p-4 rounded-2xl bg-[#0E5A75]/5 border border-transparent hover:border-[#0E5A75]/10 transition-all">
      <div className="flex items-center gap-2 mb-2 text-[#0E5A75]/60">
        <Icon size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={cn(
        "text-sm font-bold text-[#053344] dark:text-white capitalize",
        status === "paid" && "text-[#159665]",
        status === "pending" && "text-[#F24633]"
      )}>
        {value}
      </p>
    </div>
  );
}

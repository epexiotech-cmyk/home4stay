"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Minus, Plus, ArrowRight, Sparkles, ChevronLeft } from "lucide-react";

interface SearchBarProps {
  isScrolled?: boolean;
}

const DESTINATIONS = [
  { id: 1, title: "Manali", subtitle: "Himachal Pradesh", icon: "🏔️" },
  { id: 2, title: "Goa", subtitle: "Beach Paradise", icon: "🏖️" },
  { id: 3, title: "Udaipur", subtitle: "City of Lakes", icon: "🏰" },
  { id: 4, title: "Varkala", subtitle: "Cliffside Kerala", icon: "🌊" },
];

const MONTHS = [
  { id: "May 2026", label: "May 2026", icon: "🥭" },
  { id: "June 2026", label: "June 2026", icon: "☔" },
  { id: "July 2026", label: "July 2026", icon: "🌧️" },
  { id: "August 2026", label: "August 2026", icon: "🦚" },
  { id: "September 2026", label: "September 2026", icon: "🪷" },
  { id: "October 2026", label: "October 2026", icon: "🪔" },
  { id: "November 2026", label: "November 2026", icon: "🍂" },
  { id: "December 2026", label: "December 2026", icon: "🏔️" },
  { id: "January 2027", label: "January 2027", icon: "🪁" },
  { id: "February 2027", label: "February 2027", icon: "🌹" },
  { id: "March 2027", label: "March 2027", icon: "🎨" },
  { id: "April 2027", label: "April 2027", icon: "🌻" }
];

interface StayIntentOption {
  id: string;
  label: string;
  subtitle: string;
  icon: string;
  featured?: boolean;
  cue?: string;
}

interface StayIntentCategory {
  category: string;
  options: StayIntentOption[];
}

const STAY_INTENTS: StayIntentCategory[] = [
  {
    category: "Vacation & Leisure",
    options: [
      { id: "couple", label: "Couple Retreat", subtitle: "Intimate escapes for two", icon: "👩‍❤️‍👨", cue: "Perfect for anniversaries" },
      { id: "family", label: "Family Vacation", subtitle: "Memorable stays for all ages", icon: "👨‍👩‍👧‍👦", cue: "Kid-friendly spaces" },
      { id: "group", label: "Group Trip", subtitle: "Adventure-ready group stays", icon: "🏕️", cue: "Popular for group bonding" },
      { id: "resort", label: "Resort Escape", subtitle: "Premium stays with world-class amenities", icon: "🏨", cue: "All-inclusive options" },
      { id: "solo", label: "Solo Adventure", subtitle: "Safe and inspiring stays for independent travelers", icon: "🎒", cue: "Highly Rated for Solo" },
      { id: "luxury", label: "Luxury Getaway", subtitle: "Elite homes with bespoke services and privacy", icon: "💎", cue: "Exclusive Collection" },
    ]
  },
  {
    category: "Remote Living",
    options: [
      { id: "workation", label: "Workation", subtitle: "Balanced stays for work and travel", icon: "💻", cue: "Great for digital nomads" },
      { id: "mountains", label: "Work From Mountains", subtitle: "Quiet stays with fast WiFi and scenic views", icon: "🏔️", featured: true, cue: "Trending this season" },
      { id: "longterm", label: "Long-Term Living", subtitle: "Extended stays with home comforts", icon: "🏠", cue: "Best value for 30+ days" },
    ]
  },
  {
    category: "Slow Living",
    options: [
      { id: "retirement", label: "Retirement Retreat", subtitle: "Peaceful long stays focused on comfort and slow living", icon: "🌿", featured: true, cue: "Calm & Accessible" },
      { id: "wellness", label: "Wellness Escape", subtitle: "Restorative stays for mind and body", icon: "🧘", cue: "Highly rated for relaxation" },
      { id: "nature", label: "Nature Immersion", subtitle: "Disconnect to reconnect with the natural world", icon: "🍃", cue: "Forest & River Stays" },
    ]
  }
];

const SearchBar = React.memo(({ isScrolled = false }: SearchBarProps) => {
  const [activeSection, setActiveSection] = useState<"where" | "when" | "who" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Search State
  const [where, setWhere] = useState("");
  const [guests, setGuests] = useState({ adults: 1, seniors: 0, children: 0, infants: 0, pets: 0 });

  // Date State
  const [dateMode, setDateMode] = useState<"fixed" | "flexible">("fixed");
  const [flexibleStep, setFlexibleStep] = useState(1);
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [flexDays, setFlexDays] = useState(0);
  const [flexibleMonths, setFlexibleMonths] = useState<string[]>([]);
  const [flexibleDuration, setFlexibleDuration] = useState<"1-2" | "2-3" | "4-7" | "8-14" | "15-29" | "30+">("4-7");
  const [stayIntent, setStayIntent] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [helperText, setHelperText] = useState("Select your check-in date");
  const [calendarViewDate, setCalendarViewDate] = useState(new Date(2026, 4, 1)); // Starts at May 2026

  const searchRef = useRef<HTMLDivElement>(null);
  const whereInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setActiveSection(null);
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeSection === "where") {
      setTimeout(() => whereInputRef.current?.focus(), 100);
    }
  }, [activeSection]);

  const totalGuests = guests.adults + guests.seniors + guests.children;
  const guestLabel = totalGuests > 0 ? `${totalGuests} ${totalGuests === 1 ? 'guest' : 'guests'}` : "Add guests";

  const dateLabel = dateMode === "fixed"
    ? (checkIn ? `${checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${checkOut ? ` - ${checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}` : "Add dates")
    : (flexibleMonths.length > 0 ? `${flexibleDuration} Nights in ${flexibleMonths.join(', ')}` : "Anytime");

  const isFullyQualified = where !== "" && (checkIn || flexibleMonths.length > 0) && totalGuests > 0;

  const handleGuestChange = (type: keyof typeof guests, operation: "add" | "sub") => {
    setGuests(prev => ({
      ...prev,
      [type]: operation === "add" ? prev[type] + 1 : Math.max(type === "adults" ? 1 : 0, prev[type] - 1)
    }));
  };

  const handleDateClick = (date: Date) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
      setHelperText("Select your checkout date");
    } else if (date < checkIn) {
      setCheckIn(date);
      setCheckOut(null);
      setHelperText("Select your checkout date");
    } else {
      setCheckOut(date);
      setHelperText("Check-out selected");
      setActiveSection("who");
    }
  };

  return (
    <>
      <div
        className={`fixed -inset-[200vh] bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 z-[35] ${isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => { setActiveSection(null); setIsExpanded(false); }}
      />

      <div
        ref={searchRef}
        className={`relative mx-auto transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[40] ${isExpanded ? "w-full max-w-[1200px] -translate-y-3" : isScrolled ? "w-[520px]" : "w-full max-w-[950px]"
          }`}
      >
        <div
          className={`relative h-full flex items-center p-2 rounded-full border border-[var(--border)] bg-[var(--card-solid)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded
            ? "shadow-[0_25px_50px_rgba(0,0,0,0.25)] bg-[var(--card-solid)]"
            : "shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.1)]"
            }`}
        >
          {isScrolled && !isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="w-full h-full flex items-center pl-6 pr-2 py-1"
            >
              <div className="flex-1 flex items-center justify-between divide-x divide-[var(--border)] text-[13px] font-bold text-[var(--text)] overflow-hidden">
                <span className="pr-4 truncate">{where || "Search"}</span>
                <span className="px-4 truncate">{dateLabel}</span>
                <span className="pl-4 pr-2 truncate font-medium text-[var(--text-subtle)]">{guestLabel}</span>
              </div>
              <div className="bg-theme-primary p-2.5 rounded-full text-white ml-2 shadow-md shadow-theme-primary/20 shrink-0 flex items-center justify-center">
                <Search size={14} strokeWidth={3} />
              </div>
            </button>
          ) : (
            <div className="flex-1 h-full flex items-center w-full">
              <button
                onClick={() => setActiveSection("where")}
                className={`flex-[1.4] h-full flex flex-col items-start px-8 py-3.5 rounded-full transition-all duration-300 group/section ${activeSection === "where"
                  ? "bg-[var(--bg)] shadow-[0_8px_25px_rgba(0,0,0,0.1)] -translate-y-px z-10 opacity-100"
                  : activeSection ? "opacity-80 hover:opacity-100 hover:bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]/80"
                  }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)] mb-1 text-left">Where to?</span>
                <input
                  ref={whereInputRef}
                  type="text"
                  placeholder="Search destinations"
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  className="bg-transparent text-[15px] font-medium w-full text-left outline-none placeholder:text-[var(--text-muted)] text-[var(--text)]"
                />
              </button>

              <div className={`h-8 w-px bg-[var(--border)] transition-opacity duration-300 ${activeSection === "where" || activeSection === "when" ? "opacity-0" : "opacity-100"}`} />

              <button
                onClick={() => setActiveSection("when")}
                className={`flex-1 h-full flex flex-col items-start px-8 py-3.5 rounded-full transition-all duration-300 group/section min-w-0 ${activeSection === "when"
                  ? "bg-[var(--bg)] shadow-[0_8px_25px_rgba(0,0,0,0.1)] -translate-y-px z-10 opacity-100"
                  : activeSection ? "opacity-80 hover:opacity-100 hover:bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]/80"
                  }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)] mb-1 text-left">When?</span>
                <span className={`text-[15px] font-medium w-full text-left ${checkIn || flexibleMonths.length > 0 ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                  {dateLabel}
                </span>
              </button>

              <div className={`h-8 w-px bg-[var(--border)] transition-opacity duration-300 ${activeSection === "when" || activeSection === "who" ? "opacity-0" : "opacity-100"}`} />

              <button
                onClick={() => setActiveSection("who")}
                className={`flex-[1.2] h-full flex flex-col items-start px-8 py-3.5 rounded-full transition-all duration-300 group/section min-w-0 ${activeSection === "who"
                  ? "bg-[var(--bg)] shadow-[0_8px_25px_rgba(0,0,0,0.1)] -translate-y-px z-10 opacity-100"
                  : activeSection ? "opacity-80 hover:opacity-100 hover:bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]/80"
                  }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)] mb-1 text-left">Who&apos;s coming?</span>
                <span className={`text-[15px] font-medium w-full text-left ${totalGuests > 0 ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}>
                  {guestLabel}
                </span>
              </button>

              <div className="pr-2">
                <button className={`flex items-center gap-2 bg-theme-primary text-white font-black uppercase tracking-widest text-[10px] rounded-full transition-all duration-700 shadow-lg hover:scale-[1.03] active:scale-95 group overflow-hidden ${isExpanded ? "px-6 py-4" : "p-4"
                  } ${isFullyQualified ? "shadow-theme-primary/40 ring-4 ring-theme-primary/10 animate-pulse-subtle" : "shadow-theme-primary/20"}`}>
                  <Search size={20} strokeWidth={3} className="shrink-0" />
                  <span className={`transition-all duration-700 origin-left whitespace-nowrap ${isExpanded ? "max-w-[120px] opacity-100 ml-2" : "max-w-0 opacity-0 overflow-hidden"}`}>
                    {isFullyQualified ? "Show homes" : where || checkIn || flexibleMonths.length > 0 ? "Search stays" : "Search"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* DROPDOWNS */}
        <div className={`absolute top-[calc(100%+20px)] left-0 w-full transition-all duration-300 transform origin-top z-[100] ${
          activeSection ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
          }`}>

          {/* WHERE DROPDOWN */}
          {activeSection === "where" && (
            <div className="w-[480px] bg-[var(--card-solid)] rounded-[2.5rem] border border-[var(--border)] shadow-[0_30px_60px_rgba(0,0,0,0.25)] p-8">
              <h4 className="text-[11px] font-semibold text-[var(--text-subtle)] uppercase tracking-[0.15em] mb-6">Popular Destinations</h4>
              <div className="space-y-1.5">
                {DESTINATIONS.map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => { setWhere(dest.title); setActiveSection("when"); }}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:bg-[var(--bg-secondary)] group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-2xl group-hover:scale-110 group-hover:bg-[var(--card-solid)] transition-all duration-300 shadow-sm">
                      {dest.icon}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-[15px] text-[var(--text)] group-hover:text-primary transition-colors">{dest.title}</p>
                      <p className="text-xs font-medium text-[var(--text-muted)]">{dest.subtitle}</p>
                    </div>
                    <div className="ml-auto w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                      <ArrowRight size={14} className="text-primary" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WHEN DROPDOWN */}
          {activeSection === "when" && (
            <div className="fixed top-[10px] left-1/2 -translate-x-1/2 z-[100]
              w-[96vw] md:w-[92vw] lg:w-[min(1180px,92vw)]
              h-auto
              max-h-[calc(100vh-240px)]
              flex flex-col
              overflow-hidden
              backdrop-blur-xl
              bg-[var(--card-solid)]/98
              border border-[var(--border)]
              shadow-[0_60px_120px_-20px_rgba(0,0,0,0.28)]
              rounded-[2.5rem]
              transition-all duration-700 ease-out"
            >
              <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--theme-primary-alpha),transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(251,191,36,0.08),transparent_50%)]" />
              </div>
              <div className="shrink-0 flex justify-center gap-3 mb-2 mt-[15px] z-20 relative">
                <button
                  onClick={() => setDateMode("fixed")}
                  className={`px-8 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all ${dateMode === "fixed" ? "bg-theme-primary text-white shadow-lg shadow-theme-primary/20" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                    }`}
                >Fixed Dates</button>
                <button
                  onClick={() => setDateMode("flexible")}
                  className={`px-8 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all ${dateMode === "flexible" ? "bg-theme-primary text-white shadow-lg shadow-theme-primary/20" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                    }`}
                >Flexible Stay</button>
              </div>

              {/* SHARED CONTENT WRAPPER — PERSISTENT SHELL */}
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden relative z-10">
                {/* BACKGROUND WATERMARK — ULTRA SUBTLE */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
                  <span className="text-[12vw] font-black uppercase tracking-tighter text-[var(--text)] opacity-[0.012] select-none whitespace-nowrap">
                    Find your perfect stay.
                  </span>
                </div>

                {dateMode === "fixed" ? (
                  <>
                    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-6 lg:px-10 py-6">
                      <div className="flex flex-col gap-8 max-w-[1100px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pt-1 lg:pt-2">
                        {/* CALENDAR NAVIGATION & QUICK JUMP */}
                        <div className="flex flex-col gap-6">
                          <div className="flex items-center justify-between px-2">
                            <div className="flex flex-col">
                              <h4 className="text-[18px] font-bold text-[var(--text)] tracking-tight">
                                {calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                <span className="mx-3 opacity-20 font-light">—</span>
                                {new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                              </h4>
                              <p className="text-[12px] font-medium text-[var(--text-subtle)] mt-1">{helperText}</p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 2))}
                                className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-theme-primary hover:text-theme-primary transition-all active:scale-90 bg-[var(--bg-secondary)]/50"
                              >
                                <ChevronLeft size={18} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => setCalendarViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 2))}
                                className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-theme-primary hover:text-theme-primary transition-all active:scale-90 bg-[var(--bg-secondary)]/50"
                              >
                                <ArrowRight size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          </div>

                          {/* QUICK JUMP CHIPS */}
                          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mask-fade-right">
                            {[
                              { label: "Summer Stays", month: 4, icon: "☀️" },
                              { label: "Monsoon Magic", month: 6, icon: "🌧️" },
                              { label: "Festive Season", month: 9, icon: "🪔" },
                              { label: "Winter Escape", month: 11, icon: "🏔️" },
                            ].map((jump, idx) => (
                              <button
                                key={idx}
                                onClick={() => setCalendarViewDate(new Date(2026, jump.month, 1))}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-[12px] font-bold whitespace-nowrap transition-all hover:-translate-y-0.5 active:scale-95 ${calendarViewDate.getMonth() === jump.month
                                  ? "bg-theme-primary text-white border-theme-primary shadow-md shadow-theme-primary/20"
                                  : "bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-subtle)] hover:border-theme-primary/30"
                                  }`}
                              >
                                <span>{jump.icon}</span>
                                {jump.label}
                              </button>
                            ))}
                            <div className="w-px h-6 bg-[var(--border)] mx-2 self-center opacity-30" />
                            {MONTHS.slice(0, 8).map((m, idx) => {
                              const jumpMonth = 4 + idx; // Offset for May 2026
                              return (
                                <button
                                  key={m.id}
                                  onClick={() => setCalendarViewDate(new Date(2026, jumpMonth, 1))}
                                  className={`px-5 py-2.5 rounded-full border text-[12px] font-bold whitespace-nowrap transition-all ${calendarViewDate.getMonth() === jumpMonth
                                    ? "bg-theme-primary/10 text-theme-primary border-theme-primary/20"
                                    : "bg-transparent border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-subtle)]"
                                    }`}
                                >
                                  {m.label.split(' ')[0]}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div key={calendarViewDate.getTime()} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                          <CalendarMonth
                            monthName={calendarViewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            year={calendarViewDate.getFullYear()}
                            month={calendarViewDate.getMonth()}
                            checkIn={checkIn} checkOut={checkOut} hoverDate={hoverDate} onDateClick={handleDateClick} onHover={setHoverDate}
                          />
                          <CalendarMonth
                            monthName={new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            year={new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1).getFullYear()}
                            month={new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1).getMonth()}
                            checkIn={checkIn} checkOut={checkOut} hoverDate={hoverDate} onDateClick={handleDateClick} onHover={setHoverDate}
                          />
                        </div>
                      </div>
                    </div>

                    {/* STICKY BOTTOM ACTION AREA — ADAPTIVE FOOTER */}
                    <div className="shrink-0 sticky bottom-0 px-8 py-4 flex flex-col items-center bg-[var(--card-solid)]/95 backdrop-blur-xl z-30 border-t border-[var(--border)]/10 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                      <div className="flex flex-col items-center gap-2 w-full max-w-2xl">
                        <div className="flex flex-wrap justify-center gap-2.5">
                          {[0, 1, 2, 3, 7].map(days => (
                            <button
                              key={days}
                              onClick={() => setFlexDays(days)}
                              className={`px-4 lg:px-5 py-2 lg:py-2.5 rounded-2xl border-2 text-[10px] lg:text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${flexDays === days
                                ? "border-theme-primary bg-theme-primary/5 text-theme-primary ring-4 ring-theme-primary/10"
                                : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)] bg-[var(--bg-secondary)]/30"
                                }`}
                            >
                              {days === 0 ? "Exact Dates" : `± ${days} days`}
                            </button>
                          ))}
                        </div>

                        {checkIn && (
                          <div className="flex items-center gap-4 text-[13px] font-bold text-[var(--text)] animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[12px] lg:text-[13px] text-theme-primary px-4 lg:px-6 py-2 lg:py-2 bg-theme-primary/5 rounded-[2rem] border border-theme-primary/10 shadow-sm font-black">
                                {checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                {checkOut && ` — ${checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                              </span>
                              <div className="flex items-center gap-3 opacity-40 text-[9px] lg:text-[10px] uppercase tracking-[0.2em] mt-2 font-black">
                                {checkIn && checkOut && (
                                  <>
                                    <span>{Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                                    <span className="w-1 h-1 rounded-full bg-current" />
                                  </>
                                )}
                                <span>{flexDays > 0 ? `±${flexDays} days` : "Exact dates"}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* PROGRESS INDICATOR — SOFT RHYTHM */}
                    <div className="absolute top-0 left-0 w-full h-[2px] flex z-20 overflow-hidden">
                      {[1, 2, 3, 4].map((s) => (
                        <div
                          key={s}
                          className={`h-full transition-all duration-1000 ease-out relative ${s <= flexibleStep ? "bg-theme-primary/60" : "bg-[var(--border)]/5"}`}
                          style={{ width: "25%" }}
                        >
                          {s === flexibleStep && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* COMPOSITE ONBOARDING HEADER */}
                    <div className="shrink-0 px-8 pt-6 pb-2 flex items-center justify-between z-10">
                      {flexibleStep > 1 ? (
                        <button
                          onClick={() => setFlexibleStep(prev => prev - 1)}
                          className="flex items-center gap-2 text-[12px] font-black uppercase tracking-[0.1em] text-[var(--text-subtle)] hover:text-theme-primary transition-all group"
                        >
                          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" strokeWidth={3} />
                          Back
                        </button>
                      ) : <div />}

                      <div className="flex items-center gap-4 bg-[var(--bg-secondary)]/30 px-5 py-1.5 rounded-full border border-[var(--border)]/20 backdrop-blur-md">
                        <div className="flex gap-1.5">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-1 h-1 rounded-full transition-all duration-700 ${i === flexibleStep ? "bg-theme-primary w-3" : i < flexibleStep ? "bg-theme-primary/30" : "bg-[var(--text-subtle)]/10"}`} />
                          ))}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-theme-primary/60">
                          Step 0{flexibleStep}
                        </span>
                      </div>

                      <div className="w-16" /> {/* Spacer for balance */}
                    </div>

                    {/* STEP CONTENT WRAPPER — INTERNAL SCROLL */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide px-8 pb-10">
                      <div className="max-w-5xl mx-auto w-full pt-2">
                        {flexibleStep === 1 && (
                          <div key="step1" className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="text-center space-y-4">
                              <h5 className="text-[32px] lg:text-[42px] font-bold text-[var(--text)] tracking-tight leading-[1.1] selection:bg-theme-primary/10">
                                When can you <span className="text-theme-primary italic font-serif serif">travel</span>?
                              </h5>
                              <p className="text-[15px] lg:text-[17px] text-[var(--text-subtle)] font-medium max-w-xl mx-auto leading-relaxed">
                                Choose your preferred travel windows. <span className="opacity-60 italic">Designed for those who embrace the journey as much as the destination.</span>
                              </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                              {MONTHS.map(m => (
                                <button
                                  key={m.id}
                                  onClick={() => setFlexibleMonths(prev => prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id])}
                                  className={`group relative py-8 px-2 rounded-[2rem] transition-all duration-700 flex flex-col items-center gap-4 overflow-hidden border ${flexibleMonths.includes(m.id)
                                    ? "border-theme-primary bg-white shadow-[0_15px_30px_-10px_var(--theme-primary-alpha)] -translate-y-1.5"
                                    : "border-[var(--border)] bg-[var(--bg-secondary)]/40 hover:bg-white hover:border-theme-primary/30 hover:-translate-y-1"
                                    }`}
                                >
                                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-theme-primary/[0.03] via-transparent to-amber-500/[0.03]`} />

                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[26px] transition-all duration-500 ${flexibleMonths.includes(m.id) ? "bg-theme-primary/5 rotate-[360deg] scale-110 shadow-sm" : "bg-[var(--bg)] group-hover:scale-110"
                                    }`}>
                                    {m.icon}
                                  </div>
                                  <span className={`text-[15px] font-bold tracking-tight text-center ${flexibleMonths.includes(m.id) ? "text-theme-primary" : "text-[var(--text)]"}`}>{m.label}</span>

                                  {flexibleMonths.includes(m.id) && (
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-theme-primary animate-ping" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {flexibleStep === 2 && (
                          <div key="step2" className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="text-center space-y-4">
                              <h5 className="text-[32px] lg:text-[42px] font-bold text-[var(--text)] tracking-tight leading-[1.1]">
                                How long will you <span className="text-theme-primary italic font-serif serif">stay</span>?
                              </h5>
                              <p className="text-[15px] lg:text-[17px] text-[var(--text-subtle)] font-medium max-w-lg mx-auto leading-relaxed">
                                Select your preferred stay length. <span className="opacity-60 italic">Handpicked for your travel rhythm.</span>
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {[
                                { id: "1-2", nights: "1-2 Nights", title: "Weekend Retreat", desc: "A short and sweet weekend getaway.", icon: "🎒" },
                                { id: "2-3", nights: "2-3 Nights", title: "Quick Escape", desc: "A refreshing pause in your rhythm.", icon: "🧳" },
                                { id: "4-7", nights: "4-7 Nights", title: "A Week of Discovery", desc: "Immerse yourself in local culture.", icon: "🌅" },
                                { id: "8-14", nights: "8-14 Nights", title: "Deeper Connections", desc: "Unwind and build lasting memories.", icon: "🌿" },
                                { id: "15-29", nights: "15-29 Nights", title: "Slow Living", desc: "A home away from home. No rush.", icon: "🏡" },
                                { id: "30+", nights: "1 Month+", title: "Enjoy Life", desc: "Immerse completely for 1 month or more.", icon: "🌍" }
                              ].map(d => (
                                <button
                                  key={d.id}
                                  onClick={() => {
                                    setFlexibleDuration(d.id as "1-2" | "2-3" | "4-7" | "8-14" | "15-29" | "30+");
                                  }}
                                  className={`group relative p-8 rounded-[3rem] border transition-all duration-700 text-left flex flex-col gap-6 overflow-hidden ${flexibleDuration === d.id
                                    ? "border-theme-primary bg-white shadow-[0_30px_60px_-15px_var(--theme-primary-alpha)] -translate-y-2"
                                    : "border-[var(--border)] bg-[var(--bg-secondary)]/30 hover:bg-white hover:border-theme-primary/30 hover:-translate-y-1"
                                    }`}
                                >
                                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-theme-primary/[0.03] via-transparent to-amber-500/[0.03]`} />

                                  <div className="flex items-start justify-between relative z-10 w-full">
                                    <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl transition-all duration-700 ${flexibleDuration === d.id ? "bg-theme-primary/5 rotate-[360deg] scale-110 shadow-sm" : "bg-[var(--bg)] group-hover:scale-110"
                                      }`}>
                                      {d.icon}
                                    </div>

                                    <div className={`px-4 py-2.5 rounded-full border text-[12px] font-bold tracking-widest transition-all duration-700 ${flexibleDuration === d.id ? "bg-theme-primary text-white border-theme-primary shadow-md" : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-subtle)]"
                                      }`}>
                                      {d.nights}
                                    </div>
                                  </div>

                                  <div className="space-y-3 relative z-10">
                                    <h6 className={`text-[20px] font-bold tracking-tight ${flexibleDuration === d.id ? "text-theme-primary" : "text-[var(--text)]"}`}>
                                      {d.title}
                                    </h6>
                                    <p className="text-[14px] text-[var(--text-subtle)] font-medium leading-relaxed max-w-[220px] opacity-80">
                                      {d.desc}
                                    </p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {flexibleStep === 3 && (
                          <div key="step3" className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-8 duration-700 pb-8">
                            <div className="text-center space-y-4">
                              <h5 className="text-[32px] lg:text-[42px] font-bold text-[var(--text)] tracking-tight leading-[1.1]">
                                What is your travel <span className="text-theme-primary italic font-serif serif">intent</span>?
                              </h5>
                              <p className="text-[15px] lg:text-[17px] text-[var(--text-subtle)] font-medium max-w-lg mx-auto leading-relaxed">
                                Discover curated escapes aligned with your lifestyle. <span className="opacity-60 italic">Handpicked for slower living.</span>
                              </p>
                            </div>

                            <div className="space-y-10">
                              {STAY_INTENTS.map((category) => (
                                <div key={category.category} className="space-y-8">
                                  <div className="flex items-center gap-6">
                                    <h6 className="text-[12px] font-black uppercase tracking-[0.3em] text-[var(--text-subtle)] opacity-40">
                                      {category.category}
                                    </h6>
                                    <div className="h-px flex-1 bg-[var(--border)] opacity-20" />
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {category.options.map((option) => (
                                      <button
                                        key={option.id}
                                        onClick={() => {
                                          setStayIntent(option.id);
                                        }}
                                        className={`group relative w-full p-8 rounded-[3rem] border transition-all duration-700 ease-out flex flex-col gap-6 overflow-hidden ${stayIntent === option.id
                                          ? "border-theme-primary bg-white shadow-[0_30px_60px_-15px_var(--theme-primary-alpha)] -translate-y-2"
                                          : "border-[var(--border)] bg-[var(--bg-secondary)]/30 hover:bg-white hover:border-theme-primary/30 hover:-translate-y-1"
                                          }`}
                                      >
                                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-theme-primary/[0.03] via-transparent to-amber-500/[0.03]`} />

                                        <div className="flex items-start justify-between relative z-10 w-full">
                                          <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-3xl transition-all duration-700 ${stayIntent === option.id ? "bg-theme-primary/5 rotate-[360deg] scale-110 shadow-sm" : "bg-[var(--bg)] group-hover:scale-110"
                                            }`}>
                                            {option.icon}
                                          </div>
                                          {option.cue && (
                                            <div className={`px-4 py-2.5 rounded-full border text-[12px] font-bold tracking-widest flex items-center gap-1.5 transition-all duration-700 ${stayIntent === option.id ? "bg-theme-primary text-white border-theme-primary shadow-md" : "bg-[var(--bg)] border-[var(--border)] text-[var(--text-subtle)]"
                                              }`}>
                                              <Sparkles size={12} strokeWidth={2.5} />
                                              {option.cue}
                                            </div>
                                          )}
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                          <h6 className={`text-[20px] font-bold tracking-tight ${stayIntent === option.id ? "text-theme-primary" : "text-[var(--text)]"}`}>
                                            {option.label}
                                          </h6>
                                          <p className="text-[14px] text-[var(--text-subtle)] font-medium leading-relaxed max-w-[220px] opacity-80">
                                            {option.subtitle}
                                          </p>
                                        </div>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {flexibleStep === 4 && (
                          <div key="step4" className="w-full max-w-5xl mx-auto flex flex-col items-center space-y-12 animate-in fade-in zoom-in duration-1000 py-10 relative">
                            {/* RADIANT GLOW BEHIND CONTENT */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-theme-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

                            <div className="text-center space-y-6">
                              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-theme-primary/10 border border-theme-primary/20 text-theme-primary text-[10px] font-black uppercase tracking-[0.25em] animate-pulse-subtle">
                                <Sparkles size={14} />
                                Curated for you
                              </div>
                              <h5 className="text-[32px] lg:text-[48px] font-bold text-[var(--text)] tracking-tight leading-tight">
                                Your discovery <span className="text-theme-primary italic font-serif serif">hub</span> is ready
                              </h5>
                              <p className="text-[15px] lg:text-[18px] text-[var(--text-subtle)] font-medium max-w-2xl mx-auto leading-relaxed">
                                We&apos;ve woven together your preferences to create a personalized travel narrative. <span className="italic opacity-70">Your next adventure begins here.</span>
                              </p>
                            </div>

                            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                              {[
                                {
                                  label: "Travel Window",
                                  value: flexibleMonths.join(' & ') || "Anytime",
                                  icon: MONTHS.find(m => m.id === flexibleMonths[0])?.icon || "📅",
                                  desc: "Selected timeframes"
                                },
                                {
                                  label: "Duration",
                                  value: flexibleDuration === "30+" ? "1 Month+" : `${flexibleDuration} Nights`,
                                  icon: [
                                    { id: "1-2", icon: "🎒" },
                                    { id: "2-3", icon: "🧳" },
                                    { id: "4-7", icon: "🌅" },
                                    { id: "8-14", icon: "🌿" },
                                    { id: "15-29", icon: "🏡" },
                                    { id: "30+", icon: "🌍" }
                                  ].find(d => d.id === flexibleDuration)?.icon || "⏳",
                                  desc: "Your travel rhythm"
                                },
                                {
                                  label: "Stay Style",
                                  value: STAY_INTENTS.flatMap(c => c.options).find(o => o.id === stayIntent)?.label || "Exploration",
                                  icon: STAY_INTENTS.flatMap(c => c.options).find(o => o.id === stayIntent)?.icon || "✨",
                                  desc: "Lifestyle alignment"
                                }
                              ].map((item, idx) => (
                                <div
                                  key={idx}
                                  className="group relative bg-white/50 backdrop-blur-md rounded-[2.5rem] p-10 border border-[var(--border)]/40 hover:border-theme-primary/30 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col items-center text-center gap-6 overflow-hidden"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-br from-theme-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                  <div className="w-20 h-20 rounded-[2rem] bg-[var(--bg-secondary)]/50 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 group-hover:bg-theme-primary/5 transition-all duration-700 border border-[var(--border)]/20 relative z-10">
                                    {item.icon}
                                  </div>

                                  <div className="space-y-3 relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-primary/60">{item.label}</p>
                                    <p className="text-[20px] font-bold text-[var(--text)] tracking-tight">{item.value}</p>
                                    <p className="text-[12px] text-[var(--text-subtle)] font-medium opacity-60 italic">{item.desc}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* STICKY BOTTOM ACTION AREA */}
                    <div className="shrink-0 sticky bottom-0 px-8 py-6 flex flex-col items-center bg-[var(--card-solid)]/95 backdrop-blur-xl z-30 transition-all duration-500 border-t border-[var(--border)]/10 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                      {flexibleStep < 4 && (
                        <button
                          disabled={flexibleStep === 1 && flexibleMonths.length === 0}
                          onClick={() => setFlexibleStep(prev => prev + 1)}
                          className={`group px-12 py-5 rounded-full font-bold uppercase tracking-[0.2em] text-[12px] transition-all duration-700 flex items-center gap-5 ${(flexibleStep === 1 && flexibleMonths.length === 0)
                            ? "bg-[var(--bg-secondary)] text-[var(--text-subtle)] opacity-50 cursor-not-allowed"
                            : "bg-theme-primary text-white shadow-[0_20px_40px_-10px_var(--theme-primary-alpha)] hover:shadow-[0_25px_50px_-12px_var(--theme-primary-alpha)] hover:scale-[1.03] active:scale-95"
                            }`}
                        >
                          <span className="relative z-10">
                            {flexibleStep === 1 ? "Continue Your Journey" :
                              flexibleStep === 2 ? "Select Your Rhythm" :
                                "Explore Curated Stays"}
                          </span>
                          <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-2 transition-transform duration-500" />
                        </button>
                      )}

                      {flexibleStep === 4 && (
                        <div className="flex flex-col items-center gap-6 w-full max-w-md">
                          <button
                            onClick={() => { setActiveSection(null); setIsExpanded(false); }}
                            className="w-full px-12 py-6 rounded-full bg-theme-primary text-white font-bold uppercase tracking-[0.25em] text-[13px] transition-all duration-700 shadow-[0_30px_60px_-15px_var(--theme-primary-alpha)] hover:shadow-[0_35px_70px_-15px_var(--theme-primary-alpha)] hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-5 group overflow-hidden relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            <span className="relative z-10">Discover Your Escape</span>
                            <Sparkles size={20} className="group-hover:scale-125 transition-transform duration-700 text-amber-200" strokeWidth={2} />
                          </button>

                          <button
                            onClick={() => setFlexibleStep(1)}
                            className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-subtle)] hover:text-theme-primary transition-all opacity-60 hover:opacity-100 flex items-center gap-4"
                          >
                            <span className="w-8 h-px bg-[var(--border)]" />
                            Start over and refine
                            <span className="w-8 h-px bg-[var(--border)]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* WHO DROPDOWN */}
          {activeSection === "who" && (
            <div className="absolute right-0 w-[450px] bg-[var(--card-solid)] rounded-[2.5rem] border border-[var(--border)] shadow-[0_30px_60px_rgba(0,0,0,0.25)] p-10">
              <div className="mb-8 text-center animate-in zoom-in-95 duration-300">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-theme-primary bg-theme-primary/10 px-6 py-2 rounded-full border border-theme-primary/10">
                  {totalGuests === 0 ? "Add guests" :
                    guests.adults === 2 && totalGuests === 2 ? "Couple getaway 👩‍❤️‍👨" :
                      guests.adults >= 3 && (guests.children === 0 && guests.seniors === 0) ? "Group stay 🏕️" :
                        guests.adults === 1 && totalGuests === 1 ? "Solo exploration 🎒" :
                          "Family trip 👨‍👩‍👧‍👦"}
                </span>
              </div>
              <div className="space-y-8">
                <GuestRow emoji="🧍" title="Adults" subtitle="Ages 13 or above" count={guests.adults} onAdd={() => handleGuestChange("adults", "add")} onSub={() => handleGuestChange("adults", "sub")} />
                <GuestRow emoji="🧓" title="Senior Citizen" subtitle="Ages 60 or above" count={guests.seniors} onAdd={() => handleGuestChange("seniors", "add")} onSub={() => handleGuestChange("seniors", "sub")} />
                <GuestRow emoji="👦" title="Children" subtitle="Ages 2–12" count={guests.children} onAdd={() => handleGuestChange("children", "add")} onSub={() => handleGuestChange("children", "sub")} />
                <GuestRow emoji="👶" title="Infants" subtitle="Under 2" count={guests.infants} onAdd={() => handleGuestChange("infants", "add")} onSub={() => handleGuestChange("infants", "sub")} />
                <GuestRow emoji="🐕" title="Pets" subtitle="Furry Friend" count={guests.pets} onAdd={() => handleGuestChange("pets", "add")} onSub={() => handleGuestChange("pets", "sub")} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

SearchBar.displayName = "SearchBar";

export default SearchBar;

interface CalendarMonthProps {
  monthName: string;
  year: number;
  month: number;
  checkIn: Date | null;
  checkOut: Date | null;
  hoverDate: Date | null;
  onDateClick: (date: Date) => void;
  onHover: (date: Date | null) => void;
}

function CalendarMonth({ monthName, year, month, checkIn, checkOut, hoverDate, onDateClick, onHover }: CalendarMonthProps) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isSelected = (d: number) => {
    const date = new Date(year, month, d);
    if (checkIn && date.getTime() === checkIn.getTime()) return "start";
    if (checkOut && date.getTime() === checkOut.getTime()) return "end";
    if (checkIn && checkOut && date > checkIn && date < checkOut) return "range";
    if (checkIn && !checkOut && hoverDate && date > checkIn && date <= hoverDate) return "preview";
    return null;
  };

  return (
    <div className="space-y-4">
      <h5 className="text-center font-semibold text-[var(--text)] text-sm tracking-widest uppercase opacity-60">{monthName}</h5>
      <div className="grid grid-cols-7 gap-y-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d} className="text-[10px] font-semibold text-[var(--text-subtle)] text-center uppercase mb-2">{d}</span>)}
        {Array(firstDay).fill(0).map((_, i) => <div key={i} />)}
        {days.map(d => {
          const state = isSelected(d);
          const date = new Date(year, month, d);
          const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <button
              key={d}
              onMouseEnter={() => !isPast && onHover(date)}
              onMouseLeave={() => onHover(null)}
              disabled={isPast}
              onClick={() => onDateClick(date)}
              className={`relative aspect-square flex flex-col items-center justify-center text-xs font-bold transition-all z-10 ${isPast ? "opacity-20 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                } ${state === "start" || state === "end" ? "text-white" : "text-[var(--text)]"
                }`}
            >
              {state && (
                <div className={`absolute inset-0 z-[-1] transition-all duration-300 ${state === "start" ? "bg-theme-primary rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.3)] scale-110" :
                  state === "end" ? "bg-theme-primary rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.2)] scale-110" :
                    state === "range" ? "bg-theme-primary/10 w-[100%] h-[70%] top-1/2 -translate-y-1/2" :
                      "bg-theme-primary/5 w-[100%] h-[70%] top-1/2 -translate-y-1/2 border-y border-dashed border-theme-primary/20"
                  }`} />
              )}
              {d}
              {!isPast && <span className="text-[7px] font-black opacity-30 group-hover:opacity-100 group-hover:text-theme-primary transition-all mt-0.5">₹4,200</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface GuestRowProps {
  emoji: string;
  title: string;
  subtitle: string;
  count: number;
  onAdd: () => void;
  onSub: () => void;
}

function GuestRow({ emoji, title, subtitle, count, onAdd, onSub }: GuestRowProps) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-5">
        <div
          key={count}
          className="w-12 h-12 flex-shrink-0 rounded-2xl bg-[var(--bg-secondary)]/50 flex items-center justify-center text-[22px] border border-[var(--border)] group-hover:scale-110 group-hover:bg-theme-primary/5 group-hover:border-theme-primary/30 transition-all duration-500 shadow-sm animate-pop"
        >
          {emoji}
        </div>
        <div className="space-y-1.5">
          <h4 className="text-[15px] font-bold text-[var(--text)] group-hover:text-theme-primary transition-colors tracking-tight whitespace-nowrap">{title}</h4>
          <p className="text-[10px] text-[var(--text-subtle)] font-semibold uppercase tracking-[0.1em] whitespace-nowrap">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button
          onClick={(e) => { e.stopPropagation(); onSub(); }}
          disabled={count === (title === "Adults" ? 1 : 0)}
          className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-theme-primary hover:text-theme-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90 bg-[var(--bg-secondary)]/50"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
        <span key={count} className="w-6 text-center text-lg font-black text-[var(--text)] animate-in zoom-in-75 fade-in duration-300">{count}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-theme-primary hover:text-theme-primary transition-all shadow-sm active:scale-90 bg-[var(--bg-secondary)]/50"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

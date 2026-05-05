"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Calendar as CalendarIcon, Minus, Plus, ArrowRight } from "lucide-react";

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
  "May", "June", "July", "August", "September", "October"
];

const SearchBar = React.memo(({ isScrolled = false }: SearchBarProps) => {
  const [activeSection, setActiveSection] = useState<"where" | "when" | "who" | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Search State
  const [where, setWhere] = useState("");
  const [guests, setGuests] = useState({ adults: 1, seniors: 0, children: 0, infants: 0, pets: 0 });
  
  // Date State
  const [dateMode, setDateMode] = useState<"fixed" | "flexible">("fixed");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [flexDays, setFlexDays] = useState(0);
  const [flexibleMonths, setFlexibleMonths] = useState<string[]>([]);
  const [flexibleDuration, setFlexibleDuration] = useState<"weekend" | "week" | "custom">("week");
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [helperText, setHelperText] = useState("Select your check-in date");

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
  const guestLabel = totalGuests > 0 ? `${totalGuests} guests` : "Add guests";
  
  const dateLabel = dateMode === "fixed" 
    ? (checkIn ? `${checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}${checkOut ? ` - ${checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}` : "Add dates")
    : (flexibleMonths.length > 0 ? `${flexibleDuration === 'weekend' ? 'Weekend' : flexibleDuration === 'week' ? 'Week' : 'Custom'} in ${flexibleMonths.join(', ')}` : "Anytime");

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
        className={`fixed -inset-[200vh] bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 z-[35] ${
          isExpanded ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => { setActiveSection(null); setIsExpanded(false); }}
      />

      <div 
        ref={searchRef}
        className={`relative mx-auto h-[72px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-[40] ${
          isExpanded 
            ? "w-full max-w-[920px] -translate-y-3" 
            : isScrolled 
              ? "w-[420px]" 
              : "w-full max-w-[880px]"
        }`}
      >
        <div 
          className={`relative h-full flex items-center p-2 rounded-full border border-[var(--border)] bg-[var(--card-solid)] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isExpanded 
              ? "shadow-[0_25px_50px_rgba(0,0,0,0.25)] bg-[var(--card-solid)]" 
              : "shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_25px_rgba(0,0,0,0.1)]"
          }`}
        >
          {isScrolled && !isExpanded ? (
            <button 
              onClick={() => setIsExpanded(true)}
              className="flex-1 h-full flex items-center px-4 py-2 divide-x divide-[var(--border)] min-w-0"
            >
              <span className="flex-[1.2] text-[13px] font-bold text-[var(--text)] text-left px-3 truncate min-w-0">{where || "Search"}</span>
              <span className="flex-1 text-[13px] font-bold text-[var(--text)] text-center px-3 truncate min-w-0">{dateLabel}</span>
              <div className="flex-[1.1] flex items-center justify-between pl-3 min-w-0">
                <span className="text-[13px] font-bold text-[var(--text)] truncate min-w-0">{guestLabel}</span>
                <div className="bg-theme-primary p-2 rounded-full text-white ml-2 shadow-lg shadow-theme-primary/20 shrink-0">
                  <Search size={12} strokeWidth={4} />
                </div>
              </div>
            </button>
          ) : (
            <div className="flex-1 h-full flex items-center w-full">
              <button 
                onClick={() => setActiveSection("where")}
                className={`flex-[1.4] h-full flex flex-col items-start px-8 py-3.5 rounded-full transition-all duration-300 group/section ${
                  activeSection === "where" 
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
                className={`flex-1 h-full flex flex-col items-start px-8 py-3.5 rounded-full transition-all duration-300 group/section min-w-0 ${
                  activeSection === "when" 
                    ? "bg-[var(--bg)] shadow-[0_8px_25px_rgba(0,0,0,0.1)] -translate-y-px z-10 opacity-100" 
                    : activeSection ? "opacity-80 hover:opacity-100 hover:bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]/80"
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)] mb-1 text-left">When?</span>
                <span className={`text-[15px] font-medium truncate w-full text-left ${checkIn || flexibleMonths.length > 0 ? "text-[var(--text)]" : "text-[var(--text-subtle)]"}`}>
                  {dateLabel}
                </span>
              </button>

              <div className={`h-8 w-px bg-[var(--border)] transition-opacity duration-300 ${activeSection === "when" || activeSection === "who" ? "opacity-0" : "opacity-100"}`} />

              <button 
                onClick={() => setActiveSection("who")}
                className={`flex-[1.2] h-full flex flex-col items-start px-8 py-3.5 rounded-full transition-all duration-300 group/section min-w-0 ${
                  activeSection === "who" 
                    ? "bg-[var(--bg)] shadow-[0_8px_25px_rgba(0,0,0,0.1)] -translate-y-px z-10 opacity-100" 
                    : activeSection ? "opacity-80 hover:opacity-100 hover:bg-[var(--bg-secondary)]" : "hover:bg-[var(--bg-secondary)]/80"
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-subtle)] mb-1 text-left">Who&apos;s coming?</span>
                <span className={`text-[15px] font-medium truncate w-full text-left ${totalGuests > 0 ? "text-[var(--text)]" : "text-[var(--text-subtle)]"}`}>
                  {guestLabel}
                </span>
              </button>

              <div className="pr-2">
                <button className={`flex items-center gap-2 bg-theme-primary text-white font-black uppercase tracking-widest text-[10px] rounded-full transition-all duration-700 shadow-lg hover:scale-[1.03] active:scale-95 group overflow-hidden ${
                  isExpanded ? "px-6 py-4" : "p-4"
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
        <div className={`absolute top-[calc(100%+20px)] left-0 w-full transition-all duration-300 transform origin-top ${
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
            <div className="bg-[var(--card-solid)] rounded-[2.5rem] border border-[var(--border)] shadow-[0_30px_60px_rgba(0,0,0,0.25)] p-12">
              <div className="flex justify-center gap-3 mb-10">
                 <button 
                   onClick={() => setDateMode("fixed")}
                   className={`px-8 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all ${
                     dateMode === "fixed" ? "bg-theme-primary text-white shadow-lg shadow-theme-primary/20" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                   }`}
                 >Fixed Dates</button>
                 <button 
                   onClick={() => setDateMode("flexible")}
                   className={`px-8 py-2.5 rounded-full text-[13px] font-black uppercase tracking-widest transition-all ${
                     dateMode === "flexible" ? "bg-theme-primary text-white shadow-lg shadow-theme-primary/20" : "bg-[var(--bg-secondary)] text-[var(--text-muted)]"
                   }`}
                 >Flexible Stay</button>
              </div>
              
              {dateMode === "fixed" ? (
                <>
                  <div className="text-center mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-theme-primary bg-theme-primary/10 px-6 py-2 rounded-full border border-theme-primary/10 shadow-sm">
                      {helperText}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-16">
                    <CalendarMonth monthName="May 2026" year={2026} month={4} checkIn={checkIn} checkOut={checkOut} hoverDate={hoverDate} onDateClick={handleDateClick} onHover={setHoverDate} />
                    <CalendarMonth monthName="June 2026" year={2026} month={5} checkIn={checkIn} checkOut={checkOut} hoverDate={hoverDate} onDateClick={handleDateClick} onHover={setHoverDate} />
                  </div>
                  <div className="mt-12 pt-10 border-t border-[var(--border)] flex flex-col items-center gap-8">
                     <div className="flex justify-center gap-3">
                      {[0, 1, 2, 3, 7].map(days => (
                        <button 
                          key={days} 
                          onClick={() => setFlexDays(days)}
                          className={`px-8 py-3.5 rounded-2xl border-2 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                            flexDays === days 
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
                           <span className="text-[15px] text-theme-primary px-5 py-2.5 bg-theme-primary/10 rounded-2xl border border-theme-primary/20 shadow-md">
                             {checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                             {checkOut && ` — ${checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                           </span>
                           <div className="flex items-center gap-2 opacity-50 text-[10px] uppercase tracking-widest">
                             {checkIn && checkOut && (
                               <>
                                 <span>{Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                                 <span>•</span>
                               </>
                             )}
                             <span>{flexDays > 0 ? `±${flexDays} days` : "Exact dates"}</span>
                           </div>
                         </div>
                       </div>
                     )}
                  </div>
                </>
              ) : (
                  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center space-y-8">
                    <div className="space-y-4">
                      <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-subtle)] opacity-50">When do you want to go?</h5>
                      <div className="flex flex-wrap justify-center gap-4">
                        {MONTHS.map(m => (
                          <button 
                            key={m}
                            onClick={() => setFlexibleMonths(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                            className={`w-36 py-10 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-3 group relative overflow-hidden ${
                              flexibleMonths.includes(m) ? "border-theme-primary bg-theme-primary/5 ring-4 ring-theme-primary/10" : "border-[var(--border)] hover:border-theme-primary/40 bg-[var(--bg-secondary)]/30"
                            }`}
                          >
                            <CalendarIcon className={flexibleMonths.includes(m) ? "text-theme-primary" : "text-[var(--text-muted)]"} size={24} />
                            <span className={`text-[15px] font-black ${flexibleMonths.includes(m) ? "text-theme-primary" : "text-[var(--text)]"}`}>{m}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {flexibleMonths.length > 0 && (
                      <div className="flex items-center justify-center gap-2 text-[13px] font-bold text-theme-primary animate-in zoom-in duration-300">
                        <span className="opacity-40 text-[var(--text)]">Selected:</span>
                        <span className="px-4 py-1.5 bg-theme-primary/10 rounded-full">{flexibleDuration} in {flexibleMonths.join(', ')}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-4">
                    <h5 className="text-[11px] font-black uppercase tracking-widest text-[var(--text-subtle)]">How long do you want to stay?</h5>
                    <div className="flex justify-center gap-3">
                      {["weekend", "week", "custom"].map(d => (
                        <button 
                          key={d}
                          onClick={() => { setFlexibleDuration(d as "weekend" | "week" | "custom"); if(flexibleMonths.length > 0) setTimeout(() => setActiveSection("who"), 300); }}
                          className={`px-10 py-3 rounded-full border transition-all text-sm font-bold capitalize ${
                            flexibleDuration === d ? "border-theme-primary bg-theme-primary/10 text-theme-primary shadow-sm" : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* WHO DROPDOWN */}
          {activeSection === "who" && (
            <div className="absolute right-0 w-[420px] bg-[var(--card-solid)] rounded-[2.5rem] border border-[var(--border)] shadow-[0_30px_60px_rgba(0,0,0,0.25)] p-12">
              <div className="mb-10 text-center animate-in zoom-in-95 duration-300">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-theme-primary bg-theme-primary/10 px-6 py-2 rounded-full border border-theme-primary/10">
                  {totalGuests === 1 ? "Solo trip 🎒" : totalGuests === 2 ? "Couple getaway 🥂" : totalGuests > 2 ? "Group stay 🏕️" : "Add guests"}
                </span>
              </div>
              <div className="space-y-10">
                <GuestRow title="Adults" subtitle="Ages 13 or above" count={guests.adults} onAdd={() => handleGuestChange("adults", "add")} onSub={() => handleGuestChange("adults", "sub")} />
                <GuestRow title="Senior Citizen" subtitle="Ages 60 or above" count={guests.seniors} onAdd={() => handleGuestChange("seniors", "add")} onSub={() => handleGuestChange("seniors", "sub")} />
                <GuestRow title="Children" subtitle="Ages 2–12" count={guests.children} onAdd={() => handleGuestChange("children", "add")} onSub={() => handleGuestChange("children", "sub")} />
                <GuestRow title="Infants" subtitle="Under 2" count={guests.infants} onAdd={() => handleGuestChange("infants", "add")} onSub={() => handleGuestChange("infants", "sub")} />
                <GuestRow title="Pets" subtitle="Bringing a service animal?" count={guests.pets} onAdd={() => handleGuestChange("pets", "add")} onSub={() => handleGuestChange("pets", "sub")} />
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
    <div className="space-y-6">
      <h5 className="text-center font-semibold text-[var(--text)] text-sm tracking-widest uppercase opacity-60">{monthName}</h5>
      <div className="grid grid-cols-7 gap-y-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <span key={d} className="text-[10px] font-semibold text-[var(--text-subtle)] text-center uppercase mb-2">{d}</span>)}
        {Array(firstDay).fill(0).map((_, i) => <div key={i} />)}
        {days.map(d => {
          const state = isSelected(d);
          const date = new Date(year, month, d);
          const isPast = date < new Date(new Date().setHours(0,0,0,0));

          return (
            <button 
              key={d} 
              onMouseEnter={() => !isPast && onHover(date)}
              onMouseLeave={() => onHover(null)}
              disabled={isPast}
              onClick={() => onDateClick(date)} 
              className={`relative aspect-square flex flex-col items-center justify-center text-xs font-bold transition-all z-10 ${
                isPast ? "opacity-20 cursor-not-allowed" : "hover:scale-110 active:scale-95"
              } ${
                state === "start" || state === "end" ? "text-white" : "text-[var(--text)]"
              }`}
            >
              {state && (
                <div className={`absolute inset-0 z-[-1] transition-all duration-300 ${
                  state === "start" ? "bg-theme-primary rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.3)] scale-110" : 
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
  title: string;
  subtitle: string;
  count: number;
  onAdd: () => void;
  onSub: () => void;
}

function GuestRow({ title, subtitle, count, onAdd, onSub }: GuestRowProps) {
  return (
    <div className="flex items-center justify-between group">
      <div className="space-y-1.5">
        <h4 className="text-[15px] font-bold text-[var(--text)] group-hover:text-theme-primary transition-colors tracking-tight">{title}</h4>
        <p className="text-[10px] text-[var(--text-subtle)] font-semibold uppercase tracking-[0.1em]">{subtitle}</p>
      </div>
      <div className="flex items-center gap-6">
        <button 
          onClick={(e) => { e.stopPropagation(); onSub(); }}
          disabled={count === (title === "Adults" ? 1 : 0)}
          className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-theme-primary hover:text-theme-primary disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90 bg-[var(--bg-secondary)]/50"
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
        <span className="w-5 text-center text-lg font-black text-[var(--text)]">{count}</span>
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

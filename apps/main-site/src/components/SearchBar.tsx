"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Calendar, Users, Minus, Plus } from "lucide-react";

interface SearchBarProps {
  isScrolled?: boolean;
}

export default function SearchBar({ isScrolled = false }: SearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0, pets: 0 });
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
        setActiveSegment(null);
        setIsGuestDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalGuests = guests.adults + guests.children;
  const guestLabel = totalGuests > 0 ? `${totalGuests} guests` : "Add guests";

  const handleGuestChange = (type: keyof typeof guests, operation: "add" | "sub") => {
    setGuests(prev => ({
      ...prev,
      [type]: operation === "add" ? prev[type] + 1 : Math.max(0, prev[type] - 1)
    }));
  };

  return (
    <div 
      ref={searchRef}
      className={`relative mx-auto transition-all duration-500 ease-[cubic-bezier(0.35,0,0.65,1)] z-40 ${
        isScrolled && !isExpanded 
          ? "w-[300px] h-[48px] mt-0" 
          : isExpanded 
            ? "w-full max-w-[850px] h-[66px] mt-4" 
            : "w-full max-w-[350px] h-[64px] mt-8"
      }`}
    >
      {/* Search Bar Container */}
      <div 
        onClick={() => setIsExpanded(true)}
        className={`w-full h-full rounded-full border border-gray-200 bg-white flex items-center transition-all duration-300 cursor-pointer overflow-hidden ${
          isExpanded 
            ? "shadow-[0_15px_30px_rgba(0,0,0,0.1)] bg-gray-100" 
            : "shadow-md hover:shadow-lg"
        }`}
      >
        {!isExpanded ? (
          /* COLLAPSED STATE */
          <div className="flex items-center w-full px-4 divide-x divide-gray-200">
            <div className="flex-1 text-sm font-semibold text-gray-800 truncate px-2">Anywhere</div>
            <div className="flex-1 text-sm font-semibold text-gray-800 truncate px-2 text-center">Anytime</div>
            <div className="flex-1 flex items-center justify-between pl-2">
              <span className="text-sm font-medium text-gray-500 truncate">{guestLabel}</span>
              <div className="bg-primary p-2 rounded-full text-white ml-2">
                <Search size={14} strokeWidth={3} />
              </div>
            </div>
          </div>
        ) : (
          /* EXPANDED STATE */
          <div className="flex items-center w-full h-full relative group">
            {/* WHERE */}
            <div 
              onClick={(e) => { e.stopPropagation(); setActiveSegment("where"); }}
              className={`flex-1 h-full flex flex-col justify-center px-8 rounded-full transition-all duration-200 ${
                activeSegment === "where" ? "bg-white shadow-xl" : "hover:bg-gray-200/50"
              }`}
            >
              <label className="text-[12px] font-bold text-gray-800 uppercase tracking-tight">Where</label>
              <input 
                autoFocus
                type="text" 
                placeholder="Search destinations" 
                className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full font-medium"
              />
            </div>

            <div className={`h-8 w-[1px] bg-gray-200 transition-opacity ${activeSegment === "where" || activeSegment === "checkin" ? "opacity-0" : "opacity-100"}`} />

            {/* CHECK IN */}
            <div 
              onClick={(e) => { e.stopPropagation(); setActiveSegment("checkin"); }}
              className={`flex-[0.7] h-full flex flex-col justify-center px-8 rounded-full transition-all duration-200 ${
                activeSegment === "checkin" ? "bg-white shadow-xl" : "hover:bg-gray-200/50"
              }`}
            >
              <label className="text-[12px] font-bold text-gray-800 uppercase tracking-tight">Check in</label>
              <span className="text-sm text-gray-400 font-medium">Add dates</span>
            </div>

            <div className={`h-8 w-[1px] bg-gray-200 transition-opacity ${activeSegment === "checkin" || activeSegment === "checkout" ? "opacity-0" : "opacity-100"}`} />

            {/* CHECK OUT */}
            <div 
              onClick={(e) => { e.stopPropagation(); setActiveSegment("checkout"); }}
              className={`flex-[0.7] h-full flex flex-col justify-center px-8 rounded-full transition-all duration-200 ${
                activeSegment === "checkout" ? "bg-white shadow-xl" : "hover:bg-gray-200/50"
              }`}
            >
              <label className="text-[12px] font-bold text-gray-800 uppercase tracking-tight">Check out</label>
              <span className="text-sm text-gray-400 font-medium">Add dates</span>
            </div>

            <div className={`h-8 w-[1px] bg-gray-200 transition-opacity ${activeSegment === "checkout" || activeSegment === "guests" ? "opacity-0" : "opacity-100"}`} />

            {/* GUESTS */}
            <div 
              onClick={(e) => { 
                e.stopPropagation(); 
                setActiveSegment("guests"); 
                setIsGuestDropdownOpen(true);
              }}
              className={`flex-1 h-full flex items-center justify-between px-8 rounded-full transition-all duration-200 ${
                activeSegment === "guests" ? "bg-white shadow-xl" : "hover:bg-gray-200/50"
              }`}
            >
              <div className="flex flex-col justify-center overflow-hidden">
                <label className="text-[12px] font-bold text-gray-800 uppercase tracking-tight">Who</label>
                <span className={`text-sm truncate font-medium ${totalGuests > 0 ? "text-gray-800" : "text-gray-400"}`}>
                  {guestLabel}
                </span>
              </div>
              
              <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white p-3.5 rounded-full transition-all duration-300 shadow-md group-hover:pr-6">
                <Search size={18} strokeWidth={3} />
                <span className="text-sm font-bold hidden group-hover:block transition-all animate-in fade-in slide-in-from-left-2">Search</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Guest Dropdown */}
      {isGuestDropdownOpen && activeSegment === "guests" && (
        <div className="absolute top-[calc(100%+12px)] right-0 w-[400px] bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border border-gray-100 p-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="space-y-6">
            <GuestRow 
              title="Adults" 
              subtitle="Ages 13 or above" 
              count={guests.adults} 
              onAdd={() => handleGuestChange("adults", "add")} 
              onSub={() => handleGuestChange("adults", "sub")} 
            />
            <hr className="border-gray-50" />
            <GuestRow 
              title="Children" 
              subtitle="Ages 2–12" 
              count={guests.children} 
              onAdd={() => handleGuestChange("children", "add")} 
              onSub={() => handleGuestChange("children", "sub")} 
            />
            <hr className="border-gray-50" />
            <GuestRow 
              title="Infants" 
              subtitle="Under 2" 
              count={guests.infants} 
              onAdd={() => handleGuestChange("infants", "add")} 
              onSub={() => handleGuestChange("infants", "sub")} 
            />
            <hr className="border-gray-50" />
            <GuestRow 
              title="Pets" 
              subtitle="Bringing a service animal?" 
              count={guests.pets} 
              onAdd={() => handleGuestChange("pets", "add")} 
              onSub={() => handleGuestChange("pets", "sub")} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GuestRow({ title, subtitle, count, onAdd, onSub }: any) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 font-medium">{subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onSub}
          disabled={count === 0}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-900 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Minus size={16} />
        </button>
        <span className="w-4 text-center text-sm font-bold text-gray-900">{count}</span>
        <button 
          onClick={onAdd}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

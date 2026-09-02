"use client";

import React from "react";
import { format, startOfDay, isAfter, isBefore, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { RoomGroup, Reservation } from "./types";
import { getBookingPosition } from "./calendar-utils";

interface DayViewProps {
  selectedDate: Date;
  roomGroups: RoomGroup[];
  reservations: Reservation[];
  onBookingClick?: (res: Reservation) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  roomGroups,
  reservations,
  onBookingClick,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentTime = new Date();
  const isSelectedDayToday = startOfDay(selectedDate).getTime() === startOfDay(currentTime).getTime();

  const timeIndicatorPos = isSelectedDayToday 
    ? ((currentTime.getHours() * 60 + currentTime.getMinutes()) / 1440) * 100 
    : null;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden bg-white/30 dark:bg-black/10">
      {/* 1. Header: Time Blocks (Fluid) */}
      <div className="flex bg-white/80 dark:bg-[#0A0F1D]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 z-[30]">
        <div className="w-[200px] shrink-0 bg-white dark:bg-[#0A0F1D] p-5 border-r border-black/5 dark:border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]">Rooms</span>
        </div>
        <div className="flex-1 flex">
          {hours.map(hour => (
            <div 
              key={hour} 
              className="flex-1 flex flex-col items-center justify-center h-16 border-r border-[#0E5A75]/5 last:border-r-0"
            >
              <span className="text-[9px] font-black text-[#0E5A75] opacity-40">
                {format(new Date().setHours(hour, 0), "HH")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Grid Area (Fixed View, No Scroll) */}
      <div className="flex-1 flex flex-col min-h-0 select-none relative">
        <div className="flex-1 flex flex-col">
          {roomGroups.map((group) => (
            <div key={group.name} className="contents">
              {/* Group Header - Compact */}
              <div className="flex items-center h-7 px-4 bg-[#0E5A75]/5 border-b border-[#0E5A75]/10">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0E5A75]">{group.name}</span>
              </div>

              {group.rooms.map((room) => (
                <div key={room.id} className="flex flex-1 border-b border-black/5 dark:border-white/5 hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300">
                  {/* Room Sidebar */}
                  <div className="w-[200px] shrink-0 bg-white/60 dark:bg-[#0A0F1D]/60 p-3 border-r border-black/5 dark:border-white/5 flex items-center gap-3">
                    <div className={cn(
                      "w-1 h-5 rounded-full",
                      room.status === "clean" ? "bg-[#159665]" : 
                      room.status === "dirty" ? "bg-[#F24633]" : 
                      room.status === "housekeeping" ? "bg-[#FCBC43]" : "bg-[#0983B0]"
                    )} />
                    <p className="text-[11px] font-black text-[#053344] dark:text-white truncate">{room.name}</p>
                  </div>

                  {/* Fluid Hour Content */}
                  <div className="flex-1 flex relative">
                    {/* Hour grid lines */}
                    {hours.map(hour => (
                      <div 
                        key={hour}
                        className="flex-1 border-r border-[#0E5A75]/5 last:border-r-0"
                      />
                    ))}

                    {/* Bookings for this room on this day */}
                    {reservations
                      .filter(r => {
                        const bookingStart = startOfDay(r.startDate);
                        const bookingEnd = startOfDay(r.endDate);
                        const dayStart = startOfDay(selectedDate);
                        const dayEnd = endOfDay(selectedDate);
                        
                        return r.roomId === room.id && 
                          (isAfter(bookingEnd, dayStart) || bookingEnd.getTime() === dayStart.getTime()) && 
                          (isBefore(bookingStart, dayEnd) || bookingStart.getTime() === dayEnd.getTime());
                      })
                      .map(res => {
                        const pos = getBookingPosition(res, "day", [selectedDate]);
                        
                        // Clamp positions to the current day view (0% to 100%)
                        const clampedLeft = Math.max(0, pos.left);
                        const clampedRight = Math.min(100, pos.left + pos.width);
                        const clampedWidth = Math.max(clampedRight - clampedLeft, 1); // Min 1% width
                        
                        const startsBefore = pos.left < 0;
                        const endsAfter = pos.left + pos.width > 100;

                        return (
                          <div
                            key={res.id}
                            onClick={() => onBookingClick?.(res)}
                            style={{
                              left: `${clampedLeft}%`,
                              width: `${clampedWidth}%`,
                              top: '15%',
                              height: '70%',
                              position: 'absolute'
                            }}
                            className={cn(
                              "z-[10] rounded-lg cursor-pointer transition-all hover:scale-[1.02] border border-white/20 flex items-center px-3 overflow-hidden shadow-sm",
                              getBookingStyles(res.status),
                              startsBefore && "rounded-l-none border-l-0",
                              endsAfter && "rounded-r-none border-r-0"
                            )}
                          >
                            <p className="text-[10px] font-black truncate text-white">
                              {res.guestName} {startsBefore && <span className="opacity-60 ml-1">(Cont.)</span>}
                            </p>
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Current Time Indicator Line */}
        {timeIndicatorPos !== null && (
          <div 
            className="absolute top-0 bottom-0 w-[2px] bg-[#159665] z-[25] shadow-[0_0_10px_rgba(21,150,101,0.5)] pointer-events-none"
            style={{ left: `calc(200px + ${timeIndicatorPos}%)` }}
          >
            <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-[#159665] border-2 border-white dark:border-black" />
          </div>
        )}
      </div>
    </div>
  );
};

const getBookingStyles = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-[#29655C]";
    case "checked_in": return "bg-[#159665]";
    case "pending": return "bg-[#FCBC43]/90 text-[#053344]";
    case "maintenance": return "bg-[#F24633]/80";
    case "blocked": return "bg-[#4B5563]";
    default: return "bg-[#0E5A75]";
  }
};

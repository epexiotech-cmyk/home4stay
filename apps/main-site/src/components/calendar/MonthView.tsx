import React from "react";
import { format, isSameDay, startOfDay, endOfDay, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { RoomGroup, Reservation } from "./types";
import { getBookingPosition, CALENDAR_CONFIG } from "./calendar-utils";


interface MonthViewProps {
  dates: Date[];
  roomGroups: RoomGroup[];
  reservations: Reservation[];
  onBookingClick?: (res: Reservation) => void;
}

const MONTH_DAY_WIDTH = 60; // Smaller width for month view

export const MonthView: React.FC<MonthViewProps> = ({
  dates,
  roomGroups,
  reservations,
  onBookingClick,
}) => {
  const config = { ...CALENDAR_CONFIG, DAY_WIDTH: MONTH_DAY_WIDTH };

  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-auto custom-scrollbar">
      <div className="min-w-max">
      {/* Date Header */}
      <div className="sticky top-0 z-[30] flex bg-white/80 dark:bg-[#0A0F1D]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5">
        <div className="sticky left-0 z-[40] w-[200px] shrink-0 bg-white dark:bg-[#0A0F1D] p-4 border-r border-black/5 dark:border-white/5">
           <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]">Rooms</span>
        </div>
        <div className="flex">
          {dates.map((date, i) => {
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = isSameDay(date, new Date());
            return (
              <div 
                key={i} 
                style={{ width: MONTH_DAY_WIDTH }} 
                className={cn(
                  "shrink-0 flex flex-col items-center justify-center h-14 border-r border-[#0E5A75]/5 transition-colors",
                  isWeekend && "bg-[#0E5A75]/5",
                  isToday && "bg-[#0E5A75] text-white"
                )}
              >
                <span className={cn("text-[8px] font-bold uppercase tracking-tighter opacity-60", isToday && "text-white opacity-100")}>
                  {format(date, "EE")}
                </span>
                <span className={cn("text-xs font-black text-[#053344] dark:text-white", isToday && "text-white")}>
                  {format(date, "d")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Area */}
      <div className="select-none">
        <div className="relative">
          {roomGroups.map((group) => (
            <div key={group.name}>
              {/* Group Header */}
              <div className="sticky left-0 z-[20] flex items-center h-8 px-4 bg-[#0E5A75]/5 border-b border-[#0E5A75]/10">
                <div className="sticky left-4 z-[21]">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#0E5A75]">{group.name}</span>
                </div>
              </div>

              {group.rooms.map((room) => (
                <div key={room.id} className="flex border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">
                  {/* Room Sidebar (Sticky) */}
                  <div className="sticky left-0 z-[20] w-[200px] shrink-0 bg-white dark:bg-[#0A0F1D] p-3 border-r border-black/5 dark:border-white/5 flex items-center gap-3">
                    <div className={cn(
                      "w-1 h-6 rounded-full",
                      room.status === "clean" ? "bg-[#159665]" : 
                      room.status === "dirty" ? "bg-[#F24633]" : 
                      room.status === "housekeeping" ? "bg-[#FCBC43]" : "bg-[#0983B0]"
                    )} />
                    <div>
                      <p className="text-[11px] font-black text-[#053344] dark:text-white leading-tight">{room.name}</p>
                    </div>
                  </div>

                  {/* Room Row Content */}
                  <div className="flex relative h-12">
                    {dates.map((_, i) => (
                      <div 
                        key={i} 
                        style={{ width: MONTH_DAY_WIDTH }} 
                        className="shrink-0 border-r border-black/5 dark:border-white/5"
                      />
                    ))}

                    {/* Bookings - Compact Style */}
                    {reservations
                      .filter(r => {
                        const bookingStart = startOfDay(r.startDate);
                        const bookingEnd = startOfDay(r.endDate);
                        const timelineStart = startOfDay(dates[0]);
                        const timelineEnd = endOfDay(dates[dates.length - 1]);
                        
                        return r.roomId === room.id && 
                          isAfter(bookingEnd, timelineStart) && 
                          isBefore(bookingStart, timelineEnd);
                      })
                      .map((res) => {
                        const pos = getBookingPosition(res, "month", dates, config);
                        if (pos.left + pos.width < 0 || pos.left > dates.length * MONTH_DAY_WIDTH) return null;
                        
                        return (
                          <div
                            key={res.id}
                            onClick={() => onBookingClick?.(res)}
                            style={{
                              left: pos.left,
                              width: pos.width,
                              top: 6,
                              height: 36,
                              position: 'absolute'
                            }}
                            className={cn(
                              "z-[10] rounded-lg cursor-pointer transition-all hover:scale-[1.01] border border-white/10 flex items-center px-2 overflow-hidden",
                              getBookingStyles(res.status)
                            )}
                          >
                            <p className="text-[10px] font-black truncate">{res.guestName}</p>
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
      </div>
    </div>
  </div>
  );
};

const getBookingStyles = (status: string) => {
  switch (status) {
    case "confirmed": return "bg-[#29655C] text-white";
    case "checked_in": return "bg-[#159665] text-white";
    case "pending": return "bg-[#FCBC43]/90 text-[#053344]";
    case "maintenance": return "bg-[#F24633]/80 text-white";
    case "blocked": return "bg-[#4B5563] text-white";
    default: return "bg-[#0E5A75]/10 text-[#0E5A75]";
  }
};

import React from "react";
import { format, isSameDay, startOfDay, endOfDay, isBefore, isAfter } from "date-fns";
import { cn } from "@/lib/utils";
import { RoomGroup, Reservation } from "./types";
import { BookingCard } from "./BookingCard";
import { getBookingPosition, CALENDAR_CONFIG } from "./calendar-utils";
import { Search, Hammer, MoreVertical } from "lucide-react";

interface WeekViewProps {
  dates: Date[];
  roomGroups: RoomGroup[];
  reservations: Reservation[];
  onBookingClick?: (res: Reservation) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  dates,
  roomGroups,
  reservations,
  onBookingClick,
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0 relative overflow-auto custom-scrollbar">
      <div className="min-w-max">
      {/* Date Header */}
      <div className="sticky top-0 z-[30] flex bg-white/80 dark:bg-[#0A0F1D]/80 backdrop-blur-2xl border-b border-black/5 dark:border-white/5">
        <div className="sticky left-0 z-[40] w-[280px] shrink-0 bg-white dark:bg-[#0A0F1D] p-6 border-r border-black/5 dark:border-white/5">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0E5A75]/40" size={14} />
            <input 
              type="text" 
              placeholder="Filter rooms..." 
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0E5A75]/5 border border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-xs font-bold"
            />
          </div>
        </div>
        <div className="flex">
          {dates.map((date, i) => {
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = isSameDay(date, new Date());
            return (
              <div 
                key={i} 
                style={{ width: CALENDAR_CONFIG.DAY_WIDTH }} 
                className={cn(
                  "shrink-0 flex flex-col items-center justify-center h-20 border-r border-[#0E5A75]/5 transition-colors",
                  isWeekend && "bg-[#0E5A75]/5",
                  isToday && "bg-[#0E5A75] text-white"
                )}
              >
                <span className={cn("text-[10px] font-bold uppercase tracking-widest text-[#0E5A75] opacity-60", isToday && "text-white opacity-100")}>
                  {format(date, "EEE")}
                </span>
                <span className={cn("text-xl font-black text-[#053344] dark:text-white", isToday && "text-white")}>
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
              <div className="sticky left-0 z-[20] flex items-center h-10 px-6 bg-[#0E5A75]/5 border-b border-[#0E5A75]/10">
                <div className="sticky left-6 z-[21]">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]">{group.name}</span>
                </div>
              </div>

              {group.rooms.map((room) => (
                <div key={room.id} className="flex border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300">
                  {/* Room Sidebar (Sticky) */}
                  <div className="sticky left-0 z-[20] w-[280px] shrink-0 bg-white dark:bg-[#0A0F1D] p-5 border-r border-black/5 dark:border-white/5 flex items-center justify-between group/room">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-10 rounded-full transition-all duration-500",
                        room.status === "clean" ? "bg-[#159665]" : 
                        room.status === "dirty" ? "bg-[#F24633]" : 
                        room.status === "housekeeping" ? "bg-[#FCBC43]" : "bg-[#0983B0]"
                      )} />
                      <div>
                        <p className="text-sm font-black text-[#053344] dark:text-white leading-tight">{room.name}</p>
                        <p className="text-[10px] font-bold text-[#0E5A75] dark:text-[#0983B0] opacity-60 uppercase tracking-widest mt-0.5">{room.type}</p>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover/room:opacity-100 transition-opacity flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-[#0E5A75]/10 text-[#0E5A75]"><Hammer size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-[#0E5A75]/10 text-[#0E5A75]"><MoreVertical size={14} /></button>
                    </div>
                  </div>

                  {/* Room Row Content */}
                  <div className="flex relative h-20">
                    {dates.map((_, i) => (
                      <div 
                        key={i} 
                        style={{ width: CALENDAR_CONFIG.DAY_WIDTH }} 
                        className="shrink-0 border-r border-black/5 dark:border-white/5"
                      />
                    ))}

                    {/* Bookings */}
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
                        const pos = getBookingPosition(res, "week", dates);
                        // Only render if it overlaps with the current week
                        if (pos.left + pos.width < 0 || pos.left > dates.length * CALENDAR_CONFIG.DAY_WIDTH) return null;
                        
                        return (
                          <BookingCard
                            key={res.id}
                            reservation={res}
                            onClick={onBookingClick}
                            style={{
                              left: pos.left,
                              width: pos.width,
                              top: pos.top,
                              height: pos.height,
                              position: 'absolute'
                            }}
                          />
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

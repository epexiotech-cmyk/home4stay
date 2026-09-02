import React from "react";
import { ChevronLeft, ChevronRight, Filter, Plus } from "lucide-react";
import { format, isBefore, isAfter, subMonths, addMonths, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarView } from "./types";

import { MonthYearSelector } from "./MonthYearSelector";

interface CalendarToolbarProps {
  view: CalendarView;
  setView: (view: CalendarView) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  minDate: Date;
  maxDate: Date;
  onQuickBooking?: () => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  view,
  setView,
  selectedDate,
  setSelectedDate,
  onPrev,
  onNext,
  onToday,
  minDate,
  maxDate,
  onQuickBooking,
}) => {
  const isAtMin = isBefore(endOfDay(subMonths(selectedDate, 1)), minDate);
  const isAtMax = isAfter(startOfDay(addMonths(selectedDate, 1)), maxDate);

  const getNavLabel = () => {
    switch (view) {
      case "day":
        return format(selectedDate, "MMM dd, yyyy");
      case "week":
        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
        if (start.getMonth() === end.getMonth()) {
          return `${format(start, "MMM dd")} - ${format(end, "dd, yyyy")}`;
        }
        return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`;
      case "month":
        return format(selectedDate, "MMMM yyyy");
      default:
        return "Today";
    }
  };

  return (
    <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 shrink-0">
      <MonthYearSelector 
        selectedDate={selectedDate} 
        setSelectedDate={setSelectedDate}
        minDate={minDate}
        maxDate={maxDate}
      />

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 bg-white/50 dark:bg-white/5 p-1 rounded-xl border border-[#0E5A75]/10 backdrop-blur-sm">
          <button 
            onClick={onPrev} 
            disabled={isAtMin}
            title={isAtMin ? "No earlier history" : "Previous month"}
            className={cn(
              "p-2 rounded-lg transition-all",
              isAtMin ? "opacity-20 cursor-not-allowed text-[#0E5A75]/50" : "hover:bg-[#0E5A75]/5 text-[#0E5A75]"
            )}
          >
            <ChevronLeft size={16} />
          </button>
          <button onClick={onToday} className="px-4 py-1 text-[10px] font-black uppercase tracking-widest text-[#0E5A75] hover:bg-[#0E5A75]/5 rounded-lg transition-all min-w-[120px] whitespace-nowrap">
            {getNavLabel()}
          </button>
          <button 
            onClick={onNext} 
            disabled={isAtMax}
            title={isAtMax ? "No further schedule" : "Next month"}
            className={cn(
              "p-2 rounded-lg transition-all",
              isAtMax ? "opacity-20 cursor-not-allowed text-[#0E5A75]/50" : "hover:bg-[#0E5A75]/5 text-[#0E5A75]"
            )}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white/50 dark:bg-white/5 p-1.5 rounded-2xl border border-[#0E5A75]/10 backdrop-blur-sm">
          {(["day", "week", "month"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                view === v ? "bg-[#0E5A75] text-white shadow-lg" : "text-[#0E5A75] hover:bg-[#0E5A75]/5"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => alert("Filter functionality coming soon: Filter by Room Type, Guest Status, or Source.")}
          className="p-3 rounded-xl glass-premium text-[#0E5A75] hover:bg-[#0E5A75] hover:text-white transition-all shadow-sm active:scale-95"
        >
          <Filter size={20} />
        </button>
        <button 
          onClick={onQuickBooking}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all"
        >
          <Plus size={20} />
          <span className="text-sm font-bold uppercase tracking-wider">Quick Booking</span>
        </button>
      </div>
    </div>
  );
};

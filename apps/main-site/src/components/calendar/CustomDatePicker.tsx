"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CustomDatePickerProps {
  label: string;
  value?: string;
  onChange: (date: Date) => void;
  placeholder?: string;
  minDate?: Date;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  label,
  value,
  onChange,
  placeholder = "Select date...",
  minDate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current value or use today
  const selectedDate = useMemo(() => (value ? new Date(value) : null), [value]);

  // Adjust current month when value or minDate changes to ensure calendar shows correct month
  const [prevValue, setPrevValue] = useState(value);
  const [prevMinDate, setPrevMinDate] = useState(minDate);

  if (value !== prevValue || minDate !== prevMinDate) {
    setPrevValue(value);
    setPrevMinDate(minDate);
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    } else if (minDate) {
      setCurrentMonth(minDate);
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handleDateClick = (date: Date) => {
    onChange(date);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border border-[#0E5A75]/10 flex items-center justify-between transition-all hover:bg-[#0E5A75]/10 group",
          isOpen && "border-[#0E5A75]/40 ring-4 ring-[#0E5A75]/5"
        )}
      >
        <span className={cn("text-sm font-bold", selectedDate ? "text-[#053344] dark:text-white" : "text-[#0E5A75]/40")}>
          {selectedDate ? format(selectedDate, "MMM dd, yyyy") : placeholder}
        </span>
        <CalendarIcon size={16} className="text-[#0E5A75] opacity-40 group-hover:opacity-100 transition-opacity" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 z-[300] glass-premium rounded-[32px] border border-white/20 dark:border-white/10 shadow-luxury overflow-hidden p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 rounded-xl hover:bg-[#0E5A75]/10 text-[#0E5A75] transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <h4 className="text-sm font-black text-[#053344] dark:text-white uppercase tracking-widest">
                {format(currentMonth, "MMMM yyyy")}
              </h4>
              <button 
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 rounded-xl hover:bg-[#0E5A75]/10 text-[#0E5A75] transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 mb-2">
              {days.map(day => (
                <div key={day} className="text-center text-[10px] font-black text-[#0E5A75]/40 uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);
                
                // Effective minimum date (either minDate prop or today)
                const effectiveMinDate = minDate ? startOfDay(minDate) : startOfDay(new Date());
                const isDisabled = isBefore(startOfDay(day), effectiveMinDate);

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative group",
                      !isCurrentMonth && "opacity-20",
                      isSelected 
                        ? "bg-[#0E5A75] text-white shadow-lg" 
                        : isDisabled 
                          ? "text-[#0E5A75]/20 cursor-not-allowed"
                          : "hover:bg-[#0E5A75]/10 text-[#053344] dark:text-white"
                    )}
                  >
                    {format(day, "d")}
                    {isTodayDate && !isSelected && (
                      <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-[#0E5A75]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-[#0E5A75]/5 flex justify-between">
              <button 
                onClick={() => handleDateClick(new Date())}
                className="text-[10px] font-black text-[#0E5A75] uppercase tracking-widest hover:underline"
              >
                Today
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false);
                }}
                className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest hover:text-[#0E5A75]"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

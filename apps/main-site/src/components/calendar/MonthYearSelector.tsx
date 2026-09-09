"use client";
import React, { useState, useRef, useEffect } from "react";
import { format, setMonth, setYear, getYear, isBefore, isAfter, startOfMonth, endOfMonth } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthYearSelectorProps {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  minDate: Date;
  maxDate: Date;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MonthYearSelector: React.FC<MonthYearSelectorProps> = ({
  selectedDate,
  setSelectedDate,
  minDate,
  maxDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const minYear = getYear(minDate);
  const maxYear = getYear(maxDate);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedDate(setMonth(selectedDate, monthIndex));
  };

  const handleYearSelect = (year: number) => {
    setSelectedDate(setYear(selectedDate, year));
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Label */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex flex-col items-start gap-1 focus:outline-none"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-px bg-[#0E5A75] opacity-30 group-hover:bg-[#0983B0] group-hover:opacity-100 transition-all" />
          <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em] group-hover:text-white transition-colors">
            {format(selectedDate, "MMMM yyyy")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none group-hover:text-[#0983B0] transition-colors">
            Master Calendar
          </h1>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-[#0E5A75] group-hover:text-[#0983B0]"
          >
            <ChevronDown size={28} />
          </motion.div>
        </div>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "z-[100] bg-[#0A0F1D]/95 backdrop-blur-2xl border-white/10 overflow-hidden shadow-[0_-32px_64px_rgba(0,0,0,0.5)] md:shadow-[0_32px_64px_rgba(0,0,0,0.5)]",
              "fixed inset-x-0 bottom-0 rounded-t-[32px] md:absolute md:top-full md:bottom-auto md:left-0 md:inset-x-auto md:w-[420px] md:rounded-[32px] md:mt-4"
            )}
          >
            {/* Mobile Drag Handle */}
            <div className="md:hidden flex justify-center p-3">
              <div className="w-12 h-1.5 bg-white/10 rounded-full" />
            </div>
            <div className="flex h-[320px]">
              {/* Months List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 border-r border-white/5">
                <p className="text-[10px] font-black text-[#0983B0] uppercase tracking-widest px-4 mb-3 opacity-50">Select Month</p>
                <div className="space-y-1">
                  {MONTHS.map((month, index) => {
                    const monthDate = setMonth(setYear(new Date(), selectedDate.getFullYear()), index);
                    const isAvailable = !isBefore(endOfMonth(monthDate), minDate) && !isAfter(startOfMonth(monthDate), maxDate);
                    
                    if (!isAvailable) return null;

                    return (
                      <button
                        key={month}
                        onClick={() => handleMonthSelect(index)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                          selectedDate.getMonth() === index
                            ? "bg-[#0983B0] text-white shadow-[0_0_20px_rgba(9,131,176,0.3)]"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Years List */}
              <div className="w-1/3 overflow-y-auto custom-scrollbar p-4">
                <p className="text-[10px] font-black text-[#0983B0] uppercase tracking-widest px-4 mb-3 opacity-50">Select Year</p>
                <div className="space-y-1">
                  {years.map((year) => {
                    // Hide year if no months in it are available (already handled by years logic above but just for safety)
                    return (
                      <button
                        key={year}
                        onClick={() => handleYearSelect(year)}
                        className={cn(
                          "w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all",
                          selectedDate.getFullYear() === year
                            ? "bg-[#0983B0] text-white shadow-[0_0_20px_rgba(9,131,176,0.3)]"
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setIsOpen(false);
                }}
                className="text-[10px] font-black uppercase tracking-widest text-[#0983B0] hover:text-white transition-colors"
              >
                Reset to Today
              </button>
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <Calendar size={12} />
                <span>PMS Selector</span>
              </div>
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>
    </div>
  );
};

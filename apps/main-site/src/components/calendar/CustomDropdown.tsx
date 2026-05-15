import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  name: string;
  desc?: string;
}

interface CustomDropdownProps {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select option..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.id === value);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-5 py-3.5 rounded-2xl bg-[#0E5A75]/5 border border-[#0E5A75]/10 flex items-center justify-between transition-all hover:bg-[#0E5A75]/10 group",
          isOpen && "border-[#0E5A75]/40 ring-4 ring-[#0E5A75]/5 bg-[#0E5A75]/10"
        )}
      >
        <div className="flex flex-col items-start">
          <span className={cn("text-sm font-bold", selectedOption ? "text-[#053344] dark:text-white" : "text-[#0E5A75]/40")}>
            {selectedOption ? selectedOption.name : placeholder}
          </span>
          {selectedOption?.desc && (
            <span className="text-[10px] font-medium text-[#0E5A75]/60 -mt-0.5">{selectedOption.desc}</span>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={cn("text-[#0E5A75] transition-transform duration-300", isOpen && "rotate-180")} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-3 z-[400] glass-premium rounded-[32px] border border-white/20 dark:border-white/10 shadow-luxury overflow-hidden p-3"
          >
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar space-y-1">
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = option.id === value;
                  return (
                    <button
                      key={option.id}
                      onClick={() => {
                        onChange(option.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                        isSelected 
                          ? "bg-[#0E5A75] text-white shadow-lg" 
                          : "hover:bg-[#0E5A75]/5 text-[#053344] dark:text-white"
                      )}
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-bold">{option.name}</span>
                        {option.desc && (
                          <span className={cn("text-[10px] font-medium", isSelected ? "text-white/60" : "text-[#0E5A75]/60")}>
                            {option.desc}
                          </span>
                        )}
                      </div>
                      {isSelected && <Check size={14} className="text-white" />}
                    </button>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <p className="text-xs font-bold text-[#0E5A75]/40 italic">No options available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

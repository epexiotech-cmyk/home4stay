import React from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reservation } from "./types";
import { getBookingStyles } from "./calendar-utils";

interface BookingCardProps {
  reservation: Reservation;
  onClick?: (res: Reservation) => void;
  style?: React.CSSProperties;
}

export const BookingCard: React.FC<BookingCardProps> = ({ 
  reservation, 
  onClick, 
  style 
}) => {
  return (
    <div
      onClick={() => onClick?.(reservation)}
      style={style}
      className={cn(
        "absolute z-[10] rounded-xl p-3 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-luxury overflow-hidden group/res border border-white/10 dark:border-white/5 gpu-accelerated",
        getBookingStyles(reservation.status)
      )}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <p className="text-xs font-black truncate pr-2">{reservation.guestName}</p>
          <div className="opacity-0 group-hover/res:opacity-100 transition-opacity">
            <MoreVertical size={12} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0 rounded-full text-[9px] font-black uppercase tracking-[0.15em] bg-white/20 text-white border-none">
            {reservation.source}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-tighter opacity-80">
            {reservation.mealPlan}
          </span>
        </div>
      </div>
    </div>
  );
};

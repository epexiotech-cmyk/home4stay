import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  differenceInCalendarDays,
  differenceInMinutes,
  startOfDay,
  subMonths,
  min,
  max,
  addYears
} from "date-fns";
import { CalendarView, Reservation } from "./types";

export const CALENDAR_CONFIG = {
  DAY_WIDTH: 120,
  ROW_HEIGHT: 80,
  LEFT_COL_WIDTH: 280,
  HOUR_HEIGHT: 80, // For Day View
  MIN_SLOT_HEIGHT: 40, // 30 mins
};

export const getDatesForView = (view: CalendarView, selectedDate: Date) => {
  switch (view) {
    case "day":
      return [selectedDate];
    case "week":
      const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    case "month":
      return eachDayOfInterval({
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
      });
  }
};

export const getBookingPosition = (
  res: Reservation, 
  view: CalendarView, 
  dates: Date[],
  config = CALENDAR_CONFIG
) => {
  if (view === "day") {
    // Day view: position by time
    const startOfCurrentDay = startOfDay(dates[0]);
    const minutesFromStart = differenceInMinutes(res.startDate, startOfCurrentDay);
    const durationInMinutes = differenceInMinutes(res.endDate, res.startDate);
    
    return {
      left: (minutesFromStart / 1440) * 100, // Percentage of the day
      width: (durationInMinutes / 1440) * 100, // Percentage of the day
      top: 10,
      height: 60,
    };
  } else {
    // Week/Month view: position by days
    const timelineStart = startOfDay(dates[0]);
    const startDiff = differenceInCalendarDays(startOfDay(res.startDate), timelineStart);
    const duration = differenceInCalendarDays(startOfDay(res.endDate), startOfDay(res.startDate));
    
    const left = startDiff * config.DAY_WIDTH;
    const width = duration * config.DAY_WIDTH;
    
    return {
      left: left + 8, // Padding
      width: width - 16, // Padding
      top: 10,
      height: 60,
    };
  }
};

export const getBookingStyles = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-[#29655C] text-white shadow-sm";
    case "checked_in":
      return "bg-[#159665] text-white shadow-sm";
    case "pending":
      return "bg-[#FCBC43]/90 text-[#053344] shadow-sm";
    case "maintenance":
      return "bg-[#F24633]/80 text-white shadow-sm";
    case "blocked":
      return "bg-[#4B5563] text-white shadow-sm";
    default:
      return "bg-[#0E5A75]/10 text-[#0E5A75] border-dashed border-[#0E5A75]/30";
  }
};

export const getAvailableCalendarHistory = (reservations: Reservation[]) => {
  const now = new Date();
  const defaultMin = subMonths(startOfMonth(now), 1);
  const defaultMax = addYears(endOfMonth(now), 1); // Allow 1 year into future by default

  if (!reservations || reservations.length === 0) {
    return {
      minDate: defaultMin,
      maxDate: defaultMax
    };
  }

  const reservationDates = reservations.flatMap(r => [r.startDate, r.endDate]);
  const earliestHistory = min(reservationDates);
  const latestHistory = max(reservationDates);

  return {
    minDate: min([defaultMin, startOfMonth(earliestHistory)]),
    maxDate: max([defaultMax, endOfMonth(latestHistory)])
  };
};

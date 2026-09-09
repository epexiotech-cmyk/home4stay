"use client";
import { useState, useMemo } from "react";
import { addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isBefore, isAfter, startOfDay, endOfDay } from "date-fns";
import { CalendarView, Reservation } from "./types";
import { getDatesForView, getAvailableCalendarHistory } from "./calendar-utils";

export const useCalendarDates = (reservations: Reservation[], initialDate = new Date(), initialView: CalendarView = "week") => {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [view, setView] = useState<CalendarView>(initialView);

  const { minDate, maxDate } = useMemo(() => getAvailableCalendarHistory(reservations), [reservations]);
  const dates = useMemo(() => getDatesForView(view, selectedDate), [view, selectedDate]);

  const next = () => {
    let nextDate: Date;
    switch (view) {
      case "day": nextDate = addDays(selectedDate, 1); break;
      case "week": nextDate = addWeeks(selectedDate, 1); break;
      case "month": nextDate = addMonths(selectedDate, 1); break;
    }
    if (isAfter(startOfDay(nextDate), maxDate)) return;
    setSelectedDate(nextDate);
  };

  const prev = () => {
    let prevDate: Date;
    switch (view) {
      case "day": prevDate = subDays(selectedDate, 1); break;
      case "week": prevDate = subWeeks(selectedDate, 1); break;
      case "month": prevDate = subMonths(selectedDate, 1); break;
    }
    if (isBefore(endOfDay(prevDate), minDate)) return;
    setSelectedDate(prevDate);
  };

  const today = () => setSelectedDate(new Date());

  return {
    selectedDate,
    setSelectedDate,
    view,
    setView,
    dates,
    next,
    prev,
    today,
    minDate,
    maxDate
  };
};

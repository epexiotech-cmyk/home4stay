"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type BookingState = {
  selectedRoomId: string | null;
  selectedMealPlanId: string | null;
  selectedExperiences: Record<string, unknown>;
  guestCount: { adults: number; children: number };
  dates: { from: Date | null; to: Date | null };
  pricing: {
    base: number;
    mealPlan: number;
    experiences: number;
    tax: number;
    total: number;
  };
};

type BookingContextType = {
  state: BookingState;
  setRoom: (id: string, price: number) => void;
  setMealPlan: (id: string, price: number) => void;
  toggleExperience: (id: string, price: number, config?: unknown) => void;
  updateGuests: (adults: number, children: number) => void;
  updateDates: (from: Date | null, to: Date | null) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BookingState>({
    selectedRoomId: null,
    selectedMealPlanId: null,
    selectedExperiences: {},
    guestCount: { adults: 2, children: 0 },
    dates: { from: null, to: null },
    pricing: { base: 0, mealPlan: 0, experiences: 0, tax: 0, total: 0 },
  });

  const calculateTotal = (updates: Partial<BookingState>) => {
    const s = { ...state, ...updates };
    const subtotal = s.pricing.base + s.pricing.mealPlan + s.pricing.experiences;
    const tax = subtotal * 0.12;
    return { ...s.pricing, tax, total: subtotal + tax };
  };

  const setRoom = (id: string, price: number) => {
    setState(prev => {
      const pricing = calculateTotal({ pricing: { ...prev.pricing, base: price } });
      return { ...prev, selectedRoomId: id, pricing };
    });
  };

  const setMealPlan = (id: string, price: number) => {
    setState(prev => {
      const pricing = calculateTotal({ pricing: { ...prev.pricing, mealPlan: price } });
      return { ...prev, selectedMealPlanId: id, pricing };
    });
  };

  const toggleExperience = (id: string, price: number, config?: unknown) => {
    setState(prev => {
      const newExperiences = { ...prev.selectedExperiences };
      let newExpPrice = prev.pricing.experiences;

      if (newExperiences[id]) {
        delete newExperiences[id];
        newExpPrice -= price;
      } else {
        newExperiences[id] = config || true;
        newExpPrice += price;
      }

      const pricing = calculateTotal({ pricing: { ...prev.pricing, experiences: newExpPrice } });
      return { ...prev, selectedExperiences: newExperiences, pricing };
    });
  };

  const updateGuests = (adults: number, children: number) => {
    setState(prev => ({ ...prev, guestCount: { adults, children } }));
  };

  const updateDates = (from: Date | null, to: Date | null) => {
    setState(prev => ({ ...prev, dates: { from, to } }));
  };

  return (
    <BookingContext.Provider value={{ state, setRoom, setMealPlan, toggleExperience, updateGuests, updateDates }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";

export type BookingState = {
  propertyId: string | null;
  selectedRoomId: string | null;
  selectedMealPlanId: string | null;
  selectedExperiences: Record<string, { title: string, price: number }>;
  guestCount: { adults: number; children: number };
  dates: { from: Date | null; to: Date | null };
  pricing: {
    base: number;
    mealPlan: number;
    experiences: number;
    tax: number;
    total: number;
    discount: number;
  };
  appliedCoupon: {
    code: string;
    value: number;
    type: "percentage" | "flat";
  } | null;
};

type BookingContextType = {
  state: BookingState;
  setPropertyId: (id: string) => void;
  setRoom: (id: string, price: number) => void;
  setMealPlan: (id: string, price: number) => void;
  toggleExperience: (exp: { id: string, title: string, price: number }) => void;
  updateGuests: (adults: number, children: number) => void;
  updateDates: (from: Date | null, to: Date | null) => void;
  setCoupon: (coupon: BookingState["appliedCoupon"]) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children, initialPropertyId = null }: { children: ReactNode, initialPropertyId?: string | null }) {
  const [state, setState] = useState<BookingState>({
    propertyId: initialPropertyId,
    selectedRoomId: null,
    selectedMealPlanId: null,
    selectedExperiences: {},
    guestCount: { adults: 2, children: 0 },
    dates: { from: null, to: null },
    pricing: { base: 0, mealPlan: 0, experiences: 0, tax: 0, discount: 0, total: 0 },
    appliedCoupon: null
  });

  const calculateTotal = useCallback((s: BookingState, updates: Partial<BookingState> = {}) => {
    const currentState = { ...s, ...updates };
    const subtotal = currentState.pricing.base + currentState.pricing.mealPlan + currentState.pricing.experiences;
    const tax = Math.round(subtotal * 0.12);
    
    let discount = 0;
    if (currentState.appliedCoupon) {
      if (currentState.appliedCoupon.type === "percentage") {
        discount = Math.round(subtotal * (currentState.appliedCoupon.value / 100));
      } else {
        discount = currentState.appliedCoupon.value;
      }
    }

    return { ...currentState.pricing, tax, discount, total: subtotal + tax - discount };
  }, []);

  const setPropertyId = useCallback((id: string) => {
    setState(prev => {
      if (prev.propertyId && prev.propertyId !== id) {
        console.warn("[BookingContext] Property context changed. Resetting state.");
        return {
          propertyId: id,
          selectedRoomId: null,
          selectedMealPlanId: null,
          selectedExperiences: {},
          guestCount: { adults: 2, children: 0 },
          dates: { from: null, to: null },
          pricing: { base: 0, mealPlan: 0, experiences: 0, tax: 0, discount: 0, total: 0 },
          appliedCoupon: null
        };
      }
      if (prev.propertyId === id) return prev;
      return { ...prev, propertyId: id };
    });
  }, []);

  const setRoom = useCallback((id: string, price: number) => {
    setState(prev => {
      const newPricing = { ...prev.pricing, base: price };
      const pricing = calculateTotal({ ...prev, pricing: newPricing });
      return { ...prev, selectedRoomId: id, pricing };
    });
  }, [calculateTotal]);

  const setMealPlan = useCallback((id: string, price: number) => {
    setState(prev => {
      const newPricing = { ...prev.pricing, mealPlan: price };
      const pricing = calculateTotal({ ...prev, pricing: newPricing });
      return { ...prev, selectedMealPlanId: id, pricing };
    });
  }, [calculateTotal]);

  const toggleExperience = useCallback((exp: { id: string, title: string, price: number }) => {
    setState(prev => {
      const newExperiences = { ...prev.selectedExperiences };
      let newExpPrice = prev.pricing.experiences;

      if (newExperiences[exp.id]) {
        delete newExperiences[exp.id];
        newExpPrice -= exp.price;
      } else {
        newExperiences[exp.id] = { title: exp.title, price: exp.price };
        newExpPrice += exp.price;
      }

      const newPricing = { ...prev.pricing, experiences: newExpPrice };
      const pricing = calculateTotal({ ...prev, selectedExperiences: newExperiences, pricing: newPricing });
      return { ...prev, selectedExperiences: newExperiences, pricing };
    });
  }, [calculateTotal]);

  const updateGuests = useCallback((adults: number, children: number) => {
    setState(prev => ({ ...prev, guestCount: { adults, children } }));
  }, []);

  const updateDates = useCallback((from: Date | null, to: Date | null) => {
    setState(prev => ({ ...prev, dates: { from, to } }));
  }, []);

  const setCoupon = useCallback((coupon: BookingState["appliedCoupon"]) => {
    setState(prev => {
      const pricing = calculateTotal({ ...prev, appliedCoupon: coupon });
      return { ...prev, appliedCoupon: coupon, pricing };
    });
  }, [calculateTotal]);

  const contextValue = useMemo(() => ({ 
    state, 
    setPropertyId, 
    setRoom, 
    setMealPlan, 
    toggleExperience, 
    updateGuests, 
    updateDates,
    setCoupon
  }), [state, setPropertyId, setRoom, setMealPlan, toggleExperience, updateGuests, updateDates, setCoupon]);

  return (
    <BookingContext.Provider value={contextValue}>
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

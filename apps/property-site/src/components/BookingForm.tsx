"use client";

import { useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { Property } from "../types/property";

interface BookingFormProps {
  property: Property;
  isLocked?: boolean;
}

export default function BookingForm({ property, isLocked = false }: BookingFormProps) {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get("room");

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // FORM STATE
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState("2 Guests");
  
  const validRoom = property.rooms.find((r) => r.name === roomParam);
  const [selectedRoomName, setSelectedRoomName] = useState(
    validRoom?.name || property.rooms[0].name
  );


  // CALCULATION LOGIC
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const count = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(1, count);
  }, [checkIn, checkOut]);

  const currentRoom = property.rooms.find((r) => r.name === selectedRoomName) || property.rooms[0];
  const total = currentRoom.price * nights;

  // FORMATTING HELPERS
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  // DYNAMIC WHATSAPP MESSAGE
  const whatsappUrl = useMemo(() => {
    const message = `Hi, I want to book a stay at ${property.name}:
Room: ${selectedRoomName}
Dates: ${formatDate(checkIn)} to ${formatDate(checkOut)} (${nights} ${nights === 1 ? 'night' : 'nights'})
Guests: ${guests || "2 Guests"}`;
    
    return `https://wa.me/919019650157?text=${encodeURIComponent(message)}`;
  }, [property.name, selectedRoomName, checkIn, checkOut, nights, guests]);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    alert(`Availability request for ${selectedRoomName} from ${formatDate(checkIn)} to ${formatDate(checkOut)} sent!`);
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
      <form className="space-y-6" onSubmit={handleCheck}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Check-in */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900">Check-in</label>
            <input
              type="date"
              min={today}
              required
              disabled={isLocked}
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-50 disabled:bg-zinc-50"
            />
          </div>
          {/* Check-out */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900">Check-out</label>
            <input
              type="date"
              min={checkIn || today}
              required
              disabled={isLocked}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-50 disabled:bg-zinc-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Guests */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900">Guests</label>
            <select 
              value={guests}
              disabled={isLocked}
              onChange={(e) => setGuests(e.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-50 disabled:bg-zinc-50"
            >
              <option>1 Guest</option>
              <option>2 Guests</option>
              <option>3 Guests</option>
              <option>4 Guests</option>
            </select>
          </div>
          {/* Room Selection */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900">Room Type</label>
            <select 
              value={selectedRoomName}
              disabled={isLocked}
              onChange={(e) => setSelectedRoomName(e.target.value)}
              className="mt-2 h-12 w-full rounded-lg border border-zinc-300 px-4 text-sm focus:border-zinc-900 focus:outline-none disabled:opacity-50 disabled:bg-zinc-50"
            >
              {property.rooms.map((room) => (
                <option key={room.name} value={room.name}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Summary */}
        <div className="rounded-xl bg-zinc-50 p-6">
          <div className="flex justify-between text-sm text-zinc-600">
            <span>₹{currentRoom.price.toLocaleString("en-IN")} x {nights} {nights === 1 ? 'night' : 'nights'}</span>
            <span className="font-bold text-zinc-900">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-4 border-t border-zinc-200 pt-4 flex justify-between font-extrabold text-zinc-900">
            <span>Total Estimate</span>
            <span className="text-xl">₹{total.toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-2 text-[10px] text-center text-zinc-400 font-medium">
            Final price may vary based on availability
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-center gap-4">
          {isLocked ? (
            <div className="w-full rounded-lg bg-zinc-200/80 py-4 font-bold text-zinc-500 text-center cursor-not-allowed border border-zinc-300">
              Bookings Temporarily Offline
            </div>
          ) : (
            <button
              type="submit"
              className="w-full rounded-lg bg-zinc-900 py-4 font-bold text-white transition hover:bg-zinc-800"
            >
              Check Availability
            </button>
          )}
          <p className="text-xs font-medium text-zinc-400">
            🔒 Secure booking • ⚡ Instant confirmation via WhatsApp
          </p>
        </div>
      </form>

      {/* WhatsApp Alternative */}
      <div className="mt-10 border-t border-zinc-100 pt-10 text-center">
        {isLocked ? (
          <div>
            <p className="text-sm font-semibold text-amber-600 bg-amber-50 rounded-xl p-4 border border-amber-100">
              ⚠️ Inquiries and bookings are temporarily locked for this property due to pending subscription renewal.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-500">Or confirm instantly on WhatsApp</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-8 py-3 font-bold text-zinc-900 transition hover:bg-zinc-50 shadow-sm"
            >
              <span className="text-green-500 font-bold">●</span> Chat on WhatsApp
            </a>
          </>
        )}
      </div>
    </div>
  );
}

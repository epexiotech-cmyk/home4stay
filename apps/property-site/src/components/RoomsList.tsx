"use client";

import { useState } from "react";
import Link from "next/link";
import { Room } from "../types/property";

interface RoomsListProps {
  rooms: Room[];
  slug: string;
  isLocked?: boolean;
}

export default function RoomsList({ rooms, slug, isLocked = false }: RoomsListProps) {
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);

  return (
    <div className="grid grid-cols-1 gap-12">
      {rooms.map((room, index) => {
        const isSelected = selectedRoom.name === room.name;

        return (
          <div
            key={room.name}
            onClick={() => setSelectedRoom(room)}
            className={`group relative flex cursor-pointer flex-col gap-8 overflow-hidden rounded-3xl border p-6 transition-all duration-300 md:flex-row md:items-center ${
              isSelected
                ? "border-zinc-900 bg-zinc-50 shadow-xl ring-1 ring-zinc-900"
                : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-lg"
            }`}
          >
            {/* Most Popular Tag */}
            {index === 1 && (
              <div className="absolute -right-12 top-6 rotate-45 bg-zinc-900 px-12 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
                Most Popular
              </div>
            )}

            {/* Image Placeholder */}
            <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-200 md:w-1/3"></div>

            {/* Content */}
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-zinc-900">{room.name}</h2>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-zinc-600 shadow-sm border border-zinc-100">
                    {isLocked ? "Unavailable" : "Available"}
                  </span>
                </div>
                <p className="mt-2 text-zinc-500">
                  Experience luxury and comfort in our meticulously designed {room.name}.
                </p>

                {/* Features */}
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="text-zinc-400 font-bold text-base">👤</span> {room.capacity}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="text-zinc-400 font-bold text-base">🏔️</span> {room.view}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <span className="text-zinc-400 font-bold text-base">📶</span> Free WiFi
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-zinc-200/50 pt-8">
                <div>
                  <p className="text-sm text-zinc-500">Starting from</p>
                  <p className="text-3xl font-extrabold text-zinc-900">
                    ₹{room.price.toLocaleString("en-IN")}
                    <span className="text-sm font-normal text-zinc-500"> / night</span>
                  </p>
                </div>
                {isLocked ? (
                  <div className="rounded-full bg-zinc-200 border border-zinc-300 px-8 py-4 font-bold text-zinc-400 cursor-not-allowed text-sm">
                    Bookings Locked
                  </div>
                ) : (
                  <Link
                    href={`/${slug}/booking?room=${encodeURIComponent(room.name)}`}
                    className={`rounded-full px-8 py-4 font-bold transition-all duration-200 ${
                      isSelected
                        ? "bg-zinc-900 text-white shadow-lg hover:bg-zinc-800 scale-105"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    Book {room.name}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

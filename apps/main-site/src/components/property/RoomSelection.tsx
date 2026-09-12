"use client";

import { DEFAULT_FALLBACK_IMAGE, getValidImageUrl } from "@/lib/utils";
import React from "react";
import Image from "next/image";
import { Users, Maximize2, Waves, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";
import { Room } from "@/properties-data/types";
import { useParams, useRouter } from "next/navigation";

interface RoomType {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
  size: string;
  occupancy: string;
  bedType: string;
  view: string;
  tags: string[];
  amenities: string[];
}

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200"
];

export default function RoomSelection({ rooms }: { rooms?: Room[] }) {
  const { state, setRoom } = useBooking();
  const selectedRoomId = state.selectedRoomId;
  const router = useRouter();
  const params = useParams();

  const sourceRooms = rooms || [];
  
  const displayRooms = sourceRooms.map((room: any, idx: number) => ({
    id: room.id || `room-${idx}-${room.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: room.name,
    image: room.image || ROOM_IMAGES[idx % ROOM_IMAGES.length],
    description: room.description || "Experience the pinnacle of mountain luxury in our signature accommodation.",
    price: room.price,
    size: room.size || undefined,
    occupancy: room.capacity || room.occupancy || "2 Guests",
    bedType: room.bedType || undefined,
    view: room.view || undefined,
    tags: room.tags || [],
    amenities: room.amenities || []
  }));

  return (
    <section className="py-20 md:py-32 border-b border-[var(--border)]" id="rooms">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-px bg-[var(--text-subtle)]" />
            <span className="text-[11px] font-medium text-[var(--text-subtle)] uppercase tracking-[0.2em]">Accommodations</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[var(--text)] tracking-tight">Select your <span className="italic text-[var(--text-muted)]">Sanctuary.</span></h2>
        </div>
        <div className="flex gap-4">
          <div className="px-5 py-2.5 rounded-full border border-[var(--border)] bg-[var(--bg)] flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#159665] animate-pulse" />
            <span className="text-[11px] font-medium uppercase tracking-widest text-[var(--text)]">Live Availability</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {displayRooms.map((room) => (
          <div 
            key={room.id}
            className={cn(
              "group relative flex flex-col lg:flex-row gap-8 p-4 rounded-3xl bg-[var(--card)] border transition-all duration-500 overflow-hidden cursor-pointer",
              selectedRoomId === room.id 
                ? "border-theme-primary ring-1 ring-theme-primary shadow-md" 
                : "border-[var(--border)] hover:border-theme-primary/50 hover:shadow-lg"
            )}
            onClick={() => { setRoom(room.id, room.name, room.price); router.push(`/property/${params.slug}/rooms/${room.id}`); }}
          >
            {/* Room Media */}
            <div className="relative w-full lg:w-[40%] h-[300px] lg:h-auto min-h-[300px] rounded-2xl overflow-hidden">
              <Image 
                src={getValidImageUrl(room.image) || DEFAULT_FALLBACK_IMAGE} 
                alt={room.name} 
                fill 
                className="object-cover transition-transform duration-[10s] ease-out group-hover:scale-110"
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {room.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-[10px] font-medium uppercase tracking-widest text-white shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>

            {/* Room Details */}
            <div className="flex-1 flex flex-col justify-between py-4 pr-4">
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-serif text-[var(--text)] tracking-tight mb-2 group-hover:text-theme-primary transition-colors">{room.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[var(--text-subtle)]">
                      {room.size && (
                        <div className="flex items-center gap-1.5">
                          <Maximize2 size={14} strokeWidth={1.5} />
                          <span className="text-[11px] font-medium uppercase tracking-widest">{room.size}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Users size={14} strokeWidth={1.5} />
                        <span className="text-[11px] font-medium uppercase tracking-widest">{room.occupancy}</span>
                      </div>
                      {room.view && (
                        <div className="flex items-center gap-1.5">
                          <Waves size={14} strokeWidth={1.5} />
                          <span className="text-[11px] font-medium uppercase tracking-widest">{room.view}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest mb-1">Starting from</p>
                    <p className="text-2xl font-semibold text-[var(--text)]">₹{room.price.toLocaleString()}</p>
                    <p className="text-[10px] font-medium text-[var(--text-subtle)] uppercase tracking-widest mt-1">/ night + Taxes</p>
                  </div>
                </div>

                <p className="text-[15px] font-light text-[var(--text-muted)] mb-6 leading-relaxed">
                  {room.description}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                  {room.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2 text-[var(--text-muted)]">
                      <div className="w-1 h-1 rounded-full bg-theme-primary/60 shrink-0" />
                      <span className="text-[11px] font-medium tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className={cn(
                  "flex-1 py-3.5 rounded-lg text-xs font-medium uppercase tracking-[0.15em] transition-all duration-300",
                  selectedRoomId === room.id 
                    ? "bg-theme-primary text-white" 
                    : "bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text)] hover:border-theme-primary/50"
                )}>
                  {selectedRoomId === room.id ? "Selected" : "Select"}
                </button>
                <button className="p-3.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                  <Info size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import { Users, Maximize2, Waves, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBooking } from "@/context/BookingContext";
import { Room } from "@/properties-data/types";

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

const ROOMS: RoomType[] = [
  {
    id: "RT-001",
    name: "Royal Heritage Suite",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?auto=format&fit=crop&q=80&w=1200",
    description: "Our signature suite offering unmatched luxury with panoramic views of the heritage architecture.",
    price: 12500,
    size: "850 sq ft",
    occupancy: "2 Adults + 1 Child",
    bedType: "King Sized",
    view: "Palace \u0026 Lake View",
    tags: ["Private Balcony", "Golden Hour View", "Floor 2"],
    amenities: ["Mini Bar", "Walk-in Closet", "Rain Shower", "Espresso Machine"]
  },
  {
    id: "RT-002",
    name: "Premium Garden Room",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200",
    description: "A serene escape nestled within our lush tropical gardens, perfect for a peaceful retreat.",
    price: 8200,
    size: "550 sq ft",
    occupancy: "2 Adults",
    bedType: "Queen Sized",
    view: "Tropical Garden",
    tags: ["Ground Floor", "Private Deck"],
    amenities: ["Outdoor Shower", "Hammock", "Organic Toiletries"]
  }
];

const ROOM_IMAGES = [
  "https://images.unsplash.com/photo-1582719478250-c89cae4df85b?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=1200",
  "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200"
];

export default function RoomSelection({ rooms }: { rooms?: Room[] }) {
  const { state, setRoom } = useBooking();
  const selectedRoomId = state.selectedRoomId;

  const displayRooms = (rooms && rooms.length > 0) ? rooms.map((room: Room, idx: number) => ({
    id: room.id || `room-${idx}-${room.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: room.name,
    image: room.image || ROOM_IMAGES[idx % ROOM_IMAGES.length],
    description: room.description || "Experience the pinnacle of mountain luxury in our signature accommodation.",
    price: room.price,
    size: room.size || "450 sq ft",
    occupancy: room.capacity || room.occupancy || "2 Adults",
    bedType: room.bedType || "King Sized",
    view: room.view || "Mountain View",
    tags: room.tags || ["Premium", "Featured"],
    amenities: room.amenities || ["Wi-Fi", "Room Service", "Coffee Maker", "Mountain View"]
  })) : ROOMS;

  return (
    <section className="py-32" id="rooms">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-px bg-[#0E5A75]" />
            <span className="text-[10px] font-black text-[#0E5A75] uppercase tracking-[0.3em]">Signature Inventory</span>
          </div>
          <h2 className="text-5xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Choose your Stay</h2>
        </div>
        <div className="flex gap-4">
          <div className="glass-premium px-6 py-3 rounded-full border border-white/40 dark:border-white/5 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#159665]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#053344] dark:text-white">Live Availability</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {displayRooms.map((room) => (
          <div 
            key={room.id}
            className={cn(
              "group relative flex flex-col lg:flex-row gap-8 p-6 rounded-[48px] glass-premium transition-all duration-700 overflow-hidden cursor-pointer",
              selectedRoomId === room.id 
                ? "ring-4 ring-[#0E5A75]/10 border-[#0E5A75] bg-white/80 dark:bg-white/10 shadow-luxury" 
                : "border-white/40 dark:border-white/5 hover:border-[#0E5A75]/40 hover:shadow-2xl"
            )}
            onClick={() => setRoom(room.id, room.price)}
          >
            {/* Room Media */}
            <div className="relative w-full lg:w-[45%] h-[400px] lg:h-auto min-h-[400px] rounded-[36px] overflow-hidden">
              <Image 
                src={room.image} 
                alt={room.name} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                {room.tags.map((tag: string) => (
                  <span key={tag} className="px-4 py-2 rounded-full glass-premium border-white/40 text-[9px] font-black uppercase tracking-widest text-white shadow-lg">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Room Details */}
            <div className="flex-1 flex flex-col justify-between py-6 px-4">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-black text-[#053344] dark:text-white tracking-tight mb-2 group-hover:text-[#0E5A75] transition-colors">{room.name}</h3>
                    <div className="flex items-center gap-6 text-[#0E5A75]/60">
                      <div className="flex items-center gap-1.5">
                        <Maximize2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{room.size}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{room.occupancy}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Waves size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{room.view}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Starting from</p>
                    <p className="text-3xl font-black text-[#159665]">₹{room.price.toLocaleString()}</p>
                    <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mt-1">per night + Taxes</p>
                  </div>
                </div>

                <p className="text-lg font-medium text-[#0E5A75]/60 mb-8 leading-relaxed italic">
                  &quot;{room.description}&quot;
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {room.amenities.map((amenity: string) => (
                    <div key={amenity} className="flex items-center gap-2 text-[#0E5A75]">
                      <CheckCircle2 size={14} className="text-[#159665]" />
                      <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button className={cn(
                  "flex-1 py-5 rounded-[24px] text-sm font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-xl",
                  selectedRoomId === room.id 
                    ? "bg-[#159665] text-white shadow-[#159665]/20" 
                    : "bg-[#0E5A75] text-white shadow-[#0E5A75]/20 hover:bg-[#0A4459]"
                )}>
                  {selectedRoomId === room.id ? "Room Selected" : "Select this Room"}
                </button>
                <button className="p-5 rounded-[24px] glass-premium border-white/40 dark:border-white/5 text-[#0E5A75] dark:text-[#FCBC43] hover:bg-[#0E5A75]/5 transition-all">
                  <Info size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

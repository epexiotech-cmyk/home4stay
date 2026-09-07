"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { BedDouble, Plus, X, Loader2 } from "lucide-react";
import RoomForm from "@/components/RoomForm";
import { RoomGroup, Room } from "@/components/calendar/types";

export default function PartnerRoomsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [propertySlug, setPropertySlug] = useState("");
  const [roomGroups, setRoomGroups] = useState<RoomGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.propertyId) return;
    
    const fetchRooms = async () => {
      try {
        const res = await fetch(`/api/partner/rooms?propertyId=${user.propertyId}`);
        if (res.ok) {
          const data = await res.json();
          setPropertySlug(data.propertySlug || "");
          setRoomGroups(data.roomGroups || []);
        }
      } catch (err) {
        console.error("Failed to fetch rooms", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 select-none pb-20">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-premium rounded-[32px] border-white/20 shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0983B0] bg-[#0983B0]/10 px-2.5 py-0.5 rounded-full">
            Inventory Engine
          </span>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0E5A75] dark:text-white mt-1">
            Property Rooms & Suites
          </h1>
          <p className="text-xs text-[#0E5A75]/70 dark:text-white/70 mt-0.5 max-w-lg leading-relaxed">
            Configure private suite designations, coordinate physical access paths, and define seasonal spatial limits.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className={`px-4 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-1.5 self-start md:self-auto ${
            showAddForm ? "bg-red-500 hover:bg-red-600" : "bg-[#0E5A75] hover:bg-[#0983B0]"
          }`}
        >
          {showAddForm ? (
            <>
              <X size={14} /> Cancel
            </>
          ) : (
            <>
              <Plus size={14} /> Append Suite
            </>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="animate-spin text-[#0E5A75] w-8 h-8" />
        </div>
      ) : showAddForm ? (
        <div className="animate-in slide-in-from-top-4 duration-500">
          <RoomForm slug={propertySlug} />
        </div>
      ) : (
        <div className="space-y-8 mt-8">
          {roomGroups.length > 0 ? (
            roomGroups.map((group, idx) => (
              <div key={idx} className="glass-matte p-6 rounded-3xl border-white/10">
                <h3 className="text-sm font-bold text-[#0E5A75] dark:text-white mb-4 uppercase tracking-widest">{group.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.rooms.map((r: Room) => (
                    <div key={r.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center hover:bg-white/10 transition-colors">
                      <div>
                        <p className="font-bold text-[#0E5A75] dark:text-white">{r.name}</p>
                        <p className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-white/60 uppercase tracking-wider">{r.type} • {r.id}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest ${r.status === 'clean' ? 'bg-[#159665]/10 text-[#159665]' : r.status === 'maintenance' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 glass-matte rounded-3xl border-white/10 text-center max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#0983B0]/10 text-[#0983B0] flex items-center justify-center mx-auto">
                <BedDouble size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-base font-black text-[#0E5A75] dark:text-white">
                  No Specific Room Layouts Configured
                </p>
                <p className="text-xs text-[#0E5A75]/60 dark:text-white/50 max-w-md mx-auto leading-relaxed">
                  All primary accommodation nodes are currently managed via the root master property inventory hub. Click &quot;Append Suite&quot; to calibrate visual layout sets directly.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

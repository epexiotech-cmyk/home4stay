"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { BedDouble, Plus, X, Loader2, IndianRupee, Trash2, Edit3, Image as ImageIcon } from "lucide-react";
import RoomForm from "@/components/RoomForm";
import RoomImageManager from "@/components/RoomImageManager";

interface PropertyRoom {
  id: string;
  name: string;
  roomCount: number;
  price: number;
  view: string;
  tags: string[];
  isActive: boolean;
  images: string[];
}

export default function PartnerRoomsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [propertySlug, setPropertySlug] = useState("");
  const [rooms, setRooms] = useState<PropertyRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [managingPhotosFor, setManagingPhotosFor] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const { user } = useAuth();
  
  const fetchRooms = async () => {
    try {
      const res = await fetch(`/api/partner/rooms?propertyId=${user?.propertyId}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.success && json.data ? json.data : json;
        setPropertySlug(data.propertySlug || "");
        
        // Map from API
        const rawRooms: Array<Record<string, unknown>> = data.rooms || [];
        const mappedRooms: PropertyRoom[] = rawRooms.map(r => ({
          id: typeof r.id === 'string' ? r.id : "",
          name: typeof r.name === 'string' ? r.name : "Room",
          roomCount: typeof r.roomCount === 'number' ? r.roomCount : 1,
          price: typeof r.price === 'number' ? r.price : 0,
          view: typeof r.view === 'string' ? r.view : "Standard",
          tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
          isActive: typeof r.isActive === 'boolean' ? r.isActive : true,
          images: Array.isArray(r.images) ? (r.images as string[]) : []
        }));
        
        setRooms(mappedRooms);
      }
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.propertyId) return;
    fetchRooms();
  }, [user]);

  const handleDeactivate = async (id: string, currentlyActive: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlyActive ? 'deactivate' : 'activate'} this room type?`)) return;
    
    setActionLoadingId(id);
    try {
      const res = await fetch("/api/property/room", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentlyActive })
      });
      if (res.ok) {
        await fetchRooms();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update room.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

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
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) fetchRooms(); // Refresh when closing form just in case
          }}
          className={`px-4 py-2.5 rounded-xl text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all flex items-center gap-1.5 self-start md:self-auto ${
            showAddForm ? "bg-red-500 hover:bg-red-600" : "bg-[#0E5A75] hover:bg-[#0983B0]"
          }`}
        >
          {showAddForm ? (
            <>
              <X size={14} /> Close
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
          {rooms.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className={`glass-matte p-6 rounded-3xl border-white/10 transition-all ${!room.isActive ? 'opacity-60 grayscale' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-[#0E5A75] dark:text-white tracking-tight">{room.name}</h3>
                      <p className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-white/60 uppercase tracking-wider">{room.view} • {room.id.slice(0,8)}</p>
                    </div>
                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${room.isActive ? 'bg-[#159665]/10 text-[#159665]' : 'bg-red-500/10 text-red-500'}`}>
                      {room.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <p className="text-[9px] font-bold text-[#0E5A75]/60 dark:text-white/60 uppercase tracking-widest mb-1">Units (Inventory)</p>
                      <p className="text-sm font-black text-[#0E5A75] dark:text-white flex items-center gap-1.5">
                        <BedDouble size={14} className="opacity-50" /> {room.roomCount} Rooms
                      </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl">
                      <p className="text-[9px] font-bold text-[#0E5A75]/60 dark:text-white/60 uppercase tracking-widest mb-1">Base Price</p>
                      <p className="text-sm font-black text-[#159665] flex items-center gap-1">
                        <IndianRupee size={12} /> {room.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {room.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-lg bg-[#0E5A75]/5 text-[#0E5A75] text-[9px] font-black uppercase tracking-tighter">{tag}</span>
                    ))}
                    {room.tags.length === 0 && <span className="text-[10px] italic text-white/40">No amenities listed</span>}
                  </div>
                  
                  

                  {managingPhotosFor === room.id && (
                    <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                      <RoomImageManager roomId={room.id} />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-black/5 dark:border-white/5">
                    <button 
                      disabled={actionLoadingId === room.id}
                      onClick={() => handleDeactivate(room.id, room.isActive)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                        room.isActive 
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                          : 'bg-[#159665]/10 text-[#159665] hover:bg-[#159665] hover:text-white'
                      }`}
                    >
                      {actionLoadingId === room.id ? <Loader2 size={12} className="animate-spin" /> : room.isActive ? <Trash2 size={12} /> : <BedDouble size={12} />}
                      {room.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>

                    <button 
                      onClick={() => setEditingRoomId(editingRoomId === room.id ? null : room.id)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all bg-[#0983B0]/10 text-[#0983B0] hover:bg-[#0983B0] hover:text-white"
                    >
                      <Edit3 size={12} /> {editingRoomId === room.id ? 'Cancel Edit' : 'Edit Suite'}
                    </button>
                    
                    <button 
                      onClick={() => setManagingPhotosFor(managingPhotosFor === room.id ? null : room.id)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all bg-[#159665]/10 text-[#159665] hover:bg-[#159665] hover:text-white"
                    >
                      <ImageIcon size={12} /> {managingPhotosFor === room.id ? 'Hide Photos' : 'Manage Photos'}
                    </button>
                  </div>
                  {editingRoomId === room.id && (
                    <div className="mt-6 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-500">
                      <RoomForm 
                        slug={propertySlug} 
                        initialData={room} 
                        onSuccess={() => { setEditingRoomId(null); fetchRooms(); }} 
                        onCancel={() => setEditingRoomId(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                  All primary accommodation nodes are currently managed via the root master property inventory hub. Click "Append Suite" to calibrate visual layout sets directly.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

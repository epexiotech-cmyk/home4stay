# -*- coding: utf-8 -*-
import os

filepath = 'apps/main-site/src/app/(portal)/partner/properties/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
imports_to_add = """import RoomForm from "@/components/RoomForm";
import { Loader2, Trash2, BedDouble } from "lucide-react";
"""
content = content.replace('import Link from "next/link";', 'import Link from "next/link";\n' + imports_to_add)

# 2. Inject states
old_state = """export default function PropertiesPage() {
  const { user } = useAuth();
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);"""

new_state = """export default function PropertiesPage() {
  const { user } = useAuth();
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);"""
content = content.replace(old_state, new_state)

# 3. Update RoomType interface
old_interface = """interface RoomType {
  id: string;
  name: string;
  roomCount: number;
  price: number;
  tags: string[];
}"""

new_interface = """interface RoomType {
  id: string;
  name: string;
  roomCount: number;
  price: number;
  tags: string[];
  isActive: boolean;
  images: string[];
  capacity: string;
  view: string;
}"""
content = content.replace(old_interface, new_interface)

# 4. Update mappedRooms
old_mapping = """          const mappedRooms: RoomType[] = rawRooms.map((r) => ({
             id: typeof r.id === 'string' ? r.id : "unknown-id",
             name: typeof r.name === 'string' ? r.name : "Room",
             roomCount: typeof r.roomCount === 'number' ? r.roomCount : 0,
             price: typeof r.price === 'number' ? r.price : 0,
             tags: Array.isArray(r.tags) ? (r.tags as string[]) : []
          }));"""

new_mapping = """          const mappedRooms: RoomType[] = rawRooms.map((r) => ({
             id: typeof r.id === 'string' ? r.id : "unknown-id",
             name: typeof r.name === 'string' ? r.name : "Room",
             roomCount: typeof r.roomCount === 'number' ? r.roomCount : 0,
             price: typeof r.price === 'number' ? r.price : 0,
             tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
             isActive: typeof r.isActive === 'boolean' ? r.isActive : true,
             images: Array.isArray(r.images) ? (r.images as string[]) : [],
             capacity: typeof r.capacity === 'string' ? r.capacity : "2 Guests",
             view: typeof r.view === 'string' ? r.view : "Standard"
          }));"""
content = content.replace(old_mapping, new_mapping)

# 5. Update RoomTypeCard mapping (inject onRefresh as reload)
old_map = """          ) : activeProperty.rooms.map((type) => (
            <RoomTypeCard 
              key={type.id} 
              type={type} 
            />
          ))}"""

new_map = """          ) : activeProperty.rooms.map((type) => (
            <div key={type.id} className="relative">
              <RoomTypeCard 
                type={type} 
                editingRoomId={editingRoomId}
                setEditingRoomId={setEditingRoomId}
                actionLoadingId={actionLoadingId}
                setActionLoadingId={setActionLoadingId}
                onRefresh={() => window.location.reload()}
                propertySlug={activeProperty.slug}
              />
            </div>
          ))}"""
content = content.replace(old_map, new_map)

# 6. Replace RoomTypeCard block
card_start_idx = content.find('function RoomTypeCard({')
if card_start_idx != -1:
    content = content[:card_start_idx] + """function RoomTypeCard({ 
  type, 
  editingRoomId, 
  setEditingRoomId, 
  actionLoadingId, 
  setActionLoadingId, 
  onRefresh, 
  propertySlug 
}: { 
  type: RoomType;
  editingRoomId: string | null;
  setEditingRoomId: (id: string | null) => void;
  actionLoadingId: string | null;
  setActionLoadingId: (id: string | null) => void;
  onRefresh: () => void;
  propertySlug: string;
}) {
  const isEditing = editingRoomId === type.id;
  const isActionLoading = actionLoadingId === type.id;

  const handleDeactivate = async (currentlyActive: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlyActive ? 'deactivate' : 'activate'} this room type?`)) return;
    setActionLoadingId(type.id);
    try {
      const res = await fetch("/api/property/room", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: type.id, isActive: !currentlyActive })
      });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error?.message || data.message || "Failed to update room.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${type.name}?`)) return;
    setActionLoadingId(type.id);
    try {
      const res = await fetch(`/api/property/room?id=${type.id}`, { method: "DELETE" });
      if (res.ok) {
        onRefresh();
      } else {
        const data = await res.json();
        alert(data.error?.message || data.message || "Failed to delete room.");
      }
    } catch (err: any) {
      alert(err.message || "An unexpected error occurred");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isEditing) {
    return (
      <div className="col-span-full xl:col-span-2 glass-matte p-6 rounded-[32px] border-white/20 animate-in fade-in zoom-in-95 duration-300">
        <RoomForm 
          slug={propertySlug} 
          initialData={type} 
          onSuccess={() => { setEditingRoomId(null); onRefresh(); }} 
          onCancel={() => setEditingRoomId(null)}
        />
      </div>
    );
  }

  return (
    <GlassCard className={cn("p-6 flex flex-col h-full border-none shadow-premium bg-white/40 dark:bg-white/5 transition-all duration-300", !type.isActive && "opacity-60 grayscale")}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full", type.isActive ? "bg-[#159665]/10 text-[#159665]" : "bg-red-500/10 text-red-500")}>
              {type.isActive ? "? Active" : "? Inactive"}
            </span>
            <p className="text-[10px] font-black text-[#0E5A75]/50 uppercase tracking-widest opacity-50 truncate max-w-[150px]">{type.id}</p>
          </div>
          <h4 className="text-lg font-black text-[#053344] dark:text-white tracking-tight leading-tight line-clamp-2">{type.name}</h4>
        </div>
        <div className="w-10 h-10 shrink-0 rounded-xl bg-[#0E5A75]/5 flex items-center justify-center text-[#0E5A75]">
          <Bed size={20} />
        </div>
      </div>

      <div className="space-y-4 flex-1">
        <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
          <span className="text-xs font-bold text-[#0E5A75]/60 uppercase tracking-widest">Available Units</span>
          <span className="text-sm font-black text-[#053344] dark:text-white flex items-center gap-1.5"><BedDouble size={14} className="opacity-50" /> {type.roomCount} Rooms</span>
        </div>
        <div className="flex justify-between items-center pb-3 border-b border-black/5 dark:border-white/5">
          <span className="text-xs font-bold text-[#0E5A75]/60 uppercase tracking-widest">Base Rate</span>
          <span className="text-lg font-black text-[#159665]">?{type.price.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <button 
            disabled={isActionLoading}
            onClick={() => handleDeactivate(type.isActive)}
            className={cn("py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50", type.isActive ? "bg-[#0E5A75]/5 text-[#0E5A75] hover:bg-[#0E5A75]/10" : "bg-[#159665]/10 text-[#159665] hover:bg-[#159665]/20")}
          >
            {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : type.isActive ? <Settings size={12} /> : <BedDouble size={12} />}
            {type.isActive ? "Deactivate" : "Activate"}
          </button>
          
          <button 
            disabled={isActionLoading}
            onClick={() => setEditingRoomId(type.id)}
            className="py-2.5 rounded-xl bg-[#0983B0]/10 text-[#0983B0] hover:bg-[#0983B0]/20 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Edit3 size={12} /> Edit
          </button>
        </div>
        
        <button 
          disabled={isActionLoading}
          onClick={handleDelete}
          className="w-full py-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
        >
          {isActionLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          Delete Suite
        </button>
      </div>
    </GlassCard>
  );
}
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Properly rewrote page.tsx")

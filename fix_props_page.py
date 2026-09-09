# -*- coding: utf-8 -*-
import os
import re

filepath = 'apps/main-site/src/app/(portal)/partner/properties/page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix fetchProperty inside PropertiesPage
# Find PropertiesPage
match = re.search(r'(export default function PropertiesPage\(\) \{[\s\S]*?)(useEffect\(\(\) => \{[\s\S]*?const fetchProperty = async \(\) => \{[\s\S]*?\}\;\n    fetchProperty\(\);\n  \}, \[user\]\);)', content)

if match:
    old_use_effect = match.group(2)
    # Extract fetchProperty
    fetch_prop_match = re.search(r'(const fetchProperty = async \(\) => \{[\s\S]*?\}\;)', old_use_effect)
    if fetch_prop_match:
        fetch_prop_code = fetch_prop_match.group(1)
        new_use_effect = """
  useEffect(() => {
    if (!user?.propertyId) {
      setLoading(false);
      return;
    }
    fetchProperty();
  }, [user]);
"""
        new_code = fetch_prop_code + "\n" + new_use_effect
        content = content.replace(old_use_effect, new_code)
        
# Replace RoomTypeCard from line 309 (approx)
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

print("Fixed PropertiesPage logic")

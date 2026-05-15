"use client";

import React from "react";
import { Plus, Trash2, Coffee } from "lucide-react";

interface AmenitiesEditorProps {
  data?: { facilities?: string[] };
  onChange: (updatedData: { facilities: string[] }) => void;
}

export default function AmenitiesEditor({ data, onChange }: AmenitiesEditorProps) {
  const facilities: string[] = Array.isArray(data?.facilities) ? data.facilities : [
    "Infinity Horizon Thermal Pool", "Underground Timber Spa", "Heliport Strip"
  ];

  const handleUpdate = (idx: number, val: string) => {
    const copy = [...facilities];
    copy[idx] = val;
    onChange({ ...(data || {}), facilities: copy });
  };

  const handleAdd = () => {
    onChange({ ...(data || {}), facilities: [...facilities, "Bespoke Suite Setup"] });
  };

  const handleDelete = (idx: number) => {
    onChange({ ...(data || {}), facilities: facilities.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0E5A75] dark:text-white">
          <Coffee size={14} className="text-[#159665]" /> Bespoke Amenities Matrix
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[10px] font-bold text-[#159665] bg-[#159665]/10 px-2 py-1 rounded hover:bg-[#159665] hover:text-white transition-colors"
        >
          <Plus size={10} className="inline mr-1" /> Append Facility
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {facilities.map((fac, idx) => (
          <div key={idx} className="flex items-center gap-1 p-1.5 rounded bg-white/60 dark:bg-black/30 border border-black/5">
            <input
              type="text"
              value={fac}
              onChange={(e) => handleUpdate(idx, e.target.value)}
              className="w-full px-2 py-1 text-[11px] font-bold text-[#053344] dark:text-white outline-none bg-transparent"
            />
            <button
              type="button"
              onClick={() => handleDelete(idx)}
              className="text-red-500/60 hover:text-red-500 p-1"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

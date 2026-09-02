"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type RenewalControlProps = {
  propertyId: string;
  initialStatus: string;
};

export default function RenewalControl({ propertyId, initialStatus }: RenewalControlProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync state with server-side prop updates after router.refresh()
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const isLive = status === "LIVE" || status === "ACTIVE" || status === "RENEWED";

  const handleToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // We capture the intended state from the checkbox
    const wantLive = e.target.checked;
    
    if (loading) return;
    
    setLoading(true);
    setError("");

    // Optimistic update
    setStatus(wantLive ? "LIVE" : "SUSPENDED");

    try {
      const res = await fetch(`/api/admin/database/partners/${propertyId}/renewal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ renew: wantLive })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update renewal status");
      }

      setStatus(data.status); // e.g. LIVE or SUSPENDED
      router.refresh(); // Refresh page data to sync server state
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      // Revert optimistic update
      setStatus(initialStatus);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const wantLive = e.currentTarget.checked;
    if (wantLive) {
      if (!window.confirm("Renew this property and keep its website active?")) {
        e.preventDefault(); // Prevents checkbox from checking visually, stops onChange
      }
    } else {
      if (!window.confirm("Are you sure you want to disable renewal for this property?\nThe property's website/subdomain will be disabled after the current subscription period.")) {
        e.preventDefault(); // Prevents checkbox from unchecking visually, stops onChange
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-primary">Renewal Status</p>
          <p className="text-xs text-secondary mt-1 max-w-[200px]">
            {isLive ? "Property website and subscription are active." : "Property website is currently disabled."}
          </p>
        </div>
        
        <label className={`relative inline-flex items-center cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={isLive}
            onClick={handleClick}
            onChange={handleToggle}
            disabled={loading}
          />
          <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success"></div>
          <span className="ml-3 text-sm font-bold text-primary w-20">
            {loading ? "SAVING..." : (isLive ? "RENEWED" : "OFF")}
          </span>
        </label>
      </div>
      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
    </div>
  );
}

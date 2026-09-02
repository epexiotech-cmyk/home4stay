"use client";

import React, { useState } from "react";
import Link from "next/link";

type PropType = {
  id: string;
  title: string;
  ownerName: string | null;
  totalPaid: number;
  renewalDateString: string;
  statusLabel: string;
  statusClass: string;
};

export default function RecentPropertiesList({ properties }: { properties: PropType[] }) {
  const [expanded, setExpanded] = useState(false);
  const displayProps = expanded ? properties : properties.slice(0, 5);

  return (
    <div className="rounded-[2.5rem] border-2 border-primary/5 bg-surface p-10 flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-primary">Recent Properties</h3>
        <button 
          onClick={() => setExpanded(!expanded)} 
          className="text-xs font-bold text-accent hover:underline uppercase tracking-widest cursor-pointer focus:outline-none"
        >
          {expanded ? "SHOW LESS" : "VIEW ALL"}
        </button>
      </div>
      
      {/* The scrollable container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar" style={{ maxHeight: "600px" }}>
        {displayProps.length === 0 ? (
          <div className="h-full flex items-center justify-center text-secondary font-bold">
            No properties yet.
          </div>
        ) : (
          displayProps.map(property => (
            <Link 
              key={property.id} 
              href={`/admin/database/partners/${property.id}?from=dashboard`}
              className="flex flex-col gap-3 p-4 rounded-2xl bg-background border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-primary truncate max-w-[200px] group-hover:text-accent transition-colors" title={property.title}>{property.title}</p>
                  <p className="text-xs text-secondary">{property.ownerName}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase whitespace-nowrap ${property.statusClass}`}>
                  {property.statusLabel}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-surface-alt p-2 rounded-lg">
                  <p className="text-secondary font-medium mb-0.5">Paid Amount</p>
                  <p className="font-bold text-primary">{property.totalPaid > 0 ? `₹${property.totalPaid.toLocaleString()}` : "N/A"}</p>
                </div>
                <div className="bg-surface-alt p-2 rounded-lg">
                  <p className="text-secondary font-medium mb-0.5">Renewal Due</p>
                  <p className="font-bold text-primary">{property.renewalDateString}</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

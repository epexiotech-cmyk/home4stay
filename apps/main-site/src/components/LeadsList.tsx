"use client";

import { useState } from "react";

interface Lead {
  name: string;
  phone: string;
  property: string;
  location: string;
  time: string;
  status?: "new" | "contacted";
}

interface LeadsListProps {
  initialLeads: Lead[];
}

export default function LeadsList({ initialLeads }: LeadsListProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "contacted">("all");

  // 1. SORT ON UI (Guarantees newest on top)
  const sortedLeads = [...initialLeads].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  // 2. FILTER LOGIC
  const filteredLeads = sortedLeads.filter((lead) => {
    if (filter === "all") return true;
    const status = lead.status || "new"; // Default to "new" if missing
    return status === filter;
  });

  const copyToClipboard = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopyStatus(phone);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* QUICK FILTER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setFilter("all")}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition ${
              filter === "all" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter("new")}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition ${
              filter === "new" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            New
          </button>
          <button 
            onClick={() => setFilter("contacted")}
            className={`text-sm font-bold px-4 py-2 rounded-lg transition ${
              filter === "contacted" ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            Contacted
          </button>
        </div>
        
        <p className="text-sm font-medium text-zinc-400">
          Showing {filteredLeads.length} leads
        </p>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-20 text-center">
          <p className="text-zinc-500 font-medium text-lg">No {filter === 'all' ? '' : filter} leads yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead, index) => {
            const status = lead.status || "new";

            return (
              <div 
                key={index} 
                className="group border border-zinc-200 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-bold text-xl text-zinc-900">
                        {lead.name}
                      </h2>
                      {/* STATUS TAG */}
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                        status === "new" 
                          ? "bg-green-100 text-green-700 border border-green-200" 
                          : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                      Submitted on {new Date(lead.time).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100">
                    {new Date(lead.time).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  {/* Click to Copy Phone */}
                  <div 
                    className="flex flex-col gap-1 cursor-pointer group/item"
                    onClick={() => copyToClipboard(lead.phone)}
                    title="Click to copy number"
                  >
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Contact Number</span>
                    <p className="text-zinc-900 font-semibold flex items-center gap-2">
                      <span className="text-zinc-300">📞</span> {lead.phone}
                      <span className={`text-[10px] font-bold uppercase transition-all ${
                        copyStatus === lead.phone ? "text-green-500 opacity-100" : "text-zinc-300 opacity-0 group-hover/item:opacity-100"
                      }`}>
                        {copyStatus === lead.phone ? "Copied!" : "Copy"}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Property Name</span>
                    <p className="text-zinc-900 font-semibold flex items-center gap-2">
                      <span className="text-zinc-300">🏨</span> {lead.property}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Location</span>
                    <p className="text-zinc-900 font-semibold flex items-center gap-2">
                      <span className="text-zinc-300">📍</span> {lead.location}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={`tel:${lead.phone}`}
                    className="text-xs font-bold bg-zinc-900 text-white px-6 py-2 rounded-lg hover:bg-zinc-800"
                  >
                    Call Now
                  </a>
                  <a 
                    href={`https://wa.me/91${lead.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold border border-zinc-200 text-zinc-600 px-6 py-2 rounded-lg hover:bg-zinc-50"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

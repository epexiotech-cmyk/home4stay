"use client";

import { useState } from "react";

interface Lead {
  name: string;
  email: string;
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

  const sortedLeads = [...initialLeads].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  const filteredLeads = sortedLeads.filter((lead) => {
    if (filter === "all") return true;
    const status = lead.status || "new";
    return status === filter;
  });

  const copyToClipboard = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopyStatus(phone);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  return (
    <div className="space-y-6">
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
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">No.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Customer Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Email ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Contact No</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Booking Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">Property Name</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLeads.map((lead, index) => {
                  const status = lead.status || "new";
                  return (
                    <tr key={index} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-400">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-zinc-900">{lead.name}</span>
                          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md ${
                            status === "new" 
                              ? "bg-green-100 text-green-700 border border-green-200" 
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                          }`}>
                            {status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 font-medium">
                        {lead.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="flex items-center gap-2 cursor-pointer group/copy"
                          onClick={() => copyToClipboard(lead.phone)}
                          title="Click to copy number"
                        >
                          <span className="text-sm font-semibold text-zinc-900">{lead.phone}</span>
                          <span className={`text-[10px] font-bold uppercase transition-all ${
                            copyStatus === lead.phone ? "text-green-500 opacity-100" : "text-zinc-300 opacity-0 group-hover/copy:opacity-100"
                          }`}>
                            {copyStatus === lead.phone ? "Copied" : "Copy"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-900 font-medium">
                          {new Date(lead.time).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">
                          {new Date(lead.time).toLocaleTimeString("en-IN", {
                            hour: "2-digit", minute: "2-digit"
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 font-medium">
                        {lead.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-zinc-900">
                        {lead.property}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

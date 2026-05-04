"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Clock, 
  Globe, 
  AlertTriangle,
  Info,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  MoreVertical
} from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string | null;
  event_type: string;
  ip_address: string;
  user_agent: string;
  metadata: Record<string, unknown>;
  severity: "low" | "medium" | "high";
  location_data: {
    country?: string;
    city?: string;
    isp?: string;
    region?: string;
  } | null;
  timestamp: string;
}

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/security/logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const handleRefresh = () => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/security/logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== "all" && log.severity !== filter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        log.event_type.toLowerCase().includes(search) ||
        log.ip_address.toLowerCase().includes(search) ||
        log.user_id?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
                <ShieldAlert size={24} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Security Command Center</h1>
            </div>
            <p className="text-gray-500">Monitor threats, audit logs, and system anomalies in real-time.</p>
          </div>
          
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Logs
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Active Threats", value: "3", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
            { label: "Successful Resets", value: "24", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-50" },
            { label: "Rate Limit Violations", value: "12", icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-50" }
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-6">
              <div className={`h-14 w-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by IP, User ID, or Event Type..."
              className="w-full pl-12 pr-4 h-12 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 transition-all outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="h-12 px-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 transition-all outline-none text-sm font-medium"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Severities</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Event & Timestamp</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User & Device</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="h-10 bg-gray-50 rounded-xl w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Info size={40} className="text-gray-300" />
                        <p className="text-gray-500 font-medium">No security logs found matching your filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900 flex items-center gap-2">
                          {log.event_type.replace(/_/g, ' ')}
                          <ChevronRight size={14} className="text-gray-300" />
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={12} />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <User size={14} className="text-gray-400" />
                          {log.user_id ? log.user_id.slice(0, 8) + '...' : 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <Globe size={14} />
                          {log.ip_address}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {log.location_data ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                            <MapPin size={14} className="text-primary" />
                            {log.location_data.country}
                          </div>
                          <span className="text-xs text-gray-400">{log.location_data.city || 'Unknown City'}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">No Geo-Data</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        log.severity === 'high' ? 'bg-red-50 text-red-600' :
                        log.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          log.severity === 'high' ? 'bg-red-500' :
                          log.severity === 'medium' ? 'bg-amber-500' :
                          'bg-blue-500'
                        }`}></span>
                        {log.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-gray-200/50 rounded-lg text-gray-400 hover:text-gray-600 transition-all opacity-0 group-hover:opacity-100">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

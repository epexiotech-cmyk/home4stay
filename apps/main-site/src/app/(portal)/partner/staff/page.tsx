"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Users, UserPlus, Shield, Clock, Activity, Mail, ChevronRight, 
  CheckCircle2, X, Plus, Search, Filter, Settings, Smartphone, 
  Laptop, History, Unlock, Lock, Building2, Trash2, Edit3, LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- Types ---

type StaffRole = "Owner" | "Manager" | "Receptionist" | "Accountant" | "Housekeeping" | "Support Staff";

interface StaffMember {
  accessId: string;
  userId: string;
  name: string;
  role: StaffRole;
  status: "active" | "pending";
  email: string;
  phone: string;
  lastLogin: string;
  isOnline: boolean;
  createdAt: string;
  isOwner: boolean;
  shift?: string;
  properties?: string[];
}

interface ActivityLog {
  id: string;
  staffName: string;
  action: string;
  target: string;
  time: string;
  icon: LucideIcon;
}



// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] p-6 hover-lift border border-white/5 dark:border-white/5 shadow-premium", className)}>
    {children}
  </div>
);

const RoleBadge = ({ role }: { role: string }) => {
  const configs: Record<string, string> = {
    Owner: "bg-[#0E5A75] text-white",
    Manager: "bg-[#0983B0]/10 text-[#0983B0]",
    Receptionist: "bg-[#159665]/10 text-[#159665]",
    Accountant: "bg-[#FCBC43]/10 text-[#FCBC43]",
    Housekeeping: "bg-[#29655C]/10 text-[#29655C]",
    "Support Staff": "bg-gray-500/10 text-gray-500",
  };
  return (
    <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap", configs[role] || "bg-[#0E5A75]/10 text-[#0E5A75]")}>
      {role}
    </span>
  );
};

const StatusBadge = ({ isOnline, status }: { isOnline: boolean, status: string }) => {
  const isPending = status === "pending";
  const bg = isPending ? "bg-orange-500/10" : (isOnline ? "bg-[#159665]/10" : "bg-gray-400/10");
  const color = isPending ? "text-orange-500" : (isOnline ? "text-[#159665]" : "text-gray-400");
  const label = isPending ? "Pending Invite" : (isOnline ? "Online" : "Offline");

  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full", bg, color)}>
      <div className={cn("w-1.5 h-1.5 rounded-full", isOnline && "animate-pulse", color.replace('text-', 'bg-'))} />
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
};

// --- Main Page ---

export default function StaffPage() {
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId") || "";
  
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("Manager");

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const [res, logRes] = await Promise.all([
        fetch(`/api/partner/staff?propertyId=${propertyId}`),
        fetch(`/api/partner/staff/activity?propertyId=${propertyId}`)
      ]);
      if (res.ok) {
        const json = await res.json();
        setStaff(json.data.staff || []);
      }
      if (logRes.ok) {
        const logJson = await logRes.json();
        setActivityLogs(logJson.data.logs || []);
      }
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    if (propertyId) {
      fetchStaff();
    }
    return () => cancelAnimationFrame(raf);
  }, [propertyId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/partner/staff?propertyId=${propertyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to invite staff");
      
      toast.success("Staff invited successfully");
      setIsInviteOpen(false);
      fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleRemove = async (accessId: string) => {
    if (!confirm("Are you sure you want to permanently revoke this user's access to the property?")) return;
    try {
      const res = await fetch(`/api/partner/staff/${accessId}?propertyId=${propertyId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to remove staff");
      
      toast.success("Staff access revoked");
      setSelectedStaff(null);
      fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const handleRoleUpdate = async (accessId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/partner/staff/${accessId}?propertyId=${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update role");
      
      toast.success("Role updated successfully");
      setSelectedStaff(prev => prev ? { ...prev, role: newRole as StaffRole } : null);
      fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-20">
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
            <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Operational Governance</span>
          </div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Staff & Access</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0E5A75]/40" size={18} />
            <input 
              type="text" 
              placeholder="Search staff by name or role..." 
              className="w-full pl-12 pr-4 py-4 rounded-[24px] glass-matte border-transparent focus:border-[#0E5A75]/20 focus:outline-none text-sm font-bold"
            />
          </div>
          <button onClick={() => setIsInviteOpen(true)} className="flex items-center gap-2 px-8 py-4 rounded-[24px] bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all group">
            <UserPlus size={20} />
            <span className="text-sm font-black uppercase tracking-widest">Invite Staff</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Active Staff" value={staff.length.toString().padStart(2, '0')} icon={Users} color="text-[#0E5A75]" />
        <StatWidget label="Online Now" value={staff.filter(s => s.isOnline).length.toString().padStart(2, '0')} icon={Clock} color="text-[#159665]" />
        <StatWidget label="Pending Invites" value={staff.filter(s => s.status === 'pending').length.toString().padStart(2, '0')} icon={Mail} color="text-[#FCBC43]" />
        <StatWidget label="Active Logs" value={activityLogs.length.toString().padStart(2, '0')} icon={Activity} color="text-[#0983B0]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white">Staff Directory</h3>
          </div>
          {isLoading ? (
            <p className="text-sm font-bold text-gray-400">Loading staff directory...</p>
          ) : staff.length === 0 ? (
            <p className="text-sm font-bold text-gray-400">No staff members found.</p>
          ) : (
            staff.map((member) => (
              <StaffListItem 
                key={member.accessId} 
                member={member} 
                onClick={() => setSelectedStaff(member)}
              />
            ))
          )}
        </div>

        <div className="space-y-6">
          <GlassCard className="p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white mb-8 flex items-center gap-2">
              <History size={18} className="text-[#0983B0]" /> Operational Logs
            </h3>
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-[#0E5A75]/10">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex gap-4 relative">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#0E5A75] shrink-0 z-10 border border-[#0E5A75]/10 bg-white dark:bg-[#0A0F1D]">
                    <Settings size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#0983B0] uppercase tracking-widest leading-none mb-1">{log.time}</p>
                    <p className="text-xs font-black text-[#053344] dark:text-white leading-tight">
                      <span className="text-[#0E5A75]">{log.staffName}</span> {log.action.toLowerCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Staff Detail Drawer */}
      {selectedStaff && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-[#053344]/40 backdrop-blur-sm" onClick={() => setSelectedStaff(null)} />
          <aside className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1D] shadow-luxury h-full animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-2xl shadow-xl">
                  {selectedStaff.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight leading-none mb-2">{selectedStaff.name}</h2>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={selectedStaff.role} />
                    <span className="text-[10px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">{selectedStaff.accessId.split('-')[0]}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="p-3 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              
              <div className="flex items-center justify-between p-6 rounded-[24px] bg-[#0E5A75]/5 border border-[#0E5A75]/10">
                <div>
                  <p className="text-[10px] font-black text-[#0E5A75]/50 uppercase tracking-widest mb-1">Status</p>
                  <StatusBadge isOnline={selectedStaff.isOnline} status={selectedStaff.status} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#0E5A75]/50 uppercase tracking-widest mb-1">Last Activity</p>
                  <p className="text-sm font-black text-[#053344] dark:text-white">
                    {selectedStaff.lastLogin && selectedStaff.lastLogin !== 'Never' ? new Date(selectedStaff.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>

              {!selectedStaff.isOwner && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Permissions Overview</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <PermissionItem label="Manage Bookings" active={selectedStaff.role !== "Housekeeping"} />
                    <PermissionItem label="View Financials" active={selectedStaff.role === "Manager" || selectedStaff.role === "Accountant" || selectedStaff.role === "Owner"} />
                    <PermissionItem label="Update Inventory" active={selectedStaff.role !== "Accountant" && selectedStaff.role !== "Support Staff"} />
                  </div>
                </div>
              )}
              
              {!selectedStaff.isOwner && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Change Role</h3>
                  <select 
                    value={selectedStaff.role} 
                    onChange={(e) => handleRoleUpdate(selectedStaff.accessId, e.target.value)}
                    className="w-full p-4 rounded-xl glass-matte border border-[#0E5A75]/20 focus:outline-none text-sm font-bold bg-white dark:bg-[#0A0F1D]"
                  >
                    <option value="Manager">Manager</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Support Staff">Support Staff</option>
                  </select>
                </div>
              )}
            </div>

            {!selectedStaff.isOwner && (
              <div className="p-8 border-t border-black/5 dark:border-white/5 flex gap-3">
                <button onClick={() => handleRemove(selectedStaff.accessId)} className="flex-1 py-4 rounded-2xl border border-[#F24633]/20 text-[#F24633] font-black uppercase tracking-widest hover:bg-[#F24633]/5 transition-all flex items-center justify-center gap-2">
                  <Trash2 size={18} /> Revoke Access
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInviteOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#0A0F1D] rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-[#053344] dark:text-white">Invite Staff</h2>
              <button onClick={() => setIsInviteOpen(false)} className="p-2 text-[#0E5A75]/40 hover:text-[#0E5A75]"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 block mb-2">Name</label>
                <input required type="text" value={inviteName} onChange={e=>setInviteName(e.target.value)} className="w-full p-4 rounded-xl glass-matte border border-[#0E5A75]/20 focus:border-[#0E5A75] focus:outline-none text-sm font-bold" placeholder="e.g. Rahul Sharma" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 block mb-2">Email</label>
                <input required type="email" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} className="w-full p-4 rounded-xl glass-matte border border-[#0E5A75]/20 focus:border-[#0E5A75] focus:outline-none text-sm font-bold" placeholder="name@example.com" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 block mb-2">Role</label>
                <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} className="w-full p-4 rounded-xl glass-matte border border-[#0E5A75]/20 focus:outline-none text-sm font-bold bg-white dark:bg-[#0A0F1D]">
                  <option value="Manager">Manager</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Support Staff">Support Staff</option>
                </select>
              </div>
              <button type="submit" className="w-full mt-4 py-4 rounded-2xl bg-[#0E5A75] text-white font-black uppercase tracking-widest shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all">
                Send Invitation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Helper Components ---

function StatWidget({ label, value, icon: Icon, color }: { label: string, value: string, icon: LucideIcon, color: string }) {
  return (
    <GlassCard className="p-5 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">{label}</p>
        <p className={cn("text-3xl font-black leading-none", color)}>{value}</p>
      </div>
      <div className={cn("p-3 rounded-2xl bg-white dark:bg-white/5 shadow-inner", color)}>
        <Icon size={20} />
      </div>
    </GlassCard>
  );
}

function StaffListItem({ member, onClick }: { member: StaffMember, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group flex flex-col lg:flex-row items-center gap-6 p-5 rounded-[32px] bg-white/40 dark:bg-white/5 border border-white/10 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:translate-y-[-2px]"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-14 h-14 rounded-[18px] bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/10 shrink-0">
          {member.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-black text-[#053344] dark:text-white leading-none truncate">{member.name}</h3>
            <RoleBadge role={member.role} />
          </div>
          <p className="text-xs font-bold text-[#0E5A75]/40 uppercase tracking-widest truncate">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-12 shrink-0">
        <div>
          <p className="text-[9px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Last Seen</p>
          <p className={cn("text-xs font-bold", member.isOnline ? "text-[#159665]" : "text-[#0E5A75]/60")}>
            {member.lastLogin && member.lastLogin !== 'Never' ? new Date(member.lastLogin).toLocaleDateString() : 'Never'}
          </p>
        </div>
        <div className="min-w-[120px] flex justify-end">
          <StatusBadge isOnline={member.isOnline} status={member.status} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-black/5 dark:border-white/5 pl-6">
        <button className="p-2.5 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><Mail size={18} /></button>
        <button className="p-2.5 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}

function PermissionItem({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl border transition-all",
      active 
        ? "bg-[#159665]/5 border-[#159665]/20 text-[#159665]" 
        : "bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 text-[#0E5A75]/30"
    )}>
      {active ? <Unlock size={14} /> : <Lock size={14} />}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
}

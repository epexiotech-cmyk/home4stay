"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Clock, 
  Activity, 
  Mail, 
  ChevronRight, 
  CheckCircle2, 
  X, 
  Plus, 
  Search, 
  Filter, 
  Settings, 
  Smartphone, 
  Laptop, 
  History, 
  Unlock, 
  Lock, 
  Building2,
  Trash2,
  Edit3,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

type StaffRole = "Owner" | "Manager" | "Receptionist" | "Accountant" | "Housekeeping" | "Support Staff";
type ShiftStatus = "on_duty" | "off_duty" | "break" | "active_housekeeping";

interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  status: "active" | "online" | "pending";
  shift: ShiftStatus;
  email: string;
  phone: string;
  properties: string[];
  lastLogin: string;
}

interface ActivityLog {
  id: string;
  staffName: string;
  action: string;
  target: string;
  time: string;
  icon: LucideIcon;
}

// --- Mock Data ---

const STAFF: StaffMember[] = [
  {
    id: "ST-001",
    name: "Vikram Malhotra",
    role: "Manager",
    status: "online",
    shift: "on_duty",
    email: "vikram.m@home4stay.com",
    phone: "+91 98765 43210",
    properties: ["All Properties"],
    lastLogin: "Active Now"
  },
  {
    id: "ST-002",
    name: "Sonia Das",
    role: "Receptionist",
    status: "online",
    shift: "on_duty",
    email: "sonia.d@home4stay.com",
    phone: "+91 98234 56789",
    properties: ["Grand Heritage Resort"],
    lastLogin: "10m ago"
  },
  {
    id: "ST-003",
    name: "Rahul Sharma",
    role: "Housekeeping",
    status: "active",
    shift: "active_housekeeping",
    email: "rahul.s@home4stay.com",
    phone: "+91 91234 56789",
    properties: ["Grand Heritage Resort"],
    lastLogin: "2h ago"
  },
  {
    id: "ST-004",
    name: "Neha Gupta",
    role: "Accountant",
    status: "active",
    shift: "off_duty",
    email: "neha.g@home4stay.com",
    phone: "+91 90000 11111",
    properties: ["All Properties"],
    lastLogin: "Yesterday"
  }
];

const ACTIVITY_LOGS: ActivityLog[] = [
  { id: "LOG-1", staffName: "Vikram Malhotra", action: "Changed pricing", target: "Royal Suite (Property: Grand Heritage)", time: "12m ago", icon: Settings },
  { id: "LOG-2", staffName: "Sonia Das", action: "Confirmed booking", target: "B-1024 (Ananya Sharma)", time: "45m ago", icon: CheckCircle2 },
  { id: "LOG-3", staffName: "Vikram Malhotra", action: "Updated availability", target: "Villa 1 (Property: Sunset Villa)", time: "2h ago", icon: Activity },
];

// --- Components ---

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] p-6 hover-lift border border-white/5 dark:border-white/5 shadow-premium", className)}>
    {children}
  </div>
);

const RoleBadge = ({ role }: { role: StaffRole }) => {
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

const ShiftBadge = ({ shift }: { shift: ShiftStatus }) => {
  const configs: Record<ShiftStatus, { color: string; bg: string; label: string }> = {
    on_duty: { color: "text-[#159665]", bg: "bg-[#159665]/10", label: "On Duty" },
    off_duty: { color: "text-gray-400", bg: "bg-gray-400/10", label: "Off Duty" },
    break: { color: "text-[#FCBC43]", bg: "bg-[#FCBC43]/10", label: "On Break" },
    active_housekeeping: { color: "text-[#0983B0]", bg: "bg-[#0983B0]/10", label: "Housekeeping Active" },
  };
  const { color, bg, label } = configs[shift];
  return (
    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full", bg, color)}>
      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", color.replace('text-', 'bg-'))} />
      <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    </div>
  );
};

// --- Main Page ---

export default function StaffPage() {
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. Header Section */}
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
          <button className="flex items-center gap-2 px-8 py-4 rounded-[24px] bg-[#0E5A75] text-white shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all group">
            <UserPlus size={20} />
            <span className="text-sm font-black uppercase tracking-widest">Invite Staff</span>
          </button>
        </div>
      </div>

      {/* 2. Staff Overview Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Active Staff" value="24" icon={Users} color="text-[#0E5A75]" />
        <StatWidget label="On Duty Now" value="08" icon={Clock} color="text-[#159665]" />
        <StatWidget label="Pending Invites" value="03" icon={Mail} color="text-[#FCBC43]" />
        <StatWidget label="Active Logs" value="112" icon={Activity} color="text-[#0983B0]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Staff Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white">Staff Directory</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl glass-matte text-[#0E5A75]"><Filter size={18} /></button>
              <button className="p-2 rounded-xl glass-matte text-[#0E5A75]"><Settings size={18} /></button>
            </div>
          </div>
          {STAFF.map((member) => (
            <StaffListItem 
              key={member.id} 
              member={member} 
              onClick={() => setSelectedStaff(member)}
            />
          ))}
        </div>

        {/* 4. Operational Activity Logs */}
        <div className="space-y-6">
          <GlassCard className="p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white mb-8 flex items-center gap-2">
              <History size={18} className="text-[#0983B0]" /> Operational Logs
            </h3>
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-[#0E5A75]/10">
              {ACTIVITY_LOGS.map((log) => (
                <div key={log.id} className="flex gap-4 relative">
                  <div className="w-10 h-10 rounded-xl bg-[#0E5A75]/5 flex items-center justify-center text-[#0E5A75] shrink-0 z-10 border border-[#0E5A75]/10 bg-white dark:bg-[#0A0F1D]">
                    <log.icon size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#0983B0] uppercase tracking-widest leading-none mb-1">{log.time}</p>
                    <p className="text-xs font-black text-[#053344] dark:text-white leading-tight">
                      <span className="text-[#0E5A75]">{log.staffName}</span> {log.action.toLowerCase()}
                    </p>
                    <p className="text-[10px] text-[#0E5A75]/60 font-bold mt-1">{log.target}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-4 rounded-xl border border-dashed border-[#0E5A75]/20 text-[#0E5A75]/40 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#0E5A75]/5 hover:text-[#0E5A75] transition-all">
              View Governance Audit
            </button>
          </GlassCard>

          {/* 5. Security & Access Info */}
          <GlassCard className="p-8 bg-gradient-to-br from-white/10 to-transparent border-dashed">
            <div className="flex items-center gap-3 mb-6">
              <Shield size={20} className="text-[#159665]" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#053344] dark:text-white">Access Security</h3>
            </div>
            <div className="space-y-4">
              <SecurityItem label="Last Owner Login" value="Active Now" icon={Smartphone} />
              <SecurityItem label="Trusted Devices" value="04 Authorized" icon={Laptop} />
              <SecurityItem label="Permission Overrides" value="None Active" icon={Lock} />
            </div>
            <button className="w-full mt-6 py-3 rounded-xl bg-white text-[#0E5A75] text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-white/90 transition-all">
              Security Settings
            </button>
          </GlassCard>
        </div>
      </div>

      {/* 6. Staff Detail Drawer */}
      {selectedStaff && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-[#053344]/40 backdrop-blur-sm" onClick={() => setSelectedStaff(null)} />
          <aside className="relative w-full max-w-2xl bg-white dark:bg-[#0A0F1D] shadow-luxury h-full animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[20px] bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-2xl shadow-xl">
                  {selectedStaff.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight leading-none mb-2">{selectedStaff.name}</h2>
                  <div className="flex items-center gap-2">
                    <RoleBadge role={selectedStaff.role} />
                    <span className="text-[10px] font-bold text-[#0E5A75]/40 uppercase tracking-widest">{selectedStaff.id}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="p-3 rounded-2xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              
              {/* Shift & Status */}
              <div className="flex items-center justify-between p-6 rounded-[24px] bg-[#0E5A75]/5 border border-[#0E5A75]/10">
                <div>
                  <p className="text-[10px] font-black text-[#0E5A75]/50 uppercase tracking-widest mb-1">Current Shift State</p>
                  <ShiftBadge shift={selectedStaff.shift} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-[#0E5A75]/50 uppercase tracking-widest mb-1">Last Activity</p>
                  <p className="text-sm font-black text-[#053344] dark:text-white">{selectedStaff.lastLogin}</p>
                </div>
              </div>

              {/* Property Access */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Assigned Properties</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedStaff.properties.map(p => (
                    <div key={p} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-white/5 border border-[#0E5A75]/10 text-[#0E5A75]">
                      <Building2 size={14} />
                      <span className="text-xs font-bold">{p}</span>
                    </div>
                  ))}
                  <button className="p-2 rounded-xl border border-dashed border-[#0E5A75]/20 text-[#0E5A75]/40 hover:border-[#0E5A75]/40 transition-all">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Permissions Preview */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Permissions Overview</h3>
                <div className="grid grid-cols-2 gap-3">
                  <PermissionItem label="Manage Bookings" active={selectedStaff.role !== "Housekeeping"} />
                  <PermissionItem label="View Financials" active={selectedStaff.role === "Manager" || selectedStaff.role === "Accountant" || selectedStaff.role === "Owner"} />
                  <PermissionItem label="Update Inventory" active={selectedStaff.role !== "Accountant" && selectedStaff.role !== "Support Staff"} />
                  <PermissionItem label="Access Guest CRM" active={selectedStaff.role === "Manager" || selectedStaff.role === "Receptionist" || selectedStaff.role === "Owner"} />
                  <PermissionItem label="Respond to Reviews" active={selectedStaff.role === "Manager" || selectedStaff.role === "Owner"} />
                  <PermissionItem label="Export Reports" active={selectedStaff.role === "Accountant" || selectedStaff.role === "Owner" || selectedStaff.role === "Manager"} />
                </div>
              </div>

              {/* Device Activity */}
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#053344] dark:text-white">Security History</h3>
                <div className="p-6 rounded-[24px] border border-black/5 dark:border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Laptop size={16} className="text-[#0E5A75]/60" />
                      <span className="text-xs font-bold text-[#053344] dark:text-white">Chrome on MacOS</span>
                    </div>
                    <span className="text-[10px] font-black text-[#159665] uppercase">Trusted</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Smartphone size={16} className="text-[#0E5A75]/60" />
                      <span className="text-xs font-bold text-[#053344] dark:text-white">iPhone 15 Pro</span>
                    </div>
                    <span className="text-[10px] font-black text-[#159665] uppercase">Trusted</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-black/5 dark:border-white/5 flex gap-3">
              <button className="flex-1 py-4 rounded-2xl border border-[#F24633]/20 text-[#F24633] font-black uppercase tracking-widest hover:bg-[#F24633]/5 transition-all flex items-center justify-center gap-2">
                <Trash2 size={18} /> Deactivate Account
              </button>
              <button className="flex-1 py-4 rounded-2xl bg-[#0E5A75] text-white font-black uppercase tracking-widest shadow-xl shadow-[#0E5A75]/20 hover:bg-[#0A4459] transition-all flex items-center justify-center gap-2">
                <Edit3 size={18} /> Edit Permissions
              </button>
            </div>
          </aside>
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
        <div className="w-14 h-14 rounded-[18px] bg-gradient-to-tr from-[#0E5A75] to-[#0983B0] flex items-center justify-center text-white font-black text-xl shadow-lg ring-4 ring-white/10">
          {member.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-black text-[#053344] dark:text-white leading-none">{member.name}</h3>
            <RoleBadge role={member.role} />
          </div>
          <p className="text-xs font-bold text-[#0E5A75]/40 uppercase tracking-widest truncate max-w-[200px]">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-12 shrink-0">
        <div className="hidden xl:block">
          <p className="text-[9px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Assigned At</p>
          <div className="flex items-center gap-1 text-xs font-bold text-[#053344] dark:text-white">
            <Building2 size={12} className="text-[#0E5A75]" />
            <span>{member.properties[0]}</span>
          </div>
        </div>
        <div>
          <p className="text-[9px] font-black text-[#0E5A75]/40 uppercase tracking-widest mb-1">Last Seen</p>
          <p className={cn("text-xs font-bold", member.status === "online" ? "text-[#159665]" : "text-[#0E5A75]/60")}>{member.lastLogin}</p>
        </div>
        <div className="min-w-[120px] flex justify-end">
          <ShiftBadge shift={member.shift} />
        </div>
      </div>

      <div className="flex items-center gap-2 border-l border-black/5 dark:border-white/5 pl-6">
        <button className="p-2.5 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><Mail size={18} /></button>
        <button className="p-2.5 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75] transition-all"><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}

function SecurityItem({ label, value, icon: Icon }: { label: string, value: string, icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-[#0E5A75]/60">
        <Icon size={14} />
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-black text-[#053344] dark:text-white">{value}</span>
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

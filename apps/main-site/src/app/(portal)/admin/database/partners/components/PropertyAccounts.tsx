"use client";

import React, { useState } from "react";
import { Copy, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";

type Account = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
};

export default function PropertyAccounts({ propertyId, accounts }: { propertyId: string, accounts: Account[] }) {
  const [resetting, setResetting] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<{ id: string, password: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (accountId: string) => {
    if (!confirm("Are you sure you want to generate a new password for this account? This cannot be undone.")) return;
    
    setResetting(accountId);
    setError(null);
    setNewPassword(null);
    
    try {
      const res = await fetch(`/api/admin/database/partners/${propertyId}/accounts/${accountId}/reset`, {
        method: "POST"
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to reset password");
      
      setNewPassword({ id: accountId, password: data.data.newPassword });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResetting(null);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <ShieldCheck className="text-primary w-5 h-5" />
        <h3 className="text-lg font-black text-primary">Property Staff Accounts</h3>
      </div>
      
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold flex items-center gap-2 border border-red-500/20">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="border border-border rounded-2xl p-5 bg-background/50 hover:bg-background transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary/70 bg-primary/5 px-2 py-1 rounded-md border border-primary/10">
                  {acc.role}
                </span>
                <h4 className="font-bold text-primary mt-2">{acc.name || "N/A"}</h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${acc.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-secondary/10 text-secondary'}`}>
                {acc.status}
              </span>
            </div>
            
            <div className="space-y-2 mt-4">
              <div>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Login ID</p>
                <div className="flex items-center gap-2 group">
                  <p className="text-xs font-medium text-primary break-all">{acc.email || "N/A"}</p>
                  {acc.email && (
                    <button 
                      onClick={() => copyToClipboard(acc.email!, `email-${acc.id}`)}
                      className="text-secondary/50 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      {copied === `email-${acc.id}` ? <CheckCircle2 size={12} className="text-success" /> : <Copy size={12} />}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="pt-2 border-t border-border/50">
                {newPassword?.id === acc.id ? (
                  <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                    <p className="text-[10px] font-bold text-success uppercase tracking-widest mb-1">New Password (Show Once)</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono font-bold text-primary">{newPassword.password}</p>
                      <button 
                        onClick={() => copyToClipboard(newPassword.password, `pass-${acc.id}`)}
                        className="text-success hover:bg-success/20 p-1.5 rounded-md transition-colors"
                      >
                        {copied === `pass-${acc.id}` ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleResetPassword(acc.id)}
                    disabled={resetting === acc.id}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-[#0983B0] transition-colors uppercase tracking-widest disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={resetting === acc.id ? "animate-spin" : ""} />
                    {resetting === acc.id ? "Generating..." : "Generate New Password"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

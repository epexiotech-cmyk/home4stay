"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ErrorDetailModal({ error }: { error: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleResolve = async () => {
    try {
      setResolving(true);
      const res = await fetch(`/api/admin/errors/${error.id}/resolve`, {
        method: "POST"
      });
      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert("Failed to resolve error.");
      }
    } catch (err) {
      alert("Error while resolving.");
    } finally {
      setResolving(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full text-left"
      >
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:bg-surface-alt transition-colors">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${
            error.severity === "CRITICAL" ? "bg-red-500/10 text-red-500" :
            error.severity === "WARNING" ? "bg-yellow-500/10 text-yellow-500" :
            "bg-accent/10 text-accent"
          }`}>
            {error.severity === "CRITICAL" ? "!" : error.severity === "WARNING" ? "⚠️" : "🛡️"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary truncate">{error.module}</p>
            <p className="text-xs text-secondary truncate">{error.message}</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-secondary uppercase whitespace-nowrap">
              {new Date(error.createdAt).toLocaleTimeString()}
            </div>
            {error.status === "RESOLVED" && (
              <span className="text-[8px] font-bold text-success uppercase bg-success/10 px-1 rounded">RESOLVED</span>
            )}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-surface border border-border rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-primary mb-1">Error Details</h2>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    error.severity === "CRITICAL" ? "bg-red-500/10 text-red-500" :
                    error.severity === "WARNING" ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-accent/10 text-accent"
                  }`}>
                    {error.severity}
                  </span>
                  <span className="text-xs text-secondary font-mono">{error.errorId}</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-secondary hover:text-primary">
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <p className="text-xs font-bold text-secondary uppercase">Module / Route</p>
                <p className="text-sm font-medium">{error.module} {error.route ? `(${error.route})` : ''}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-secondary uppercase">Message</p>
                <p className="text-sm font-medium bg-background p-3 rounded-xl border border-border mt-1 font-mono text-red-500/90">{error.message}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-secondary uppercase">Occurred At</p>
                <p className="text-sm font-medium">{new Date(error.createdAt).toLocaleString()}</p>
              </div>
              {error.stackTrace && (
                <div>
                  <p className="text-xs font-bold text-secondary uppercase">Stack Trace</p>
                  <pre className="text-[10px] bg-background p-4 rounded-xl border border-border mt-1 font-mono overflow-auto max-h-48 text-secondary">
                    {error.stackTrace}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button 
                onClick={() => setIsOpen(false)} 
                className="btn btn-secondary px-5 py-2 rounded-xl text-sm font-bold"
              >
                Close
              </button>
              {user?.role === "super_admin" && error.status === "OPEN" && (
                <button 
                  onClick={handleResolve}
                  disabled={resolving}
                  className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {resolving ? "Resolving..." : "Mark as Resolved"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Check, ArrowRight, Loader2 } from "lucide-react";
import { sanitizeHtml } from "@/lib/legal/sanitizer";

interface LegalDocument {
  id: string;
  version: string;
  documentType: string;
  title: string;
  content: string;
}

export function LegalWall() {
  const [pendingDocs, setPendingDocs] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/auth/legal-status", {
          credentials: "include",
        });
        if (res.ok && active) {
          const data = await res.json() as { success?: boolean; pending?: LegalDocument[] };
          if (data.success && data.pending) {
            setPendingDocs(data.pending);
          }
        }
      } catch (err) {
        console.error("Failed to load user legal compliance status:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchStatus();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return null; // Silent loading since it intercepts the dashboard on mount
  }

  if (pendingDocs.length === 0) {
    return null; // All compliant!
  }

  // Process the first pending document in the queue
  const currentDoc = pendingDocs[0];

  const handleAccept = async () => {
    if (!consentChecked) return;

    try {
      setAccepting(true);
      setError(null);

      const res = await fetch("/api/auth/legal-accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: currentDoc.id,
          version: currentDoc.version,
        }),
      });
      console.log(
        "[LEGAL WALL] document.cookie =",
        document.cookie,
      );

      const data = await res.json() as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to log acceptance signature");
      }

      // Acceptance logged successfully. Remove the document from the local queue.
      setConsentChecked(false);
      setPendingDocs((prev) => prev.slice(1));
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred. Please try again.";
      setError(message);
    } finally {
      setAccepting(false);
    }
  };

  // Convert doc enum to readable label
  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case "TERMS_AND_CONDITIONS":
        return "Terms & Conditions";
      case "PRIVACY_POLICY":
        return "Privacy Policy";
      case "REFUND_POLICY":
        return "Refund Policy";
      case "SUBSCRIPTION_AGREEMENT":
        return "Subscription Agreement";
      default:
        return "Legal Policy";
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-4 md:p-6 overflow-hidden animate-in fade-in duration-500">
      <div className="w-full max-w-3xl h-[90vh] md:h-[80vh] flex flex-col glass-premium border border-white/10 dark:border-[#0E5A75]/30 rounded-[32px] overflow-hidden bg-[#0A3444]/90 dark:bg-[#072430]/90 text-white shadow-2xl animate-in zoom-in-95 duration-500">

        {/* Header Section */}
        <div className="p-6 md:p-8 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FCBC43]/10 text-[#FCBC43] rounded-2xl border border-[#FCBC43]/20 animate-pulse">
              <ShieldAlert size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-[#FCBC43]/10 text-[#FCBC43] border border-[#FCBC43]/20 text-[9px] font-black uppercase tracking-wider">
                  Important Update
                </span>
                <span className="text-[10px] text-white/50 font-black tracking-widest uppercase">
                  Version {currentDoc.version}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-[#FDF6F1] mt-1">
                Accept Updated {getDocTypeLabel(currentDoc.documentType)}
              </h2>
            </div>
          </div>

          <div className="text-right sm:text-right">
            <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">Pending Documents</p>
            <p className="text-xs font-black text-[#0983B0] tracking-widest mt-0.5">{pendingDocs.length} remaining</p>
          </div>
        </div>

        {/* Dynamic scrollable policy content container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          <div className="prose prose-invert max-w-none text-sm md:text-base leading-relaxed text-white/80 dark:text-white/70">
            {/* Display dynamic legal document title */}
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-4 border-b border-white/5 pb-2">
              {currentDoc.title}
            </h3>

            {/* Sanitized rich content rendering */}
            <div
              className="legal-content-render space-y-4"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(currentDoc.content) }}
            />
          </div>
        </div>

        {/* Action Panel & Consent Acceptance Controls */}
        <div className="p-6 md:p-8 border-t border-white/10 bg-white/5 space-y-4">

          {error && (
            <div className="p-3 bg-[#F24633]/10 rounded-xl border border-[#F24633]/20 text-xs font-bold text-[#F24633]">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 select-none">

            {/* Active Acceptance Tickbox */}
            <label className="flex items-start gap-3 cursor-pointer group text-left max-w-md">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-lg border transition-all duration-300 flex items-center justify-center ${consentChecked
                  ? "bg-[#0983B0] border-[#0983B0] scale-100"
                  : "border-white/20 bg-white/5 group-hover:border-white/40"
                  }`}>
                  {consentChecked && <Check size={12} className="text-white font-black stroke-[3px]" />}
                </div>
              </div>
              <span className="text-[11px] md:text-xs font-semibold text-white/60 group-hover:text-white/80 transition-colors leading-relaxed">
                I have read, understood, and accept the updated {getDocTypeLabel(currentDoc.documentType)} in its entirety.
              </span>
            </label>

            {/* Accept action button */}
            <button
              onClick={handleAccept}
              disabled={accepting || !consentChecked}
              className={`w-full md:w-auto px-8 py-4 rounded-2xl bg-[#0983B0] hover:bg-[#0E5A75] text-white text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-[#0983B0]/10 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {accepting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Recording Signature...</span>
                </>
              ) : (
                <>
                  <span>Accept &amp; Continue</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

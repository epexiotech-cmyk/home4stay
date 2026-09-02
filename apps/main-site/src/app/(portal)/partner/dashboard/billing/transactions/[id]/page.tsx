"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Phone, 
  Mail, 
  AlertCircle,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Custom Subcomponents ---

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("glass-premium rounded-[32px] p-6 hover-lift border border-white/60 dark:border-[#0E5A75]/20 shadow-xl shadow-[#0E5A75]/5 dark:shadow-none", className)}>
    {children}
  </div>
);

interface TimelineStepProps {
  number: number;
  title: string;
  description: string;
  status: "completed" | "active" | "pending" | "failed";
  time?: string;
}

const TimelineStep = ({ number, title, description, status, time }: TimelineStepProps) => {
  return (
    <div className="flex gap-4 relative text-left">
      <div className="flex flex-col items-center shrink-0">
        <div 
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border shadow-sm transition-all duration-500",
            status === "completed" ? "bg-[#159665] border-[#159665] text-white" :
            status === "active" ? "bg-[#FCBC43] border-[#FCBC43] text-white animate-pulse" :
            status === "failed" ? "bg-[#F24633] border-[#F24633] text-white" :
            "bg-white dark:bg-white/5 border-[#0E5A75]/10 text-[#0E5A75]/40"
          )}
        >
          {status === "completed" ? <CheckCircle2 size={14} /> : 
           status === "failed" ? <XCircle size={14} /> : 
           number}
        </div>
        <div className="w-0.5 h-16 bg-[#0E5A75]/10 dark:bg-white/10 mt-1" />
      </div>
      <div>
        <p className="text-[13px] font-black text-[#053344] dark:text-white leading-tight mt-1">{title}</p>
        <p className="text-[11px] text-[#0E5A75]/60 dark:text-[#0983B0]/60 mt-1 font-medium">{description}</p>
        {time && (
          <span className="text-[9px] font-bold text-[#0E5A75]/40 uppercase tracking-widest block mt-2">
            {new Date(time).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

// --- Page Interfaces ---

interface AuditLog {
  id: string;
  action: string;
  oldStatus: string | null;
  newStatus: string | null;
  performedBy: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

interface TransactionDetails {
  id: string;
  propertyId: string;
  propertyTitle: string;
  amount: number;
  currency: string;
  paymentStatus: string;
  utrNumber: string | null;
  paymentScreenshotUrl: string | null;
  adminReviewNote: string | null;
  reviewedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  provider: {
    displayName: string;
    upiId: string | null;
    merchantName: string | null;
  } | null;
  subscription: {
    id: string;
    selectedPlanId: string;
    billingCycle: string;
    startsAt: string | null;
    expiresAt: string | null;
  } | null;
  auditLogs: AuditLog[];
}

export default function TransactionTimelinePage() {
  const router = useRouter();
  const params = useParams();
  const transactionId = params.id as string;

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!transactionId) return;
      try {
        const res = await fetch(`/api/partner/billing/transactions/${transactionId}`);
        if (!res.ok) {
          throw new Error("Unable to retrieve transaction metrics.");
        }
        const data = await res.json();
        if (isMounted) {
          setTransaction(data.transaction);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [transactionId]);

  if (loading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        <div className="h-8 bg-white/20 dark:bg-white/5 rounded-2xl w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="h-[400px] bg-white/20 dark:bg-white/5 rounded-[32px] col-span-2" />
          <div className="h-[400px] bg-white/20 dark:bg-white/5 rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <GlassCard className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle size={48} className="text-[#F24633] mb-4" />
        <h2 className="text-2xl font-black text-[#053344] dark:text-white">Transaction Not Resolved</h2>
        <p className="text-sm font-bold text-[#0E5A75]/60 mt-2 max-w-md">{error || "The requested transaction record could not be found."}</p>
        <button 
          onClick={() => router.push("/partner/dashboard/billing")} 
          className="mt-6 px-6 py-3 bg-[#0E5A75] hover:bg-[#0A4459] text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all"
        >
          Return to Billing
        </button>
      </GlassCard>
    );
  }

  // Determine standard lifecycle steps
  const isApproved = transaction.paymentStatus.toUpperCase() === "APPROVED";
  const isRejected = transaction.paymentStatus.toUpperCase() === "REJECTED";

  return (
    <div className="space-y-8 pb-12">
      {/* Back navigation */}
      <button 
        onClick={() => router.push("/partner/dashboard/billing")}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-[#0E5A75]/5 text-[#0E5A75] dark:text-white transition-all font-black text-xs uppercase tracking-widest border border-transparent hover:border-[#0E5A75]/10"
      >
        <ArrowLeft size={16} />
        <span>Back to Billing</span>
      </button>

      {/* Header Info */}
      <div className="text-left">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-px bg-[#0E5A75] opacity-30" />
          <span className="text-[10px] font-bold text-[#053344] dark:text-[#0983B0] uppercase tracking-[0.3em]">Payment Proof Tracker</span>
        </div>
        <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none">Verification Timeline</h1>
        <p className="text-[#053344] dark:text-[#0983B0] mt-3 font-medium text-lg">Transaction ID: <span className="font-mono text-sm select-all bg-[#0E5A75]/5 dark:bg-white/5 px-2 py-1 rounded-md">{transaction.id}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Step-by-Step interactive timeline */}
        <GlassCard className="col-span-1 md:col-span-2 text-left">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold text-[#053344] dark:text-[#FDF6F1] uppercase tracking-widest">Verification Steps</h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider",
              isApproved ? "bg-[#159665]/10 text-[#159665]" :
              isRejected ? "bg-[#F24633]/10 text-[#F24633]" :
              "bg-[#FCBC43]/10 text-[#FCBC43] animate-pulse"
            )}>
              {transaction.paymentStatus.replace("_", " ")}
            </span>
          </div>

          <div className="space-y-0 pl-4 mt-6">
            <TimelineStep 
              number={1}
              title="Manual Payment Initiated"
              description="Checkout selection completed, pricing cycle resolved, merchant accounts locked."
              status="completed"
              time={transaction.createdAt}
            />

            <TimelineStep 
              number={2}
              title="Screenshot proof uploaded"
              description={`UTR Reference number ${transaction.utrNumber || ""} submitted securely for verification.`}
              status="completed"
              time={transaction.createdAt}
            />

            <TimelineStep 
              number={3}
              title="Super Admin Verification"
              description={
                isRejected ? "Proof verification failed. UTR reference matched invalid records." :
                isApproved ? "Verification successful. Manual peer-to-peer bank transfer verified by Administrator." :
                "Payment proof is currently being audited by Super Admin. Verification completes usually within 1-2 hours."
              }
              status={
                isApproved ? "completed" :
                isRejected ? "failed" :
                "active"
              }
              time={transaction.reviewedAt || undefined}
            />

            <TimelineStep 
              number={4}
              title="Subscription Plan Activated"
              description={
                isApproved ? `Your ${transaction.subscription?.selectedPlanId?.toUpperCase() || ""} subscription is fully operational. Starts ${transaction.subscription?.startsAt ? new Date(transaction.subscription.startsAt).toLocaleDateString() : ""}` :
                isRejected ? "Checkout lifecycle suspended." :
                "Awaiting previous step verification."
              }
              status={
                isApproved ? "completed" :
                isRejected ? "failed" :
                "pending"
              }
              time={transaction.paidAt || undefined}
            />
          </div>

          {/* Admin Review Note Feedback Callouts */}
          {(isRejected || transaction.adminReviewNote) && (
            <div className={cn(
              "p-5 rounded-[24px] border mt-6 flex items-start gap-3",
              isRejected 
                ? "bg-[#F24633]/5 border-[#F24633]/20 text-[#F24633]"
                : "bg-[#159665]/5 border-[#159665]/20 text-[#159665]"
            )}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm bg-white dark:bg-transparent">
                {isRejected ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">Review Notes from Super Admin</p>
                <p className="text-[12px] font-bold text-[#053344] dark:text-white mt-1 leading-relaxed">
                  {transaction.adminReviewNote || (isRejected ? "Manual verification failed. Please check the UTR number and re-submit a valid payment proof screenshot." : "Payment verified and activated successfully.")}
                </p>
                {isRejected && (
                  <button 
                    onClick={() => router.push("/partner/dashboard/billing")}
                    className="mt-3 px-4 py-2 bg-[#F24633] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#c83929] transition-all shadow-md active:scale-95"
                  >
                    Retry Purchase
                  </button>
                )}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Payment Ledger Details sidebar */}
        <div className="space-y-8">
          
          {/* Screenshot Proof Card */}
          <GlassCard className="text-left">
            <h3 className="text-sm font-bold text-[#053344] dark:text-[#FDF6F1] uppercase tracking-widest mb-4">Payment Proof</h3>
            
            {transaction.paymentScreenshotUrl ? (
              <div className="space-y-4">
                <div 
                  onClick={() => setShowScreenshotModal(true)}
                  className="relative rounded-2xl overflow-hidden border border-[#0E5A75]/10 bg-black/5 h-44 cursor-pointer group flex items-center justify-center p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`/api/partner/billing/proofs/${transaction.paymentScreenshotUrl}`} 
                    alt="Payment screenshot proof" 
                    className="h-full object-contain rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white">
                    <Eye size={20} />
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#0E5A75]/5 dark:border-white/5 py-1.5 font-bold">
                    <span className="text-[#0E5A75]/60 dark:text-[#0983B0]/60 uppercase tracking-widest">UTR Number</span>
                    <span className="font-black select-all font-mono">{transaction.utrNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#0E5A75]/5 dark:border-white/5 py-1.5 font-bold">
                    <span className="text-[#0E5A75]/60 dark:text-[#0983B0]/60 uppercase tracking-widest">Billing Tier</span>
                    <span className="font-black capitalize">{transaction.subscription?.selectedPlanId} ({transaction.subscription?.billingCycle})</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold">
                    <span className="text-[#0E5A75]/60 dark:text-[#0983B0]/60 uppercase tracking-widest">Amount Paid</span>
                    <span className="font-black text-[#053344] dark:text-white">₹{transaction.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-44 rounded-2xl bg-[#0E5A75]/5 dark:bg-white/5 border border-dashed border-[#0E5A75]/20 flex flex-col items-center justify-center text-[#0E5A75]/40 text-xs font-bold uppercase tracking-widest">
                <span>No Screenshot Uploaded</span>
              </div>
            )}
          </GlassCard>

          {/* Help Centercoordinates */}
          <GlassCard className="text-left bg-gradient-to-br from-[#0E5A75]/5 to-transparent">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={18} className="text-[#0983B0]" />
              <h3 className="text-sm font-bold text-[#053344] dark:text-[#FDF6F1] uppercase tracking-widest">Need Assistance?</h3>
            </div>
            <p className="text-xs text-[#0E5A75]/60 dark:text-[#0983B0]/60 leading-relaxed font-medium">
              If your payment verification has been delayed or you entered incorrect details, please reach out to our manual payment desk.
            </p>
            <div className="mt-6 space-y-3">
              <a href="tel:+919876543210" className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-2xl border border-[#0E5A75]/10 hover:border-[#0E5A75] transition-all">
                <div className="w-10 h-10 bg-[#0E5A75]/10 rounded-xl flex items-center justify-center text-[#0E5A75] dark:text-[#0983B0]">
                  <Phone size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest leading-none">Call Desk</p>
                  <p className="text-xs font-black text-[#053344] dark:text-white mt-1 leading-none">+91 98765 43210</p>
                </div>
              </a>
              <a href="mailto:billing@home4stay.com" className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-2xl border border-[#0E5A75]/10 hover:border-[#0E5A75] transition-all">
                <div className="w-10 h-10 bg-[#0E5A75]/10 rounded-xl flex items-center justify-center text-[#0E5A75] dark:text-[#0983B0]">
                  <Mail size={16} />
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black text-[#0E5A75]/50 dark:text-white/40 uppercase tracking-widest leading-none">Email Support</p>
                  <p className="text-xs font-black text-[#053344] dark:text-white mt-1 leading-none">billing@home4stay.com</p>
                </div>
              </a>
            </div>
          </GlassCard>
        </div>

      </div>

      {/* Fullscreen Screenshot Modal */}
      {showScreenshotModal && transaction.paymentScreenshotUrl && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowScreenshotModal(false)}
          />
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`/api/partner/billing/proofs/${transaction.paymentScreenshotUrl}`} 
              alt="Payment screenshot proof full resolution" 
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
            />
            <button 
              onClick={() => setShowScreenshotModal(false)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all shadow-md"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

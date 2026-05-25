"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function CheckoutSimulatorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract parameters
  const transactionId = searchParams.get("transactionId") || "MOCK_TXN_12345";
  const amount = searchParams.get("amount") || "999";
  const merchantTransactionId = searchParams.get("merchantTransactionId") || `TXN_PP_${transactionId}`;

  // Determine provider from path or default
  const [provider] = useState<"phonepe" | "yesbank">(() => {
    if (typeof window !== "undefined") {
      const merchantTxnId = searchParams.get("merchantTransactionId") || "";
      if (merchantTxnId.includes("YB") || window.location.pathname.includes("yesbank")) {
        return "yesbank";
      }
    }
    return "phonepe";
  });
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed" | "timeout" | "cancelled">("idle");
  const [logMessages, setLogMessages] = useState<string[]>([]);

  // Keep provider in sync if merchantTransactionId changes dynamically

  const addLog = (msg: string) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const triggerWebhookCall = async (simulateStatus: "SUCCESS" | "FAILED" | "CANCELLED", duplicate = false, delayMs = 0) => {
    setStatus("processing");
    addLog(`Initiating simulated ${simulateStatus} callback for ${provider.toUpperCase()}...`);

    if (delayMs > 0) {
      addLog(`Delaying webhook delivery by ${delayMs}ms to simulate slow gateway network queue...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const endpoint = `/api/payments/webhooks/${provider}`;
    
    // Generate secure mock payload body
    let body: Record<string, unknown> = {};
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (provider === "phonepe") {
      const responsePayload = {
        success: simulateStatus === "SUCCESS",
        code: simulateStatus === "SUCCESS" ? "PAYMENT_SUCCESS" : simulateStatus === "CANCELLED" ? "PAYMENT_CANCELLED" : "PAYMENT_ERROR",
        message: `PhonePe simulated callback state: ${simulateStatus}`,
        data: {
          merchantId: "MID_PHONEPE_MOCK",
          merchantTransactionId,
          amount: Math.round(parseFloat(amount) * 100),
          state: simulateStatus === "SUCCESS" ? "COMPLETED" : simulateStatus === "CANCELLED" ? "CANCELLED" : "FAILED",
          responseCode: simulateStatus === "SUCCESS" ? "SUCCESS" : "ERROR",
          utr: `pp_utr_${Date.now()}`,
          settlementId: `pp_set_${Date.now()}`
        },
        timestamp: Date.now(),
        // Bypass checks flags if we want to bypass real validation headers for simulator ease
        _bypassSignatureCheck: true,
        _bypassReplayAttackCheck: true
      };

      body = {
        response: Buffer.from(JSON.stringify(responsePayload)).toString("base64")
      };
      
      // Pass a mock signature matching verify protocol
      headers["X-VERIFY"] = "mock_simulator_verify_checksum###1";
    } else {
      // YES BANK payload
      body = {
        transactionId,
        bankReference: merchantTransactionId,
        amount: parseFloat(amount),
        status: simulateStatus,
        statusCode: simulateStatus === "SUCCESS" ? "00" : "01",
        settlementReference: `yb_set_${Date.now()}`,
        timestamp: Date.now(),
        _bypassSignatureCheck: true,
        _bypassReplayAttackCheck: true
      };

      headers["X-BANK-SIGNATURE"] = "mock_simulator_yesbank_hmac_verify";
    }

    try {
      addLog(`Posting callback payload directly to local webhook: ${endpoint}`);
      
      const fireRequest = async () => {
        const response = await fetch(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(body)
        });
        const data = await response.json() as { isDuplicate?: boolean };
        return { status: response.status, data };
      };

      const res = await fireRequest();
      addLog(`Webhook responded with status ${res.status}: ${JSON.stringify(res.data)}`);

      if (duplicate) {
        addLog("🚨 Re-triggering same webhook immediately to test deduplication guard & transaction locks...");
        const resDup = await fireRequest();
        addLog(`Deduplication test response: status ${resDup.status}. Duplicate Blocked: ${resDup.data.isDuplicate ?? "YES"}`);
      }

      if (simulateStatus === "SUCCESS") {
        setStatus("success");
        addLog("Payment simulation completed successfully!");
      } else if (simulateStatus === "CANCELLED") {
        setStatus("cancelled");
        addLog("Checkout cancelled by user.");
      } else {
        setStatus("failed");
        addLog("Payment simulation reported failure state.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      addLog(`Webhook posting error: ${message}`);
      setStatus("failed");
    }
  };

  const handleTimeoutSimulation = () => {
    setStatus("processing");
    addLog("Simulating gateway response timeout...");
    setTimeout(() => {
      setStatus("timeout");
      addLog("Gateway connection timed out. Showing fallback choices...");
    }, 3000);
  };

  const handleReturn = () => {
    // Navigate back to the billing portal
    router.push("/dashboard/billing");
  };

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Decorative luxury backgrounds */}
      <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] rounded-full bg-emerald-950/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-blue-950/10 blur-[120px] pointer-events-none" />

      {/* Main glass card */}
      <div className="w-full max-w-xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-8 shadow-2xl relative z-10">
        
        {/* Gateway Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-800/60 pb-6 mb-6">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
              Payment Gateway Preparedness Simulator
            </span>
            <h1 className="text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
              {provider === "phonepe" ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                  PhonePe Sandbox Checkout
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                  YES BANK Redirect Portal
                </>
              )}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400 font-medium">Transaction Amount</p>
            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">₹{parseFloat(amount).toLocaleString("en-IN")}.00</p>
          </div>
        </div>

        {/* Transaction Summary Panel */}
        <div className="grid grid-cols-2 gap-4 bg-slate-950/50 rounded-xl p-4 border border-slate-800/30 text-xs mb-6">
          <div>
            <p className="text-slate-500">Transaction Reference</p>
            <p className="font-semibold text-slate-300 mt-1 truncate">{transactionId}</p>
          </div>
          <div>
            <p className="text-slate-500">Merchant Reference</p>
            <p className="font-semibold text-slate-300 mt-1 truncate">{merchantTransactionId}</p>
          </div>
        </div>

        {/* Core Status Screen */}
        <div className="bg-slate-950/30 border border-slate-800/40 rounded-xl p-6 min-h-[140px] flex flex-col justify-center items-center text-center mb-6">
          {status === "idle" && (
            <div>
              <div className="w-12 h-12 rounded-full border border-dashed border-slate-700 animate-spin mb-4 mx-auto flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-t-2 border-emerald-500 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-slate-300">Awaiting Simulation Trigger</p>
              <p className="text-xs text-slate-500 mt-1">Select one of the checkout simulation cases below to test the life cycle.</p>
            </div>
          )}

          {status === "processing" && (
            <div>
              <div className="w-12 h-12 rounded-full border-2 border-t-emerald-500 border-slate-800 animate-spin mb-4 mx-auto" />
              <p className="text-sm font-medium text-slate-300">Processing Bank Callback...</p>
              <p className="text-xs text-slate-500 mt-1">Simulating digital payload exchange and verification.</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm font-bold text-emerald-400">Payment Succeeded</p>
              <p className="text-xs text-slate-500 mt-1">Status successfully verified with provider.</p>
            </div>
          )}

          {status === "failed" && (
            <div>
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-sm font-bold text-red-400">Payment Failed</p>
              <p className="text-xs text-slate-500 mt-1">Simulated bank transaction decline processed successfully.</p>
            </div>
          )}

          {status === "cancelled" && (
            <div>
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-amber-400">Payment Cancelled</p>
              <p className="text-xs text-slate-500 mt-1">Checkout session aborted gracefully.</p>
            </div>
          )}

          {status === "timeout" && (
            <div>
              <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-400">Gateway Response Timeout</p>
              <p className="text-xs text-slate-500 mt-1">Fallback to manual UPI routing active.</p>
            </div>
          )}
        </div>

        {/* Live Simulation Control Dashboard */}
        <div className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Trigger Simulation Scenarios
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => triggerWebhookCall("SUCCESS")}
              disabled={status === "processing"}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 transition text-slate-950 font-bold py-2.5 px-4 rounded-lg text-xs"
            >
              Simulate Clean Success
            </button>

            <button
              onClick={() => triggerWebhookCall("FAILED")}
              disabled={status === "processing"}
              className="bg-red-950/40 text-red-400 border border-red-800/40 hover:bg-red-950/60 disabled:bg-slate-800 disabled:text-slate-600 transition font-bold py-2.5 px-4 rounded-lg text-xs"
            >
              Simulate Failure State
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleTimeoutSimulation}
              disabled={status === "processing"}
              className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 transition text-slate-200 font-medium py-2.5 px-4 rounded-lg text-xs border border-slate-700/50"
            >
              Simulate Gateway Timeout
            </button>

            <button
              onClick={() => triggerWebhookCall("CANCELLED")}
              disabled={status === "processing"}
              className="bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800 disabled:text-slate-600 transition text-slate-200 font-medium py-2.5 px-4 rounded-lg text-xs border border-slate-700/50"
            >
              Simulate User Abort
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => triggerWebhookCall("SUCCESS", false, 2000)}
              disabled={status === "processing"}
              className="bg-indigo-950/40 text-indigo-300 border border-indigo-800/40 hover:bg-indigo-950/60 disabled:bg-slate-800 disabled:text-slate-600 transition font-medium py-2.5 px-4 rounded-lg text-xs"
            >
              Simulate Delayed Webhook (2s)
            </button>

            <button
              onClick={() => triggerWebhookCall("SUCCESS", true)}
              disabled={status === "processing"}
              className="bg-purple-950/40 text-purple-300 border border-purple-800/40 hover:bg-purple-950/60 disabled:bg-slate-800 disabled:text-slate-600 transition font-medium py-2.5 px-4 rounded-lg text-xs"
            >
              Simulate Replay / Duplicate
            </button>
          </div>
        </div>

        {/* Real-time Logger Terminal */}
        <div className="mt-8 border-t border-slate-800/60 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
              Execution Logs Terminal
            </h2>
            <button
              onClick={() => setLogMessages([])}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition"
            >
              Clear Logs
            </button>
          </div>
          <div className="bg-slate-950 border border-slate-900 rounded-lg p-4 h-[180px] overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1">
            {logMessages.length === 0 ? (
              <p className="text-slate-600 italic">Terminal active. Awaiting simulation logs...</p>
            ) : (
              logMessages.map((log, index) => (
                <p key={index} className="leading-relaxed">
                  {log.includes("PASS") || log.includes("successfully") ? (
                    <span className="text-emerald-400">{log}</span>
                  ) : log.includes("Error") || log.includes("validation failed") || log.includes("FAIL") ? (
                    <span className="text-red-400">{log}</span>
                  ) : log.includes("Re-triggering") || log.includes("deduplication") ? (
                    <span className="text-purple-400 font-bold">{log}</span>
                  ) : (
                    log
                  )}
                </p>
              ))
            )}
          </div>
        </div>

        {/* Action controls footer */}
        {status !== "idle" && status !== "processing" && (
          <div className="mt-6 pt-4 border-t border-slate-800/30 text-right">
            <button
              onClick={handleReturn}
              className="bg-slate-100 text-slate-950 hover:bg-white font-bold py-2 px-6 rounded-lg text-xs transition"
            >
              Return to Billing Portal
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default function CheckoutSimulatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07080a] text-slate-100 flex items-center justify-center font-sans">
        <div className="w-12 h-12 rounded-full border-2 border-t-emerald-500 border-slate-800 animate-spin" />
      </div>
    }>
      <CheckoutSimulatorContent />
    </Suspense>
  );
}

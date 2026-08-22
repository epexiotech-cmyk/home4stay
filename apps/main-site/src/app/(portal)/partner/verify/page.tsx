"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PartnerVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMsg("No verification token provided.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch("/api/auth/partner/register/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");
        setTimeout(() => {
          window.location.href = "/partner/onboarding/welcome";
        }, 2000);
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Verification failed");
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0E5A75] to-[#043345] p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#FCBC43]/20 blur-[120px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#0983B0]/30 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="card-premium max-w-md w-full p-10 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[32px] text-center relative z-10 animate-in fade-in zoom-in duration-700">
        
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-16 h-16 text-[#FCBC43] animate-spin" />
            <h1 className="text-2xl font-black text-white tracking-tight">Verifying your email</h1>
            <p className="text-white/60 text-sm">Please wait while we initialize your workspace...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center border border-success/30">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Email Verified!</h1>
            <p className="text-white/60 text-sm">Your partner workspace has been established. Redirecting you to onboarding...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-error/20 text-error rounded-full flex items-center justify-center border border-error/30">
              <XCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Verification Failed</h1>
            <p className="text-white/60 text-sm">{errorMsg}</p>
            <button
              onClick={() => router.push("/register?intent=host")}
              className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors"
            >
              Return to Registration
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
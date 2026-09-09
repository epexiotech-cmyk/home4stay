"use client";
import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Smartphone, 
  ChevronRight, 
  CheckCircle2, 
  Loader2, 
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


export interface AadhaarData {
  fullName: string;
  dob: string;
  gender: string;
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  aadhaarMasked: string;
}

interface AadhaarOTPVerificationProps {
  onVerified: (data: AadhaarData) => void;
}

export const AadhaarOTPVerification: React.FC<AadhaarOTPVerificationProps> = ({
  onVerified
}) => {
  const [step, setStep] = useState<"number" | "otp" | "verifying" | "success">("number");
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = () => {
    if (aadhaarNumber.length === 12) {
      setStep("otp");
      setTimer(60);
    }
  };

  const handleVerifyOTP = () => {
    if (otp.length === 6) {
      setStep("verifying");
      // Simulate API delay
      setTimeout(() => {
        setStep("success");
        setTimeout(() => {
          onVerified({
            fullName: "Harsh Patel",
            dob: "1995-08-15",
            gender: "Male",
            address: {
              line1: "123, Luxury Heights",
              line2: "Near Sky Park",
              city: "Mumbai",
              state: "Maharashtra",
              pincode: "400001",
              country: "India"
            },
            aadhaarMasked: `XXXX XXXX ${aadhaarNumber.slice(-4)}`
          });
        }, 1500);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <AnimatePresence mode="wait">
        {step === "number" && (
          <motion.div
            key="number"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#0983B0]/10 border border-[#0983B0]/20 flex gap-4">
              <ShieldCheck className="text-[#0983B0] shrink-0" size={24} />
              <p className="text-sm font-medium text-[#053344] dark:text-white/80 leading-relaxed">
                Enter your 12-digit Aadhaar number. We will send a secure OTP to your registered mobile number for verification.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 px-1">Aadhaar Number</label>
              <input
                type="text"
                maxLength={12}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="0000 0000 0000"
                className="w-full px-6 py-4 rounded-2xl bg-[#0E5A75]/5 border border-[#0E5A75]/10 focus:border-[#0983B0] focus:outline-none text-xl font-bold tracking-[0.2em] text-[#053344] dark:text-white transition-all placeholder:text-[#0E5A75]/20"
              />
            </div>

            <button
              onClick={handleSendOTP}
              disabled={aadhaarNumber.length !== 12}
              className="w-full py-4 rounded-2xl bg-[#0E5A75] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#0983B0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0E5A75]/20"
            >
              Get OTP <ChevronRight size={18} />
            </button>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#0983B0]/10 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="text-[#0983B0]" size={32} />
              </div>
              <h3 className="text-xl font-black text-[#053344] dark:text-white">Verify OTP</h3>
              <p className="text-sm font-medium text-[#0E5A75]/60">Sent to linked mobile ending in •••• 1234</p>
            </div>

            <div className="flex justify-center gap-3">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  value={otp[i] || ""}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val) {
                      setOtp(prev => (prev + val).slice(0, 6));
                      if (i < 5) (e.target.nextSibling as HTMLInputElement)?.focus();
                    } else {
                      setOtp(prev => prev.slice(0, -1));
                    }
                  }}
                  className="w-12 h-16 rounded-xl bg-[#0E5A75]/5 border border-[#0E5A75]/10 text-center text-2xl font-black text-[#0E5A75] focus:border-[#0983B0] focus:bg-white transition-all focus:outline-none"
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={handleVerifyOTP}
                disabled={otp.length !== 6}
                className="w-full py-4 rounded-2xl bg-[#159665] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#159665]/90 transition-all disabled:opacity-50 shadow-lg shadow-[#159665]/20"
              >
                Verify & Link Guest
              </button>

              <div className="flex items-center gap-2 text-sm font-bold">
                {timer > 0 ? (
                  <span className="text-[#0E5A75]/40">Resend OTP in <span className="text-[#0983B0]">{timer}s</span></span>
                ) : (
                  <button 
                    onClick={() => {
                      setTimer(60);
                      setIsResending(true);
                      setTimeout(() => setIsResending(false), 1000);
                    }}
                    className="text-[#0983B0] hover:underline flex items-center gap-1"
                  >
                    {isResending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Resend OTP
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center justify-center space-y-6"
          >
            <div className="relative">
              <Loader2 className="text-[#0983B0] animate-spin" size={64} strokeWidth={1} />
              <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#0983B0]" size={32} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-[#053344] dark:text-white tracking-tight">UIDAI Verification</h3>
              <p className="text-sm font-medium text-[#0E5A75]/60 animate-pulse">Communicating with secure servers...</p>
            </div>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 flex flex-col items-center justify-center space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-[#159665]/10 flex items-center justify-center border-4 border-[#159665]/20">
              <CheckCircle2 className="text-[#159665]" size={48} />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-[#159665] tracking-tight">Verified Successfully</h3>
              <p className="text-sm font-bold text-[#053344]/60">Guest profile linked to Aadhaar</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React from "react";
import Logo from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12 relative overflow-hidden luxury-gradient">
      {/* Cinematic Background Atmosphere */}
      <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse duration-[10s]"></div>
      <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-[#159665]/10 rounded-full blur-[140px] animate-pulse duration-[15s]"></div>
      <div className="absolute top-[20%] left-[-5%] w-[30%] h-[30%] bg-[#FCBC43]/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-12 drop-shadow-2xl">
          <Logo variant="full" size="lg" className="scale-110" />
        </div>
        
        {children}
        
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-center text-[10px] font-black text-[#0E5A75]/60 dark:text-[#0983B0]/60 uppercase tracking-[0.4em]">
            © 2026 Home4Stay • Secure Portal
          </p>
          <div className="flex gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
             <div className="w-8 h-4 bg-white/20 rounded" />
             <div className="w-8 h-4 bg-white/20 rounded" />
             <div className="w-8 h-4 bg-white/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

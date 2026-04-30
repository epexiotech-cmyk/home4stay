import React from "react";
import Logo from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-10">
          <Logo variant="full" size="md" />
        </div>
        {children}
        <p className="mt-10 text-center text-xs text-secondary font-medium tracking-widest uppercase">
          © 2026 Home4Stay • Secure Portal
        </p>
      </div>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { CustomerRegisterForm } from "@/components/auth/CustomerRegisterForm";
import { PartnerRegisterForm } from "@/components/auth/PartnerRegisterForm";
import { Suspense } from "react";

function RegisterContent() {
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent");

  if (intent === "host") {
    return <PartnerRegisterForm />;
  }

  return <CustomerRegisterForm />;
}

export default function UnifiedRegisterPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-12 animate-pulse text-white">Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

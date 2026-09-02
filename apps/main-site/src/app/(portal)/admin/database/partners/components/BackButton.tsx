"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function BackButtonContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  
  const isFromDashboard = from === "dashboard";
  const backHref = isFromDashboard ? "/admin/dashboard" : "/admin/database/partners";
  const backLabel = isFromDashboard ? "← Back to Dashboard" : "← Back to Partners Database";

  return (
    <Link href={backHref} className="hover:text-primary transition-colors hover:underline text-secondary text-sm font-medium">
      {backLabel}
    </Link>
  );
}

export default function BackButton() {
  return (
    <Suspense fallback={<div className="text-secondary text-sm">← Back</div>}>
      <BackButtonContent />
    </Suspense>
  );
}

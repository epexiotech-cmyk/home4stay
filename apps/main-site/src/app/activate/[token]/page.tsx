import React from "react";
import { notFound, redirect } from "next/navigation";
import { PartnerActivationService } from "@/lib/services/partnerActivationService";

interface Props {
  params: {
    token: string;
  };
}

export default async function ActivationPage({ params }: Props) {
  const { token } = params;

  if (!token) {
    return notFound();
  }

  try {
    const activation = await PartnerActivationService.validateToken(token);

    if (!activation || !activation.property) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-error/10 text-error rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-secondary">Invalid Activation Link</h1>
            <p className="text-sm text-secondary/60">
              This activation token is invalid, revoked, or does not exist. Please scan a valid property QR code.
            </p>
          </div>
        </div>
      );
    }

    if (activation.status !== "ACTIVE") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-warning/10 text-warning rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-secondary">Property Not Active</h1>
            <p className="text-sm text-secondary/60">
              This property is currently pending activation or has been revoked. Please check back later.
            </p>
          </div>
        </div>
      );
    }

    // Valid and ACTIVE token, route to the property guest portal
    return redirect(`/property/${activation.property.slug}`);

  } catch (error) {
    console.error("Activation Token Error:", error);
    return notFound();
  }
}

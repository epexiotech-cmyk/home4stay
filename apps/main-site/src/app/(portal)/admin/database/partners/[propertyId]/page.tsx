import React from "react";
import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/database/prisma";
import { AgreementActions } from "../AgreementActions";
import RenewalControl from "../components/RenewalControl";
import BackButton from "../components/BackButton";

export const dynamic = "force-dynamic";

export default async function PropertyDetailsPage({
  params
}: {
  params: Promise<{ propertyId: string }>
}) {
  const { propertyId } = await params;
  
  // Authentication & Authorization
  const cookieStore = await cookies();
  const token = cookieStore.get("access-token")?.value || cookieStore.get("token")?.value;
  
  if (!token) {
    redirect("/login");
  }

  const payload = await verifyToken(token);
  if (!payload || (payload.role !== "super_admin" && payload.role !== "admin")) {
    redirect("/login");
  }

  // Fetch Property Data
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: true,
      agreements: {
        orderBy: { createdAt: "desc" },
        take: 1
      },
      onboardingSession: {
        include: {
          drafts: {
            where: { stepId: "property" }
          }
        }
      },
      paymentTransactions: {
        where: { paymentStatus: "SUCCESS" }
      },
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  if (!property) {
    notFound();
  }

  const agreement = property.agreements[0];
  const hasAgreement = !!agreement && !!(agreement.documentUrl || agreement.signatureUrl);
  
  // Try property.location first, fallback to onboarding property step draft
  let location = property.location;
  if (!location && property.onboardingSession?.drafts?.[0]?.data) {
    const draftData = property.onboardingSession.drafts[0].data as any;
    location = draftData.city || draftData.location;
  }

  const totalPaid = property.paymentTransactions.reduce((acc, tx) => acc + tx.amount, 0);
  
  const subscription = property.subscriptions[0];
  const renewalDate = subscription?.expiresAt 
    ? new Date(subscription.expiresAt)
    : new Date(new Date(property.createdAt).setFullYear(new Date(property.createdAt).getFullYear() + 1));
  
  const daysRemaining = Math.ceil((renewalDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  let subscriptionStatusLabel = "Active";
  let subscriptionStatusClass = "bg-success/10 text-success";
  
  if (daysRemaining < 0) {
    subscriptionStatusLabel = "Expired";
    subscriptionStatusClass = "bg-red-500/10 text-red-500";
  } else if (daysRemaining <= 30) {
    subscriptionStatusLabel = "Renewal Due Soon";
    subscriptionStatusClass = "bg-yellow-500/10 text-yellow-500";
  }

  return (
    <div className="flex flex-col h-full space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-secondary mb-2">
            <BackButton />
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-primary">{property.title || "Untitled Property"}</h1>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase whitespace-nowrap ${property.status === 'LIVE' ? 'bg-success/10 text-success' : 'bg-red-500/10 text-red-500'}`}>
              {property.status === 'LIVE' ? 'LIVE' : property.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Owner / Property Information */}
        <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm">
          <h3 className="text-lg font-black text-primary mb-6">Owner & Property Information</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Owner Name</p>
              <p className="font-bold text-primary">{property.owner?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Email ID</p>
              <p className="font-bold text-primary">{property.owner?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Contact No</p>
              <p className="font-bold text-primary">{property.contactPhone || property.owner?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Location</p>
              <p className="font-bold text-primary">{location || "N/A"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Subscription & Payment */}
          <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-lg font-black text-primary mb-6">Subscription & Payment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Paid Amount</p>
                <p className="font-bold text-primary text-xl">{totalPaid > 0 ? `₹${totalPaid.toLocaleString()}` : "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Renewal Date</p>
                <p className="font-bold text-primary text-xl">{renewalDate.toLocaleDateString()}</p>
              </div>
              <div className="col-span-2 mt-2">
                <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Status</p>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase whitespace-nowrap ${subscriptionStatusClass}`}>
                  {subscriptionStatusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Agreement */}
          <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-lg font-black text-primary mb-6">Agreement</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-primary">{hasAgreement ? "Agreement Uploaded" : "No Agreement"}</p>
                <p className="text-xs text-secondary mt-1">Manage the signed partner agreement.</p>
              </div>
              <AgreementActions propertyId={property.id} hasAgreement={hasAgreement} />
            </div>
          </div>
          
          {/* Renewal Management */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-lg font-black text-red-500 mb-6">Renewal Management</h3>
            <RenewalControl propertyId={property.id} initialStatus={property.status} />
          </div>

        </div>
      </div>
    </div>
  );
}

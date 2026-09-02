import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/database/prisma";
import { AgreementActions } from "./AgreementActions";

export const dynamic = "force-dynamic";

export default async function PartnersDatabasePage() {
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

  // Fetch properties (since partner info is essentially tied to properties here)
  const properties = await prisma.property.findMany({
    where: {
      owner: {
        role: { in: ["owner", "partner", "manager"] }
      }
    },
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
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-sm text-secondary mb-2">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Super Admin</Link>
            <span>/</span>
            <Link href="/admin/database" className="hover:text-primary transition-colors">Database</Link>
            <span>/</span>
            <span className="text-primary font-bold">Partners</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Partners Database</h1>
          <p className="text-secondary mt-1">Manage and inspect partner records and agreements.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/database/partners" className="btn btn-secondary px-4 py-2 text-sm rounded-xl font-bold flex items-center gap-2">
            Refresh
          </Link>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 gap-6 min-h-0">
        <div className="flex-1 flex flex-col bg-surface border border-border rounded-2xl overflow-hidden shadow-sm min-w-0">
          
          <div className="p-4 border-b border-border bg-surface-alt flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-lg">
              Partners Database
              <span className="text-xs font-bold text-secondary bg-background px-2 py-1 rounded-full">{properties.length} records</span>
            </h3>
            {/* Pagination Controls - Dummy visual for now to match requirement if rows < 8 */}
            <div className="flex items-center gap-2 text-sm">
              <button 
                disabled={true} 
                className="px-3 py-1.5 border border-border rounded-lg bg-surface hover:bg-background disabled:opacity-50 font-bold transition-all"
              >
                Prev
              </button>
              <span className="font-bold text-secondary">Page 1 of 1</span>
              <button 
                disabled={true}
                className="px-3 py-1.5 border border-border rounded-lg bg-surface hover:bg-background disabled:opacity-50 font-bold transition-all"
              >
                Next
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-background/50">
            {properties.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-secondary">
                <p className="font-bold text-lg text-primary mb-1">No Partners Found</p>
                <p className="text-sm">There are no partners in the database.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-surface border-b border-border z-10 shadow-sm">
                  <tr>
                    <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest whitespace-nowrap">No.</th>
                    <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest whitespace-nowrap">Property Name</th>
                    <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest whitespace-nowrap">Email ID</th>
                    <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest whitespace-nowrap">Contact No</th>
                    <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest whitespace-nowrap">Owner Name</th>
                    <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest whitespace-nowrap">Location</th>
                    <th className="p-4 text-xs font-bold text-secondary uppercase tracking-widest whitespace-nowrap text-center">Agreement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {properties.map((property, index) => {
                    const agreement = property.agreements[0];
                    const hasAgreement = !!agreement && !!(agreement.documentUrl || agreement.signatureUrl);
                    
                    // Try property.location first, fallback to onboarding property step draft
                    let location = property.location;
                    if (!location && property.onboardingSession?.drafts?.[0]?.data) {
                      const draftData = property.onboardingSession.drafts[0].data as any;
                      location = draftData.city || draftData.location;
                    }

                    return (
                      <tr key={property.id} className="hover:bg-surface-alt transition-colors group">
                        <td className="p-4 text-sm font-medium border-r border-transparent group-hover:border-border/50">{index + 1}</td>
                        <td className="p-4 text-sm font-bold text-primary border-r border-transparent group-hover:border-border/50">
                          <Link href={`/admin/database/partners/${property.id}?from=partners`} className="hover:underline">
                            {property.title || "N/A"}
                          </Link>
                        </td>
                        <td className="p-4 text-sm border-r border-transparent group-hover:border-border/50">{property.owner?.email || "N/A"}</td>
                        <td className="p-4 text-sm border-r border-transparent group-hover:border-border/50">{property.contactPhone || property.owner?.phone || "N/A"}</td>
                        <td className="p-4 text-sm border-r border-transparent group-hover:border-border/50">{property.owner?.name || "N/A"}</td>
                        <td className="p-4 text-sm border-r border-transparent group-hover:border-border/50">{location || "N/A"}</td>
                        <td className="p-4 text-sm text-center">
                          <AgreementActions propertyId={property.id} hasAgreement={hasAgreement} />
                        </td>
                      </tr>
                    );
                  })}
                  {/* Fill empty rows if less than 8 to match design visual strictly */}
                  {Array.from({ length: Math.max(0, 8 - properties.length) }).map((_, i) => (
                    <tr key={`empty-${i}`} className="hover:bg-surface-alt transition-colors">
                      <td className="p-4 text-sm text-transparent select-none">-</td>
                      <td className="p-4 text-sm text-transparent select-none">-</td>
                      <td className="p-4 text-sm text-transparent select-none">-</td>
                      <td className="p-4 text-sm text-transparent select-none">-</td>
                      <td className="p-4 text-sm text-transparent select-none">-</td>
                      <td className="p-4 text-sm text-transparent select-none">-</td>
                      <td className="p-4 text-sm text-transparent select-none">-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

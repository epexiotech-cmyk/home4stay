import React from "react";
import { prisma } from "@/lib/database/prisma";
import Link from "next/link";
import ErrorDetailModal from "./components/ErrorDetailModal";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import RecentPropertiesList from "./components/RecentPropertiesList";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access-token")?.value || cookieStore.get("token")?.value;
  let userRole = "admin";
  if (token) {
    const payload = await verifyToken(token);
    if (payload?.role) userRole = payload.role as string;
  }

  // 1. TOTAL PROPERTIES
  const totalPropertiesCount = await prisma.property.count();

  // 2. ACTIVE PARTNERS (Users with role owner/partner)
  const activePartnersCount = await prisma.user.count({
    where: { role: { in: ["owner", "partner"] } }
  });

  // 3. REVENUE (YTD)
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const revenueData = await prisma.paymentTransaction.aggregate({
    _sum: { amount: true },
    where: { 
      paymentStatus: "SUCCESS",
      createdAt: { gte: startOfYear }
    }
  });
  const revenueAmount = revenueData._sum.amount || 0;
  
  const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 1 });
  let formattedRevenue = formatter.format(revenueAmount);
  if (revenueAmount >= 10000000) {
      formattedRevenue = `₹${(revenueAmount / 10000000).toFixed(1)}Cr`;
  } else if (revenueAmount >= 100000) {
      formattedRevenue = `₹${(revenueAmount / 100000).toFixed(1)}L`;
  }

  // 4. SYSTEM UPTIME
  let isSystemHealthy = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    isSystemHealthy = true;
  } catch(e) {}
  
  const systemHealth = isSystemHealthy ? "HEALTHY" : "DEGRADED";

  // Fetch all properties for RecentPropertiesList
  const allProperties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: true,
      paymentTransactions: {
        where: { paymentStatus: "SUCCESS" }
      }
    }
  });

  const formattedRecentProperties = allProperties.map(property => {
    const totalPaid = property.paymentTransactions.reduce((acc, tx) => acc + tx.amount, 0);
    const startDate = new Date(property.createdAt);
    const renewalDate = new Date(startDate);
    renewalDate.setDate(renewalDate.getDate() + 365);
    const daysRemaining = Math.ceil((renewalDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    
    let statusLabel = "Active";
    let statusClass = "bg-success/10 text-success";
    
    if (daysRemaining < 0) {
      statusLabel = "Expired";
      statusClass = "bg-red-500/10 text-red-500";
    } else if (daysRemaining <= 30) {
      statusLabel = "Renewal Due Soon";
      statusClass = "bg-yellow-500/10 text-yellow-500";
    }

    return {
      id: property.id,
      title: property.title,
      ownerName: property.owner.name,
      totalPaid,
      renewalDateString: renewalDate.toLocaleDateString(),
      statusLabel,
      statusClass
    };
  });

  // Fetch recent system errors (Super Admin Only)
  let systemErrors: any[] = [];
  if (userRole === "super_admin") {
    systemErrors = await prisma.systemError.findMany({
      take: 10,
      orderBy: { createdAt: "desc" }
    });
  }

  // Fetch Renewal Reminders (Admin Only)
  let upcomingRenewals: any[] = [];
  if (userRole !== "super_admin") {
    const today = new Date();
    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);
    
    // We check PropertySubscription for expiresAt. 
    upcomingRenewals = await prisma.propertySubscription.findMany({
      where: {
        expiresAt: {
          gte: today,
          lte: next30Days
        }
      },
      include: {
        property: {
          include: {
            owner: true
          }
        }
      },
      orderBy: {
        expiresAt: "asc"
      }
    });

    if (upcomingRenewals.length === 0) {
      upcomingRenewals = allProperties
        .map(property => {
          const renewalDate = new Date(property.createdAt);
          renewalDate.setDate(renewalDate.getDate() + 365);
          return { property, expiresAt: renewalDate, amount: 0 };
        })
        .filter(sub => sub.expiresAt >= today && sub.expiresAt <= next30Days)
        .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());
    }
  }

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-black text-primary tracking-tighter">System Dashboard</h1>
          <p className="text-secondary mt-2 text-lg font-medium">Enterprise overview of the Home4Stay ecosystem.</p>
        </div>
        <div className="bg-surface border border-border px-4 py-2 rounded-xl text-sm font-bold text-secondary uppercase">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Properties", value: totalPropertiesCount.toLocaleString(), delta: "Live Data", statusClass: "bg-success/10 text-success" },
          { label: "Active Partners", value: activePartnersCount.toLocaleString(), delta: "Live Data", statusClass: "bg-success/10 text-success" },
          { label: "Revenue (YTD)", value: formattedRevenue, delta: "Live Data", statusClass: "bg-success/10 text-success" },
          { label: "System Health", value: systemHealth, delta: "Live Data", statusClass: isSystemHealthy ? "bg-success/10 text-success" : "bg-red-500/10 text-red-500" },
        ].map((stat) => (
          <div key={stat.label} className="p-8 rounded-[2rem] bg-surface border-2 border-primary/5 shadow-sm hover:shadow-xl transition-all group">
            <p className="text-xs font-black text-secondary uppercase tracking-widest">{stat.label}</p>
            <p className={`text-4xl font-black text-primary mt-4 group-hover:scale-105 transition-transform origin-left ${stat.value === "DEGRADED" ? "text-red-500" : ""}`}>
              {stat.value}
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${stat.statusClass}`}>
                {stat.delta}
              </span>
              <span className="text-[10px] font-bold text-secondary uppercase">Real-time</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RECENT PROPERTIES SECTION */}
        <RecentPropertiesList properties={formattedRecentProperties} />

        {/* SYSTEM ERRORS OR RENEWAL REMINDERS SECTION */}
        <div className="rounded-[2.5rem] border-2 border-primary/5 bg-surface p-10 flex flex-col min-h-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-primary">
              {userRole === "super_admin" ? "System Errors" : "Renewal Reminders"}
            </h3>
          </div>
          
          <div className="flex-1 overflow-auto space-y-4 pr-2">
            {userRole === "super_admin" ? (
              // SUPER ADMIN VIEW: System Errors
              systemErrors.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-secondary text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center text-3xl mb-4">
                    ✓
                  </div>
                  <p className="font-bold">System is healthy — no recent errors.</p>
                </div>
              ) : (
                systemErrors.map(error => (
                  <ErrorDetailModal key={error.id} error={error} />
                ))
              )
            ) : (
              // ADMIN VIEW: Renewal Reminders
              upcomingRenewals.length === 0 ? (
                <div className="h-full flex items-center justify-center text-secondary font-bold">
                  No renewals due in the next 30 days.
                </div>
              ) : (
                upcomingRenewals.map((sub, i) => {
                  const daysRemaining = Math.ceil((new Date(sub.expiresAt).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                  return (
                    <div key={i} className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-black text-red-500 uppercase tracking-widest mb-1">Renewal Reminder</p>
                          <p className="font-bold text-primary truncate max-w-[200px]">{sub.property.title}</p>
                          <p className="text-xs text-secondary">Owner: {sub.property.owner.name}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase whitespace-nowrap bg-red-500/10 text-red-500">
                          {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mt-1">
                        <div className="bg-surface p-2 rounded-lg">
                          <p className="text-secondary font-medium mb-0.5">Renewal Date</p>
                          <p className="font-bold text-primary">{new Date(sub.expiresAt).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-surface p-2 rounded-lg">
                          <p className="text-secondary font-medium mb-0.5">Plan Amount</p>
                          <p className="font-bold text-primary">{sub.amount > 0 ? `₹${sub.amount.toLocaleString()}` : "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

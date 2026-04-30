import React from "react";

export default function PartnerDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold text-primary tracking-tight">Partner Dashboard</h1>
        <p className="text-secondary mt-2 font-medium">Overview of your property performance and bookings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Bookings", value: "12", color: "bg-primary" },
          { label: "Revenue (MTD)", value: "₹45,200", color: "bg-success" },
          { label: "Avg. Occupancy", value: "84%", color: "bg-accent" },
        ].map((stat) => (
          <div key={stat.label} className="p-8 rounded-3xl bg-surface border border-border shadow-sm">
            <p className="text-sm font-bold text-secondary uppercase tracking-widest">{stat.label}</p>
            <p className="text-4xl font-extrabold text-primary mt-4">{stat.value}</p>
            <div className={`h-1.5 w-12 rounded-full ${stat.color} mt-6`}></div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border bg-surface p-12 text-center">
        <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📊</span>
        </div>
        <h3 className="text-xl font-bold text-primary">Booking Trends</h3>
        <p className="text-secondary mt-2 max-w-sm mx-auto">
          Your booking data will appear here once you have active listings.
        </p>
      </div>
    </div>
  );
}

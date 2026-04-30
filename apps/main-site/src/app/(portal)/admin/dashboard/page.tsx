import React from "react";

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-black text-primary tracking-tighter">System Dashboard</h1>
          <p className="text-secondary mt-2 text-lg font-medium">Enterprise overview of the Home4Stay ecosystem.</p>
        </div>
        <div className="bg-surface border border-border px-4 py-2 rounded-xl text-sm font-bold text-secondary">
          April 30, 2026
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Properties", value: "1,284", delta: "+4.5%" },
          { label: "Active Partners", value: "312", delta: "+12%" },
          { label: "Revenue (YTD)", value: "₹24.8M", delta: "+28%" },
          { label: "System Uptime", value: "99.98%", delta: "Stable" },
        ].map((stat) => (
          <div key={stat.label} className="p-8 rounded-[2rem] bg-surface border-2 border-primary/5 shadow-sm hover:shadow-xl transition-all group">
            <p className="text-xs font-black text-secondary uppercase tracking-widest">{stat.label}</p>
            <p className="text-4xl font-black text-primary mt-4 group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-success/10 text-success uppercase">
                {stat.delta}
              </span>
              <span className="text-[10px] font-bold text-secondary uppercase">vs last period</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-[2.5rem] border-2 border-primary/5 bg-surface p-10">
          <h3 className="text-xl font-black text-primary mb-6">Recent System Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-xl">🛡️</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">New Security Audit Completed</p>
                  <p className="text-xs text-secondary">Infrastructure layer 4 protection verified.</p>
                </div>
                <div className="text-[10px] font-bold text-secondary uppercase">2m ago</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border-2 border-primary/5 bg-primary p-10 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black mb-2">Enterprise Insights</h3>
            <p className="text-white/70 font-medium">Generate deep analytics reports for your Q2 stakeholders.</p>
          </div>
          <button className="bg-white text-primary font-black py-4 rounded-2xl shadow-2xl hover:scale-105 transition-all">
            GENERATE FULL REPORT
          </button>
        </div>
      </div>
    </div>
  );
}

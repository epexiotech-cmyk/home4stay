import fs from "fs";
import path from "path";
import LeadsList from "../../../components/LeadsList";
import LogoutButton from "../../../components/LogoutButton";

export default function LeadsDashboard() {
  const filePath = path.join(process.cwd(), "src/data/leads.json");
  
  let leads = [];
  
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      leads = raw ? JSON.parse(raw) : [];
    }
  } catch (err) {
    console.error("Error reading leads:", err);
    leads = [];
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-zinc-900">
              Leads Dashboard
            </h1>
            <div className="rounded-full bg-zinc-900 px-3 py-1 text-[10px] font-bold text-white uppercase">
              {leads.length} {leads.length === 1 ? 'Lead' : 'Leads'}
            </div>
          </div>
          <LogoutButton />
        </div>

        <LeadsList initialLeads={leads} />
      </div>
    </div>
  );
}

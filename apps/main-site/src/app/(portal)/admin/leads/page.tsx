import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/database/prisma";
import LeadsList from "@/components/LeadsList";
import LogoutButton from "@/components/LogoutButton";

export default async function LeadsDashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  
  if (!token) {
    redirect("/login");
  }

  const payload = await verifyToken(token);
  if (!payload || payload.role !== "super_admin") {
    redirect("/login");
  }

  let leads: any[] = [];

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        property: true,
        guests: {
          include: {
            guest: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    leads = bookings.map((b: any) => ({
      name: b.guests?.[0]?.guest?.fullName || "Unknown Customer",
      email: b.guests?.[0]?.guest?.email || "N/A",
      phone: b.guests?.[0]?.guest?.mobile || "N/A",
      property: b.property?.title || "Unknown Property",
      location: b.property?.city || b.property?.location || "Unknown Location",
      time: b.createdAt.toISOString(),
      status: ["DRAFT", "PENDING_KYC"].includes(b.status) ? "new" : "contacted"
    }));
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.error("Error fetching leads:", err);
    leads = [];
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-7xl px-6 py-16">
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
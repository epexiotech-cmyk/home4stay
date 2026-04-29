import { getAllProperties } from "@home4stay/data";
import PropertyForm from "../../../components/PropertyForm";
import LogoutButton from "../../../components/LogoutButton";

export default function PropertyManagementPage() {
  const properties = getAllProperties();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold text-zinc-900">
            Property Management
          </h1>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: ADD PROPERTY FORM */}
          <div className="lg:col-span-1">
            <PropertyForm />
          </div>

          {/* RIGHT: PROPERTY LIST */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Existing Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {properties.map((property) => (
                  <div 
                    key={property.slug} 
                    className="group border border-zinc-100 rounded-xl p-5 bg-white transition hover:border-zinc-300 hover:shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-zinc-900">{property.name}</h3>
                        <p className="text-xs text-zinc-500 mt-1">📍 {property.location}</p>
                      </div>
                      <span className="text-[10px] bg-zinc-100 px-2 py-1 rounded font-bold uppercase text-zinc-500">
                        {property.slug}
                      </span>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <p className="font-bold text-zinc-900">
                        ₹{property.price.toLocaleString("en-IN")}
                        <span className="text-[10px] font-normal text-zinc-400 ml-1">/ night</span>
                      </p>
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/admin/properties/${property.slug}/rooms`}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase underline underline-offset-4"
                        >
                          Rooms
                        </Link>
                        <Link 
                          href={`/admin/properties/${property.slug}/images`}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase underline underline-offset-4"
                        >
                          Images
                        </Link>
                        <button className="text-[10px] font-bold text-zinc-400 hover:text-zinc-900 uppercase underline underline-offset-4">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

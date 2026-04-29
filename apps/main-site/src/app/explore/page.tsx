import Link from "next/link";
import { getAllProperties } from "@home4stay/data";

export default function ExplorePage() {
  const properties = getAllProperties();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="text-3xl font-bold mb-10 text-zinc-900">Explore Properties</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {properties.map((property) => (
            <Link href={`/${property.slug}`} key={property.slug} className="group cursor-pointer">
              <div>
                {/* Image Placeholder */}
                <div className="aspect-square w-full rounded-xl bg-zinc-200 transition group-hover:bg-zinc-300"></div>

                {/* Content */}
                <div className="mt-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-zinc-900">
                      {property.name}
                    </h3>
                    <span className="text-sm text-zinc-500">
                      ⭐ {property.rating}
                    </span>
                  </div>

                  <p className="text-sm text-zinc-500">
                    {property.location}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    ₹{property.price.toLocaleString("en-IN")}
                    <span className="font-normal text-zinc-500"> / night</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

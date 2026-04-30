import Link from "next/link";
import { getAllProperties } from "@home4stay/data";

export default function ExplorePage() {
  const properties = getAllProperties();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-full px-6 py-16">
        <h1 className="text-3xl font-extrabold mb-10 text-primary">Explore Properties</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {properties.map((property) => (
            <Link href={`/${property.slug}`} key={property.slug} className="group cursor-pointer">
              <div className="bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                {/* Image Placeholder */}
                <div className="aspect-square w-full bg-surface-alt transition group-hover:opacity-90"></div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-primary group-hover:text-accent transition-colors duration-200">
                      {property.name}
                    </h3>
                    <span className="text-sm text-warning font-medium">
                      ★ {property.rating}
                    </span>
                  </div>

                  <p className="text-sm text-secondary mb-3">
                    {property.location}
                  </p>

                  <div className="pt-2 border-t border-border flex justify-between items-center">
                    <p className="text-sm font-bold text-accent">
                      ₹{property.price.toLocaleString("en-IN")}
                      <span className="font-normal text-secondary text-xs"> / night</span>
                    </p>
                    <button className="text-xs font-semibold text-primary hover:underline underline-offset-4">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

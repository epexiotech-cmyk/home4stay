import { getPropertyOrThrow } from "@home4stay/data";
import ImageForm from "@/components/ImageForm";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function ImageManagementPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const property = getPropertyOrThrow(slug);

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link href="/admin/properties" className="text-zinc-400 hover:text-zinc-900 transition">
              ← Back
            </Link>
            <h1 className="text-3xl font-bold text-zinc-900">
              Manage Images: {property.name}
            </h1>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* LEFT: ADD IMAGE FORM */}
          <div className="lg:col-span-1">
            <ImageForm slug={slug} />
          </div>

          {/* RIGHT: IMAGE GALLERY */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Gallery Preview</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.images && property.images.length > 0 ? (
                  property.images.map((img, index) => (
                    <div key={index} className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100 border border-zinc-100">
                      <img 
                        src={img} 
                        alt={`${property.name} ${index + 1}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-zinc-400 italic">
                    No images added to the gallery yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

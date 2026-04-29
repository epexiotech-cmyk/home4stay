import Link from "next/link";
import { getProperty } from "@home4stay/data";
import RoomsList from "../../../components/RoomsList";

export default function RoomsPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const property = getProperty(slug);

  if (!property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-10 text-center">
        <h1 className="text-4xl font-bold text-zinc-900">404</h1>
        <p className="mt-4 text-zinc-600">Property not found</p>
        <Link href="/" className="mt-8 text-sm font-bold text-zinc-900 underline">
          Go back home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="bg-zinc-50 py-16 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl">
            Our Rooms
          </h1>
          <p className="mt-4 text-xl text-zinc-600">
            Comfortable stays at {property.name}
          </p>
        </div>
      </section>

      {/* ROOMS LISTING */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <RoomsList rooms={property.rooms} slug={slug} />
      </section>

      {/* FOOTER CTA */}
      <section className="bg-zinc-900 py-20 px-6 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold">Ready to experience {property.name}?</h2>
          <p className="mt-4 text-zinc-400">
            Book your stay today and get the best prices for your holiday.
          </p>
          <Link
            href={`/${slug}/booking`}
            className="mt-10 inline-block rounded-full bg-white px-10 py-4 font-bold text-zinc-900 transition hover:bg-zinc-100"
          >
            Check Availability
          </Link>
        </div>
      </section>
    </div>
  );
}

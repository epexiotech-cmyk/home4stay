import { Suspense } from "react";
import BookingForm from "../../../components/BookingForm";
import { getProperty } from "@home4stay/data";
import Link from "next/link";

export default function BookingPage({
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
            Book your stay
          </h1>
          <p className="mt-4 text-xl text-zinc-600">
            Select your dates and room at {property.name}
          </p>
        </div>
      </section>

      {/* BOOKING FORM SECTION */}
      <section className="mx-auto max-w-2xl px-6 py-20">
        <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-2xl bg-zinc-50" />}>
          <BookingForm property={property} />
        </Suspense>
      </section>
    </div>
  );
}

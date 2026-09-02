import { Suspense } from "react";
import BookingForm from "../../../components/BookingForm";
import { getProperty } from "@home4stay/data";
import { getPropertySubscriptionState } from "../../../lib/db";
import Link from "next/link";

export default async function BookingPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const property = getProperty(slug);

  if (!property) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-10 text-center bg-zinc-50">
        <h1 className="text-4xl font-bold text-zinc-900">404</h1>
        <p className="mt-4 text-zinc-600">Property not found</p>
        <Link href="/" className="mt-8 text-sm font-bold text-zinc-900 underline">
          Go back home
        </Link>
      </div>
    );
  }

  // 1. Resolve DB subscription state
  const state = await getPropertySubscriptionState(slug);

  // 2. Suspended gating
  const isSuspended = state && (state.status === "SUSPENDED" || state.subscriptionStatus === "SUSPENDED_OVERDUE");

  if (isSuspended) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white relative overflow-hidden px-6">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-xl w-full text-center bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 text-amber-500 text-3xl font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
              🛡️
            </div>
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-widest text-zinc-100">
            Booking System Offline
          </h1>
          <h2 className="text-zinc-500 text-sm font-bold tracking-widest uppercase mt-2">
            {property.name}
          </h2>
          <p className="mt-6 text-zinc-400 text-base leading-relaxed">
            This boutique stay is currently inactive. Booking and reservations channels are offline. Please explore our active portfolio of curated boutique stays on Home4Stay.
          </p>
          <div className="mt-10">
            <a
              href="http://localhost:3000/explore"
              className="inline-block rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 px-10 py-4 font-bold text-white shadow-[0_10px_25px_rgba(20,184,166,0.3)] hover:scale-[1.03] transition-all duration-300"
            >
              Browse Active Stays
            </a>
          </div>
        </div>
      </div>
    );
  }

  const isInGracePeriod = !!(state && state.subscriptionStatus === "IN_GRACE_PERIOD");

  return (
    <div className="min-h-screen bg-white relative">
      {/* GRACE PERIOD STICKY WARNING BANNER */}
      {isInGracePeriod && (
        <div className="w-full bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-amber-500/15 border-b border-amber-500/30 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-amber-800 dark:text-amber-600 font-semibold text-sm">
            <span className="text-lg animate-bounce">⚠️</span>
            <span className="text-center tracking-tight leading-none">
              Hosting Intermission: Bookings are temporarily paused for this listing during its subscription renewal period.
            </span>
          </div>
        </div>
      )}

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
          <BookingForm property={property} isLocked={isInGracePeriod} />
        </Suspense>
      </section>
    </div>
  );
}

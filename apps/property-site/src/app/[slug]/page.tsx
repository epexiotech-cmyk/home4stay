import Link from "next/link";
import { getProperty } from "@home4stay/data";
import { getPropertySubscriptionState } from "../../lib/db";

export default async function PropertyHomePage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const property = getProperty(slug);

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-10 text-center">
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

  // 2. Suspended gating (completely hide the property detail view if suspended)
  const isSuspended = state && (state.status === "SUSPENDED" || state.subscriptionStatus === "SUSPENDED_OVERDUE");

  if (isSuspended) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white relative overflow-hidden px-6">
        {/* Sleek luxury radial gradient backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
        
        {/* Glassmorphic card container */}
        <div className="relative z-10 max-w-xl w-full text-center bg-zinc-900/50 border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/30 text-amber-500 text-3xl font-extrabold shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse">
              🛡️
            </div>
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-widest text-zinc-100">
            Listing Temporarily Inactive
          </h1>
          <h2 className="text-zinc-500 text-sm font-bold tracking-widest uppercase mt-2">
            {property.name}
          </h2>
          <p className="mt-6 text-zinc-400 text-base leading-relaxed">
            This boutique stay is taking a brief intermission. General bookings and inquiry integrations are offline. Explore other exquisite locations in our premier portfolio!
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

  const isInGracePeriod = state && state.subscriptionStatus === "IN_GRACE_PERIOD";

  // Gallery limits: cap images to max 3 when in grace period
  const imagesToShow = isInGracePeriod && property.images
    ? property.images.slice(0, 3)
    : property.images;

  return (
    <div className="flex flex-col bg-white relative">
      {/* GRACE PERIOD STICKY WARNING BANNER */}
      {isInGracePeriod && (
        <div className="w-full bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-amber-500/15 border-b border-amber-500/30 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-amber-800 dark:text-amber-600 font-semibold text-sm">
            <span className="text-lg animate-bounce">⚠️</span>
            <span className="text-center tracking-tight leading-none">
              Hosting Intermission: This property is currently in a subscription grace period. Image view limits are applied and inquiry submissions are temporarily locked.
            </span>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative h-[85vh] w-full bg-zinc-900 overflow-hidden">
        {/* Premium Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/30 z-10"></div>
        <div className="relative z-20 flex h-full flex-col items-center justify-center px-6 text-center text-white">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl uppercase">
            {property.name}
          </h1>
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-xl font-medium text-zinc-300">
              {property.location}
            </p>
            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
              {property.description}
            </p>
            <div className="mt-4 flex flex-col items-center gap-1">
              <p className="text-xl font-bold text-white tracking-tight">
                Starting from ₹{property.price.toLocaleString("en-IN")} per night
              </p>
              {!isInGracePeriod && (
                <p className="text-sm font-bold text-yellow-400 uppercase tracking-tighter">
                  Limited rooms left for this weekend
                </p>
              )}
              <p className="mt-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                ⭐ {property.rating} • {property.guests} guests
              </p>
            </div>
          </div>

          {isInGracePeriod ? (
            <div className="mt-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 backdrop-blur-md p-6 max-w-md w-full text-center shadow-lg">
              <p className="text-sm font-extrabold text-amber-500 uppercase tracking-widest mb-1 animate-pulse">
                🔓 INQUIRIES TEMPORARILY LOCKED
              </p>
              <p className="text-xs text-zinc-300">
                Bookings and WhatsApp communication lines are paused pending service renewal.
              </p>
            </div>
          ) : (
            <div className="mt-10 flex flex-col gap-6 items-center">
              <Link
                href={`/${slug}/booking`}
                className="rounded-full bg-white px-14 py-5 text-lg font-bold text-zinc-900 shadow-2xl transition hover:bg-zinc-100 hover:scale-105 active:scale-95 duration-200"
              >
                Book Now
              </Link>

              <div className="flex items-center gap-4">
                <a
                  href="https://wa.me/919019650157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  <span>💬</span> WhatsApp Us
                </a>
                <a
                  href="tel:+919019650157"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white transition hover:bg-white/20"
                  title="Call Us"
                >
                  📞
                </a>
              </div>
            </div>
          )}

          {/* Scroll Hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-400 animate-bounce">
            <span className="text-[10px] font-bold uppercase tracking-widest">View Rooms</span>
            <span>↓</span>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-20 w-full">
        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-3xl font-bold text-zinc-900">The Experience</h2>
          {isInGracePeriod && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Gallery Cap Applied (Max 3 Images)
            </span>
          )}
        </div>
        
        {imagesToShow && imagesToShow.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Main Featured Image */}
            <div className="md:col-span-2 aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100">
              <img 
                src={imagesToShow[0]} 
                alt={`${property.name} experience`}
                className="h-full w-full object-cover"
              />
            </div>
            {/* Sidebar Images */}
            <div className="grid grid-cols-1 gap-6">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100">
                <img 
                  src={imagesToShow[1] || imagesToShow[0]} 
                  alt={`${property.name} view`}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100">
                <img 
                  src={imagesToShow[2] || imagesToShow[0]} 
                  alt={`${property.name} detail`}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 aspect-video w-full rounded-2xl bg-zinc-100"></div>
            <div className="grid grid-cols-1 gap-6">
              <div className="aspect-video w-full rounded-2xl bg-zinc-100"></div>
              <div className="aspect-video w-full rounded-2xl bg-zinc-100"></div>
            </div>
          </div>
        )}
      </section>

      {/* WHY CHOOSE THIS STAY SECTION */}
      <section className="bg-white border-y border-zinc-100 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-2xl font-bold text-zinc-900 text-center mb-12">
            Why choose {property.name}?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              {
                title: "Scenic Views",
                desc: "Wake up to breathtaking vistas every single morning.",
              },
              {
                title: "Peaceful Location",
                desc: "Away from the noise, perfect for a relaxing getaway.",
              },
              {
                title: "Easy Access",
                desc: "Located conveniently near all major attractions.",
              },
            ].map((item) => (
              <div key={item.title}>
                <h3 className="font-bold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROOM PREVIEW SECTION */}
      <section className="bg-zinc-50 py-24 pb-32 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-zinc-900">Our Rooms</h2>
              <p className="mt-2 text-zinc-600">Choose the perfect room for your stay</p>
            </div>
            <Link
              href={`/${slug}/rooms`}
              className="text-sm font-bold text-zinc-900 underline underline-offset-4"
            >
              View All Rooms
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {property.rooms.map((room) => (
              <div
                key={room.name}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="aspect-video w-full bg-zinc-100"></div>
                <div className="p-6">
                  <div className="flex flex-col gap-1 mb-4">
                    <h3 className="text-xl font-bold text-zinc-900">{room.name}</h3>
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                      {room.capacity} • {room.view}
                    </p>
                  </div>
                  <p className="mt-2 text-2xl font-extrabold text-zinc-900">
                    ₹{room.price.toLocaleString("en-IN")}{" "}
                    <span className="text-sm font-normal text-zinc-500">/ night</span>
                  </p>
                  {isInGracePeriod ? (
                    <div className="mt-6 block w-full rounded-lg bg-zinc-100 border border-zinc-200 py-3 text-center font-bold text-zinc-400 cursor-not-allowed text-sm">
                      Bookings Locked
                    </div>
                  ) : (
                    <Link
                      href={`/${slug}/booking?room=${encodeURIComponent(room.name)}`}
                      className="mt-6 block w-full rounded-lg bg-zinc-900 py-3 text-center font-bold text-white transition hover:bg-zinc-800"
                    >
                      Book Now
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-6 text-center mb-16 sm:mb-0">
        <div className="mx-auto max-w-2xl">
          {!isInGracePeriod && (
            <div className="mb-4 inline-block rounded-full bg-zinc-100 px-4 py-1 text-xs font-bold text-zinc-900 uppercase tracking-widest">
              Booked 12 times this week
            </div>
          )}
          <h2 className="text-4xl font-extrabold text-zinc-900">
            Book your stay at {property.name}
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            {isInGracePeriod 
              ? "We are currently renewing our hosting services. General reservations are briefly locked." 
              : `Experience the best of ${property.location} with us. Rooms are filling fast.`
            }
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            {isInGracePeriod ? (
              <div className="inline-block rounded-full bg-zinc-200 border border-zinc-300 px-12 py-5 font-bold text-zinc-400 cursor-not-allowed">
                Bookings Paused
              </div>
            ) : (
              <Link
                href={`/${slug}/booking`}
                className="inline-block rounded-full bg-zinc-900 px-12 py-5 font-bold text-white transition hover:bg-zinc-800"
              >
                Check Availability
              </Link>
            )}
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              {isInGracePeriod ? "Inquiries offline" : "No extra charges • Pay at property"}
            </p>
          </div>
        </div>
      </section>

      {/* MOBILE STICKY BOOK BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-100 bg-white p-4 shadow-2xl sm:hidden">
        <div className="flex items-center justify-between">
          {isInGracePeriod ? (
            <div className="w-full text-center py-2 text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 border border-amber-100 rounded-xl">
              ⚠️ Inquiries locked due to pending renewal
            </div>
          ) : (
            <>
              <div>
                <p className="text-lg font-extrabold text-zinc-900">
                  ₹{property.price.toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-zinc-500"> / night</span>
                </p>
                <p className="text-[10px] text-zinc-400 uppercase tracking-tighter">
                  No extra charges • Pay at property
                </p>
              </div>
              <Link
                href={`/${slug}/booking`}
                className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-bold text-white"
              >
                Check Availability
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="bg-zinc-50 py-20 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl">
            See your future property website
          </h1>
          <p className="mt-4 text-xl text-zinc-600">
            This is how your booking website will look for your guests
          </p>
        </div>
      </section>

      {/* DEMO PREVIEW SECTION */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="mb-8 text-center text-sm font-bold uppercase tracking-widest text-zinc-400">
          This could be your property website
        </p>
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl transition-all duration-300 hover:shadow-3xl">
          {/* Simulated Browser Bar */}
          <div className="flex items-center gap-2 border-b border-zinc-100 bg-zinc-50 px-4 py-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-zinc-300"></div>
              <div className="h-3 w-3 rounded-full bg-zinc-300"></div>
              <div className="h-3 w-3 rounded-full bg-zinc-300"></div>
            </div>
            <div className="mx-auto rounded-md bg-white px-4 py-1 text-xs text-zinc-400">
              shivay.home4stay.in
            </div>
          </div>

          {/* Simulated Website Content */}
          <div className="p-0">
            {/* Nav */}
            <div className="flex items-center justify-between px-8 py-4">
              <span className="font-bold text-zinc-900">Shivay Resort</span>
              <button className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white">
                Book Now
              </button>
            </div>

            {/* Hero */}
            <div className="relative aspect-[21/9] w-full bg-zinc-200 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-zinc-400">Shivay Resort</h2>
                <p className="text-zinc-400">Manali, Himachal Pradesh</p>
              </div>
            </div>

            {/* Room Cards */}
            <div className="px-8 py-10">
              <h3 className="mb-6 text-lg font-bold text-zinc-900">Our Rooms</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {[
                  { name: "Deluxe Room", price: "₹3,500" },
                  { name: "Luxury Suite", price: "₹5,500" },
                  { name: "Family Villa", price: "₹8,000" },
                ].map((room) => (
                  <div key={room.name} className="rounded-xl border border-zinc-100 p-4 transition-colors hover:border-zinc-200">
                    <div className="aspect-video w-full rounded-lg bg-zinc-100 mb-3"></div>
                    <h4 className="font-bold text-zinc-900">{room.name}</h4>
                    <p className="mt-1 text-sm text-zinc-500">{room.price} / night</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="bg-zinc-50 py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
            <div>
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
                📱
              </div>
              <h3 className="mb-3 font-bold text-zinc-900">Works perfectly on mobile</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Optimized for bookings on smartphones. Your guests can book anytime, anywhere.
              </p>
            </div>
            <div>
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
                ⚡
              </div>
              <h3 className="mb-3 font-bold text-zinc-900">Loads instantly for better bookings</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Blazing fast performance ensures you don&apos;t lose customers due to slow loading times.
              </p>
            </div>
            <div>
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white">
                📩
              </div>
              <h3 className="mb-3 font-bold text-zinc-900">Guests contact you directly</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                No middlemen. Bookings come directly to you, saving you thousands in commissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold text-zinc-900">Get your website in 24 hours</h2>
          <p className="mt-6 text-lg text-zinc-600">Join properties that have already switched to direct bookings.</p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/partner/contact"
              className="inline-block rounded-lg bg-zinc-900 px-12 py-5 font-bold text-white transition hover:bg-zinc-800"
            >
              Get Started Now
            </Link>
            <p className="text-sm font-medium text-zinc-500 italic">
              ⚡ Setup takes less than 24 hours
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

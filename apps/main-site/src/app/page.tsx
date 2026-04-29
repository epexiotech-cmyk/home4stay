import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* SECTION 1: Hero */}
      <section className="bg-zinc-50 py-20 px-6 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
            Find your perfect stay
          </h1>
          <p className="mt-6 text-xl text-zinc-600">
            Book homestays, hotels, and villas
          </p>

          {/* Search Bar UI */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg sm:flex-row sm:rounded-full">
            <input
              type="text"
              placeholder="Where are you going?"
              className="w-full px-6 py-2 outline-none sm:w-64"
            />
            <div className="hidden h-8 w-px bg-zinc-200 sm:block"></div>
            <input
              type="text"
              placeholder="Add dates"
              className="w-full px-6 py-2 outline-none sm:w-48"
            />
            <button className="w-full rounded-full bg-zinc-900 px-8 py-3 font-semibold text-white transition hover:bg-zinc-800 sm:w-auto">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Categories */}
      <section className="border-b border-zinc-100 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-8 overflow-x-auto pb-2">
          {["Homestay", "Hotel", "Villa", "Budget Stay"].map((category) => (
            <button
              key={category}
              className="whitespace-nowrap text-sm font-medium text-zinc-500 transition hover:text-zinc-900 hover:underline underline-offset-8"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: Featured Properties */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 text-2xl font-bold text-zinc-900">Featured Properties</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((id) => (
            <Link key={id} href="/demo-property" className="group cursor-pointer">
              <div className="aspect-square w-full rounded-xl bg-zinc-200 transition group-hover:bg-zinc-300"></div>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-zinc-900">Cozy Mountain Villa</h3>
                  <span className="text-sm text-zinc-500">★ 4.9</span>
                </div>
                <p className="text-sm text-zinc-500">Manali, Himachal Pradesh</p>
                <p className="mt-1 text-sm font-semibold text-zinc-900">
                  ₹4,500 <span className="font-normal text-zinc-500">/ night</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="mt-auto border-t border-zinc-100 bg-zinc-900 px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold">Own a property?</h2>
          <p className="mt-4 text-zinc-400">
            Earn extra income by listing your home on Home4Stay.
          </p>
          <button className="mt-8 rounded-lg bg-white px-8 py-3 font-bold text-zinc-900 transition hover:bg-zinc-100">
            List Your Property
          </button>
        </div>
      </section>
    </div>
  );
}

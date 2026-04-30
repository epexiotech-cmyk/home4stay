import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* SECTION 1: Hero */}
      <section className="bg-background py-20 px-6 text-center">
        <div className="mx-auto max-w-full">
          <Logo variant="icon" size="lg" link={false} className="justify-center mb-8" />
          <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-6xl">
            Find your perfect stay
          </h1>
          <p className="mt-6 text-xl text-secondary">
            Book homestays, hotels, and villas
          </p>

          {/* Search Bar UI */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-lg sm:flex-row sm:rounded-full">
            <input
              type="text"
              placeholder="Where are you going?"
              className="w-full px-6 py-2 outline-none sm:w-64 bg-transparent text-primary"
            />
            <div className="hidden h-8 w-px bg-border sm:block"></div>
            <input
              type="text"
              placeholder="Add dates"
              className="w-full px-6 py-2 outline-none sm:w-48 bg-transparent text-primary"
            />
            <button className="btn btn-primary w-full rounded-full sm:w-auto">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: Categories */}
      <section className="border-b border-border bg-surface px-6 py-8">
        <div className="mx-auto flex max-w-full items-center justify-center gap-8 overflow-x-auto pb-2">
          {["Homestay", "Hotel", "Villa", "Budget Stay"].map((category) => (
            <button
              key={category}
              className="whitespace-nowrap text-sm font-medium text-secondary transition hover:text-primary hover:underline underline-offset-8"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* SECTION 3: Featured Properties */}
      <section className="mx-auto max-w-full px-6 py-16">
        <h2 className="mb-8 text-2xl font-bold text-primary">Featured Properties</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((id) => (
            <Link key={id} href="/explore" className="group cursor-pointer">
              <div className="aspect-square w-full rounded-xl bg-surface-alt border border-border transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1"></div>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-primary">Cozy Mountain Villa</h3>
                  <span className="text-sm text-warning">★ 4.9</span>
                </div>
                <p className="text-sm text-secondary">Manali, Himachal Pradesh</p>
                <p className="mt-1 text-sm font-semibold text-accent">
                  ₹4,500 <span className="font-normal text-secondary">/ night</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: CTA */}
      <section className="mt-auto border-t border-border bg-primary px-6 py-16 text-center text-white">
        <div className="mx-auto max-w-full">
          <h2 className="text-3xl font-bold text-white">Own a property?</h2>
          <p className="mt-4 text-white/80">
            Earn extra income by listing your home on Home4Stay.
          </p>
          <button className="mt-8 btn btn-primary">
            List Your Property
          </button>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";

export default function PartnerPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* SECTION 1: HERO */}
      <section className="bg-zinc-50 py-24 px-6 text-center">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-5xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl">
            Get your own hotel booking website in 24 hours
          </h1>
          <p className="mt-8 text-xl text-zinc-600">
            Stop paying commissions. Take direct bookings from your customers.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/partner/contact"
              className="w-full rounded-lg bg-zinc-900 px-8 py-4 font-bold text-white transition hover:bg-zinc-800 sm:w-auto"
            >
              Get Started
            </Link>
            <Link
              href="/partner/demo"
              className="w-full rounded-lg border border-zinc-200 bg-white px-8 py-4 font-bold text-zinc-900 transition hover:bg-zinc-50 sm:w-auto"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM vs SOLUTION */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="rounded-2xl bg-zinc-50 p-10">
            <h2 className="text-2xl font-bold text-zinc-900">The Problem</h2>
            <ul className="mt-6 space-y-4 text-zinc-600">
              <li className="flex items-start gap-3">
                <span className="text-zinc-400 font-bold">✕</span> High commissions (15-30%) on every booking
              </li>
              <li className="flex items-start gap-3">
                <span className="text-zinc-400 font-bold">✕</span> No control over customer data or branding
              </li>
              <li className="flex items-start gap-3">
                <span className="text-zinc-400 font-bold">✕</span> Dependency on third-party platforms
              </li>
            </ul>
          </div>
          <div className="rounded-2xl bg-zinc-900 p-10 text-white">
            <h2 className="text-2xl font-bold">The Solution</h2>
            <ul className="mt-6 space-y-4 text-zinc-300">
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span> 0% Commission. You keep 100% of your earnings
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span> Your own brand, your own domain
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-500 font-bold">✓</span> Full control over your business and customers
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3: BENEFITS */}
      <section className="bg-zinc-50 py-24 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold text-zinc-900">Why choose Home4Stay?</h2>
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {[
              { title: "No Commission", desc: "Never pay a penny to platforms again." },
              { title: "Your Own Website", desc: "Professional site built specifically for your property." },
              { title: "Direct Customer Bookings", desc: "Customers book directly with you, no middlemen." },
              { title: "Setup in 24 hours", desc: "Get your site live and ready to book in just one day." },
            ].map((benefit) => (
              <div key={benefit.title} className="rounded-xl border border-zinc-200 bg-white p-8">
                <h3 className="font-bold text-zinc-900">{benefit.title}</h3>
                <p className="mt-3 text-sm text-zinc-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: DEMO PREVIEW */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-zinc-900">See how your property website will look</h2>
        <p className="mt-4 text-zinc-600">Join properties like shivay.home4stay.homes</p>
        <div className="mt-12 aspect-video w-full rounded-2xl border border-zinc-200 bg-zinc-100 flex items-center justify-center">
          <p className="text-zinc-400 font-medium">Demo Preview Placeholder</p>
        </div>
        {/* Trust Proof */}
        <p className="mt-10 text-sm font-medium text-zinc-500 uppercase tracking-widest">
          Trusted by 50+ homestays, hotels, and villas across India
        </p>
      </section>

      {/* SECTION 5: PRICING HOOK */}
      <section className="bg-zinc-900 py-20 px-6 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-4 text-xl text-zinc-400">Plans starting from ₹999/month</p>
          <Link
            href="/partner/pricing"
            className="mt-10 inline-block rounded-lg bg-white px-10 py-4 font-bold text-zinc-900 transition hover:bg-zinc-100"
          >
            Compare Plans
          </Link>
        </div>
      </section>

      {/* SECTION 4: FINAL CTA */}
      <section className="py-24 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-extrabold text-zinc-900">Start getting direct bookings today</h2>
          <p className="mt-6 text-lg text-zinc-600">Join hundreds of owners who have switched to direct bookings.</p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Link
              href="/partner/contact"
              className="inline-block rounded-lg bg-zinc-900 px-12 py-5 font-bold text-white transition hover:bg-zinc-800"
            >
              Get Started Now
            </Link>
            <p className="text-sm font-medium text-zinc-500 italic">
              ⚡ Setup takes less than 24 hours • No setup fees • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

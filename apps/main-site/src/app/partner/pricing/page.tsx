import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Basic",
      price: "₹999",
      features: ["Booking website", "Direct customer inquiries"],
      highlight: false,
    },
    {
      name: "Pro",
      price: "₹1,999",
      features: ["Everything in Basic", "Custom domain", "SEO optimization"],
      highlight: true,
      badge: "Most Popular",
      saving: "Save ₹12,000/year compared to platforms",
    },
    {
      name: "Premium",
      price: "₹2,999",
      features: ["Everything in Pro", "Priority support"],
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <section className="bg-zinc-50 py-20 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold text-zinc-900 sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-zinc-600 font-medium">
            Start getting direct bookings and stop paying commissions.
          </p>
          <p className="mt-2 text-lg text-zinc-500">
            Choose a plan that fits your property
          </p>
        </div>
      </section>

      {/* PRICING CARDS */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Perfect for homestays, hotels, and villa owners
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-center">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-8 transition-all duration-300 ${
                plan.highlight
                  ? "z-10 border-2 border-zinc-900 bg-white shadow-2xl scale-105"
                  : "border border-zinc-200 bg-white shadow-sm hover:shadow-md"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900 px-4 py-1 text-xs font-bold text-white uppercase tracking-widest">
                  {plan.badge}
                </span>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-zinc-900">{plan.price}</span>
                  <span className="ml-1 text-zinc-500">/month</span>
                </div>
                {plan.saving && (
                  <p className="mt-2 text-xs font-bold text-zinc-900 uppercase tracking-tight">
                    {plan.saving}
                  </p>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-zinc-600">
                    <span className="text-zinc-900 font-bold">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/partner/contact"
                className={`w-full rounded-lg py-3 text-center font-bold transition-colors duration-200 ${
                  plan.highlight
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                }`}
              >
                Get Your Website
              </Link>
            </div>
          ))}
        </div>

        {/* RISK REVERSAL */}
        <p className="mt-12 text-center text-sm font-medium text-zinc-500">
          No setup fees • Cancel anytime • Setup in 24 hours
        </p>

        {/* MINI FAQ */}
        <div className="mx-auto mt-32 max-w-2xl border-t border-zinc-100 pt-16">
          <h2 className="mb-10 text-center text-2xl font-bold text-zinc-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div>
              <h4 className="font-bold text-zinc-900">How long does setup take?</h4>
              <p className="mt-2 text-sm text-zinc-600">Your website goes live within 24 hours after we receive your property details.</p>
            </div>
            <div>
              <h4 className="font-bold text-zinc-900">Do I need technical knowledge?</h4>
              <p className="mt-2 text-sm text-zinc-600">No, we handle everything for you—from design to deployment. You just focus on your guests.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

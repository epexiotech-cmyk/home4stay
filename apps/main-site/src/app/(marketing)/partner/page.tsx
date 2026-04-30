import Logo from "@/components/ui/Logo";
import Link from "next/link";

export default function PartnerPage() {
  return (
    <div className="flex flex-col bg-background">
      {/* SECTION 1: HERO */}
      <section className="bg-background py-24 px-6 text-center border-b border-border">
        <div className="mx-auto max-w-full">
          <Logo variant="icon" size="lg" link={false} className="justify-center mb-10" />
          <h1 className="text-5xl font-extrabold tracking-tight text-primary sm:text-7xl leading-tight">
            Get your own hotel booking website in 24 hours
          </h1>
          <p className="mt-8 text-xl text-secondary max-w-2xl mx-auto">
            Stop paying commissions. Take direct bookings from your customers and grow your brand.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/partner/contact"
              className="btn btn-primary px-10 py-4 text-lg rounded-xl w-full sm:w-auto"
            >
              Get Started Free
            </Link>
            <Link
              href="/partner/demo"
              className="btn btn-outline px-10 py-4 text-lg rounded-xl w-full sm:w-auto"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM vs SOLUTION */}
      <section className="mx-auto max-w-full px-6 py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="rounded-3xl bg-surface p-12 shadow-sm border border-border">
            <h2 className="text-3xl font-bold text-primary mb-8">The Problem</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">✕</span>
                <div>
                  <p className="font-bold text-primary">High commissions</p>
                  <p className="text-secondary text-sm">Paying 15-30% on every booking eats into your profits.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">✕</span>
                <div>
                  <p className="font-bold text-primary">No Customer Ownership</p>
                  <p className="text-secondary text-sm">You never get to build a relationship with your own guests.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">✕</span>
                <div>
                  <p className="font-bold text-primary">Platform Dependency</p>
                  <p className="text-secondary text-sm">Your business is at the mercy of third-party algorithm changes.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="rounded-3xl bg-primary p-12 shadow-2xl text-white transform lg:translate-y-6">
            <h2 className="text-3xl font-bold mb-8">The Solution</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">✓</span>
                <div>
                  <p className="font-bold">0% Commission</p>
                  <p className="text-white/80 text-sm">You keep 100% of your earnings. No hidden fees.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">✓</span>
                <div>
                  <p className="font-bold">Full Branding Control</p>
                  <p className="text-white/80 text-sm">Your own brand, your own domain, your own design.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center font-bold">✓</span>
                <div>
                  <p className="font-bold">Direct Guest Data</p>
                  <p className="text-white/80 text-sm">Build your own database and encourage repeat stays.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 3: BENEFITS */}
      <section className="bg-surface-alt py-24 px-6 mt-12">
        <div className="mx-auto max-w-full text-center">
          <h2 className="text-4xl font-extrabold text-primary mb-4">Why choose Home4Stay?</h2>
          <p className="text-secondary mb-16 max-w-2xl mx-auto">Everything you need to run your property business directly, without the middleman.</p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 text-left">
            {[
              { title: "No Commission", desc: "Never pay a penny to platforms again. Keep what you earn." },
              { title: "Your Own Website", desc: "Professional site built specifically for your unique property." },
              { title: "Direct Bookings", desc: "Customers book directly with you. No middlemen, no delays." },
              { title: "Setup in 24 hours", desc: "Get your site live and ready to take bookings in just one day." },
            ].map((benefit) => (
              <div key={benefit.title} className="card card-premium p-8 bg-surface">
                <div className="w-12 h-12 bg-primary/5 rounded-lg flex items-center justify-center mb-6">
                  <span className="text-primary font-bold">★</span>
                </div>
                <h3 className="font-bold text-primary text-lg mb-3">{benefit.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: DEMO PREVIEW */}
      <section className="mx-auto max-w-full px-6 py-24 text-center">
        <h2 className="text-4xl font-extrabold text-primary mb-6">See how your property website will look</h2>
        <p className="text-secondary mb-12">Join 50+ properties who have already launched their own direct booking site.</p>
        <div className="mt-12 aspect-video w-full rounded-3xl border border-border bg-surface shadow-2xl flex items-center justify-center overflow-hidden">
           <div className="w-full h-full bg-gradient-to-br from-surface to-surface-alt flex items-center justify-center">
              <p className="text-primary/40 font-bold text-2xl uppercase tracking-widest">Premium Website Preview</p>
           </div>
        </div>
        <p className="mt-16 text-xs font-bold text-secondary uppercase tracking-[0.3em]">
          Empowering Owners Across 20+ Cities In India
        </p>
      </section>

      {/* SECTION 5: PRICING HOOK */}
      <section className="bg-primary py-24 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        <div className="mx-auto max-w-full relative z-10">
          <h2 className="text-4xl font-extrabold mb-6">Simple, transparent pricing</h2>
          <p className="text-xl text-white/80 mb-12">Professional plans starting from as low as ₹999/month</p>
          <Link
            href="/partner/pricing"
            className="btn btn-primary px-12 py-5 text-lg rounded-xl"
          >
            Compare All Plans
          </Link>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA */}
      <section className="py-32 px-6 text-center bg-surface">
        <div className="mx-auto max-w-full">
          <h2 className="text-5xl font-extrabold text-primary mb-8">Start getting direct bookings today</h2>
          <p className="text-xl text-secondary mb-12">Join hundreds of property owners who have taken back control of their business.</p>
          <div className="flex flex-col items-center gap-6">
            <Link
              href="/partner/contact"
              className="btn btn-secondary px-16 py-5 text-xl rounded-2xl w-full sm:w-auto"
            >
              Get Started Now
            </Link>
            <p className="text-sm font-medium text-secondary/60 italic flex items-center gap-2">
              <span className="text-success font-bold">✓</span> Setup in 24h <span className="text-border">|</span> <span className="text-success font-bold">✓</span> No Setup Fees <span className="text-border">|</span> <span className="text-success font-bold">✓</span> Cancel Anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

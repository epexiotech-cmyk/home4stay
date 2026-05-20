import Logo from "@/components/ui/Logo";
import Link from "next/link";
import { 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  Database, 
  Percent, 
  Star, 
  ArrowUpRight,
  Layout,
  Smartphone,
  Lock
} from "lucide-react";

export default function PartnerPage() {
  return (
    <div className="flex flex-col bg-background min-h-screen selection:bg-primary/20 selection:text-primary">
      
      {/* SECTION 1: HERO */}
      <section className="relative bg-background pt-32 pb-24 px-6 text-center border-b border-border overflow-hidden">
        {/* Soft atmospheric gradient background */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-5xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-matte border border-primary/10 text-primary mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <Sparkles size={14} className="text-warning animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">The Future of Independent Hospitality SaaS</span>
          </div>

          <Logo variant="icon" size="lg" link={false} className="justify-center mb-10 scale-110" />
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-primary leading-[1.1] max-w-4xl mx-auto">
            Your Brand. Your Guests.<br />
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Your Independent Future.</span>
          </h1>
          
          <p className="mt-8 text-lg md:text-xl text-secondary/80 max-w-3xl mx-auto leading-relaxed font-medium">
            Break free from 15-30% OTA commission margins. Home4Stay empowers elite villa owners, boutique hotels, and luxury hosts to deploy premium direct-booking websites, secure guest relationships, and take back control.
          </p>
          
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row max-w-md mx-auto sm:max-w-none">
            <Link
              href="/partner/onboarding"
              className="btn btn-primary px-10 py-4.5 text-base rounded-2xl w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2 group transition-all"
            >
              <span>Launch Your Property</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/partner/demo"
              className="btn btn-secondary px-10 py-4.5 text-base rounded-2xl w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-white transition-all border border-border"
            >
              <span>View Live Demo</span>
              <ArrowUpRight size={18} className="text-secondary/60" />
            </Link>
          </div>

          <div className="mt-10 flex items-center justify-center gap-6 text-xs font-bold text-secondary/60 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-success" /> 0% Platform Commission</span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-success" /> 100% Data Independent</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM vs SOLUTION */}
      <section className="mx-auto max-w-7xl px-6 py-28 relative">
        <div className="text-center mb-16">
          <h2 className="text-xs font-black text-primary/40 uppercase tracking-[0.25em] mb-3">Breaking the OTA Monopolies</h2>
          <p className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">Regain Control of Your Margins</p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 items-stretch">
          {/* PROBLEM CARD */}
          <div className="rounded-[32px] bg-white/40 dark:bg-white/5 p-10 md:p-12 shadow-sm border border-border flex flex-col justify-between hover:border-primary/10 transition-all duration-500">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/5 text-accent mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest">The OTA Dependency</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-8 tracking-tight">Why relying on platforms stunts your growth</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/5 text-accent flex items-center justify-center font-bold text-sm">✕</span>
                  <div>
                    <p className="font-bold text-primary">High Commission Deductions</p>
                    <p className="text-secondary/70 text-sm mt-1">Paying 15% to 30% on every booking slashes your bottom-line profits continuously.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/5 text-accent flex items-center justify-center font-bold text-sm">✕</span>
                  <div>
                    <p className="font-bold text-primary">No Customer Relationships</p>
                    <p className="text-secondary/70 text-sm mt-1">Platforms hide guests&apos; real email addresses and phone numbers, preventing direct repeat business.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/5 text-accent flex items-center justify-center font-bold text-sm">✕</span>
                  <div>
                    <p className="font-bold text-primary">Platform Deplatforming Risk</p>
                    <p className="text-secondary/70 text-sm mt-1">Algorithms change instantly. A single unfavorable review or policy shift can completely erase your visibility.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* SOLUTION CARD */}
          <div className="rounded-[32px] bg-primary p-10 md:p-12 shadow-2xl text-white flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 relative overflow-hidden group">
            {/* Ambient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-light/20 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#FCBC43] mb-8 border border-white/5">
                <Sparkles size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">Home4Stay SaaS Freedom</span>
              </div>
              <h3 className="text-2xl font-bold mb-8 tracking-tight">Full brand sovereignty & direct relationships</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-[#78D145] flex items-center justify-center font-bold text-sm">✓</span>
                  <div>
                    <p className="font-bold text-white">0% Platform Commissions</p>
                    <p className="text-white/80 text-sm mt-1">Keep 100% of your nightly rates. All guest payments flow directly into your own bank account.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-[#78D145] flex items-center justify-center font-bold text-sm">✓</span>
                  <div>
                    <p className="font-bold text-white">Total Guest Sovereignty</p>
                    <p className="text-white/80 text-sm mt-1">Own your guest database. Capture exact contact details to power email marketing and direct referrals.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 text-[#78D145] flex items-center justify-center font-bold text-sm">✓</span>
                  <div>
                    <p className="font-bold text-white">Your Independent Custom Site</p>
                    <p className="text-white/80 text-sm mt-1">Stand out with a high-speed, gorgeous website hosted on your custom domain with your exact boutique brand.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NEW SECTION: ONBOARDING TEASER HOOK */}
      <section className="bg-surface-alt py-28 px-6 border-y border-border relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/5 text-primary mb-4">
              <Zap size={12} className="text-warning" />
              <span className="text-[10px] font-black uppercase tracking-widest">Frictionless Setup Engine</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">Launch your property in minutes</h2>
            <p className="text-secondary/70 mt-4 font-medium text-lg">
              Say goodbye to complicated web design systems. Our state-of-the-art onboarding wizard is built to launch beautiful hospitality websites in just four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                step: "01", 
                title: "Identify Property Type", 
                desc: "Choose between custom boutique resorts, private villas, heritage homestays, or organic farm retreats to tailor your layout." 
              },
              { 
                step: "02", 
                title: "Atmosphere Engine", 
                desc: "Instantly adjust styling vibes. Select from coastal sand dunes, snow escapes, heritage luxury, or lush jungle themes." 
              },
              { 
                step: "03", 
                title: "Unified Inventory", 
                desc: "Configure luxury suites, cottage rates, flexible refund policies, and checkout structures with ease." 
              },
              { 
                step: "04", 
                title: "Instant Live Preview", 
                desc: "Observe real-time desktop and mobile previews of your guest landing page before pushing it live to the world." 
              }
            ].map((hook) => (
              <div key={hook.step} className="card-premium p-8 rounded-[28px] bg-white border border-border shadow-sm flex flex-col justify-between hover-lift relative overflow-hidden">
                <div className="absolute top-2 right-4 text-primary/5 font-extrabold text-7xl select-none">{hook.step}</div>
                <div>
                  <h3 className="font-extrabold text-primary text-lg mb-3 tracking-tight mt-6">{hook.title}</h3>
                  <p className="text-xs font-medium text-secondary/60 leading-relaxed leading-relaxed">{hook.desc}</p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                  <span>Guided Setup</span>
                  <CheckCircle2 size={12} className="text-success" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/partner/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4.5 rounded-2xl bg-primary text-white font-extrabold text-sm uppercase tracking-widest shadow-lg hover:bg-primary-hover group transition-all"
            >
              <span>Test The Setup Wizard Teaser</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-3 text-[11px] font-bold text-secondary/40 uppercase tracking-wider">No Coding Skills Required &middot; Free Setup</p>
          </div>
        </div>
      </section>

      {/* SECTION 3: BENEFITS */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-xs font-black text-primary/45 uppercase tracking-[0.25em] mb-3">Enterprise Grade PMS SaaS</h2>
            <p className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">Why Boutique Properties Choose Home4Stay</p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                title: "0% Commission Infrastructure", 
                desc: "Keep 100% of your earnings. Direct guest bank deposits mean faster access to cash flow.",
                icon: Percent 
              },
              { 
                title: "Custom Brand Autonomy", 
                desc: "Configure custom domains, layout styles, and unique image galleries tailored to your identity.",
                icon: Layout 
              },
              { 
                title: "Actionable Customer Data", 
                desc: "Collect real guest emails and phone numbers to foster long-term loyalty and repeat stays.",
                icon: Database 
              },
              { 
                title: "Multi-device Optimization", 
                desc: "Beautiful guest experiences that function flawlessly on mobile screens, tablets, and desktop browsers.",
                icon: Smartphone 
              },
            ].map((benefit) => (
              <div key={benefit.title} className="card-premium p-8 bg-white border border-border rounded-[28px] hover-lift">
                <div className="w-12 h-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6">
                  <benefit.icon size={22} className="stroke-[2px]" />
                </div>
                <h3 className="font-extrabold text-primary text-base mb-3 tracking-tight">{benefit.title}</h3>
                <p className="text-xs text-secondary/70 leading-relaxed font-medium">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: DEMO PREVIEW (WEBSITE PREVIEW) */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold text-primary mb-4 tracking-tight">See your property website come to life</h2>
        <p className="text-secondary/70 mb-12 font-medium max-w-xl mx-auto text-sm md:text-base">Join 50+ luxury hotels and villas who have already launched their own direct booking site.</p>
        
        <div className="mt-12 aspect-[16/9] md:aspect-[21/9] w-full rounded-[40px] border border-border bg-white shadow-premium flex items-center justify-center overflow-hidden relative group">
          {/* Simulated Browser UI */}
          <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-alt flex flex-col justify-start">
            <div className="flex items-center gap-2 border-b border-border bg-white px-6 py-3 shrink-0">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-accent/25"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-warning/25"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-success/25"></div>
              </div>
              <div className="mx-auto rounded-lg bg-surface-alt border border-border px-8 py-1.5 text-[10px] font-bold text-secondary/40 tracking-wider">
                https://shivay.home4stay.in
              </div>
            </div>
            
            {/* Website Body Simulation */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-tr from-primary/5 to-transparent relative">
              <div className="text-center relative z-10 max-w-md">
                <Star size={32} className="text-[#FCBC43] fill-[#FCBC43] mx-auto mb-4 animate-bounce" />
                <h4 className="text-2xl font-black text-primary tracking-tight">Shivay Resort &amp; Villa</h4>
                <p className="text-xs font-bold text-secondary/60 uppercase tracking-widest mt-2">Manali, Himachal Pradesh</p>
                <div className="mt-6 flex justify-center">
                  <span className="px-5 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md">Book Direct &bull; Save 20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <p className="mt-16 text-[10px] font-black text-secondary/50 uppercase tracking-[0.3em]">
          Empowering Property Sovereignty Across 20+ Cities in India
        </p>
      </section>

      {/* SECTION 5: PRICING HOOK */}
      <section className="bg-primary py-24 px-6 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-light/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FCBC43]/5 rounded-full blur-[80px] -ml-32 -mb-32 pointer-events-none"></div>
        
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FCBC43] mb-6">
            <Lock size={12} />
            <span className="text-[10px] font-black uppercase tracking-wider">Fixed Monthly SaaS Subscription</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Simple, transparent pricing.</h2>
          <p className="text-base md:text-lg text-white/80 mb-12 max-w-xl mx-auto leading-relaxed">
            Professional plans starting from as low as <span className="text-[#FCBC43] font-bold">₹999/month</span>. Pay only for the tech support, keep every single rupee of your booking revenue.
          </p>
          <Link
            href="/partner/pricing"
            className="btn bg-[#FCBC43] text-primary px-12 py-5 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-[#ffc654] hover:shadow-2xl hover:-translate-y-0.5 transition-all"
          >
            Compare All Plans
          </Link>
        </div>
      </section>

      {/* SECTION 6: FINAL CTA */}
      <section className="py-32 px-6 text-center bg-surface relative">
        <div className="mx-auto max-w-4xl relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-primary mb-8 tracking-tight">Launch your direct-booking site today</h2>
          <p className="text-lg text-secondary/70 mb-12 max-w-2xl mx-auto font-medium">
            Join hundreds of visionary property owners who have taken back control of their data, brand, and profits.
          </p>
          
          <div className="flex flex-col items-center gap-6">
            <Link
              href="/partner/onboarding"
              className="btn btn-primary px-16 py-5 text-base font-extrabold uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 w-full sm:w-auto flex items-center justify-center gap-2 group transition-all"
            >
              <span>Launch Your Property</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <p className="text-xs font-bold text-secondary/50 uppercase tracking-widest flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-1"><span className="text-success">&bull;</span> Live in 24h</span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1"><span className="text-success">&bull;</span> Zero Platform Shares</span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1"><span className="text-success">&bull;</span> Cancel Subscription Anytime</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

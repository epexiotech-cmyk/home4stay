import { headers } from "next/headers";
import { getSubdomain } from "@/lib/utils/domains";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Search, Globe } from "lucide-react";
import StickyHeader from "@/components/property/StickyHeader";
import Logo from "@/components/ui/Logo";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { BookingProvider } from "@/context/BookingContext";
import { resolvePropertyContext, getPropertyBranding } from "@/lib/tenant/contextResolver";

export default async function PropertyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await resolvePropertyContext(slug);

  if (!property) {
    notFound();
  }

  const branding = getPropertyBranding(property);

  const headersList = await headers();
  const host = headersList.get("host") || "";
  
  const subdomain = getSubdomain(host);
  const isSubdomain = !!subdomain;

  // If accessed from the main domain, show the default Navbar and Footer
  if (!isSubdomain) {
    return (
      <BookingProvider initialPropertyId={property.id}>
        <Navbar />
        <main className="pt-28">
          {children}
        </main>
        <Footer />
      </BookingProvider>
    );
  }

  return (
    <BookingProvider initialPropertyId={property.id}>
      <ThemeProvider theme={branding.theme}>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: ${branding.theme.primary};
            --secondary: ${branding.theme.secondary};
            --accent: ${branding.theme.accent};
            --theme-bg: ${branding.theme.background || "#ffffff"};
          }
        `}} />
        <div className="flex flex-col min-h-screen bg-theme-bg">
          <StickyHeader name={property.name} />

          <main className="flex-1">
            {children}
          </main>

        <footer className="w-full z-10 mt-0">
          <div className="w-full px-6 md:px-10 lg:px-20 py-16 md:py-24 border-t border-[var(--border)] bg-[var(--theme-bg)]">
            <div className="max-w-[1440px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1">
                  <h3 className="font-black text-xl text-[var(--text)] mb-4">{property.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed font-medium">{property.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--text)] mb-6 uppercase tracking-widest">Support</h4>
                  <ul className="space-y-4 text-sm font-bold text-[var(--text-muted)]">
                    <li><Link href="#" className="hover:text-primary transition-all">Help Center</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-all">Safety Information</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-all">Cancellation Options</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--text)] mb-6 uppercase tracking-widest">Community</h4>
                  <ul className="space-y-4 text-sm font-bold text-[var(--text-muted)]">
                    <li><Link href="#" className="hover:text-primary transition-all">Home4Stay.homes</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-all">Combating discrimination</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--text)] mb-6 uppercase tracking-widest">Hosting</h4>
                  <ul className="space-y-4 text-sm font-bold text-[var(--text-muted)]">
                    <li><Link href="#" className="hover:text-primary transition-all">Host your home</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-all">Host an Experience</Link></li>
                    <li><Link href="#" className="hover:text-primary transition-all">Responsible hosting</Link></li>
                  </ul>
                </div>
              </div>
              <div className="mt-12 pt-10 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="max-w-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black text-[var(--text-subtle)] uppercase tracking-[0.2em]">Powered by</span>
                    <Logo variant="full" size="sm" link={false} className="transition-all duration-500" />
                  </div>
                  <p className="text-[11px] font-bold text-[var(--text-subtle)] leading-relaxed max-w-md">
                    Home4Stay is a premium platform for unique stays, villas, and homestays across India. 
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-[10px] font-black text-[var(--text-subtle)] uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-primary/40" /> Verified properties</span>
                    <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-primary/40" /> Secure booking</span>
                    <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-primary/40" /> Trusted by travelers</span>
                  </div>
                </div>
                <Link 
                  href="https://home4stay.homes" 
                  target="_blank"
                  className="group flex items-center gap-4 bg-[var(--bg-secondary)] hover:bg-theme-primary/5 px-6 py-4 rounded-2xl border border-[var(--border)] transition-all duration-300"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-black text-[var(--text-subtle)] uppercase tracking-widest mb-0.5 group-hover:text-theme-primary/60 transition-colors">Find your next trip</span>
                    <span className="text-xs font-black text-[var(--text)] group-hover:text-theme-primary transition-colors">Explore more stays</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[var(--card-solid)] border border-[var(--border)] flex items-center justify-center group-hover:bg-theme-primary group-hover:border-theme-primary group-hover:scale-110 transition-all shadow-sm">
                    <Search size={14} className="text-[var(--text-subtle)] group-hover:text-white transition-colors" />
                  </div>
                </Link>
              </div>

              <div className="mt-16 pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-medium tracking-wide text-[var(--text-subtle)]">
                  <p>© 2026 {property.name}, Inc.</p>
                  <span className="hidden md:inline opacity-20">·</span>
                  <Link href="#" className="hover:underline hover:text-[var(--text)] transition-colors">Privacy</Link>
                  <span className="hidden md:inline opacity-20">·</span>
                  <Link href="#" className="hover:underline hover:text-[var(--text)] transition-colors">Terms</Link>
                  <span className="hidden md:inline opacity-20">·</span>
                  <Link href="#" className="hover:underline hover:text-[var(--text)] transition-colors">Sitemap</Link>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-muted)]">
                    <Globe size={14} />
                    <span>English (IN)</span>
                  </div>
                  <div className="text-[11px] font-black text-[var(--text)] tracking-tighter">
                    ₹ INR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      </ThemeProvider>
    </BookingProvider>
  );
}

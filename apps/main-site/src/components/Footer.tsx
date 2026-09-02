import Logo from "./ui/Logo";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mx-auto mb-10 w-[95vw] z-10">
      <div className="mx-auto px-8 md:px-12 py-10 rounded-[3rem] border border-[var(--border)] bg-[var(--card)] backdrop-blur-xl shadow-[0_20px_50px_var(--shadow)]">
        <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">
          <div className="flex flex-col gap-4 sm:items-start text-center sm:text-left">
            <Logo variant="full" size="md" />
            <p className="text-sm font-medium text-[var(--text-muted)]">
              © 2026 Home4Stay. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm font-bold text-[var(--text-subtle)]">
              <Link href="/privacy" className="hover:text-primary transition-all duration-300 hover:underline">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-primary transition-all duration-300 hover:underline">
                Terms
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <Link href="/explore" className="text-sm font-bold text-[var(--text-muted)] hover:text-theme-primary transition-all duration-300">
              Explore
            </Link>
            <Link href="/partner" className="text-sm font-bold text-[var(--text-muted)] hover:text-theme-primary transition-all duration-300">
              Partner
            </Link>
            <Link href="/help" className="text-sm font-bold text-[var(--text-muted)] hover:text-theme-primary transition-all duration-300">
              Help Center
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

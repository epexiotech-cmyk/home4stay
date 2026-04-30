import Logo from "./ui/Logo";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface-alt py-12">
      <div className="mx-auto max-w-full px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col gap-4 sm:items-start">
            <Logo variant="full" size="sm" />
            <p className="text-sm text-secondary">
              © 2026 Home4Stay. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-secondary/60">
              <Link href="/privacy" className="hover:text-primary transition-all duration-300">
                Privacy
              </Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-primary transition-all duration-300">
                Terms
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/explore" className="text-sm text-secondary hover:text-primary transition-all duration-300">
              Explore
            </Link>
            <Link href="/partner" className="text-sm text-secondary hover:text-primary transition-all duration-300">
              Partner
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

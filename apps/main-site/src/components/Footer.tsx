import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex flex-col gap-2 sm:items-start">
            <p className="text-sm text-zinc-500">
              © 2026 Home4Stay. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-zinc-400">
              <Link href="/privacy" className="hover:text-zinc-600 transition-colors">
                Privacy
              </Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-zinc-600 transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/explore" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              Explore
            </Link>
            <Link href="/partner" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
              Partner
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

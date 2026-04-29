import Link from "next/link";

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-zinc-100 bg-white">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <h1 className="text-lg font-bold uppercase tracking-widest text-zinc-900">
            Property Name
          </h1>
          <div className="flex items-center gap-6">
            <Link
              href="./"
              className="text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
            >
              Home
            </Link>
            <Link
              href="./rooms"
              className="text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
            >
              Rooms
            </Link>
            <Link
              href="./booking"
              className="text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
            >
              Booking
            </Link>
            <Link
              href="./about"
              className="text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
            >
              About
            </Link>
            <Link
              href="./contact"
              className="text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-900"
            >
              Contact
            </Link>
          </div>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

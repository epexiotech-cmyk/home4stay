import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="fixed top-0 left-0 right-0 h-48 bg-gradient-to-b from-background via-background/90 to-transparent z-40 pointer-events-none" />
      <Navbar />
      <main className="flex-1 pb-12 relative z-0">
        <div className="w-full mx-auto max-w-full">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}

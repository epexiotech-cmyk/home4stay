import Logo from "@/components/ui/Logo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="relative">
        {/* Pulsing Logo */}
        <Logo variant="icon" size="lg" link={false} className="animate-pulse" />
        
        {/* Spinning border effect */}
        <div className="absolute inset-0 -m-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
      
      <p className="mt-12 text-sm font-medium text-secondary tracking-widest uppercase animate-pulse">
        Loading Experiences...
      </p>
    </div>
  );
}

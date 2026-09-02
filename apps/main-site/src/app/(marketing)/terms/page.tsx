import { LegalService } from "@/lib/legal/legalService";
import { sanitizeHtml } from "@/lib/legal/sanitizer";
import Link from "next/link";
import { ShieldAlert, Calendar, FileText } from "lucide-react";

export const revalidate = 0; // Dynamic server rendering to reflect super-admin updates instantly

export default async function TermsPage() {
  const doc = await LegalService.getActiveDocument("TERMS_AND_CONDITIONS");
  const sanitizedContent = doc ? sanitizeHtml(doc.content) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FDF6F1] to-[#F7EFE9] dark:from-[#05141C] dark:to-[#092430] py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#0983B0]/10 selection:text-[#0983B0] transition-colors duration-500">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Breadcrumb / Navigation */}
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-[#0983B0]/80">
          <Link href="/" className="hover:text-[#0E5A75] dark:hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#053344] dark:text-white">Terms of Service</span>
        </div>

        {/* Dynamic Title Header Banner */}
        <div className="p-8 md:p-12 rounded-[32px] bg-white/60 dark:bg-[#0A3444]/40 backdrop-blur-xl border border-white dark:border-[#0E5A75]/20 shadow-xl shadow-[#0E5A75]/5 dark:shadow-none flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E5A75]/5 dark:bg-[#0983B0]/10 text-[#0E5A75] dark:text-[#0983B0] border border-[#0E5A75]/10 dark:border-[#0983B0]/20">
              <ShieldAlert size={14} className="text-[#FCBC43]" />
              <span className="text-[10px] font-black uppercase tracking-wider">Compliance &amp; Operations</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#053344] dark:text-white">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs md:text-sm font-semibold text-[#29655C] dark:text-[#0983B0] uppercase tracking-wider">
              Home4Stay Guest &amp; Partner Platform Agreement
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 bg-[#0E5A75]/5 dark:bg-white/5 p-4 rounded-2xl border border-[#0E5A75]/10 dark:border-white/5">
            <span className="text-[9px] text-[#0E5A75]/60 dark:text-white/40 uppercase font-black tracking-widest">Active Version</span>
            <span className="text-base font-black text-[#053344] dark:text-white tracking-wider">
              v{doc?.version || "1.0.0"}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-secondary/60 dark:text-white/40 font-bold mt-1">
              <Calendar size={12} />
              <span>Effective: {doc?.publishedAt ? new Date(doc.publishedAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' }) : "System Initial"}</span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-8 md:p-12 rounded-[32px] bg-white dark:bg-[#072430]/60 backdrop-blur-xl border border-white dark:border-[#0E5A75]/10 shadow-2xl shadow-[#0E5A75]/5 dark:shadow-none">
          {sanitizedContent ? (
            <div 
              className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-[#0E5A75]/80 dark:text-white/70 space-y-6 legal-content-render"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-[#0E5A75]/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto text-[#0E5A75] dark:text-[#0983B0]">
                <FileText size={28} />
              </div>
              <h3 className="text-lg font-black text-[#053344] dark:text-white uppercase tracking-widest">Document Pending</h3>
              <p className="text-xs text-secondary/60 dark:text-white/40 max-w-sm mx-auto leading-relaxed">
                The Terms &amp; Conditions are currently being updated by the compliance team. Please check back shortly.
              </p>
            </div>
          )}
        </div>

        {/* Platform Legal Links Footer */}
        <div className="pt-6 border-t border-[#0E5A75]/10 dark:border-white/5 flex flex-wrap gap-x-8 gap-y-4 text-xs font-black uppercase tracking-widest justify-center md:justify-start">
          <Link href="/privacy" className="text-[#0E5A75] dark:text-[#0983B0] hover:text-[#0983B0] dark:hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/refund-policy" className="text-[#0E5A75] dark:text-[#0983B0] hover:text-[#0983B0] dark:hover:text-white transition-colors">Refund Policy</Link>
          <Link href="/subscription-agreement" className="text-[#0E5A75] dark:text-[#0983B0] hover:text-[#0983B0] dark:hover:text-white transition-colors">Subscription Agreement</Link>
        </div>

      </div>
    </div>
  );
}

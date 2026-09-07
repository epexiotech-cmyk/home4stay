"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { 
  ShieldCheck, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  X, 
  Image as ImageIcon,
  Camera,
  RefreshCcw,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type KycStatus = "PENDING" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED" | "LOADING" | "ERROR";
type DocumentType = "AADHAAR" | "PASSPORT" | "DRIVING_LICENSE" | "VOTER_ID";

interface KycState {
  verificationStatus: KycStatus;
  documentType: DocumentType | null;
  hasFront: boolean;
  hasBack: boolean;
  hasSelfie: boolean;
  updatedAt: string | null;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("glass-matte rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-white/5 shadow-premium overflow-hidden", className)}>
    {children}
  </div>
);

export default function GuestKycPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const bookingId = params.bookingId as string;
  const expires = searchParams.get("expires") || "";
  const signature = searchParams.get("signature") || "";

  const [status, setStatus] = useState<KycStatus>("LOADING");
  const [errorMessage, setErrorMessage] = useState("");
  const [kycData, setKycData] = useState<KycState | null>(null);

  // Form State
  const [documentType, setDocumentType] = useState<DocumentType>("AADHAAR");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!expires || !signature) {
      setStatus("ERROR");
      setErrorMessage("Secure link is invalid or missing required parameters.");
      return;
    }
    fetchKycState();
  }, [bookingId, expires, signature]);

  const fetchKycState = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/kyc?expires=${expires}&signature=${signature}`);
      if (res.ok) {
        const data = await res.json();
        setKycData(data);
        setStatus(data.verificationStatus || "PENDING");
        if (data.documentType) {
          setDocumentType(data.documentType as DocumentType);
        }
      } else {
        const errorData = await res.json();
        setStatus("ERROR");
        setErrorMessage(errorData.message || "Failed to load KYC information.");
      }
    } catch (err) {
      console.error(err);
      setStatus("ERROR");
      setErrorMessage("Network error occurred while fetching KYC state.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }
    
    setter(file);
  };

  const removeFile = (setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    setter(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!frontFile) {
      alert("Document Front image is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("documentFront", frontFile);
      
      if (backFile) {
        formData.append("documentBack", backFile);
      }
      if (selfieFile) {
        formData.append("selfieImage", selfieFile);
      }

      const res = await fetch(`/api/bookings/${bookingId}/kyc?expires=${expires}&signature=${signature}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Refresh state
        await fetchKycState();
        // Clear local files
        setFrontFile(null);
        setBackFile(null);
        setSelfieFile(null);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to submit KYC documents.");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("A network error occurred during upload.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadBox = ({ 
    label, 
    description, 
    file, 
    setFile, 
    icon: Icon 
  }: { 
    label: string, 
    description: string, 
    file: File | null, 
    setFile: React.Dispatch<React.SetStateAction<File | null>>, 
    icon: any 
  }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
      <div className="w-full">
        <label className="text-xs font-black uppercase tracking-widest text-white/70 block mb-2">{label}</label>
        {file ? (
          <div className="p-4 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <FileText size={18} />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{file.name}</p>
                <p className="text-[10px] text-white/50 font-mono">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => removeFile(setFile)}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-6 border-2 border-dashed border-white/20 rounded-2xl hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
              <Icon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Click to Upload</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">{description}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-wider mt-2">JPEG, PNG, WEBP up to 5MB</p>
            </div>
          </div>
        )}
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileChange(e, setFile)}
        />
      </div>
    );
  };

  if (status === "LOADING") {
    return (
      <div className="min-h-screen bg-[#053344] flex items-center justify-center">
        <RefreshCcw size={32} className="text-[#FCBC43] animate-spin" />
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="min-h-screen bg-[#053344] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/15 flex items-center justify-center text-red-500 mb-6">
          <AlertTriangle size={36} />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tighter mb-4">Access Denied</h1>
        <p className="text-white/60 text-sm max-w-md mx-auto">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#053344] p-4 md:p-10 relative overflow-x-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#0E5A75]/30 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-2xl mx-auto relative z-10 space-y-8 pt-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-white mb-4">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2">Digital Check-in Preparation</h1>
          <p className="text-xs text-white/60 font-black uppercase tracking-widest">Verify your identity securely</p>
        </div>

        {status === "VERIFIED" && (
          <GlassCard className="text-center py-12 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#159665]/20 flex items-center justify-center text-[#159665] mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Identity Verified</h2>
            <p className="text-white/70 text-sm max-w-sm">
              Your KYC documents have been successfully verified. You are all set for a smooth check-in experience!
            </p>
          </GlassCard>
        )}

        {status === "UNDER_REVIEW" && (
          <GlassCard className="text-center py-12 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[#FCBC43]/20 flex items-center justify-center text-[#FCBC43] mb-6">
              <RefreshCcw size={40} className="animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Documents Under Review</h2>
            <p className="text-white/70 text-sm max-w-sm">
              Your identity documents have been securely submitted and are currently being reviewed by the property host.
            </p>
          </GlassCard>
        )}

        {(status === "PENDING" || status === "REJECTED") && (
          <GlassCard className="space-y-8">
            {status === "REJECTED" && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold">Verification Rejected</p>
                  <p className="text-xs opacity-80 mt-1">Please re-upload clearer images of your identity documents.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-white/70 block mb-3">Document Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "AADHAAR", label: "Aadhaar Card" },
                    { id: "PASSPORT", label: "Passport" },
                    { id: "DRIVING_LICENSE", label: "Driving License" },
                    { id: "VOTER_ID", label: "Voter ID" }
                  ].map(doc => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setDocumentType(doc.id as DocumentType)}
                      className={cn(
                        "py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border",
                        documentType === doc.id 
                          ? "bg-white text-[#053344] border-white shadow-lg" 
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {doc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-5 pt-4 border-t border-white/10">
                <FileUploadBox 
                  label="1. Document Front (Required)" 
                  description={`Upload clear image of ${documentType} front`}
                  file={frontFile}
                  setFile={setFrontFile}
                  icon={ImageIcon}
                />
                
                <FileUploadBox 
                  label="2. Document Back (Optional)" 
                  description={`Upload image of ${documentType} back (if applicable)`}
                  file={backFile}
                  setFile={setBackFile}
                  icon={ImageIcon}
                />
                
                <FileUploadBox 
                  label="3. Selfie Image (Optional)" 
                  description="Upload a clear picture of your face"
                  file={selfieFile}
                  setFile={setSelfieFile}
                  icon={Camera}
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit"
                  disabled={isSubmitting || !frontFile}
                  className="w-full py-4 rounded-[20px] bg-[#FCBC43] text-[#053344] text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#F2AE29] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCcw size={16} className="animate-spin" /> Submitting securely...
                    </>
                  ) : (
                    <>
                      Submit Documents <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
            <div className="text-center pt-2 flex items-center justify-center gap-2 text-white/40">
              <ShieldCheck size={12} />
              <p className="text-[9px] uppercase tracking-widest">End-to-End Encrypted Storage</p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}

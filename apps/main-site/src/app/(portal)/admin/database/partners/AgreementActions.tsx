"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function AgreementActions({ 
  propertyId, 
  hasAgreement 
}: { 
  propertyId: string;
  hasAgreement: boolean;
}) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Just redirect to the API route which sets Content-Disposition attachment
      window.location.href = `/api/admin/database/partners/download-agreement?propertyId=${propertyId}`;
    } catch (error) {
      console.error("Download failed", error);
      alert("Failed to download agreement.");
    } finally {
      // Small delay to allow download to start
      setTimeout(() => setIsDownloading(false), 1000);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("propertyId", propertyId);
      formData.append("file", file);

      const res = await fetch("/api/admin/database/partners/upload-agreement", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to upload");
      }

      router.refresh();
    } catch (error: any) {
      console.error("Upload failed", error);
      alert(error.message || "Failed to upload agreement.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {hasAgreement && (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
        >
          {isDownloading ? "..." : "Download"}
        </button>
      )}
      <input 
        type="file" 
        accept="application/pdf" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-3 py-1.5 bg-surface border border-border hover:bg-background text-secondary rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

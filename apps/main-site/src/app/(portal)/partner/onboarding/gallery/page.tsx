"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Check, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Crown, 
  Info,
  Layers
} from "lucide-react";
import { useOnboarding } from "@/context/OnboardingContext";
import { cn } from "@/lib/utils";
import { ValidationMessage } from "@/components/onboarding/FormComponents";

interface MediaAsset {
  id: string;
  url: string;
  fileName: string;
  assetType: string;
  fileSize: number;
  sortOrder: number;
}

interface UploadTask {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  errorMsg?: string;
  file: File;
  assetType: "LUXURY" | "GALLERY";
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function GalleryStepPage() {
  const { saveStepDraft, completeStep, stepErrors } = useOnboarding();
  const [luxuryAssets, setLuxuryAssets] = useState<MediaAsset[]>([]);
  const [galleryAssets, setGalleryAssets] = useState<MediaAsset[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragActiveLuxury, setDragActiveLuxury] = useState(false);
  const [dragActiveGallery, setDragActiveGallery] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const fileInputLuxuryRef = useRef<HTMLInputElement>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);

  const errors = stepErrors.gallery || {};

  // 1. Fetch existing property assets on mount
  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await fetch("/api/partner/media");
        const json = await res.json();
        if (json.success) {
          const sorted = (json.data?.media || []).sort((a: MediaAsset, b: MediaAsset) => a.sortOrder - b.sortOrder);
          
          const luxury = sorted.filter((a: MediaAsset) => a.assetType === "LUXURY");
          const gallery = sorted.filter((a: MediaAsset) => a.assetType === "GALLERY");
          
          setLuxuryAssets(luxury);
          setGalleryAssets(gallery);
          
          // Sync existing URLs with onboarding context to populate live preview instantly
          syncWithOnboardingContext(luxury, gallery, false);
        } else {
          setApiError(json.error?.message || json.error || "Failed to retrieve media library");
        }
      } catch (err) {
        console.error("Error loading media:", err);
        setApiError("Connection error. Could not retrieve media assets.");
      } finally {
        setLoading(false);
      }
    }
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync state changes with context drafts
  const syncWithOnboardingContext = (luxury: MediaAsset[], gallery: MediaAsset[], isExplicitUserAction = false) => {
    const urls = [...luxury, ...gallery].map(a => a.url);
    // Only write [] to the database if the user explicitly deleted images.
    // Never allow a failed fetch or empty mount to wipe database arrays.
    if (urls.length > 0 || isExplicitUserAction) {
      saveStepDraft("gallery", urls);
    }
  };

  // 2. Multi-File Selection & Validation Rules
  const handleFiles = async (files: FileList, assetType: "LUXURY" | "GALLERY") => {
    const newTasks: UploadTask[] = [];

    Array.from(files).forEach(file => {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Perform frontend size & format checks
      let status: UploadTask["status"] = "pending";
      let errorMsg: string | undefined = undefined;

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        status = "error";
        errorMsg = "Accepts JPEG, PNG, WebP, or GIF";
      } else if (file.size > MAX_FILE_SIZE) {
        status = "error";
        errorMsg = "File size exceeds 5MB limit";
      }

      newTasks.push({
        id,
        name: file.name,
        size: file.size,
        progress: status === "error" ? 0 : 5,
        status,
        errorMsg,
        file,
        assetType
      });
    });

    setUploadQueue(prev => [...prev, ...newTasks]);

    // Automatically trigger upload execution sequentially to prevent rate limits
    for (const task of newTasks) {
      if (task.status === "pending") {
        await uploadFileTask(task);
      }
    }
  };

  // 3. Centralized XHR Upload Execution with Real-Time Progress
  const uploadFileTask = (task: UploadTask): Promise<void> => {
    return new Promise((resolve) => {
      setUploadQueue(prev => 
        prev.map(t => t.id === task.id ? { ...t, status: "uploading" } : t)
      );

      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", task.file);
      formData.append("assetType", task.assetType);

    // Track upload progress natively in browser
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const progressPercentage = Math.round((event.loaded / event.total) * 100);
        setUploadQueue(prev => 
          prev.map(t => t.id === task.id ? { ...t, progress: Math.max(progressPercentage, 5) } : t)
        );
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const uploadedAsset = res.data?.asset;
          if (res.success && uploadedAsset) {
            setUploadQueue(prev => 
              prev.map(t => t.id === task.id ? { ...t, status: "success", progress: 100 } : t)
            );
            
            // Append newly uploaded asset to gallery list
            if (task.assetType === "LUXURY") {
              setLuxuryAssets(prev => {
                const updated = [...prev, uploadedAsset];
                syncWithOnboardingContext(updated, galleryAssets);
                return updated;
              });
            } else {
              setGalleryAssets(prev => {
                const updated = [...prev, uploadedAsset];
                syncWithOnboardingContext(luxuryAssets, updated);
                return updated;
              });
            }

            // Automatically clear successful items from upload queue after 2 seconds
            setTimeout(() => {
              setUploadQueue(prev => prev.filter(t => t.id !== task.id));
            }, 2000);
          } else {
            throw new Error(res.error || "Upload rejected");
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : "Upload failed";
          setUploadQueue(prev => 
            prev.map(t => t.id === task.id ? { ...t, status: "error", errorMsg } : t)
          );
        }
      } else {
        let errMsg = "Server connection lost";
        try {
          const res = JSON.parse(xhr.responseText);
          errMsg = res.error?.message || res.error || errMsg;
        } catch {}
        setUploadQueue(prev => 
          prev.map(t => t.id === task.id ? { ...t, status: "error", errorMsg: errMsg } : t)
        );
      }
      resolve();
    };

    xhr.onerror = () => {
      setUploadQueue(prev => 
        prev.map(t => t.id === task.id ? { ...t, status: "error", errorMsg: "Network interrupted" } : t)
      );
      resolve();
    };

    xhr.open("POST", "/api/partner/media", true);
    xhr.withCredentials = true;
    xhr.send(formData);
    });
  };

  // Retry failed upload handler
  const handleRetryUpload = (task: UploadTask) => {
    setUploadQueue(prev => 
      prev.map(t => t.id === task.id ? { ...t, status: "pending", progress: 5, errorMsg: undefined } : t)
    );
    uploadFileTask({ ...task, status: "pending" });
  };

  // Remove upload queue item manually
  const handleRemoveTask = (taskId: string) => {
    setUploadQueue(prev => prev.filter(t => t.id !== taskId));
  };

  // 4. Asset Actions: Delete
  const handleDeleteAsset = async (assetId: string, assetType: "LUXURY" | "GALLERY") => {
    try {
      const res = await fetch(`/api/partner/media?id=${assetId}`, {
        method: "DELETE", credentials: "include"
      });
      const json = await res.json();
      if (json.success) {
        if (assetType === "LUXURY") {
          setLuxuryAssets(prev => {
            const updated = prev.filter(a => a.id !== assetId);
            syncWithOnboardingContext(updated, galleryAssets);
            return updated;
          });
        } else {
          setGalleryAssets(prev => {
            const updated = prev.filter(a => a.id !== assetId);
            syncWithOnboardingContext(luxuryAssets, updated);
            return updated;
          });
        }
      } else {
        setApiError(json.error?.message || json.error || "Failed to delete media asset");
      }
    } catch {
      setApiError("Network error. Could not delete media asset.");
    }
  };

  // 5. Asset Actions: Set Primary Cover (Moves image to sort order index 0)
  const handleSetCover = async (assetIndex: number, assetType: "LUXURY" | "GALLERY") => {
    if (assetIndex === 0) return; // Already cover
    
    let targetList = assetType === "LUXURY" ? [...luxuryAssets] : [...galleryAssets];
    const targetAsset = targetList.splice(assetIndex, 1)[0];
    targetList.unshift(targetAsset);

    if (assetType === "LUXURY") {
      setLuxuryAssets(targetList);
      syncWithOnboardingContext(targetList, galleryAssets);
    } else {
      setGalleryAssets(targetList);
      syncWithOnboardingContext(luxuryAssets, targetList);
    }
    
    const reordered = targetList;

    // Save ordering to database
    try {
      const ids = reordered.map(a => a.id);
      await fetch("/api/partner/media", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
    } catch (err) {
      console.error("Failed to persist cover order:", err);
    }
  };

  // 6. Native HTML5 Drag and Drop Reordering Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragIndexRef.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, index: number, assetType: "LUXURY" | "GALLERY") => {
    const sourceIndex = dragIndexRef.current;
    if (sourceIndex === null || sourceIndex === index) return;

    let shuffled = assetType === "LUXURY" ? [...luxuryAssets] : [...galleryAssets];
    const sourceAsset = shuffled.splice(sourceIndex, 1)[0];
    shuffled.splice(index, 0, sourceAsset);

    // Reset references
    dragIndexRef.current = null;

    // Optimistically update frontend
    if (assetType === "LUXURY") {
      setLuxuryAssets(shuffled);
      syncWithOnboardingContext(shuffled, galleryAssets);
    } else {
      setGalleryAssets(shuffled);
      syncWithOnboardingContext(luxuryAssets, shuffled);
    }

    // Persist new layout list to database
    try {
      const ids = shuffled.map(a => a.id);
      await fetch("/api/partner/media", {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids })
      });
    } catch (err) {
      console.error("Failed to save reorder state:", err);
    }
  };

  // 7. Drag-and-drop area state helpers
  const handleDragLuxury = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActiveLuxury(true);
    else if (e.type === "dragleave") setDragActiveLuxury(false);
  };
  const handleDropFileLuxury = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveLuxury(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files, "LUXURY");
  };
  const triggerFileSelectLuxury = () => fileInputLuxuryRef.current?.click();

  const handleDragGallery = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActiveGallery(true);
    else if (e.type === "dragleave") setDragActiveGallery(false);
  };
  const handleDropFileGallery = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveGallery(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files, "GALLERY");
  };
  const triggerFileSelectGallery = () => fileInputGalleryRef.current?.click();


  const renderUploadQueue = (assetType: "LUXURY" | "GALLERY") => {
    const filteredQueue = uploadQueue.filter(t => t.assetType === assetType);
    if (filteredQueue.length === 0) return null;
    return (
      <div className="space-y-3 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-border">
          <div className="flex justify-between items-center pb-2 border-b border-border/50">
            <span className="text-[9px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin text-primary" />
              <span>Uploading Queue ({filteredQueue.length} Active)</span>
            </span>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-hide">
            {filteredQueue.map(task => (
              <div key={task.id} className="text-[10px] font-medium text-secondary space-y-1.5">
                <div className="flex justify-between items-center gap-4">
                  <span className="truncate max-w-[200px] font-bold">{task.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[8px] text-secondary/40">{(task.size / 1024 / 1024).toFixed(2)}MB</span>
                    {task.status === "uploading" && <span className="text-primary font-black uppercase text-[8px] tracking-wider animate-pulse">Uploading...</span>}
                    {task.status === "success" && <span className="text-success font-black uppercase text-[8px] tracking-wider flex items-center gap-0.5"><Check size={10} className="stroke-[3px]" /> Success</span>}
                    {task.status === "error" && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-error font-black uppercase text-[8px] tracking-wider">{task.errorMsg || "Failed"}</span>
                        {task.errorMsg !== "File size exceeds 5MB limit" && task.errorMsg !== "Accepts JPEG, PNG, WebP, or GIF" && (
                          <button onClick={(e) => { e.stopPropagation(); handleRetryUpload(task); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-600"><RefreshCw size={10} /></button>
                        )}
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveTask(task.id); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-secondary/40 hover:text-error"><X size={10} /></button>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-300 rounded-full", task.status === "error" ? "bg-error" : task.status === "success" ? "bg-success" : "bg-primary")} style={{ width: `${task.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
    );
  };

  const renderAssetGrid = (assets: MediaAsset[], type: "LUXURY" | "GALLERY") => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-1.5">
            <Layers size={14} className="text-primary" />
            <span>{type === "LUXURY" ? "Luxury Images" : "Active Property Gallery"} ({assets.length} Photos)</span>
          </span>
          {assets.length > 0 && (
            <span className="text-[8px] font-bold text-secondary/40 uppercase tracking-widest">
              Drag to re-order &bull; Top left photo is primary cover
            </span>
          )}
        </div>
        {assets.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {assets.map((asset, index) => {
              const isCover = index === 0;
              return (
                <div 
                  key={asset.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e)}
                  onDrop={(e) => handleDrop(e, index, type)}
                  className={cn(
                    "group relative aspect-[4/3] rounded-2xl overflow-hidden border bg-slate-50 cursor-grab active:cursor-grabbing hover-lift transition-all duration-300 select-none",
                    isCover ? "border-[#FCBC43] ring-4 ring-[#FCBC43]/15" : "border-border"
                  )}
                >
                  <img src={asset.url} alt={asset.fileName} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent flex flex-col justify-between p-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex justify-between items-start gap-2">
                      {isCover ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FCBC43] text-black text-[8px] font-black uppercase tracking-wider shadow-sm">
                          <Crown size={9} className="fill-black" />
                          <span>Cover Photo</span>
                        </div>
                      ) : (
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleSetCover(index, type); }} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-slate-800 hover:bg-[#FCBC43] hover:text-black text-[8px] font-black uppercase tracking-wider shadow-sm transition-all">
                          <Crown size={9} />
                          <span>Make Cover</span>
                        </button>
                      )}
                      <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteAsset(asset.id, type); }} className="w-6 h-6 rounded-full bg-white/95 backdrop-blur-sm text-slate-500 hover:text-error hover:bg-white flex items-center justify-center shadow-sm transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[7px] font-bold text-white/70 uppercase tracking-widest px-1.5 py-0.5 bg-black/45 rounded-md">{asset.assetType || "Gallery"}</span>
                      <h4 className="text-[10px] font-black text-white leading-tight mt-1 truncate max-w-full">{asset.fileName}</h4>
                    </div>
                  </div>
                  {isCover && (
                    <div className="absolute top-4 left-4 sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FCBC43] text-black text-[8px] font-black uppercase tracking-wider shadow-sm group-hover:hidden transition-all duration-300">
                      <Crown size={9} className="fill-black" />
                      <span>Cover</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-2xl p-10 text-center space-y-3">
            <ImageIcon className="text-slate-300 mx-auto animate-pulse" size={28} />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-secondary uppercase tracking-wider">No photos uploaded yet</h4>
              <p className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest">
                Upload your first {type === "LUXURY" ? "premium stay visual" : "gallery photo"}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 8. Wizard Setup Navigation
  const handleContinue = async () => {
    await completeStep("gallery");
  };

  // Graceful loading visual skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
        <div className="h-10 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-44 bg-slate-100 dark:bg-slate-900 rounded-2xl border" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 select-none">
      
      {/* Step Indicator */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
        <ImageIcon size={14} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 7: Media Gallery</span>
      </div>

      <div className="space-y-3">
        <h2 className="text-3xl font-extrabold text-primary tracking-tight">Luxury Storytelling Media</h2>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">
          Visual assets dictate direct booking choices. Upload high-resolution photos of your rooms, views, and architecture. Drag to re-order and select a cover showcase.
        </p>
      </div>

      {apiError && (
        <div className="p-4 bg-error/5 border border-error/15 text-error text-[11px] font-bold rounded-xl flex items-center justify-between">
          <span>{apiError}</span>
          <button onClick={() => setApiError(null)} className="hover:text-error-hover">
            <X size={14} />
          </button>
        </div>
      )}

      {errors.general && <ValidationMessage error={errors.general} />}

      {/* 1. INTERACTIVE DRAG & DROP UPLOAD ZONE (LUXURY) */}
      <div 
        onDragEnter={handleDragLuxury}
        onDragOver={handleDragLuxury}
        onDragLeave={handleDragLuxury}
        onDrop={handleDropFileLuxury}
        onClick={triggerFileSelectLuxury}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group select-none",
          dragActiveLuxury 
            ? "border-primary bg-primary/5 ring-4 ring-primary/10 scale-[1.01]" 
            : "border-border hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
        )}
      >
        <input 
          ref={fileInputLuxuryRef}
          type="file" 
          multiple
          accept="image/*"
          className="hidden" 
          onChange={(e) => e.target.files && handleFiles(e.target.files, "LUXURY")}
        />
        
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:text-primary transition-all duration-300",
          dragActiveLuxury && "bg-primary/10 text-primary scale-110"
        )}>
          <Upload size={20} className={cn(dragActiveLuxury && "animate-bounce")} />
        </div>

        <h4 className="text-xs font-black text-secondary uppercase tracking-wider mt-4">
          {dragActiveLuxury ? "Drop luxury photos here" : "Drag & Drop Luxury Photos"}
        </h4>
        
        <p className="text-[10px] font-medium text-secondary/40 mt-1">
          Or click to browse from local computer
        </p>

        <span className="text-[8px] font-bold text-secondary/30 uppercase tracking-widest mt-3 flex items-center gap-1">
          <span>Max file size: 5MB</span>
          <span>&bull;</span>
          <span>Formats: JPEG, PNG, WebP, GIF</span>
        </span>
      </div>

{renderUploadQueue("LUXURY")}




      {renderAssetGrid(luxuryAssets, "LUXURY")}

      <hr className="border-border my-8" />

      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-primary tracking-tight">Active Property Gallery</h3>
        <p className="text-xs font-medium text-secondary/60 leading-relaxed max-w-xl">Upload general property media to be displayed in the property details page.</p>
      </div>

      <div 
        onDragEnter={handleDragGallery}
        onDragOver={handleDragGallery}
        onDragLeave={handleDragGallery}
        onDrop={handleDropFileGallery}
        onClick={triggerFileSelectGallery}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group select-none",
          dragActiveGallery 
            ? "border-primary bg-primary/5 ring-4 ring-primary/10 scale-[1.01]" 
            : "border-border hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/10"
        )}
      >
        <input 
          ref={fileInputGalleryRef}
          type="file" 
          multiple
          accept="image/*"
          className="hidden" 
          onChange={(e) => e.target.files && handleFiles(e.target.files, "GALLERY")}
        />
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:text-primary transition-all duration-300", dragActiveGallery && "bg-primary/10 text-primary scale-110")}>
          <Upload size={20} className={cn(dragActiveGallery && "animate-bounce")} />
        </div>
        <h4 className="text-xs font-black text-secondary uppercase tracking-wider mt-4">
          {dragActiveGallery ? "Drop gallery photos here" : "Drag & Drop Gallery Photos"}
        </h4>
        <p className="text-[10px] font-medium text-secondary/40 mt-1">Or click to browse from local computer</p>
        <span className="text-[8px] font-bold text-secondary/30 uppercase tracking-widest mt-3 flex items-center gap-1">
          <span>Max file size: 5MB</span><span>&bull;</span><span>Formats: JPEG, PNG, WebP, GIF</span>
        </span>
      </div>
      {renderUploadQueue("GALLERY")}
      {renderAssetGrid(galleryAssets, "GALLERY")}

      {/* 4. Wizard SETUP NEXT Navigation */}
      <div className="flex justify-between items-center pt-4">
        <span className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest flex items-center gap-1.5">
          <Info size={14} className="text-[#FCBC43]" />
          <span>Properties with high-quality photos get 4x more bookings</span>
        </span>
        
        <button
          onClick={handleContinue}
          className="btn btn-primary px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary-hover flex items-center gap-2 group shadow-md"
        >
          <span>Continue Setup</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}

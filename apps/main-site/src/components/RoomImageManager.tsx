import React, { useState, useEffect, useRef } from "react";
import { Loader2, Trash2, Image as ImageIcon, UploadCloud, X } from "lucide-react";

interface MediaAsset {
  id: string;
  url: string;
}

export default function RoomImageManager({ roomId }: { roomId: string }) {
  const [images, setImages] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      const res = await fetch(`/api/property/room/${roomId}/images`);
      if (res.ok) {
        const { data } = await res.json();
        setImages(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [roomId]);

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;
    setDeletingId(imageId);
    try {
      const res = await fetch(`/api/property/room/${roomId}/images/${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await fetchImages();
    } catch (err) {
      alert("Failed to delete image.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      const validFiles = files.filter(f => {
        if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
          alert(`Invalid file type: ${f.name}. Only JPEG, PNG, WebP allowed.`);
          return false;
        }
        if (f.size > 5 * 1024 * 1024) {
          alert(`File too large: ${f.name}. Max 5MB.`);
          return false;
        }
        return true;
      });

      const remainingSlots = 12 - images.length;
      if (selectedFiles.length + validFiles.length > remainingSlots) {
        alert(`Maximum of ${remainingSlots} more images allowed.`);
        const allowed = validFiles.slice(0, remainingSlots - selectedFiles.length);
        setSelectedFiles(prev => [...prev, ...allowed]);
      } else {
        setSelectedFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => formData.append("images", file));

      const res = await fetch(`/api/property/room/${roomId}/images`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || data.message || "Failed to upload");

      setSelectedFiles([]);
      await fetchImages();
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const remainingSlots = 12 - images.length;

  return (
    <div className="mt-4 p-5 bg-white/5 border border-white/10 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75] dark:text-white flex items-center gap-1.5">
            <ImageIcon size={12} /> Room Images
          </h4>
          <p className="text-[9px] text-[#0E5A75]/60 dark:text-white/50 mt-1">
            {isLoading ? "Loading..." : `${images.length} / 12 photos uploaded`}
          </p>
        </div>
        {!isLoading && remainingSlots > 0 && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || deletingId !== null}
            className="px-3 py-1.5 bg-[#0983B0]/10 text-[#0983B0] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0983B0] hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <UploadCloud size={12} /> Add Photos
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg, image/png, image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {!isLoading && images.length === 0 && selectedFiles.length === 0 && (
        <div className="text-center p-6 bg-black/5 dark:bg-white/5 rounded-xl border border-dashed border-white/10">
          <ImageIcon size={24} className="mx-auto text-[#0E5A75]/30 dark:text-white/30 mb-2" />
          <p className="text-[10px] font-bold text-[#0E5A75]/60 dark:text-white/60">No photos found</p>
        </div>
      )}

      {(images.length > 0 || selectedFiles.length > 0) && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-4">
          {images.map(img => (
            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/20">
              <img src={img.url} alt="Room" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(img.id)}
                  disabled={deletingId === img.id}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deletingId === img.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </button>
              </div>
            </div>
          ))}

          {selectedFiles.map((file, idx) => (
            <div key={`sel-${idx}`} className="relative group aspect-square rounded-xl overflow-hidden border border-dashed border-white/30 opacity-70">
              <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => removeSelectedFile(idx)}
                  disabled={isUploading}
                  className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="absolute bottom-1 right-1 bg-black/70 px-1 rounded text-[8px] text-white">Pending</div>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-[#0E5A75] hover:bg-[#0983B0] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {isUploading ? "Uploading..." : `Upload ${selectedFiles.length} Photos`}
        </button>
      )}
    </div>
  );
}

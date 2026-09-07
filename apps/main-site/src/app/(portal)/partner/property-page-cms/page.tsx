/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layout, 
  Image as ImageIcon, 
  Sparkles, 
  HelpCircle, 
  Search, 
  Save, 
  Eye, 
  Globe,
  ChevronRight,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  Type,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { ICON_MAP } from "@/lib/experiences-config";

type TabType = "identity" | "hero" | "gallery" | "amenities" | "faqs" | "seo";

export default function PartnerCmsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("identity");
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [cmsData, setCmsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const propertyId = user?.propertyId || "shivay";

  useEffect(() => {
    async function fetchCmsData() {
      try {
        const res = await fetch(`/api/property/cms?propertyId=${propertyId}`);
        if (res.ok) {
          const data = await res.json();
          setCmsData(data);
        }
        const vRes = await fetch(`/api/property/${propertyId}/cms/publish`);
        if (vRes.ok) {
          const vData = await vRes.json();
          setVersions(vData.versions || []);
        }
      } catch (err) {
        console.error("Failed to fetch CMS data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCmsData();
  }, [propertyId]);


  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/property/${propertyId}/cms/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionName: `Release Build  ${new Date().toLocaleDateString()}`,
          snapshotPayload: cmsData
        })
      });
      if (res.ok) {
        setIsPublished(true);
        setTimeout(() => setIsPublished(false), 3000);
        // Refresh versions
        const vRes = await fetch(`/api/property/${propertyId}/cms/publish`);
        if (vRes.ok) {
          const vData = await vRes.json();
          setVersions(vData.versions || []);
        }
      }
    } catch (err) {
      console.error("Failed to publish CMS data:", err);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePreview = async () => {
    try {
      const res = await fetch(`/api/property/${propertyId}/cms/preview`);
      if (res.ok) {
        const data = await res.json();
        const token = data.previewToken;
        window.open(`https://${cmsData?.name?.toLowerCase().replace(/\s+/g, '')}.home4stay.com?draft=${token}`, '_blank');
      }
    } catch (err) {
      console.error("Preview generation failed", err);
    }
  };

  const handleRestore = async (versionId: string) => {
    setIsRestoring(true);
    try {
      const res = await fetch(`/api/property/${propertyId}/cms/restore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionId })
      });
      if (res.ok) {
        // Refresh CMS Data
        const cmsRes = await fetch(`/api/property/cms?propertyId=${propertyId}`);
        if (cmsRes.ok) {
          setCmsData(await cmsRes.json());
        }
        alert("Draft restored successfully. You can now preview and publish.");
      }
    } catch (err) {
      console.error("Restore failed", err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/property/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          ...cmsData
        })
      });
      if (res.ok) {
        // Saved draft successfully
      }
    } catch (err) {
      console.error("Failed to save CMS data:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCcw className="animate-spin text-[#0E5A75]" size={32} />
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: "identity", label: "Identity", icon: Palette },
    { id: "hero", label: "Hero & Narrative", icon: Layout },
    { id: "gallery", label: "Visual Gallery", icon: ImageIcon },
    { id: "amenities", label: "Amenities", icon: Sparkles },
    { id: "faqs", label: "FAQs & Rules", icon: HelpCircle },
    { id: "seo", label: "SEO & Google", icon: Search },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#053344] dark:text-white tracking-tighter leading-none mb-3">Property CMS</h1>
          <p className="text-sm font-bold text-[#0E5A75]/60 uppercase tracking-widest flex items-center gap-2">
            <Globe size={14} className="text-[#0983B0]" />
            Live Preview Site: <span className="text-[#0E5A75] underline">{cmsData?.name}.home4stay.com</span>
          </p>
        </div>
        
        
        <div className="flex items-center gap-3">
          <button onClick={handlePreview} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0E5A75]/5 text-[#0E5A75] font-black text-xs uppercase tracking-widest hover:bg-[#0E5A75]/10 transition-all border border-[#0E5A75]/10">
            <Eye size={16} />
            Preview Draft
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl bg-white text-[#0E5A75] border border-[#0E5A75]"
            )}
          >
            {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl",
              isPublished ? "bg-[#159665] text-white" : "bg-[#0E5A75] hover:bg-[#0A4459] text-white"
            )}
          >
            {isPublishing ? <RefreshCcw size={16} className="animate-spin" /> : (isPublished ? <CheckCircle2 size={16} /> : <Globe size={16} />)}
            {isPublishing ? "Publishing..." : (isPublished ? "Live" : "Publish Live")}
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="xl:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between p-5 rounded-3xl transition-all duration-300 group relative overflow-hidden",
                activeTab === tab.id 
                  ? "bg-[#0E5A75] text-white shadow-xl translate-x-2" 
                  : "bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 text-[#0E5A75] dark:text-[#0983B0] hover:bg-[#0E5A75]/5"
              )}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  activeTab === tab.id ? "bg-white/20" : "bg-[#0E5A75]/5"
                )}>
                  <tab.icon size={20} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">{tab.label}</span>
              </div>
              <ChevronRight size={18} className={cn("transition-transform", activeTab === tab.id ? "rotate-90" : "group-hover:translate-x-1")} />
              
              {activeTab === tab.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
              )}
            </button>
          ))}
          
          <div className="p-8 rounded-[40px] bg-[#FCBC43]/10 border border-[#FCBC43]/20 mt-8">
            <div className="flex items-center gap-3 text-[#B8860B] mb-3">
              <AlertCircle size={20} />
              <span className="text-xs font-black uppercase tracking-widest">CMS Integrity</span>
            </div>
            <p className="text-[10px] font-bold text-[#B8860B]/70 leading-relaxed uppercase tracking-tighter">
              Changes are saved to draft. You must explicitly publish to make them live.
            </p>
          </div>
          <div className="p-8 rounded-[40px] bg-[#0E5A75]/5 border border-[#0E5A75]/10 mt-8">
            <div className="flex items-center gap-3 text-[#0E5A75] mb-3">
              <RefreshCcw size={20} />
              <span className="text-xs font-black uppercase tracking-widest">History</span>
            </div>
            <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
              {versions.map((v, i) => (
                <div key={v.id} className="p-3 bg-white rounded-xl flex justify-between items-center shadow-sm">
                   <div>
                     <p className="text-[10px] font-bold text-[#053344]">{new Date(v.createdAt).toLocaleDateString()}</p>
                     <p className="text-[9px] text-[#0E5A75]/60 uppercase">{v.versionName || "Snapshot"}</p>
                   </div>
                   <button 
                     disabled={isRestoring}
                     onClick={() => handleRestore(v.id)}
                     className="text-[9px] font-bold text-[#0983B0] hover:underline"
                   >
                     Restore
                   </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Content Area */}
        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-[#0b1220] rounded-[48px] border border-black/5 dark:border-white/5 shadow-luxury-sm overflow-hidden min-h-[600px]"
            >
              {activeTab === "identity" && <IdentitySection data={cmsData} setData={setCmsData} />}
              {activeTab === "hero" && <HeroSection data={cmsData} setData={setCmsData} />}
              {activeTab === "amenities" && <AmenitiesSection data={cmsData} setData={setCmsData} />}
              {activeTab === "faqs" && <FaqSection data={cmsData} setData={setCmsData} />}
              {activeTab === "seo" && <SeoSection data={cmsData} setData={setCmsData} />}
              {activeTab === "gallery" && <GallerySection data={cmsData} setData={setCmsData} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Sub-components for CMS sections

function IdentitySection({ data, setData }: { data: any; setData: (data: any) => void }) {
  return (
    <div className="p-10 space-y-10">
      <SectionHeader title="Property Identity" desc="Manage your brand's core presence and visual identifiers." />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CmsInput 
          label="Property Name" 
          value={data?.name} 
          onChange={(v) => setData({...data, name: v})} 
        />
        <CmsInput 
          label="Primary Theme Color" 
          type="color"
          value={data?.branding?.theme?.primary || "#0E5A75"} 
          onChange={(v) => setData({...data, branding: {...data.branding, theme: {...data.branding.theme, primary: v}}})} 
        />
      </div>

      <div className="space-y-4">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]/60 ml-4">Property Logo (Dark & Light compatible)</label>
        <div className="p-10 rounded-[40px] border-2 border-dashed border-[#0E5A75]/10 flex flex-col items-center justify-center gap-4 bg-[#0E5A75]/5 hover:bg-[#0E5A75]/10 transition-all cursor-pointer">
          <Plus size={32} className="text-[#0E5A75]/40" />
          <p className="text-xs font-black text-[#0E5A75] uppercase tracking-widest">Upload Luxury Logo</p>
          <p className="text-[10px] text-[#0E5A75]/40 uppercase tracking-widest font-bold">SVG or PNG Preferred (Transparent Background)</p>
        </div>
      </div>
    </div>
  );
}

function HeroSection({ data, setData }: { data: any; setData: (data: any) => void }) {
  return (
    <div className="p-10 space-y-10">
      <SectionHeader title="Hero & Narrative" desc="The first thing guests see. Craft a cinematic entrance." />
      
      <div className="space-y-8">
        <CmsInput 
          label="Hero Title" 
          placeholder="e.g. A Sanctuary Above The Clouds"
          value={data?.branding?.heroTitle} 
          onChange={(v) => setData({...data, branding: {...data.branding, heroTitle: v}})} 
        />
        <CmsInput 
          label="Hero Tagline" 
          placeholder="e.g. Experience timeless mountain luxury."
          value={data?.branding?.heroTagline} 
          onChange={(v) => setData({...data, branding: {...data.branding, heroTagline: v}})} 
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CmsInput 
            label="Narrative Label" 
            value={data?.branding?.narrativeLabel} 
            onChange={(v) => setData({...data, branding: {...data.branding, narrativeLabel: v}})} 
          />
          <CmsInput 
            label="Narrative Heading" 
            value={data?.branding?.narrativeHeading} 
            onChange={(v) => setData({...data, branding: {...data.branding, narrativeHeading: v}})} 
          />
          <CmsInput 
            label="Narrative Highlight" 
            value={data?.branding?.narrativeHighlight} 
            onChange={(v) => setData({...data, branding: {...data.branding, narrativeHighlight: v}})} 
          />
        </div>
      </div>
    </div>
  );
}

function AmenitiesSection({ data, setData }: { data: any; setData: (data: any) => void }) {
  const currentAmenities = data?.amenities || [];
  
  const addAmenity = () => {
    const newList = [...currentAmenities, { icon: "Sparkles", label: "New Amenity", detail: "Included feature" }];
    setData({...data, amenities: newList});
  };

  const removeAmenity = (idx: number) => {
    const newList = currentAmenities.filter((_: unknown, i: number) => i !== idx);
    setData({...data, amenities: newList});
  };

  const updateAmenity = (idx: number, field: string, value: string) => {
    const newList = [...currentAmenities];
    newList[idx][field] = value;
    setData({...data, amenities: newList});
  };

  return (
    <div className="p-10 space-y-10">
      <div className="flex items-center justify-between">
        <SectionHeader title="Hospitality Essentials" desc="Curate the amenities that define your stay." />
        <button 
          onClick={addAmenity}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0E5A75] text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={16} /> Add Amenity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentAmenities.map((amenity: any, idx: number) => (
          <div key={idx} className="p-6 rounded-[32px] border border-[#0E5A75]/10 bg-[#0E5A75]/5 flex items-start gap-4 group">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#0E5A75] shadow-sm relative overflow-hidden">
               <select 
                value={amenity.icon}
                onChange={(e) => updateAmenity(idx, 'icon', e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
               >
                 {Object.keys(ICON_MAP).map(icon => <option key={icon} value={icon}>{icon}</option>)}
               </select>
               {React.createElement((ICON_MAP as any)[amenity.icon] || Sparkles, { size: 20 })}
            </div>
            <div className="flex-1 space-y-2">
              <input 
                className="w-full bg-transparent text-sm font-black text-[#053344] uppercase tracking-tight focus:outline-none"
                value={amenity.label}
                onChange={(e) => updateAmenity(idx, 'label', e.target.value)}
              />
              <input 
                className="w-full bg-transparent text-[10px] font-bold text-[#0E5A75]/60 uppercase tracking-widest focus:outline-none"
                value={amenity.detail}
                placeholder="Brief description..."
                onChange={(e) => updateAmenity(idx, 'detail', e.target.value)}
              />
            </div>
            <button 
              onClick={() => removeAmenity(idx)}
              className="p-2 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqSection({ data, setData }: { data: any; setData: (data: any) => void }) {
  const currentFaqs = data?.faqs || [];
  
  const addFaq = () => {
    const newList = [...currentFaqs, { question: "New Question", answer: "Property response..." }];
    setData({...data, faqs: newList});
  };

  const removeFaq = (idx: number) => {
    const newList = currentFaqs.filter((_: unknown, i: number) => i !== idx);
    setData({...data, faqs: newList});
  };

  const updateFaq = (idx: number, field: string, value: string) => {
    const newList = [...currentFaqs];
    newList[idx][field] = value;
    setData({...data, faqs: newList});
  };

  return (
    <div className="p-10 space-y-10">
      <div className="flex items-center justify-between">
        <SectionHeader title="FAQs & Policies" desc="Manage guest expectations and house rules." />
        <button 
          onClick={addFaq}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0983B0] text-white font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <CmsInput label="Check-in Time" value={data?.policies?.checkIn} onChange={(v) => setData({...data, policies: {...data.policies, checkIn: v}})} />
        <CmsInput label="Check-out Time" value={data?.policies?.checkOut} onChange={(v) => setData({...data, policies: {...data.policies, checkOut: v}})} />
        <CmsInput label="Pet Policy" value={data?.policies?.petPolicy} onChange={(v) => setData({...data, policies: {...data.policies, petPolicy: v}})} />
        <CmsInput label="Cancellation Policy" value={data?.policies?.cancellation} onChange={(v) => setData({...data, policies: {...data.policies, cancellation: v}})} />
      </div>

      <div className="space-y-4">
        {currentFaqs.map((faq: any, idx: number) => (
          <div key={idx} className="p-8 rounded-[40px] border border-black/5 bg-black/[0.01] space-y-4 relative group">
            <div className="flex items-center gap-4">
              <Type size={16} className="text-[#0E5A75]/30" />
              <input 
                className="w-full bg-transparent text-sm font-black text-[#053344] uppercase tracking-tight focus:outline-none"
                value={faq.question}
                onChange={(e) => updateFaq(idx, 'question', e.target.value)}
              />
            </div>
            <textarea 
              className="w-full bg-transparent text-xs font-bold text-[#0E5A75]/60 uppercase tracking-widest leading-relaxed focus:outline-none resize-none min-h-[60px]"
              value={faq.answer}
              onChange={(e) => updateFaq(idx, 'answer', e.target.value)}
            />
            <button 
              onClick={() => removeFaq(idx)}
              className="absolute top-8 right-8 p-3 rounded-2xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeoSection({ data, setData }: { data: any; setData: (data: any) => void }) {
  return (
    <div className="p-10 space-y-10">
      <SectionHeader title="SEO & Search Visibility" desc="Optimize how your property appears on Google and Social Media." />
      
      <div className="space-y-8">
        <CmsInput 
          label="Meta Title" 
          value={data?.seo?.title} 
          onChange={(v) => setData({...data, seo: {...data.seo, title: v}})} 
        />
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]/60 ml-4">Meta Description</label>
          <textarea 
            className="w-full p-6 rounded-[32px] bg-[#0E5A75]/5 border border-black/5 text-sm font-medium text-[#053344] focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 min-h-[120px] resize-none"
            value={data?.seo?.description}
            onChange={(e) => setData({...data, seo: {...data.seo, description: e.target.value}})}
          />
        </div>
        <CmsInput 
          label="Focus Keywords (comma separated)" 
          value={data?.seo?.keywords?.join(", ")} 
          onChange={(v) => setData({...data, seo: {...data.seo, keywords: v.split(",").map((s: string) => s.trim())}})} 
        />
      </div>

      <div className="p-10 rounded-[48px] bg-[#053344] text-white">
        <div className="flex items-center gap-3 mb-6">
          <Search size={20} className="text-[#0983B0]" />
          <span className="text-xs font-black uppercase tracking-widest">Google Preview</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-[#0983B0]">https://{data?.name?.toLowerCase().replace(/\s+/g, '')}.home4stay.com</p>
          <h3 className="text-xl text-[#8AB4F8] hover:underline cursor-pointer">{data?.seo?.title || data?.name}</h3>
          <p className="text-sm text-white/60 line-clamp-2">{data?.seo?.description || data?.branding?.heroTagline}</p>
        </div>
      </div>
    </div>
  );
}

function GallerySection({ data, setData }: { data: any; setData: (data: any) => void }) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch("/api/media/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyId: data.propertyId,
            fileBase64: base64String,
            fileName: file.name,
            tags: "Gallery"
          })
        });
        
        if (res.ok) {
          const resData = await res.json();
          // Update local state so it appears immediately
          const newImage = { id: resData.asset.id, url: resData.asset.url, type: 'IMAGE' };
          setData({ ...data, images: [...(data.images || []), newImage] });
        } else {
          console.error("Upload failed");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setData({ ...data, images: (data.images || []).filter((img: any) => img.id !== id) });
      }
    } catch (err) {
      console.error("Delete failed");
    }
    setIsDeleting(null);
  };

  return (
    <div className="p-10 space-y-10">
      <SectionHeader title="Visual Gallery" desc="Showcase your property's soul through curated photography." />
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data?.images?.map((img: any, idx: number) => {
          const url = typeof img === 'string' ? img : img.url;
          const id = typeof img === 'string' ? null : img.id;
          return (
          <div key={idx} className="relative aspect-square rounded-[32px] overflow-hidden group">
            <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-2">
              <button className="p-3 rounded-2xl bg-white/20 text-white hover:bg-white/40 transition-all"><Plus size={18} /></button>
              {id && (
                <button 
                  onClick={() => handleDelete(id)}
                  disabled={isDeleting === id}
                  className="p-3 rounded-2xl bg-red-500/20 text-white hover:bg-red-500/40 transition-all"
                >
                  {isDeleting === id ? <RefreshCcw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              )}
            </div>
          </div>
        )})}
        
        <label className="aspect-square rounded-[32px] border-2 border-dashed border-[#0E5A75]/20 flex flex-col items-center justify-center gap-2 bg-[#0E5A75]/5 hover:bg-[#0E5A75]/10 transition-all cursor-pointer relative">
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={isUploading} />
          {isUploading ? (
            <RefreshCcw size={24} className="text-[#0E5A75]/40 animate-spin" />
          ) : (
            <Plus size={24} className="text-[#0E5A75]/40" />
          )}
          <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]">{isUploading ? "Uploading..." : "Add Visual"}</span>
        </label>
      </div>
    </div>
  );
}

// Utility Components
function SectionHeader({ title, desc }: { title: string, desc: string }) {
  return (
    <div>
      <h2 className="text-2xl font-black text-[#053344] dark:text-white tracking-tight leading-none mb-2">{title}</h2>
      <p className="text-xs font-bold text-[#0E5A75]/40 uppercase tracking-widest">{desc}</p>
    </div>
  );
}

function CmsInput({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string }) {
  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0E5A75]/60 ml-4">{label}</label>
      <input 
        type={type}
        className="w-full px-8 py-4.5 rounded-[32px] bg-[#0E5A75]/5 border border-black/5 text-sm font-black text-[#053344] focus:outline-none focus:ring-2 focus:ring-[#0E5A75]/20 placeholder:text-[#0E5A75]/20"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

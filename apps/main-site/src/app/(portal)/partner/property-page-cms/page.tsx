"use client";

import React, { useState, useEffect, startTransition } from "react";
import { 
  DynamicPropertyPagePayload, 
  ThemePresetOption, 
  SectionType, 
  RenderSectionBlock,
  CmsHeroState,
  CmsNarrativeState,
  CmsCarouselCard,
  CmsGalleryImage,
  CmsSeoState
} from "@/components/admin/cms/types";
import PageStructureEditor from "@/components/admin/cms/PageStructureEditor";
import LivePreview from "@/components/admin/cms/LivePreview";
import MediaLibraryModal from "@/components/admin/cms/MediaLibraryModal";
import { EDITOR_REGISTRY } from "@/lib/cms/sectionRegistry";
import { SECTION_MANIFESTS } from "@/lib/cms/sectionManifests";
import { useCmsQuery } from "@/lib/cms/hooks/useCmsQuery";
import { useCmsMutations } from "@/lib/cms/hooks/useCmsMutations";
import { 
  ChevronDown, 
  ChevronUp, 
  Save, 
  Check, 
  Globe, 
  Layers, 
  FileText, 
  Image as ImageIcon, 
  Sliders, 
  Sparkles,
  Loader2,
  Undo2,
  Paintbrush,
  Clock,
  UserCheck,
  Quote,
  HelpCircle,
  Coffee,
  Plus,
  FolderOpen,
  Trash2
} from "lucide-react";

export default function PropertyPageCmsPage() {
  const propertyId = "shivay-resort-101";

  // Connect optimized TanStack Query custom data streaming adapters
  const { data: serverPayload, isLoading: isQueryLoading, refetch } = useCmsQuery(propertyId);

  // Local active canvas replica facilitating instantaneous preview response
  const [cmsState, setCmsState] = useState<DynamicPropertyPagePayload | null>(null);
  
  // Interactive UI parameters
  const [openSection, setOpenSection] = useState<string>("structure");
  const [saveStatus, setSaveStatus] = useState<"Saved just now" | "Saving..." | "Failed to save">("Saved just now");
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  
  // Multi-Tenant Asset Media modal variables
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeMediaTargetCallback, setActiveMediaTargetCallback] = useState<((url: string) => void) | null>(null);

  // Initialize client replica when persistent database stream lands
  useEffect(() => {
    if (serverPayload) {
      // Re-hydrate local replica mappings matching legacy signatures for broad component cross-compatibility
      const resolvedSections = serverPayload.sections || [];
      
      // Compute inline parameter fallbacks
      const heroSec = (resolvedSections.find((s) => s.type === "hero")?.data as CmsHeroState) || {};
      const narrativeSec = (resolvedSections.find((s) => s.type === "narrative")?.data as CmsNarrativeState) || {};
      const carouselSec = (resolvedSections.find((s) => s.type === "carousel")?.data as { cards: CmsCarouselCard[] })?.cards || [];
      const gallerySec = (resolvedSections.find((s) => s.type === "gallery")?.data as { images: CmsGalleryImage[] })?.images || [];
      const seoSec = (resolvedSections.find((s) => s.type === "seo")?.data as CmsSeoState) || {};

      startTransition(() => {
        setCmsState({
          propertyId,
          status: serverPayload.publishedVersionId ? "published" : "draft",
          updatedAt: new Date().toISOString(),
          publishedAt: serverPayload.publishedVersionId ? new Date().toISOString() : undefined,
          createdBy: "partner_admin_owner",
          lastEditedBy: "concierge_curator_v2",
          themePreset: (serverPayload.themeVariant as ThemePresetOption) || "Mountain Luxury",
          themeCustomizations: {
            typography: "Outfit, font-sans",
            spacing: serverPayload.spacingPreset || "relaxed-luxury",
            colorPalette: "slate-teal-amber",
            animationPreset: serverPayload.animationPreset || "cinematic-fade-physics",
          },
          sections: (resolvedSections.length > 0 ? resolvedSections : getFallbackSectionSequence()) as RenderSectionBlock[],
          hero: {
            title: heroSec.title || "Shivay Resort",
            subtitle: heroSec.subtitle || "Your Mountain Sanctuary Above the Clouds",
            ctaText: heroSec.ctaText || "Discover Stays",
            ctaLink: heroSec.ctaLink || "#booking",
            backgroundImage: heroSec.backgroundImage || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            mobileImage: heroSec.mobileImage || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
            overlayOpacity: heroSec.overlayOpacity ?? 0.4,
            textAlign: heroSec.textAlign || "center",
          },
          narrative: {
            smallLabel: narrativeSec.smallLabel || "CINEMATIC HOSPITALITY",
            mainHeading: narrativeSec.mainHeading || "A sanctuary of",
            highlightText: narrativeSec.highlightText || "timeless luxury.",
            description: narrativeSec.description || "Located in the serene environment of Manali, Himachal Pradesh, our Villa provides a perfect blend of modern luxury and traditional hospitality.",
            stats: narrativeSec.stats || [
              { id: "1", value: "12+", label: "Luxury Experiences" },
              { id: "2", value: "100%", label: "Privacy Guaranteed" },
            ],
          },
          carousel: Array.isArray(carouselSec) && carouselSec.length > 0 ? carouselSec : [
            { id: "c1", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80", badge: "ARCHITECTURE", title: "Designed to merge seamlessly", description: "with the mountain horizon.", isActive: true, sortOrder: 0 },
            { id: "c2", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", badge: "INTERIORS", title: "Raw structural wood elements", description: "crafted by local generational hands.", isActive: true, sortOrder: 1 },
          ],
          gallery: Array.isArray(gallerySec) && gallerySec.length > 0 ? gallerySec : [
            { id: "g1", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", category: "Exterior", caption: "Frontal view" },
          ],
          seo: {
            metaTitle: seoSec.metaTitle || "Shivay Resort — Premium Mountain Sanctuary",
            metaDescription: seoSec.metaDescription || "Experience an elegant, tailored luxury stay in Manali wrapped in timeless atmosphere.",
            ogImage: seoSec.ogImage || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
            keywords: seoSec.keywords || "luxury, resort, manali, mountain",
          },
        });
      });
    }
  }, [serverPayload]);

  // Connect mutation handlers
  const { mutateDocumentSync, mutateAppendSection, mutateDeleteSection, mutatePublishRelease } = useCmsMutations({
    propertyId,
    onMutateOptimistic: () => setSaveStatus("Saving..."),
    onSuccess: () => setSaveStatus("Saved just now"),
    onErrorRollback: (err) => {
      setSaveStatus("Failed to save");
      setToastNotice(`Sync issue: ${err}`);
      setTimeout(() => setToastNotice(null), 4000);
    },
  });

  // Re-order root array or patch core sections schema
  const handleUpdateSectionRoot = <K extends keyof DynamicPropertyPagePayload>(key: K, value: DynamicPropertyPagePayload[K]) => {
    if (!cmsState) return;
    const nextState = { ...cmsState, [key]: value, status: "draft" as const };
    setCmsState(nextState);

    // Prepare payload update mapping back to backend DB formats
    mutateDocumentSync({
      themePreset: nextState.themePreset,
      sections: nextState.sections,
    });
  };

  // Modify specific individual sub-block payload properties inline
  const handleUpdateBlockData = (sectionId: string, updatedData: Record<string, unknown>) => {
    if (!cmsState) return;

    const mappedSections = cmsState.sections.map((s) => (s.id === sectionId ? { ...s, data: updatedData } : s));
    const targetSec = mappedSections.find((s) => s.id === sectionId);

    const patchRoot: Partial<DynamicPropertyPagePayload> = {};
    if (targetSec) {
      if (targetSec.type === "hero") patchRoot.hero = { ...cmsState.hero, ...(updatedData as unknown as DynamicPropertyPagePayload["hero"]) };
      if (targetSec.type === "narrative") patchRoot.narrative = { ...cmsState.narrative, ...(updatedData as unknown as DynamicPropertyPagePayload["narrative"]) };
      if (targetSec.type === "carousel" && updatedData.cards) patchRoot.carousel = updatedData.cards as unknown as DynamicPropertyPagePayload["carousel"];
      if (targetSec.type === "gallery" && updatedData.images) patchRoot.gallery = updatedData.images as unknown as DynamicPropertyPagePayload["gallery"];
      if (targetSec.type === "seo") patchRoot.seo = { ...cmsState.seo, ...(updatedData as unknown as DynamicPropertyPagePayload["seo"]) };
    }

    const nextState = {
      ...cmsState,
      ...patchRoot,
      sections: mappedSections,
      status: "draft" as const,
    };

    setCmsState(nextState);

    // Sync straight to PostgreSQL backend DB table stream
    mutateDocumentSync({
      themePreset: nextState.themePreset,
      sections: mappedSections,
    });
  };

  const handleThemeChange = (preset: ThemePresetOption) => {
    if (!cmsState) return;
    const nextState = { ...cmsState, themePreset: preset, status: "draft" as const };
    setCmsState(nextState);
    mutateDocumentSync({ themePreset: preset, sections: nextState.sections });
  };

  const handleAppendNewSection = async (type: SectionType) => {
    if (!cmsState) return;
    try {
      const persistedNode = await mutateAppendSection(type, {});
      const appendedList = [...cmsState.sections, {
        id: persistedNode?.id || `sec-${crypto.randomUUID()}`,
        type,
        enabled: true,
        sortOrder: cmsState.sections.length,
        data: {},
      }];
      setCmsState({ ...cmsState, sections: appendedList });
      setOpenSection(persistedNode?.id || "");
    } catch {
      // Error handled silently via mutateAppendSection rollback hook
    }
  };

  const handlePurgeSection = async (sectionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cmsState) return;
    const success = await mutateDeleteSection(sectionId);
    if (success) {
      const filtered = cmsState.sections.filter((s) => s.id !== sectionId);
      setCmsState({ ...cmsState, sections: filtered });
      if (openSection === sectionId) setOpenSection("structure");
    }
  };

  const handlePublish = async () => {
    if (!cmsState) return;
    setIsPublishing(true);
    try {
      await mutatePublishRelease("Production Build v2", cmsState as unknown as Record<string, unknown>);
      setCmsState({ ...cmsState, status: "published" });
      setToastNotice("Success! Full CMS version snapshot committed to primary PostgreSQL tables.");
      setTimeout(() => setToastNotice(null), 4000);
    } catch {
      // Error handled silently via mutatePublishRelease rollback hook
    }
    setIsPublishing(false);
  };

  const triggerOpenMediaManager = (onAssignCallback: (url: string) => void) => {
    setActiveMediaTargetCallback(() => onAssignCallback);
    setIsMediaModalOpen(true);
  };

  const getSectionIcon = (type: SectionType) => {
    switch (type) {
      case "hero": return Sliders;
      case "narrative": return FileText;
      case "carousel": return Layers;
      case "gallery": return ImageIcon;
      case "testimonials": return Quote;
      case "faq": return HelpCircle;
      case "amenities": return Coffee;
      case "seo": return Globe;
    }
  };

  if (isQueryLoading || !cmsState) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3 select-none">
        <Loader2 size={32} className="text-[#0983B0] animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-[#0E5A75] dark:text-white/70">
          Querying SaaS PostgreSQL Cluster...
        </p>
        <p className="text-[11px] text-[#0E5A75]/60 dark:text-white/50 max-w-xs text-center">
          Establishing strict multi-tenant ownership boundaries and validating localized media caching links.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 select-none">
      {toastNotice && (
        <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-top duration-300">
          <div className="glass-premium px-6 py-4 rounded-2xl border-white/20 text-[#0E5A75] dark:text-white flex items-center gap-3 shadow-2xl">
            <div className="p-1.5 rounded-full bg-[#159665] text-white">
              <Check size={14} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider">Storage State Archive</p>
              <p className="text-xs opacity-90">{toastNotice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Shared Asset Selector Overlay Modal */}
      <MediaLibraryModal
        propertyId={propertyId}
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectAsset={(url) => {
          activeMediaTargetCallback?.(url);
          setIsMediaModalOpen(false);
        }}
      />

      {/* HEADER CONTROLLER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 glass-premium rounded-[32px] border-white/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
              saveStatus === "Saving..." ? "bg-amber-500/10 text-amber-500 animate-pulse" : saveStatus === "Failed to save" ? "bg-red-500/10 text-red-500" : "bg-[#0983B0]/10 text-[#0983B0]"
            }`}>
              <Clock size={10} /> {saveStatus}
            </span>
            <span className="text-xs text-gray-300">|</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              cmsState.status === "published" ? "bg-green-500/10 text-green-500" : "bg-purple-500/10 text-purple-400"
            }`}>
              Postgres Release: {cmsState.status.toUpperCase()}
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <UserCheck size={10} /> Tenant: Owner Isolated
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0E5A75] dark:text-white">
            Universal Section Registry CMS
          </h1>
          <p className="text-xs text-[#0E5A75]/70 dark:text-white/70 mt-1 max-w-xl leading-relaxed">
            Production PostgreSQL backend infrastructure utilizing continuous database record streaming, isolated TanStack query adapters, versioned JSON serialization, and high-fidelity media CDN catalogs.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => triggerOpenMediaManager(() => {})}
            className="px-4 py-2.5 rounded-xl bg-[#159665]/10 hover:bg-[#159665]/20 text-[#159665] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5"
          >
            <FolderOpen size={14} /> Shared Media CDN
          </button>

          {cmsState.status === "draft" && (
            <button
              type="button"
              disabled={isPublishing}
              onClick={refetch}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold transition-all flex items-center gap-1"
            >
              <Undo2 size={13} /> Revert Database
            </button>
          )}

          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublish}
            className="px-5 py-2.5 rounded-xl bg-[#0E5A75] text-white text-xs font-black uppercase tracking-widest shadow-xl hover:bg-[#0983B0] transition-all flex items-center gap-1.5"
          >
            {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{cmsState.status === "draft" ? "Commit Production" : "Verified Build"}</span>
          </button>
        </div>
      </div>

      {/* THEME PRESET CONFIGURATOR */}
      <div className="p-4 rounded-2xl glass-matte border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#053344]/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#0983B0] text-white">
            <Paintbrush size={16} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-[#053344] dark:text-white">
              Persistent Database Palette Token Override
            </p>
            <p className="text-[11px] text-[#053344]/70 dark:text-white/60">
              Immediately sync CSS property tokens directly to active database entry instances.
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center flex-wrap">
          {(["Mountain Luxury", "Heritage Royal", "Scandinavian Minimal", "Jungle Retreat"] as const).map((themeName) => (
            <button
              key={themeName}
              type="button"
              onClick={() => handleThemeChange(themeName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cmsState.themePreset === themeName
                  ? "bg-[#0983B0] text-white shadow-md scale-105"
                  : "bg-white/40 dark:bg-black/30 text-[#053344] dark:text-white/70 hover:bg-white/60"
              }`}
            >
              {themeName}
            </button>
          ))}
        </div>
      </div>

      {/* SPLIT ENGINE VIEWPORT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT PANE: Master Registry Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* 0th Element: Page Structure Global Engine */}
          <div className="glass-premium rounded-2xl border-white/20 overflow-hidden shadow-lg border-l-4 border-l-[#0983B0]">
            <button
              type="button"
              onClick={() => setOpenSection(openSection === "structure" ? "" : "structure")}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${openSection === "structure" ? "bg-[#0983B0] text-white" : "bg-black/5 dark:bg-white/5 text-[#0E5A75] dark:text-white/60"}`}>
                  <Layers size={16} />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#0E5A75] dark:text-white block">
                    0. Postgres Section Sequencer
                  </span>
                  <span className="text-[9px] text-[#0983B0] font-bold">✨ Live backend atomic sort sequence buffer</span>
                </div>
              </div>
              <div className="text-[#0E5A75]/40 dark:text-white/40">
                {openSection === "structure" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {openSection === "structure" && (
              <div className="p-6 pt-2 border-t border-black/5 dark:border-white/5 bg-white/20 dark:bg-black/10">
                <PageStructureEditor
                  sections={cmsState.sections}
                  onChange={(val) => handleUpdateSectionRoot("sections", val)}
                />

                {/* Section Appending Row */}
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#0E5A75]/70 dark:text-white/60">
                    Mount new decoupled registry chunk:
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {(["narrative", "carousel", "gallery", "testimonials", "faq", "amenities"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleAppendNewSection(t)}
                        className="px-2 py-1 rounded bg-[#0983B0]/10 hover:bg-[#0983B0]/20 text-[#0983B0] text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-0.5"
                      >
                        <Plus size={10} /> {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Iterate over active individual render section blocks dynamically using EDITOR_REGISTRY */}
          {cmsState.sections.map((sectionNode, idx) => {
            const manifest = SECTION_MANIFESTS[sectionNode.type];
            if (!manifest) return null;

            const IconComp = getSectionIcon(sectionNode.type);
            const DynamicEditorComponent = EDITOR_REGISTRY[sectionNode.type];
            const isOpen = openSection === sectionNode.id;

            // Merge fallback payload dictionary logic
            let editorState = sectionNode.data || {};
            if (sectionNode.type === "hero" && Object.keys(editorState).length === 0) editorState = cmsState.hero;
            if (sectionNode.type === "narrative" && Object.keys(editorState).length === 0) editorState = cmsState.narrative;
            if (sectionNode.type === "carousel" && Object.keys(editorState).length === 0) editorState = { cards: cmsState.carousel };
            if (sectionNode.type === "gallery" && Object.keys(editorState).length === 0) editorState = { images: cmsState.gallery };
            if (sectionNode.type === "seo" && Object.keys(editorState).length === 0) editorState = cmsState.seo;

            return (
              <div
                key={sectionNode.id}
                className={`glass-premium rounded-2xl border-white/20 overflow-hidden shadow-lg transition-all duration-300 relative group ${
                  !sectionNode.enabled ? "opacity-60 border-dashed" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenSection(isOpen ? "" : sectionNode.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isOpen ? "bg-[#0983B0] text-white" : "bg-black/5 dark:bg-white/5 text-[#0E5A75] dark:text-white/60"}`}>
                      <IconComp size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#0E5A75] dark:text-white">
                          {idx + 1}. {manifest.label}
                        </span>
                        {!sectionNode.enabled && (
                          <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-gray-500/20 text-gray-400">
                            HIDDEN
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-[#0E5A75]/60 dark:text-white/50 block">
                        Category: {manifest.category} | Persistent ID: <code className="text-[#0983B0]">{sectionNode.id}</code>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Direct block purging action trigger */}
                    {idx > 0 && (
                      <div
                        onClick={(e) => handlePurgeSection(sectionNode.id, e)}
                        className="p-1.5 rounded hover:bg-red-500/20 text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
                        title="Purge section node from database"
                      >
                        <Trash2 size={13} />
                      </div>
                    )}
                    <div className="text-[#0E5A75]/40 dark:text-white/40">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                </button>

                {isOpen && DynamicEditorComponent && (
                  <div className="p-6 pt-2 border-t border-black/5 dark:border-white/5 bg-white/20 dark:bg-black/10 relative">
                    {/* Media Assignment Integration Shortcut Bar */}
                    {["hero", "carousel", "gallery"].includes(sectionNode.type) && (
                      <div className="mb-4 pb-3 border-b border-white/5 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#0983B0] flex items-center gap-1">
                          <Sparkles size={12} /> Inject optimized database CDN binary links directly:
                        </span>
                        <button
                          type="button"
                          onClick={() => triggerOpenMediaManager((selectedUrl) => {
                            // Smart injection mapping logic
                            if (sectionNode.type === "hero") {
                              handleUpdateBlockData(sectionNode.id, { ...(editorState as CmsHeroState), backgroundImage: selectedUrl });
                            } else if (sectionNode.type === "gallery") {
                              const existingImgs = Array.isArray((editorState as { images: CmsGalleryImage[] }).images) ? (editorState as { images: CmsGalleryImage[] }).images : [];
                              handleUpdateBlockData(sectionNode.id, {
                                images: [...existingImgs, { id: "gal-" + crypto.randomUUID(), url: selectedUrl, category: "Exterior", caption: "Imported asset" }],
                              });
                            } else if (sectionNode.type === "carousel") {
                              const existingCards = Array.isArray((editorState as { cards: CmsCarouselCard[] }).cards) ? (editorState as { cards: CmsCarouselCard[] }).cards : [];
                              handleUpdateBlockData(sectionNode.id, {
                                cards: [...existingCards, { id: "card-" + crypto.randomUUID(), image: selectedUrl, badge: "FEATURED", title: "Imported module", isActive: true }],
                              });
                            }
                          })}
                          className="px-2.5 py-1 rounded bg-[#0983B0] text-white text-[10px] font-black uppercase tracking-wider hover:bg-[#0E5A75] transition-all flex items-center gap-1 shadow-md"
                        >
                          <FolderOpen size={10} /> Browse Asset Library
                        </button>
                      </div>
                    )}

                    <DynamicEditorComponent
                      data={editorState}
                      onChange={(updatedFields: unknown) => handleUpdateBlockData(sectionNode.id, updatedDataResolver(sectionNode.type, updatedFields) as Record<string, unknown>)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT PANE: Side-by-Side Registry Stream */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0E5A75]/60 dark:text-white/50 flex items-center gap-1">
                <Sparkles size={12} className="text-[#159665]" /> Realtime Persistent Cache Feed
              </span>
              <span className="text-[10px] text-[#159665] font-mono">DB Mode: Active Sync</span>
            </div>

            <LivePreview data={cmsState} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Normalizer mapping custom nested array string structures gracefully
function updatedDataResolver(type: SectionType, fields: unknown) {
  if (type === "carousel" && Array.isArray(fields)) return { cards: fields };
  if (type === "gallery" && Array.isArray(fields)) return { images: fields };
  return fields;
}

function getFallbackSectionSequence() {
  return [
    { id: "sec-hero-1", type: "hero", enabled: true, sortOrder: 0, data: {} },
    { id: "sec-narrative-1", type: "narrative", enabled: true, sortOrder: 1, data: {} },
    { id: "sec-carousel-1", type: "carousel", enabled: true, sortOrder: 2, data: {} },
    { id: "sec-gallery-1", type: "gallery", enabled: true, sortOrder: 3, data: {} },
    { id: "sec-seo-1", type: "seo", enabled: true, sortOrder: 4, data: {} },
  ];
}

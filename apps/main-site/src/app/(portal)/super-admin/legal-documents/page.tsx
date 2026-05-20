"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Shield,
  Users,
  Download,
  Plus,
  Edit,
  Eye,
  BookOpen,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  Search,
  Calendar,
  ChevronRight,
  ArrowRight,
  Lock,
  Globe,
  Settings,
  History,
  List,
  Trash2,
  X
} from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { sanitizeHtml } from "@/lib/legal/sanitizer";
import { LegalDocumentType } from "@prisma/client";

interface LegalDocument {
  id: string;
  documentType: LegalDocumentType;
  title: string;
  slug: string;
  version: string;
  content: string;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: string;
  acceptedAt: string;
  acceptedVersion: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  user: {
    name: string;
    email: string;
    role: string;
  };
  document: {
    documentType: LegalDocumentType;
    title: string;
  };
}

export default function SuperAdminLegalDocumentsPage() {
  const [activeTab, setActiveTab] = useState<"documents" | "audit">("documents");
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // States for Documents Management Tab
  const [allDocuments, setAllDocuments] = useState<LegalDocument[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<LegalDocumentType>("TERMS_AND_CONDITIONS");
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [isNewDraft, setIsNewDraft] = useState(false);

  // Editor form inputs
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formVersion, setFormVersion] = useState("");
  const [formContent, setFormContent] = useState("");

  // States for Compliance Audit Tab
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDocType, setFilterDocType] = useState<string>("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [auditLimit, setAuditLimit] = useState(25);
  const [auditOffset, setAuditOffset] = useState(0);
  const [totalAuditCount, setTotalAuditCount] = useState(0);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditLogs();
    }
  }, [activeTab, filterDocType, searchTerm, startDate, endDate, auditLimit, auditOffset]);

  const showNotice = (type: "success" | "error", message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/legal-documents");
      const data = await res.json();
      if (data.success) {
        setAllDocuments(data.documents);
      } else {
        showNotice("error", data.error || "Failed to load legal policies.");
      }
    } catch (err) {
      showNotice("error", "Error connection to database.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: auditLimit.toString(),
        offset: auditOffset.toString()
      });

      if (searchTerm) params.append("search", searchTerm);
      if (filterDocType && filterDocType !== "ALL") params.append("documentType", filterDocType);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/admin/legal-documents/audit?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs);
        setTotalAuditCount(data.pagination.total);
      }
    } catch (err) {
      showNotice("error", "Error loading compliance logs.");
    }
  };

  // Pre-fill form when creating new draft version
  const handleInitiateNewVersion = (type: LegalDocumentType) => {
    setSelectedDocType(type);
    setIsNewDraft(true);
    setEditingDoc(null);

    // Default pre-fill configurations
    const activeOfThisType = allDocuments.find(d => d.documentType === type && d.isActive);
    setFormTitle(activeOfThisType?.title || getFriendlyDocTypeName(type));
    setFormSlug(activeOfThisType?.slug || getSlugForDocType(type));

    // Suggest next minor version if possible
    if (activeOfThisType) {
      const parts = activeOfThisType.version.split(".");
      if (parts.length === 3) {
        const minor = parseInt(parts[1], 10) + 1;
        setFormVersion(`${parts[0]}.${minor}.0`);
      } else {
        setFormVersion(`${activeOfThisType.version}.1`);
      }
      setFormContent(activeOfThisType.content);
    } else {
      setFormVersion("1.0.0");
      setFormContent("<h1>Insert Document Content Here</h1>\n<p>Start writing your policy body...</p>");
    }
  };

  // Pre-fill form when editing an existing draft
  const handleInitiateEditDraft = (doc: LegalDocument) => {
    setIsNewDraft(false);
    setEditingDoc(doc);
    setFormTitle(doc.title);
    setFormSlug(doc.slug);
    setFormVersion(doc.version);
    setFormContent(doc.content);
  };

  // Submit Draft (Save)
  const handleSaveDraft = async () => {
    if (!formTitle || !formSlug || !formVersion || !formContent) {
      showNotice("error", "All fields are required to save policy version.");
      return;
    }

    setActioning(true);
    try {
      if (isNewDraft) {
        // Create new version draft (POST)
        const res = await fetch("/api/admin/legal-documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentType: selectedDocType,
            title: formTitle,
            slug: formSlug,
            version: formVersion,
            content: formContent
          })
        });
        const data = await res.json();
        if (data.success) {
          showNotice("success", "Draft document version created successfully.");
          closeEditor();
          fetchDocuments();
        } else {
          showNotice("error", data.error || "Failed to create draft version.");
        }
      } else if (editingDoc) {
        // Edit existing draft (PATCH)
        const res = await fetch("/api/admin/legal-documents", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingDoc.id,
            action: "edit",
            title: formTitle,
            slug: formSlug,
            version: formVersion,
            content: formContent
          })
        });
        const data = await res.json();
        if (data.success) {
          showNotice("success", "Draft document version updated successfully.");
          closeEditor();
          fetchDocuments();
        } else {
          showNotice("error", data.error || "Failed to update draft.");
        }
      }
    } catch (err) {
      showNotice("error", "A network error occurred while saving.");
    } finally {
      setActioning(false);
    }
  };

  // Publish a Draft
  const handlePublishDocument = async (id: string, versionTag: string, typeName: string) => {
    const confirmationText = `WARNING! Publishing version ${versionTag} of ${typeName} will:
1. Deactivate the currently active policy version.
2. FORCE all partner accounts to accept this new policy before resuming operations.
3. LOCK this policy version content forever to protect historical audit signatures.

Are you sure you want to proceed with this dynamic version promotion?`;

    if (!confirm(confirmationText)) return;

    setActioning(true);
    try {
      const res = await fetch("/api/admin/legal-documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "publish" })
      });
      const data = await res.json();
      if (data.success) {
        showNotice("success", `Version ${versionTag} is now LIVE. Policy re-acceptance wall is active.`);
        fetchDocuments();
      } else {
        showNotice("error", data.error || "Failed to publish document.");
      }
    } catch (err) {
      showNotice("error", "Error publishing policy.");
    } finally {
      setActioning(false);
    }
  };

  const closeEditor = () => {
    setEditingDoc(null);
    setIsNewDraft(false);
    setFormTitle("");
    setFormSlug("");
    setFormVersion("");
    setFormContent("");
  };

  // Export Compliance Audit Logs
  const handleExportData = (format: "csv" | "json") => {
    if (auditLogs.length === 0) {
      showNotice("error", "No audit logs available for export.");
      return;
    }

    let fileContent = "";
    let mimeType = "";
    let fileExtension = "";

    if (format === "json") {
      fileContent = JSON.stringify(auditLogs, null, 2);
      mimeType = "application/json";
      fileExtension = "json";
    } else {
      // CSV format construction
      const headers = ["Log ID", "User Name", "User Email", "User Role", "Document Type", "Accepted Version", "Timestamp", "IP Address", "User Agent"];
      const rows = auditLogs.map(log => [
        log.id,
        `"${log.user.name.replace(/"/g, '""')}"`,
        log.user.email,
        log.user.role,
        log.document.documentType,
        log.acceptedVersion,
        log.acceptedAt,
        log.ipAddress || "N/A",
        `"${(log.userAgent || "N/A").replace(/"/g, '""')}"`
      ]);

      fileContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      mimeType = "text/csv";
      fileExtension = "csv";
    }

    const blob = new Blob([fileContent], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `home4stay_compliance_audit_${new Date().toISOString().split("T")[0]}.${fileExtension}`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotice("success", `Exported audit registry as ${format.toUpperCase()} successfully.`);
  };

  // Helper translations
  function getFriendlyDocTypeName(type: LegalDocumentType): string {
    switch (type) {
      case "TERMS_AND_CONDITIONS":
        return "Terms & Conditions";
      case "PRIVACY_POLICY":
        return "Privacy Policy";
      case "REFUND_POLICY":
        return "Refund Policy";
      case "SUBSCRIPTION_AGREEMENT":
        return "Subscription Agreement";
      default:
        return String(type);
    }
  }

  function getSlugForDocType(type: LegalDocumentType): string {
    switch (type) {
      case "TERMS_AND_CONDITIONS":
        return "terms-and-conditions";
      case "PRIVACY_POLICY":
        return "privacy-policy";
      case "REFUND_POLICY":
        return "refund-policy";
      case "SUBSCRIPTION_AGREEMENT":
        return "subscription-agreement";
      default:
        return "policy";
    }
  }

  const documentTypesList: LegalDocumentType[] = [
    "TERMS_AND_CONDITIONS",
    "PRIVACY_POLICY",
    "REFUND_POLICY",
    "SUBSCRIPTION_AGREEMENT"
  ];

  return (
    <AdminLayout>
      {/* Dynamic Toast Notice */}
      {notice && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-sm font-semibold transition-all ${
          notice.type === "success" 
            ? "bg-green-50 border-green-200 text-green-700" 
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {notice.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          {notice.message}
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shadow-inner">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Compliance & Legal Center</h1>
          </div>
          <p className="text-gray-500">Dynamically update platform policies and verify client consent logs with immutable cryptographic audit security.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => { fetchDocuments(); if (activeTab === "audit") fetchAuditLogs(); }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Sync Policies
          </button>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => { setActiveTab("documents"); closeEditor(); }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            activeTab === "documents"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="h-4 w-4" />
          Policy Management
        </button>
        <button
          onClick={() => { setActiveTab("audit"); closeEditor(); }}
          className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all border-b-2 -mb-px ${
            activeTab === "audit"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Users className="h-4 w-4" />
          Consent Audit Logs
        </button>
      </div>

      {/* Editor Overlay Panel */}
      {(isNewDraft || editingDoc) && (
        <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-md mb-8 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isNewDraft ? `Create New Draft: ${getFriendlyDocTypeName(selectedDocType)}` : `Edit Draft Version: ${editingDoc?.version}`}
              </h2>
              <p className="text-gray-500 text-sm">
                Write robust structural HTML markup. Live sanitizer guarantees secure XSS rendering.
              </p>
            </div>
            <button 
              onClick={closeEditor}
              className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Editor Input Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Policy Title</label>
                <input 
                  type="text" 
                  value={formTitle} 
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Terms & Conditions of Membership"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Version String</label>
                  <input 
                    type="text" 
                    value={formVersion} 
                    onChange={(e) => setFormVersion(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. 1.2.0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">URL Slug</label>
                  <input 
                    type="text" 
                    value={formSlug} 
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. terms"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">HTML Source Code Content</label>
                <textarea 
                  value={formContent} 
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full h-96 px-4 py-4 bg-gray-900 text-gray-100 font-mono text-sm border border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="<h1>Heading Here</h1><p>Paragraph text...</p>"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSaveDraft}
                  disabled={actioning}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                >
                  {actioning && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Save Draft Version
                </button>
                <button
                  onClick={closeEditor}
                  className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Sanitized Live Preview Panel */}
            <div className="flex flex-col border border-gray-200 rounded-2xl bg-gray-50 overflow-hidden">
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">XSS-Sanitized Web Preview</span>
                </div>
                <div className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                  Active Filter
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto max-h-[30rem] bg-white prose prose-sm max-w-none">
                <h1 className="text-2xl font-bold text-gray-900 border-b pb-2 mb-4">
                  {formTitle || "Policy Preview"}
                </h1>
                <div className="text-gray-500 text-xs mb-6">
                  Published: {new Date().toLocaleDateString()} | Version: {formVersion || "0.0.0"}
                </div>
                
                {/* Dynamically render sanitized content securely */}
                <div 
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(formContent) }}
                  className="text-gray-800 leading-relaxed space-y-4"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
          <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin" />
          <p className="text-gray-500 font-medium">Fetching administrative records...</p>
        </div>
      ) : activeTab === "documents" ? (
        /* Tab 1 - Policy Management Views */
        <div className="space-y-10">
          {/* Card list of 4 primary doc types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {documentTypesList.map((type) => {
              const activeVer = allDocuments.find(d => d.documentType === type && d.isActive);
              const totalVers = allDocuments.filter(d => d.documentType === type).length;

              return (
                <div 
                  key={type} 
                  className={`bg-white border rounded-[2rem] p-6 shadow-sm transition-all flex flex-col justify-between ${
                    selectedDocType === type ? "ring-2 ring-indigo-500 border-transparent" : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gray-50 rounded-2xl text-gray-600">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      {activeVer ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                          Active: v{activeVer.version}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">
                          No Active
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
                      {getFriendlyDocTypeName(type)}
                    </h3>
                    
                    <p className="text-gray-500 text-xs mb-4">
                      Total system variants: <span className="font-semibold text-gray-700">{totalVers}</span>
                    </p>
                  </div>

                  <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => handleInitiateNewVersion(type)}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Create New Draft
                    </button>
                    <button
                      onClick={() => setSelectedDocType(type)}
                      className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                    >
                      <History className="h-3 w-3" />
                      View Versions History
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Versions History section for the selected document type */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <History className="h-5 w-5 text-gray-500" />
                  Versions Ledger: {getFriendlyDocTypeName(selectedDocType)}
                </h3>
                <p className="text-gray-500 text-sm">
                  Active policy logs, drafts, and past revisions are archived below.
                </p>
              </div>
              <button
                onClick={() => handleInitiateNewVersion(selectedDocType)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100"
              >
                <Plus className="h-4 w-4" />
                Initiate New Draft Version
              </button>
            </div>

            {/* Ledger table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Version</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Slug</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Created At</th>
                    <th className="py-4 px-6">Published At</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {allDocuments.filter(d => d.documentType === selectedDocType).length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-400 font-medium">
                        No versions configured yet for this policy.
                      </td>
                    </tr>
                  ) : (
                    allDocuments
                      .filter(d => d.documentType === selectedDocType)
                      .map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-gray-900">
                            v{doc.version}
                          </td>
                          <td className="py-4 px-6 font-semibold text-gray-800">
                            {doc.title}
                          </td>
                          <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                            /{doc.slug}
                          </td>
                          <td className="py-4 px-6">
                            {doc.isActive ? (
                              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                Active (LIVE)
                              </span>
                            ) : doc.publishedAt ? (
                              <span className="px-3 py-1 bg-gray-50 text-gray-500 text-xs font-bold rounded-full">
                                Archived
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200">
                                Draft
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-gray-500 text-xs">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-gray-500 text-xs">
                            {doc.publishedAt ? new Date(doc.publishedAt).toLocaleString() : "Never"}
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            {!doc.isActive && !doc.publishedAt ? (
                              <>
                                <button
                                  onClick={() => handleInitiateEditDraft(doc)}
                                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-all"
                                >
                                  Edit Draft
                                </button>
                                <button
                                  onClick={() => handlePublishDocument(doc.id, doc.version, getFriendlyDocTypeName(selectedDocType))}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all"
                                >
                                  Publish & Activate
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  // Preview read-only content
                                  setIsNewDraft(false);
                                  setEditingDoc(doc);
                                  setFormTitle(doc.title);
                                  setFormSlug(doc.slug);
                                  setFormVersion(doc.version);
                                  setFormContent(doc.content);
                                }}
                                className="px-3 py-1 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-bold transition-all"
                              >
                                View Content
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2 - Consent Audit Logs View */
        <div className="space-y-6">
          {/* Dynamic Search & Filters Row */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Text Search */}
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search owner name, email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setAuditOffset(0); }}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Document Type Selector */}
              <div>
                <select
                  value={filterDocType}
                  onChange={(e) => { setFilterDocType(e.target.value); setAuditOffset(0); }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
                >
                  <option value="ALL">All Documents</option>
                  <option value="TERMS_AND_CONDITIONS">Terms & Conditions</option>
                  <option value="PRIVACY_POLICY">Privacy Policy</option>
                  <option value="REFUND_POLICY">Refund Policy</option>
                  <option value="SUBSCRIPTION_AGREEMENT">Subscription Agreement</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setAuditOffset(0); }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
                />
              </div>

              {/* End Date */}
              <div>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setAuditOffset(0); }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-gray-700"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-50">
              <div className="text-xs text-gray-500 font-medium">
                Total matching sign-offs: <span className="font-bold text-gray-800">{totalAuditCount} logs</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExportData("json")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all border border-gray-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export JSON
                </button>
                <button
                  onClick={() => handleExportData("csv")}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-bold transition-all border border-gray-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </button>
              </div>
            </div>
          </div>

          {/* Audit Logs table */}
          <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
            <div className="overflow-x-auto rounded-2xl border border-gray-100 mb-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-4 px-6">Signed Partner</th>
                    <th className="py-4 px-6">Policy Document</th>
                    <th className="py-4 px-6">Version Accepted</th>
                    <th className="py-4 px-6">IP Address</th>
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6">Browser/User-Agent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-400 font-medium">
                        No policy sign-offs matches your current search filters.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-bold text-gray-900">{log.user.name}</div>
                            <div className="text-gray-400 text-xs font-mono">{log.user.email}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-800">
                          {getFriendlyDocTypeName(log.document.documentType)}
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded-lg font-mono">
                            v{log.acceptedVersion}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-500 font-mono text-xs">
                          {log.ipAddress || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-gray-500 text-xs">
                          {new Date(log.acceptedAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-gray-400 text-xs max-w-xs truncate" title={log.userAgent || ""}>
                          {log.userAgent || "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalAuditCount > auditLimit && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Showing <span className="font-bold">{auditOffset + 1}</span> to{" "}
                  <span className="font-bold">
                    {Math.min(auditOffset + auditLimit, totalAuditCount)}
                  </span>{" "}
                  of <span className="font-bold">{totalAuditCount}</span> results
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={auditOffset === 0}
                    onClick={() => setAuditOffset(prev => Math.max(0, prev - auditLimit))}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={auditOffset + auditLimit >= totalAuditCount}
                    onClick={() => setAuditOffset(prev => prev + auditLimit)}
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

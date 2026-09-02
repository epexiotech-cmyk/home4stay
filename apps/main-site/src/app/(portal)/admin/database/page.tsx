"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ModelMeta {
  name: string;
  dbName: string;
  fields: { name: string; type: string; isId: boolean }[];
}

export default function DatabaseExplorerPage() {
  const router = useRouter();
  const [models, setModels] = useState<ModelMeta[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedRecord, setSelectedRecord] = useState<Record<string, unknown> | null>(null);
  const [search, setSearch] = useState("");

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const res = await fetch("/api/admin/database", { credentials: "include" });
      if (res.status === 403 || res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setModels(data.models);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch models");
    } finally {
      setLoadingModels(false);
    }
  };

  const fetchRecords = async (modelName: string, page = 1) => {
    setLoadingRecords(true);
    setSelectedModel(modelName);
    setError(null);
    try {
      const res = await fetch(`/api/admin/database?model=${modelName}&page=${page}`, { credentials: "include" });
      if (res.status === 403 || res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
        setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch records");
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleModelSelect = (modelName: string) => {
    setRecords([]);
    fetchRecords(modelName, 1);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const filteredModels = models.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const currentModelMeta = models.find(m => m.name === selectedModel);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 text-sm text-secondary mb-2">
            <Link href="/admin/dashboard" className="hover:text-primary transition-colors">Super Admin</Link>
            <span>/</span>
            <span className="text-primary font-bold">Database</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Database Explorer</h1>
          <p className="text-secondary mt-1">Manage and inspect the Home4Stay platform database.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-bold border border-accent/20">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            Read-Only Mode
          </div>
          <button onClick={() => selectedModel ? fetchRecords(selectedModel, pagination.page) : fetchModels()} className="btn btn-secondary px-4 py-2 text-sm rounded-xl font-bold flex items-center gap-2">
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-bold">
          {error}
        </div>
      )}

      {/* Main Layout */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left Panel - Models */}
        <div className="w-64 flex flex-col bg-surface border border-border rounded-2xl overflow-hidden shrink-0 shadow-sm">
          <div className="p-4 border-b border-border bg-surface-alt">
            <h3 className="font-bold mb-3 flex items-center justify-between">
              Tables <span className="text-xs text-secondary bg-background px-2 py-1 rounded-full">{models.length}</span>
            </h3>
            <input 
              type="text" 
              placeholder="Search tables..." 
              className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingModels ? (
              <div className="p-4 text-center text-sm text-secondary">Loading tables...</div>
            ) : (
              filteredModels.map(model => (
                <button
                  key={model.name}
                  onClick={() => handleModelSelect(model.name)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${selectedModel === model.name ? 'bg-primary text-white font-bold shadow-md' : 'hover:bg-background text-secondary hover:text-primary font-medium'}`}
                >
                  {model.name}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Data Grid */}
        <div className="flex-1 flex flex-col bg-surface border border-border rounded-2xl overflow-hidden shadow-sm min-w-0">
          {!selectedModel ? (
            <div className="flex-1 flex flex-col items-center justify-center text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-20"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>
              <p className="font-bold text-lg text-primary">No Table Selected</p>
              <p className="text-sm">Select a table from the left panel to view records.</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-border bg-surface-alt flex justify-between items-center">
                <h3 className="font-bold flex items-center gap-2 text-lg">
                  {selectedModel}
                  {!loadingRecords && <span className="text-xs font-bold text-secondary bg-background px-2 py-1 rounded-full">{pagination.total} records</span>}
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <button 
                    disabled={pagination.page <= 1} 
                    onClick={() => fetchRecords(selectedModel, pagination.page - 1)}
                    className="px-3 py-1.5 border border-border rounded-lg bg-surface hover:bg-background disabled:opacity-50 font-bold transition-all"
                  >
                    Prev
                  </button>
                  <span className="font-bold text-secondary">Page {pagination.page} of {pagination.totalPages || 1}</span>
                  <button 
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchRecords(selectedModel, pagination.page + 1)}
                    className="px-3 py-1.5 border border-border rounded-lg bg-surface hover:bg-background disabled:opacity-50 font-bold transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-auto bg-background/50">
                {loadingRecords ? (
                  <div className="h-full flex items-center justify-center text-secondary">Loading records...</div>
                ) : records.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-secondary">
                    <p className="font-bold text-lg text-primary mb-1">Table is empty</p>
                    <p className="text-sm">No records found in {selectedModel}.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-surface border-b border-border z-10 shadow-sm">
                      <tr>
                        {currentModelMeta?.fields.slice(0, 7).map((f) => (
                          <th key={f.name} className="p-3 text-xs font-bold text-secondary uppercase tracking-widest whitespace-nowrap">
                            {f.name} {f.isId && <span className="text-accent ml-1">🔑</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {records.map((record, i) => (
                        <tr key={i} onClick={() => setSelectedRecord(record)} className="hover:bg-surface-alt transition-colors cursor-pointer group">
                          {currentModelMeta?.fields.slice(0, 7).map((f) => (
                            <td key={f.name} className="p-3 text-sm whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis border-r border-transparent group-hover:border-border/50 last:border-0">
                              {record[f.name] === null ? <span className="text-secondary/50 italic">null</span> : 
                               typeof record[f.name] === 'object' ? <span className="text-accent text-xs bg-accent/10 px-1.5 py-0.5 rounded font-bold">JSON</span> :
                               String(record[f.name])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-3xl max-h-full flex flex-col shadow-2xl">
            <div className="p-6 border-b border-border flex justify-between items-center bg-surface-alt rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Record Details</h3>
                <p className="text-sm text-secondary mt-1">Viewing raw data for {selectedModel} record</p>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="p-2 hover:bg-background rounded-full transition-colors text-secondary hover:text-primary">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-background/50">
              <pre className="text-xs bg-surface border border-border p-6 rounded-xl overflow-x-auto font-mono text-secondary">
                {JSON.stringify(selectedRecord, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-border bg-surface flex justify-end rounded-b-2xl">
              <button onClick={() => setSelectedRecord(null)} className="btn btn-secondary px-6 py-2 rounded-xl font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

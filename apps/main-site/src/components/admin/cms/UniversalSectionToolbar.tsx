"use client";

import React, { Component, ReactNode } from "react";
import { RenderSectionBlock } from "./types";
import { 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  BarChart2,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface ToolbarProps {
  section: RenderSectionBlock;
  onDuplicate?: () => void;
  onToggleVisibility?: () => void;
  onDelete?: () => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorStr?: string;
}

// Localized Error Boundary Wrapper preventing single sub-component crashes from crashing surrounding view modules
class SectionErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorStr: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Telemetry log hook catching error strings securely
    console.warn("SectionRenderer ErrorBoundary isolated node fallback:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            <div>
              <p className="font-bold uppercase tracking-wider">Module Rendering Crash Isolated</p>
              <p className="opacity-80 text-[10px]">{this.state.errorStr || "Unhandled runtime parameter extraction failure."}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="px-2.5 py-1 rounded bg-red-500 text-white font-bold text-[9px] hover:bg-red-600 transition-colors"
          >
            <RefreshCw size={10} className="inline mr-1" /> Retry Render
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function UniversalSectionToolbar({ section, onDuplicate, onToggleVisibility, onDelete, children }: ToolbarProps) {
  // Telemetry mockup handlers tracking analytics interactions dynamically
  const trackImpression = () => {
    // Analytics telemetry setup mapping layout visibility depth parameters
  };

  return (
    <div 
      className="relative group transition-all duration-300 rounded-2xl border border-transparent hover:border-[#0983B0]/40 overflow-hidden"
      onMouseEnter={trackImpression}
    >
      {/* Absolute Overline Toolbar visible on hover */}
      <div className="absolute top-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white backdrop-blur-md rounded-xl p-1 border border-white/10 flex items-center gap-0.5 shadow-xl scale-95 origin-top-right">
        {/* Module Type Badge */}
        <span className="text-[8px] font-mono text-[#0983B0] font-bold px-2 uppercase tracking-wider select-none">
          {section.type} block
        </span>

        <span className="w-px h-3 bg-white/10 mx-1" />

        {/* Action icons */}
        {onToggleVisibility && (
          <button
            type="button"
            onClick={onToggleVisibility}
            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${
              section.enabled ? "text-[#159665]" : "text-gray-400"
            }`}
            title={section.enabled ? "Hide Section" : "Show Section"}
          >
            {section.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        )}

        {onDuplicate && (
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 rounded hover:bg-white/10 transition-colors text-[#FCBC43]"
            title="Duplicate Section Data"
          >
            <Copy size={12} />
          </button>
        )}

        {/* Telemetry log test trigger */}
        <button
          type="button"
          onClick={() => alert(`Telemetry tracking live preview logs active for block #${section.id}`)}
          className="p-1.5 rounded hover:bg-white/10 transition-colors text-purple-400"
          title="Inspect Telemetry Metrics"
        >
          <BarChart2 size={12} />
        </button>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-500/20 transition-colors text-red-500"
            title="Delete Section Node"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Render core components wrapped in protective boundary shell */}
      <div className={section.enabled ? "opacity-100" : "opacity-30 pointer-events-none filter grayscale"}>
        <SectionErrorBoundary>
          {children}
        </SectionErrorBoundary>
      </div>
    </div>
  );
}

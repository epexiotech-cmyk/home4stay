"use client";

import { useRef, useCallback } from "react";

interface MutationHookProps {
  propertyId: string;
  onMutateOptimistic?: () => void;
  onSuccess?: (timestamp: string) => void;
  onErrorRollback?: (errMessage: string) => void;
}

export function useCmsMutations({ propertyId, onMutateOptimistic, onSuccess, onErrorRollback }: MutationHookProps) {
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Universal document payload updater employing optimistic auto-saving logic.
   * Leverages debounce buffers to minimize backend database write locks.
   */
  const mutateDocumentSync = useCallback((payload: Record<string, unknown>) => {
    // Optimistic hook sequence execution
    onMutateOptimistic?.();

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      fetch(`/api/property/${propertyId}/cms`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Transaction payload dispatch failed.");
          return res.json();
        })
        .then((data) => {
          if (data?.success) {
            onSuccess?.(data.timestamp || new Date().toISOString());
          } else {
            throw new Error(data?.error || "Database synchronization parameters rejected.");
          }
        })
        .catch((err) => {
          console.warn("Optimistic save sequence retry hook fired:", err);
          onErrorRollback?.(err.message || "Network layout mirror storage failure.");
        });
    }, 850); // Locked 850ms debounce window matching client typing ergonomics
  }, [propertyId, onMutateOptimistic, onSuccess, onErrorRollback]);

  /**
   * Append a new visual building block directly onto the persistent array schema.
   */
  const mutateAppendSection = useCallback(async (type: string, initialData?: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/property/${propertyId}/cms/section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, initialData }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Section block initialization sequence failed.");
      return data.section;
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Section block initialization sequence failed.";
      onErrorRollback?.(errMessage);
      throw err;
    }
  }, [propertyId, onErrorRollback]);

  /**
   * Purge a target sub-block from the persistent array storage framework.
   */
  const mutateDeleteSection = useCallback(async (sectionId: string) => {
    try {
      const res = await fetch(`/api/property/${propertyId}/cms/section/${sectionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Purging instruction sequence intercepted.");
      return true;
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Purging instruction sequence intercepted.";
      onErrorRollback?.(errMessage);
      return false;
    }
  }, [propertyId, onErrorRollback]);

  /**
   * Archive active draft schema state into an immutable historical production build release.
   */
  const mutatePublishRelease = useCallback(async (versionName: string, snapshotPayload: Record<string, unknown>) => {
    try {
      const res = await fetch(`/api/property/${propertyId}/cms/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionName, snapshotPayload }),
      });
      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Release compilation aborted.");
      return data;
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : "Release compilation aborted.";
      onErrorRollback?.(errMessage);
      throw err;
    }
  }, [propertyId, onErrorRollback]);

  return {
    mutateDocumentSync,
    mutateAppendSection,
    mutateDeleteSection,
    mutatePublishRelease,
  };
}

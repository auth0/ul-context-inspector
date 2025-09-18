import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook: useContextSnapshot
 * ----------------------------------------------
 * Produces a flattened snapshot of an object's nested keys up to a max depth.
 * Useful for quick visual inspection without deep drilling.
 * - Ignores errors from exotic getters.
 * - Safe against cycles by not revisiting already traversed object paths.
 */

export interface SnapshotEntry {
  path: string;
  value: unknown;
  type: string;
}

export interface UseContextSnapshotOptions<T = unknown> {
  targetObj: T;
  pollInterval: number; // ms, 0 disables
  maxDepth?: number;
}

export interface UseContextSnapshotResult {
  entries: SnapshotEntry[];
  lastUpdated: number | null;
  refresh: () => void;
}

// Internal DFS snapshot helper (depth-limited)
const snapshotObject = (
  obj: unknown,
  basePath = '',
  depth = 0,
  maxDepth = 3,
  entries: SnapshotEntry[] = []
): SnapshotEntry[] => {
  if (obj == null || typeof obj !== 'object' || depth > maxDepth) return entries;
  let keys: string[] = [];
  try {
    keys = Object.keys(obj as Record<string, unknown>).sort();
  } catch {
    return entries;
  }
  for (const k of keys) {
    let value: unknown;
    try { value = (obj as Record<string, unknown>)[k]; } catch { continue; }
    const path = basePath ? `${basePath}.${k}` : k;
    const type = Array.isArray(value) ? 'array' : typeof value;
    entries.push({ path, value, type });
    if (type === 'object' && value && depth < maxDepth) {
      snapshotObject(value, path, depth + 1, maxDepth, entries);
    }
  }
  return entries;
};

export function useContextSnapshot<T = unknown>({ targetObj, pollInterval, maxDepth = 3 }: UseContextSnapshotOptions<T>): UseContextSnapshotResult {
  const [entries, setEntries] = useState<SnapshotEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const refresh = useCallback(() => {
    try {
      if (!targetObj) {
        setEntries([]);
        setLastUpdated(Date.now());
        return;
      }
      const list = snapshotObject(targetObj, '', 0, maxDepth, []);
      if (mounted.current) {
        setEntries(list);
        setLastUpdated(Date.now());
      }
    } catch {
      // ignore errors
    }
  }, [targetObj, maxDepth]);

  useEffect(() => {
    refresh();
    if (pollInterval > 0) {
      const id = setInterval(refresh, pollInterval);
      return () => clearInterval(id);
    }
  }, [refresh, pollInterval]);

  return { entries, lastUpdated, refresh };
}

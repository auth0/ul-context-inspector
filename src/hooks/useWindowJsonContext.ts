import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseWindowJsonContextOptions<Root extends Record<string, unknown>> {
  root: Root;
  key: keyof Root & string;
  active: boolean; // whether panel is open / applying changes
  debounceMs?: number;
  autoSyncOnActive?: boolean; // pull latest window object into raw when (re)activated
  applyEnabled?: boolean; // if false, edits won't be applied back to root
}

export interface WindowJsonContextState {
  raw: string;
  setRaw: (v: string) => void;
  isValid: boolean;
  contextObj: unknown;
  refreshFromSource: () => void; // force pull from window
  applyNow: () => void; // force parse/apply current raw immediately
}

/**
 * Manages a JSON blob living at root[key]. Provides a raw editable string that
 * debounces application back to the root while validating JSON.
 */
export function useWindowJsonContext<Root extends Record<string, unknown>>({
  root,
  key,
  active,
  debounceMs = 400,
  autoSyncOnActive = true,
  applyEnabled = true
}: UseWindowJsonContextOptions<Root>): WindowJsonContextState {
  const [raw, setRaw] = useState('');
  const [isValid, setIsValid] = useState(true);
  const lastAppliedRef = useRef<string | null>(null);
  const debounceRef = useRef<number | null>(null);

  const contextObj = root[key];

  const serialize = useCallback((obj: unknown) => {
    try { return JSON.stringify(obj, null, 2); } catch { return ''; }
  }, []);

  const refreshFromSource = useCallback(() => {
    const str = serialize(contextObj);
    if (str && str !== lastAppliedRef.current) {
      setRaw(str);
      lastAppliedRef.current = str;
    }
  }, [contextObj, serialize]);

  // Sync when (re)activated
  useEffect(() => {
    if (active && autoSyncOnActive && contextObj) {
      refreshFromSource();
    }
  }, [active, contextObj, autoSyncOnActive, refreshFromSource]);

  const applyNow = useCallback(() => {
    if (!applyEnabled) return;
    if (!raw.trim()) return;
    try {
      const parsed = JSON.parse(raw);
  (root as Record<string, unknown>)[key] = parsed as unknown;
      setIsValid(true);
      lastAppliedRef.current = raw;
    } catch {
      setIsValid(false);
    }
  }, [raw, root, key, applyEnabled]);

  // Debounced apply
  useEffect(() => {
    if (!active) return; // don't apply while inactive
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(applyNow, debounceMs);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [raw, active, applyNow, debounceMs, applyEnabled]);

  return { raw, setRaw, isValid, contextObj, refreshFromSource, applyNow };
}

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Hook: useWindowJsonContext
 * ---------------------------------------------
 * Provides a controlled JSON text buffer for a property on a root object
 * (typically `window`). Handles:
 *  - Serialization on activation
 *  - Debounced parse + apply (with validity state)
 *  - Optional suppression of writes (preview mode)
 */

export interface UseWindowJsonContextOptions<Root extends Record<string, unknown>> {
  root: Root;
  key: keyof Root & string;
  active: boolean; // whether panel is open / applying changes
  debounceMs?: number;
  autoSyncOnActive?: boolean; // pull latest window object into raw when (re)activated
  applyEnabled?: boolean; // when false, JSON edits remain local only (no mutation)
  broadcastEventName?: string; // optional CustomEvent name to dispatch after successful apply
}

export interface WindowJsonContextState {
  raw: string;
  setRaw: (v: string) => void;
  isValid: boolean;
  contextObj: unknown;
  refreshFromSource: () => void; // force re-serialize current object into raw
  applyNow: () => void; // force immediate parse/apply (bypassing debounce)
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
  applyEnabled = true,
  broadcastEventName
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
      // Fire a global event so external apps can subscribe & re-render.
      // We deliberately dispatch on window (if present) even if root is a custom object.
    } catch {
      setIsValid(false);
    }
  }, [raw, root, key, applyEnabled]);

  // Keep broadcast event name in a ref to avoid recreating applyNow when only the name changes.
  const broadcastNameRef = useRef<string | undefined>();
  broadcastNameRef.current = broadcastEventName;

  // Wrap applyNow to dispatch after apply (cannot easily inject into existing callback without re-run dependencies).
  const applyWithBroadcast = useCallback(() => {
    applyNow();
    const name = broadcastNameRef.current;
    if (name && typeof window !== 'undefined') {
      try {
        const detail = { key, value: (root as Record<string, unknown>)[key] };
        window.dispatchEvent(new CustomEvent(name, { detail }));
      } catch { /* ignore */ }
    }
  }, [applyNow, key, root]);

  // Debounced apply
  useEffect(() => {
    if (!active) return; // don't apply while inactive
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(applyWithBroadcast, debounceMs);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [raw, active, applyWithBroadcast, debounceMs, applyEnabled]);
  return { raw, setRaw, isValid, contextObj, refreshFromSource, applyNow: applyWithBroadcast };
}
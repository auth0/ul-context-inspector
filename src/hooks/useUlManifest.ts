import { useCallback, useEffect, useMemo, useState } from 'react';

/**
 * Hook: useUlManifest
 * --------------------------------------------------
 * Encapsulates loading and querying a Universal Login manifest.
 * Responsibilities:
 *  - Fetch manifest (local or CDN) when enabled
 *  - Derive screen select options
 *  - Provide variant base path & variant list per screen
 *  - Load specific variant JSON on demand
 *
 * NOTE: Types are intentionally permissive to survive partial / evolving
 * manifest structures.
 */

// Public manifest types (loosely typed to tolerate partial data)
export interface UlManifestVariantNode {
  path?: string;
  variants?: string[];
  [k: string]: unknown; // future fields
}

export type UlManifestScreenEntry = Record<string, Record<string, UlManifestVariantNode>>;

export interface UlManifest {
  screens: UlManifestScreenEntry[];
  versions?: string[];
  [k: string]: unknown;
}

export interface UseUlManifestOptions {
  root: Record<string, unknown>;
  dataSource: string; // e.g. 'Auth0 CDN' | 'Local'
  version?: string;
  enabled: boolean; // only fetch when enabled (panel open + disconnected)
}

export interface UseUlManifestResult {
  manifest: UlManifest | null;
  loading: boolean;
  error: string | null;
  screenOptions: { value: string; label: string }[];
  getVariantInfo: (screenValue: string) => { basePath: string; variants: string[] } | null;
  loadVariantJson: (screenValue: string, variant: string) => Promise<unknown | null>;
}

const isUlManifest = (m: unknown): m is UlManifest => {
  return !!m && typeof m === 'object' && Array.isArray((m as UlManifest).screens);
};

export function useUlManifest({ root, dataSource, version, enabled }: UseUlManifestOptions): UseUlManifestResult {
  const [manifest, setManifest] = useState<UlManifest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch manifest when toggled enabled (panel open + disconnected)
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const local = dataSource.toLowerCase().includes('local');
        const url = local ? '/manifest.json' : 'https://cdn.auth0.com/universal-login/manifest.json'; // placeholder CDN path
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        if (isUlManifest(json)) {
          (root as Record<string, unknown>).__ul_manifest = json;
          setManifest(json);
        } else {
          throw new Error('Invalid manifest shape');
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load manifest');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [enabled, dataSource, version, root]);

  const screenOptions = useMemo(() => {
    if (!manifest) return [];
    const opts: { value: string; label: string }[] = [];
    for (const entry of manifest.screens) {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        for (const topKey of Object.keys(entry)) {
          const container = (entry as Record<string, Record<string, UlManifestVariantNode>>)[topKey];
          if (container && typeof container === 'object') {
            for (const childKey of Object.keys(container)) {
              opts.push({ value: `${topKey}:${childKey}`, label: `${topKey} / ${childKey}` });
            }
          }
        }
      }
    }
    return opts;
  }, [manifest]);

  const getVariantInfo = useCallback((screenValue: string) => {
    if (!manifest) return null;
    const [topKey, childKey] = screenValue.split(':');
    for (const entry of manifest.screens) {
      if (entry[topKey] && entry[topKey][childKey]) {
        const node = entry[topKey][childKey];
        const basePath = (node.path || `/screens/${topKey}/${childKey}`).replace(/\/$/, '');
        const variants = Array.isArray(node.variants) ? node.variants.filter(v => typeof v === 'string') as string[] : [];
        return { basePath, variants: variants.length ? variants : ['default'] };
      }
    }
    return null;
  }, [manifest]);

  const loadVariantJson = useCallback(async (screenValue: string, variant: string) => {
    const info = getVariantInfo(screenValue);
    if (!info) return null;
    const { basePath } = info;
    const filePath = `${basePath}/${variant}.json`;
    const local = dataSource.toLowerCase().includes('local');
    const url = local ? (filePath.startsWith('/') ? filePath : '/' + filePath)
      : `https://cdn.auth0.com/universal-login${filePath.startsWith('/') ? filePath : '/' + filePath}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, [getVariantInfo, dataSource]);

  return { manifest, loading, error, screenOptions, getVariantInfo, loadVariantJson };
}

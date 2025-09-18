import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef
} from "react";
import "../lib/tailwind.css";
import "../lib/styles.css";
import "prismjs/themes/prism-tomorrow.css"; // theme (can swap or override)
import { useWindowJsonContext } from '../hooks/useWindowJsonContext';
import { JsonCodeEditor } from './JsonCodeEditor';

/**
 * State 1: Connected to tenant.
 * Sliding full-height panel from the left that edits window.universal_login_context.
 */

export interface UniversalLoginContextPanelProps {
  defaultOpen?: boolean;
  width?: number | string;
  root?: WindowLike;
  screenLabel?: string;
  variants?: string[]; // available variant options
  dataSources?: string[]; // e.g. ['Auth0 CDN','Local']
  versions?: string[]; // version tags
  defaultVariant?: string;
  defaultDataSource?: string;
  defaultVersion?: string;
  onVariantChange?: (value: string) => void;
  onDataSourceChange?: (value: string) => void;
  onVersionChange?: (value: string) => void;
}

interface WindowLike {
  universal_login_context?: unknown;
  [k: string]: unknown;
}

export const UniversalLoginContextPanel: React.FC<UniversalLoginContextPanelProps> = ({
  defaultOpen = false,
  width = 560,
  root = typeof window !== "undefined"
    ? (window as unknown as WindowLike)
    : ({} as WindowLike),
  screenLabel = "Current Screen",
  variants = ["default"],
  dataSources = ["Auth0 CDN", "Local"],
  versions = ["1.0.0"],
  defaultVariant,
  defaultDataSource,
  defaultVersion,
  onVariantChange,
  onDataSourceChange,
  onVersionChange
}) => {
  const [open, setOpen] = useState(defaultOpen);
  // Track whether a tenant context existed at mount time; this defines true connectivity.
  const initialHadContextRef = useRef<boolean>(
    Object.prototype.hasOwnProperty.call(root, 'universal_login_context') &&
    (root as Record<string, unknown>).universal_login_context != null
  );
  const { raw, setRaw, isValid, contextObj } = useWindowJsonContext({
    root,
    key: 'universal_login_context',
    active: open,
    debounceMs: 400,
    autoSyncOnActive: true,
    // Only allow applying edits back to window if we started already connected
    applyEnabled: initialHadContextRef.current
  });
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState("");
  // Connectivity is defined exclusively by initial presence, not by later local preview loads.
  const isConnected = initialHadContextRef.current && !!contextObj;
  const manifest = (root as Record<string, unknown>).__ul_manifest as unknown;

  // Build screen options from manifest when available
  interface ULManifest { screens: unknown[] }
  const isManifest = (m: unknown): m is ULManifest => {
    if (!m || typeof m !== 'object') return false;
    const rec = m as Record<string, unknown>;
    return Array.isArray((rec as { screens?: unknown }).screens);
  };
  const screenOptions = useMemo(() => {
    if (!isManifest(manifest)) return [] as { value: string; label: string }[];
    const opts: { value: string; label: string }[] = [];
    for (const entry of manifest.screens) {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        const topKeys = Object.keys(entry as Record<string, unknown>);
        if (topKeys.length === 1) {
          const topKey = topKeys[0];
          const container = (entry as Record<string, unknown>)[topKey];
          if (container && typeof container === 'object' && !Array.isArray(container)) {
            const childKeys = Object.keys(container as Record<string, unknown>);
            if (childKeys.length === 1) {
              const childKey = childKeys[0];
              opts.push({ value: `${topKey}:${childKey}`, label: `${topKey} / ${childKey}` });
            }
          }
        }
      }
    }
    return opts;
  }, [manifest]);
  // Selection state (screen + variant/dataSource/version)
  const [selectedScreen, setSelectedScreen] = useState<string | undefined>(undefined);
  const [variant, setVariant] = useState(() => defaultVariant || variants[0]);
  const [dataSource, setDataSource] = useState(() => defaultDataSource || dataSources[0]);
  const [version, setVersion] = useState(() => defaultVersion || versions[0]);
  useEffect(() => {
    if (!selectedScreen && screenOptions.length) setSelectedScreen(screenOptions[0].value);
  }, [screenOptions, selectedScreen]);

  // Variant options derived from selected screen & manifest
  const variantOptions = useMemo(() => {
    if (!selectedScreen || !isManifest(manifest)) return variants;
    const [topKey, childKey] = selectedScreen.split(':');
    for (const entry of manifest.screens) {
      if (entry && typeof entry === 'object' && !Array.isArray(entry) && Object.prototype.hasOwnProperty.call(entry, topKey)) {
        const container = (entry as Record<string, unknown>)[topKey];
        if (container && typeof container === 'object' && !Array.isArray(container)) {
          const inner = (container as Record<string, unknown>)[childKey];
          if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
            const list = (inner as Record<string, unknown>).variants;
            if (Array.isArray(list)) {
              const cleaned = list.filter(v => typeof v === 'string') as string[];
              if (cleaned.length) return cleaned;
            }
          }
        }
      }
    }
    return variants;
  }, [selectedScreen, manifest, variants]);

  // Ensure current variant exists in new derived list
  useEffect(() => {
    if (!variantOptions.includes(variant)) {
      setVariant(variantOptions[0]);
    }
  }, [variantOptions, variant]);

  // Load variant JSON when disconnected (simulate context initialization)
  useEffect(() => {
  if (!open || isConnected) return; // only when disconnected (preview mode)
    if (!selectedScreen || !variant) return;
    if (!isManifest(manifest)) return;
    const [topKey, childKey] = selectedScreen.split(':');
    let basePath: string | undefined;
    for (const entry of manifest.screens) {
      if (entry && typeof entry === 'object' && !Array.isArray(entry) && Object.prototype.hasOwnProperty.call(entry, topKey)) {
        const container = (entry as Record<string, unknown>)[topKey];
        if (container && typeof container === 'object' && !Array.isArray(container)) {
          const inner = (container as Record<string, unknown>)[childKey];
          if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
            const p = (inner as Record<string, unknown>).path;
            if (typeof p === 'string') basePath = p;
          }
        }
      }
    }
    if (!basePath) basePath = `/screens/${topKey}/${childKey}`;
    basePath = basePath.replace(/\/$/, '');
    const filePath = `${basePath}/${variant}.json`;
    const url = dataSource.toLowerCase() === 'local'
      ? (filePath.startsWith('/') ? filePath : '/' + filePath)
      : `https://cdn.auth0.com/universal-login${filePath.startsWith('/') ? filePath : '/' + filePath}`;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
  // Populate preview buffer only; do NOT create global context while disconnected.
  setRaw(JSON.stringify(json, null, 2));
      } catch {
        // ignore silently for now
      }
    })();
    return () => { cancelled = true; };
  }, [open, isConnected, selectedScreen, variant, manifest, dataSource, setRaw, root]);


  const handleVariant = useCallback((v: string) => {
    setVariant(v); onVariantChange?.(v);
  }, [onVariantChange]);
  const handleDataSource = useCallback((v: string) => {
    setDataSource(v); onDataSourceChange?.(v);
  }, [onDataSourceChange]);
  const handleVersion = useCallback((v: string) => {
    setVersion(v); onVersionChange?.(v);
  }, [onVersionChange]);

  // Manifest loading when disconnected (local or CDN)
  const [manifestLoading, setManifestLoading] = useState(false);
  const [manifestError, setManifestError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || isConnected) return; // only when panel open and disconnected
    let cancelled = false;
    const load = async () => {
      setManifestLoading(true);
      setManifestError(null);
      try {
        const url = dataSource.toLowerCase().startsWith('auth0')
          ? `https://cdn.auth0.com/universal-login/manifest.json` // placeholder CDN path
          : `/manifest.json`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // Stash into root under a symbol key (augmenting type minimally)
        (root as Record<string, unknown>).__ul_manifest = json;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load manifest';
        if (!cancelled) setManifestError(msg);
      } finally {
        if (!cancelled) setManifestLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [open, isConnected, dataSource, version, root]);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(raw);
    } catch {
      /* ignore */
    }
  }, [raw]);

  const onDownload = useCallback(() => {
    try {
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tenant-context.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }, [raw]);

  const filteredDisplay = useMemo(() => {
    if (!search) return raw;
    const lower = search.toLowerCase();
    return raw
      .split(/\n/)
      .filter((line) => line.toLowerCase().includes(lower))
      .join("\n");
  }, [raw, search]);

  // Panel fully hidden when closed (no persistent handle)
  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open tenant context panel"
        onClick={() => setOpen(true)}
        className="uci-fixed uci-top-1/2 uci--translate-y-1/2 uci-left-4 uci-bg-indigo-600 hover:uci-bg-indigo-500 uci-text-white uci-font-medium uci-text-xs uci-px-3 uci-py-2 uci-rounded uci-shadow uci-z-[99998]"
      >
        Tenant Context Data
      </button>
    );
  }

  return (
    <div
  className="uci-fixed uci-top-0 uci-left-0 uci-h-screen uci-bg-gray-900 uci-text-white uci-shadow-xl uci-border-r uci-border-gray-700 uci-flex uci-flex-col uci-z-[99998] uci-transition-transform uci-duration-300 uci-ease-out uci-overflow-hidden uci-box-border"
      style={{ width, transform: open ? "translateX(0)" : "translateX(-100%)" }}
    >
      {/* Header with title + close */}
      <div className="uci-flex uci-items-center uci-justify-between uci-px-5 uci-py-3 uci-border-b uci-border-gray-700">
        <div className="uci-flex uci-items-center uci-gap-2">
          <h2 className="uci-text-sm uci-font-semibold uci-tracking-wide">
            Tenant Context Data
          </h2>
          {isConnected ? (
            <span className="uci-inline-flex uci-items-center uci-rounded-full uci-bg-green-600 uci-text-white uci-text-[10px] uci-font-medium uci-px-2 uci-py-0.5">
              Connected to tenant
            </span>
          ) : (
            <span className="uci-inline-flex uci-items-center uci-rounded-full uci-bg-amber-600 uci-text-white uci-text-[10px] uci-font-medium uci-px-2 uci-py-0.5">
              Not connected
            </span>
          )}
        </div>
        <IconButton label="Close" onClick={() => setOpen(false)}>
          <CloseIcon />
        </IconButton>
      </div>

      {/* Screen selection (from manifest when available) */}
      <div className="uci-px-5 uci-py-3 uci-border-b uci-border-gray-800">
        <select
          className="uci-w-full uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-px-2 uci-py-1 disabled:uci-opacity-60"
          disabled={!screenOptions.length}
          value={selectedScreen || ''}
          onChange={e => setSelectedScreen(e.target.value)}
        >
          {screenOptions.length === 0 && <option value="">{screenLabel}</option>}
          {screenOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {!isConnected && (
        <>
          {/* Variant (full width row, manifest-driven) */}
          <div className="uci-px-5 uci-py-3 uci-border-b uci-border-gray-800">
            <select
              className="uci-w-full uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-px-2 uci-py-1"
              value={variant}
              onChange={e => handleVariant(e.target.value)}
              disabled={!variantOptions.length}
            >
              {variantOptions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {/* Data Source + Version (split row) */}
            <div className="uci-px-5 uci-py-3 uci-border-b uci-border-gray-800">
              {dataSource.toLowerCase() === 'local' ? (
                <select
                  className="uci-w-full uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-px-2 uci-py-1"
                  value={dataSource}
                  onChange={e => handleDataSource(e.target.value)}
                >
                  {dataSources.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <div className="uci-flex uci-gap-3">
                  <select
                    className="uci-w-1/2 uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-px-2 uci-py-1"
                    value={dataSource}
                    onChange={e => handleDataSource(e.target.value)}
                  >
                    {dataSources.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    className="uci-w-1/2 uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-px-2 uci-py-1"
                    value={version}
                    onChange={e => handleVersion(e.target.value)}
                  >
                    {versions.map(ver => <option key={ver} value={ver}>{ver}</option>)}
                  </select>
                </div>
              )}
            </div>
            {manifestLoading && (
              <div className="uci-px-5 uci-py-2 uci-text-[11px] uci-text-gray-400 uci-border-b uci-border-gray-800">Loading manifest…</div>
            )}
            {manifestError && (
              <div className="uci-px-5 uci-py-2 uci-text-[11px] uci-text-red-400 uci-border-b uci-border-gray-800">{manifestError}</div>
            )}
        </>
      )}

      {/* Action icons row (right-aligned): search, download, copy */}
      <div className="uci-flex uci-items-center uci-justify-end uci-gap-2 uci-px-5 uci-py-2.5 uci-border-b uci-border-gray-800">
        <IconButton
          label="Search"
          onClick={() => setSearchVisible((v) => !v)}
          active={searchVisible}
        >
          <SearchIcon />
        </IconButton>
        <IconButton label="Download JSON" onClick={onDownload}>
          <DownloadIcon />
        </IconButton>
        <IconButton label="Copy JSON" onClick={onCopy}>
          <CopyIcon />
        </IconButton>
      </div>

      {searchVisible && (
        <div className="uci-px-5 uci-py-2.5 uci-border-b uci-border-gray-800 uci-min-w-0">
          <div className="uci-min-w-0">
            <input
              type="text"
              className="uci-w-full uci-bg-gray-800 uci-border uci-border-gray-600 focus:uci-ring-2 focus:uci-ring-indigo-500 uci-rounded uci-text-xs uci-px-2 uci-py-1"
              placeholder="Search (filters lines)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="uci-flex-1 uci-overflow-hidden uci-flex uci-flex-col">
        <div className="uci-flex-1 uci-overflow-auto uci-px-5 uci-pt-4 uci-pb-8">
          <JsonCodeEditor
            value={search ? filteredDisplay : raw}
            onChange={setRaw}
            readOnly={Boolean(search || !isConnected)}
            isValid={isValid}
            filtered={Boolean(search)}
            textareaId="tenant-context-json-editor"
          />
        </div>
      </div>
    </div>
  );
};

const IconButton: React.FC<
  React.PropsWithChildren<{
    label: string;
    onClick: () => void;
    active?: boolean;
  }>
> = ({ label, onClick, children, active }) => (
  <button
    className={`uci-p-1 uci-rounded uci-border uci-text-gray-200 hover:uci-bg-gray-700 uci-border-gray-600 uci-transition-colors ${
      active ? "uci-bg-gray-700" : "uci-bg-gray-800"
    }`}
    title={label}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const CopyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

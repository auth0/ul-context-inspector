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
import { useUlManifest } from '../hooks/useUlManifest';
import { JsonCodeEditor } from './JsonCodeEditor';

/**
 * UniversalLoginContextPanel
 * -------------------------------------------------------------
 * Primary developer tool surface for inspecting / editing a JSON blob
 * exposed as `window.universal_login_context` (or overridden via `root`).
 *
 * Two conceptual modes:
 * 1. Connected: A context object already existed at mount. Edits persist
 *    (debounced) back to the global object.
 * 2. Disconnected Preview: No context existed initially. A manifest can be
 *    loaded (local or CDN) to preview screen + variant JSON. This does NOT
 *    mutate global state unless the data source is explicitly Local (opt‑in
 *    promotion) or a future explicit action is added.
 *
 * Key design choices:
 * - "Connected" status is sticky based solely on initial presence; we avoid
 *   accidentally declaring connection after loading a preview.
 * - Manifest logic is encapsulated in `useUlManifest` to keep this component
 *   focused on orchestration & presentation.
 * - JSON state management & debounced write handled by `useWindowJsonContext`.
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
  defaultOpen = true,
  width = 560,
  root = typeof window !== "undefined"
    ? (window as unknown as WindowLike)
    : ({} as WindowLike),
  screenLabel = "Current Screen",
  variants = ["default"],
  dataSources = ["Auth0 CDN", "Local development"],
  versions = ["1.0.0"],
  defaultVariant,
  defaultDataSource,
  defaultVersion,
  onVariantChange,
  onDataSourceChange,
  onVersionChange
}) => {
  const [open, setOpen] = useState(defaultOpen);
  // Immutable flag: did a context exist when we mounted? Defines true connectivity.
  const initialHadContextRef = useRef<boolean>(
    Object.prototype.hasOwnProperty.call(root, 'universal_login_context') &&
    (root as Record<string, unknown>).universal_login_context != null
  );
  // Selection state for disconnected preview UX.
  const [selectedScreen, setSelectedScreen] = useState<string | undefined>(undefined);
  const [variant, setVariant] = useState(() => defaultVariant || variants[0]);
  const [dataSource, setDataSource] = useState(() => defaultDataSource || dataSources[0]);
  const [version, setVersion] = useState(() => defaultVersion || versions[0]);
  // Tracks if the user has manually edited the JSON buffer while disconnected.
  // If true we avoid clobbering their edits when selection changes trigger
  // manifest fetches. Selecting a new variant/data source/version resets it.
  const [userEdited, setUserEdited] = useState(false);

  const { raw, setRaw, isValid, contextObj } = useWindowJsonContext({
    root,
    key: 'universal_login_context',
    active: open,
    debounceMs: 400,
    autoSyncOnActive: true,
    // Always allow writes (edit in any mode requested).
  applyEnabled: true,
  // Emit a CustomEvent so host apps using the subscription hook re-render.
  broadcastEventName: 'universal-login-context:updated'
  });
  const [searchVisible, setSearchVisible] = useState(false);
  const [search, setSearch] = useState("");
  // True connectivity defined exclusively by initial presence (prevents accidental promotion).
  const isConnected = initialHadContextRef.current && !!contextObj;
  // Manifest (only loaded while disconnected & panel open)
  const { screenOptions, getVariantInfo, loadVariantJson, loading: manifestLoading, error: manifestError } = useUlManifest({
    root: root as Record<string, unknown>,
    dataSource,
    version,
    enabled: open && !isConnected
  });
  // Auto-select first screen once manifest arrives.
  useEffect(() => {
    if (!selectedScreen && screenOptions.length) setSelectedScreen(screenOptions[0].value);
  }, [screenOptions, selectedScreen]);

  // Derive variant options from manifest (fallback to provided variants prop).
  const variantOptions = useMemo(() => {
    if (!selectedScreen) return variants;
    const info = getVariantInfo(selectedScreen);
    return info ? info.variants : variants;
  }, [selectedScreen, getVariantInfo, variants]);

  // Ensure selected variant remains valid when options change.
  useEffect(() => {
    if (!variantOptions.includes(variant)) {
      setVariant(variantOptions[0]);
    }
  }, [variantOptions, variant]);

  // Load variant JSON while disconnected to populate preview buffer only.
  useEffect(() => {
    if (!open || isConnected) return;            // only for disconnected preview
    if (!selectedScreen || !variant) return;     // need selection
    if (userEdited) return;                      // preserve manual edits
    let cancelled = false;
    (async () => {
      try {
        const json = await loadVariantJson(selectedScreen, variant);
        if (!cancelled && json) setRaw(JSON.stringify(json, null, 2));
      } catch {
        /* silent */
      }
    })();
    return () => { cancelled = true; };
  }, [open, isConnected, selectedScreen, variant, loadVariantJson, setRaw, userEdited]);


  const handleVariant = useCallback((v: string) => {
    setVariant(v);
    setUserEdited(false); // new selection should allow fresh manifest load
    onVariantChange?.(v);
  }, [onVariantChange]);
  const handleDataSource = useCallback((v: string) => {
    setDataSource(v);
    setUserEdited(false);
    onDataSourceChange?.(v);
  }, [onDataSourceChange]);
  const handleVersion = useCallback((v: string) => {
    setVersion(v);
    setUserEdited(false);
    onVersionChange?.(v);
  }, [onVersionChange]);

  // (Manifest fetch handled by useUlManifest)

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(raw);
    } catch {
      /* ignore */
    }
  }, [raw]);

  const onDownload = useCallback(() => {
    try {
      const screenPart = (selectedScreen || 'screen').replace(/:/g, '-');
      const safe = (s: string) => s.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/^-+|-+$/g, '') || 'context';
      const fileName = `${safe(screenPart)}-context.json`;
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }
  }, [raw, variant, selectedScreen]);

  // Line-level filtering for lightweight search UX (non-destructive view layer only).
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
  {/* Header / status */}
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

  {/* Screen selection (populated via manifest) */}
      <div className="uci-px-5 uci-py-3 uci-border-b uci-border-gray-800">
        <select
          className="uci-w-full uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-text-gray-100 uci-px-2 uci-py-1 disabled:uci-opacity-60"
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
          {/* Variant selection */}
          <div className="uci-px-5 uci-py-3 uci-border-b uci-border-gray-800">
            <select
              className="uci-w-full uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-text-gray-100 uci-px-2 uci-py-1"
              value={variant}
              onChange={e => handleVariant(e.target.value)}
              disabled={!variantOptions.length}
            >
              {variantOptions.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          {/* Data Source + Version (version hidden in local mode) */}
            <div className="uci-px-5 uci-py-3 uci-border-b uci-border-gray-800">
              {dataSource.toLowerCase().includes('local') ? (
                <select
                  className="uci-w-full uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-text-gray-100 uci-px-2 uci-py-1"
                  value={dataSource}
                  onChange={e => handleDataSource(e.target.value)}
                >
                  {dataSources.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              ) : (
                <div className="uci-flex uci-gap-3">
                  <select
                    className="uci-w-1/2 uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-text-gray-100 uci-px-2 uci-py-1"
                    value={dataSource}
                    onChange={e => handleDataSource(e.target.value)}
                  >
                    {dataSources.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    className="uci-w-1/2 uci-bg-gray-800 uci-border uci-border-gray-600 uci-rounded uci-text-xs uci-text-gray-100 uci-px-2 uci-py-1"
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

  {/* Toolbar: search toggle, download, copy */}
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
            onChange={(val) => {
              // If user begins editing while a filter is active we clear the filter
              // so they are always editing the canonical full buffer, avoiding
              // accidental truncation of hidden lines.
              if (search) setSearch("");
              setUserEdited(true);
              setRaw(val);
            }}
            readOnly={false} // Always editable per requirements.
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

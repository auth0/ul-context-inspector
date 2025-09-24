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
import PanelHeader from './PanelHeader';
import PanelContainer from './PanelContainer';
import PanelSelectContext from './PanelSelectContext';

import { IconButton, SearchIcon, CopyIcon, DownloadIcon } from '../assets/icons';

import type { UniversalLoginContextPanelProps, WindowLike } from '../types/universal-login-context-panel';

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

  const { raw, setRaw, isValid, contextObj } = useWindowJsonContext({
    root,
    key: 'universal_login_context',
    active: open,
    debounceMs: 400,
    autoSyncOnActive: true,
    // Allow writes only if we started connected OR explicitly in local mode.
    applyEnabled: initialHadContextRef.current || dataSource.toLowerCase().includes('local')
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
    if (!open || isConnected) return;
    if (!selectedScreen || !variant) return;
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
  }, [open, isConnected, selectedScreen, variant, loadVariantJson, setRaw]);


  const handleVariant = useCallback((v: string) => {
    setVariant(v); onVariantChange?.(v);
  }, [onVariantChange]);

  const handleDataSource = useCallback((v: string) => {
    setDataSource(v); onDataSourceChange?.(v);
  }, [onDataSourceChange]);

  const handleVersion = useCallback((v: string) => {
    setVersion(v); onVersionChange?.(v);
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
        aria-label="Open UL context data panel"
        onClick={() => setOpen(true)}
        className="uci-fixed uci-top-1/4 uci-left-10 uci-bg-indigo-600 hover:uci-bg-indigo-800 uci-text-white uci-font-medium uci-px-3 uci-py-2 uci-rounded uci-z-[99998]"
      >
        Open UL Context Data Panel
      </button>
    );
  }

  return (
    <PanelContainer width={width} open={open}>
      <PanelHeader
        isConnected={isConnected}
        isConnectedText="Connected to Tenant"
        isNotConnectedText="Not connected to tenant"
        setOpen={setOpen}
        title="Tenant context data"
      />

      <PanelSelectContext
        dataSourceOptions={dataSources}
        dataVersionOptions={versions}
        isConnected={isConnected}
        onChangeSelectDataSource={(event) => handleDataSource(event.target.value as string)}
        onChangeSelectDataVersion={(event) => handleVersion(event.target.value as string)}
        onChangeSelectScreen={(event) => setSelectedScreen(event.target.value as string)}
        onChangeSelectVariant={(event) => handleVariant(event.target.value as string)}
        screenOptions={screenOptions}
        selectedDataSource={dataSource}
        selectedDataVersion={version}
        selectedScreen={selectedScreen}
        selectedVariant={variant}
        setSelectedScreen={setSelectedScreen}
        variantOptions={variantOptions}
      />

      {/* TODO: Test manifestLoading/error */}
      {manifestLoading && (
        <div className="uci-px-5 uci-py-2 uci-text-[11px] uci-text-gray-400 uci-border-b uci-border-gray-800">Loading manifest…</div>
      )}
      {manifestError && (
        <div className="uci-px-5 uci-py-2 uci-text-[11px] uci-text-red-400 uci-border-b uci-border-gray-800">{manifestError}</div>
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
            onChange={setRaw}
            readOnly={Boolean(search || !isConnected)}
            isValid={isValid}
            filtered={Boolean(search)}
            textareaId="tenant-context-json-editor"
          />
        </div>
      </div>
    </PanelContainer>
  );
};

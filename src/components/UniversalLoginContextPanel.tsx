import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef
} from "react";

import "../lib/tailwind.css";
import "../lib/styles.css";
import "prismjs/themes/prism-tomorrow.css";

import { useWindowJsonContext } from '../hooks/useWindowJsonContext';
import { useUlManifest } from '../hooks/useUlManifest';

import { JsonCodeEditor } from './JsonCodeEditor';
import PanelHeader from './PanelHeader';
import PanelContainer from './PanelContainer';
import PanelSelectContext from './PanelSelectContext';
import PanelCodeEditorContainer from './PanelCodeEditorContainer';
import PanelToggleButton from './PanelToggleButton';

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
    // Allow writes only if we started connected OR explicitly in local mode.
    // applyEnabled: initialHadContextRef.current || dataSource.toLowerCase().includes('local')
    // Always allow writes (edit in any mode requested).
    applyEnabled: true,
    // Emit a CustomEvent so host apps using the subscription hook re-render.
    broadcastEventName: 'universal-login-context:updated'
  });

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [search, setSearch] = useState("");

  // True connectivity defined exclusively by initial presence (prevents accidental promotion).
  const isConnected = initialHadContextRef.current && !!contextObj;

  const panelTitle = isConnected ? "Tenant context data" : "Mock context data";

  // Manifest (only loaded while disconnected & panel open)
  const { manifest, screenOptions, getVariantInfo, loadVariantJson, loading: manifestLoading, error: manifestError } = useUlManifest({
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

  // Derive version options from manifest (fallback to provided versions prop).
  const versionOptions = useMemo(() => {
    return manifest?.versions && manifest.versions.length > 0 ? manifest.versions : versions;
  }, [manifest, versions]);

  // Auto-select latest version when manifest loads
  useEffect(() => {
    if (manifest?.versions && manifest.versions.length > 0 && !manifest.versions.includes(version)) {
      setVersion(manifest.versions[0]);
    }
  }, [manifest, version]);

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

  // Line-level filtering for search - tracks line indices for editable filtered view
  const { filteredDisplay, filteredLineIndices } = useMemo(() => {
    if (!search) return { filteredDisplay: raw, filteredLineIndices: null };
    const lower = search.toLowerCase();
    const lines = raw.split('\n');
    const matchedIndices: number[] = [];
    const matchedLines: string[] = [];
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lower)) {
        matchedIndices.push(index);
        matchedLines.push(line);
      }
    });
    
    return {
      filteredDisplay: matchedLines.join('\n'),
      filteredLineIndices: matchedIndices
    };
  }, [raw, search]);

  // Handle edits to filtered content by mapping back to original lines
  const handleFilteredEdit = useCallback((editedFiltered: string) => {
    if (!search || !filteredLineIndices) {
      // No filter active, direct edit
      setUserEdited(true);
      setRaw(editedFiltered);
      return;
    }

    // Map edited filtered lines back to original content
    const originalLines = raw.split('\n');
    const editedLines = editedFiltered.split('\n');
    
    // Update only the filtered lines in the original content
    editedLines.forEach((editedLine, filterIndex) => {
      const originalIndex = filteredLineIndices[filterIndex];
      if (originalIndex !== undefined && originalIndex < originalLines.length) {
        originalLines[originalIndex] = editedLine;
      }
    });
    
    setUserEdited(true);
    setRaw(originalLines.join('\n'));
  }, [raw, search, filteredLineIndices]);

  // Panel fully hidden when closed (no persistent handle)
  if (!open) {
    return (
      <PanelToggleButton
        onClick={() => setOpen(true)}
        panelTitle={panelTitle}
      />
    );
  }

  return (
    <PanelContainer width={width} open={open}>
      <div>
        <PanelHeader
          isConnected={isConnected}
          isConnectedText="Connected to Tenant"
          isNotConnectedText="Not connected to tenant"
          setOpen={setOpen}
          title={panelTitle}
        />

        <PanelSelectContext
          dataSourceOptions={dataSources}
          dataVersionOptions={versionOptions}
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

        {/* TODO: should be displayed? in console or elsewhere? */}
        {manifestLoading && (
          <div className="uci-py-2 uci-text-[11px] uci-text-gray-400 uci-border-b uci-border-gray-800">Loading manifest…</div>
        )}
        {manifestError && (
          <div className="uci-py-2 uci-text-[11px] uci-text-red-400 uci-border-b uci-border-gray-800">{manifestError}</div>
        )}
      </div>

      <PanelCodeEditorContainer
        onSearchButtonClick={() => setIsSearchVisible((v) => !v)}
        onDownloadButtonClick={onDownload}
        onCopyButtonClick={onCopy}
        isSearchVisible={isSearchVisible}
        onChangeSearch={(event: { target: { value: string; }; }) => setSearch(event.target.value as string)}
        onCloseButtonClick={() => { setIsSearchVisible(false); setSearch(''); }}
        searchValue={search}
      >
        {(codeWrap) => (
          <JsonCodeEditor
            value={search ? filteredDisplay : raw}
            onChange={handleFilteredEdit}
            readOnly={false}
            isValid={isValid}
            textareaId="tenant-context-json-editor"
            codeWrap={codeWrap}
          />
        )}
      </PanelCodeEditorContainer>
    </PanelContainer>
  );
};

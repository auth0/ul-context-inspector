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

import { useWindowJsonContext } from "../hooks/useWindowJsonContext";
import { useUlManifest, type UlManifest } from "../hooks/useUlManifest";

import { JsonCodeEditor } from "./JsonCodeEditor";
import PanelHeader from "./PanelHeader";
import PanelContainer from "./PanelContainer";
import PanelSelectContext from "./PanelSelectContext";
import PanelCodeEditorContainer from "./PanelCodeEditorContainer";
import PanelToggleButton from "./PanelToggleButton";

import type {
  UniversalLoginContextPanelProps,
  WindowLike
} from "../types/universal-login-context-panel";

export const UniversalLoginContextPanel: React.FC<
  UniversalLoginContextPanelProps
> = ({ defaultScreen }) => {
  // Fixed configuration values
  const width = 560;
  const variants: string[] = ["default"]; // mutable for type compatibility
  const dataSources: string[] = ["Auth0 CDN", "Local development"]; // mutable
  const versions: string[] = ["0"]; // mutable
  const defaultVariant = variants[0];
  const defaultDataSource = dataSources[0];
  const defaultVersion = versions[0];
  const root: WindowLike =
    typeof window !== "undefined"
      ? (window as unknown as WindowLike)
      : ({} as WindowLike);

  const [open, setOpen] = useState(true);

  // Session storage keys (scoped to component)
  const PREFIX = "ulci:"; // context inspector prefix
  const SESSION_KEYS = {
    screen: PREFIX + "selectedScreen",
    variant: PREFIX + "selectedVariant",
    dataSource: PREFIX + "selectedDataSource",
    version: PREFIX + "selectedVersion"
  } as const;

  // Immutable flag: did a context exist when we mounted? Defines true connectivity.
  const initialHadContextRef = useRef<boolean>(
    Object.prototype.hasOwnProperty.call(root, "universal_login_context") &&
      (root as Record<string, unknown>).universal_login_context != null
  );

  // Selection state for disconnected preview UX.
  const getSessionValue = (key: string): string | undefined => {
    if (typeof window === "undefined") return undefined;
    try {
      return sessionStorage.getItem(key) || undefined;
    } catch {
      return undefined;
    }
  };

  const [selectedScreen, setSelectedScreen] = useState<string | undefined>(
    () => {
      const sessionVal = getSessionValue(SESSION_KEYS.screen);
      // Only use defaultScreen if no prior session value exists.
      if (sessionVal) return sessionVal;
      // If no defaultScreen provided and we're in CDN mode on first load, prefer 'login-id:login-id'.
      const initialDataSource =
        getSessionValue(SESSION_KEYS.dataSource) || defaultDataSource;
      if (!defaultScreen && initialDataSource === "Auth0 CDN") {
        return "login-id:login-id";
      }
      return defaultScreen;
    }
  );
  const [variant, setVariant] = useState(() => {
    return (
      getSessionValue(SESSION_KEYS.variant) || defaultVariant || variants[0]
    );
  });
  const [dataSource, setDataSource] = useState<string>(() => {
    const sessionVal = getSessionValue(SESSION_KEYS.dataSource);
    if (sessionVal) return sessionVal;
    // Placeholder initial; may be overridden by early local manifest check effect below.
    return defaultDataSource || dataSources[0];
  });
  const [version, setVersion] = useState(() => {
    return (
      getSessionValue(SESSION_KEYS.version) || defaultVersion || versions[0]
    );
  });
  const [localManifestData, setLocalManifestData] = useState<UlManifest | null>(
    null
  );
  // Initialization gate so we can attempt local manifest detection before enabling manifest fetch/persistence.
  const [initReady, setInitReady] = useState(false);
  // Tracks if the user has manually edited the JSON buffer while disconnected.
  // If true we avoid clobbering their edits when selection changes trigger
  // manifest fetches. Selecting a new variant/data source/version resets it.
  const [userEdited, setUserEdited] = useState(false);

  const { raw, setRaw, isValid, contextObj } = useWindowJsonContext({
    root,
    key: "universal_login_context",
    active: open,
    debounceMs: 400,
    autoSyncOnActive: true,
    // Allow writes only if we started connected OR explicitly in local mode.
    // applyEnabled: initialHadContextRef.current || dataSource.toLowerCase().includes('local')
    // Always allow writes (edit in any mode requested).
    applyEnabled: true,
    // Emit a CustomEvent so host apps using the subscription hook re-render.
    broadcastEventName: "universal-login-context:updated"
  });

  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [search, setSearch] = useState("");

  // True connectivity defined exclusively by initial presence (prevents accidental promotion).
  const isConnected = initialHadContextRef.current && !!contextObj;

  const panelTitle = isConnected ? "Tenant context data" : "Mock context data";

  // Derive current screen from connected context if available.
  useEffect(() => {
    if (!isConnected || !contextObj) return;
    try {
      const ctx = contextObj as Record<string, unknown>;
      const promptObj = (
        ctx && typeof ctx === "object"
          ? (ctx as Record<string, unknown>).prompt
          : undefined
      ) as Record<string, unknown> | undefined;
      const screenObj = (
        ctx && typeof ctx === "object"
          ? (ctx as Record<string, unknown>).screen
          : undefined
      ) as Record<string, unknown> | undefined;
      const promptName =
        typeof promptObj?.name === "string" ? promptObj.name : undefined;
      const screenName =
        typeof screenObj?.name === "string" ? screenObj.name : undefined;
      if (promptName && screenName) {
        const value = `${promptName} / ${screenName}`;
        // Only override if different; do not persist to session (avoid overriding user preview prefs).
        setSelectedScreen((prev) => (prev === value ? prev : value));
      }
    } catch {
      /* ignore */
    }
  }, [isConnected, contextObj]);

  // Manifest (only loaded while disconnected & panel open)
  const {
    manifest,
    screenOptions,
    getVariantInfo,
    loadVariantJson,
    loading: manifestLoading,
    error: manifestError
  } = useUlManifest({
    root: root as Record<string, unknown>,
    dataSource,
    version,
    enabled: open && !isConnected && initReady // wait until local detection completes
  });

  // Auto-select logic once manifest screen options arrive.
  useEffect(() => {
    if (!screenOptions.length) return;
    // If a defaultScreen was provided, verify it exists; if not, fall back to first option.
    if (selectedScreen) {
      const exists = screenOptions.some((o) =>
        typeof o === "string"
          ? o === selectedScreen
          : o.value === selectedScreen
      );
      if (!exists) {
        const first = screenOptions[0];
        setSelectedScreen(typeof first === "string" ? first : first.value);
      }
    } else {
      const first = screenOptions[0];
      setSelectedScreen(typeof first === "string" ? first : first.value);
    }
  }, [screenOptions, selectedScreen]);

  // Persist selections only after initialization to avoid writing CDN prematurely.
  useEffect(() => {
    if (!initReady) return;
    if (typeof window === "undefined") return;
    try {
      if (selectedScreen)
        sessionStorage.setItem(SESSION_KEYS.screen, selectedScreen);
      if (variant) sessionStorage.setItem(SESSION_KEYS.variant, variant);
      if (dataSource)
        sessionStorage.setItem(SESSION_KEYS.dataSource, dataSource);
      if (version) sessionStorage.setItem(SESSION_KEYS.version, version);
    } catch {
      /* ignore */
    }
  }, [selectedScreen, variant, dataSource, version, initReady]);

  const [disableDataSourceSelect, setdisableDataSourceSelect] = useState(false);
  // Early local manifest detection (runs once). Prefer local dev if a local manifest exists and no prior session choice.
    useEffect(() => {
      let cancelled = false;
      (async () => {
        // Single attempt to fetch local manifest; any failure disables local selection.
        const fetchManifest = async (): Promise<UlManifest | null> => {
          try {
            const res = await fetch("/manifest.json", { cache: "no-store" });
            if (!res.ok) {
              setdisableDataSourceSelect(true);
              return null;
            }
            return (await res.json()) as UlManifest;
          } catch {
            setdisableDataSourceSelect(true);
            return null;
          }
        };

        const existing = getSessionValue(SESSION_KEYS.dataSource);
        if (existing || isConnected) {
          // Still probe once to decide if selector should be disabled.
          await fetchManifest();
          setInitReady(true);
          return;
        }

        const manifestJson = await fetchManifest();
        if (cancelled) return;
        if (!manifestJson) {
          // No local manifest available; initialization still completes.
          setInitReady(true);
          return;
        }
        if (Array.isArray(manifestJson.screens)) {
          setLocalManifestData(manifestJson);
          // Efficient first local screen discovery.
          const firstLocal = (() => {
            for (const entry of manifestJson.screens) {
              for (const [top, children] of Object.entries(entry)) {
                if (children && typeof children === "object") {
                  const firstChild = Object.keys(children)[0];
                  if (firstChild) return `${top}:${firstChild}`;
                }
              }
            }
            return undefined;
          })();
          const defaultValid = !!defaultScreen && (() => {
            const [dTop, dChild] = defaultScreen.split(":");
              const container = (manifestJson.screens.find(e => e[dTop]) || {})[dTop] as Record<string, unknown> | undefined;
              return !!(container && typeof container === 'object' && (container as Record<string, unknown>)[dChild]);
          })();
          const target = defaultValid ? defaultScreen! : firstLocal;
          if (target && target !== selectedScreen) {
            setSelectedScreen(prev => prev || target);
          }
          if (dataSource !== "Local development") {
            setDataSource("Local development");
          }
        }
        if (!cancelled) setInitReady(true);
      })();
      return () => {
        cancelled = true;
      };
    }, []); // run once

  // Derive variant options from manifest (fallback to provided variants prop).
  const variantOptions = useMemo(() => {
    if (!selectedScreen) return variants;
    const info = getVariantInfo(selectedScreen);
    return info ? info.variants : variants;
  }, [selectedScreen, getVariantInfo, variants, manifest]);

  // Derive version options from manifest (fallback to provided versions prop).
  const versionOptions = useMemo(() => {
    const allVersions =
      manifest?.versions && manifest.versions.length > 0
        ? manifest.versions
        : versions;

    // Sort versions in descending order
    const sortedVersions = [...allVersions].sort((a, b) => {
      // Extract version numbers for comparison (e.g., "v1.2032032.0" -> [1, 2032032, 0])
      const aVersion = a.replace(/^v/, "").split(".").map(Number);
      const bVersion = b.replace(/^v/, "").split(".").map(Number);

      // Compare each part
      for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
        const aPart = aVersion[i] || 0;
        const bPart = bVersion[i] || 0;
        if (aPart !== bPart) {
          return bPart - aPart; // Descending order
        }
      }
      return 0;
    });

    // Add "(latest)" suffix to the first (newest) version
    if (sortedVersions.length > 0) {
      sortedVersions[0] = `${sortedVersions[0]} (latest)`;
    }

    return sortedVersions;
  }, [manifest, versions]);

  // Get the display version with "(latest)" suffix if applicable
  const displayVersion = useMemo(() => {
    const rawVersions =
      manifest?.versions && manifest.versions.length > 0
        ? manifest.versions
        : versions;
    const sortedVersions = [...rawVersions].sort((a, b) => {
      const aVersion = a.replace(/^v/, "").split(".").map(Number);
      const bVersion = b.replace(/^v/, "").split(".").map(Number);
      for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
        const aPart = aVersion[i] || 0;
        const bPart = bVersion[i] || 0;
        if (aPart !== bPart) return bPart - aPart;
      }
      return 0;
    });

    // If current version is the latest, add "(latest)" suffix
    if (sortedVersions.length > 0 && version === sortedVersions[0]) {
      return `${version} (latest)`;
    }
    return version;
  }, [version, manifest, versions]);

  // Check if current screen exists in local manifest
  const screenExistsLocally = useMemo(() => {
    if (!selectedScreen || !localManifestData?.screens) return false;

    const [topKey, childKey] = selectedScreen.split(":");
    return localManifestData.screens.some((entry) => entry[topKey]?.[childKey]);
  }, [selectedScreen, localManifestData]);

  // Filter data source options - only show "Local development" if current screen exists locally
  const filteredDataSourceOptions = useMemo(() => {
    if (!selectedScreen || !localManifestData) return dataSources;

    return screenExistsLocally
      ? dataSources
      : dataSources.filter((ds) => !ds.toLowerCase().includes("local"));
  }, [selectedScreen, localManifestData, dataSources, screenExistsLocally]);

  // Auto-select latest version when manifest loads
  useEffect(() => {
    if (
      manifest?.versions &&
      manifest.versions.length > 0 &&
      !manifest.versions.includes(version)
    ) {
      setVersion(manifest.versions[0]);
    }
  }, [manifest, version]);

  // Always default to latest available version in CDN mode (override any stored session value)
  useEffect(() => {
    if (
      dataSource === "Auth0 CDN" &&
      manifest?.versions &&
      manifest.versions.length > 0
    ) {
      // Sort descending (same logic used elsewhere)
      const sorted = [...manifest.versions].sort((a, b) => {
        const aParts = a.replace(/^v/, "").split(".").map(Number);
        const bParts = b.replace(/^v/, "").split(".").map(Number);
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const av = aParts[i] || 0;
          const bv = bParts[i] || 0;
          if (av !== bv) return bv - av; // descending
        }
        return 0;
      });
      const latest = sorted[0];
      if (latest && version !== latest) {
        setVersion(latest);
      }
    }
  }, [dataSource, manifest, version]);

  // Ensure selected variant remains valid when options change.
  useEffect(() => {
    if (variant && !variantOptions.includes(variant)) {
      setVariant(variantOptions[0]);
    }
  }, [variantOptions, variant]);

  // Ensure data source remains valid after filtering (e.g., local removed)
  useEffect(() => {
    if (dataSource && !filteredDataSourceOptions.includes(dataSource)) {
      setDataSource(filteredDataSourceOptions[0] as string);
    }
  }, [filteredDataSourceOptions, dataSource]);

  // Ensure version remains valid (manifest may change available versions)
  useEffect(() => {
    const rawVersionOptions =
      manifest?.versions && manifest.versions.length > 0
        ? manifest.versions
        : versions;
    if (version && !rawVersionOptions.includes(version)) {
      setVersion(rawVersionOptions[0]);
    }
  }, [manifest, version, versions]);

  // Load variant JSON while disconnected to populate preview buffer only.
  useEffect(() => {
    if (!open || isConnected) return; // only for disconnected preview
    if (!selectedScreen || !variant) return; // need selection
    if (userEdited) return; // preserve manual edits
    let cancelled = false;
    (async () => {
      try {
        const json = await loadVariantJson(selectedScreen, variant);
        if (!cancelled && json) setRaw(JSON.stringify(json, null, 2));
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    open,
    isConnected,
    selectedScreen,
    variant,
    loadVariantJson,
    setRaw,
    userEdited
  ]);

  const handleVariant = useCallback((v: string) => {
    setVariant(v);
    setUserEdited(false);
    if (typeof window !== "undefined") window.location.reload();
  }, []);

  const handleDataSource = useCallback((v: string) => {
    setDataSource(v);
    setUserEdited(false);
    if (typeof window !== "undefined") window.location.reload();
  }, []);

  const handleVersion = useCallback((v: string) => {
    const cleanVersion = v.replace(/ \(latest\)$/, "");
    setVersion(cleanVersion);
    setUserEdited(false);
    if (typeof window !== "undefined") window.location.reload();
  }, []);

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
      const screenPart = (selectedScreen || "screen").replace(/:/g, "-");
      const safe = (s: string) =>
        s
          .toLowerCase()
          .replace(/[^a-z0-9-_]+/g, "-")
          .replace(/^-+|-+$/g, "") || "context";
      const fileName = `${safe(screenPart)}-context.json`;
      const blob = new Blob([raw], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
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
    const lines = raw.split("\n");
    const matchedIndices: number[] = [];
    const matchedLines: string[] = [];

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(lower)) {
        matchedIndices.push(index);
        matchedLines.push(line);
      }
    });

    return {
      filteredDisplay: matchedLines.join("\n"),
      filteredLineIndices: matchedIndices
    };
  }, [raw, search]);

  // Handle edits to filtered content by mapping back to original lines
  const handleFilteredEdit = useCallback(
    (editedFiltered: string) => {
      if (!search || !filteredLineIndices) {
        // No filter active, direct edit
        setUserEdited(true);
        setRaw(editedFiltered);
        return;
      }

      // Map edited filtered lines back to original content
      const originalLines = raw.split("\n");
      const editedLines = editedFiltered.split("\n");

      // Update only the filtered lines in the original content
      editedLines.forEach((editedLine, filterIndex) => {
        const originalIndex = filteredLineIndices[filterIndex];
        if (
          originalIndex !== undefined &&
          originalIndex < originalLines.length
        ) {
          originalLines[originalIndex] = editedLine;
        }
      });

      setUserEdited(true);
      setRaw(originalLines.join("\n"));
    },
    [raw, search, filteredLineIndices]
  );

  // Panel fully hidden when closed (no persistent handle)
  if (!open) {
    return (
      <div className="uci-context-inspector-root">
        <PanelToggleButton
          onClick={() => setOpen(true)}
          panelTitle={panelTitle}
        />
      </div>
    );
  }

  // Avoid flashing CDN before local detection completes.
  if (!initReady) {
    return <div className="uci-context-inspector-root" />;
  }

  return (
    <div className="uci-context-inspector-root">
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
            dataSourceOptions={filteredDataSourceOptions}
            dataVersionOptions={versionOptions}
            isConnected={isConnected}
            onChangeSelectDataSource={(event) =>
              handleDataSource(event.target.value as string)
            }
            onChangeSelectDataVersion={(event) =>
              handleVersion(event.target.value as string)
            }
            onChangeSelectScreen={(event) => {
              if (!isConnected) {
                setSelectedScreen(event.target.value as string);
                if (typeof window !== "undefined") window.location.reload();
              }
            }}
            onChangeSelectVariant={(event) =>
              handleVariant(event.target.value as string)
            }
            screenOptions={screenOptions}
            selectedDataSource={dataSource}
            selectedDataVersion={displayVersion}
            selectedScreen={selectedScreen}
            selectedVariant={variant}
            setSelectedScreen={setSelectedScreen}
            variantOptions={variantOptions}
            disableDataSourceSelect={disableDataSourceSelect}
          />

          {manifestLoading && (
            <div className="uci-py-2 uci-text-[11px] uci-text-gray-400 uci-border-b uci-border-gray-800">
              Loading manifest…
            </div>
          )}
          {manifestError && (
            <div className="uci-py-2 uci-text-[11px] uci-text-red-400 uci-border-b uci-border-gray-800">
              {manifestError}
            </div>
          )}
        </div>

        <PanelCodeEditorContainer
          onSearchButtonClick={() => setIsSearchVisible((v) => !v)}
          onDownloadButtonClick={onDownload}
          onCopyButtonClick={onCopy}
          isSearchVisible={isSearchVisible}
          onChangeSearch={(event: { target: { value: string } }) =>
            setSearch(event.target.value as string)
          }
          onCloseButtonClick={() => {
            setIsSearchVisible(false);
            setSearch("");
          }}
          searchValue={search}
        >
          {(codeWrap) => (
            <JsonCodeEditor
              value={search ? filteredDisplay : raw}
              onChange={handleFilteredEdit}
              readOnly={true}
              isValid={isValid}
              textareaId="tenant-context-json-editor"
              codeWrap={codeWrap}
            />
          )}
        </PanelCodeEditorContainer>
      </PanelContainer>
    </div>
  );
};

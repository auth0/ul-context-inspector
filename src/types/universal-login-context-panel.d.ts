export interface UniversalLoginContextPanelProps {
  defaultOpen?: boolean;
  width?: number | string;
  root?: WindowLike;
  screenLabel?: string;
  /**
   * When provided (e.g. "login:login"), the panel will attempt to pre‑select this
   * screen once manifest screen options are available. Must match the internal
   * value format `${topKey}:${childKey}` used in `screenOptions`.
   */
  defaultScreen?: string;
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

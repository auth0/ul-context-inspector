export interface UniversalLoginContextPanelProps {
  /**
   * Pre-select screen value (e.g. "login:login") when manifest loads.
   * Format `${topKey}:${childKey}`.
   */
  defaultScreen?: string;
}

interface WindowLike {
  universal_login_context?: unknown;
  [k: string]: unknown;
}

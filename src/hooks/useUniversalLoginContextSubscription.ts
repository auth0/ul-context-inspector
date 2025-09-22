import { useEffect, useState } from 'react';

/**
 * useUniversalLoginContextSubscription
 * ------------------------------------
 * Lightweight hook for consumer apps: provides the current
 * `window.universal_login_context` value and forces a re-render
 * whenever the inspector panel applies changes (broadcasting a
 * CustomEvent).
 *
 * The panel emits `universal-login-context:updated` by default.
 * Consumers can override the event name if they also set the same
 * `broadcastEventName` when using the internal editing hook.
 */
export function useUniversalLoginContextSubscription<T = unknown>(
  eventName = 'universal-login-context:updated'
): T | undefined {
  const [value, setValue] = useState<T | undefined>(() => {
    if (typeof window === 'undefined') return undefined;
    return (window as unknown as { universal_login_context?: T }).universal_login_context;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => {
      // Pull fresh value rather than trusting event detail to avoid stale copies.
      setValue((window as unknown as { universal_login_context?: T }).universal_login_context);
    };
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [eventName]);

  return value;
}
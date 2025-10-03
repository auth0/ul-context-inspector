## ul-context-inspector

Rich developer panel + subscription hook for inspecting and live‑editing an Auth0 Universal Login style JSON context (`window.universal_login_context`). Built with React + TypeScript, bundled via Vite (ESM + CJS + types + CSS). Safe to drop into any host app (styles are namespaced with a `uci-` prefix and no preflight/reset).

### Why
Quickly iterate on Universal Login screens/variants and immediately observe downstream rendering logic that consumes `window.universal_login_context`—without bespoke tooling. In disconnected environments you can still preview manifest‑driven variants, then promote edits once a real context exists.

---
## Features
* Slide‑in panel component: `<UniversalLoginContextPanel />` (left edge, configurable width).
* Always‑on editing: JSON buffer is editable in all modes (connected, disconnected, even while search filtering — search auto-clears on first keystroke to avoid partial edits).
* Disconnected preview: Load screen + variant JSON from a manifest (local or CDN) without mutating the global context.
* Smart preservation: Manual edits while disconnected are not overwritten by subsequent manifest loads (userEdited guard).
* Connected mode: If the context existed at mount, edits debounce (400ms) back into `window.universal_login_context`.
* Manifest‑driven selectors: Screen → variant cascade with fallbacks when manifest data isn’t present.
* JSON editor: Prism syntax highlighting, line numbers, validity border state, copy & download actions.
* Search: Line filtering view (non‑destructive); filtered view label overlay; editing clears filter to protect hidden lines.
* Event broadcasting: Successful applies dispatch `universal-login-context:updated` so other components can re-render via the included subscription hook.
* Subscription hook: `useUniversalLoginContextSubscription()` returns the current context value and re-renders on the broadcast event.
* Namespaced Tailwind styling: `uci-` prefix prevents leakage; dark theme base.
* Defensive duplicate React detection (warning in dev if multiple React copies cause invalid element issues).
* Types included; minimal surface area export for tree‑shaking.

Planned: explicit "promote preview" action, manifest caching, diff view, theming tokens, accessibility polish, large JSON virtualization, keyboard shortcuts.

---
## Installation
```bash
npm install ul-context-inspector
# or
yarn add ul-context-inspector
```

Peer deps: react >= 18, react-dom >= 18 (works in apps on React 18/19 as long as a single copy is present).

---
## Quick Start
```tsx
import React from 'react';
import { UniversalLoginContextPanel } from 'ul-context-inspector';

export function App() {
	return (
		<>
			<UniversalLoginContextPanel defaultOpen={true} />
			{/* rest of your app */}
		</>
	);
}
```

Styles are auto-included via package side effects. If your bundler tree‑shakes CSS incorrectly you can explicitly import:
```ts
import 'ul-context-inspector/style.css';
```

---
## Live Subscription (Consumer Side)
Use this in other components to react to edits:
```tsx
import { useUniversalLoginContextSubscription } from 'ul-context-inspector';

export function PreviewConsumer() {
	const ctx = useUniversalLoginContextSubscription<any>();
	return <pre>{JSON.stringify(ctx, null, 2)}</pre>;
}
```
The hook listens for the `universal-login-context:updated` CustomEvent (override by passing a different event name to the hook AND providing the same `broadcastEventName` prop internally if you build a custom panel integration).

---
## Component Props
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `defaultOpen` | boolean | true | Whether panel starts open. |
| `width` | number \| string | 560 | Fixed width of panel. |
| `root` | WindowLike | `window` | Root object containing the context key. |
| `screenLabel` | string | "Current Screen" | Placeholder label when no manifest screens loaded. |
| `variants` | string[] | ["default"] | Fallback variants if manifest missing. |
| `dataSources` | string[] | ["Auth0 CDN","Local development"] | Options for data source select; any containing "local" hides version selector. |
| `versions` | string[] | ["1.0.0"] | Version tags for manifest selection. |
| `defaultVariant` | string | first variant | Initial variant selection. |
| `defaultDataSource` | string | first data source | Initial data source. |
| `defaultVersion` | string | first version | Initial version. |
| `onVariantChange` | (v: string) => void | — | Callback when variant changes. |
| `onDataSourceChange` | (v: string) => void | — | Callback when data source changes. |
| `onVersionChange` | (v: string) => void | — | Callback when version changes. |

---
## Editing & Update Model
1. User types → raw buffer updates immediately.
2. 400ms debounce → JSON parsed; if valid it is applied to `window.universal_login_context` (connected mode) and a CustomEvent is dispatched.
3. Disconnected preview: Manifest JSON populates editor unless user has edited (userEdited flag). Once user types, subsequent screen/variant changes will not overwrite until they explicitly change selection again (which resets the flag).
4. Search filter never modifies the underlying buffer; first keystroke while filtered clears the filter for safety.

Event name: `universal-login-context:updated` (detail: `{ key, value }`).

---
## Manifest Format (Example)
```json
{
	"screens": [
		{ "login": { "login": { "path": "/screens/login/login", "variants": ["default", "enterprise"] } } },
		{ "signup": { "signup": { "path": "/screens/signup/signup", "variants": ["default"] } } }
	],
	"versions": ["1.0.0"]
}
```
Internally flattened to build the screen select. If variants array missing, fallback prop `variants` is used.

---
## Styling
All classes prefixed `uci-`. No global resets or preflight. Dark palette defaults. Feel free to override via more specific selectors or author a future theming layer.

If using Tailwind JIT purge in the host, safelist the prefix to ensure classes survive:
```js
// tailwind.config.js (host)
module.exports = {
	content: ["./src/**/*.{ts,tsx,html}"] ,
	safelist: [{ pattern: /uci-/ }]
}
```

---
## Development
```bash
git clone <repo>
cd ul-context-inspector
npm install
npm run dev      # playground / story environment
npm run build    # produce dist (ESM, CJS, d.ts, CSS)
npm test         # vitest suite
```
Watch mode: `npm run watch`

---
## Publishing (Outline)
1. Update version in `package.json` (semver)
2. `npm run build && npm test && npm run typecheck && npm run lint`
3. `npm publish --access public`

---
## Troubleshooting
| Symptom | Likely Cause | Fix |
| ------- | ------------ | --- |
| Panel styles missing | CSS tree‑shaken | `import 'ul-context-inspector/style.css'` explicitly. |
| Subscription hook never re-renders | Event not dispatched | Ensure panel is mounted & using default broadcast name. |
| Objects not valid as React child error | Duplicate React copies | Align React versions & dedupe `node_modules` (e.g. `npm ls react`). |
| Edits keep reverting on screen change | Not a bug: selection reset | You changed variant/data source which reloads manifest, clearing `userEdited`. |
| Nothing happens on edit in disconnected mode | Expectation mismatch | Preview mode doesn’t apply to window unless a context existed at mount (connected) or you later create one manually. |

---
## Exports
```ts
import { UniversalLoginContextPanel, useUniversalLoginContextSubscription } from 'ul-context-inspector';
```
CSS: `import 'ul-context-inspector/style.css'` (optional; usually automatic).

---
## License
MIT

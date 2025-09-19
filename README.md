
## ul-context-inspector

Developer panel for inspecting & editing an Auth0 Universal Login JSON context (`window.universal_login_context`). Built with React + TypeScript, shipped as a small library (Vite). Drop it into any Universal Login or similar environment to iterate on screen variants quickly.

### Core Features
* Sliding left panel (`<UniversalLoginContextPanel />`) editing `window.universal_login_context` when a context already exists ("connected" mode).
* Disconnected preview mode: fetch a manifest (local or CDN), choose screen + variant, preview JSON without mutating global context unless in explicit local mode.
* Automatic screen & variant population from manifest (path + variants array); fallback variant list if manifest missing.
* Prism syntax highlighted JSON editor with line numbers, search line filtering (line subset view), validity border state, copy & download actions.
* Download naming: `${variant}-${screen}-context.json` (screen uses `topKey-childKey` format; sanitized).
* Tailwind classes namespaced with `uci-` (no global resets), dark theme base.
* Debounced (400ms) JSON parse + apply with apply suppression during preview.
* Strict separation between original tenant context and local preview to avoid accidental promotion.

Planned: manifest caching, explicit "promote preview" action, keyboard shortcuts, theming tokens, a11y polish, diff visualization, higher test coverage.

### Install
```
npm install ul-context-inspector
# or
yarn add ul-context-inspector
```

### Run App
```
npm i
npm run dev -- --port 5181
```

### Basic Usage
```tsx
import { UniversalLoginContextPanel } from 'ul-context-inspector';

export function App() {
	return <UniversalLoginContextPanel defaultOpen={false} />;
}
```

### Component Props (selected)
| Prop | Type | Default | Notes |
| ---- | ---- | ------- | ----- |
| `defaultOpen` | boolean | true | Open panel on mount. |
| `width` | number \| string | 560 | Width of sliding panel. |
| `screenLabel` | string | "Current Screen" | Placeholder label if no manifest. |
| `dataSources` | string[] | ["Auth0 CDN","Local development"] | Populates data source select. Any value containing "local" enables local mode (no version select, writes allowed). |
| `variants` | string[] | ["default"] | Fallback variant array if manifest absent or missing variants. |
| `defaultVariant` | string | first of variants | Initial variant. |
| `defaultDataSource` | string | first of dataSources | Initial data source. |
| `defaultVersion` | string | first of versions | Initial version (hidden in local mode). |
| `onVariantChange` | (v: string) => void | — | Callback on variant change. |
| `onDataSourceChange` | (v: string) => void | — | Callback on data source change. |
| `onVersionChange` | (v: string) => void | — | Callback on version change. |

Other internal hooks (e.g., `useUlManifest`, `useWindowJsonContext`) are currently internal and not exported.

### Manifest Structure (simplified)
```
{
	"screens": [
		{ "login": { "login": { "path": "/screens/login/login", "variants": ["default","enterprise"] } } },
		{ "signup": { "signup": { "path": "/screens/signup/signup", "variants": ["default"] } } }
	],
	"versions": ["1.0.0"]
}
```
Each entry is a single top-level key containing an object whose key is the child screen; a variant node may define `path` (base directory) and `variants` array.

### Connected vs Preview Logic
* If `window.universal_login_context` exists on mount → connected (edits persist).
* Otherwise → disconnected preview. Loading screen + variant only fills editor buffer.
* Local mode (dataSource includes `local`) permits applying edits to create/promote the context.
* Future enhancement: explicit button to promote preview without relying on data source heuristic.


### Local Development
1. Install deps: `npm install`
2. Start dev sandbox: `npm run dev`
3. Build library: `npm run build`
4. Run tests: `npm test`
5. (Optional) Link into another app: `npm pack` then `npm install ../path/to/ul-context-inspector-<version>.tgz`

### Build
```
npm run build
```
Emits ESM + CJS bundles and type declarations to `dist/`.

### Continuous Build
`npm run watch` — rebuild on changes for linked host apps.

### Release (outline)
1. Bump version (semver)
2. `npm run build && npm test`
3. `npm publish --access public`

### Contributing
PRs welcome. Please run `npm run lint && npm test && npm run typecheck` before submitting.

Areas to help:
* Accessibility (focus order, ARIA labels)
* Manifest caching & validation
* Test coverage (edge cases / large JSON)
* Theming tokens & light mode
* Performance for huge contexts (virtual scroll / lazy nodes)

---
License: MIT


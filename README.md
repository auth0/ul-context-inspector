
## ul-context-inspector

React + TypeScript UI component that mounts developer panels for inspecting and editing a JSON context object exposed on `window` (notably `window.universal_login_context`). Designed for embedding into Universal Login / auth-related integration surfaces for faster iteration without constant console spelunking.

### Core Features
* Left-side sliding panel (`UniversalLoginContextPanel`) to view & edit `window.universal_login_context` when truly connected.
* Disconnected preview mode: load local or CDN manifest, pick screen + variant, preview JSON without mutating global state until allowed.
* JSON editor with syntax highlighting (Prism) + line numbers, search line filtering, copy & download.
* Tailwind (scoped with `uci-` prefix; no global preflight), dark theme first.
* Debounced safe JSON parsing & validity indicator.

Planned: test coverage expansion, accessibility polish, optional diffing, theming tokens, keyboard shortcuts, manifest caching.

### Install
```
npm install ul-context-inspector
# or
yarn add ul-context-inspector
```

### Basic Usage
```tsx
import { UniversalLoginContextPanel } from 'ul-context-inspector';

export function App() {
	return <UniversalLoginContextPanel defaultOpen={false} />;
}
```

### Props
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `targetKey` | `string` | `"ulContext"` | Property on `window` (or custom `root`) to inspect. |
| `defaultOpen` | `boolean` | `false` | Whether the panel starts open. |
| `pollInterval` | `number` | `3000` | Milliseconds between snapshots. Set `0` to disable polling (manual refresh TBD). |
| `root` | `any` | `window` | Override global object (useful for testing). |
| `height` | `number | string` | `300` | Panel height when open. |

### UniversalLoginContextPanel Props (extract)
| Prop | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| `defaultOpen` | boolean | false | Start opened on mount. |
| `width` | number \| string | 560 | Panel width. |
| `screenLabel` | string | "Current Screen" | Label for screen select. |
| `dataSources` | string[] | ["Auth0 CDN","Local development"] | Source options. |
| `variants` | string[] | ["default"] | Fallback variants if manifest missing. |


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


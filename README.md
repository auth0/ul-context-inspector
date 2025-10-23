# 🔍 ul-context-inspector

A developer panel for inspecting and live-editing JSON context on `window.universal_login_context`.

Built for Auth0 Universal Login development — iterate quickly on screens and variants with real-time JSON editing, syntax highlighting, and event broadcasting.

## ✨ Features

- 📝 **Always-on editing** — Edit JSON in any mode (connected, disconnected, or preview)
- 🎨 **Syntax highlighting** — Prism-powered with line numbers and validation
- 🔄 **Live subscription hook** — Other components re-render on changes
- 🎯 **Manifest-driven** — Load screen/variant combinations from CDN or local
- 🔍 **Search & filter** — Non-destructive line filtering
- 📦 **Self-contained** — No external design system needed
- 🎭 **Namespaced styles** — `uci-` prefix prevents conflicts
- 📤 **Export & copy** — Download or copy JSON with one click

---

## 📦 Installation

```bash
npm install ul-context-inspector
```

**Requirements:** React 18+ and React-DOM 18+ (peer dependencies)

---

## 🚀 Quick Start

```tsx
import { UniversalLoginContextPanel } from 'ul-context-inspector';

export function App() {
  return <UniversalLoginContextPanel defaultOpen={true} />;
}
```

That's it! Styles are automatically included.

---

## 🪝 Live Subscription Hook

Subscribe to context changes in other components:

```tsx
import { useUniversalLoginContextSubscription } from 'ul-context-inspector';

export function PreviewConsumer() {
  const ctx = useUniversalLoginContextSubscription();
  return <pre>{JSON.stringify(ctx, null, 2)}</pre>;
}
```

The hook listens for `universal-login-context:updated` events and triggers re-renders.

---

## ⚙️ Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultOpen` | `boolean` | `true` | Panel starts open/closed |
| `width` | `number \| string` | `560` | Panel width in pixels |
| `variants` | `string[]` | `["default"]` | Available variants |
| `dataSources` | `string[]` | `["Auth0 CDN", "Local development"]` | Data source options |
| `versions` | `string[]` | `["1.0.0"]` | Version options |
| `onVariantChange` | `(v: string) => void` | — | Variant change callback |
| `onDataSourceChange` | `(v: string) => void` | — | Data source change callback |
| `onVersionChange` | `(v: string) => void` | — | Version change callback |

---

## 🎨 Styling

All classes are prefixed with `uci-` to prevent conflicts. The component uses a dark theme by default.

If your bundler tree-shakes CSS:
```ts
import 'ul-context-inspector/style.css';
```

For Tailwind JIT users, safelist the prefix:
```js
// tailwind.config.js
module.exports = {
  safelist: [{ pattern: /uci-/ }]
}
```

---

## 🔧 Development

```bash
npm install
npm run dev      # Start dev server
npm run build    # Build for production
npm run test     # Run tests
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Styles missing | Import `'ul-context-inspector/style.css'` explicitly |
| Hook not re-rendering | Ensure panel is mounted and broadcasting |
| Duplicate React error | Run `npm ls react` and dedupe dependencies |

---


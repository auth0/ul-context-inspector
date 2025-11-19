![UL Context Inspector Banner](https://cdn.auth0.com/website/sdks/banners/auth0-acul-sdk-banner.png)

<p align="center">
  <a href="https://www.npmjs.com/package/@auth0/ul-context-inspector"><img alt="NPM Version" src="https://img.shields.io/npm/v/@auth0/ul-context-inspector?label=Inspector" /></a>
  <a href="https://www.npmjs.com/package/@auth0/ul-context-inspector"><img alt="Downloads" src="https://img.shields.io/npm/dw/@auth0/ul-context-inspector?label=Downloads" /></a>
  <img alt="React Versions" src="https://img.shields.io/badge/react-18%20|%2019-61dafb?logo=react" />
  <img alt="Node" src="https://img.shields.io/badge/node-%3E=20.19.0-43853d?logo=node.js" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-ready-3178c6?logo=typescript" />
  <img alt="License" src="https://img.shields.io/badge/License-Apache--2.0-blue.svg" />
  <img alt="Vite" src="https://img.shields.io/badge/Built%20with-Vite-646cff?logo=vite" />
</p>

<p align="center">
  📚 <a href="#documentation">Documentation</a> · 🚀 <a href="#getting-started">Getting Started</a> · 🧩 <a href="#api-reference">API Reference</a> · 💬 <a href="#feedback">Feedback</a>
</p>

The **Universal Login Context Inspector** accelerates Advanced Customizations for Universal Login (ACUL) development by letting you:

* Inspect a live tenant context (connected mode).
* Preview & iterate with mock context from a CDN or local manifest (disconnected mode).
* Edit JSON safely and broadcast changes via a custom event.
* Persist selections (screen, variant, data source, version) across reloads.

> [!CAUTION]
> This tool is in **Early Access**.

---

### Documentation

- [Quickstart](#getting-started) – mount and configure the panel.
- [Manifest & Variants](#manifest-and-variants) – structure and loading.
- [Behavior](#interactive-behavior) – connected vs disconnected.
- [Styling](#styling) – Tailwind prefix guidance.

---

## ACUL Context Overview
<p align="center">
  <img src="docs/ul-context-inspector.png" alt="Universal Login Context Inspector screenshot" width="850" />
</p>

---

## Getting Started

### Prerequisites
1. Auth0 tenant with ACUL enabled.
2. Optional: local `public/manifest.json` + variant JSON files.

### Installation

```bash
npm install @auth0/ul-context-inspector
```

Peer deps (if missing):
```bash
npm install react react-dom
```

### Mounting

```tsx
import { UniversalLoginContextPanel } from '@auth0/ul-context-inspector';

export function App() {
  return <UniversalLoginContextPanel defaultScreen="login:login" />;
}
```

`defaultScreen` uses `prompt:screen`.

---

## Manifest and Variants

Panel tries `GET /manifest.json` when disconnected:

* 200 => switches to Local development.
* Non‑200 => falls back to Auth0 CDN manifest.

Place under `public/`:

```
public/
  manifest.json
  screens/
    login/
      login/
        default.json
        with-errors.json
    login-id/
      login-id/
        default.json
        with-errors.json
```

Example manifest:
```jsonc
{
  "screens": [
    { "login": { "login": { "path": "/screens/login/login", "variants": ["default", "with-errors"] } } },
    { "login-id": { "login-id": { "path": "/screens/login-id/login-id", "variants": ["default", "with-errors"] } } }
  ]
}
```

Variant file path format: `<path>/<variant>.json`.

---

## Interactive Behavior

| Feature | Connected | Disconnected |
|---------|-----------|--------------|
| Screen/variant selection | Reflects live context; cannot override tenant screen | Reloads page & loads mock variant JSON |
| Data source toggle | Hidden | Switch between CDN & Local (if manifest present) |
| JSON editing | Writes directly to live context | Writes to mock context & broadcasts event |
| Persistence | SessionStorage (`ulci:` prefix) | SessionStorage (`ulci:` prefix) |

Broadcast event: `universal-login-context:updated`

Subscription example:
```tsx
import { useUniversalLoginContextSubscription } from '@auth0/ul-context-inspector';

function Host() {
  const ctx = useUniversalLoginContextSubscription();
  return <pre>{JSON.stringify(ctx?.screen, null, 2)}</pre>;
}
```

---

## API Reference

### Panel Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultScreen` | `string` | `undefined` | Initial preview screen (`prompt:screen`). |

### Custom Event
`window.dispatchEvent(new CustomEvent('universal-login-context:updated'))` fired after edits.

---

## Styling

Tailwind classes are prefixed with `uci-`. Safelist via `/uci-/` in purge tools.

---

## Development
```bash
npm install
npm run dev
npm run build
```

---

## Feedback

Please open issues or feature requests in this repository.

---

## License

Apache-2.0

---

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png" width="150">
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.auth0.com/website/sdks/logos/auth0_dark_mode.png" width="150">
    <img alt="Auth0 Logo" src="https://cdn.auth0.com/website/sdks/logos/auth0_light_mode.png" width="150">
  </picture>
</p>
<p align="center">Auth0 provides an adaptable authentication and authorization platform. Learn more: <a href="https://auth0.com/why-auth0">Why Auth0?</a></p>

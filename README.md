# ul-context-inspector 🔍

Developer panel for inspecting the Universal Login JSON context on `window.universal_login_context` for the Advanced Customizations for Universal Login feature.

## 📦 Install

```bash
npm install ul-context-inspector
```

Peer deps: React 18+, ReactDOM 18+.

## 🚀 Usage

Basic mount:
```tsx
import { UniversalLoginContextPanel } from 'ul-context-inspector';

export function App() {
  return <UniversalLoginContextPanel defaultScreen="login:login" />;
}
```

Host example with dynamic screen component:
```tsx
import { Suspense } from 'react';
import {
  UniversalLoginContextPanel,
  useUniversalLoginContextSubscription,
} from 'ul-context-inspector';
import { getScreenComponent } from '@/utils/screen/screenLoader';

const App = () => {
  const context = useUniversalLoginContextSubscription(); // Subscribe to context which will determine the screen and rehydrate props with new state
  const screenName = context?.screen?.name;
  const ScreenComponent = screenName ? getScreenComponent(screenName) : null;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UniversalLoginContextPanel defaultScreen="login-password:login-password" /> // Add comment for component
      {ScreenComponent ? <ScreenComponent key={screenName} /> : <div>Select a screen...</div>}
    </Suspense>
  );
};
```

## ⚙️ Prop

| Name | Type | Description |
|------|------|-------------|
| `defaultScreen` | `string` | Initial screen (colon format `prompt:screen`) for disconnected preview. |

## 🧠 Behavior

- 🔌 Connected if context existed at mount; otherwise preview mode.
- 💾 Screen, variant, data source, version persisted in `sessionStorage` (`ulci:*`).
- 🔁 Selection changes trigger `window.location.reload()` (forces host SDK remount).
- 🛰 JSON editor is read-only; updates broadcast `universal-login-context:updated`.

## 🎨 Styling

Implicit CSS included; optional explicit import:
```ts
import 'ul-context-inspector/style.css';
```
Tailwind prefix: `uci-` (safelist with `/uci-/`).


## 🔧 Development
```
npm install
npm run dev      # Start dev server
npm run build    # Build for production
```

## 📜 License

ISC


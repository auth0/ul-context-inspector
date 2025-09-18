import React, { useEffect } from "react";
import { UniversalLoginContextPanel } from "../index";


// // Universal login context (State 1 panel target)
// if (!(window as any).universal_login_context) {
//   (window as any).universal_login_context = {
//     screen: "login-id",
//     locale: "en-US",
//     branding: { primaryColor: "#6366f1", logoUrl: "https://example.com/logo.png" },
//     user: null,
//     features: { passwordless: false, magicLink: true },
//     timestamp: Date.now()
//   };
// }

export const DevApp: React.FC = () => {

  return (
    <div style={{ padding: 40 }}>
      <h1>ul-context-inspector Dev Sandbox</h1>
      <p>
        Edit <code>window.universal_login_context</code> JSON via the left panel.
      </p>
      {/* Left-side panel for universal_login_context (State 1) */}
      <UniversalLoginContextPanel />
    </div>
  );
};

import * as React from 'react';
import { QuantumProvider, CssBaseline } from '@auth0/quantum-product';
import { UniversalLoginContextPanel } from "../index";

// Universal login context (State 1 panel target)
// if (!(window as any).universal_login_context) {
//   (window as any).universal_login_context = {
//     branding: {
//       settings: {
//         font: {
//           url: "https://junior-word.com"
//         }
//       }
//     },
//     client: {
//       id: "jAn8Pnux9dkf8U7DebyrMhde",
//       name: "Hagenes, Runte and Gleichner"
//     },
//     organization: {
//       id: "org_SOzFEX4jIuGtY5VQcAJrcuNq",
//       name: "hegmann-llc",
//       usage: "allow"
//     },
//     prompt: {
//       name: "login"
//     },
//     screen: {
//       links: {
//         reset_password: "https://nimble-wombat.net",
//         signup: "https://international-transom.com/"
//       },
//       name: "login"
//     },
//     tenant: {
//       name: "stanton-inc"
//     },
//     transaction: {
//       locale: "en",
//       state: "LJ47LrwjYHjCx9tBWqOCdkweUFzYmFQ5"
//     }
//   };
// }

export const DevApp: React.FC = () => {
  return (
    <QuantumProvider>
    <CssBaseline />
      <div style={{ padding: 40 }}>
        <h1 className="uci-text-white">
          ul-context-inspector Dev Sandbox</h1>
        <p className="uci-text-[#ABABAB]">
          Edit <code>window.universal_login_context</code> JSON via the left
          panel.
        </p>
        {/* Left-side panel for universal_login_context (State 1) */}
        <UniversalLoginContextPanel />
      </div>
    </QuantumProvider>
  );
};

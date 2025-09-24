import React from 'react';
import type { PanelContainerProps } from '../types/components';

const PanelContainer: React.FC<PanelContainerProps> = ({ children, width, open }) => (
  // TODO: export everthing to stylesheets
  // TODO: use quantum tokens
  <div
    className="uci-fixed uci-top-0 uci-left-0 uci-h-screen uci-bg-[#171717]
      uci-text-[#FBFBFB] uci-border-r uci-border-gray-700 uci-flex uci-flex-col
      uci-z-[99998] uci-overflow-hidden uci-px-6 uci-py-4"
    style={{ width, transform: open ? "translateX(0)" : "translateX(-100%)" }}

  >
    {children}
  </div>
);

export default PanelContainer;

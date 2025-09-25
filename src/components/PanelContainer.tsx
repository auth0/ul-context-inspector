import React from 'react';
import type { PanelContainerProps } from '../types/components';

const PanelContainer: React.FC<PanelContainerProps> = ({ children, width, open }) => (
  // TODO: export everthing to stylesheets
  // TODO: use quantum tokens
  <div
    className="uci-fixed uci-top-0 uci-left-0  uci-bg-[#171717]
      uci-text-[#FBFBFB] uci-border-solid uci-border-r uci-border-[#2A2A2A] uci-flex uci-flex-col
      uci-z-[99998] uci-overflow-y-auto uci-px-6 uci-pt-4 uci-pb-6"
    style={{
      width,
      height: '100vh',
      transform: open ? "translateX(0)" : "translateX(-100%)"
    }}
  >
    {children}
  </div>
);

export default PanelContainer;

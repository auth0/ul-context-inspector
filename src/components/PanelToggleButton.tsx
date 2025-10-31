import React from 'react';
import { OpenIcon } from '../assets/icons';
import type { PanelToggleButtonProps } from '../types/components';

const PanelToggleButton: React.FC<PanelToggleButtonProps> = ({ panelTitle, onClick }) => {
  return (
    <button
      type="button"
      aria-label={`Toggle ${panelTitle} panel`}
      onClick={onClick}
      className="uci-bg-indigo-600 hover:uci-bg-indigo-800 uci-text-white uci-font-medium
        uci-px-3 uci-py-2 uci-rounded uci-z-[99998] uci-border-none uci-flex uci-items-center uci-ml-10 uci-mt-10 cursor-pointer"
    >
      {panelTitle}
      <span className="uci-ml-2 uci-flex">
        <OpenIcon />
      </span>
    </button>
  )
}

export default PanelToggleButton;

import React from 'react';
import { IconButton, CollapseIcon } from '../assets/icons';
import { Info } from 'lucide-react';
import type { PanelHeaderProps } from '../types/components';

const PanelHeader: React.FC<PanelHeaderProps> = ({ title, isConnected, isConnectedText, isNotConnectedText, setOpen }) => {

  return (
    <div className="uci-flex uci-items-center uci-justify-between uci-mb-4">
        <div className="uci-flex uci-items-center uci-gap-2">
          <h1 className="uci-tracking-wide uci-text-[20px] uci-leading-[28px] uci-font-medium">
            {title}
          </h1>
          <div
            className={`uci-flex uci-items-center uci-gap-1 uci-px-2 uci-py-1 uci-rounded uci-h-5 ${
              isConnected ? 'uci-bg-[#062A16]' : 'uci-bg-[#292406]'
            }`}
          >
            <div
              className={`uci-w-1.5 uci-h-1.5 uci-rounded-full ${
                isConnected ? 'uci-bg-[#98D2B2]' : 'uci-bg-[#E3C423]'
              }`}
            />
            <span
              className={`uci-text-[11px] uci-uppercase uci-tracking-wide uci-font-semibold ${
                isConnected ? 'uci-text-[#98D2B2]' : 'uci-text-[#E3C423]'
              }`}
            >
              {isConnected ? isConnectedText : isNotConnectedText}
            </span>
          </div>
        </div>
        <div className="uci-flex uci-items-center">
          <Info className="uci-w-4 uci-h-4 uci-text-white uci-mr-5" />
          <IconButton label="Close" onClick={() => setOpen(false)}>
            <CollapseIcon />
          </IconButton>
        </div>
      </div>
  );
};

export default PanelHeader;

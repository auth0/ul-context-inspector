import React from "react";
import { SearchIcon } from "../assets/icons";

interface ScreenSelectSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * ScreenSelectSearchInput
 * Standalone search input for use inside a Select popover.
 * It stops keydown propagation to prevent interfering with list navigation.
 */
export const ScreenSelectSearch: React.FC<ScreenSelectSearchProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="uci-p-1 uci-sticky uci-top-0 uci-bg-[#171717] uci-z-10">
      <div className="uci-relative">
        <span
          className="uci-absolute uci-inset-y-0 uci-left-2 uci-text-[#666] uci-flex uci-items-center"
          aria-hidden="true"
        >
          <SearchIcon stroke="#ABABAB" />
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by screen name..."
          onKeyDown={(e) => e.stopPropagation()}
          data-slot="select-search"
          className="uci-w-full uci-text-[14px] uci-bg-[#111111] uci-border uci-border-solid uci-border-[#383838] uci-rounded uci-pl-7 uci-pr-2 uci-py-2 uci-text-[#C5C5C5] placeholder:uci-text-[#666] focus:uci-outline-none focus:uci-border-[#808080]"
        />
      </div>
    </div>
  );
};

export default ScreenSelectSearch;

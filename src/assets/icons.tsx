import React from "react";

export const IconButton: React.FC<
  React.PropsWithChildren<{
    label: string;
    onClick: () => void;
    active?: boolean;
    classNames?: string;
  }>
> = ({ label, onClick, children, classNames }) => (
  <button
    className={`uci-border-none uci-flex uci-p-2 uci-mx-1 ${classNames || ''}
      hover:uci-bg-[#7787e0] uci-pointer-events-auto uci-rounded`}
    title={label}
    onClick={onClick}
    type="button"
  >
    {children}
  </button>
);

export const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const CopyIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const DownloadIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const CollapseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2.66699 14.667H1.33301L1.33301 1.33301H2.66699L2.66699 14.667ZM9.80469 3.80469L6.27637 7.33301L15.333 7.33301V8.66699H6.27637L9.80469 12.1953L8.8623 13.1377L4.19531 8.47168C3.93496 8.21133 3.93496 7.78867 4.19531 7.52832L8.8623 2.8623L9.80469 3.80469Z"
      fill="#FBFBFB"
    />
  </svg>
);

export const OpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
    <path d="M14.667 13.667H13.333V0.333008H14.667V13.667ZM11.8047 6.52832C12.065 6.78867 12.065 7.21133 11.8047 7.47168L7.1377 12.1377L6.19531 11.1953L9.72363 7.66699H0.666992V6.33301H9.72363L6.19531 2.80469L7.1377 1.8623L11.8047 6.52832Z" fill="white"/>
  </svg>
);

export const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

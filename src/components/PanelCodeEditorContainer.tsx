import React, { useState } from "react";

import {
  IconButton,
  SearchIcon,
  DownloadIcon,
  CopyIcon,
  CloseIcon
} from "../assets/icons";
import { TextField } from "./ui/text-field";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";

import type { PanelCodeEditorContainerProps } from "../types/components";

const PanelCodeEditorContainer: React.FC<PanelCodeEditorContainerProps> = ({
  children,
  codeWrap: initialCodeWrap = false,
  isSearchVisible,
  onChangeSearch,
  onCloseButtonClick,
  onCopyButtonClick,
  onDownloadButtonClick,
  onSearchButtonClick,
  searchValue
}) => {
  const [codeWrap, setCodeWrap] = useState(initialCodeWrap);

  return (
    <div className="uci-code-editor-container uci-editor-custom-styles">
      <div className="uci-code-editor-toolbar">
        <div className="uci-code-editor-toolbar-toggles uci-flex uci-items-center uci-gap-2">
          <div className="uci-flex uci-items-center uci-px-2  uci-text-[11px] uci-uppercase uci-tracking-wide uci-font-semibold uci-text-[#C5C5C5]">
            Read Only
          </div>
          <div className="uci-flex uci-items-center uci-gap-[2px]">
            <Checkbox
              id="code-wrap"
              checked={codeWrap}
              onCheckedChange={(checked) => setCodeWrap(checked === true)}
              className="uci-custom-checkbox"
            />
            <Label
              htmlFor="code-wrap"
              className="uci-text-sm uci-font-medium uci-cursor-pointer"
            >
              Wrap
            </Label>
          </div>
        </div>

        <div className="uci-code-editor-toolbar-buttons">
          <IconButton
            label="Search"
            onClick={onSearchButtonClick}
            active={isSearchVisible}
          >
            <SearchIcon />
          </IconButton>

          <IconButton label="Copy JSON" onClick={onCopyButtonClick}>
            <CopyIcon />
          </IconButton>

          <IconButton
            classNames="uci-bg-[#3F59E4] uci-rounded"
            label="Download JSON"
            onClick={onDownloadButtonClick}
          >
            <DownloadIcon />
          </IconButton>
        </div>
      </div>

      {isSearchVisible && (
        <div className="uci-code-editor-search-area uci-flex uci-gap-2">
          <TextField
            type="text"
            id="editor-search"
            name="editor-search-field"
            placeholder="Search keys and values..."
            onChange={onChangeSearch}
            value={searchValue}
            className="uci-custom-search-field"
          />
          <IconButton
            classNames="uci-custom-close-button uci-border-[#383838] uci-border-solid uci-border-[1px] uci-rounded uci-p-[8px] uci-bg-[#111111] uci-w-[40px] uci-h-[40px] uci-flex uci-items-center uci-justify-center"
            label="Close search"
            onClick={onCloseButtonClick}
          >
            <CloseIcon />
          </IconButton>
        </div>
      )}

      <div className="uci-code-editor-area">{children(codeWrap)}</div>
    </div>
  );
};

export default PanelCodeEditorContainer;

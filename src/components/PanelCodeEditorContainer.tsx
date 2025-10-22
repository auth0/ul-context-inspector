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
  searchValue,
}) => {
  const [codeWrap, setCodeWrap] = useState(initialCodeWrap);

  return (
    <div className="uci-code-editor-container">
      <div className="uci-code-editor-toolbar">
        <div className="uci-code-editor-toolbar-toggles uci-flex uci-items-center uci-gap-2">
          <div className="uci-flex uci-items-center uci-gap-[2px]">
            <Checkbox
              id="code-wrap"
              checked={codeWrap}
              onCheckedChange={(checked) => setCodeWrap(checked === true)}
              className="!uci-w-[18px] !uci-h-[18px] !uci-p-[2px] !uci-rounded-[4px] !uci-border-[1px] !uci-border-solid !uci-border-white !uci-bg-[#383838] data-[state=checked]:!uci-bg-[#99A7F1] data-[state=checked]:!uci-border-[#99A7F1] hover:!uci-border-white focus-visible:!uci-border-white [&_span]:data-[state=unchecked]:!uci-text-white [&_span]:data-[state=unchecked]:!uci-stroke-white [&_span]:data-[state=checked]:!uci-text-black [&_span]:data-[state=checked]:!uci-stroke-black"
            />
            <Label htmlFor="code-wrap" className="uci-text-sm uci-font-medium uci-cursor-pointer">
              Wrap JSON
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
            className="uci-flex-1 !uci-bg-[#111111] !uci-text-white !uci-border-[#383838] !uci-border-solid !uci-border-[1px] !uci-rounded !uci-h-10 !uci-text-sm focus-within:!uci-border-[#99A7F1] focus-within:!uci-ring-0 [&_input]:!uci-text-white [&_input]:!uci-text-sm [&_input]:!uci-py-0 [&_input]:!uci-px-4 [&_input]:!uci-h-full [&_input]:!uci-flex [&_input]:!uci-items-center [&_input::placeholder]:!uci-text-gray-400"
          />
          <IconButton
            classNames="!uci-border-[#383838] !uci-border-solid !uci-border-[1px] uci-rounded uci-p-[8px] uci-bg-[#111111]"
            label="Close search"
            onClick={onCloseButtonClick}
          >
            <CloseIcon />
          </IconButton>
        </div>
      )}

      <div className="uci-code-editor-area">
        {children(codeWrap)}
      </div>
    </div>
  );
};

export default PanelCodeEditorContainer;

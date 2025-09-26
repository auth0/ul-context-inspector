import React, { useState} from "react";

import { TextField, Checkbox } from '@auth0/quantum-product';
import {
  IconButton,
  SearchIcon,
  DownloadIcon,
  CopyIcon,
  CloseIcon
} from "../assets/icons";

import type { PanelCodeEditorContainerProps } from "../types/components";

const PanelCodeEditorContainer: React.FC<PanelCodeEditorContainerProps> = ({
  onSearchButtonClick,
  onDownloadButtonClick,
  onCopyButtonClick,
  onCloseButtonClick,
  isSearchVisible,
  onChangeSearch,
  searchValue,
  children,
  codeWrap: initialCodeWrap = false,
}) => {
  const [codeWrap, setCodeWrap] = useState(initialCodeWrap);

  return (
    <div className="uci-code-editor-container">
      <div className="uci-code-editor-toolbar">
        <div className="uci-code-editor-toolbar-toggles uci-flex uci-items-center">
          Code / Tree

          <Checkbox
            onClick={event => setCodeWrap((event.target as HTMLInputElement).checked)}
          >
            Wrap
          </Checkbox>
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
        <div className="uci-code-editor-search-area">
          <TextField
            id="editor-search"
            name="editor-search-field"
            placeholder="Search keys and values..."
            onChange={onChangeSearch}
            value={searchValue}
          />
          <IconButton
            classNames="!uci-border-[#383838] !uci-border-solid uci-rounded
              uci-p-[8px] uci-mr-0 uci-bg-[#111111] !uci-border-[1px]"
            label="Close search"
            onClick={onCloseButtonClick}
          >
            <CloseIcon />
          </IconButton>
        </div>
      )}

      <div className="uci-code-editor-area">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              codeWrap
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

export default PanelCodeEditorContainer;

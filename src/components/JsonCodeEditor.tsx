import React, { useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";

// Lightweight JSON editor wrapper with Prism highlighting and a fixed line number gutter.
export interface JsonCodeEditorProps {
  value: string;
  readOnly?: boolean;
  isValid?: boolean;
  textareaId?: string;
  codeWrap?: boolean; // controls text wrapping
}

export const JsonCodeEditor: React.FC<JsonCodeEditorProps> = ({
  value,
  isValid = true,
  codeWrap = false
}) => {
  // Split into lines for rendering line numbers alongside content
  const lines = useMemo(() => value.split("\n"), [value]);
  
  return (
    <div
      className={`uci-flex uci-min-h-full uci-h-fit uci-w-full uci-rounded uci-border uci-border-solid ${
        isValid ? "uci-border-[#171717]" : "uci-border-red-500"
      } uci-bg-[#171717] uci-rounded-b-lg`}
    >
      {/* Combined line numbers + code using a table-like layout for alignment */}
      <div
        className={`uci-w-full uci-font-mono uci-text-[11px] uci-leading-4 uci-py-2 ${
          codeWrap ? "" : "uci-overflow-x-auto"
        }`}
      >
        {lines.map((line, i) => (
          <div key={i} className="uci-flex">
            {/* Line number */}
            <div
              className="uci-select-none uci-text-[#ABABAB] uci-pl-4 uci-pr-3 uci-text-right uci-flex-shrink-0"
              style={{ minWidth: "34px" }}
            >
              {i + 1}
            </div>
            {/* Code line */}
            <pre
              className={`uci-m-0 uci-flex-1 uci-text-gray-100 uci-pr-2 ${
                codeWrap ? "uci-whitespace-pre-wrap uci-break-all" : "uci-whitespace-pre"
              }`}
              dangerouslySetInnerHTML={{
                __html: Prism.highlight(line || " ", Prism.languages.json, "json")
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

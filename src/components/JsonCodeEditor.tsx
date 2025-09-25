import React, { useMemo } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';

// Lightweight JSON editor wrapper with Prism highlighting and a fixed line number gutter.
export interface JsonCodeEditorProps {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  isValid?: boolean;
  filtered?: boolean; // indicates filtered view overlay
  textareaId?: string;
}

export const JsonCodeEditor: React.FC<JsonCodeEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  isValid = true,
  filtered = false,
  textareaId = 'json-editor'
}) => {
  // Derive line count for gutter; simple split is fine (no perf issues at our expected sizes).
  const lineCount = useMemo(() => value.split('\n').length, [value]);
  return (
    <div
      className={`uci-flex uci-min-h-full uci-h-fit uci-w-full uci-rounded uci-border ${
        isValid ? 'uci-border-gray-700' : 'uci-border-red-500'
      } uci-bg-[#171717]`}
    >
      {/* line digits */}
      <div className="uci-select-none uci-bg-[#171717] uci-text-gray-500 uci-text-[11px] uci-leading-4 uci-font-mono
        uci-py-2 uci-pl-2 uci-pr-3 uci-border-r uci-border-gray-700 uci-min-w-[34px]">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} className="uci-h-4 uci-flex uci-justify-end">{i + 1}</div>
        ))}
      </div>

      {/* editor */}
      <Editor
        value={value}
        onValueChange={(code: string) => { if (!readOnly) onChange(code); }}
        highlight={(code) => Prism.highlight(code, Prism.languages.json, 'json')}
        padding={8}
        textareaId={textareaId}
        className="uci-font-mono uci-text-[11px] uci-leading-4 uci-text-gray-100 focus:uci-outline-none uci-bg-[#17171]"
        style={{ outline: 'none', minHeight: '100%' }}
        // textareaClassName=''
      />

      {filtered && (
        <div className="uci-absolute uci-inset-0 uci-bg-black/40 uci-text-[11px] uci-text-gray-300 uci-flex uci-items-center uci-justify-center uci-pointer-events-none">
          <span>Filtered view (editing disabled)</span>
        </div>
      )}
    </div>
  );
};

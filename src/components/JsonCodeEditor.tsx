import React, { useMemo } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-json';

// Lightweight JSON editor wrapper with Prism highlighting and a fixed line number gutter.
export interface JsonCodeEditorProps {
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
  isValid?: boolean;
  textareaId?: string;
  codeWrap?: boolean; // controls text wrapping
}

export const JsonCodeEditor: React.FC<JsonCodeEditorProps> = ({
  value,
  onChange,
  readOnly = false,
  isValid = true,
  textareaId = 'json-editor',
  codeWrap = false
}) => {
  // Derive line count for gutter; simple split is fine (no perf issues at our expected sizes).
  const lineCount = useMemo(() => value.split('\n').length, [value]);
  return (
    <div
      className={`uci-flex uci-min-h-full uci-h-fit uci-w-full uci-rounded uci-border ${
        isValid ? 'uci-border-gray-700' : 'uci-border-red-500'
      } uci-bg-[#171717] uci-rounded-b-lg`}
    >
      {/* editor line digits */}
      <div className="uci-select-none uci-bg-[#171717] uci-text-gray-500 uci-text-[11px] uci-leading-4 uci-font-mono
        uci-py-2 uci-pl-4 uci-pr-3 uci-border-r uci-border-gray-700 uci-min-w-[34px] uci-rounded-bl-lg">
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
        preClassName={codeWrap ? "" : "!uci-whitespace-pre"}
        className="uci-font-mono !uci-overflow-visible uci-text-[11px] uci-leading-4 uci-text-gray-100 focus:uci-outline-none uci-bg-[#17171]"
        style={{
          outline: 'none',
          minHeight: '100%',
        }}
      />
    </div>
  );
};

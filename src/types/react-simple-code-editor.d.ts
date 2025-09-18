declare module 'react-simple-code-editor' {
  import * as React from 'react';
  export interface EditorProps {
    value: string;
    onValueChange: (code: string) => void;
    highlight: (code: string) => string | React.ReactNode;
    padding?: number;
    textareaId?: string;
    className?: string;
    style?: React.CSSProperties;
  }
  const Editor: React.FC<EditorProps>;
  export default Editor;
}

declare module '@monaco-editor/react' {
  import * as React from 'react';
  import { editor } from 'monaco-editor';
  interface EditorProps {
    height?: string | number;
    width?: string | number;
    value?: string;
    defaultValue?: string;
    defaultLanguage?: string;
    language?: string;
    theme?: string;
    options?: editor.IStandaloneEditorConstructionOptions;
    onChange?: (value?: string) => void;
    onMount?: (editor: editor.IStandaloneCodeEditor) => void;
  }
  const Editor: React.FC<EditorProps>;
  export default Editor;
}

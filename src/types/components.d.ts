/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PanelHeaderProps {
  isConnected: boolean;
  isConnectedText: string;
  isNotConnectedText: string;
  setOpen: (open: boolean) => void;
  title: string;
}

export interface PanelContainerProps {
  children: React.ReactNode;
  open: boolean;
  width: number | string;
}

export interface Option {
  value: string;
  label: string;
}

export interface SelectOption {
  value: string;
  text: string;
}

export type OptionInput = Option | string;

export type FlexibleOption = string | { value: string; text?: string; label?: string };

export interface PanelSelectContextProps {
  dataSourceOptions: FlexibleOption[];
  dataVersionOptions: FlexibleOption[];
  isConnected: boolean;
  onChangeSelectDataSource: (event: { target: { value: string } }) => void;
  onChangeSelectDataVersion: (event: { target: { value: string } }) => void;
  onChangeSelectScreen: (event: { target: { value: string } }) => void;
  onChangeSelectVariant: (event: { target: { value: string } }) => void;
  screenOptions: FlexibleOption[];
  selectedDataSource: string;
  selectedDataVersion: string;
  selectedScreen: string | undefined;
  selectedVariant: string;
  setSelectedScreen: (screen: string) => void;
  variantOptions: FlexibleOption[];
  disableDataSourceSelect: boolean;
}

export interface PanelCodeEditorContainerProps {
  children: (codeWrap: boolean) => React.ReactNode;
  codeWrap?: boolean;
  isSearchVisible: boolean;
  onChangeSearch?: (event: { target: { value: string } }) => void;
  onCloseButtonClick: () => void;
  onCopyButtonClick: () => void;
  onDownloadButtonClick: () => void;
  onSearchButtonClick: () => void;
  searchValue?: string;
}

export interface PanelToggleButtonProps {
  onClick: () => void;
  panelTitle: string;
}

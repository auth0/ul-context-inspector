/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ISelectProps } from "@auth0/quantum-product";

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

export interface PanelSelectContextProps {
  dataSourceOptions: ISelectOption<any>[];
  dataVersionOptions: ISelectOption<any>[];
  isConnected: boolean;
  onChangeSelectDataSource: ISelectProps["onChange"];
  onChangeSelectDataVersion: ISelectProps["onChange"];
  onChangeSelectScreen: ISelectProps["onChange"];
  onChangeSelectVariant: ISelectProps["onChange"];
  screenOptions: ISelectOption<any>[];
  selectedDataSource: string;
  selectedDataVersion: string;
  selectedScreen: string | undefined;
  selectedVariant: string;
  setSelectedScreen: (screen: string) => void;
  variantOptions: ISelectOption<any>[];
}

export interface Option {
  value: string;
  label: string;
}

export type OptionInput = Option | string;

export interface PanelCodeEditorContainerProps {
  children: (codeWrap: boolean) => React.ReactNode;
  codeWrap?: boolean;
  isSearchVisible: boolean;
  onChangeSearch?: IFieldProps["onChange"];
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

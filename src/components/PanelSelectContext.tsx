import React from 'react';
import SelectField from "./SelectField";

import type { PanelSelectContextProps } from '../types/components';

const PanelSelectContext: React.FC<PanelSelectContextProps> = ({
    dataSourceOptions,
    dataVersionOptions,
    isConnected,
    onChangeSelectDataSource,
    onChangeSelectDataVersion,
    onChangeSelectScreen,
    onChangeSelectVariant,
    screenOptions,
    selectedDataSource,
    selectedDataVersion,
    selectedScreen,
    selectedVariant,
    variantOptions,
  }) => {
  // When connected to tenant, show current screen name if no options available
  if (screenOptions?.length === 0) {
    screenOptions = [selectedScreen || 'Current screen'];
  }

  const isLocalDevelopment = selectedDataSource?.toLowerCase().includes('local');

  return (
    <div className="uci-flex uci-flex-col">
      <SelectField
        name="panel-select-screen"
        options={screenOptions}
        prefix="Screen"
        value={selectedScreen}
        placeholder={selectedScreen}
        onChange={onChangeSelectScreen}
        disabled={screenOptions?.length <= 1}
      />

      {!isConnected && (
        <div>
          <SelectField
            name="panel-select-variant"
            options={variantOptions}
            prefix="Variant"
            value={selectedVariant}
            onChange={onChangeSelectVariant}
            placeholder={selectedVariant}
            disabled={variantOptions?.length <= 1}
          />

          <div className="uci-flex uci-w-full uci-gap-2">
            <SelectField
              name="panel-select-data-source"
              options={dataSourceOptions}
              prefix="Data source"
              value={selectedDataSource}
              onChange={onChangeSelectDataSource}
              placeholder={selectedDataSource}
              disabled={dataSourceOptions?.length <= 1}
              />

            {!isLocalDevelopment && (
              <SelectField
                name="panel-select-data-version"
                prefix="Data version"
                options={dataVersionOptions}
                value={selectedDataVersion}
                onChange={onChangeSelectDataVersion}
                placeholder={selectedDataVersion}
                disabled={dataVersionOptions?.length <= 1}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PanelSelectContext;

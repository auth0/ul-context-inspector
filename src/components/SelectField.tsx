import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import type { FlexibleOption } from "./../types/components";
import SelectSearchInput from "./SelectSearchInput";

interface SelectFieldProps {
  className?: string;
  disabled?: boolean;
  name: string;
  onChange: (event: { target: { value: string } }) => void;
  options: FlexibleOption[];
  placeholder?: string;
  prefix?: string;
  value?: string;
  searchable?: boolean; // enable popover search
}

const SelectField = ({
  className,
  name,
  onChange,
  options,
  prefix,
  placeholder,
  value,
  disabled,
  searchable
}: SelectFieldProps) => {
  // Convert options to normalized format
  const normalizedOptions = options.map((option) => {
    if (typeof option === "object") {
      return {
        value: option.value,
        text: option.text || option.label || option.value
      };
    } else {
      return { value: option, text: option };
    }
  });

  const [searchTerm, setSearchTerm] = React.useState('');
  React.useEffect(() => { if (value) setSearchTerm(''); }, [value]);
  const enableSearch = searchable || name === 'panel-select-screen';
  const filteredOptions = enableSearch && searchTerm
    ? normalizedOptions.filter(opt => opt.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : normalizedOptions;

  return (
    <Select
      name={name}
      onValueChange={(value: string) => {
        if (!onChange) return;
        // create synthetic event object (expected by onChange)
        const syntheticEvent = {
          target: { value: value }
        };
        onChange(syntheticEvent);
      }}
      value={value}
      suppressInitialScroll={enableSearch}
    >
      <SelectTrigger
        prefix={prefix}
        className={`uci-w-full ${className || ""}`}
        disabled={disabled}
      >
        <span className="uci-text-left uci-overflow-hidden uci-text-ellipsis uci-whitespace-nowrap">
          {value
            ? normalizedOptions.find((opt) => opt.value === value)?.text ||
              placeholder
            : placeholder}
        </span>
      </SelectTrigger>
      <SelectContent>
        {enableSearch && (
          <SelectSearchInput value={searchTerm} onChange={setSearchTerm} />
        )}
              {filteredOptions?.length === 0 && searchTerm ? (
                <div className="uci-flex uci-flex-col uci-min-h-[calc(100vh-var(--trigger-top)-var(--trigger-height)-80px)]">
                  <div className="uci-m-[4px] uci-bg-[#242424] uci-px-2 uci-py-6 uci-text-center uci-text-sm uci-text-[#C5C5C5]">
                    No matches found
                    <div className="uci-text-xs uci-mt-1">We couldn't find any results for "{searchTerm}"</div>
                  </div>
                  <div className="uci-flex-1" />
                </div>
              ) : (
          filteredOptions?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.text}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default SelectField;

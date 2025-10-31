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
        {filteredOptions?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.text}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectField;
